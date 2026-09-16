import Link from "next/link";
import { getCurrentBusinessOrRedirect } from "@/lib/auth/getCurrentBusiness";
import { createClient } from "@/lib/supabase/server";
import { CopyStoreLinkCard } from "@/components/CopyStoreLinkCard";
import { BookingQuickAction } from "@/components/BookingQuickAction";
import { ClickableBookingCard } from "@/components/ClickableRow";
import {
  Package,
  ShoppingBag,
  Clock,
  TrendingUp,
  Plus,
  ArrowRight,
  UserCheck,
  AlertTriangle,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { businessId, business } = await getCurrentBusinessOrRedirect();
  const supabase = await createClient();

  // 1. Fetch Summary Stats
  const { data: usage } = await supabase
    .from("usage_counters")
    .select("total_items, total_customers, total_bookings_this_month")
    .eq("business_id", businessId)
    .maybeSingle();

  // 2. Fetch Recent Bookings
  const { data: recentBookings } = await supabase
    .from("bookings")
    .select(`
      id,
      booking_number,
      start_at,
      end_at,
      rental_total,
      amount_due,
      status,
      customers (
        name,
        phone
      )
    `)
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(5);

  // 3. Fetch Bookings ending today or overdue
  const now = new Date().toISOString();
  const { data: ongoingBookings } = await supabase
    .from("bookings")
    .select("id, booking_number, end_at, status, customers(name)")
    .eq("business_id", businessId)
    .in("status", ["CONFIRMED", "ONGOING"])
    .order("end_at", { ascending: true })
    .limit(4);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-[#0051d5]">CONFIRMED</span>;
      case "ONGOING":
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-[#0051d5]">ONGOING</span>;
      case "COMPLETED":
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700">COMPLETED</span>;
      case "CANCELLED":
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-red-50 text-red-700">CANCELLED</span>;
      case "OVERDUE":
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700">OVERDUE</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0b1c30]">
            Dashboard Operasional
          </h1>
          <p className="text-xs sm:text-sm text-[#64748b] mt-0.5">
            Ringkasan ketersediaan barang &amp; jadwal transaksi sewa di <strong>{business.name}</strong>
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 w-full sm:w-auto">
          <Link
            href="/bookings/new"
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#0051d5] hover:bg-[#0041ab] text-white text-xs font-semibold shadow-xs transition active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="truncate">Buat Booking</span>
          </Link>
          <Link
            href="/items/new"
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#cbd5e1] bg-white hover:bg-slate-50 text-[#0b1c30] text-xs font-semibold shadow-xs transition active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="truncate">Tambah Barang</span>
          </Link>
        </div>
      </div>

      {/* Public Store Booking Link Card */}
      <CopyStoreLinkCard
        slug={business.slug}
        businessName={business.name}
        phone={business.phone}
      />

      {/* Metric Cards - 1 col mobile, 2 col tablet, 4 col desktop (Clickable for quick navigation) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Inventaris -> Items Page */}
        <Link
          href="/items"
          className="group block p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-2 hover:border-[#0051d5] hover:shadow-md transition active:scale-[0.99]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748b] group-hover:text-[#0051d5] transition">
              Total Inventaris
            </span>
            <div className="p-2 rounded-lg bg-[#eff4ff] text-[#0051d5] group-hover:bg-[#0051d5] group-hover:text-white transition">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#0b1c30]">{usage?.total_items ?? 0}</p>
          <div className="flex items-center justify-between text-xs text-[#64748b]">
            <span>Jenis barang terdaftar</span>
            <span className="text-[11px] font-semibold text-[#0051d5] opacity-0 group-hover:opacity-100 transition">
              + Tambah &rarr;
            </span>
          </div>
        </Link>

        {/* Booking Bulan Ini -> Bookings Page */}
        <Link
          href="/bookings"
          className="group block p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-2 hover:border-[#0051d5] hover:shadow-md transition active:scale-[0.99]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748b] group-hover:text-[#0051d5] transition">
              Booking Bulan Ini
            </span>
            <div className="p-2 rounded-lg bg-[#eff4ff] text-[#0051d5] group-hover:bg-[#0051d5] group-hover:text-white transition">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#0b1c30]">{usage?.total_bookings_this_month ?? 0}</p>
          <div className="flex items-center justify-between text-xs text-[#64748b]">
            <span>Transaksi tercatat</span>
            <span className="text-[11px] font-semibold text-[#0051d5] opacity-0 group-hover:opacity-100 transition">
              Lihat &rarr;
            </span>
          </div>
        </Link>

        {/* Total Pelanggan -> Customers Page */}
        <Link
          href="/customers"
          className="group block p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-2 hover:border-[#0051d5] hover:shadow-md transition active:scale-[0.99]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748b] group-hover:text-[#0051d5] transition">
              Total Pelanggan
            </span>
            <div className="p-2 rounded-lg bg-[#eff4ff] text-[#0051d5] group-hover:bg-[#0051d5] group-hover:text-white transition">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#0b1c30]">{usage?.total_customers ?? 0}</p>
          <div className="flex items-center justify-between text-xs text-[#64748b]">
            <span>Kontak pelanggan aktif</span>
            <span className="text-[11px] font-semibold text-[#0051d5] opacity-0 group-hover:opacity-100 transition">
              Lihat &rarr;
            </span>
          </div>
        </Link>

        {/* Unit Aktif Disewa -> Bookings Ongoing Filter */}
        <Link
          href="/bookings?status=ONGOING"
          className="group block p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-2 hover:border-emerald-500 hover:shadow-md transition active:scale-[0.99]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#64748b] group-hover:text-emerald-700 transition">
              Unit Aktif Disewa
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#0b1c30]">{ongoingBookings?.length ?? 0}</p>
          <div className="flex items-center justify-between text-xs text-emerald-600">
            <span>Dalam masa sewa</span>
            <span className="text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition">
              Pantau &rarr;
            </span>
          </div>
        </Link>
      </div>

      {/* Two Column Layout on Tablet/Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings (2 cols on Desktop) */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#0b1c30]">Transaksi Booking Terbaru</h2>
              <p className="text-xs text-[#64748b]">Daftar sewa yang baru masuk ke sistem</p>
            </div>
            <Link
              href="/bookings"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0051d5] hover:text-[#0041ab]"
            >
              Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {(!recentBookings || recentBookings.length === 0) ? (
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
          ) : (
            <div className="divide-y divide-[#e2e8f0]">
              {recentBookings.map((b) => {
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
                  <ClickableBookingCard
                    key={b.id}
                    bookingId={b.id}
                    className="py-3 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-transparent hover:bg-slate-50 transition"
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
                  </ClickableBookingCard>
                );
              })}
            </div>
          )}
        </div>

        {/* Dispatch & Return Monitor (1 col on Desktop) */}
        <div className="rounded-2xl bg-white border border-[#e2e8f0] shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0051d5]" />
            <h2 className="text-base font-bold text-[#0b1c30]">Jadwal Pengembalian</h2>
          </div>
          <p className="text-xs text-[#64748b]">Unit sewa yang mendekati batas waktu kembali</p>

          {(!ongoingBookings || ongoingBookings.length === 0) ? (
            <div className="text-center py-8 text-xs text-[#64748b]">
              Tidak ada unit yang sedang disewa saat ini.
            </div>
          ) : (
            <div className="space-y-3">
              {ongoingBookings.map((ob) => {
                const customer = Array.isArray(ob.customers) ? ob.customers[0] : ob.customers;
                const returnDate = new Date(ob.end_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div key={ob.id} className="p-3 rounded-xl bg-[#f8f9ff] border border-[#e2e8f0] space-y-2">
                    <div className="flex justify-between items-center">
                      <Link href={`/bookings/${ob.id}`} className="font-bold text-xs text-[#0051d5] hover:underline">
                        {ob.booking_number}
                      </Link>
                      <span className="text-[11px] text-[#64748b]">{returnDate}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium text-[#0b1c30] truncate">{customer?.name || "Pelanggan"}</p>
                      <BookingQuickAction
                        bookingId={ob.id}
                        bookingNumber={ob.booking_number}
                        currentStatus={ob.status}
                        showDetailLink={false}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-2">
            <Link
              href="/calendar"
              className="block text-center w-full py-2 rounded-xl border border-[#e2e8f0] hover:bg-slate-50 text-xs font-semibold text-[#0b1c30] transition"
            >
              Buka Kalender Sewa Lengkap
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
