import Link from "next/link";
import { getCurrentBusinessOrRedirect } from "@/lib/auth/getCurrentBusiness";
import { createClient } from "@/lib/supabase/server";
import { Users, Plus, Search } from "lucide-react";
import { CustomerListWithPagination } from "@/components/CustomerListWithPagination";

export const dynamic = "force-dynamic";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { businessId } = await getCurrentBusinessOrRedirect();
  const supabase = await createClient();

  const params = await searchParams;
  const search = params?.search || "";

  let query = supabase
    .from("customers")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
  }

  const { data: customers } = await query;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0b1c30]">Daftar Pelanggan</h1>
          <p className="text-xs sm:text-sm text-[#64748b] mt-0.5">
            Kontak pelanggan, nomor WhatsApp, dan riwayat penyewa
          </p>
        </div>

        <Link
          href="/customers/new"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0051d5] hover:bg-[#0041ab] text-white text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pelanggan</span>
        </Link>
      </div>



      {/* Customers List */}
      {(!customers || customers.length === 0) ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#e2e8f0] p-6 space-y-3">
          <div className="inline-flex p-3 rounded-full bg-[#eff4ff] text-[#0051d5]">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#0b1c30]">Belum Ada Pelanggan</h3>
          <p className="text-xs text-[#64748b] max-w-sm mx-auto">
            Data pelanggan akan otomatis tersimpan saat Anda membuat booking atau menambahkannya secara manual.
          </p>
          <Link
            href="/customers/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0051d5] text-white text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pelanggan Baru</span>
          </Link>
        </div>
      ) : (
        <CustomerListWithPagination customers={customers as any} />
      )}
    </div>
  );
}
