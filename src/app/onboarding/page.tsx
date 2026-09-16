"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Store, Phone, MapPin, Loader2, ArrowRight } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!businessName.trim()) {
      toast.error("Nama toko/bisnis wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const { data: newBusinessId, error } = await (supabase.rpc as any)("complete_onboarding", {
        p_business_name: businessName.trim(),
        p_phone: phone.trim() || null,
        p_address: address.trim() || null,
      });

      if (error) {
        toast.error("Gagal menyelesaikan onboarding: " + error.message);
        return;
      }

      // Auto-generate clean slug for public store link
      if (newBusinessId) {
        const cleanSlug = businessName
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        await supabase
          .from("businesses")
          .update({ slug: cleanSlug || "store" })
          .eq("id", newBusinessId);
      }

      toast.success("Toko berhasil dibuat! Selamat datang di Bayverix-Rent.");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan jaringan atau server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-center items-center px-4 py-8 bg-[#f8f9ff]">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6 sm:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#eff4ff] text-[#0051d5] mb-3">
            <Store className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-[#0b1c30]">
            Siapkan Bisnis Rental Anda
          </h1>
          <p className="text-sm text-[#64748b] mt-1">
            Lengkapi data dasar toko Anda untuk mengaktifkan workspace rental dan paket Free.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" suppressHydrationWarning>
          <div>
            <label className="block text-xs font-medium text-[#0b1c30] mb-1">
              Nama Toko / Rental <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="cth. Berkah Outdoor Rental"
                suppressHydrationWarning
                className="w-full pl-3.5 pr-3.5 py-2.5 text-sm rounded-lg border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5]"
              />
            </div>
            <p className="text-xs text-[#64748b] mt-1">
              Nama ini akan muncul pada nota dan bukti sewa pelanggan.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#0b1c30] mb-1">
              Nomor WhatsApp Toko
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="cth. 08123456789"
                suppressHydrationWarning
                className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-lg border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5]"
              />
              <Phone className="w-4 h-4 text-[#64748b] absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#0b1c30] mb-1">
              Alamat Operasional Toko
            </label>
            <div className="relative">
              <textarea
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="cth. Jl. Merdeka No. 123, Bandung"
                suppressHydrationWarning
                className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-lg border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5]"
              />
              <MapPin className="w-4 h-4 text-[#64748b] absolute left-3 top-3" />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !businessName.trim()}
              suppressHydrationWarning
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0051d5] hover:bg-[#0041ab] text-white text-sm font-medium transition disabled:opacity-60 shadow-xs"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyiapkan Workspace...</span>
                </>
              ) : (
                <>
                  <span>Mulai Kelola Rental</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}