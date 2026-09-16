import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentBusinessOrRedirect } from "@/lib/auth/getCurrentBusiness";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, User, Phone, Mail, MapPin, MessageCircle, ShoppingBag, Clock } from "lucide-react";
import { ClickableBookingCard } from "@/components/ClickableRow";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { businessId } = await getCurrentBusinessOrRedirect();
  const supabase = await createClient();
  const { id } = await params;

  // 1. Fetch Customer Info
  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .eq("business_id", businessId)
    .single();

  if (!customer) {
    notFound();
  }

  // 2. Fetch Customer Bookings History
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      id,
      booking_number,
      start_at,
      end_at,
      rental_total,
      amount_due,
      status,
      created_at
    `)
    .eq("customer_id", id)
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  const cleanPhone = customer.phone?.replace(/^0/, "62").replace(/\D/g, "");
  const totalSpent = (bookings || []).reduce((acc, b) => acc + Number(b.rental_total || 0), 0);
  const activeBookings = (bookings || []).filter((b) => b.status === "ONGOING" || b.status === "CONFIRMED");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/customers"
            className="p-2 rounded-xl border border-[#e2e8f0] bg-white hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-4 h-4 text-[#0b1c30]" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[#0b1c30]">{customer.name}</h1>
            <p className="text-xs text-[#64748b]">Profil &amp; Riwayat Transaksi Pelanggan</p>
          </div>
        </div>

        {cleanPhone && (
          <a
            href={`https://wa.me/${cleanPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat WhatsApp</span>
          </a>
        )}
      </div>

      {/* Profile & Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Customer Contact Card */}
        <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-3 md:col-span-2">
          <h2 className="text-sm font-bold text-[#0b1c30] flex items-center gap-2">
            <User className="w-4 h-4 text-[#0051d5]" />
            <span>Informasi Kontak</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <Phone className="w-4 h-4 text-[#64748b] shrink-0" />
              <div>
                <p className="text-[10px] text-[#64748b]">No. Telepon / WhatsApp</p>
                <p className="font-semibold text-[#0b1c30]">{customer.phone || "-"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <Mail className="w-4 h-4 text-[#64748b] shrink-0" />
              <div>
                <p className="text-[10px] text-[#64748b]">Email</p>
                <p className="font-semibold text-[#0b1c30] truncate">{customer.email || "-"}</p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 sm:col-span-2">
              <MapPin className="w-4 h-4 text-[#64748b] shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-[#64748b]">Catatan / Alamat</p>
                <p className="font-medium text-[#0b1c30]">{customer.notes || "Tidak ada catatan khusus"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-[#0b1c30] flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#0051d5]" />
            <span>Aktivitas Sewa</span>
          </h2>

          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-[#eff4ff] border border-[#dce9ff]">
              <p className="text-[11px] text-[#64748b]">Total Transaksi</p>
              <p className="text-lg font-bold text-[#0051d5]">
                {bookings?.length || 0} Booking
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[11px] text-[#64748b]">Total Belanja / Sewa</p>
              <p className="text-sm font-bold text-[#0b1c30]">
                Rp {totalSpent.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings History */}
      <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-[#0b1c30]">Riwayat Booking ({bookings?.length || 0})</h2>

        {(!bookings || bookings.length === 0) ? (
          <p className="text-xs text-[#64748b] text-center py-6">
            Pelanggan ini belum memiliki riwayat transaksi sewa.
          </p>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => {
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
                  className="p-3.5 rounded-xl border border-[#e2e8f0] bg-[#f8f9ff]/50 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#0051d5]">{b.booking_number}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {b.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748b] mt-0.5">
                      {startDate} → {endDate}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <p className="font-bold text-[#0b1c30]">
                      Rp {Number(b.rental_total).toLocaleString("id-ID")}
                    </p>
                    {Number(b.amount_due) > 0 ? (
                      <p className="text-[10px] text-amber-600">
                        Sisa: Rp {Number(b.amount_due).toLocaleString("id-ID")}
                      </p>
                    ) : (
                      <p className="text-[10px] text-emerald-600">Lunas</p>
                    )}
                  </div>
                </ClickableBookingCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
