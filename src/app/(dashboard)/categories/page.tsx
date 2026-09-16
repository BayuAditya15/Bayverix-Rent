"use client";

import { useEffect, useState } from "react";
import { FolderTree, Plus, Loader2, Edit3, Trash2, X, Package, Search } from "lucide-react";
import { toast } from "sonner";
import { TablePagination } from "@/components/TablePagination";

interface Category {
  id: string;
  name: string;
  description: string | null;
  status: string;
  created_at: string;
  item_count?: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [creating, setCreating] = useState(false);

  // Edit Modal State
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/categories");
      const json = await res.json();
      if (json.data) {
        setCategories(json.data);
      }
    } catch {
      toast.error("Gagal memuat daftar kategori.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) return;

    setCreating(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: createName, description: createDesc }),
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Gagal membuat kategori.");
        return;
      }

      toast.success("Kategori baru berhasil ditambahkan!");
      setCreateName("");
      setCreateDesc("");
      setShowCreateModal(false);
      fetchCategories();
    } catch {
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setCreating(false);
    }
  };

  const handleOpenEdit = (c: Category) => {
    setEditingCategory(c);
    setEditName(c.name);
    setEditDesc(c.description || "");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editName.trim()) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/categories/${editingCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, description: editDesc }),
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Gagal memperbarui kategori.");
        return;
      }

      toast.success("Kategori berhasil diperbarui!");
      setEditingCategory(null);
      fetchCategories();
    } catch {
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingCategory) return;
    if (!confirm(`Yakin ingin menghapus kategori "${editingCategory.name}"?`)) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/categories/${editingCategory.id}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Gagal menghapus kategori.");
        return;
      }

      toast.success("Kategori berhasil dihapus!");
      setEditingCategory(null);
      fetchCategories();
    } catch {
      toast.error("Terjadi kesalahan sistem saat menghapus.");
    } finally {
      setDeleting(false);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedCategories = filteredCategories.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0b1c30]">Kategori Barang</h1>
          <p className="text-xs sm:text-sm text-[#64748b] mt-0.5">
            Kelola pengelompokan barang sewa (Klik pada kartu untuk edit / hapus kategori)
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0051d5] hover:bg-[#0041ab] text-white text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kategori</span>
        </button>
      </div>

      {/* Top Toolbar: Live Search + Rows Selector + Page Navigation */}
      <TablePagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={filteredCategories.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[10, 25, 50, 100]}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari kategori..."
      />

      {loading ? (
        <div className="flex justify-center items-center py-20 text-[#64748b]">
          <Loader2 className="w-6 h-6 animate-spin text-[#0051d5]" />
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#e2e8f0] p-6 space-y-3">
          <div className="inline-flex p-3 rounded-full bg-[#eff4ff] text-[#0051d5]">
            <FolderTree className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#0b1c30]">
            {search ? "Kategori Tidak Ditemukan" : "Belum Ada Kategori"}
          </h3>
          <p className="text-xs text-[#64748b] max-w-sm mx-auto">
            {search
              ? `Tidak ada kategori yang cocok dengan pencarian "${search}".`
              : "Buat kategori pertama Anda untuk mengelompokkan inventaris sewa."}
          </p>
          {!search && (
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0051d5] text-white text-xs font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kategori Sekarang</span>
            </button>
          )}
        </div>
      ) : (
        /* Clickable Category Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedCategories.map((c) => (
            <div
              key={c.id}
              onClick={() => handleOpenEdit(c)}
              className="group p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-3 hover:border-[#0051d5] hover:shadow-md transition cursor-pointer active:scale-[0.99]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#eff4ff] text-[#0051d5] group-hover:bg-[#0051d5] group-hover:text-white transition">
                    <FolderTree className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-[#0b1c30] group-hover:text-[#0051d5] transition">
                    {c.name}
                  </h3>
                </div>
                <span className="p-1.5 rounded-lg text-[#64748b] group-hover:text-[#0051d5] group-hover:bg-slate-50 transition">
                  <Edit3 className="w-3.5 h-3.5" />
                </span>
              </div>

              <p className="text-xs text-[#64748b] line-clamp-2 min-h-[32px]">
                {c.description || "Tidak ada deskripsi tambahan."}
              </p>

              <div className="flex justify-between items-center text-[11px] pt-2 border-t border-slate-100 text-[#64748b]">
                <span>Status: <strong className="text-emerald-600">Aktif</strong></span>
                <span className="font-semibold text-[#0051d5] group-hover:underline">
                  Klik untuk edit &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tambah Kategori */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#e2e8f0] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#0b1c30]">Tambah Kategori Baru</h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#0b1c30] mb-1">
                  Nama Kategori <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="cth. Peralatan Camping, Kamera, Sound System..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#e2e8f0] focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0b1c30] mb-1">
                  Deskripsi Singkat (Opsional)
                </label>
                <textarea
                  rows={3}
                  value={createDesc}
                  onChange={(e) => setCreateDesc(e.target.value)}
                  placeholder="cth. Tenda, matras, kompor portabel, flysheet..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#e2e8f0] focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#e2e8f0] text-xs font-medium text-[#64748b] hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={creating || !createName.trim()}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0051d5] text-white text-xs font-semibold hover:bg-[#0041ab] transition disabled:opacity-50"
                >
                  {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Simpan Kategori</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit / Hapus Kategori */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#e2e8f0] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#0b1c30]">Edit Data Kategori</h2>
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#0b1c30] mb-1">
                  Nama Kategori <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#e2e8f0] focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0b1c30] mb-1">
                  Deskripsi Singkat (Opsional)
                </label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#e2e8f0] focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5] outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition disabled:opacity-50"
                >
                  {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  <span>Hapus</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingCategory(null)}
                    className="px-4 py-2.5 rounded-xl border border-[#e2e8f0] text-xs font-medium text-[#64748b] hover:bg-slate-50 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !editName.trim()}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0051d5] text-white text-xs font-semibold hover:bg-[#0041ab] transition disabled:opacity-50"
                  >
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Simpan</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
