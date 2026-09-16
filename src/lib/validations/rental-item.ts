import { z } from 'zod';

export const rentalItemSchema = z.object({
  name: z.string().min(1, 'Nama item wajib diisi').max(255),
  category_id: z.string().min(1).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  image_url: z.string().url().optional().nullable().or(z.literal('')),
  sku: z.string().max(100).optional().nullable(),
  price: z.coerce.number().min(0, 'Harga sewa tidak boleh negatif'),
  total_quantity: z.coerce.number().int().min(0, 'Jumlah unit minimal 0'),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export type RentalItemInput = z.infer<typeof rentalItemSchema>;
