import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export interface ActiveSubscriptionInfo {
  planType: "free" | "pro_monthly" | "lifetime";
  planCode: string;
  planName: string;
  isActive: boolean;
  isLifetime: boolean;
  expiresAt: string | null;
  maxItems: number;
  maxBookingsPerMonth: number;
  maxCustomers: number;
  maxStaff: number;
  features: {
    export_excel?: boolean;
    custom_logo?: boolean;
    api_access?: boolean;
    [key: string]: unknown;
  };
}

export const getActiveSubscription = cache(async (
  businessId: string
): Promise<ActiveSubscriptionInfo> => {
  const supabase = await createClient();

  // 1. Fetch active subscription for rental_manager
  const { data: sub } = await supabase
    .from("subscriptions")
    .select(`
      id,
      plan_type,
      is_active,
      is_lifetime,
      started_at,
      expires_at,
      plans (
        id,
        code,
        name,
        max_items,
        max_bookings_per_month,
        max_customers,
        max_staff,
        features
      )
    `)
    .eq("business_id", businessId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // If no subscription found, fallback to default Free tier
  if (!sub || !sub.plans) {
    return {
      planType: "free",
      planCode: "free",
      planName: "Free",
      isActive: true,
      isLifetime: false,
      expiresAt: null,
      maxItems: 10,
      maxBookingsPerMonth: 20,
      maxCustomers: 50,
      maxStaff: 1,
      features: { export_excel: false, custom_logo: false, api_access: false },
    };
  }

  // Handle pro_monthly expiration check
  const isExpired =
    sub.plan_type === "pro_monthly" &&
    sub.expires_at &&
    new Date(sub.expires_at).getTime() < Date.now();

  if (isExpired) {
    // Treat as Free if subscription has expired
    return {
      planType: "free",
      planCode: "free",
      planName: "Free (Expired)",
      isActive: true,
      isLifetime: false,
      expiresAt: sub.expires_at,
      maxItems: 10,
      maxBookingsPerMonth: 20,
      maxCustomers: 50,
      maxStaff: 1,
      features: { export_excel: false, custom_logo: false, api_access: false },
    };
  }

  const plan = Array.isArray(sub.plans) ? sub.plans[0] : sub.plans;
  const features = (plan?.features && typeof plan.features === "object" ? plan.features : {}) as Record<string, unknown>;

  return {
    planType: (sub.plan_type as "free" | "pro_monthly" | "lifetime") || "free",
    planCode: plan?.code || "free",
    planName: plan?.name || "Free",
    isActive: sub.is_active,
    isLifetime: sub.is_lifetime,
    expiresAt: sub.expires_at,
    maxItems: plan?.max_items ?? 10,
    maxBookingsPerMonth: plan?.max_bookings_per_month ?? 20,
    maxCustomers: plan?.max_customers ?? 50,
    maxStaff: plan?.max_staff ?? 1,
    features,
  };
});
