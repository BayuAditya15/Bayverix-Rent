"use client";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";

interface TablePaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  className?: string;
}

export function TablePagination({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  searchValue,
  onSearchChange,
  searchPlaceholder = "Cari data...",
  className = "",
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const fromIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const toIndex = Math.min(totalItems, currentPage * pageSize);

  return (
    <div
      className={`flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 sm:p-3.5 rounded-2xl border border-[#e2e8f0] shadow-xs text-xs text-[#64748b] ${className}`}
    >
      {/* Left: Search input (if provided) */}
      {onSearchChange !== undefined && (
        <div className="relative flex-1 max-w-xs w-full">
          <input
            type="text"
            value={searchValue || ""}
            onChange={(e) => {
              onSearchChange(e.target.value);
              onPageChange(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#e2e8f0] bg-white focus:outline-none focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5]"
          />
          <Search className="w-4 h-4 text-[#64748b] absolute left-3 top-2.5" />
        </div>
      )}

      {/* Center & Right: Rows per page selector & Pagination controls */}
      <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 w-full md:w-auto">
        {/* Rows per page selector & summary */}
        <div className="flex items-center gap-2">
          <span>Tampilkan:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
              onPageChange(1);
            }}
            className="px-2 py-1.5 rounded-xl border border-[#e2e8f0] bg-white text-xs font-semibold text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5]"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt} baris
              </option>
            ))}
          </select>

          <span className="text-[11px] text-[#64748b] hidden sm:inline">
            ({fromIndex}-{toIndex} dari {totalItems})
          </span>
        </div>

        {/* Page Navigation */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="inline-flex items-center justify-center p-1.5 rounded-xl border border-[#e2e8f0] hover:bg-slate-50 text-[#0b1c30] disabled:opacity-40 disabled:pointer-events-none transition"
            title="Halaman sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0b1c30]">
            {currentPage} / {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="inline-flex items-center justify-center p-1.5 rounded-xl border border-[#e2e8f0] hover:bg-slate-50 text-[#0b1c30] disabled:opacity-40 disabled:pointer-events-none transition"
            title="Halaman berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
