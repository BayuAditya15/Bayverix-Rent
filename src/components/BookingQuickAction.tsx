"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  CheckCircle2,
  PackageCheck,
  Loader2,
  ArrowRight,
  Store,
  X,
  CreditCard,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";

interface BookingQuickActionProps {
  bookingId: string;
  bookingNumber: string;
  currentStatus: string;
  rentalTotal?: number | string;
  amountDue?: number | string;
  notes?: string | null;
  hasProof?: boolean;
  isTransfer?: boolean;
  className?: string;
  showDetailLink?: boolean;
  onStatusChange?: (newStatus: string) => void;
}

export function BookingQuickAction({
  bookingId,
  bookingNumber,
  currentStatus,
  rentalTotal = 0,
  amountDue = 0,
  notes,
  hasProof = false,
  isTransfer = false,
  className = "",
  showDetailLink = false,
  onStatusChange,
}: BookingQuickActionProps) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [showInStoreModal, setShowInStoreModal] = useState(false);
  const [storePayMethod, setStorePayMethod] = useState("CASH");
  const [storePayAmount, setStorePayAmount] = useState(
    String(Number(amountDue) > 0 ? Number(amountDue) : Number(rentalTotal))
  );

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

  const isTransferBooking =
    isTransfer ||
    hasProof ||
    notes?.toLowerCase().includes("transfer");

  const totalNum = Number(rentalTotal);

  // ── 1. Handler Klik Tombol Konfirmasi ──
  const handleConfirmClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Jika Transfer -> Konfirmasi instan & otomatis lunas
    if (isTransferBooking) {
      executeConfirmTransfer();
      return;
    }

    // Jika Bayar di Toko / Tunai -> Munculkan pop up konfirmasi cara pembayaran
    setShowInStoreModal(true);
  };

  // Eksekusi Konfirmasi Transfer (Optimistic 0ms)
  const executeConfirmTransfer = async () => {
    const prevStatus = status;
    setStatus("CONFIRMED");
    onStatusChange?.("CONFIRMED");

    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settlement_type: "AUTO_TRANSFER" }),
      });

      const json = await res.json();
      if (!res.ok) {
        setStatus(prevStatus);
        onStatusChange?.(prevStatus);
        toast.error(json.error || "Gagal mengonfirmasi booking.");
        return;
      }

      toast.success(json.message || `Booking #${bookingNumber} berhasil dikonfirmasi!`);
      router.refresh();
    } catch {
      setStatus(prevStatus);
      onStatusChange?.(prevStatus);
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  // Eksekusi Konfirmasi Bayar di Toko dari Modal (Optimistic 0ms)
  const executeInStoreConfirm = async (settleNow: boolean) => {
    const prevStatus = status;
    setStatus("CONFIRMED");
    onStatusChange?.("CONFIRMED");
    setShowInStoreModal(false);

    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settlement_type: settleNow ? "PAY_AT_STORE" : "CONFIRM_UNPAID",
          payment_method: storePayMethod,
          payment_amount: settleNow ? Number(storePayAmount) || totalNum : 0,
          new_status: "CONFIRMED",
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setStatus(prevStatus);
        onStatusChange?.(prevStatus);
        toast.error(json.error || "Gagal mengonfirmasi booking.");
        return;
      }

      toast.success(json.message || `Booking #${bookingNumber} berhasil dikonfirmasi!`);
      router.refresh();
    } catch {
      setStatus(prevStatus);
      onStatusChange?.(prevStatus);
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  // ── 2. Handler Serah Terima & Kembalikan (Optimistic 0ms) ──
  const handleUpdateStatus = async (
    e: React.MouseEvent,
    newStatus: "ONGOING" | "COMPLETED"
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const prevStatus = status;
    setStatus(newStatus);
    onStatusChange?.(newStatus);

    setLoading(true);
    try {
      const { error } = await supabase
        .from("bookings")
        .update({
          status: newStatus,
        })
        .eq("id", bookingId);

      if (error) {
        setStatus(prevStatus);
        onStatusChange?.(prevStatus);
        toast.error("Gagal mengubah status: " + error.message);
        return;
      }

      toast.success(
        newStatus === "ONGOING"
          ? `Unit sewa #${bookingNumber} berhasil diserah-terimakan!`
          : `Booking #${bookingNumber} selesai dan unit telah dikembalikan.`
      );
      router.refresh();
    } catch {
      setStatus(prevStatus);
      onStatusChange?.(prevStatus);
      toast.error("Terjadi kesalahan sistem saat memperbarui status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className={`flex items-center gap-1.5 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {status === "PENDING" && (
          <button
            type="button"
            disabled={loading}
            onClick={handleConfirmClick}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold transition active:scale-95 shadow-xs disabled:opacity-50"
            title="Klik untuk konfirmasi pesanan booking"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            <span>Konfirmasi</span>
          </button>
        )}

        {status === "CONFIRMED" && (
          <button
            type="button"
            disabled={loading}
            onClick={(e) => handleUpdateStatus(e, "ONGOING")}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0051d5] hover:bg-[#0041ab] text-white text-[11px] font-semibold transition active:scale-95 shadow-xs disabled:opacity-50"
            title="Klik untuk langsung Serah Terima unit ke pelanggan"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <PackageCheck className="w-3.5 h-3.5" />
            )}
            <span>Serah Terima</span>
          </button>
        )}

        {status === "ONGOING" && (
          <button
            type="button"
            disabled={loading}
            onClick={(e) => handleUpdateStatus(e, "COMPLETED")}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition active:scale-95 shadow-xs disabled:opacity-50"
            title="Klik untuk langsung konfirmasi unit telah dikembalikan"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RotateCcw className="w-3.5 h-3.5" />
            )}
            <span>Kembalikan</span>
          </button>
        )}

        {status === "COMPLETED" && (
          <span className="text-[11px] font-medium text-emerald-600 px-2 py-1 bg-emerald-50 rounded-lg">
            Selesai
          </span>
        )}

        {showDetailLink && (
          <Link
            href={`/bookings/${bookingId}`}
            className="inline-flex items-center gap-0.5 px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0b1c30] text-[11px] font-semibold transition"
          >
            <span>Detail</span>
            <ArrowRight className="w-3 h-3 text-[#64748b]" />
          </Link>
        )}
      </div>

      {/* Pop up Modal Konfirmasi Pembayaran di Toko (Tanpa browser alert) */}
      {showInStoreModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in"
          onClick={(e) => {
            e.stopPropagation();
            setShowInStoreModal(false);
          }}
        >
          <div
            className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-[#e2e8f0] space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-[#0051d5]" />
                <h3 className="text-xs font-bold text-[#0b1c30]">
                  Konfirmasi Pembayaran di Toko
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowInStoreModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <p className="text-[11px] text-[#64748b]">No. Booking: <strong className="text-[#0051d5]">{bookingNumber}</strong></p>
                <p className="text-sm font-bold text-[#0b1c30]">
                  Total Tagihan: Rp {totalNum.toLocaleString("id-ID")}
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#64748b] mb-1">
                  Metode Penerimaan:
                </label>
                <select
                  value={storePayMethod}
                  onChange={(e) => setStorePayMethod(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e8f0] bg-white outline-none focus:ring-2 focus:ring-[#0051d5]/20 font-medium"
                >
                  <option value="CASH">Tunai / Cash</option>
                  <option value="QRIS">QRIS Toko</option>
                  <option value="TRANSFER">Transfer di Tempat</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#64748b] mb-1">
                  Nominal Pembayaran (Rp):
                </label>
                <input
                  type="number"
                  value={storePayAmount}
                  onChange={(e) => setStorePayAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e8f0] bg-white outline-none focus:ring-2 focus:ring-[#0051d5]/20 font-bold"
                />
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                disabled={loading}
                onClick={() => executeInStoreConfirm(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>Konfirmasi &amp; Catat Lunas</span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => executeInStoreConfirm(false)}
                className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0b1c30] font-semibold text-xs transition disabled:opacity-60"
              >
                Konfirmasi Saja (Bayar Nanti)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
