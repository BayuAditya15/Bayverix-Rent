"use client";

import { useState } from "react";
import { Package } from "lucide-react";
import { ClickableCard, ClickableRow } from "@/components/ClickableRow";
import { TablePagination } from "@/components/TablePagination";

export interface ItemListItem {
  id: string;
  name: string;
  sku: string | null;
  price: number | string;
  price_unit: string;
  deposit_amount: number | string;
  total_quantity: number;
  status: string;
  image_url: string | null;
  categories: {
    id: string;
    name: string;
  } | {
    id: string;
    name: string;
  }[] | null;
}

interface ItemListWithPaginationProps {
  items: ItemListItem[];
}

export function ItemListWithPagination({ items }: ItemListWithPaginationProps) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredItems = items.filter((item) => {
    const cat = Array.isArray(item.categories) ? item.categories[0] : item.categories;
    const q = search.toLowerCase().trim();
    if (!q) return true;

    return (
      item.name.toLowerCase().includes(q) ||
      (item.sku && item.sku.toLowerCase().includes(q)) ||
      (cat?.name && cat.name.toLowerCase().includes(q)) ||
      item.status.toLowerCase().includes(q)
    );
  });

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-4">
      {/* Top Toolbar: Live Search + Rows Selector + Page Navigation */}
      <TablePagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={filteredItems.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[10, 25, 50, 100]}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nama barang, SKU, atau kategori..."
      />

      {/* Mobile Card List (<768px) */}
      <div className="md:hidden space-y-3">
        {paginatedItems.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-[#e2e8f0] text-xs text-[#64748b]">
            Tidak ada barang yang cocok dengan pencarian.
          </div>
        ) : (
          paginatedItems.map((item) => {
            const cat = Array.isArray(item.categories) ? item.categories[0] : item.categories;
            return (
              <ClickableCard
                key={item.id}
                href={`/items/${item.id}`}
                className="p-4 rounded-xl bg-white border border-[#e2e8f0] shadow-xs space-y-2"
              >
                <div className="flex gap-3">
                  {/* Item Photo / Icon Placeholder */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#eff4ff] border border-[#dce9ff] flex items-center justify-center shrink-0">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-6 h-6 text-[#0051d5]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-1">
                      <h3 className="text-xs font-bold text-[#0b1c30] truncate">{item.name}</h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 shrink-0">
                        {item.status}
                      </span>
                    </div>
                    {item.sku && (
                      <span className="text-[10px] text-[#64748b] block mt-0.5">SKU: {item.sku}</span>
                    )}
                    <p className="text-[11px] text-[#64748b] mt-0.5 truncate">
                      Kategori: {cat?.name || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100">
                  <span className="text-[#64748b]">
                    Stok: <strong className="text-[#0b1c30]">{item.total_quantity} Unit</strong>
                  </span>
                  <span className="font-bold text-[#0051d5]">
                    Rp {Number(item.price).toLocaleString("id-ID")}/{item.price_unit.toLowerCase()}
                  </span>
                </div>
              </ClickableCard>
            );
          })
        )}
      </div>

      {/* Desktop & Tablet Table (>=768px) */}
      <div className="hidden md:block bg-white rounded-2xl border border-[#e2e8f0] shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#f8f9ff] border-b border-[#e2e8f0] text-[#64748b] font-semibold">
            <tr>
              <th className="px-5 py-3">Barang / Unit</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Tarif Sewa</th>
              <th className="px-4 py-3">Jaminan (Deposit)</th>
              <th className="px-4 py-3 text-center">Total Unit</th>
              <th className="px-4 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2e8f0] text-[#0b1c30]">
            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-xs text-[#64748b]">
                  Tidak ada barang yang cocok dengan pencarian.
                </td>
              </tr>
            ) : (
              paginatedItems.map((item) => {
                const cat = Array.isArray(item.categories) ? item.categories[0] : item.categories;
                return (
                  <ClickableRow
                    key={item.id}
                    href={`/items/${item.id}`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#eff4ff] border border-[#dce9ff] flex items-center justify-center shrink-0">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-[#0051d5]" />
                          )}
                        </div>
                        <span className="font-medium text-[#0b1c30]">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[#64748b]">{item.sku || "-"}</td>
                    <td className="px-4 py-3.5 text-[#64748b]">{cat?.name || "-"}</td>
                    <td className="px-4 py-3.5 font-semibold text-[#0051d5]">
                      Rp {Number(item.price).toLocaleString("id-ID")} / {item.price_unit.toLowerCase()}
                    </td>
                    <td className="px-4 py-3.5 text-[#64748b]">
                      {Number(item.deposit_amount) > 0
                        ? `Rp ${Number(item.deposit_amount).toLocaleString("id-ID")}`
                        : "-"}
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold">{item.total_quantity}</td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                        {item.status}
                      </span>
                    </td>
                  </ClickableRow>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
