import { getCurrentBusinessOrRedirect } from "@/lib/auth/getCurrentBusiness";
import { getActiveSubscription } from "@/lib/billing/getActiveSubscription";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, business, businessId } = await getCurrentBusinessOrRedirect();
  const sub = await getActiveSubscription(businessId);

  const supabase = await createClient();
  const { data: usage } = await supabase
    .from("usage_counters")
    .select("total_items, total_bookings_this_month")
    .eq("business_id", businessId)
    .maybeSingle();

  const itemsCurrent = usage?.total_items ?? 0;
  const bookingsCurrent = usage?.total_bookings_this_month ?? 0;

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col lg:flex-row">
      {/* Desktop Persistent Sidebar (>=1024px) */}
      <AppSidebar
        businessId={businessId}
        businessName={business.name}
        userName={profile?.name || user.email || "Pengguna"}
        planName={sub.planName}
        planType={sub.planType}
        itemsCurrent={itemsCurrent}
        itemsMax={sub.maxItems}
        bookingsCurrent={bookingsCurrent}
        bookingsMax={sub.maxBookingsPerMonth}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Topbar (<1024px) */}
        <AppNavbar
          businessId={businessId}
          businessName={business.name}
          userName={profile?.name || user.email || "Pengguna"}
          planName={sub.planName}
          planType={sub.planType}
        />

        {/* Content Container (padded bottom so mobile bottom bar never blocks content) */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-28 lg:pb-8">
          {children}
        </main>

        {/* Mobile Bottom Navigation Bar (<1024px) */}
        <MobileBottomNav
          businessId={businessId}
          businessName={business.name}
          userName={profile?.name || user.email || "Pengguna"}
          planName={sub.planName}
        />
      </div>
    </div>
  );
}
