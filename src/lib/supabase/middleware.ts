import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database.types";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;
  const isLandingRoute = pathname === "/";
  const isCallbackRoute = pathname.startsWith("/auth/callback");
  const isAuthRoute = pathname.startsWith("/login");
  const isOnboardingRoute = pathname.startsWith("/onboarding");
  const isBookRoute = pathname.startsWith("/book");
  const isBillingRoute = pathname.startsWith("/billing");
  const isApiRoute = pathname.startsWith("/api");

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  // Allow /auth/callback to proceed directly to the route handler
  if (isCallbackRoute) {
    return supabaseResponse;
  }

  // IMPORTANT: Do not run code between createServerClient and
  // supabase.auth.getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Unauthenticated users trying to access protected routes
  const isPublicRoute = isLandingRoute || isAuthRoute || isBookRoute || isBillingRoute || isApiRoute;
  if (!user && !isPublicRoute && !isOnboardingRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 2. Authenticated users checks
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("business_id, onboarding_completed")
      .eq("id", user.id)
      .maybeSingle();

    const isCompleted = Boolean(profile?.onboarding_completed && profile?.business_id);

    if (!isCompleted) {
      // User is logged in but hasn't finished onboarding
      if (!isOnboardingRoute && !isAuthRoute && !isApiRoute) {
        const url = request.nextUrl.clone();
        url.pathname = "/onboarding";
        return NextResponse.redirect(url);
      }
    } else {
      // User is logged in and onboarding is completed
      if (isAuthRoute || isOnboardingRoute) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
