"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  CreditCard,
  CheckCircle,
  Ban,
  PlayCircle,
  Printer,
  MessageCircle,
  Copy,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface InvoiceActionToolbarProps {
  bookingId: string;
  currentStatus: string;
  amountDue: number;
  bookingNumber: string;
  storeName: string;
  customerName: string;
  customerPhone: string | null;
  startDate: string;
  endDate: string;
  items: {
    name: string;
    quantity: number;
    subtotal: number;
  }[];
  rentalTotal: number;
  depositTotal: number;
  amountPaid: number;
  notes?: string | null;
}

export function InvoiceActionToolbar({
  bookingId,
  currentStatus,
  amountDue,
  bookingNumber,
  storeName,
  customerName,
  customerPhone,
  startDate,
  endDate,
  items,
  rentalTotal,
  depositTotal,
  amountPaid,
  notes,
}: InvoiceActionToolbarProps) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(amountDue > 0 ? String(amountDue) : "");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paymentRef, setPaymentRef] = useState("");

  const cleanPhone = customerPhone
    ? customerPhone.replace(/^0/, "62").replace(/\D/g, "")
    : "";

  const itemLines = items
    .map((i) => `• ${i.quantity}x ${i.name} (Rp ${Number(i.subtotal).toLocaleString("id-ID")})`)
    .join("\n");

  const invoiceMessage =
    `*INVOICE SEWA — ${storeName.toUpperCase()}*\n` +
    `----------------------------------------\n` +
    `*No. Invoice:* ${bookingNumber}\n` +
    `*Nama Penyewa:* ${customerName}\n` +
    `*Periode Sewa:*\n` +
    `   Ambil: ${startDate}\n` +
    `   Kembali: ${endDate}\n\n` +
    `*Rincian Barang:*\n${itemLines}\n\n` +
    `*Total Biaya Sewa:* Rp ${Number(rentalTotal).toLocaleString("id-ID")}\n` +
    (depositTotal > 0 ? `*Jaminan/Deposit:* Rp ${Number(depositTotal).toLocaleString("id-ID")}\n` : "") +
    `*Terbayar:* Rp ${Number(amountPaid).toLocaleString("id-ID")}\n` +
    `*Sisa Tagihan:* ${amountDue > 0 ? `Rp ${Number(amountDue).toLocaleString("id-ID")}` : "LUNAS"}\n` +
    `*Status:* ${currentStatus}\n` +
    (notes ? `\n*Catatan:* ${notes}\n` : "") +
    `----------------------------------------\n` +
    `Terima kasih telah menyewa di *${storeName}*!`;

  const handleShareWhatsApp = () => {
    if (cleanPhone) {
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(invoiceMessage)}`;
      window.open(waUrl, "_blank");
    } else {
      navigator.clipboard.writeText(invoiceMessage);
      toast.info("No. WhatsApp pelanggan belum diisi. Teks invoice telah disalin!");
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(invoiceMessage);
      setCopied(true);
      toast.success("Teks invoice berhasil disalin!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleUpdateStatus = async (newStatus: "CONFIRMED" | "ONGOING" | "COMPLETED" | "CANCELLED") => {
    if (newStatus === "CANCELLED" && !confirm("Yakin ingin membatalkan transaksi booking ini?")) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("bookings")
        .update({
          status: newStatus,
          cancelled_at: newStatus === "CANCELLED" ? new Date().toISOString() : null,
        })
        .eq("id", bookingId);

      if (error) {
        toast.error("Gagal mengubah status: " + error.message);
        return;
      }

      toast.success(`Status booking berhasil diubah menjadi ${newStatus}`);
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(paymentAmount);
    if (!amount || amount <= 0) {
      toast.error("Masukkan jumlah pembayaran yang valid.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_id: bookingId,
          amount,
          method: paymentMethod,
          reference: paymentRef.trim() || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Gagal mencatat pembayaran.");
        return;
      }

      toast.success("Pembayaran berhasil dicatat!");
      setShowPaymentModal(false);
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="w-full space-y-2">
        {/* Main Status Actions (Primary row) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Konfirmasi Booking (For PENDING from online form) */}
          {currentStatus === "PENDING" && (
            <button
              type="button"
              disabled={loading}
              onClick={() => handleUpdateStatus("CONFIRMED")}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition disabled:opacity-60"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Konfirmasi Booking</span>
            </button>
          )}

          {/* Serah Terima Unit */}
          {currentStatus === "CONFIRMED" && (
            <button
              type="button"
              disabled={loading}
              onClick={() => handleUpdateStatus("ONGOING")}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#0051d5] hover:bg-[#0041ab] text-white text-xs font-semibold shadow-xs transition disabled:opacity-60"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Serah Terima Unit (Pickup)</span>
            </button>
          )}

          {/* Selesai & Kembali */}
          {(currentStatus === "ONGOING" || currentStatus === "OVERDUE") && (
            <button
              type="button"
              disabled={loading}
              onClick={() => handleUpdateStatus("COMPLETED")}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition disabled:opacity-60"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Selesai &amp; Unit Kembali</span>
            </button>
          )}

          {/* Catat Pembayaran if amount due > 0 */}
          {amountDue > 0 && currentStatus !== "CANCELLED" && (
            <button
              type="button"
              onClick={() => setShowPaymentModal(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#131b2e] hover:bg-[#1e293b] text-white text-xs font-semibold shadow-xs transition"
            >
              <CreditCard className="w-4 h-4" />
              <span>Catat Pelunasan (Rp {amountDue.toLocaleString("id-ID")})</span>
            </button>
          )}
        </div>

        {/* Secondary Utility Actions (Share, Print, Cancel) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold transition shadow-2xs"
            title="Kirim Invoice ke WhatsApp"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>Kirim WA</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#0b1c30] border border-[#e2e8f0] text-xs font-semibold transition shadow-2xs"
            title="Cetak Invoice"
          >
            <Printer className="w-4 h-4 text-[#64748b]" />
            <span>Cetak</span>
          </button>

          <button
            type="button"
            onClick={handleCopyText}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-[#64748b] border border-[#e2e8f0] transition shadow-2xs shrink-0"
            title="Salin Teks Invoice"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>

          {currentStatus !== "CANCELLED" && currentStatus !== "COMPLETED" && (
            <button
              type="button"
              disabled={loading}
              onClick={() => handleUpdateStatus("CANCELLED")}
              className="ml-auto inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl text-red-600 hover:bg-red-50 text-xs font-medium transition disabled:opacity-60"
              title="Batalkan Booking"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Batalkan</span>
            </button>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-up">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#e2e8f0] p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-[#0b1c30]">Catat Pembayaran Sewa</h2>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="p-1 text-[#64748b] hover:text-[#0b1c30] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#0b1c30] mb-1">
                  Jumlah Pembayaran (Rp) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm font-bold text-[#0051d5] rounded-lg border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5]"
                />
                <p className="text-[11px] text-[#64748b] mt-1">
                  Sisa tagihan saat ini: Rp {amountDue.toLocaleString("id-ID")}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0b1c30] mb-1">
                  Metode Pembayaran
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-lg border border-[#e2e8f0] bg-white focus:outline-none focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5]"
                >
                  <option value="CASH">Tunai (Cash)</option>
                  <option value="TRANSFER">Transfer Bank</option>
                  <option value="QRIS">QRIS</option>
                  <option value="EWALLET">E-Wallet (GoPay/OVO/Dana)</option>
                  <option value="CARD">Kartu Debit/Kredit</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0b1c30] mb-1">
                  Nomor Referensi / Catatan (Opsional)
                </label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="cth. BCA-TRX-12345 / Lunas di toko"
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#e2e8f0] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#e2e8f0] text-xs font-medium text-[#64748b] hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading || !paymentAmount}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center gap-1">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Menyimpan...
                    </span>
                  ) : (
                    "Simpan Pembayaran"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
