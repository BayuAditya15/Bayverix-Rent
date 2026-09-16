"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, UserPlus, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function NewCustomerPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [limitError, setLimitError] = useState<{ message: string; upgradeUrl?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nama pelanggan wajib diisi.");
      return;
    }

    setLoading(true);
    setLimitError(null);

    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim() || null,
          email: email.trim() || null,
          notes: notes.trim() || null,
        }),
      });

      const json = await res.json();

      if (res.status === 402) {
        setLimitError({
          message: json.message || "Batas pelanggan untuk paket Anda telah tercapai.",
          upgradeUrl: json.upgradeUrl,
        });
        toast.error("Kuota pelanggan telah habis!");
        return;
      }

      if (!res.ok) {
        toast.error(json.error || "Gagal menambahkan pelanggan.");
        return;
      }

      toast.success("Pelanggan berhasil ditambahkan!");
      router.push("/customers");
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/customers"
          className="p-2 rounded-xl border border-[#e2e8f0] bg-white text-[#64748b] hover:text-[#0b1c30] hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0b1c30]">Tambah Pelanggan</h1>
          <p className="text-xs text-[#64748b]">Simpan data penyewa baru ke dalam database toko</p>
        </div>
      </div>

      {limitError && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 space-y-2">
          <div className="flex items-center gap-2 font-bold text-xs">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Batas Kuota Pelanggan</span>
          </div>
          <p className="text-xs">{limitError.message}</p>
          {limitError.upgradeUrl && (
            <a
              href={limitError.upgradeUrl}
              className="inline-block px-3 py-1.5 rounded-lg bg-[#0051d5] text-white text-xs font-semibold shadow-xs"
            >
              Upgrade Paket
            </a>
          )}
        </div>
      )}

      <div className="p-5 sm:p-7 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#0b1c30] mb-1">
              Nama Lengkap Pelanggan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="cth. Budi Santoso"
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#0b1c30] mb-1">
              Nomor WhatsApp / HP
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="cth. 08123456789"
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#0b1c30] mb-1">
              Email (Opsional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cth. budi@gmail.com"
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#0b1c30] mb-1">
              Catatan Khusus (No KTP, Alamat, dll.)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="cth. Jaminan KTP Asli dititipkan di kasir."
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <Link
              href="/customers"
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
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Simpan Pelanggan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
