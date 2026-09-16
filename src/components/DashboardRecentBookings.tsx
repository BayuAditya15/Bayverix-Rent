"use client";

import { useState } from "react";
import Link from "next/link";
import { BookingQuickAction } from "@/components/BookingQuickAction";
import { BookingDetailModal, type BookingDetailModalItem } from "@/components/BookingDetailModal";

interface DashboardRecentBookingsProps {
  bookings: BookingDetailModalItem[];
  storeName?: string;
}

export function DashboardRecentBookings({
  bookings,
  storeName = "Rental Store",
}: DashboardRecentBookingsProps) {
  const [selectedBooking, setSelectedBooking] = useState<BookingDetailModalItem | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">PENDING</span>;
      case "CONFIRMED":
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-[#0051d5]">CONFIRMED</span>;
      case "ONGOING":
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-[#0051d5]">ONGOING</span>;
      case "COMPLETED":
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700">COMPLETED</span>;
      case "CANCELLED":
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-red-50 text-red-700">CANCELLED</span>;
      case "OVERDUE":
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700">OVERDUE</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  if (!bookings || bookings.length === 0) {
    return (
      <div className="text-center py-10 text-xs text-[#64748b]">
        Belum ada transaksi booking tercatat.
        <div className="mt-3">
          <Link
            href="/bookings/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0051d5] text-white rounded-lg text-xs font-medium"
          >
            Buat Booking Pertama
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="divide-y divide-[#e2e8f0]">
        {bookings.map((b) => {
          const customer = Array.isArray(b.customers) ? b.customers[0] : b.customers;
          const startDate = new Date(b.start_at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
          });
          const endDate = new Date(b.end_at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });

          return (
            <div
              key={b.id}
              onClick={() => setSelectedBooking(b)}
              className="py-3 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-transparent hover:bg-slate-50 transition cursor-pointer"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-[#0051d5]">
                    {b.booking_number}
                  </span>
                  {getStatusBadge(b.status)}
                </div>
                <p className="text-xs font-medium text-[#0b1c30] mt-0.5">
                  {customer?.name || "Pelanggan Umum"}
                </p>
                <p className="text-[11px] text-[#64748b]">
                  Periode: {startDate} → {endDate}
                </p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3">
                <div className="text-left sm:text-right">
                  <p className="text-xs font-bold text-[#0b1c30]">
                    Rp {Number(b.rental_total).toLocaleString("id-ID")}
                  </p>
                  {Number(b.amount_due) > 0 ? (
                    <p className="text-[11px] text-amber-600 font-medium">
                      Sisa: Rp {Number(b.amount_due).toLocaleString("id-ID")}
                    </p>
                  ) : (
                    <p className="text-[11px] text-emerald-600 font-medium">Lunas</p>
                  )}
                </div>

                <BookingQuickAction
                  bookingId={b.id}
                  bookingNumber={b.booking_number}
                  currentStatus={b.status}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Instant Modal Popup */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          storeName={storeName}
        />
      )}
    </>
  );
}
