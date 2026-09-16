import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "proofs";
    const requestedBucket = (formData.get("bucket") as string) || "rental-items";

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan." }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Ensure the storage bucket exists, create as public if not
    const { data: existingBuckets, error: listBucketsError } = await supabase.storage.listBuckets();
    
    // Choose primary bucket or fallback
    let targetBucket = requestedBucket;
    if (!listBucketsError && existingBuckets) {
      const found = existingBuckets.find(
        (b) => b.name === requestedBucket || b.name === "rental-items" || b.name === "proofs" || b.name === "rentall-assets"
      );
      if (found) {
        targetBucket = found.name;
      } else {
        // Try creating the requested bucket
        try {
          await supabase.storage.createBucket(targetBucket, {
            public: true,
            fileSizeLimit: 10485760, // 10MB
          });
        } catch (createErr) {
          console.warn("Could not auto-create bucket:", createErr);
        }
      }
    }

    // 2. Upload file to Supabase Storage
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `${folder}/${cleanFileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(targetBucket)
      .upload(filePath, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      console.warn("Storage upload error in /api/upload:", uploadError.message);
      // Fallback to base64 Data URL if storage bucket fails
      const base64 = buffer.toString("base64");
      const mimeType = file.type || "image/jpeg";
      const dataUri = `data:${mimeType};base64,${base64}`;
      return NextResponse.json({
        url: dataUri,
        fallback: true,
        warning: uploadError.message,
      });
    }

    // 3. Return Public URL
    const { data: publicUrlData } = supabase.storage
      .from(targetBucket)
      .getPublicUrl(filePath);

    return NextResponse.json({
      url: publicUrlData.publicUrl,
      bucket: targetBucket,
      path: filePath,
    });
  } catch (error: any) {
    console.error("Upload API route exception:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal mengunggah file." },
      { status: 500 }
    );
  }
}
