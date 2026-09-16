import Link from "next/link";
import { getCurrentBusinessOrRedirect } from "@/lib/auth/getCurrentBusiness";
import { createClient } from "@/lib/supabase/server";
import { Package, Plus, Search } from "lucide-react";
import { ItemListWithPagination } from "@/components/ItemListWithPagination";

export const dynamic = "force-dynamic";

export default async function ItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>;
}) {
  const { businessId } = await getCurrentBusinessOrRedirect();
  const supabase = await createClient();

  const params = await searchParams;
  const search = params?.search || "";
  const categoryFilter = params?.category || "";

  // 1. Fetch categories for filter tabs
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("business_id", businessId)
    .order("name");

  // 2. Query items
  let query = supabase
    .from("rental_items")
    .select(`
      id,
      name,
      sku,
      price,
      price_unit,
      deposit_amount,
      total_quantity,
      status,
      image_url,
      categories (
        id,
        name
      )
    `)
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (categoryFilter) {
    query = query.eq("category_id", categoryFilter);
  }

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data: items } = await query;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0b1c30]">Inventaris Barang Rental</h1>
          <p className="text-xs sm:text-sm text-[#64748b] mt-0.5">
            Daftar unit peralatan yang tersedia untuk disewakan kepada pelanggan
          </p>
        </div>

        <Link
          href="/items/new"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0051d5] hover:bg-[#0041ab] text-white text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Barang Baru</span>
        </Link>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <Link
          href="/items"
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
            !categoryFilter
              ? "bg-[#0051d5] text-white"
              : "bg-white border border-[#e2e8f0] text-[#0b1c30] hover:bg-slate-50"
          }`}
        >
          Semua ({items?.length || 0})
        </Link>
        {categories?.map((cat) => (
          <Link
            key={cat.id}
            href={`/items?category=${cat.id}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              categoryFilter === cat.id
                ? "bg-[#0051d5] text-white"
                : "bg-white border border-[#e2e8f0] text-[#0b1c30] hover:bg-slate-50"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Items List */}
      {(!items || items.length === 0) ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#e2e8f0] p-6 space-y-3">
          <div className="inline-flex p-3 rounded-full bg-[#eff4ff] text-[#0051d5]">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#0b1c30]">Belum Ada Barang</h3>
          <p className="text-xs text-[#64748b] max-w-sm mx-auto">
            Mulai masukkan daftar barang rental Anda agar dapat dipilih saat pembuatan booking.
          </p>
          <Link
            href="/items/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0051d5] text-white text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Barang Sekarang</span>
          </Link>
        </div>
      ) : (
        <ItemListWithPagination items={items as any} />
      )}
    </div>
  );
}
