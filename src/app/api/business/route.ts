import { NextRequest, NextResponse } from "next/server";
import { getCurrentBusiness } from "@/lib/auth/getCurrentBusiness";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

export async function PUT(req: NextRequest) {
  try {
    const ctx = await getCurrentBusiness();
    if (!ctx || !ctx.user || !ctx.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, address, bank_name, bank_account_number, bank_account_holder } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Nama toko/bisnis wajib diisi." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Prepare update payload (slug is generated if missing)
    const updatePayload: Database["public"]["Tables"]["businesses"]["Update"] = {
      name: name.trim(),
      phone: phone ? String(phone).trim() : null,
      address: address ? String(address).trim() : null,
      bank_name: bank_name ? String(bank_name).trim() : null,
      bank_account_number: bank_account_number ? String(bank_account_number).trim() : null,
      bank_account_holder: bank_account_holder ? String(bank_account_holder).trim() : null,
    };

    if (!ctx.business?.slug) {
      updatePayload.slug = name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    const { data: updatedBusiness, error } = await supabase
      .from("businesses")
      .update(updatePayload)
      .eq("id", ctx.businessId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Gagal memperbarui profil toko: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profil toko berhasil diperbarui.",
      data: updatedBusiness,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
