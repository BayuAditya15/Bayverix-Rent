"use client";

import { Sparkles, ArrowUpRight } from "lucide-react";

interface UsageProps {
  planName: string;
  planType: string;
  itemsCurrent: number;
  itemsMax: number;
  bookingsCurrent: number;
  bookingsMax: number;
  onUpgradeClick?: () => void;
}

export function UsageIndicator({
  planName,
  planType,
  itemsCurrent,
  itemsMax,
  bookingsCurrent,
  bookingsMax,
  onUpgradeClick,
}: UsageProps) {
  const isFree = planType === "free";
  const itemsPct = itemsMax > 0 ? Math.min(Math.round((itemsCurrent / itemsMax) * 100), 100) : 0;
  const bookingsPct = bookingsMax > 0 ? Math.min(Math.round((bookingsCurrent / bookingsMax) * 100), 100) : 0;

  return (
    <div className="p-4 rounded-xl bg-white border border-[#e2e8f0] shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#0051d5]">
            Paket {planName}
          </span>
        </div>
        {isFree && onUpgradeClick && (
          <button
            type="button"
            onClick={onUpgradeClick}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#0051d5] hover:text-[#0041ab]"
          >
            Upgrade <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="space-y-3 text-xs">
        {/* Items Usage */}
        <div>
          <div className="flex justify-between text-[#64748b] mb-1">
            <span>Barang Terdaftar</span>
            <span className="font-medium text-[#0b1c30]">
              {itemsCurrent} / {itemsMax === -1 ? "Unlimited" : itemsMax}
            </span>
          </div>
          {itemsMax !== -1 && (
            <div className="w-full h-1.5 bg-[#eff4ff] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  itemsPct >= 90 ? "bg-red-500" : itemsPct >= 70 ? "bg-amber-500" : "bg-[#0051d5]"
                }`}
                style={{ width: `${itemsPct}%` }}
              />
            </div>
          )}
        </div>

        {/* Bookings Usage */}
        <div>
          <div className="flex justify-between text-[#64748b] mb-1">
            <span>Booking Bulan Ini</span>
            <span className="font-medium text-[#0b1c30]">
              {bookingsCurrent} / {bookingsMax === -1 ? "Unlimited" : bookingsMax}
            </span>
          </div>
          {bookingsMax !== -1 && (
            <div className="w-full h-1.5 bg-[#eff4ff] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  bookingsPct >= 90 ? "bg-red-500" : bookingsPct >= 70 ? "bg-amber-500" : "bg-[#0051d5]"
                }`}
                style={{ width: `${bookingsPct}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
