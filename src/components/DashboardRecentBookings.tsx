"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { BookingQuickAction } from "@/components/BookingQuickAction";
import { BookingDetailModal, type BookingDetailModalItem } from "@/components/BookingDetailModal";
import { toast } from "sonner";

interface DashboardRecentBookingsProps {
  bookings: BookingDetailModalItem[];
  storeName?: string;
}

export function DashboardRecentBookings({
  bookings,
  storeName = "Rental Store",
}: DashboardRecentBookingsProps) {
  const router = useRouter();
  const supabase = createClient();

  const [bookingsList, setBookingsList] = useState<BookingDetailModalItem[]>(bookings);
  const [selectedBooking, setSelectedBooking] = useState<BookingDetailModalItem | null>(null);

  useEffect(() => {
    setBookingsList(bookings);
  }, [bookings]);

  // Realtime updates for Dashboard
  useEffect(() => {
    const channel = supabase
      .channel("dashboard-bookings-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bookings",
        },
        (payload) => {
          toast.info(`Pesanan baru diterima: #${(payload.new as any)?.booking_number || ""}`);
          router.refresh();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bookings",
        },
        () => {
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router, supabase]);

  const handleOptimisticStatusChange = (
    bookingId: string,
    newStatus: string,
    extraUpdates: Partial<BookingDetailModalItem> = {}
  ) => {
    setBookingsList((prev) =>
      prev.map((item) =>
        item.id === bookingId
          ? {
              ...item,
              status: newStatus,
              ...extraUpdates,
            }
          : item
      )
    );

    if (selectedBooking && selectedBooking.id === bookingId) {
      setSelectedBooking((prev) =>
        prev
          ? {
              ...prev,
              status: newStatus,
              ...extraUpdates,
            }
          : null
      );
    }
  };

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

  if (!bookingsList || bookingsList.length === 0) {
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
        {bookingsList.map((b) => {
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

          const hasProof = Boolean(b.payments?.some((p) => p.reference));
          const isTransfer =
            Boolean(b.payments?.some((p) => p.method === "TRANSFER")) ||
            b.notes?.toLowerCase().includes("transfer");

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
                  rentalTotal={b.rental_total}
                  amountDue={b.amount_due}
                  notes={b.notes}
                  hasProof={hasProof}
                  isTransfer={Boolean(isTransfer)}
                  onStatusChange={(newStatus) => handleOptimisticStatusChange(b.id, newStatus)}
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
