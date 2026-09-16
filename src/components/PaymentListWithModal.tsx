"use client";

import { useState } from "react";
import Link from "next/link";
import { CreditCard, X, ExternalLink, Receipt, CheckCircle2, User, Phone, Image as ImageIcon, Calendar } from "lucide-react";
import { TablePagination } from "@/components/TablePagination";

export interface PaymentItem {
  id: string;
  amount: number | string;
  currency: string;
  method: string;
  status: string;
  reference: string | null;
  paid_at: string;
  bookings: {
    id: string;
    booking_number: string;
    customers: {
      name: string;
      phone: string | null;
    } | {
      name: string;
      phone: string | null;
    }[] | null;
  } | {
    id: string;
    booking_number: string;
    customers: {
      name: string;
      phone: string | null;
    } | {
      name: string;
      phone: string | null;
    }[] | null;
  }[] | null;
}

interface PaymentListWithModalProps {
  payments: PaymentItem[];
}

export function PaymentListWithModal({ payments }: PaymentListWithModalProps) {
  const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const getCustomer = (p: PaymentItem) => {
    const booking = Array.isArray(p.bookings) ? p.bookings[0] : p.bookings;
    if (!booking) return null;
    return Array.isArray(booking.customers) ? booking.customers[0] : booking.customers;
  };

  const getBooking = (p: PaymentItem) => {
    return Array.isArray(p.bookings) ? p.bookings[0] : p.bookings;
  };

  const isImageReference = (ref: string | null) => {
    if (!ref) return false;
    return (
      ref.startsWith("http://") ||
      ref.startsWith("https://") ||
      ref.includes("supabase.co") ||
      ref.match(/\.(jpeg|jpg|gif|png|webp)/i) !== null
    );
  };

  const selectedBooking = selectedPayment ? getBooking(selectedPayment) : null;
  const selectedCustomer = selectedPayment ? getCustomer(selectedPayment) : null;

  // Filter payments by search
  const filteredPayments = payments.filter((p) => {
    const booking = getBooking(p);
    const customer = getCustomer(p);
    const q = search.toLowerCase().trim();
    if (!q) return true;

    return (
      booking?.booking_number?.toLowerCase().includes(q) ||
      customer?.name?.toLowerCase().includes(q) ||
      p.method?.toLowerCase().includes(q) ||
      (p.reference && p.reference.toLowerCase().includes(q)) ||
      String(p.amount).includes(q)
    );
  });

  // Pagination slice
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedPayments = filteredPayments.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-4">
      {/* Top Toolbar: Search + Rows Selector + Page Controls */}
      <TablePagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={filteredPayments.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[10, 25, 50, 100]}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari no. booking, pelanggan, metode..."
      />

      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs overflow-hidden">
        {/* Mobile View: Cards */}
        <div className="md:hidden divide-y divide-[#e2e8f0]">
          {paginatedPayments.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#64748b]">
              Tidak ada riwayat pembayaran yang cocok dengan pencarian.
            </div>
          ) : (
            paginatedPayments.map((p) => {
              const booking = getBooking(p);
              const customer = getCustomer(p);

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPayment(p)}
                  className="p-4 space-y-2 text-xs cursor-pointer hover:bg-slate-50 active:bg-slate-100 transition"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-[#0051d5]">
                      Rp {Number(p.amount).toLocaleString("id-ID")}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                      {p.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#64748b]">
                    <span>Metode: <strong>{p.method}</strong></span>
                    <span>{new Date(p.paid_at).toLocaleDateString("id-ID")}</span>
                  </div>
                  {booking && (
                    <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                      <span className="text-[#0b1c30] font-medium">{customer?.name || "Pelanggan"}</span>
                      <span className="text-[#0051d5] font-semibold">
                        {booking.booking_number}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View: Table */}
        <table className="hidden md:table w-full text-left text-xs">
          <thead className="bg-[#f8f9ff] border-b border-[#e2e8f0] text-[#64748b] font-semibold">
            <tr>
              <th className="px-5 py-3">Tanggal &amp; Waktu</th>
              <th className="px-4 py-3">No. Booking</th>
              <th className="px-4 py-3">Pelanggan</th>
              <th className="px-4 py-3">Metode</th>
              <th className="px-4 py-3">Bukti / Referensi</th>
              <th className="px-4 py-3 text-right">Jumlah</th>
              <th className="px-4 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2e8f0] text-[#0b1c30]">
            {paginatedPayments.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-xs text-[#64748b]">
                  Tidak ada riwayat pembayaran yang cocok dengan pencarian.
                </td>
              </tr>
            ) : (
              paginatedPayments.map((p) => {
                const booking = getBooking(p);
                const customer = getCustomer(p);
                const hasPhotoProof = isImageReference(p.reference);

                return (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedPayment(p)}
                    className="hover:bg-slate-50/80 transition cursor-pointer"
                  >
                    <td className="px-5 py-3.5 text-[#64748b]">
                      {new Date(p.paid_at).toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-[#0051d5]">
                      {booking ? booking.booking_number : "-"}
                    </td>
                    <td className="px-4 py-3.5 font-medium">{customer?.name || "-"}</td>
                    <td className="px-4 py-3.5 font-semibold text-[#0b1c30]">{p.method}</td>
                    <td className="px-4 py-3.5 text-[#64748b]">
                      {hasPhotoProof ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#0051d5]">
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Foto Struk</span>
                        </span>
                      ) : (
                        p.reference || "-"
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-emerald-600">
                      Rp {Number(p.amount).toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pop-up Modal Detail Pembayaran */}
      {selectedPayment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSelectedPayment(null)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#e2e8f0] p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#0b1c30]">Tanda Terima Pembayaran</h2>
                  <p className="text-[11px] text-[#64748b]">
                    {new Date(selectedPayment.paid_at).toLocaleString("id-ID", {
                      dateStyle: "full",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Total Amount Box */}
            <div className="p-4 rounded-xl bg-[#f8f9ff] border border-[#e2e8f0] text-center space-y-1">
              <span className="text-xs text-[#64748b]">Nominal Diterima</span>
              <p className="text-2xl font-bold text-emerald-600">
                Rp {Number(selectedPayment.amount).toLocaleString("id-ID")}
              </p>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                <CheckCircle2 className="w-3 h-3" />
                <span>STATUS: {selectedPayment.status}</span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-[#64748b]">Metode Pembayaran</span>
                <span className="font-bold text-[#0b1c30]">{selectedPayment.method}</span>
              </div>

              {selectedBooking && (
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-[#64748b]">No. Invoice / Booking</span>
                  <span className="font-bold text-[#0051d5]">{selectedBooking.booking_number}</span>
                </div>
              )}

              {selectedCustomer && (
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-[#64748b]">Nama Pelanggan</span>
                  <span className="font-semibold text-[#0b1c30]">{selectedCustomer.name}</span>
                </div>
              )}

              {selectedCustomer?.phone && (
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-[#64748b]">Kontak / WA</span>
                  <span className="text-[#0b1c30]">{selectedCustomer.phone}</span>
                </div>
              )}
            </div>

            {/* Bukti Bayar / Foto Transfer */}
            {selectedPayment.reference && (
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-semibold text-[#0b1c30]">Bukti Pembayaran / Struk:</span>
                {isImageReference(selectedPayment.reference) ? (
                  <div className="rounded-xl overflow-hidden border border-[#e2e8f0] bg-slate-50">
                    <img
                      src={selectedPayment.reference}
                      alt="Bukti Transfer"
                      className="w-full max-h-56 object-contain bg-slate-100"
                    />
                    <a
                      href={selectedPayment.reference}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center py-2 text-[11px] font-semibold text-[#0051d5] hover:bg-slate-100 transition"
                    >
                      Buka Foto Ukuran Penuh &rarr;
                    </a>
                  </div>
                ) : (
                  <p className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs font-mono text-[#0b1c30]">
                    {selectedPayment.reference}
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                className="px-4 py-2 rounded-xl border border-[#e2e8f0] text-xs font-semibold text-[#64748b] hover:bg-slate-50 transition"
              >
                Tutup
              </button>

              {selectedBooking && (
                <Link
                  href={`/bookings/${selectedBooking.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0051d5] hover:bg-[#0041ab] text-white text-xs font-semibold shadow-xs transition"
                >
                  <span>Buka Invoice Booking</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
