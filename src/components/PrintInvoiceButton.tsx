"use client";

import { Printer } from "lucide-react";

export function PrintInvoiceButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#e2e8f0] bg-white hover:bg-slate-50 text-[#0b1c30] text-xs font-semibold shadow-2xs transition print:hidden"
      title="Cetak / Simpan PDF Invoice"
    >
      <Printer className="w-4 h-4 text-[#64748b]" />
      <span>Cetak Invoice</span>
    </button>
  );
}
