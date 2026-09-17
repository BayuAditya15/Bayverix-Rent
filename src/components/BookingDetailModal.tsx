"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  X,
  Calendar,
  Phone,
  MessageCircle,
  CreditCard,
  CheckCircle,
  PlayCircle,
  Ban,
  Package,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  FileText,
  BadgeAlert,
  Wallet,
  Building2,
  Store,
} from "lucide-react";
import { toast } from "sonner";
import { PaymentProofViewer } from "@/components/PaymentProofViewer";

export interface BookingDetailModalItem {
  id: string;
  booking_number: string;
  start_at: string;
  end_at: string;
  rental_total: number | string;
  deposit_total?: number | string;
  amount_due: number | string;
  amount_paid: number | string;
  status: string;
  notes?: string | null;
  created_at: string;
  initialInStoreConfirm?: boolean;
  customers:
    | {
        id?: string;
        name: string;
        phone?: string | null;
        email?: string | null;
      }
    | {
        id?: string;
        name: string;
        phone?: string | null;
        email?: string | null;
      }[]
    | null;
  booking_items?: {
    id: string;
    item_name_snapshot: string;
    unit_price: number;
    quantity: number;
    subtotal: number;
  }[];
  payments?: {
    id: string;
    amount: number;
    method: string;
    status: string;
    reference: string | null;
    paid_at: string;
  }[];
}

interface BookingDetailModalProps {
  booking: BookingDetailModalItem | null;
  onClose: () => void;
  storeName?: string;
  initialInStoreConfirm?: boolean;
}

export function BookingDetailModal({
  booking,
  onClose,
  storeName = "Rental Store",
  initialInStoreConfirm = false,
}: BookingDetailModalProps) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [copiedInvoice, setCopiedInvoice] = useState(false);

  // In-store confirmation flow state
  const [showInStoreConfirm, setShowInStoreConfirm] = useState(
    initialInStoreConfirm || Boolean(booking?.initialInStoreConfirm)
  );
  const [storePayMethod, setStorePayMethod] = useState("CASH");
  const [storePayAmount, setStorePayAmount] = useState(
    booking ? String(Number(booking.amount_due) > 0 ? Number(booking.amount_due) : booking.rental_total) : ""
  );

  // Keyboard Escape listener & body scroll lock
  useEffect(() => {
    if (!booking) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [booking, onClose]);

  // Sync state when booking changes
  useEffect(() => {
    if (booking) {
      setShowInStoreConfirm(initialInStoreConfirm || Boolean(booking.initialInStoreConfirm));
      setStorePayAmount(
        String(Number(booking.amount_due) > 0 ? Number(booking.amount_due) : booking.rental_total)
      );
    }
  }, [booking, initialInStoreConfirm]);

  if (!booking) return null;

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
  const isPaidOff = amountDue <= 0;

  const cleanPhone = customer?.phone
    ? customer.phone.replace(/^0/, "62").replace(/\D/g, "")
    : "";

  // Detect transfer payment vs bayar di tempat
  const pendingTransferPayment = booking.payments?.find(
    (p) => p.method === "TRANSFER"
  );
  const hasProof = Boolean(pendingTransferPayment?.reference);
  const isTransferMethod =
    Boolean(pendingTransferPayment) ||
    booking.notes?.toLowerCase().includes("transfer");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">PENDING</span>;
      case "CONFIRMED":
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-[#0051d5] border border-blue-100">CONFIRMED</span>;
      case "ONGOING":
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-[#0051d5] border border-blue-200">ONGOING</span>;
      case "COMPLETED":
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">COMPLETED</span>;
      case "CANCELLED":
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-red-50 text-red-700 border border-red-100">CANCELLED</span>;
      case "OVERDUE":
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">OVERDUE</span>;
      default:
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  // Main Confirm Handler
  const handleConfirmBookingClick = async () => {
    // KASUS 1: Jika metode TRANSFER & ada bukti -> Langsung otomatis verifikasi lunas & confirm!
    if (isTransferMethod) {
      setLoading(true);
      try {
        const res = await fetch(`/api/bookings/${booking.id}/confirm`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ settlement_type: "AUTO_TRANSFER" }),
        });

        const json = await res.json();
        if (!res.ok) {
          toast.error(json.error || "Gagal mengonfirmasi booking.");
          return;
        }

        toast.success(json.message || "Booking berhasil dikonfirmasi & transfer diverifikasi lunas!");
        router.refresh();
        onClose();
      } catch {
        toast.error("Terjadi kesalahan jaringan.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // KASUS 2: Jika Bayar di Toko -> Munculkan opsi pembayaran di tempat
    setShowInStoreConfirm(true);
  };

  // Submit in-store confirmation with payment
  const handleExecuteInStoreConfirm = async (settleNow: boolean) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settlement_type: settleNow ? "PAY_AT_STORE" : "CONFIRM_UNPAID",
          payment_method: storePayMethod,
          payment_amount: settleNow ? Number(storePayAmount) || amountDue || rentalTotal : 0,
          new_status: "CONFIRMED",
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Gagal mengonfirmasi booking.");
        return;
      }

      toast.success(json.message || "Booking berhasil dikonfirmasi!");
      setShowInStoreConfirm(false);
      router.refresh();
      onClose();
    } catch {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  // Status transitions for other statuses
  const handleUpdateStatus = async (
    newStatus: "ONGOING" | "COMPLETED" | "CANCELLED"
  ) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("bookings")
        .update({
          status: newStatus,
          cancelled_at: newStatus === "CANCELLED" ? new Date().toISOString() : null,
        })
        .eq("id", booking.id);

      if (error) {
        toast.error("Gagal mengubah status: " + error.message);
        return;
      }

      toast.success(
        newStatus === "ONGOING"
          ? `Unit sewa #${booking.booking_number} berhasil diserah-terimakan!`
          : newStatus === "COMPLETED"
          ? `Unit sewa #${booking.booking_number} telah dikembalikan & selesai!`
          : `Booking #${booking.booking_number} telah dibatalkan.`
      );
      router.refresh();
      onClose();
    } catch {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyBookingNumber = () => {
    navigator.clipboard.writeText(booking.booking_number);
    setCopiedInvoice(true);
    toast.success("No. Booking berhasil disalin!");
    setTimeout(() => setCopiedInvoice(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#e2e8f0] overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#e2e8f0] flex items-center justify-between bg-slate-50/60 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="font-mono text-xs sm:text-sm font-bold text-[#0051d5] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
              {booking.booking_number}
            </span>
            {getStatusBadge(booking.status)}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopyBookingNumber}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
              title="Salin No. Booking"
            >
              {copiedInvoice ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {/* Customer & Period Info Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#f8f9ff] border border-slate-100">
            <div>
              <p className="text-[#64748b] text-[11px]">Nama Penyewa:</p>
              <p className="font-bold text-[#0b1c30] text-sm mt-0.5">{customer?.name || "Pelanggan Umum"}</p>
              {customer?.phone && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[#64748b]">{customer.phone}</span>
                  {cleanPhone && (
                    <a
                      href={`https://wa.me/${cleanPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:underline bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>Chat WA</span>
                    </a>
                  )}
                </div>
              )}
            </div>

            <div>
              <p className="text-[#64748b] text-[11px]">Waktu &amp; Durasi Sewa:</p>
              <p className="font-medium text-[#0b1c30] mt-0.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#0051d5] shrink-0" />
                <span>{startDate} &rarr; {endDate}</span>
              </p>
              <p className="text-[11px] text-[#64748b] mt-0.5 font-semibold">
                Durasi: {rentalDays} Hari
              </p>
            </div>
          </div>

          {/* Rented Items List */}
          <div>
            <div className="flex items-center gap-1.5 font-bold text-[#0b1c30] mb-2">
              <Package className="w-4 h-4 text-[#0051d5]" />
              <span>Daftar Barang Sewa</span>
            </div>

            {booking.booking_items && booking.booking_items.length > 0 ? (
              <div className="space-y-1.5 border border-[#e2e8f0] rounded-xl overflow-hidden divide-y divide-slate-100">
                {booking.booking_items.map((item) => (
                  <div key={item.id} className="p-2.5 flex items-center justify-between gap-3 bg-white">
                    <div className="min-w-0">
                      <p className="font-semibold text-[#0b1c30] truncate">{item.item_name_snapshot}</p>
                      <p className="text-[11px] text-[#64748b]">
                        {item.quantity}x @ Rp {Number(item.unit_price).toLocaleString("id-ID")}
                      </p>
                    </div>
                    <span className="font-bold text-[#0b1c30] shrink-0">
                      Rp {Number(item.subtotal).toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#64748b] italic p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                1x Transaksi Paket Sewa
              </p>
            )}
          </div>

          {/* Notes & Payment Method Details */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#64748b] text-[11px] font-medium">Metode Pembayaran:</span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                isTransferMethod
                  ? "bg-blue-50 text-[#0051d5] border border-blue-200"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}>
                {isTransferMethod ? "Transfer Bank" : "Bayar di Toko / Tempat"}
              </span>
            </div>

            {booking.notes && (
              <p className="text-[11px] text-[#0b1c30] pt-1 border-t border-slate-200/60">
                <span className="text-[#64748b]">Catatan: </span>
                {booking.notes}
              </p>
            )}

            {/* Proof of Payment Viewer if Transfer */}
            {hasProof && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                <span className="text-[11px] text-[#64748b]">Bukti Pembayaran:</span>
                <PaymentProofViewer reference={pendingTransferPayment?.reference || null} />
              </div>
            )}
          </div>

          {/* Payment Summary */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#e2e8f0] space-y-1.5 shadow-2xs">
            <div className="flex justify-between text-[#64748b]">
              <span>Total Biaya Sewa:</span>
              <span className="font-bold text-[#0b1c30]">Rp {rentalTotal.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between text-[#64748b]">
              <span>Terbayar:</span>
              <span className="font-semibold text-emerald-700">Rp {amountPaid.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between text-xs pt-1.5 border-t border-slate-100">
              <span className="font-bold text-[#0b1c30]">Sisa Tagihan:</span>
              <span className={`font-extrabold ${isPaidOff ? "text-emerald-600" : "text-amber-600"}`}>
                {isPaidOff ? "LUNAS" : `Rp ${amountDue.toLocaleString("id-ID")}`}
              </span>
            </div>
          </div>

          {/* In-Store Confirmation Interactive Box (Only shown if clicking confirm on Bayar di Toko) */}
          {showInStoreConfirm && (
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3 animate-in fade-in">
              <div className="flex justify-between items-center">
                <p className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-amber-700" />
                  <span>Konfirmasi Pembayaran di Toko</span>
                </p>
                <button
                  type="button"
                  onClick={() => setShowInStoreConfirm(false)}
                  className="text-amber-600 hover:text-amber-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[11px] text-amber-800">
                Pelanggan memilih metode <strong>Bayar di Toko</strong> sebesar <strong>Rp {rentalTotal.toLocaleString("id-ID")}</strong>. Pilih aksi pembayaran:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-amber-900 mb-1">Metode Penerimaan:</label>
                  <select
                    value={storePayMethod}
                    onChange={(e) => setStorePayMethod(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-amber-200 bg-white outline-none focus:ring-2 focus:ring-[#0051d5]/20 font-medium"
                  >
                    <option value="CASH">Tunai / Cash</option>
                    <option value="QRIS">QRIS Toko</option>
                    <option value="TRANSFER">Transfer di Tempat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-amber-900 mb-1">Nominal (Rp):</label>
                  <input
                    type="number"
                    value={storePayAmount}
                    onChange={(e) => setStorePayAmount(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-amber-200 bg-white outline-none focus:ring-2 focus:ring-[#0051d5]/20 font-bold"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleExecuteInStoreConfirm(true)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  <span>Konfirmasi &amp; Catat Lunas</span>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleExecuteInStoreConfirm(false)}
                  className="py-2.5 px-3 rounded-xl bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-semibold text-xs transition"
                >
                  Konfirmasi Saja (Bayar Nanti)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 sm:p-5 border-t border-[#e2e8f0] bg-slate-50/60 shrink-0 space-y-2">
          {/* Main Status Actions (Simplified Single Action) */}
          <div className="flex flex-wrap items-center gap-2">
            {/* 1. Konfirmasi Booking (Single Click for Transfer, or prompt for In-Store) */}
            {booking.status === "PENDING" && !showInStoreConfirm && (
              <button
                type="button"
                disabled={loading}
                onClick={handleConfirmBookingClick}
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#0051d5] hover:bg-[#0041ab] text-white text-xs font-bold shadow-md transition active:scale-[0.99] disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                <span>
                  {isTransferMethod
                    ? "Konfirmasi Booking (Otomatis Lunas)"
                    : "Konfirmasi Pesanan Booking"}
                </span>
              </button>
            )}

            {/* 2. Serah Terima Unit */}
            {booking.status === "CONFIRMED" && (
              <button
                type="button"
                disabled={loading}
                onClick={() => handleUpdateStatus("ONGOING")}
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-[#0051d5] hover:bg-[#0041ab] text-white text-xs font-bold shadow-md transition disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
                <span>Serah Terima Unit (Mulai Sewa)</span>
              </button>
            )}

            {/* 3. Selesai & Unit Kembali */}
            {(booking.status === "ONGOING" || booking.status === "OVERDUE") && (
              <button
                type="button"
                disabled={loading}
                onClick={() => handleUpdateStatus("COMPLETED")}
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                <span>Selesai &amp; Unit Telah Kembali</span>
              </button>
            )}
          </div>

          {/* Secondary Footer Buttons */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <Link
              href={`/bookings/${booking.id}`}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0051d5] hover:underline"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Buka Faktur &amp; Cetak Penuh &rarr;</span>
            </Link>

            {booking.status !== "CANCELLED" && booking.status !== "COMPLETED" && (
              <button
                type="button"
                disabled={loading}
                onClick={() => handleUpdateStatus("CANCELLED")}
                className="inline-flex items-center gap-1 text-[11px] text-red-600 hover:underline"
              >
                <Ban className="w-3 h-3" />
                <span>Batalkan Booking</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
