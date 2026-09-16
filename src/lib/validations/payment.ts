import { z } from 'zod';

export const recordPaymentSchema = z.object({
  booking_id: z.string().min(1, 'Booking ID tidak valid'),
  amount: z.coerce.number().min(1, 'Jumlah pembayaran harus lebih dari 0'),
  method: z.enum(['CASH', 'BANK_TRANSFER', 'OTHER']),
  reference: z.string().max(255).optional().nullable(),
  paid_at: z.string().optional(),
});

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
