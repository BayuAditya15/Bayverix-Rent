import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database.types";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;
  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/book") ||
    pathname.startsWith("/api/public") ||
    pathname.startsWith("/auth/callback") ||
    pathname.startsWith("/billing/callback");

  const allCookies = request.cookies.getAll();
  const hasAuthCookie = allCookies.some((c) => c.name.includes("auth-token") || c.name.startsWith("sb-"));

  // If public route with no auth cookie, pass through immediately with zero overhead
  if (isPublicRoute && !hasAuthCookie) {
    return supabaseResponse;
  }

  const isAuthRoute = pathname.startsWith("/login");
  const isOnboardingRoute = pathname.startsWith("/onboarding");
  const isApiRoute = pathname.startsWith("/api");

  // If no auth cookie at all on a protected dashboard route, redirect to /login immediately without network overhead
  if (!hasAuthCookie && !isPublicRoute && !isAuthRoute && !isOnboardingRoute && !isApiRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // If public route, allow session cookies to refresh and proceed without blocking checks
  if (isPublicRoute) {
    return supabaseResponse;
  }

  // Validate session for protected routes
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Unauthenticated users trying to access protected routes
  if (!user && !isAuthRoute && !isOnboardingRoute && !isApiRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 2. Authenticated user visiting /login
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
