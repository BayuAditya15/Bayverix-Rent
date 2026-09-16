-- =====================================================================
-- RENTAL MANAGEMENT SAAS - V1 DATABASE SCHEMA
-- Multi-tenant isolation with PostgreSQL Row Level Security (RLS)
-- =====================================================================

-- 1. Create Enums
CREATE TYPE booking_status AS ENUM (
    'DRAFT',
    'PENDING',
    'CONFIRMED',
    'ONGOING',
    'COMPLETED',
    'CANCELLED'
);

CREATE TYPE payment_status AS ENUM (
    'PENDING',
    'COMPLETED',
    'FAILED'
);

CREATE TYPE payment_method AS ENUM (
    'CASH',
    'BANK_TRANSFER',
    'OTHER'
);

-- 2. Businesses Table
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    currency VARCHAR(10) NOT NULL DEFAULT 'IDR',
    operating_hours TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Users / Profiles Table (linked to Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'owner', -- 'owner' | 'staff'
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Categories Table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE' | 'INACTIVE'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Rental Items Table
CREATE TABLE rental_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    sku VARCHAR(100),
    price NUMERIC(19, 4) NOT NULL DEFAULT 0.0000 CHECK (price >= 0),
    total_quantity INT NOT NULL DEFAULT 1 CHECK (total_quantity >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE' | 'INACTIVE'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Customers Table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Bookings Table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    booking_number VARCHAR(50) NOT NULL,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    rental_total NUMERIC(19, 4) NOT NULL DEFAULT 0.0000 CHECK (rental_total >= 0),
    amount_due NUMERIC(19, 4) NOT NULL DEFAULT 0.0000 CHECK (amount_due >= 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'IDR',
    status booking_status NOT NULL DEFAULT 'PENDING',
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    cancelled_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    cancelled_at TIMESTAMPTZ,
    cancel_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_booking_dates CHECK (start_at < end_at)
);

-- 8. Booking Items Table
CREATE TABLE booking_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    rental_item_id UUID NOT NULL REFERENCES rental_items(id) ON DELETE RESTRICT,
    item_name_snapshot VARCHAR(255) NOT NULL,
    unit_price NUMERIC(19, 4) NOT NULL DEFAULT 0.0000 CHECK (unit_price >= 0),
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    subtotal NUMERIC(19, 4) NOT NULL DEFAULT 0.0000 CHECK (subtotal >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Payments Table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    amount NUMERIC(19, 4) NOT NULL CHECK (amount > 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'IDR',
    method payment_method NOT NULL DEFAULT 'CASH',
    status payment_status NOT NULL DEFAULT 'COMPLETED',
    reference VARCHAR(255),
    paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================================
CREATE INDEX idx_users_business ON users(business_id);
CREATE INDEX idx_categories_business ON categories(business_id);
CREATE INDEX idx_rental_items_business ON rental_items(business_id);
CREATE INDEX idx_customers_business ON customers(business_id);
CREATE INDEX idx_customers_name_phone ON customers(business_id, name, phone);
CREATE INDEX idx_bookings_business ON bookings(business_id);
CREATE INDEX idx_bookings_period ON bookings(business_id, start_at, end_at);
CREATE INDEX idx_bookings_status ON bookings(business_id, status);
CREATE INDEX idx_booking_items_booking ON booking_items(booking_id);
CREATE INDEX idx_booking_items_rental_item ON booking_items(rental_item_id);
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_business ON payments(business_id);

-- =====================================================================
-- HELPER FUNCTION FOR CURRENT USER'S BUSINESS_ID
-- =====================================================================
CREATE OR REPLACE FUNCTION get_auth_business_id()
RETURNS UUID AS $$
    SELECT business_id FROM users WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Businesses Policy
CREATE POLICY "Users can view their own business"
    ON businesses FOR SELECT
    USING (id = get_auth_business_id());

CREATE POLICY "Owners can update their own business"
    ON businesses FOR UPDATE
    USING (id = get_auth_business_id());

-- Users Policy
CREATE POLICY "Users can view members of their business"
    ON users FOR SELECT
    USING (business_id = get_auth_business_id());

CREATE POLICY "Users can update their own user record"
    ON users FOR UPDATE
    USING (id = auth.uid());

-- Categories Policy
CREATE POLICY "Business tenant categories policy"
    ON categories FOR ALL
    USING (business_id = get_auth_business_id())
    WITH CHECK (business_id = get_auth_business_id());

-- Rental Items Policy
CREATE POLICY "Business tenant rental_items policy"
    ON rental_items FOR ALL
    USING (business_id = get_auth_business_id())
    WITH CHECK (business_id = get_auth_business_id());

-- Customers Policy
CREATE POLICY "Business tenant customers policy"
    ON customers FOR ALL
    USING (business_id = get_auth_business_id())
    WITH CHECK (business_id = get_auth_business_id());

-- Bookings Policy
CREATE POLICY "Business tenant bookings policy"
    ON bookings FOR ALL
    USING (business_id = get_auth_business_id())
    WITH CHECK (business_id = get_auth_business_id());

-- Booking Items Policy
CREATE POLICY "Business tenant booking_items policy"
    ON booking_items FOR ALL
    USING (
        booking_id IN (
            SELECT id FROM bookings WHERE business_id = get_auth_business_id()
        )
    )
    WITH CHECK (
        booking_id IN (
            SELECT id FROM bookings WHERE business_id = get_auth_business_id()
        )
    );

-- Payments Policy
CREATE POLICY "Business tenant payments policy"
    ON payments FOR ALL
    USING (business_id = get_auth_business_id())
    WITH CHECK (business_id = get_auth_business_id());
