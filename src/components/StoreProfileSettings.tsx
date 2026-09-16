"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Store, Edit3, X, Loader2, Phone, MapPin, Globe, Check } from "lucide-react";
import { toast } from "sonner";

interface BusinessProfile {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  slug: string | null;
}

interface StoreProfileSettingsProps {
  business: BusinessProfile;
  userEmail: string;
}

export function StoreProfileSettings({ business, userEmail }: StoreProfileSettingsProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // Form states
  const [name, setName] = useState(business.name);
  const [phone, setPhone] = useState(business.phone || "");
  const [address, setAddress] = useState(business.address || "");
  const [loading, setLoading] = useState(false);

  const handleOpen = () => {
    setName(business.name);
    setPhone(business.phone || "");
    setAddress(business.address || "");
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nama toko wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/business", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim() || null,
          address: address.trim() || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Gagal memperbarui profil toko.");
        return;
      }

      toast.success("Profil toko berhasil disimpan!");
      setIsOpen(false);
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan koneksi saat menyimpan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="p-5 sm:p-7 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-[#0051d5]" />
            <h2 className="text-sm font-bold text-[#0b1c30]">Profil Toko</h2>
          </div>

          <button
            type="button"
            onClick={handleOpen}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e2e8f0] text-xs font-semibold text-[#0051d5] hover:bg-slate-50 transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Data Toko</span>
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-[#64748b] mb-1">Nama Toko / Rental:</label>
            <p className="font-bold text-[#0b1c30] text-sm">{business.name}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-[#64748b] mb-1">Nomor WhatsApp Operasional:</label>
              <p className="font-medium text-[#0b1c30] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{business.phone || "Belum diatur"}</span>
              </p>
            </div>
            <div>
              <label className="block text-[#64748b] mb-1">Email Toko / Akun:</label>
              <p className="font-medium text-[#0b1c30]">{business.email || userEmail}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-[#64748b] mb-1">Tautan Publik (Slug):</label>
              <p className="font-mono text-[11px] text-[#0051d5] font-semibold flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>/book/{business.slug}</span>
              </p>
            </div>
            <div>
              <label className="block text-[#64748b] mb-1">Alamat Toko:</label>
              <p className="font-medium text-[#0b1c30] flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{business.address || "Belum diatur"}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#e2e8f0] p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#eff4ff] text-[#0051d5]">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#0b1c30]">Edit Informasi Toko</h2>
                  <p className="text-[11px] text-[#64748b]">
                    Perbarui nama, kontak, dan alamat yang tercantum pada nota sewa
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[#0b1c30] mb-1">
                  Nama Toko / Rental <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="cth. Berkah Outdoor Rental"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5] outline-none"
                />
                <p className="text-[11px] text-[#64748b] mt-1">
                  Nama ini akan muncul pada header nota, faktur invoice, dan halaman katalog publik.
                </p>
              </div>

              <div>
                <label className="block font-medium text-[#0b1c30] mb-1">
                  Nomor WhatsApp Operasional
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="cth. 081234567890"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5] outline-none"
                />
                <p className="text-[11px] text-[#64748b] mt-1">
                  Digunakan untuk menerima konfirmasi booking otomatis dari pelanggan.
                </p>
              </div>



              <div>
                <label className="block font-medium text-[#0b1c30] mb-1">
                  Alamat Operasional Toko
                </label>
                <textarea
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="cth. Jl. Merdeka No. 123, Bandung, Jawa Barat"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5] outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#e2e8f0] text-xs font-semibold text-[#64748b] hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading || !name.trim()}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0051d5] hover:bg-[#0041ab] text-white text-xs font-semibold transition disabled:opacity-50 shadow-xs"
                >
                  {loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
