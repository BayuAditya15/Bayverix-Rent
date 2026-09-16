import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

type BusinessRow = Database["public"]["Tables"]["businesses"]["Row"];
type UserRow = Database["public"]["Tables"]["users"]["Row"];

export interface CurrentBusinessContext {
  user: { id: string; email?: string };
  profile: Partial<UserRow> | null;
  business: BusinessRow | null;
  businessId: string | null;
}

export interface ActiveBusinessContext {
  user: { id: string; email?: string };
  profile: Partial<UserRow> | null;
  business: BusinessRow;
  businessId: string;
}

/**
 * Gets the current authenticated user profile and business ID from the server session.
 * Wrapped with React cache() to deduplicate requests within a single server rendering cycle.
 */
export const getCurrentBusiness = cache(async (): Promise<CurrentBusinessContext | null> => {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id, email, name, role, business_id, onboarding_completed, avatar_url")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || !profile.business_id) {
    return {
      user: { id: user.id, email: user.email },
      profile: profile || null,
      business: null,
      businessId: null,
    };
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", profile.business_id)
    .single();

  return {
    user: { id: user.id, email: user.email },
    profile,
    business: business || null,
    businessId: profile.business_id,
  };
});

/**
 * Returns just the current businessId or null.
 */
export async function getCurrentBusinessId(): Promise<string | null> {
  const ctx = await getCurrentBusiness();
  return ctx?.businessId ?? null;
}

/**
 * Ensures user is authenticated and has a valid business workspace.
 * If not authenticated, redirects to /login.
 * If onboarded business is missing, redirects to /onboarding.
 */
export async function getCurrentBusinessOrRedirect(): Promise<ActiveBusinessContext> {
  const ctx = await getCurrentBusiness();

  if (!ctx || !ctx.user) {
    redirect("/login");
  }

  if (!ctx.businessId || !ctx.business) {
    redirect("/onboarding");
  }

  return {
    user: ctx.user,
    profile: ctx.profile,
    business: ctx.business,
    businessId: ctx.businessId,
  };
}
