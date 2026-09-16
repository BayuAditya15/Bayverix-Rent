"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { CheckCircle2, PackageCheck, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

interface BookingQuickActionProps {
  bookingId: string;
  bookingNumber: string;
  currentStatus: string;
  className?: string;
  showDetailLink?: boolean;
}

export function BookingQuickAction({
  bookingId,
  bookingNumber,
  currentStatus,
  className = "",
  showDetailLink = false,
}: BookingQuickActionProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleUpdateStatus = async (
    e: React.MouseEvent,
    newStatus: "CONFIRMED" | "ONGOING" | "COMPLETED"
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const actionName =
      newStatus === "CONFIRMED"
        ? "Konfirmasi Pesanan Booking"
        : newStatus === "ONGOING"
        ? "Serah Terima Unit (Mulai Sewa)"
        : "Unit Dikembalikan (Selesai Sewa)";

    if (!confirm(`Lakukan ${actionName} untuk booking #${bookingNumber}?`)) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("bookings")
        .update({
          status: newStatus,
        })
        .eq("id", bookingId);

      if (error) {
        toast.error("Gagal mengubah status: " + error.message);
        return;
      }

      toast.success(
        newStatus === "CONFIRMED"
          ? `Booking #${bookingNumber} berhasil dikonfirmasi!`
          : newStatus === "ONGOING"
          ? `Unit sewa #${bookingNumber} berhasil diserah-terimakan!`
          : `Booking #${bookingNumber} selesai dan unit telah dikembalikan.`
      );
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan sistem saat memperbarui status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex items-center gap-1.5 ${className}`} onClick={(e) => e.stopPropagation()}>
      {currentStatus === "PENDING" && (
        <button
          type="button"
          disabled={loading}
          onClick={(e) => handleUpdateStatus(e, "CONFIRMED")}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold transition active:scale-95 shadow-xs disabled:opacity-50"
          title="Klik untuk konfirmasi pesanan booking dari form online"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5" />
          )}
          <span>Konfirmasi</span>
        </button>
      )}

      {currentStatus === "CONFIRMED" && (
        <button
          type="button"
          disabled={loading}
          onClick={(e) => handleUpdateStatus(e, "ONGOING")}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0051d5] hover:bg-[#0041ab] text-white text-[11px] font-semibold transition active:scale-95 shadow-xs disabled:opacity-50"
          title="Klik untuk langsung Serah Terima unit ke pelanggan tanpa buka halaman detail"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <PackageCheck className="w-3.5 h-3.5" />
          )}
          <span>Serah Terima</span>
        </button>
      )}

      {currentStatus === "ONGOING" && (
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
            <CheckCircle2 className="w-3.5 h-3.5" />
          )}
          <span>Kembalikan</span>
        </button>
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
