export type BookingStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'CONFIRMED'
  | 'ONGOING'
  | 'COMPLETED'
  | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'QRIS' | 'OTHER';

export type UserRole = 'owner' | 'staff';

export interface Business {
  id: string;
  name: string;
  slug?: string | null;
  logo_url: string | null;
  phone: string | null;
  email: string | null;
  address?: string | null;
  bank_name?: string | null;
  bank_account_number?: string | null;
  bank_account_holder?: string | null;
  currency: string;
  operating_hours: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  business_id: string;
  role: UserRole;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
}

export interface RentalItem {
  id: string;
  business_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  image_url: string | null;
  sku: string | null;
  price: number;
  total_quantity: number;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
  category?: Category | null;
}

export interface Customer {
  id: string;
  business_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  business_id: string;
  customer_id: string;
  booking_number: string;
  start_at: string;
  end_at: string;
  rental_total: number;
  amount_due: number;
  currency: string;
  status: BookingStatus;
  notes: string | null;
  payment_method?: PaymentMethod | string | null;
  payment_proof_url?: string | null;
  created_by: string | null;
  cancelled_by: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  booking_items?: BookingItem[];
  payments?: Payment[];
}

export interface BookingItem {
  id: string;
  booking_id: string;
  rental_item_id: string;
  item_name_snapshot: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
  created_at: string;
  rental_item?: RentalItem;
}

export interface Payment {
  id: string;
  business_id: string;
  booking_id: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  reference: string | null;
  proof_url?: string | null;
  paid_at: string;
  created_by: string | null;
  created_at: string;
}

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
