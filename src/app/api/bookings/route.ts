import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/auth/getCurrentBusiness";
import { canAddBooking } from "@/lib/billing/checkLimit";

// GET /api/bookings — List bookings
export async function GET(request: Request) {
  const ctx = await getCurrentBusiness();
  if (!ctx || !ctx.businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const customerId = searchParams.get("customer_id");

  const supabase = await createClient();
  let query = supabase
    .from("bookings")
    .select(`
      *,
      customers (
        id,
        name,
        phone
      ),
      booking_items (
        id,
        rental_item_id,
        item_name_snapshot,
        unit_price,
        quantity,
        subtotal
      )
    `)
    .eq("business_id", ctx.businessId)
    .order("start_at", { ascending: false });

  if (status) {
    query = query.eq("status", status as any);
  }

  if (customerId) {
    query = query.eq("customer_id", customerId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

interface BookingItemInput {
  rental_item_id: string;
  quantity: number;
  unit_price: number;
}

// POST /api/bookings — Create booking with stock check & limits
export async function POST(request: Request) {
  const ctx = await getCurrentBusiness();
  if (!ctx || !ctx.businessId || !ctx.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const businessId = ctx.businessId;
  const userId = ctx.user.id;

  // 1. Check Monthly Booking Limit
  const limit = await canAddBooking(businessId);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: "LIMIT_REACHED",
        message: limit.reason,
        upgradeUrl: limit.upgradeUrl,
      },
      { status: 402 }
    );
  }

  try {
    const body = await request.json();
    const {
      customer_id,
      customer_name,
      customer_phone,
      start_at,
      end_at,
      items,
      deposit_total = 0,
      notes,
      payment_amount = 0,
      payment_method = "CASH",
      payment_reference,
    }: {
      customer_id?: string;
      customer_name?: string;
      customer_phone?: string;
      start_at: string;
      end_at: string;
      items: BookingItemInput[];
      deposit_total?: number;
      notes?: string;
      payment_amount?: number;
      payment_method?: string;
      payment_reference?: string;
    } = body;

    if ((!customer_id && !customer_name?.trim()) || !start_at || !end_at || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Data booking tidak lengkap. Pastikan nama pelanggan, tanggal, dan minimal 1 barang terisi." },
        { status: 400 }
      );
    }

    if (new Date(end_at).getTime() <= new Date(start_at).getTime()) {
      return NextResponse.json(
        { error: "Waktu selesai sewa harus lebih lama dari waktu mulai." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 2. Resolve or Create Customer
    let finalCustomerId = customer_id;

    if (!finalCustomerId && customer_name?.trim()) {
      const cleanPhone = customer_phone?.trim() || null;

      // Check existing by phone if phone is provided
      if (cleanPhone) {
        const { data: existingByPhone } = await supabase
          .from("customers")
          .select("id")
          .eq("business_id", businessId)
          .eq("phone", cleanPhone)
          .maybeSingle();

        if (existingByPhone) {
          finalCustomerId = existingByPhone.id;
        }
      }

      // If still not found, create new customer
      if (!finalCustomerId) {
        const { data: newCust, error: newCustErr } = await supabase
          .from("customers")
          .insert({
            business_id: businessId,
            name: customer_name.trim(),
            phone: cleanPhone,
          })
          .select("id")
          .single();

        if (newCustErr || !newCust) {
          return NextResponse.json(
            { error: "Gagal menyimpan data pelanggan baru: " + newCustErr?.message },
            { status: 500 }
          );
        }
        finalCustomerId = newCust.id;
      }
    }

    // 3. Validate stock availability for each item via PostgreSQL function
    const itemIds = items.map((i) => i.rental_item_id);
    const { data: dbItems, error: itemsFetchError } = await supabase
      .from("rental_items")
      .select("id, name, price, total_quantity")
      .in("id", itemIds)
      .eq("business_id", businessId);

    if (itemsFetchError || !dbItems || dbItems.length !== items.length) {
      return NextResponse.json(
        { error: "Satu atau lebih barang tidak ditemukan pada toko Anda." },
        { status: 400 }
      );
    }

    // Verify all items available stock in parallel
    const stockResults = await Promise.all(
      items.map(async (reqItem) => {
        const { data: availableQty, error: availError } = await (supabase.rpc as any)("get_available_quantity", {
          p_rental_item_id: reqItem.rental_item_id,
          p_start_at: start_at,
          p_end_at: end_at,
        });

        if (availError) {
          throw new Error("Gagal memeriksa ketersediaan stok: " + availError.message);
        }

        const available = typeof availableQty === "number" ? availableQty : 0;
        const matchedDb = dbItems.find((d) => d.id === reqItem.rental_item_id);

        return {
          reqItem,
          matchedDb,
          available,
          isAvailable: reqItem.quantity <= available,
        };
      })
    );

    const unavailable = stockResults.find((s) => !s.isAvailable);
    if (unavailable) {
      return NextResponse.json(
        {
          error: "STOCK_UNAVAILABLE",
          message: `Stok barang "${unavailable.matchedDb?.name || 'Item'}" tidak mencukupi untuk tanggal tersebut. Sisa tersedia: ${unavailable.available} unit.`,
        },
        { status: 400 }
      );
    }

    // 3. Generate Booking Number
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingNumber = `INV-${year}-${randomSuffix}`;

    // 4. Calculate Financials on Server (Never trust frontend totals)
    const diffMs = new Date(end_at).getTime() - new Date(start_at).getTime();
    const durationDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    let rentalTotal = 0;
    const bookingItemsToInsert = items.map((reqItem) => {
      const dbItem = dbItems.find((d) => d.id === reqItem.rental_item_id)!;
      const unitPrice = Number(dbItem.price);
      const subtotal = unitPrice * reqItem.quantity * durationDays;
      rentalTotal += subtotal;

      return {
        rental_item_id: dbItem.id,
        item_name_snapshot: dbItem.name,
        unit_price: unitPrice,
        quantity: reqItem.quantity,
        subtotal: subtotal,
      };
    });

    const deposit = Number(deposit_total) || 0;
    const initialPaid = Math.max(0, Number(payment_amount) || 0);
    const amountDue = Math.max(0, rentalTotal - initialPaid);

    // 5. Insert Booking Header
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        business_id: businessId,
        customer_id: finalCustomerId!,
        booking_number: bookingNumber,
        start_at: start_at,
        end_at: end_at,
        rental_total: rentalTotal,
        deposit_total: deposit,
        amount_due: amountDue,
        amount_paid: initialPaid,
        currency: "IDR",
        status: "CONFIRMED",
        notes: notes?.trim() || null,
        created_by: userId,
      })
      .select()
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: bookingError?.message || "Gagal membuat booking" }, { status: 500 });
    }

    // 6. Insert Booking Items
    const itemsWithBookingId = bookingItemsToInsert.map((item) => ({
      ...item,
      booking_id: booking.id,
    }));

    const { error: itemsInsertError } = await supabase
      .from("booking_items")
      .insert(itemsWithBookingId);

    if (itemsInsertError) {
      // Rollback booking header if items failed
      await supabase.from("bookings").delete().eq("id", booking.id);
      return NextResponse.json({ error: itemsInsertError.message }, { status: 500 });
    }

    // 7. Insert Initial Payment record if payment_amount > 0
    if (initialPaid > 0) {
      const validMethods = ["CASH", "TRANSFER", "QRIS", "EWALLET", "CARD", "OTHER"];
      const finalMethod = validMethods.includes(payment_method) ? payment_method : "CASH";

      await supabase.from("payments").insert({
        business_id: businessId,
        booking_id: booking.id,
        amount: initialPaid,
        currency: "IDR",
        method: finalMethod as any,
        status: "COMPLETED",
        reference: payment_reference?.trim() || null,
        created_by: userId,
      });
    }

    return NextResponse.json({ data: booking }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Format request tidak valid" }, { status: 400 });
  }
}
