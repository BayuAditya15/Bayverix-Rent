import { createClient } from "@/lib/supabase/server";
import { getActiveSubscription } from "./getActiveSubscription";

export interface LimitCheckResult {
  allowed: boolean;
  current: number;
  max: number;
  upgradeUrl?: string;
  reason?: string;
}

function buildUpgradeUrl(businessId: string): string {
  const billingBase = process.env.NEXT_PUBLIC_BILLING_URL || "https://billing.example.com";
  const appBase = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const callbackUrl = encodeURIComponent(`${appBase}/billing/callback`);
  return `${billingBase}/checkout?product=rental_manager&plan=pro_monthly&business=${businessId}&callback=${callbackUrl}`;
}

/**
 * Checks usage counters against plan limits for adding a new rental item.
 */
export async function canAddItem(businessId: string): Promise<LimitCheckResult> {
  const sub = await getActiveSubscription(businessId);

  // -1 means unlimited
  if (sub.maxItems === -1) {
    return { allowed: true, current: 0, max: -1 };
  }

  const supabase = await createClient();
  const { data: usage } = await supabase
    .from("usage_counters")
    .select("total_items")
    .eq("business_id", businessId)
    .maybeSingle();

  const current = usage?.total_items ?? 0;

  if (current >= sub.maxItems) {
    return {
      allowed: false,
      current,
      max: sub.maxItems,
      upgradeUrl: buildUpgradeUrl(businessId),
      reason: `Batas maksimal inventaris (${sub.maxItems} barang) untuk paket ${sub.planName} telah tercapai.`,
    };
  }

  return { allowed: true, current, max: sub.maxItems };
}

/**
 * Checks usage counters against plan limits for adding a customer.
 */
export async function canAddCustomer(businessId: string): Promise<LimitCheckResult> {
  const sub = await getActiveSubscription(businessId);

  if (sub.maxCustomers === -1) {
    return { allowed: true, current: 0, max: -1 };
  }

  const supabase = await createClient();
  const { data: usage } = await supabase
    .from("usage_counters")
    .select("total_customers")
    .eq("business_id", businessId)
    .maybeSingle();

  const current = usage?.total_customers ?? 0;

  if (current >= sub.maxCustomers) {
    return {
      allowed: false,
      current,
      max: sub.maxCustomers,
      upgradeUrl: buildUpgradeUrl(businessId),
      reason: `Batas maksimal pelanggan (${sub.maxCustomers} pelanggan) untuk paket ${sub.planName} telah tercapai.`,
    };
  }

  return { allowed: true, current, max: sub.maxCustomers };
}

/**
 * Checks usage counters against plan limits for adding a booking this month.
 */
export async function canAddBooking(businessId: string): Promise<LimitCheckResult> {
  const sub = await getActiveSubscription(businessId);

  if (sub.maxBookingsPerMonth === -1) {
    return { allowed: true, current: 0, max: -1 };
  }

  const supabase = await createClient();
  const { data: usage } = await supabase
    .from("usage_counters")
    .select("total_bookings_this_month, period_month")
    .eq("business_id", businessId)
    .maybeSingle();

  const current = usage?.total_bookings_this_month ?? 0;

  if (current >= sub.maxBookingsPerMonth) {
    return {
      allowed: false,
      current,
      max: sub.maxBookingsPerMonth,
      upgradeUrl: buildUpgradeUrl(businessId),
      reason: `Batas kuota booking bulan ini (${sub.maxBookingsPerMonth} booking) untuk paket ${sub.planName} telah habis.`,
    };
  }

  return { allowed: true, current, max: sub.maxBookingsPerMonth };
}
