"use client";

import { Check, X, Sparkles, Zap, ShieldCheck } from "lucide-react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
}

export function UpgradeModal({ isOpen, onClose, businessId }: UpgradeModalProps) {
  if (!isOpen) return null;

  const billingBase = process.env.NEXT_PUBLIC_BILLING_URL || "https://billing.example.com";
  const appBase = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const callbackUrl = encodeURIComponent(`${appBase}/billing/callback`);

  const proMonthlyUrl = `${billingBase}/checkout?product=rental_manager&plan=pro_monthly&business=${businessId}&callback=${callbackUrl}`;
  const lifetimeUrl = `${billingBase}/checkout?product=rental_manager&plan=lifetime&business=${businessId}&callback=${callbackUrl}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-[#e2e8f0] overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#e2e8f0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#eff4ff] text-[#0051d5]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0b1c30]">Upgrade Paket Rental</h3>
              <p className="text-xs text-[#64748b]">Buka batasan inventaris & transaksi rental Anda</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[#64748b] hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - 2 Columns on Tablet/Desktop */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pro Monthly */}
          <div className="p-5 rounded-xl border-2 border-[#0051d5] bg-[#f8f9ff] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0051d5] bg-[#eff4ff] px-2 py-0.5 rounded">
                  Paling Populer
                </span>
                <Zap className="w-4 h-4 text-[#0051d5]" />
              </div>
              <h4 className="text-xl font-bold text-[#0b1c30]">Pro Bulanan</h4>
              <p className="text-2xl font-extrabold text-[#0b1c30] mt-2">
                Rp 99.000 <span className="text-xs font-normal text-[#64748b]">/ bulan</span>
              </p>

              <ul className="mt-4 space-y-2 text-xs text-[#0b1c30]">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Hingga <strong>500 Barang</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Unlimited Booking</strong> per bulan</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Unlimited Pelanggan</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Export Laporan Excel & Custom Logo</span>
                </li>
              </ul>
            </div>

            <a
              href={proMonthlyUrl}
              className="mt-6 block text-center w-full py-2.5 px-4 rounded-xl bg-[#0051d5] hover:bg-[#0041ab] text-white text-xs font-semibold shadow-xs transition"
            >
              Pilih Pro Bulanan
            </a>
          </div>

          {/* Lifetime */}
          <div className="p-5 rounded-xl border border-[#e2e8f0] bg-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#64748b] bg-slate-100 px-2 py-0.5 rounded">
                  Sekali Bayar
                </span>
                <ShieldCheck className="w-4 h-4 text-slate-500" />
              </div>
              <h4 className="text-xl font-bold text-[#0b1c30]">Lifetime</h4>
              <p className="text-2xl font-extrabold text-[#0b1c30] mt-2">
                Rp 1.499.000 <span className="text-xs font-normal text-[#64748b]">selamanya</span>
              </p>

              <ul className="mt-4 space-y-2 text-xs text-[#0b1c30]">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Unlimited Barang</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Unlimited Booking & Pelanggan</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Hingga 10 Akun Staf Toko</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Akses Fitur Baru Selamanya</span>
                </li>
              </ul>
            </div>

            <a
              href={lifetimeUrl}
              className="mt-6 block text-center w-full py-2.5 px-4 rounded-xl bg-[#131b2e] hover:bg-[#1e293b] text-white text-xs font-semibold shadow-xs transition"
            >
              Pilih Paket Lifetime
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
