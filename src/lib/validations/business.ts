import { z } from 'zod';

export const businessProfileSchema = z.object({
  name: z.string().min(2, 'Nama bisnis minimal 2 karakter').max(255),
  phone: z.string().max(50).optional().nullable(),
  email: z.string().email('Format email tidak valid').optional().nullable().or(z.literal('')),
  currency: z.string().default('IDR'),
  operating_hours: z.string().max(255).optional().nullable(),
  logo_url: z.string().url().optional().nullable().or(z.literal('')),
});

export type BusinessProfileInput = z.infer<typeof businessProfileSchema>;
