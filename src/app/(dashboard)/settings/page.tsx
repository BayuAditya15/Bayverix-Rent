import { getCurrentBusinessOrRedirect } from "@/lib/auth/getCurrentBusiness";
import { getActiveSubscription } from "@/lib/billing/getActiveSubscription";
import { Settings, Store, Sparkles } from "lucide-react";
import { CopyStoreLinkCard } from "@/components/CopyStoreLinkCard";
import { StoreProfileSettings } from "@/components/StoreProfileSettings";
import { SubscriptionCard } from "@/components/SubscriptionCard";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { business, user, profile, businessId } = await getCurrentBusinessOrRedirect();
  const sub = await getActiveSubscription(businessId);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#0b1c30]">Pengaturan Toko &amp; Akun</h1>
        <p className="text-xs sm:text-sm text-[#64748b] mt-0.5">
          Kelola profil bisnis rental, informasi kontak, dan paket langganan
        </p>
      </div>

      {/* Public Store Booking Link */}
      <CopyStoreLinkCard
        slug={business.slug}
        businessName={business.name}
        phone={business.phone}
      />

      {/* Business Info Card with Edit Modal */}
      <StoreProfileSettings
        business={business}
        userEmail={user.email || ""}
      />

      {/* Subscription Card */}
      <SubscriptionCard
        businessId={businessId}
        sub={sub}
      />
    </div>
  );
}
