import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/auth/getCurrentBusiness";

// GET /api/payments — List payments
export async function GET(request: Request) {
  const ctx = await getCurrentBusiness();
  if (!ctx || !ctx.businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const bookingId = searchParams.get("booking_id");

  const supabase = await createClient();
  let query = supabase
    .from("payments")
    .select(`
      *,
      bookings (
        id,
        booking_number,
        rental_total,
        customers (
          name
        )
      )
    `)
    .eq("business_id", ctx.businessId)
    .order("paid_at", { ascending: false });

  if (bookingId) {
    query = query.eq("booking_id", bookingId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// POST /api/payments — Record payment and recalculate booking balance
export async function POST(request: Request) {
  const ctx = await getCurrentBusiness();
  if (!ctx || !ctx.businessId || !ctx.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { booking_id, amount, method = "CASH", reference } = body;

    const paymentAmount = Number(amount);
    if (!booking_id || isNaN(paymentAmount) || paymentAmount <= 0) {
      return NextResponse.json({ error: "Jumlah pembayaran harus lebih dari 0." }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Fetch booking to verify existence and ownership
    const { data: booking, error: bError } = await supabase
      .from("bookings")
      .select("id, rental_total, amount_paid, amount_due")
      .eq("id", booking_id)
      .eq("business_id", ctx.businessId)
      .single();

    if (bError || !booking) {
      return NextResponse.json({ error: "Booking tidak ditemukan." }, { status: 404 });
    }

    // 2. Insert Payment
    const { data: payment, error: pError } = await supabase
      .from("payments")
      .insert({
        business_id: ctx.businessId,
        booking_id,
        amount: paymentAmount,
        currency: "IDR",
        method: ["CASH", "TRANSFER", "QRIS", "EWALLET", "CARD", "OTHER"].includes(method) ? method : "CASH",
        status: "COMPLETED",
        reference: reference?.trim() || null,
        created_by: ctx.user.id,
      })
      .select()
      .single();

    if (pError || !payment) {
      return NextResponse.json({ error: pError?.message || "Gagal mencatat pembayaran" }, { status: 500 });
    }

    // 3. Update Booking Financial Balance
    const newAmountPaid = Number(booking.amount_paid || 0) + paymentAmount;
    const newAmountDue = Math.max(0, Number(booking.rental_total) - newAmountPaid);

    await supabase
      .from("bookings")
      .update({
        amount_paid: newAmountPaid,
        amount_due: newAmountDue,
      })
      .eq("id", booking_id);

    return NextResponse.json({ data: payment }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Format request tidak valid" }, { status: 400 });
  }
}
