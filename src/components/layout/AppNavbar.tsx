"use client";

import { Sparkles } from "lucide-react";

interface NavigationProps {
  businessName: string;
  userName: string;
  planName: string;
  planType: string;
}

export function AppNavbar({ businessName, planName }: NavigationProps) {
  return (
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
        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#eff4ff] text-[#0051d5] border border-[#dce9ff]">
          {planName}
        </span>
      </div>
    </header>
  );
}
