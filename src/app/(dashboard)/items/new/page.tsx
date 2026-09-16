"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, PackagePlus, AlertCircle, ImagePlus, X, Upload } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface Category {
  id: string;
  name: string;
}

export default function NewItemPage() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [priceUnit, setPriceUnit] = useState("DAY");
  const [depositAmount, setDepositAmount] = useState("");
  const [totalQuantity, setTotalQuantity] = useState("1");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [limitError, setLimitError] = useState<{ message: string; upgradeUrl?: string } | null>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setCategories(json.data);
      })
      .catch(() => {});
  }, []);

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

  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    try {
      setUploadingImage(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `items/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("rental-items")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.warn("Storage upload warning (using fallback without image):", uploadError.message);
        return null;
      }

      const { data } = supabase.storage.from("rental-items").getPublicUrl(filePath);
      return data.publicUrl || null;
    } catch {
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) {
      toast.error("Nama barang dan tarif sewa wajib diisi.");
      return;
    }

    setLoading(true);
    setLimitError(null);

    try {
      let finalImageUrl: string | null = null;
      if (selectedFile) {
        finalImageUrl = await uploadImageToSupabase(selectedFile);
      }

      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category_id: categoryId || null,
          sku: sku.trim() || null,
          description: description.trim() || null,
          image_url: finalImageUrl,
          price: Number(price),
          price_unit: priceUnit,
          deposit_amount: depositAmount ? Number(depositAmount) : 0,
          total_quantity: Number(totalQuantity) || 1,
        }),
      });

      const json = await res.json();

      if (res.status === 402) {
        setLimitError({
          message: json.message || "Batas inventaris untuk paket Anda telah tercapai.",
          upgradeUrl: json.upgradeUrl,
        });
        toast.error("Kuota paket Free telah habis!");
        return;
      }

      if (!res.ok) {
        toast.error(json.error || "Gagal menambahkan barang.");
        return;
      }

      toast.success("Barang rental berhasil ditambahkan!");
      router.push("/items");
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-3">
        <Link
          href="/items"
          className="p-2 rounded-xl border border-[#e2e8f0] bg-white text-[#64748b] hover:text-[#0b1c30] hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0b1c30]">Tambah Barang Rental</h1>
          <p className="text-xs text-[#64748b]">Daftarkan unit peralatan baru ke dalam inventaris toko</p>
        </div>
      </div>

      {/* Limit Alert Warning if quota exceeded */}
      {limitError && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 space-y-2">
          <div className="flex items-center gap-2 font-bold text-xs">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Kuota Paket Tercapai</span>
          </div>
          <p className="text-xs">{limitError.message}</p>
          {limitError.upgradeUrl && (
            <a
              href={limitError.upgradeUrl}
              className="inline-block px-3 py-1.5 rounded-lg bg-[#0051d5] text-white text-xs font-semibold shadow-xs"
            >
              Upgrade ke Pro Sekarang
            </a>
          )}
        </div>
      )}

      {/* Form Container */}
      <div className="p-5 sm:p-7 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Optional Photo Upload */}
          <div>
            <label className="block text-xs font-medium text-[#0b1c30] mb-1">
              Foto Barang / Unit (Opsional)
            </label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-[#e2e8f0] bg-slate-50 shrink-0">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-black/80 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-2xl border-2 border-dashed border-[#e2e8f0] hover:border-[#0051d5] hover:bg-[#eff4ff]/40 flex flex-col items-center justify-center text-center p-2 text-[#64748b] hover:text-[#0051d5] transition shrink-0"
                >
                  <ImagePlus className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-semibold">Pilih Foto</span>
                </button>
              )}

              <div className="text-xs text-[#64748b]">
                <p className="font-medium text-[#0b1c30]">Unggah foto unit</p>
                <p className="text-[11px] mt-0.5">Format JPG, PNG, atau WebP. Maks 5MB. Memudahkan identifikasi saat serah-terima.</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#0b1c30] mb-1">
              Nama Barang / Unit <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="cth. Tenda Dome 4 Orang Waterproof"
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#0b1c30] mb-1">
                Kategori
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#e2e8f0] bg-white focus:outline-none focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5]"
              >
                <option value="">Pilih Kategori (Opsional)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0b1c30] mb-1">
                Kode SKU / Barcode (Opsional)
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="cth. TND-001"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#0b1c30] mb-1">
                Tarif Sewa (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="cth. 50000"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0b1c30] mb-1">
                Satuan Durasi
              </label>
              <select
                value={priceUnit}
                onChange={(e) => setPriceUnit(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#e2e8f0] bg-white focus:outline-none focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5]"
              >
                <option value="HOUR">Per Jam</option>
                <option value="DAY">Per Hari</option>
                <option value="WEEK">Per Minggu</option>
                <option value="MONTH">Per Bulan</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#0b1c30] mb-1">
                Deposit Jaminan (Rp, Opsional)
              </label>
              <input
                type="number"
                min={0}
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="cth. 100000"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0b1c30] mb-1">
                Total Stok Fisik <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                value={totalQuantity}
                onChange={(e) => setTotalQuantity(e.target.value)}
                placeholder="cth. 5"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#0b1c30] mb-1">
              Catatan / Kondisi Barang (Opsional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="cth. Lengkap dengan pasak dan frame cadangan."
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <Link
              href="/items"
              className="px-4 py-2.5 rounded-xl border border-[#e2e8f0] text-xs font-medium text-[#64748b] hover:bg-slate-50"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0051d5] hover:bg-[#0041ab] text-white text-xs font-semibold shadow-xs transition disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{uploadingImage ? "Mengunggah Foto..." : "Menyimpan..."}</span>
                </>
              ) : (
                <>
                  <PackagePlus className="w-4 h-4" />
                  <span>Simpan Barang</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
