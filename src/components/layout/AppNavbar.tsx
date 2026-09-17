"use client";

import { useState } from "react";
import { Sparkles, ArrowUpRight } from "lucide-react";
import { UpgradeModal } from "@/components/UpgradeModal";

interface NavigationProps {
  businessId?: string;
  businessName: string;
  userName: string;
  planName: string;
  planType: string;
}

export function AppNavbar({ businessId, businessName, planName }: NavigationProps) {
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  return (
    <>
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between h-14 px-4 bg-white/95 backdrop-blur-md border-b border-[#e2e8f0]">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#0051d5] text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-[#0b1c30] truncate max-w-[200px]">
            {businessName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {businessId ? (
            <button
              type="button"
              onClick={() => setUpgradeOpen(true)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0051d5] border border-[#dce9ff] transition active:scale-95 cursor-pointer shadow-2xs"
              title="Klik untuk melihat daftar harga & paket"
            >
              <span>{planName}</span>
              <ArrowUpRight className="w-3 h-3 text-[#0051d5]" />
            </button>
          ) : (
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#eff4ff] text-[#0051d5] border border-[#dce9ff]">
              {planName}
            </span>
          )}
        </div>
      </header>

      {businessId && (
        <UpgradeModal
          isOpen={upgradeOpen}
          onClose={() => setUpgradeOpen(false)}
          businessId={businessId}
        />
      )}
    </>
  );
}
