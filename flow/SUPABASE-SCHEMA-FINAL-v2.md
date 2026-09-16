# Supabase Schema — FINAL LENGKAP (Siap Jalan Sekali dari 0)

**Ini versi gabungan dan sudah diperbaiki urutannya** — menggantikan `SUPABASE-SCHEMA-FINAL.md` dan `FIX-MISSING-TABLES.md` sebelumnya yang terpecah. Copy-paste ke Supabase SQL Editor, jalankan **berurutan dari atas ke bawah** (boleh per-blok kalau mau lebih hati-hati, boleh juga langsung semua sekaligus karena urutannya sudah benar).

**Asumsi:** Anda mulai dari database kosong (tabel lama sudah di-drop).

---

## BLOK 1 — ENUM Types

```sql
DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM (
        'PENDING', 'CONFIRMED', 'ONGOING', 'COMPLETED', 'CANCELLED', 'OVERDUE'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM (
        'CASH', 'TRANSFER', 'QRIS', 'EWALLET', 'CARD', 'OTHER'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM (
        'PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;
```

---

## BLOK 2 — Tabel Inti: `businesses` & `users`

```sql
CREATE TABLE public.businesses (
  id              uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id        uuid,
  name            character varying NOT NULL,
  slug            character varying UNIQUE,
  logo_url        text,
  phone           character varying,
  email           character varying,
  address         text,
  currency        character varying NOT NULL DEFAULT 'IDR',
  operating_hours text,
  timezone        character varying NOT NULL DEFAULT 'Asia/Jakarta',
  created_at      timestamp with time zone NOT NULL DEFAULT now(),
  updated_at      timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT businesses_pkey PRIMARY KEY (id),
  CONSTRAINT businesses_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE public.users (
  id                   uuid NOT NULL,
  business_id          uuid,
  role                 character varying NOT NULL DEFAULT 'owner',
  name                 character varying NOT NULL DEFAULT '',
  email                character varying NOT NULL,
  avatar_url           text,
  onboarding_completed boolean NOT NULL DEFAULT false,
  created_at           timestamp with time zone NOT NULL DEFAULT now(),
  updated_at           timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT users_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE SET NULL,
  CONSTRAINT users_role_check CHECK (role IN ('owner', 'admin', 'staff'))
);
```

---

## BLOK 3 — Tabel Operasional Rental

```sql
CREATE TABLE public.categories (
  id          uuid NOT NULL DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL,
  name        character varying NOT NULL,
  description text,
  status      character varying NOT NULL DEFAULT 'ACTIVE',
  created_at  timestamp with time zone NOT NULL DEFAULT now(),
  updated_at  timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE CASCADE,
  CONSTRAINT categories_business_name_unique UNIQUE (business_id, name)
);

CREATE TABLE public.rental_items (
  id              uuid NOT NULL DEFAULT gen_random_uuid(),
  business_id     uuid NOT NULL,
  category_id     uuid,
  name            character varying NOT NULL,
  description     text,
  image_url       text,
  sku             character varying,
  price           numeric NOT NULL DEFAULT 0.0000 CHECK (price >= 0),
  price_unit      character varying NOT NULL DEFAULT 'DAY' CHECK (price_unit IN ('HOUR','DAY','WEEK','MONTH')),
  deposit_amount  numeric(12,2) NOT NULL DEFAULT 0,
  total_quantity  integer NOT NULL DEFAULT 1 CHECK (total_quantity >= 0),
  status          character varying NOT NULL DEFAULT 'ACTIVE',
  created_at      timestamp with time zone NOT NULL DEFAULT now(),
  updated_at      timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT rental_items_pkey PRIMARY KEY (id),
  CONSTRAINT rental_items_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE CASCADE,
  CONSTRAINT rental_items_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX idx_rental_items_sku_unique
    ON public.rental_items(business_id, sku) WHERE sku IS NOT NULL;

CREATE TABLE public.customers (
  id          uuid NOT NULL DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL,
  name        character varying NOT NULL,
  phone       character varying,
  email       character varying,
  notes       text,
  created_at  timestamp with time zone NOT NULL DEFAULT now(),
  updated_at  timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT customers_pkey PRIMARY KEY (id),
  CONSTRAINT customers_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX idx_customers_phone_unique
    ON public.customers(business_id, phone) WHERE phone IS NOT NULL;

CREATE TABLE public.bookings (
  id              uuid NOT NULL DEFAULT gen_random_uuid(),
  business_id     uuid NOT NULL,
  customer_id     uuid NOT NULL,
  booking_number  character varying NOT NULL,
  start_at        timestamp with time zone NOT NULL,
  end_at          timestamp with time zone NOT NULL,
  rental_total    numeric NOT NULL DEFAULT 0.0000 CHECK (rental_total >= 0),
  deposit_total   numeric(12,2) NOT NULL DEFAULT 0,
  amount_due      numeric NOT NULL DEFAULT 0.0000 CHECK (amount_due >= 0),
  amount_paid     numeric(12,2) NOT NULL DEFAULT 0,
  currency        character varying NOT NULL DEFAULT 'IDR',
  status          booking_status NOT NULL DEFAULT 'PENDING',
  notes           text,
  created_by      uuid,
  cancelled_by    uuid,
  cancelled_at    timestamp with time zone,
  cancel_reason   text,
  created_at      timestamp with time zone NOT NULL DEFAULT now(),
  updated_at      timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT bookings_pkey PRIMARY KEY (id),
  CONSTRAINT bookings_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE CASCADE,
  CONSTRAINT bookings_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE RESTRICT,
  CONSTRAINT bookings_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT bookings_cancelled_by_fkey FOREIGN KEY (cancelled_by) REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT bookings_business_number_unique UNIQUE (business_id, booking_number),
  CONSTRAINT bookings_date_range_check CHECK (end_at > start_at)
);

CREATE TABLE public.booking_items (
  id                 uuid NOT NULL DEFAULT gen_random_uuid(),
  booking_id         uuid NOT NULL,
  rental_item_id     uuid NOT NULL,
  item_name_snapshot character varying NOT NULL,
  unit_price         numeric NOT NULL DEFAULT 0.0000 CHECK (unit_price >= 0),
  quantity           integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  subtotal           numeric NOT NULL DEFAULT 0.0000 CHECK (subtotal >= 0),
  created_at         timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT booking_items_pkey PRIMARY KEY (id),
  CONSTRAINT booking_items_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE,
  CONSTRAINT booking_items_rental_item_id_fkey FOREIGN KEY (rental_item_id) REFERENCES public.rental_items(id) ON DELETE RESTRICT
);

CREATE TABLE public.payments (
  id           uuid NOT NULL DEFAULT gen_random_uuid(),
  business_id  uuid NOT NULL,
  booking_id   uuid NOT NULL,
  amount       numeric NOT NULL CHECK (amount > 0),
  currency     character varying NOT NULL DEFAULT 'IDR',
  method       payment_method NOT NULL DEFAULT 'CASH',
  status       payment_status NOT NULL DEFAULT 'COMPLETED',
  reference    character varying,
  paid_at      timestamp with time zone NOT NULL DEFAULT now(),
  created_by   uuid,
  created_at   timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE CASCADE,
  CONSTRAINT payments_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE,
  CONSTRAINT payments_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL
);
```

---

## BLOK 4 — Tabel Billing (Multi-Produk)

```sql
CREATE TABLE public.products (
  id           serial PRIMARY KEY,
  code         character varying NOT NULL UNIQUE,
  name         character varying NOT NULL,
  description  text,
  base_app_url character varying NOT NULL,
  icon_url     character varying,
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamp with time zone NOT NULL DEFAULT now()
);

INSERT INTO public.products (code, name, description, base_app_url) VALUES
('rental_manager', 'Rental Manager', 'Manajemen inventaris & transaksi rental', 'https://rental.namadomain.com');

CREATE TABLE public.plans (
  id                          serial PRIMARY KEY,
  product_id                  integer NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  code                        character varying NOT NULL,
  name                        character varying NOT NULL,
  price                       numeric(12,2) NOT NULL DEFAULT 0,
  duration_days               integer,
  max_items                   integer NOT NULL DEFAULT 10,
  max_bookings_per_month      integer NOT NULL DEFAULT 20,
  max_customers               integer NOT NULL DEFAULT 50,
  max_staff                   integer NOT NULL DEFAULT 1,
  features                    jsonb NOT NULL DEFAULT '{}',
  is_active                   boolean NOT NULL DEFAULT true,
  created_at                  timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (product_id, code)
);

INSERT INTO public.plans (product_id, code, name, price, duration_days, max_items, max_bookings_per_month, max_customers, max_staff, features)
SELECT id, 'free', 'Free', 0, NULL, 10, 20, 50, 1,
       '{"export_excel": false, "custom_logo": false, "api_access": false}'::jsonb
FROM public.products WHERE code = 'rental_manager';

INSERT INTO public.plans (product_id, code, name, price, duration_days, max_items, max_bookings_per_month, max_customers, max_staff, features)
SELECT id, 'pro_monthly', 'Pro Bulanan', 99000, 30, 500, -1, -1, 5,
       '{"export_excel": true, "custom_logo": true, "api_access": false}'::jsonb
FROM public.products WHERE code = 'rental_manager';

INSERT INTO public.plans (product_id, code, name, price, duration_days, max_items, max_bookings_per_month, max_customers, max_staff, features)
SELECT id, 'lifetime', 'Lifetime', 1499000, NULL, -1, -1, -1, 10,
       '{"export_excel": true, "custom_logo": true, "api_access": true}'::jsonb
FROM public.products WHERE code = 'rental_manager';

CREATE TABLE public.subscriptions (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id             uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  product_id              integer NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  plan_id                 integer NOT NULL REFERENCES public.plans(id),
  plan_type               character varying NOT NULL,
  is_active               boolean NOT NULL DEFAULT true,
  is_lifetime             boolean NOT NULL DEFAULT false,
  started_at              timestamp with time zone NOT NULL DEFAULT now(),
  expires_at              timestamp with time zone,
  midtrans_order_id       character varying,
  midtrans_transaction_id character varying,
  last_payment_status     character varying,
  created_at              timestamp with time zone NOT NULL DEFAULT now(),
  updated_at              timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT chk_expires_valid CHECK (
      (plan_type IN ('free', 'lifetime') AND expires_at IS NULL)
      OR plan_type = 'pro_monthly'
  ),
  CONSTRAINT chk_plan_type CHECK (plan_type IN ('free', 'pro_monthly', 'lifetime'))
);

CREATE UNIQUE INDEX idx_one_active_sub_per_business_product
    ON public.subscriptions(business_id, product_id) WHERE is_active = true;

CREATE INDEX idx_subscriptions_expires
    ON public.subscriptions(expires_at) WHERE plan_type = 'pro_monthly' AND is_active = true;

CREATE INDEX idx_subscriptions_order_id ON public.subscriptions(midtrans_order_id);

CREATE TABLE public.usage_counters (
  business_id                 uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  product_id                  integer NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  total_items                 integer NOT NULL DEFAULT 0,
  total_customers             integer NOT NULL DEFAULT 0,
  total_bookings_this_month   integer NOT NULL DEFAULT 0,
  period_month                date NOT NULL DEFAULT date_trunc('month', now())::date,
  updated_at                  timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (business_id, product_id)
);

CREATE TABLE public.payment_logs (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id           character varying,
  transaction_id     character varying,
  transaction_status character varying,
  gross_amount       numeric(12,2),
  raw_payload        jsonb NOT NULL,
  signature_valid    boolean,
  processed          boolean NOT NULL DEFAULT false,
  error_message      text,
  created_at         timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_payment_logs_order ON public.payment_logs(order_id);
```

---

## BLOK 5 — Trigger: Auto-Create Profil Saat User Daftar

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.users (id, email, name, avatar_url, business_id, onboarding_completed)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            split_part(NEW.email, '@', 1)
        ),
        NEW.raw_user_meta_data->>'avatar_url',
        NULL,
        false
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## BLOK 6 — Function: Onboarding (Buat Toko + Aktifkan Plan Free)

```sql
CREATE OR REPLACE FUNCTION public.complete_onboarding(
    p_business_name character varying,
    p_phone character varying DEFAULT NULL,
    p_address text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_user_id uuid := auth.uid();
    v_business_id uuid;
    v_user_email character varying;
    v_product_id integer;
    v_free_plan_id integer;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    SELECT business_id INTO v_business_id FROM public.users WHERE id = v_user_id;
    IF v_business_id IS NOT NULL THEN
        RETURN v_business_id;
    END IF;

    SELECT email INTO v_user_email FROM public.users WHERE id = v_user_id;

    INSERT INTO public.businesses (owner_id, name, email, phone, address)
    VALUES (v_user_id, p_business_name, v_user_email, p_phone, p_address)
    RETURNING id INTO v_business_id;

    UPDATE public.users
    SET business_id = v_business_id,
        role = 'owner',
        onboarding_completed = true,
        updated_at = now()
    WHERE id = v_user_id;

    SELECT id INTO v_product_id FROM public.products WHERE code = 'rental_manager';
    SELECT id INTO v_free_plan_id FROM public.plans WHERE product_id = v_product_id AND code = 'free';

    IF v_product_id IS NOT NULL AND v_free_plan_id IS NOT NULL THEN
        INSERT INTO public.subscriptions (business_id, product_id, plan_id, plan_type, is_active)
        VALUES (v_business_id, v_product_id, v_free_plan_id, 'free', true)
        ON CONFLICT DO NOTHING;

        INSERT INTO public.usage_counters (business_id, product_id)
        VALUES (v_business_id, v_product_id)
        ON CONFLICT DO NOTHING;
    END IF;

    RETURN v_business_id;
END;
$$;
```

---

## BLOK 7 — Trigger `updated_at`

```sql
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DO $$
DECLARE t text;
BEGIN
    FOREACH t IN ARRAY ARRAY['businesses','users','categories','rental_items','customers','bookings','subscriptions']
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_set_updated_at ON public.%I', t);
        EXECUTE format(
            'CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON public.%I
             FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', t
        );
    END LOOP;
END $$;
```

---

## BLOK 8 — Index Performa

```sql
CREATE INDEX idx_users_business        ON public.users(business_id);
CREATE INDEX idx_categories_business   ON public.categories(business_id);
CREATE INDEX idx_rental_items_business ON public.rental_items(business_id);
CREATE INDEX idx_rental_items_category ON public.rental_items(category_id);
CREATE INDEX idx_customers_business    ON public.customers(business_id);
CREATE INDEX idx_bookings_business     ON public.bookings(business_id);
CREATE INDEX idx_bookings_customer     ON public.bookings(customer_id);
CREATE INDEX idx_bookings_status       ON public.bookings(business_id, status);
CREATE INDEX idx_bookings_dates        ON public.bookings(business_id, start_at, end_at);
CREATE INDEX idx_booking_items_booking ON public.booking_items(booking_id);
CREATE INDEX idx_booking_items_item    ON public.booking_items(rental_item_id);
CREATE INDEX idx_payments_booking      ON public.payments(booking_id);
CREATE INDEX idx_payments_business     ON public.payments(business_id);
```

---

## BLOK 9 — Trigger Usage Counter (untuk Enforcement Limit)

```sql
CREATE OR REPLACE FUNCTION public.fn_sync_item_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_product_id integer;
BEGIN
    SELECT id INTO v_product_id FROM public.products WHERE code = 'rental_manager';

    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.usage_counters (business_id, product_id, total_items)
        VALUES (NEW.business_id, v_product_id, 1)
        ON CONFLICT (business_id, product_id) DO UPDATE
        SET total_items = usage_counters.total_items + 1, updated_at = now();
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.usage_counters
        SET total_items = GREATEST(total_items - 1, 0), updated_at = now()
        WHERE business_id = OLD.business_id AND product_id = v_product_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_item_count ON public.rental_items;
CREATE TRIGGER trg_sync_item_count
    AFTER INSERT OR DELETE ON public.rental_items
    FOR EACH ROW EXECUTE FUNCTION public.fn_sync_item_count();

CREATE OR REPLACE FUNCTION public.fn_sync_booking_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_product_id integer;
BEGIN
    SELECT id INTO v_product_id FROM public.products WHERE code = 'rental_manager';

    INSERT INTO public.usage_counters (business_id, product_id, total_bookings_this_month, period_month)
    VALUES (NEW.business_id, v_product_id, 1, date_trunc('month', now())::date)
    ON CONFLICT (business_id, product_id) DO UPDATE
    SET total_bookings_this_month = CASE
            WHEN usage_counters.period_month = date_trunc('month', now())::date
            THEN usage_counters.total_bookings_this_month + 1
            ELSE 1
        END,
        period_month = date_trunc('month', now())::date,
        updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_booking_count ON public.bookings;
CREATE TRIGGER trg_sync_booking_count
    AFTER INSERT ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.fn_sync_booking_count();

CREATE OR REPLACE FUNCTION public.fn_sync_customer_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_product_id integer;
BEGIN
    SELECT id INTO v_product_id FROM public.products WHERE code = 'rental_manager';
    INSERT INTO public.usage_counters (business_id, product_id, total_customers)
    VALUES (NEW.business_id, v_product_id, 1)
    ON CONFLICT (business_id, product_id) DO UPDATE
    SET total_customers = usage_counters.total_customers + 1, updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_customer_count ON public.customers;
CREATE TRIGGER trg_sync_customer_count
    AFTER INSERT ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.fn_sync_customer_count();
```

---

## BLOK 10 — Function: Cek Ketersediaan Stok

```sql
CREATE OR REPLACE FUNCTION public.get_available_quantity(
    p_rental_item_id uuid,
    p_start_at timestamptz,
    p_end_at timestamptz,
    p_exclude_booking_id uuid DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_total integer;
    v_booked integer;
BEGIN
    SELECT total_quantity INTO v_total FROM public.rental_items WHERE id = p_rental_item_id;
    IF v_total IS NULL THEN RETURN 0; END IF;

    SELECT COALESCE(SUM(bi.quantity), 0) INTO v_booked
    FROM public.booking_items bi
    JOIN public.bookings b ON b.id = bi.booking_id
    WHERE bi.rental_item_id = p_rental_item_id
      AND b.status IN ('CONFIRMED', 'ONGOING', 'OVERDUE')
      AND (p_exclude_booking_id IS NULL OR b.id <> p_exclude_booking_id)
      AND b.start_at < p_end_at
      AND b.end_at > p_start_at;

    RETURN GREATEST(v_total - v_booked, 0);
END;
$$;
```

---

## BLOK 11 — Row Level Security (RLS) — JANGAN DILEWAT

```sql
CREATE OR REPLACE FUNCTION public.current_business_id()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
    SELECT business_id FROM public.users WHERE id = auth.uid();
$$;

ALTER TABLE public.businesses     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_logs   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read own business" ON public.businesses FOR SELECT
    USING (id = public.current_business_id());
CREATE POLICY "update own business" ON public.businesses FOR UPDATE
    USING (id = public.current_business_id() AND owner_id = auth.uid());

CREATE POLICY "read users in same business" ON public.users FOR SELECT
    USING (id = auth.uid() OR business_id = public.current_business_id());
CREATE POLICY "update own profile" ON public.users FOR UPDATE
    USING (id = auth.uid());

CREATE POLICY "tenant access categories" ON public.categories FOR ALL
    USING (business_id = public.current_business_id())
    WITH CHECK (business_id = public.current_business_id());

CREATE POLICY "tenant access rental_items" ON public.rental_items FOR ALL
    USING (business_id = public.current_business_id())
    WITH CHECK (business_id = public.current_business_id());

CREATE POLICY "tenant access customers" ON public.customers FOR ALL
    USING (business_id = public.current_business_id())
    WITH CHECK (business_id = public.current_business_id());

CREATE POLICY "tenant access bookings" ON public.bookings FOR ALL
    USING (business_id = public.current_business_id())
    WITH CHECK (business_id = public.current_business_id());

CREATE POLICY "tenant access payments" ON public.payments FOR ALL
    USING (business_id = public.current_business_id())
    WITH CHECK (business_id = public.current_business_id());

CREATE POLICY "tenant access booking_items" ON public.booking_items FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.bookings b
        WHERE b.id = booking_items.booking_id
          AND b.business_id = public.current_business_id()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.bookings b
        WHERE b.id = booking_items.booking_id
          AND b.business_id = public.current_business_id()
    ));

CREATE POLICY "read own subscription" ON public.subscriptions FOR SELECT
    USING (business_id = public.current_business_id());

CREATE POLICY "read own usage" ON public.usage_counters FOR SELECT
    USING (business_id = public.current_business_id());

CREATE POLICY "read active products" ON public.products FOR SELECT
    TO authenticated USING (is_active = true);
CREATE POLICY "read active plans" ON public.plans FOR SELECT
    TO authenticated USING (is_active = true);

-- payment_logs: tidak ada policy → hanya service_role yang bisa akses
```

---

## Verifikasi Setelah Semua Blok Selesai

```sql
-- 1. Semua tabel harus ada (13 tabel)
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- 2. RLS harus aktif ('t') di semua tabel
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- 3. Data seed plan harus ada 3 baris
SELECT p.code AS product, pl.code AS plan, pl.price, pl.max_items
FROM public.plans pl JOIN public.products p ON p.id = pl.product_id;
```

Kalau ketiganya bersih, lanjut ke **generate TypeScript types**:

```bash
npx supabase gen types typescript --axsnymnhobwjnhnizfsl [PROJECT_ID_ANDA] --schema public > lib/database.types.ts
```

Baru setelah itu masuk setup Google OAuth dan mulai kasih prompt ke Antigravity (lihat `FRESH-START-ANTIGRAVITY.md`).
