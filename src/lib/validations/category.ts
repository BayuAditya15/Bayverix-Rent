import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(1, 'Nama kategori wajib diisi').max(100),
  description: z.string().max(500).optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export type CategoryInput = z.infer<typeof categorySchema>;
