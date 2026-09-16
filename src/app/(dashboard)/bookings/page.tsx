import Link from "next/link";
import { getCurrentBusinessOrRedirect } from "@/lib/auth/getCurrentBusiness";
import { createClient } from "@/lib/supabase/server";
import { ShoppingBag, Plus } from "lucide-react";
import { BookingListWithPagination } from "@/components/BookingListWithPagination";

export const dynamic = "force-dynamic";

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const { businessId } = await getCurrentBusinessOrRedirect();
  const supabase = await createClient();

  const params = await searchParams;
  const statusFilter = params?.status || "";
  const search = params?.search || "";

  let query = supabase
    .from("bookings")
    .select(`
      id,
      booking_number,
      start_at,
      end_at,
      rental_total,
      deposit_total,
      amount_due,
      amount_paid,
      status,
      created_at,
      customers (
        id,
        name,
        phone
      )
    `)
    .eq("business_id", businessId)
    .order("start_at", { ascending: false });

  if (statusFilter) {
    query = query.eq("status", statusFilter as any);
  }

  const { data: bookings } = await query;

  const statuses = [
    { label: "Semua", value: "" },
    { label: "Confirmed", value: "CONFIRMED" },
    { label: "Ongoing", value: "ONGOING" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Overdue", value: "OVERDUE" },
    { label: "Cancelled", value: "CANCELLED" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0b1c30]">Manajemen Booking</h1>
          <p className="text-xs sm:text-sm text-[#64748b] mt-0.5">
            Daftar transaksi sewa, serah-terima unit, dan status pelunasan
          </p>
        </div>

        <Link
          href="/bookings/new"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0051d5] hover:bg-[#0041ab] text-white text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Booking Baru</span>
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {statuses.map((s) => (
          <Link
            key={s.value}
            href={`/bookings${s.value ? `?status=${s.value}` : ""}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              statusFilter === s.value
                ? "bg-[#0051d5] text-white"
                : "bg-white border border-[#e2e8f0] text-[#0b1c30] hover:bg-slate-50"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      {/* Bookings List */}
      {(!bookings || bookings.length === 0) ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#e2e8f0] p-6 space-y-3">
          <div className="inline-flex p-3 rounded-full bg-[#eff4ff] text-[#0051d5]">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#0b1c30]">Tidak Ada Booking Ditemukan</h3>
          <p className="text-xs text-[#64748b] max-w-sm mx-auto">
            Belum ada data transaksi booking untuk filter status ini.
          </p>
          <Link
            href="/bookings/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0051d5] text-white text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Booking Baru</span>
          </Link>
        </div>
      ) : (
        <BookingListWithPagination bookings={bookings as any} />
      )}
    </div>
  );
}
