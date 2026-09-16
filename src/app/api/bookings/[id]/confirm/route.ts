import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/auth/getCurrentBusiness";

export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: Params) {
  const ctx = await getCurrentBusiness();
  if (!ctx || !ctx.businessId || !ctx.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Booking ID tidak valid." }, { status: 400 });
  }

  const supabase = await createClient();

  // 1. Fetch booking with its existing payments
  const { data: booking, error: bError } = await supabase
    .from("bookings")
    .select(`
      id,
      booking_number,
      rental_total,
      amount_paid,
      amount_due,
      status,
      notes,
      payments (
        id,
        amount,
        method,
        status,
        reference
      )
    `)
    .eq("id", id)
    .eq("business_id", ctx.businessId)
    .single();

  if (bError || !booking) {
    return NextResponse.json({ error: "Booking tidak ditemukan." }, { status: 404 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const {
      settlement_type = "AUTO_DETECT", // "AUTO_TRANSFER" | "PAY_AT_STORE" | "CONFIRM_UNPAID" | "AUTO_DETECT"
      payment_method = "CASH",
      payment_amount,
      new_status = "CONFIRMED", // "CONFIRMED" | "ONGOING"
    } = body;

    const rentalTotal = Number(booking.rental_total || 0);
    const existingPayments = (booking as any).payments || [];
    const pendingTransfer = existingPayments.find(
      (p: any) => p.method === "TRANSFER" && p.status === "PENDING"
    );

    const isTransferBooking =
      Boolean(pendingTransfer) ||
      booking.notes?.toLowerCase().includes("transfer") ||
      settlement_type === "AUTO_TRANSFER";

    // ── KASUS 1: Auto-verifikasi Transfer Bank ──
    if (settlement_type === "AUTO_TRANSFER" || (settlement_type === "AUTO_DETECT" && isTransferBooking)) {
      // Mark any pending transfer payment as COMPLETED
      if (pendingTransfer) {
        await supabase
          .from("payments")
          .update({
            status: "COMPLETED",
            paid_at: new Date().toISOString(),
          })
          .eq("id", pendingTransfer.id);
      } else {
        // Insert completed transfer payment record if not yet recorded
        await supabase.from("payments").insert({
          business_id: ctx.businessId,
          booking_id: booking.id,
          amount: rentalTotal,
          currency: "IDR",
          method: "TRANSFER",
          status: "COMPLETED",
          reference: "Verifikasi Transfer Otomatis",
          created_by: ctx.user.id,
          paid_at: new Date().toISOString(),
        });
      }

      // Update booking to CONFIRMED and fully paid
      await supabase
        .from("bookings")
        .update({
          status: new_status,
          amount_paid: rentalTotal,
          amount_due: 0,
        })
        .eq("id", booking.id);

      return NextResponse.json({
        success: true,
        message: `Booking #${booking.booking_number} berhasil dikonfirmasi dan pembayaran transfer lunas diverifikasi.`,
        is_paid: true,
      });
    }

    // ── KASUS 2: Bayar di Toko / Tempat (Pelunasan Tunai/QRIS/Transfer di Tempat) ──
    if (settlement_type === "PAY_AT_STORE") {
      const amountToPay = Number(payment_amount) || Number(booking.amount_due) || rentalTotal;
      const validMethod = ["CASH", "TRANSFER", "QRIS", "CARD", "EWALLET"].includes(payment_method)
        ? payment_method
        : "CASH";

      if (amountToPay > 0) {
        await supabase.from("payments").insert({
          business_id: ctx.businessId,
          booking_id: booking.id,
          amount: amountToPay,
          currency: "IDR",
          method: validMethod,
          status: "COMPLETED",
          reference: `Pembayaran di Toko (${validMethod})`,
          created_by: ctx.user.id,
          paid_at: new Date().toISOString(),
        });
      }

      const newAmountPaid = Number(booking.amount_paid || 0) + amountToPay;
      const newAmountDue = Math.max(0, rentalTotal - newAmountPaid);

      await supabase
        .from("bookings")
        .update({
          status: new_status,
          amount_paid: newAmountPaid,
          amount_due: newAmountDue,
        })
        .eq("id", booking.id);

      return NextResponse.json({
        success: true,
        message: `Booking #${booking.booking_number} berhasil dikonfirmasi dan pembayaran ${validMethod} Rp ${amountToPay.toLocaleString("id-ID")} berhasil dicatat.`,
        is_paid: newAmountDue === 0,
      });
    }

    // ── KASUS 3: Konfirmasi Saja (Belum Dibayar / Bayar Nanti saat Pickup) ──
    await supabase
      .from("bookings")
      .update({
        status: new_status,
      })
      .eq("id", booking.id);

    return NextResponse.json({
      success: true,
      message: `Booking #${booking.booking_number} berhasil dikonfirmasi (Status: ${new_status}).`,
      is_paid: Number(booking.amount_due) <= 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal mengonfirmasi booking." },
      { status: 500 }
    );
  }
}
