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
  onOpenInStoreConfirm?: () => void;
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
  onOpenInStoreConfirm,
}: BookingQuickActionProps) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

  const isTransferBooking =
    isTransfer ||
    hasProof ||
    notes?.toLowerCase().includes("transfer");

  // ── 1. Handler Klik Tombol Konfirmasi ──
  const handleConfirmClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Jika Transfer -> Konfirmasi instan & otomatis lunas (Optimistic 0ms)
    if (isTransferBooking) {
      executeConfirmTransfer();
      return;
    }

    // Jika Bayar di Toko / Tunai -> Panggil modal konfirmasi tunggal (tanpa duplikat)
    if (onOpenInStoreConfirm) {
      onOpenInStoreConfirm();
    }
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
  );
}
