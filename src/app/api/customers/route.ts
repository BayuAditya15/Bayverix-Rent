import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusinessId } from "@/lib/auth/getCurrentBusiness";
import { canAddCustomer } from "@/lib/billing/checkLimit";

// GET /api/customers — List customers
export async function GET(request: Request) {
  const businessId = await getCurrentBusinessId();
  if (!businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");

  const supabase = await createClient();
  let query = supabase
    .from("customers")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// POST /api/customers — Create customer with limit check
export async function POST(request: Request) {
  const businessId = await getCurrentBusinessId();
  if (!businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Check Plan Limits before insertion
  const limit = await canAddCustomer(businessId);
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
    const { name, phone, email, notes } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Nama pelanggan wajib diisi." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("customers")
      .insert({
        business_id: businessId,
        name: name.trim(),
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        notes: notes?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Pelanggan dengan nomor telepon ini sudah terdaftar." }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Format request tidak valid" }, { status: 400 });
  }
}
