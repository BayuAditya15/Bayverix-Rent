"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CreditCard, CheckCircle, Ban, PlayCircle, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface ActionProps {
  bookingId: string;
  currentStatus: string;
  amountDue: number;
}

export function BookingActionButtons({ bookingId, currentStatus, amountDue }: ActionProps) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(amountDue > 0 ? String(amountDue) : "");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paymentRef, setPaymentRef] = useState("");

  const handleUpdateStatus = async (newStatus: "CONFIRMED" | "ONGOING" | "COMPLETED" | "CANCELLED") => {
    if (newStatus === "CANCELLED" && !confirm("Yakin ingin membatalkan booking ini?")) {
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
      <div className="flex flex-wrap items-center gap-2">
        {/* Konfirmasi Booking (For PENDING from online form) */}
        {currentStatus === "PENDING" && (
          <button
            type="button"
            disabled={loading}
            onClick={() => handleUpdateStatus("CONFIRMED")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition disabled:opacity-60"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Konfirmasi Booking</span>
          </button>
        )}

        {/* Record Payment Button */}
        {amountDue > 0 && currentStatus !== "CANCELLED" && (
          <button
            type="button"
            onClick={() => setShowPaymentModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition"
          >
            <CreditCard className="w-4 h-4" />
            <span>Catat Pembayaran</span>
          </button>
        )}

        {/* Serah Terima (Mark Ongoing) */}
        {currentStatus === "CONFIRMED" && (
          <button
            type="button"
            disabled={loading}
            onClick={() => handleUpdateStatus("ONGOING")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0051d5] hover:bg-[#0041ab] text-white text-xs font-semibold shadow-xs transition disabled:opacity-60"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Serah Terima Unit (Pickup)</span>
          </button>
        )}

        {/* Pengembalian (Mark Completed) */}
        {(currentStatus === "ONGOING" || currentStatus === "OVERDUE") && (
          <button
            type="button"
            disabled={loading}
            onClick={() => handleUpdateStatus("COMPLETED")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition disabled:opacity-60"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Selesai &amp; Unit Kembali</span>
          </button>
        )}

        {/* Cancel Action */}
        {currentStatus !== "CANCELLED" && currentStatus !== "COMPLETED" && (
          <button
            type="button"
            disabled={loading}
            onClick={() => handleUpdateStatus("CANCELLED")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition disabled:opacity-60"
          >
            <Ban className="w-4 h-4" />
            <span>Batalkan Booking</span>
          </button>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#e2e8f0] p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-[#0b1c30]">Catat Pembayaran Sewa</h2>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="p-1 text-[#64748b] hover:text-[#0b1c30]"
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
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5]"
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
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#e2e8f0] bg-white focus:outline-none focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5]"
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
                  Nomor Referensi / Bukti Transfer (Opsional)
                </label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="cth. BCA-TRX-12345"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5]"
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
                  {loading ? "Menyimpan..." : "Konfirmasi Pembayaran"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
