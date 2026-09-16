import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface Params {
  params: Promise<{ slug: string }>;
}

// GET /api/public/book/[slug] — Fetch store info & public catalog
export async function GET(request: Request, { params }: Params) {
  const { slug } = await params;
  if (!slug) {
    return NextResponse.json({ error: "Slug toko tidak valid." }, { status: 400 });
  }

  const supabase = createAdminClient();

  // 1. Fetch Business by slug
  const { data: business, error: bError } = await supabase
    .from("businesses")
    .select("id, name, slug, phone, email, address, logo_url")
    .eq("slug", slug.toLowerCase())
    .maybeSingle();

  if (bError || !business) {
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

  return NextResponse.json({
    business,
    categories: categories || [],
    items: items || [],
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
  const { data: business, error: bError } = await supabase
    .from("businesses")
    .select("id, name, slug, phone")
    .eq("slug", slug.toLowerCase())
    .maybeSingle();

  if (bError || !business) {
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
    }: {
      customer_name: string;
      customer_phone: string;
      start_at: string;
      end_at: string;
      items: { rental_item_id: string; quantity: number }[];
      notes?: string;
    } = body;

    if (!customer_name?.trim() || !customer_phone?.trim()) {
      return NextResponse.json({ error: "Nama dan nomor WhatsApp wajib diisi." }, { status: 400 });
    }

    if (!start_at || !end_at || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Pilih tanggal dan minimal 1 barang sewa." }, { status: 400 });
    }

    // 2. Fetch or Create Customer under this specific business
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

    // 3. Fetch Items & Calculate Total
    const itemIds = items.map((i) => i.rental_item_id);
    const { data: dbItems, error: itemsError } = await supabase
      .from("rental_items")
      .select("id, name, price")
      .in("id", itemIds)
      .eq("business_id", business.id);

    if (itemsError || !dbItems || dbItems.length !== items.length) {
      return NextResponse.json({ error: "Barang tidak valid untuk toko ini." }, { status: 400 });
    }

    // Calculate rental duration in days
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

    // 4. Generate Booking Number
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingNumber = `INV-${year}-${randomSuffix}`;

    // 5. Insert Booking with PENDING status
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        business_id: business.id,
        customer_id: customerId,
        booking_number: bookingNumber,
        start_at,
        end_at,
        rental_total: rentalTotal,
        amount_due: rentalTotal,
        amount_paid: 0,
        status: "PENDING",
        notes: notes ? `[Online Form] ${notes.trim()}` : "[Online Form]",
      })
      .select("id, booking_number")
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Gagal membuat booking: " + bookingError?.message }, { status: 500 });
    }

    // 6. Insert Booking Items
    await supabase.from("booking_items").insert(
      bookingItemsToInsert.map((item) => ({
        ...item,
        booking_id: booking.id,
      }))
    );

    // 7. Format WhatsApp Message directly to this specific business's phone number
    const targetPhone = business.phone ? business.phone.replace(/^0/, "62").replace(/\D/g, "") : "";
    const startDateFmt = new Date(start_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
    const endDateFmt = new Date(end_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

    const itemLines = bookingItemsToInsert
      .map((i) => `• ${i.quantity}x ${i.item_name_snapshot} (Rp ${i.subtotal.toLocaleString("id-ID")})`)
      .join("\n");

    const waMessage = `Halo ${business.name}, saya ingin booking sewa:\n\n` +
      `📌 *No. Booking:* ${booking.booking_number}\n` +
      `👤 *Nama:* ${customer_name.trim()} (${cleanPhone})\n` +
      `📅 *Tanggal:* ${startDateFmt} s/d ${endDateFmt} (${durationDays} Hari)\n\n` +
      `🎒 *Rincian Barang:*\n${itemLines}\n\n` +
      `💰 *Total Estimasi:* Rp ${rentalTotal.toLocaleString("id-ID")}\n\n` +
      (notes?.trim() ? `📝 *Catatan:* ${notes.trim()}\n\n` : "") +
      `Mohon konfirmasi ketersediaan unitnya ya. Terima kasih!`;

    const waUrl = targetPhone
      ? `https://wa.me/${targetPhone}?text=${encodeURIComponent(waMessage)}`
      : null;

    return NextResponse.json({
      success: true,
      booking_number: booking.booking_number,
      whatsapp_url: waUrl,
      store_name: business.name,
    });
  } catch {
    return NextResponse.json({ error: "Format request tidak valid." }, { status: 400 });
  }
}
