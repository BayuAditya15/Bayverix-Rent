/**
 * Availability Engine for Rental Management SaaS (V1)
 * Follows PRD Section 11: Quantity-based inventory overlap detection
 */

export interface BookingOverlapItem {
  booking_id: string;
  booking_status: string;
  start_at: string | Date;
  end_at: string | Date;
  quantity: number;
}

export function isDateOverlap(
  startA: string | Date,
  endA: string | Date,
  startB: string | Date,
  endB: string | Date
): boolean {
  const sA = new Date(startA).getTime();
  const eA = new Date(endA).getTime();
  const sB = new Date(startB).getTime();
  const eB = new Date(endB).getTime();

  return sA < eB && eA > sB;
}

export function calculateAvailableQuantity(
  totalQuantity: number,
  bookings: BookingOverlapItem[],
  targetStart: string | Date,
  targetEnd: string | Date,
  excludeBookingId?: string
): number {
  const activeStatuses = ['PENDING', 'CONFIRMED', 'ONGOING'];

  const bookedCount = bookings
    .filter((b) => {
      if (excludeBookingId && b.booking_id === excludeBookingId) return false;
      if (!activeStatuses.includes(b.booking_status)) return false;
      return isDateOverlap(b.start_at, b.end_at, targetStart, targetEnd);
    })
    .reduce((sum, b) => sum + (b.quantity || 0), 0);

  return Math.max(0, totalQuantity - bookedCount);
}

export function checkItemsAvailability(
  requestedItems: { rental_item_id: string; quantity: number; name: string }[],
  itemInventories: Map<
    string,
    { total_quantity: number; existing_bookings: BookingOverlapItem[] }
  >,
  targetStart: string | Date,
  targetEnd: string | Date,
  excludeBookingId?: string
): { available: boolean; conflicts: string[] } {
  const conflicts: string[] = [];

  for (const item of requestedItems) {
    const inv = itemInventories.get(item.rental_item_id);
    if (!inv) {
      conflicts.push(`Item "${item.name}" not found in inventory.`);
      continue;
    }

    const available = calculateAvailableQuantity(
      inv.total_quantity,
      inv.existing_bookings,
      targetStart,
      targetEnd,
      excludeBookingId
    );

    if (item.quantity > available) {
      conflicts.push(
        `Item "${item.name}" only has ${available} unit(s) available (requested: ${item.quantity}).`
      );
    }
  }

  return {
    available: conflicts.length === 0,
    conflicts,
  };
}
