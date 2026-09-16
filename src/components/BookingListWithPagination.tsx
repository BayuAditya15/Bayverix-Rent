"use client";

import { useState } from "react";
import { BookingQuickAction } from "@/components/BookingQuickAction";
import { TablePagination } from "@/components/TablePagination";
import { BookingDetailModal, type BookingDetailModalItem } from "@/components/BookingDetailModal";

interface BookingListWithPaginationProps {
  bookings: BookingDetailModalItem[];
  storeName?: string;
}

export function BookingListWithPagination({
  bookings,
  storeName = "Rental Store",
}: BookingListWithPaginationProps) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedBooking, setSelectedBooking] = useState<BookingDetailModalItem | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">PENDING</span>;
      case "CONFIRMED":
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-[#0051d5]">CONFIRMED</span>;
      case "ONGOING":
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-[#0051d5]">ONGOING</span>;
      case "COMPLETED":
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700">COMPLETED</span>;
      case "CANCELLED":
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-red-50 text-red-700">CANCELLED</span>;
      case "OVERDUE":
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700">OVERDUE</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const customer = Array.isArray(b.customers) ? b.customers[0] : b.customers;
    const q = search.toLowerCase().trim();
    if (!q) return true;

    return (
      b.booking_number.toLowerCase().includes(q) ||
      customer?.name?.toLowerCase().includes(q) ||
      (customer?.phone && customer.phone.toLowerCase().includes(q)) ||
      b.status.toLowerCase().includes(q)
    );
  });

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-4">
      {/* Top Toolbar: Search + Rows Selector + Page Controls */}
      <TablePagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={filteredBookings.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[10, 25, 50, 100]}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari no. booking atau nama pelanggan..."
      />

      {/* Mobile Card Layout (<768px) */}
      <div className="md:hidden space-y-3">
        {paginatedBookings.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-[#e2e8f0] text-xs text-[#64748b]">
            Tidak ada transaksi booking yang cocok dengan pencarian.
          </div>
        ) : (
          paginatedBookings.map((b) => {
            const customer = Array.isArray(b.customers) ? b.customers[0] : b.customers;
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
              <div
                key={b.id}
                onClick={() => setSelectedBooking(b)}
                className="p-4 rounded-xl bg-white border border-[#e2e8f0] shadow-xs space-y-3 cursor-pointer hover:border-[#0051d5] hover:shadow-sm transition active:scale-[0.99]"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-[#0051d5]">
                    {b.booking_number}
                  </span>
                  {getStatusBadge(b.status)}
                </div>

                <div>
                  <p className="text-xs font-bold text-[#0b1c30]">{customer?.name || "Pelanggan Umum"}</p>
                  <p className="text-[11px] text-[#64748b] mt-0.5">
                    {startDate} → {endDate}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs gap-2">
                  <div>
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

                  <BookingQuickAction
                    bookingId={b.id}
                    bookingNumber={b.booking_number}
                    currentStatus={b.status}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Table (>=768px) */}
      <div className="hidden md:block bg-white rounded-2xl border border-[#e2e8f0] shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#f8f9ff] border-b border-[#e2e8f0] text-[#64748b] font-semibold">
            <tr>
              <th className="px-5 py-3">No. Booking</th>
              <th className="px-4 py-3">Pelanggan</th>
              <th className="px-4 py-3">Periode Sewa</th>
              <th className="px-4 py-3">Total Sewa</th>
              <th className="px-4 py-3">Sisa Tagihan</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-right">Aksi Cepat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2e8f0] text-[#0b1c30]">
            {paginatedBookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-xs text-[#64748b]">
                  Tidak ada transaksi booking yang cocok dengan pencarian.
                </td>
              </tr>
            ) : (
              paginatedBookings.map((b) => {
                const customer = Array.isArray(b.customers) ? b.customers[0] : b.customers;
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
                  <tr
                    key={b.id}
                    onClick={() => setSelectedBooking(b)}
                    className="hover:bg-slate-50/80 transition cursor-pointer"
                  >
                    <td className="px-5 py-3.5 font-bold text-[#0051d5]">
                      {b.booking_number}
                    </td>
                    <td className="px-4 py-3.5 font-medium">{customer?.name || "-"}</td>
                    <td className="px-4 py-3.5 text-[#64748b]">
                      {startDate} → {endDate}
                    </td>
                    <td className="px-4 py-3.5 font-semibold">
                      Rp {Number(b.rental_total).toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3.5 font-medium">
                      {Number(b.amount_due) > 0 ? (
                        <span className="text-amber-600">
                          Rp {Number(b.amount_due).toLocaleString("id-ID")}
                        </span>
                      ) : (
                        <span className="text-emerald-600">Lunas</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">{getStatusBadge(b.status)}</td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex justify-end">
                        <BookingQuickAction
                          bookingId={b.id}
                          bookingNumber={b.booking_number}
                          currentStatus={b.status}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Instant Booking Detail Modal */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          storeName={storeName}
        />
      )}
    </div>
  );
}
