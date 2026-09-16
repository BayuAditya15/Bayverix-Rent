import { getCurrentBusinessOrRedirect } from "@/lib/auth/getCurrentBusiness";
import { getActiveSubscription } from "@/lib/billing/getActiveSubscription";
import { Settings, Store, Sparkles } from "lucide-react";
import { CopyStoreLinkCard } from "@/components/CopyStoreLinkCard";
import { StoreProfileSettings } from "@/components/StoreProfileSettings";

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
      <div className="p-5 sm:p-7 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#0051d5]" />
          <h2 className="text-sm font-bold text-[#0b1c30]">Paket Langganan Aktif</h2>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex justify-between items-center bg-[#f8f9ff] p-3 rounded-xl border border-slate-100">
            <div>
              <p className="font-bold text-sm text-[#0b1c30]">Paket {sub.planName}</p>
              <p className="text-[#64748b] text-[11px]">
                {sub.isLifetime
                  ? "Akses Lifetime Aktif"
                  : sub.expiresAt
                  ? `Berlaku hingga ${new Date(sub.expiresAt).toLocaleDateString("id-ID")}`
                  : "Paket Gratis Tanpa Batas Waktu"}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#eff4ff] text-[#0051d5]">
              {sub.planType.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[#64748b] text-[10px]">Maks. Inventaris</span>
              <p className="font-bold text-sm text-[#0b1c30]">
                {sub.maxItems === -1 ? "Unlimited" : `${sub.maxItems} Barang`}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[#64748b] text-[10px]">Maks. Booking / Bln</span>
              <p className="font-bold text-sm text-[#0b1c30]">
                {sub.maxBookingsPerMonth === -1 ? "Unlimited" : `${sub.maxBookingsPerMonth} Trx`}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
              <span className="text-[#64748b] text-[10px]">Maks. Pelanggan</span>
              <p className="font-bold text-sm text-[#0b1c30]">
                {sub.maxCustomers === -1 ? "Unlimited" : `${sub.maxCustomers} Kontak`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
