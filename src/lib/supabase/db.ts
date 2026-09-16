import { createClient } from '@supabase/supabase-js';
import {
  Business,
  Category,
  RentalItem,
  Customer,
  Booking,
  Payment,
  BookingStatus,
} from '@/types/database';
import {
  calculateItemSubtotal,
  calculateRentalTotal,
  calculateAmountPaid,
  calculateAmountDue,
  validateNoOverpayment,
} from '@/lib/utils/financial';
import { checkItemsAvailability } from '@/lib/utils/availability';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://axsnymnhobwjnhnizfsl.supabase.co';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_WRv2RKjQ1Ru2Q8delDKsvg_AG9jLJQ0';

export const supabaseDb = createClient(supabaseUrl, supabaseKey);

export async function getActiveBusinessId(): Promise<string> {
  const { data: businesses } = await supabaseDb
    .from('businesses')
    .select('id')
    .limit(1);

  if (businesses && businesses.length > 0) {
    return businesses[0].id;
  }

  // Create default business if none exists
  const { data: newBiz, error } = await supabaseDb
    .from('businesses')
    .insert({
      name: 'Bayverix-Rent Outdoor & Gear',
      phone: '081234567890',
      email: 'admin@bayverix.com',
      currency: 'IDR',
      operating_hours: '08:00 - 21:00 WIB',
    })
    .select()
    .single();

  if (newBiz) return newBiz.id;
  throw new Error('Gagal mengambil atau menginisialisasi ID bisnis');
}

export const dbService = {
  // ── Business Profile ────────────────────────────────────────────────
  async getBusiness(): Promise<Business> {
    const bizId = await getActiveBusinessId();
    const { data, error } = await supabaseDb
      .from('businesses')
      .select('*')
      .eq('id', bizId)
      .single();

    if (error || !data) {
      throw new Error('Gagal memuat profil bisnis dari database');
    }
    return data as Business;
  },

  async updateBusiness(data: Partial<Business>): Promise<Business> {
    const bizId = await getActiveBusinessId();
    const { data: updated, error } = await supabaseDb
      .from('businesses')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bizId)
      .select()
      .single();

    if (error || !updated) {
      throw new Error(error?.message || 'Gagal memperbarui profil bisnis');
    }
    return updated as Business;
  },

  // ── Categories ──────────────────────────────────────────────────────
  async getCategories(): Promise<Category[]> {
    const bizId = await getActiveBusinessId();
    const { data, error } = await supabaseDb
      .from('categories')
      .select('*')
      .eq('business_id', bizId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []) as Category[];
  },

  async createCategory(input: {
    name: string;
    description?: string | null;
    status?: 'ACTIVE' | 'INACTIVE';
  }): Promise<Category> {
    const bizId = await getActiveBusinessId();
    const { data, error } = await supabaseDb
      .from('categories')
      .insert({
        business_id: bizId,
        name: input.name,
        description: input.description || null,
        status: input.status || 'ACTIVE',
      })
      .select()
      .single();

    if (error || !data) throw new Error(error?.message || 'Gagal membuat kategori');
    return data as Category;
  },

  async updateCategory(
    id: string,
    input: Partial<Category>
  ): Promise<Category | null> {
    const bizId = await getActiveBusinessId();
    const { data, error } = await supabaseDb
      .from('categories')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('business_id', bizId)
      .select()
      .single();

    if (error) return null;
    return data as Category;
  },

  // ── Rental Items ────────────────────────────────────────────────────
  async getRentalItems(): Promise<RentalItem[]> {
    const bizId = await getActiveBusinessId();
    const { data, error } = await supabaseDb
      .from('rental_items')
      .select('*, category:categories(*)')
      .eq('business_id', bizId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []) as RentalItem[];
  },

  async createRentalItem(input: {
    name: string;
    category_id?: string | null;
    description?: string | null;
    image_url?: string | null;
    sku?: string | null;
    price: number;
    total_quantity: number;
    status?: 'ACTIVE' | 'INACTIVE';
  }): Promise<RentalItem> {
    const bizId = await getActiveBusinessId();
    const { data, error } = await supabaseDb
      .from('rental_items')
      .insert({
        business_id: bizId,
        name: input.name,
        category_id: input.category_id || null,
        description: input.description || null,
        image_url: input.image_url || null,
        sku: input.sku || null,
        price: input.price,
        total_quantity: input.total_quantity,
        status: input.status || 'ACTIVE',
      })
      .select('*, category:categories(*)')
      .single();

    if (error || !data) throw new Error(error?.message || 'Gagal membuat rental item');
    return data as RentalItem;
  },

  async updateRentalItem(
    id: string,
    input: Partial<RentalItem>
  ): Promise<RentalItem | null> {
    const bizId = await getActiveBusinessId();
    const { data, error } = await supabaseDb
      .from('rental_items')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('business_id', bizId)
      .select('*, category:categories(*)')
      .single();

    if (error) return null;
    return data as RentalItem;
  },

  // ── Customers ───────────────────────────────────────────────────────
  async getCustomers(search?: string): Promise<Customer[]> {
    const bizId = await getActiveBusinessId();
    let query = supabaseDb
      .from('customers')
      .select('*')
      .eq('business_id', bizId)
      .order('created_at', { ascending: false });

    if (search && search.trim()) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data || []) as Customer[];
  },

  async getCustomerById(id: string): Promise<Customer | null> {
    const bizId = await getActiveBusinessId();
    const { data, error } = await supabaseDb
      .from('customers')
      .select('*')
      .eq('id', id)
      .eq('business_id', bizId)
      .single();

    if (error) return null;
    return data as Customer;
  },

  async createCustomer(input: {
    name: string;
    phone?: string | null;
    email?: string | null;
    notes?: string | null;
  }): Promise<Customer> {
    const bizId = await getActiveBusinessId();
    const { data, error } = await supabaseDb
      .from('customers')
      .insert({
        business_id: bizId,
        name: input.name,
        phone: input.phone || null,
        email: input.email || null,
        notes: input.notes || null,
      })
      .select()
      .single();

    if (error || !data) throw new Error(error?.message || 'Gagal membuat data pelanggan');
    return data as Customer;
  },

  async updateCustomer(
    id: string,
    input: Partial<Customer>
  ): Promise<Customer | null> {
    const bizId = await getActiveBusinessId();
    const { data, error } = await supabaseDb
      .from('customers')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('business_id', bizId)
      .select()
      .single();

    if (error) return null;
    return data as Customer;
  },

  // ── Bookings ────────────────────────────────────────────────────────
  async getBookings(filters?: { status?: string; search?: string }): Promise<Booking[]> {
    const bizId = await getActiveBusinessId();
    let query = supabaseDb
      .from('bookings')
      .select('*, customer:customers(*), booking_items(*, rental_item:rental_items(*)), payments(*)')
      .eq('business_id', bizId)
      .order('created_at', { ascending: false });

    if (filters?.status && filters.status !== 'ALL') {
      query = query.eq('status', filters.status);
    }

    if (filters?.search && filters.search.trim()) {
      query = query.or(`booking_number.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data || []) as Booking[];
  },

  async getBookingById(id: string): Promise<Booking | null> {
    const bizId = await getActiveBusinessId();
    const { data, error } = await supabaseDb
      .from('bookings')
      .select('*, customer:customers(*), booking_items(*, rental_item:rental_items(*)), payments(*)')
      .eq('id', id)
      .eq('business_id', bizId)
      .single();

    if (error) return null;
    return data as Booking;
  },

  async createBooking(input: {
    customer_id: string;
    start_at: string;
    end_at: string;
    items: { rental_item_id: string; quantity: number }[];
    notes?: string | null;
    payment_proof_url?: string | null;
    payment_method?: string | null;
  }): Promise<{ success: boolean; booking?: Booking; error?: string }> {
    const bizId = await getActiveBusinessId();

    // 1. Availability check
    const { data: allActiveBookings } = await supabaseDb
      .from('bookings')
      .select('*, booking_items(*)')
      .eq('business_id', bizId)
      .neq('status', 'CANCELLED');

    const { data: allRentalItems } = await supabaseDb
      .from('rental_items')
      .select('*')
      .eq('business_id', bizId);

    const itemsMap = new Map((allRentalItems || []).map((i) => [i.id, i]));
    const inventoryMap = new Map();

    for (const itm of allRentalItems || []) {
      const existingBookings: any[] = [];
      for (const b of allActiveBookings || []) {
        const matchingItem = b.booking_items?.find((bi: any) => bi.rental_item_id === itm.id);
        if (matchingItem) {
          existingBookings.push({
            booking_id: b.id,
            booking_status: b.status,
            start_at: b.start_at,
            end_at: b.end_at,
            quantity: matchingItem.quantity,
          });
        }
      }
      inventoryMap.set(itm.id, {
        total_quantity: itm.total_quantity,
        existing_bookings: existingBookings,
      });
    }

    const requestedWithNames = input.items.map((i) => ({
      rental_item_id: i.rental_item_id,
      quantity: i.quantity,
      name: itemsMap.get(i.rental_item_id)?.name || 'Unit Rental',
    }));

    const availCheck = checkItemsAvailability(
      requestedWithNames,
      inventoryMap,
      input.start_at,
      input.end_at
    );

    if (!availCheck.available) {
      return { success: false, error: availCheck.conflicts.join('. ') };
    }

    // 2. Count existing bookings for booking_number
    const { count } = await supabaseDb
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', bizId);

    const nextCount = (count || 0) + 1;
    const bookingNumber = `RNT-${String(nextCount).padStart(5, '0')}`;

    // 3. Compute item snapshots & subtotal
    const calculatedItems = input.items.map((it) => {
      const item = itemsMap.get(it.rental_item_id);
      const unitPrice = item ? Number(item.price) : 0;
      const subtotal = calculateItemSubtotal(unitPrice, it.quantity);
      return {
        rental_item_id: it.rental_item_id,
        item_name_snapshot: item?.name || 'Unit Rental',
        unit_price: unitPrice,
        quantity: it.quantity,
        subtotal,
      };
    });

    const rentalTotal = calculateRentalTotal(calculatedItems);
    const amountDue = rentalTotal;

    // 4. Insert booking
    const { data: newBooking, error: bookingErr } = await supabaseDb
      .from('bookings')
      .insert({
        business_id: bizId,
        customer_id: input.customer_id,
        booking_number: bookingNumber,
        start_at: input.start_at,
        end_at: input.end_at,
        rental_total: rentalTotal,
        amount_due: amountDue,
        currency: 'IDR',
        status: 'PENDING',
        notes: input.notes || null,
        payment_proof_url: input.payment_proof_url || null,
        payment_method: input.payment_method || null,
      })
      .select()
      .single();

    if (bookingErr || !newBooking) {
      return { success: false, error: bookingErr?.message || 'Gagal membuat booking' };
    }

    // 5. Insert booking items
    const bookingItemsToInsert = calculatedItems.map((ci) => ({
      booking_id: newBooking.id,
      ...ci,
    }));

    await supabaseDb.from('booking_items').insert(bookingItemsToInsert);

    const fullBooking = await this.getBookingById(newBooking.id);
    return { success: true, booking: fullBooking || newBooking };
  },

  async cancelBooking(
    bookingId: string,
    reason: string
  ): Promise<{ success: boolean; error?: string }> {
    const bizId = await getActiveBusinessId();
    const { data: booking } = await supabaseDb
      .from('bookings')
      .select('status')
      .eq('id', bookingId)
      .eq('business_id', bizId)
      .single();

    if (!booking) return { success: false, error: 'Booking tidak ditemukan' };

    const cancellable = ['DRAFT', 'PENDING', 'CONFIRMED'];
    if (!cancellable.includes(booking.status)) {
      return {
        success: false,
        error: `Booking dengan status ${booking.status} tidak dapat dibatalkan.`,
      };
    }

    const { error } = await supabaseDb
      .from('bookings')
      .update({
        status: 'CANCELLED',
        cancel_reason: reason,
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .eq('business_id', bizId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  async updateBookingStatus(
    bookingId: string,
    status: BookingStatus
  ): Promise<{ success: boolean; error?: string }> {
    const bizId = await getActiveBusinessId();
    const { data: booking } = await supabaseDb
      .from('bookings')
      .select('status')
      .eq('id', bookingId)
      .eq('business_id', bizId)
      .single();

    if (!booking) return { success: false, error: 'Booking tidak ditemukan' };

    if (booking.status === 'COMPLETED' && status !== 'COMPLETED') {
      return { success: false, error: 'Booking yang sudah selesai tidak dapat diubah statusnya.' };
    }
    if (booking.status === 'CANCELLED') {
      return { success: false, error: 'Booking yang sudah dibatalkan tidak dapat diubah statusnya.' };
    }

    const { error } = await supabaseDb
      .from('bookings')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .eq('business_id', bizId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  // ── Payments ────────────────────────────────────────────────────────
  async recordPayment(input: {
    booking_id: string;
    amount: number;
    method: 'CASH' | 'BANK_TRANSFER' | 'OTHER';
    reference?: string | null;
    paid_at?: string;
  }): Promise<{ success: boolean; payment?: Payment; error?: string }> {
    const bizId = await getActiveBusinessId();
    const booking = await this.getBookingById(input.booking_id);
    if (!booking) return { success: false, error: 'Booking tidak ditemukan' };

    // Prevent overpayment
    const overpayCheck = validateNoOverpayment(booking.amount_due, input.amount);
    if (!overpayCheck.valid) {
      return { success: false, error: overpayCheck.message };
    }

    // 1. Insert payment record
    const { data: newPayment, error: payErr } = await supabaseDb
      .from('payments')
      .insert({
        business_id: bizId,
        booking_id: booking.id,
        amount: input.amount,
        currency: 'IDR',
        method: input.method,
        status: 'COMPLETED',
        reference: input.reference || null,
        paid_at: input.paid_at || new Date().toISOString(),
      })
      .select()
      .single();

    if (payErr || !newPayment) {
      return { success: false, error: payErr?.message || 'Gagal mencatat pembayaran' };
    }

    // 2. Recompute amount_due
    const allPayments = [...(booking.payments || []), newPayment];
    const totalPaid = calculateAmountPaid(allPayments);
    const newAmountDue = calculateAmountDue(booking.rental_total, totalPaid);

    await supabaseDb
      .from('bookings')
      .update({
        amount_due: newAmountDue,
        updated_at: new Date().toISOString(),
      })
      .eq('id', booking.id)
      .eq('business_id', bizId);

    return { success: true, payment: newPayment as Payment };
  },

  // ── Dashboard Statistics ────────────────────────────────────────────
  async getDashboardStats() {
    const bizId = await getActiveBusinessId();
    const { data: bookings } = await supabaseDb
      .from('bookings')
      .select('*, customer:customers(*), payments(*)')
      .eq('business_id', bizId);

    const allBookings = (bookings || []) as Booking[];
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const todaysBookings = allBookings.filter(
      (b) => b.start_at.startsWith(todayStr) && b.status !== 'CANCELLED'
    );
    const upcomingBookings = allBookings.filter(
      (b) => new Date(b.start_at).getTime() > now.getTime() && b.status !== 'CANCELLED'
    );
    const activeRentals = allBookings.filter((b) => b.status === 'ONGOING');
    const outstandingBookings = allBookings.filter(
      (b) => b.amount_due > 0 && b.status !== 'CANCELLED'
    );
    const totalOutstandingAmount = outstandingBookings.reduce(
      (sum, b) => sum + Number(b.amount_due),
      0
    );

    const allPayments = allBookings
      .flatMap((b) => b.payments || [])
      .filter((p) => p.status === 'COMPLETED');
    const totalRevenue = allPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      todaysBookingsCount: todaysBookings.length,
      upcomingBookingsCount: upcomingBookings.length,
      activeRentalsCount: activeRentals.length,
      outstandingBookingsCount: outstandingBookings.length,
      totalOutstandingAmount,
      totalRevenue,
      recentBookings: allBookings.slice(0, 5),
    };
  },
};
