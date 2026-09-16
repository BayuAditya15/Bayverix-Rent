import { createClient } from '@/lib/supabase/client';

export const SUPABASE_STORAGE_BUCKET = 'rentall-assets';

/**
 * Upload a file directly to Supabase Storage bucket ('rentall-assets').
 * If upload fails (e.g. offline or permission issue), falls back to Base64 data URI.
 */
export async function uploadToSupabaseStorage(
  file: File,
  folder: 'proofs' | 'products' = 'proofs'
): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('Upload can only be initiated from the client.');
  }

  try {
    const supabase = createClient();
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `${folder}/${cleanFileName}`;

    const { error: uploadError } = await supabase.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.warn('Supabase storage upload error, falling back to data URI:', uploadError.message);
      return await fileToBase64(file);
    }

    const { data: publicUrlData } = supabase.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (err: any) {
    console.warn('Storage upload exception, using fallback:', err?.message);
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
