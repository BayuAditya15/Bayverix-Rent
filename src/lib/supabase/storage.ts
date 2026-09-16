export const SUPABASE_STORAGE_BUCKET = "rental-items";

/**
 * Upload a file via server-side /api/upload (which uses admin client with auto bucket creation).
 * Falls back to Base64 data URI if upload fails or is offline.
 */
export async function uploadToSupabaseStorage(
  file: File,
  folder: "proofs" | "products" | "items" = "proofs"
): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("Upload can only be initiated from the client.");
  }

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    formData.append("bucket", SUPABASE_STORAGE_BUCKET);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      console.warn("Upload endpoint returned error, falling back to base64:", errJson);
      return await fileToBase64(file);
    }

    const data = await res.json();
    if (data.url) {
      return data.url;
    }

    return await fileToBase64(file);
  } catch (err: any) {
    console.warn("Storage upload exception, using base64 fallback:", err?.message);
    return await fileToBase64(file);
  }
}

/**
 * Convert a File object to a Base64 string for instant local fallback.
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
