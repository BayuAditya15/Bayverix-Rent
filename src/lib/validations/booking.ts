import { z } from 'zod';

export const bookingItemInputSchema = z.object({
  rental_item_id: z.string().min(1, 'Item rental tidak valid'),
  quantity: z.coerce.number().int().min(1, 'Jumlah minimal 1 unit'),
});

export const createBookingSchema = z
  .object({
    customer_id: z.string().min(1, 'Pelanggan wajib dipilih'),
    start_at: z.string().min(1, 'Tanggal mulai wajib diisi'),
    end_at: z.string().min(1, 'Tanggal selesai wajib diisi'),
    notes: z.string().max(1000).optional().nullable(),
    items: z
      .array(bookingItemInputSchema)
      .min(1, 'Minimal pilih 1 unit rental untuk membuat booking'),
  })
  .refine(
    (data) => {
      const start = new Date(data.start_at).getTime();
      const end = new Date(data.end_at).getTime();
      return start < end;
    },
    {
      message: 'Tanggal selesai harus lebih besar dari tanggal mulai',
      path: ['end_at'],
    }
  );

export const editBookingSchema = z
  .object({
    customer_id: z.string().min(1, 'Pelanggan wajib dipilih'),
    start_at: z.string().min(1, 'Tanggal mulai wajib diisi'),
    end_at: z.string().min(1, 'Tanggal selesai wajib diisi'),
    notes: z.string().max(1000).optional().nullable(),
    items: z
      .array(bookingItemInputSchema)
      .min(1, 'Minimal pilih 1 unit rental'),
  })
  .refine(
    (data) => {
      const start = new Date(data.start_at).getTime();
      const end = new Date(data.end_at).getTime();
      return start < end;
    },
    {
      message: 'Tanggal selesai harus lebih besar dari tanggal mulai',
      path: ['end_at'],
    }
  );

export const cancelBookingSchema = z.object({
  booking_id: z.string().min(1, 'Booking ID tidak valid'),
  reason: z.string().min(3, 'Alasan pembatalan wajib diisi (minimal 3 karakter)').max(500),
});

export const updateBookingStatusSchema = z.object({
  booking_id: z.string().min(1, 'Booking ID tidak valid'),
  status: z.enum(['DRAFT', 'PENDING', 'CONFIRMED', 'ONGOING', 'COMPLETED', 'CANCELLED']),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type EditBookingInput = z.infer<typeof editBookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
