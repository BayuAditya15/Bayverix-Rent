import { getCurrentBusinessOrRedirect } from "@/lib/auth/getCurrentBusiness";
import { createClient } from "@/lib/supabase/server";
import { CreditCard } from "lucide-react";
import { PaymentListWithModal } from "@/components/PaymentListWithModal";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const { businessId } = await getCurrentBusinessOrRedirect();
  const supabase = await createClient();

  const { data: payments } = await supabase
    .from("payments")
    .select(`
      id,
      amount,
      currency,
      method,
      status,
      reference,
      paid_at,
      bookings (
        id,
        booking_number,
        customers (
          name,
          phone
        )
      )
    `)
    .eq("business_id", businessId)
    .order("paid_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#0b1c30]">Riwayat Pembayaran</h1>
        <p className="text-xs sm:text-sm text-[#64748b] mt-0.5">
          Catatan transaksi masuk, uang muka (DP), dan pelunasan sewa (Klik untuk buka tanda terima)
        </p>
      </div>

      {(!payments || payments.length === 0) ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#e2e8f0] p-6 space-y-3">
          <div className="inline-flex p-3 rounded-full bg-[#eff4ff] text-[#0051d5]">
            <CreditCard className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#0b1c30]">Belum Ada Riwayat Pembayaran</h3>
          <p className="text-xs text-[#64748b] max-w-sm mx-auto">
            Pembayaran akan otomatis tercatat saat Anda mencatat uang muka atau pelunasan pada halaman booking.
          </p>
        </div>
      ) : (
        <PaymentListWithModal payments={payments as any} />
      )}
    </div>
  );
}

