import { z } from 'zod';

export const customerSchema = z.object({
  name: z.string().min(1, 'Nama pelanggan wajib diisi').max(255),
  phone: z.string().max(50).optional().nullable(),
  email: z.string().email('Format email tidak valid').optional().nullable().or(z.literal('')),
  notes: z.string().max(1000).optional().nullable(),
});

export type CustomerInput = z.infer<typeof customerSchema>;
