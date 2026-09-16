"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Package, Trash2, ImagePlus, X, Upload } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { uploadToSupabaseStorage } from "@/lib/supabase/storage";

interface Category {
  id: string;
  name: string;
}

export default function EditItemPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params?.id as string;
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [priceUnit, setPriceUnit] = useState("DAY");
  const [depositAmount, setDepositAmount] = useState("0");
  const [totalQuantity, setTotalQuantity] = useState("1");
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    async function loadItem() {
      try {
        const { data: catData } = await supabase
          .from("categories")
          .select("id, name")
          .eq("status", "ACTIVE")
          .order("name");
        if (catData) setCategories(catData);

        const { data, error } = await supabase
          .from("rental_items")
          .select("*")
          .eq("id", itemId)
          .single();

        if (error || !data) {
          toast.error("Barang tidak ditemukan.");
          router.push("/items");
          return;
        }

        setName(data.name || "");
        setCategoryId(data.category_id || "");
        setSku(data.sku || "");
        setDescription(data.description || "");
        setPrice(String(data.price || "0"));
        setPriceUnit(data.price_unit || "DAY");
        setDepositAmount(String(data.deposit_amount || "0"));
        setTotalQuantity(String(data.total_quantity || "1"));
        setImagePreview(data.image_url || null);
      } catch {
        toast.error("Gagal memuat data barang.");
      } finally {
        setInitialLoading(false);
      }
    }

    if (itemId) {
      loadItem();
    }
  }, [itemId, router, supabase]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran foto maksimal 5 MB.");
        return;
      }
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nama barang wajib diisi.");
      return;
    }

    setSaving(true);
    try {
      let finalImageUrl = imagePreview;

      // Upload new photo if changed
      if (selectedFile) {
        finalImageUrl = await uploadToSupabaseStorage(selectedFile, "items");
      }

      const { error: updateErr } = await supabase
        .from("rental_items")
        .update({
          name: name.trim(),
          category_id: categoryId || null,
          sku: sku.trim() || null,
          description: description.trim() || null,
          price: Number(price) || 0,
          price_unit: priceUnit,
          deposit_amount: Number(depositAmount) || 0,
          total_quantity: Number(totalQuantity) || 1,
          image_url: finalImageUrl,
        })
        .eq("id", itemId);

      if (updateErr) {
        toast.error("Gagal menyimpan perubahan: " + updateErr.message);
        return;
      }

      toast.success("Data barang berhasil diperbarui!");
      router.push("/items");
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Yakin ingin menghapus barang "${name}" dari inventaris?`)) {
      return;
    }

    setDeleting(true);
    try {
      const { error } = await supabase.from("rental_items").delete().eq("id", itemId);
      if (error) {
        toast.error("Gagal menghapus barang: " + error.message);
        return;
      }

      toast.success("Barang berhasil dihapus dari inventaris.");
      router.push("/items");
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan saat menghapus barang.");
    } finally {
      setDeleting(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-[#0051d5]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/items"
            className="p-2 rounded-xl border border-[#e2e8f0] bg-white hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-4 h-4 text-[#0b1c30]" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[#0b1c30]">Edit Data Barang</h1>
            <p className="text-xs text-[#64748b]">Perbarui tarif, stok, atau foto barang sewa</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition disabled:opacity-50"
        >
          {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          <span>Hapus</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Card: Informasi Utama */}
        <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-[#0b1c30] flex items-center gap-2">
            <Package className="w-4 h-4 text-[#0051d5]" />
            <span>Informasi Barang</span>
          </h2>

          <div>
            <label className="block text-xs font-medium text-[#0b1c30] mb-1">
              Nama Barang / Unit <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Tenda Dome 4P, Kamera Sony A7III..."
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#e2e8f0] bg-white focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#0b1c30] mb-1">Kategori</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-[#e2e8f0] bg-white focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5] outline-none"
              >
                <option value="">-- Pilih Kategori --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0b1c30] mb-1">Kode SKU / Kode Unik</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="Contoh: TND-001"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#e2e8f0] bg-white focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5] outline-none"
              />
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-xs font-medium text-[#0b1c30] mb-1">Foto Barang</label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {imagePreview ? (
              <div className="relative w-36 h-36 rounded-xl overflow-hidden border border-[#e2e8f0] bg-slate-50">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center w-full py-6 border-2 border-dashed border-[#e2e8f0] rounded-xl hover:border-[#0051d5]/50 hover:bg-slate-50/50 transition cursor-pointer"
              >
                <ImagePlus className="w-6 h-6 text-[#64748b] mb-1" />
                <span className="text-xs font-medium text-[#0051d5]">Unggah Foto Barang</span>
                <span className="text-[11px] text-[#64748b]">Format JPG, PNG (Maks 5MB)</span>
              </button>
            )}
          </div>
        </div>

        {/* Card: Tarif & Stok */}
        <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-[#0b1c30]">Tarif Sewa &amp; Stok</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#0b1c30] mb-1">
                Harga Sewa (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="50000"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#e2e8f0] bg-white focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0b1c30] mb-1">Satuan Waktu</label>
              <select
                value={priceUnit}
                onChange={(e) => setPriceUnit(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-[#e2e8f0] bg-white focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5] outline-none"
              >
                <option value="DAY">Per Hari (24 Jam)</option>
                <option value="HOUR">Per Jam</option>
                <option value="WEEK">Per Minggu</option>
                <option value="MONTH">Per Bulan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0b1c30] mb-1">
                Total Stok (Unit) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={totalQuantity}
                onChange={(e) => setTotalQuantity(e.target.value)}
                placeholder="1"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#e2e8f0] bg-white focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#0b1c30] mb-1">
              Deposit / Uang Jaminan (Opsional)
            </label>
            <input
              type="number"
              min="0"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="0"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#e2e8f0] bg-white focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5] outline-none"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/items"
            className="px-4 py-2.5 rounded-xl border border-[#e2e8f0] text-xs font-semibold text-[#0b1c30] hover:bg-slate-50 transition"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#0051d5] hover:bg-[#0041ab] text-white text-xs font-semibold shadow-xs transition disabled:opacity-50"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </form>
    </div>
  );
}
