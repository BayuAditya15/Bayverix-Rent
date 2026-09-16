"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function BillingCallbackPage() {
  const router = useRouter();
  const supabase = createClient();

  const [status, setStatus] = useState<"checking" | "success" | "timeout">("checking");
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    const maxAttempts = 15; // 15 * 2 seconds = 30 seconds

    const checkSubscription = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data: profile } = await supabase
          .from("users")
          .select("business_id")
          .eq("id", user.id)
          .single();

        if (!profile?.business_id) return;

        const { data: sub } = await supabase
          .from("subscriptions")
          .select("id, plan_type, is_active")
          .eq("business_id", profile.business_id)
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (sub && sub.plan_type !== "free") {
          setStatus("success");
          clearInterval(intervalId);
          setTimeout(() => {
            router.push("/dashboard");
          }, 2500);
          return;
        }

        setAttempts((prev) => {
          if (prev + 1 >= maxAttempts) {
            setStatus("timeout");
            clearInterval(intervalId);
          }
          return prev + 1;
        });
      } catch {
        // Keep checking
      }
    };

    // First check immediately
    checkSubscription();
    intervalId = setInterval(checkSubscription, 2000);

    return () => clearInterval(intervalId);
  }, [router, supabase]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#f8f9ff]">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6 sm:p-8 text-center">
        {status === "checking" && (
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#eff4ff] text-[#0051d5] mb-2">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
            <h1 className="text-xl font-bold text-[#0b1c30]">Memverifikasi Pembayaran...</h1>
            <p className="text-xs text-[#64748b]">
              Kami sedang mengonfirmasi pembayaran Anda dengan sistem billing. Halaman akan otomatis berpindah saat verifikasi selesai.
            </p>
            <div className="pt-2 text-xs text-[#64748b]">
              Pengecekan ke-{attempts} dari 15
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 mb-2">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-[#0b1c30]">Pembayaran Berhasil!</h1>
            <p className="text-xs text-[#64748b]">
              Paket langganan Anda telah berhasil diaktifkan. Anda sedang dialihkan ke dashboard...
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0051d5] text-white rounded-lg text-xs font-semibold"
              >
                Buka Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {status === "timeout" && (
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-50 text-amber-600 mb-2">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-[#0b1c30]">Pembayaran Masih Diproses</h1>
            <p className="text-xs text-[#64748b]">
              Pembayaran Anda mungkin membutuhkan waktu beberapa saat untuk disinkronkan oleh payment gateway.
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0051d5] text-white rounded-xl text-xs font-semibold w-full justify-center"
              >
                Kembali ke Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
