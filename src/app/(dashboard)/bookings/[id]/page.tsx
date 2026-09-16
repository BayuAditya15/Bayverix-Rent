import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentBusinessOrRedirect } from "@/lib/auth/getCurrentBusiness";
import { createClient } from "@/lib/supabase/server";
import {
  ArrowLeft,
  Calendar,
  User,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  Package,
  Store,
} from "lucide-react";
import { InvoiceActionToolbar } from "@/components/InvoiceActionToolbar";
import { PaymentProofViewer } from "@/components/PaymentProofViewer";

export const dynamic = "force-dynamic";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { businessId, business } = await getCurrentBusinessOrRedirect();
  const { id } = await params;
  const supabase = await createClient();

  // 1. Fetch Booking Header with Customer
  const { data: booking, error: bError } = await supabase
    .from("bookings")
    .select(`
      *,
      customers (
        id,
        name,
        phone,
        email,
        notes
      )
    `)
    .eq("id", id)
    .eq("business_id", businessId)
    .single();

  if (bError || !booking) {
    notFound();
  }

  // 2. Fetch Booking Items
  const { data: items } = await supabase
    .from("booking_items")
    .select("*")
    .eq("booking_id", id);

  // 3. Fetch Payments
  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("booking_id", id)
    .order("paid_at", { ascending: false });

  const customer = Array.isArray(booking.customers) ? booking.customers[0] : booking.customers;
  const startDateObj = new Date(booking.start_at);
  const endDateObj = new Date(booking.end_at);

  const startDate = startDateObj.toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const endDate = endDateObj.toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const diffMs = endDateObj.getTime() - startDateObj.getTime();
  const rentalDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  const amountDue = Number(booking.amount_due);
  const amountPaid = Number(booking.amount_paid);
  const rentalTotal = Number(booking.rental_total);
  const depositTotal = Number(booking.deposit_total);
  const isPaidOff = amountDue <= 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">PENDING</span>;
      case "CONFIRMED":
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-[#0051d5] border border-blue-100 whitespace-nowrap">CONFIRMED</span>;
      case "ONGOING":
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100 whitespace-nowrap">ONGOING</span>;
      case "COMPLETED":
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 whitespace-nowrap">COMPLETED</span>;
      case "CANCELLED":
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-red-50 text-red-700 border border-red-100 whitespace-nowrap">CANCELLED</span>;
      case "OVERDUE":
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-red-50 text-red-700 border border-red-100 whitespace-nowrap">OVERDUE</span>;
      default:
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 whitespace-nowrap">{status}</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
      {/* Top Header & Clean Action Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e2e8f0] shadow-xs space-y-3.5 print:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              href="/bookings"
              className="p-2 rounded-xl border border-[#e2e8f0] bg-white text-[#64748b] hover:text-[#0b1c30] hover:bg-slate-50 transition shrink-0"
              title="Kembali ke Daftar Booking"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-xl font-bold text-[#0b1c30] tracking-tight truncate">
                  {booking.booking_number}
                </h1>
                {getStatusBadge(booking.status)}
              </div>
              <p className="text-[11px] text-[#64748b] truncate mt-0.5">
                {customer?.name || "Pelanggan"} &bull; {new Date(booking.created_at).toLocaleDateString("id-ID", { dateStyle: "medium" })}
              </p>
            </div>
          </div>
        </div>

        {/* Clean Responsive Action Bar */}
        <InvoiceActionToolbar
          bookingId={booking.id}
          currentStatus={booking.status}
          amountDue={amountDue}
          bookingNumber={booking.booking_number}
          storeName={business.name}
          customerName={customer?.name || "Pelanggan"}
          customerPhone={customer?.phone || null}
          startDate={startDate}
          endDate={endDate}
          items={
            items?.map((i) => ({
              name: i.item_name_snapshot,
              quantity: i.quantity,
              subtotal: Number(i.subtotal),
            })) || []
          }
          rentalTotal={rentalTotal}
          depositTotal={depositTotal}
          amountPaid={amountPaid}
          notes={booking.notes}
        />
      </div>

      {/* Official Invoice Sheet */}
      <div className="invoice-printable p-5 sm:p-8 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-6">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#131b2e] text-white flex items-center justify-center font-bold text-xs">
                <Store className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-lg font-bold text-[#0b1c30] tracking-tight">
                {business.name}
              </h2>
            </div>
            <div className="mt-2 text-[11px] text-[#64748b] space-y-0.5">
              {business.address && (
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{business.address}</span>
                </p>
              )}
              {business.phone && (
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{business.phone}</span>
                </p>
              )}
              {business.email && (
                <p className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{business.email}</span>
                </p>
              )}
            </div>
          </div>

          <div className="sm:text-right space-y-1">
            <h3 className="text-xl font-black tracking-tight text-[#0051d5]">
              INVOICE SEWA
            </h3>
            <p className="text-xs font-mono font-bold text-[#0b1c30]">
              {booking.booking_number}
            </p>
            <p className="text-[11px] text-[#64748b]">
              Tgl: {new Date(booking.created_at).toLocaleDateString("id-ID")}
            </p>
            <div className="pt-1">
              <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${
                isPaidOff
                  ? "bg-emerald-100 text-emerald-800"
                  : amountPaid > 0
                  ? "bg-amber-100 text-amber-800"
                  : "bg-red-100 text-red-800"
              }`}>
                {isPaidOff ? "LUNAS" : amountPaid > 0 ? "UANG MUKA (DP)" : "BELUM LUNAS"}
              </span>
            </div>
          </div>
        </div>

        {/* 2-Column Info: Customer Contact & Rental Schedule */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#f8f9ff] p-4 rounded-xl border border-slate-200/80 text-xs">
          <div className="space-y-1.5">
            <h4 className="font-bold text-[#64748b] uppercase tracking-wider text-[10px]">
              DITAGIHKAN KEPADA:
            </h4>
            <p className="text-sm font-bold text-[#0b1c30]">{customer?.name || "Pelanggan Umum"}</p>
            {customer?.phone && (
              <p className="text-[#64748b]">WhatsApp / Telp: {customer.phone}</p>
            )}
            {customer?.email && (
              <p className="text-[#64748b]">Email: {customer.email}</p>
            )}
          </div>

          <div className="space-y-1.5 sm:border-l sm:border-slate-200 sm:pl-4">
            <h4 className="font-bold text-[#64748b] uppercase tracking-wider text-[10px]">
              JADWAL &amp; PERIODE SEWA:
            </h4>
            <p className="text-[#64748b]">
              <strong className="text-[#0b1c30]">Pickup:</strong> {startDate}
            </p>
            <p className="text-[#64748b]">
              <strong className="text-[#0b1c30]">Return:</strong> {endDate}
            </p>
            <p className="text-[#0051d5] font-semibold pt-0.5">
              Total Durasi: {rentalDays} Hari Sewa
            </p>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-xs text-[#0b1c30] uppercase tracking-wider">
            Rincian Barang Sewa
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-[#131b2e] text-[#64748b]">
                  <th className="py-2 font-bold w-8">No</th>
                  <th className="py-2 font-bold">Nama Barang</th>
                  <th className="py-2 font-bold text-right">Tarif/Hari</th>
                  <th className="py-2 font-bold text-center">Durasi</th>
                  <th className="py-2 font-bold text-center">Qty</th>
                  <th className="py-2 font-bold text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items?.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-2.5 text-slate-400 font-medium">{idx + 1}</td>
                    <td className="py-2.5 font-bold text-[#0b1c30]">
                      {item.item_name_snapshot}
                    </td>
                    <td className="py-2.5 text-right text-[#64748b]">
                      Rp {Number(item.unit_price).toLocaleString("id-ID")}
                    </td>
                    <td className="py-2.5 text-center text-[#64748b]">
                      {rentalDays} Hari
                    </td>
                    <td className="py-2.5 text-center font-bold text-[#0b1c30]">
                      {item.quantity} Unit
                    </td>
                    <td className="py-2.5 text-right font-bold text-[#0051d5]">
                      Rp {Number(item.subtotal).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Calculation & Payment Summary */}
        <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row justify-between gap-5 text-xs">
          {/* Notes & Terms */}
          <div className="flex-1 space-y-2.5">
            {booking.notes && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-[#0b1c30] block mb-0.5 text-[11px]">Catatan:</span>
                <p className="text-[#64748b] text-[11px]">{booking.notes}</p>
              </div>
            )}

            <div className="text-[10px] text-[#64748b] space-y-0.5">
              <p className="font-bold text-[#0b1c30]">Ketentuan:</p>
              <p>&bull; Harap periksa kondisi fisik barang saat serah terima unit.</p>
              <p>&bull; Keterlambatan pengembalian unit dapat dikenakan denda sewa harian.</p>
              <p>&bull; Uang jaminan / deposit dikembalikan setelah unit diperiksa.</p>
            </div>
          </div>

          {/* Totals Table */}
          <div className="w-full sm:w-72 space-y-2 self-start bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <div className="flex justify-between text-[#64748b]">
              <span>Subtotal Sewa:</span>
              <span className="font-bold text-[#0b1c30]">
                Rp {rentalTotal.toLocaleString("id-ID")}
              </span>
            </div>

            {depositTotal > 0 && (
              <div className="flex justify-between text-[#64748b]">
                <span>Jaminan / Deposit:</span>
                <span className="font-bold text-[#0b1c30]">
                  Rp {depositTotal.toLocaleString("id-ID")}
                </span>
              </div>
            )}

            <div className="flex justify-between text-[#64748b]">
              <span>Total Terbayar:</span>
              <span className="font-bold text-emerald-600">
                Rp {amountPaid.toLocaleString("id-ID")}
              </span>
            </div>

            <div className="pt-1.5 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-xs font-bold text-[#0b1c30]">Sisa Tagihan:</span>
              <span className={`text-base font-black ${amountDue > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                {amountDue > 0 ? `Rp ${amountDue.toLocaleString("id-ID")}` : "LUNAS"}
              </span>
            </div>
          </div>
        </div>

        {/* Payment History & Transfer Slip Preview */}
        {payments && payments.length > 0 && (
          <div className="pt-3 border-t border-slate-200 space-y-2.5">
            <h4 className="font-bold text-xs text-[#0b1c30] uppercase tracking-wider">
              Riwayat Pembayaran ({payments.length})
            </h4>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
              {payments.map((p) => (
                <div
                  key={p.id}
                  className="p-2.5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/50 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                      <CreditCard className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-bold text-[#0b1c30]">
                        Rp {Number(p.amount).toLocaleString("id-ID")}
                      </p>
                      <p className="text-[10px] text-[#64748b]">
                        {p.method} &bull; {new Date(p.paid_at).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <PaymentProofViewer reference={p.reference} />
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
