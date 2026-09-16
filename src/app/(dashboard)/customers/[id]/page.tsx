import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentBusinessOrRedirect } from "@/lib/auth/getCurrentBusiness";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, User, Phone, Mail, MapPin, MessageCircle, ShoppingBag, Clock } from "lucide-react";
import { DashboardRecentBookings } from "@/components/DashboardRecentBookings";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { businessId, business } = await getCurrentBusinessOrRedirect();
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
      deposit_total,
      amount_due,
      amount_paid,
      status,
      notes,
      created_at,
      customers (
        id,
        name,
        phone,
        email
      ),
      booking_items (
        id,
        item_name_snapshot,
        unit_price,
        quantity,
        subtotal
      ),
      payments (
        id,
        amount,
        method,
        status,
        reference,
        paid_at
      )
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

        <DashboardRecentBookings
          bookings={bookings as any}
          storeName={business.name}
        />
      </div>
    </div>
  );
}
