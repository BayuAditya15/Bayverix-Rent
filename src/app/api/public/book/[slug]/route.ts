import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface Params {
  params: Promise<{ slug: string }>;
}

// GET /api/public/book/[slug] — Fetch store info & public catalog with real-time stock
export async function GET(request: Request, { params }: Params) {
  const { slug } = await params;
  if (!slug) {
    return NextResponse.json({ error: "Slug toko tidak valid." }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const startAtParam = searchParams.get("start_at");
  const endAtParam = searchParams.get("end_at");

  const supabase = createAdminClient();

  // 1. Fetch Business by slug (or fallback by name)
  let { data: business } = await supabase
    .from("businesses")
    .select("id, name, slug, phone, email, address, logo_url")
    .eq("slug", slug.toLowerCase())
    .maybeSingle();

  // If not found by slug, try matching case-insensitive by name
  if (!business) {
    const { data: byName } = await supabase
      .from("businesses")
      .select("id, name, slug, phone, email, address, logo_url")
      .ilike("name", slug)
      .maybeSingle();

    if (byName) {
      business = byName;
      if (!business.slug) {
        const generatedSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        await supabase
          .from("businesses")
          .update({ slug: generatedSlug })
          .eq("id", business.id);
        business.slug = generatedSlug;
      }
    }
  }

  if (!business) {
    return NextResponse.json({ error: "Toko tidak ditemukan." }, { status: 404 });
  }

  // 2. Fetch Active Categories
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("business_id", business.id)
    .eq("status", "ACTIVE")
    .order("name", { ascending: true });

  // 3. Fetch Active Rental Items
  const { data: items } = await supabase
    .from("rental_items")
    .select(`
      id,
      name,
      category_id,
      price,
      price_unit,
      deposit_amount,
      total_quantity,
      image_url,
      description
    `)
    .eq("business_id", business.id)
    .eq("status", "ACTIVE")
    .order("name", { ascending: true });

  // 4. Calculate Real-Time Stock Availability if dates are provided
  const bookedQuantitiesMap: Record<string, number> = {};

  if (startAtParam && endAtParam && items && items.length > 0) {
    const sDate = new Date(startAtParam).toISOString();
    const eDate = new Date(endAtParam).toISOString();

    // Query overlapping active bookings
    const { data: overlappingBookings } = await supabase
      .from("bookings")
      .select(`
        id,
        booking_items (
          rental_item_id,
          quantity
        )
      `)
      .eq("business_id", business.id)
      .in("status", ["PENDING", "CONFIRMED", "ONGOING"])
      .lt("start_at", eDate)
      .gt("end_at", sDate);

    if (overlappingBookings) {
      for (const b of overlappingBookings) {
        const bItems = b.booking_items as { rental_item_id: string; quantity: number }[] | null;
        if (bItems && Array.isArray(bItems)) {
          for (const bi of bItems) {
            bookedQuantitiesMap[bi.rental_item_id] =
              (bookedQuantitiesMap[bi.rental_item_id] || 0) + (bi.quantity || 0);
          }
        }
      }
    }
  }

  const itemsWithAvailability = (items || []).map((itm) => {
    const booked = bookedQuantitiesMap[itm.id] || 0;
    const available = Math.max(0, itm.total_quantity - booked);
    return {
      ...itm,
      available_quantity: available,
    };
  });

  return NextResponse.json({
    business,
    categories: categories || [],
    items: itemsWithAvailability,
  });
}

// POST /api/public/book/[slug] — Public customer submits booking request
export async function POST(request: Request, { params }: Params) {
  const { slug } = await params;
  if (!slug) {
    return NextResponse.json({ error: "Slug toko tidak valid." }, { status: 400 });
  }

  const supabase = createAdminClient();

  // 1. Fetch Business & WhatsApp Phone Number
  let { data: business } = await supabase
    .from("businesses")
    .select("id, name, slug, phone")
    .eq("slug", slug.toLowerCase())
    .maybeSingle();

  if (!business) {
    const { data: byName } = await supabase
      .from("businesses")
      .select("id, name, slug, phone")
      .ilike("name", slug)
      .maybeSingle();

    if (byName) {
      business = byName;
    }
  }

  if (!business) {
    return NextResponse.json({ error: "Toko tidak ditemukan." }, { status: 404 });
  }

  try {
    const body = await request.json();
    const {
      customer_name,
      customer_phone,
      start_at,
      end_at,
      items,
      notes,
      payment_method = "BAYAR_NANTI",
      payment_proof_url,
    }: {
      customer_name: string;
      customer_phone: string;
      start_at: string;
      end_at: string;
      items: { rental_item_id: string; quantity: number }[];
      notes?: string;
      payment_method?: "BAYAR_NANTI" | "TRANSFER";
      payment_proof_url?: string;
    } = body;

    if (!customer_name?.trim() || !customer_phone?.trim()) {
      return NextResponse.json({ error: "Nama dan nomor WhatsApp wajib diisi." }, { status: 400 });
    }

    if (!start_at || !end_at || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Pilih tanggal dan minimal 1 barang sewa." }, { status: 400 });
    }

    // 2. Fetch Items & Check Real-time Overlap Stock Availability
    const itemIds = items.map((i) => i.rental_item_id);
    const { data: dbItems, error: itemsError } = await supabase
      .from("rental_items")
      .select("id, name, price, total_quantity")
      .in("id", itemIds)
      .eq("business_id", business.id);

    if (itemsError || !dbItems || dbItems.length !== items.length) {
      return NextResponse.json({ error: "Barang tidak valid untuk toko ini." }, { status: 400 });
    }

    // Query active overlapping bookings to verify stock
    const sDate = new Date(start_at).toISOString();
    const eDate = new Date(end_at).toISOString();

    const { data: overlappingBookings } = await supabase
      .from("bookings")
      .select(`
        id,
        booking_items (
          rental_item_id,
          quantity
        )
      `)
      .eq("business_id", business.id)
      .in("status", ["PENDING", "CONFIRMED", "ONGOING"])
      .lt("start_at", eDate)
      .gt("end_at", sDate);

    const bookedMap: Record<string, number> = {};
    if (overlappingBookings) {
      for (const b of overlappingBookings) {
        const bItems = b.booking_items as { rental_item_id: string; quantity: number }[] | null;
        if (bItems && Array.isArray(bItems)) {
          for (const bi of bItems) {
            bookedMap[bi.rental_item_id] = (bookedMap[bi.rental_item_id] || 0) + (bi.quantity || 0);
          }
        }
      }
    }

    // Check if requested quantity exceeds available stock
    for (const reqItem of items) {
      const dbItm = dbItems.find((d) => d.id === reqItem.rental_item_id);
      if (!dbItm) continue;
      const booked = bookedMap[dbItm.id] || 0;
      const available = Math.max(0, dbItm.total_quantity - booked);
      if (reqItem.quantity > available) {
        return NextResponse.json(
          {
            error: `Stok untuk "${dbItm.name}" tidak mencukupi untuk periode tanggal tersebut (Tersedia: ${available} unit, Diminta: ${reqItem.quantity} unit).`,
          },
          { status: 400 }
        );
      }
    }

    // 3. Fetch or Create Customer under this specific business
    let customerId: string;
    const cleanPhone = customer_phone.trim();

    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("business_id", business.id)
      .eq("phone", cleanPhone)
      .maybeSingle();

    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      const { data: newCustomer, error: cError } = await supabase
        .from("customers")
        .insert({
          business_id: business.id,
          name: customer_name.trim(),
          phone: cleanPhone,
        })
        .select("id")
        .single();

      if (cError || !newCustomer) {
        return NextResponse.json({ error: "Gagal menyimpan data pelanggan: " + cError?.message }, { status: 500 });
      }
      customerId = newCustomer.id;
    }

    // 4. Calculate Duration and Rental Total
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

    // 5. Generate Booking Number
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingNumber = `INV-${year}-${randomSuffix}`;

    const methodLabel = payment_method === "TRANSFER" ? "Transfer Bank" : "Bayar di Toko (Saat Pengambilan)";
    const composedNotes = `[Online Form] [Metode: ${methodLabel}]${notes ? ` ${notes.trim()}` : ""}`;

    // 6. Insert Booking with PENDING status
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        business_id: business.id,
        customer_id: customerId,
        booking_number: bookingNumber,
        start_at: sDate,
        end_at: eDate,
        rental_total: rentalTotal,
        amount_due: rentalTotal,
        amount_paid: 0,
        status: "PENDING",
        notes: composedNotes,
      })
      .select("id, booking_number")
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Gagal membuat booking: " + bookingError?.message }, { status: 500 });
    }

    // 7. Insert Booking Items
    await supabase.from("booking_items").insert(
      bookingItemsToInsert.map((item) => ({
        ...item,
        booking_id: booking.id,
      }))
    );

    // 8. If Payment Method is TRANSFER and proof is uploaded, record payment as PENDING
    if (payment_method === "TRANSFER" && payment_proof_url) {
      await supabase.from("payments").insert({
        business_id: business.id,
        booking_id: booking.id,
        amount: rentalTotal,
        method: "TRANSFER",
        status: "PENDING",
        reference: payment_proof_url,
        paid_at: new Date().toISOString(),
      });
    }

    // 9. Format WhatsApp Message directly to this specific business's phone number
    const targetPhone = business.phone ? business.phone.replace(/^0/, "62").replace(/\D/g, "") : "";
    const startDateFmt = new Date(start_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
    const endDateFmt = new Date(end_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

    const itemLines = bookingItemsToInsert
      .map((i) => `• ${i.quantity}x ${i.item_name_snapshot} (Rp ${i.subtotal.toLocaleString("id-ID")})`)
      .join("\n");

    const waMessage = `Halo ${business.name}, saya telah mengirim pesanan sewa online:\n\n` +
      `📌 *No. Booking:* ${booking.booking_number}\n` +
      `👤 *Nama:* ${customer_name.trim()} (${cleanPhone})\n` +
      `📅 *Tanggal:* ${startDateFmt} s/d ${endDateFmt} (${durationDays} Hari)\n\n` +
      `🎒 *Rincian Barang:*\n${itemLines}\n\n` +
      `💰 *Total Estimasi:* Rp ${rentalTotal.toLocaleString("id-ID")}\n` +
      `💳 *Metode Bayar:* ${methodLabel}\n` +
      (payment_proof_url ? `📎 *Bukti Transfer:* Sudah diunggah di sistem\n` : "") +
      (notes?.trim() ? `📝 *Catatan:* ${notes.trim()}\n\n` : "\n") +
      `Mohon konfirmasi pesanan saya ya kak. Terima kasih!`;

    const waUrl = targetPhone
      ? `https://wa.me/${targetPhone}?text=${encodeURIComponent(waMessage)}`
      : null;

    return NextResponse.json({
      success: true,
      booking_number: booking.booking_number,
      whatsapp_url: waUrl,
      store_name: business.name,
      payment_method: payment_method,
    });
  } catch {
    return NextResponse.json({ error: "Format request tidak valid." }, { status: 400 });
  }
}
