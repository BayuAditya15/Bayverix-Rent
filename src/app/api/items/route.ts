import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusinessId } from "@/lib/auth/getCurrentBusiness";
import { canAddItem } from "@/lib/billing/checkLimit";

// GET /api/items — List rental items with categories
export async function GET(request: Request) {
  const businessId = await getCurrentBusinessId();
  if (!businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("category_id");
  const search = searchParams.get("search");

  const supabase = await createClient();
  let query = supabase
    .from("rental_items")
    .select(`
      *,
      categories (
        id,
        name
      )
    `)
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// POST /api/items — Create a new rental item with limit validation
export async function POST(request: Request) {
  const businessId = await getCurrentBusinessId();
  if (!businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Check Plan Limits before insertion
  const limit = await canAddItem(businessId);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: "LIMIT_REACHED",
        message: limit.reason,
        upgradeUrl: limit.upgradeUrl,
      },
      { status: 402 } // Payment Required
    );
  }

  try {
    const body = await request.json();
    const {
      name,
      category_id,
      description,
      image_url,
      sku,
      price,
      price_unit,
      deposit_amount,
      total_quantity,
    } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Nama barang wajib diisi." }, { status: 400 });
    }

    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum < 0) {
      return NextResponse.json({ error: "Tarif sewa harus angka positif." }, { status: 400 });
    }

    const qty = parseInt(total_quantity, 10);
    if (isNaN(qty) || qty < 1) {
      return NextResponse.json({ error: "Jumlah unit fisik minimal 1." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("rental_items")
      .insert({
        business_id: businessId,
        category_id: category_id || null,
        name: name.trim(),
        description: description?.trim() || null,
        image_url: image_url || null,
        sku: sku?.trim() || null,
        price: priceNum,
        price_unit: ["HOUR", "DAY", "WEEK", "MONTH"].includes(price_unit) ? price_unit : "DAY",
        deposit_amount: deposit_amount ? Number(deposit_amount) : 0,
        total_quantity: qty,
        status: "ACTIVE",
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Barang dengan SKU ini sudah terdaftar." }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Format request tidak valid" }, { status: 400 });
  }
}
