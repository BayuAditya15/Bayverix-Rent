import { NextRequest, NextResponse } from "next/server";
import { getCurrentBusiness } from "@/lib/auth/getCurrentBusiness";
import { createClient } from "@/lib/supabase/server";

export async function PUT(req: NextRequest) {
  try {
    const ctx = await getCurrentBusiness();
    if (!ctx || !ctx.user || !ctx.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, address } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Nama toko/bisnis wajib diisi." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Prepare update payload (slug is permanent and not editable by user)
    const updatePayload = {
      name: name.trim(),
      phone: phone ? String(phone).trim() : null,
      address: address ? String(address).trim() : null,
    };

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
