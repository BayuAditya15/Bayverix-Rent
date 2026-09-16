"use client";

import { useState } from "react";
import { Phone, Users } from "lucide-react";
import { ClickableCard, ClickableRow } from "@/components/ClickableRow";
import { WhatsAppChatButton } from "@/components/WhatsAppChatButton";
import { TablePagination } from "@/components/TablePagination";

export interface CustomerListItem {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  created_at: string;
}

interface CustomerListWithPaginationProps {
  customers: CustomerListItem[];
}

export function CustomerListWithPagination({ customers }: CustomerListWithPaginationProps) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredCustomers = customers.filter((c) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;

    return (
      c.name.toLowerCase().includes(q) ||
      (c.phone && c.phone.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.notes && c.notes.toLowerCase().includes(q))
    );
  });

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-4">
      {/* Top Toolbar: Live Search + Rows Selector + Page Navigation */}
      <TablePagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={filteredCustomers.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[10, 25, 50, 100]}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nama, no. telp, email, atau catatan..."
      />

      {/* Mobile Card List */}
      <div className="md:hidden space-y-3">
        {paginatedCustomers.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-[#e2e8f0] text-xs text-[#64748b]">
            Tidak ada pelanggan yang cocok dengan pencarian.
          </div>
        ) : (
          paginatedCustomers.map((c) => (
            <ClickableCard
              key={c.id}
              href={`/customers/${c.id}`}
              className="p-4 rounded-xl bg-white border border-[#e2e8f0] shadow-xs space-y-2"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-xs font-bold text-[#0b1c30]">{c.name}</h3>
                {c.phone && <WhatsAppChatButton phone={c.phone} size="sm" />}
              </div>
              <p className="text-xs text-[#64748b] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{c.phone || "Tidak ada nomor"}</span>
              </p>
              {c.email && (
                <p className="text-[11px] text-[#64748b]">{c.email}</p>
              )}
              {c.notes && (
                <p className="text-[11px] text-[#64748b] pt-1 border-t border-slate-100">
                  Catatan: {c.notes}
                </p>
              )}
            </ClickableCard>
          ))
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-2xl border border-[#e2e8f0] shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#f8f9ff] border-b border-[#e2e8f0] text-[#64748b] font-semibold">
            <tr>
              <th className="px-5 py-3">Nama Pelanggan</th>
              <th className="px-4 py-3">Nomor Telepon</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Catatan</th>
              <th className="px-4 py-3 text-right">Kontak</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2e8f0] text-[#0b1c30]">
            {paginatedCustomers.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-xs text-[#64748b]">
                  Tidak ada pelanggan yang cocok dengan pencarian.
                </td>
              </tr>
            ) : (
              paginatedCustomers.map((c) => (
                <ClickableRow
                  key={c.id}
                  href={`/customers/${c.id}`}
                >
                  <td className="px-5 py-3.5 font-bold text-[#0051d5]">{c.name}</td>
                  <td className="px-4 py-3.5 text-[#0b1c30]">{c.phone || "-"}</td>
                  <td className="px-4 py-3.5 text-[#64748b]">{c.email || "-"}</td>
                  <td className="px-4 py-3.5 text-[#64748b]">{c.notes || "-"}</td>
                  <td className="px-4 py-3.5 text-right">
                    {c.phone && <WhatsAppChatButton phone={c.phone} size="md" />}
                  </td>
                </ClickableRow>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
