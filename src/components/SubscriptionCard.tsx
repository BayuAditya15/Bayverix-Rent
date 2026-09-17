"use client";

import { useState } from "react";
import { Sparkles, ArrowUpRight } from "lucide-react";
import { UpgradeModal } from "@/components/UpgradeModal";

interface SubscriptionCardProps {
  businessId: string;
  sub: {
    planName: string;
    planType: string;
    isLifetime: boolean;
    expiresAt?: string | null;
    maxItems: number;
    maxBookingsPerMonth: number;
    maxCustomers: number;
  };
}

export function SubscriptionCard({ businessId, sub }: SubscriptionCardProps) {
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const isFree = sub.planType === "free";

  return (
    <>
      <div className="p-5 sm:p-7 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#0051d5]" />
            <h2 className="text-sm font-bold text-[#0b1c30]">Paket Langganan Aktif</h2>
          </div>

          <button
            type="button"
            onClick={() => setUpgradeOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0051d5] hover:bg-[#0041ab] text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
          >
            <span>{isFree ? "Upgrade Paket" : "Lihat Daftar Harga"}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex justify-between items-center bg-[#f8f9ff] p-3.5 rounded-xl border border-slate-100">
            <div>
              <p className="font-bold text-sm text-[#0b1c30]">Paket {sub.planName}</p>
              <p className="text-[#64748b] text-[11px] mt-0.5">
                {sub.isLifetime
                  ? "Akses Lifetime Aktif"
                  : sub.expiresAt
                  ? `Berlaku hingga ${new Date(sub.expiresAt).toLocaleDateString("id-ID")}`
                  : "Paket Gratis Tanpa Batas Waktu"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setUpgradeOpen(true)}
              className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0051d5] border border-[#dce9ff] transition cursor-pointer"
              title="Klik untuk melihat daftar harga"
            >
              {sub.planType.toUpperCase()}
            </button>
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

      <UpgradeModal
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        businessId={businessId}
      />
    </>
  );
}
