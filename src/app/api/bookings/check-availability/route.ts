import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusinessId } from "@/lib/auth/getCurrentBusiness";

// POST /api/bookings/check-availability
export async function POST(request: Request) {
  const businessId = await getCurrentBusinessId();
  if (!businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { rental_item_id, start_at, end_at, exclude_booking_id } = body;

    if (!rental_item_id || !start_at || !end_at) {
      return NextResponse.json(
        { error: "Parameter rental_item_id, start_at, dan end_at wajib diisi." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: availableQty, error } = await (supabase.rpc as any)("get_available_quantity", {
      p_rental_item_id: rental_item_id,
      p_start_at: start_at,
      p_end_at: end_at,
      p_exclude_booking_id: exclude_booking_id || null,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      rental_item_id,
      available_quantity: typeof availableQty === "number" ? availableQty : 0,
    });
  } catch {
    return NextResponse.json({ error: "Format request tidak valid." }, { status: 400 });
  }
}
