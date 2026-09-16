# Supabase Schema Final — SaaS Rental + Integrasi Billing Laravel

**Status:** Revisi dari schema existing Anda
**Tujuan:** Siap untuk onboarding (nama toko), Google OAuth, dan integrasi billing multi-produk dengan Laravel + Midtrans

---

## BAGIAN 1 — Review Schema Anda: Apa yang Sudah Benar & Apa yang Bermasalah

### ✅ Yang Sudah Bagus

1. **Pola multi-tenant via `business_id`** — ini keputusan yang tepat. Data di-scope per toko, bukan per user, jadi nanti kalau satu toko punya beberapa staff (owner + kasir), mereka tetap berbagi data yang sama.
2. **`item_name_snapshot` di `booking_items`** — bagus sekali. Nama barang disimpan sebagai snapshot saat transaksi dibuat, jadi kalau nama barang diubah nanti, riwayat booking lama tidak ikut berubah. Ini sering dilupakan developer pemula.
3. **CHECK constraints** pada `price >= 0`, `quantity > 0`, dll — defensive dan benar.
4. **Pemisahan `bookings` dan `payments`** sebagai tabel terpisah — memungkinkan cicilan/DP (satu booking bisa punya banyak payment).
5. **`created_by` / `cancelled_by` referencing `auth.users`** — audit trail yang baik.

### ❌ Masalah yang HARUS Diperbaiki

| # | Masalah | Dampak | Solusi |
|---|---|---|---|
| **1** | **`users.business_id` = NOT NULL** | **BLOCKER untuk Google OAuth.** Saat user login pertama kali via Google, Supabase otomatis membuat row di `auth.users`, tapi belum ada `businesses` sama sekali. Trigger pembuat profil akan gagal karena `business_id` wajib diisi. | Jadikan **nullable**, isi setelah onboarding |
| **2** | **Tidak ada tabel billing sama sekali** | Laravel tidak punya tempat menulis status langganan | Tambah `products`, `plans`, `subscriptions`, `usage_counters` |
| **3** | **Entitas billing tidak jelas** | Di dokumen PRD sebelumnya saya pakai `user_id`, tapi schema Anda multi-tenant per business. Kalau billing di-scope ke user, satu toko dengan 2 staff bisa punya 2 langganan berbeda — kacau. | **Billing di-scope ke `business_id`**, bukan `user_id` |
| **4** | **ENUM belum didefinisikan** | `USER-DEFINED` (booking_status, payment_method, payment_status) akan error kalau di-run di database baru | Definisikan `CREATE TYPE` dulu |
| **5** | **`booking_number` tidak unique** | Bisa ada 2 booking dengan nomor sama dalam 1 toko | `UNIQUE (business_id, booking_number)` |
| **6** | **`sku` tidak unique** | Duplikasi SKU dalam 1 toko | `UNIQUE (business_id, sku)` |
| **7** | **Tidak ada index pada foreign key** | Query lambat saat data sudah ribuan baris | Tambah index (lihat §2.9) |
| **8** | **`updated_at` tidak auto-update** | Kolomnya ada tapi nilainya tidak pernah berubah kecuali di-set manual dari aplikasi | Trigger `set_updated_at()` |
| **9** | **Tidak ada RLS sama sekali** | ⚠️ **BAHAYA KEAMANAN.** Siapa pun dengan anon key bisa baca/tulis data toko orang lain | Aktifkan RLS + policy per tabel |
| **10** | **Tidak ada `owner_id` di `businesses`** | Sulit menentukan siapa pemilik toko untuk keperluan billing & transfer kepemilikan | Tambah kolom `owner_id` |
| **11** | **Tidak ada tracking stok tersedia** | `total_quantity` ada, tapi tidak ada cara tahu berapa yang sedang disewa pada tanggal tertentu | Tambah function `get_available_quantity()` |

---

## BAGIAN 2 — Schema Final (Jalankan di Supabase SQL Editor)

> Jalankan berurutan dari §2.1 sampai §2.11. Kalau Anda sudah punya data existing, backup dulu sebelum menjalankan `ALTER TABLE`.

### 2.1 Definisi ENUM Types

```sql
-- Jalankan ini PALING PERTAMA jika database masih kosong
DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM (
        'PENDING',      -- baru dibuat, belum dikonfirmasi
        'CONFIRMED',    -- sudah dikonfirmasi, barang belum diambil
        'ONGOING',      -- barang sedang di tangan customer
        'COMPLETED',    -- barang sudah dikembalikan
        'CANCELLED',    -- dibatalkan
        'OVERDUE'       -- lewat jatuh tempo, belum dikembalikan
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

### 2.2 Tabel `businesses` (Direvisi)

```sql
CREATE TABLE IF NOT EXISTS public.businesses (
  id              uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id        uuid,                                    -- ➕ BARU: pemilik toko (untuk billing)
  name            character varying NOT NULL,
  slug            character varying UNIQUE,                 -- ➕ BARU: untuk URL cantik, opsional
  logo_url        text,
  phone           character varying,
  email           character varying,
  address         text,                                     -- ➕ BARU: alamat toko
  currency        character varying NOT NULL DEFAULT 'IDR',
  operating_hours text,
  timezone        character varying NOT NULL DEFAULT 'Asia/Jakarta',  -- ➕ BARU: penting untuk perhitungan sewa harian
  created_at      timestamp with time zone NOT NULL DEFAULT now(),
  updated_at      timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT businesses_pkey PRIMARY KEY (id),
  CONSTRAINT businesses_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Jika tabel sudah ada, jalankan ini sebagai gantinya:
-- ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
-- ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS slug character varying UNIQUE;
-- ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS address text;
-- ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS timezone character varying NOT NULL DEFAULT 'Asia/Jakarta';
```

### 2.3 Tabel `users` (Direvisi — PENTING untuk Google OAuth)

```sql
CREATE TABLE IF NOT EXISTS public.users (
  id                   uuid NOT NULL,
  business_id          uuid,                              -- 🔄 DIUBAH: dari NOT NULL jadi NULLABLE
  role                 character varying NOT NULL DEFAULT 'owner',
  name                 character varying NOT NULL DEFAULT '',  -- 🔄 diberi default, Google kadang tidak kirim nama
  email                character varying NOT NULL,
  avatar_url           text,                               -- ➕ BARU: dari Google profile picture
  onboarding_completed boolean NOT NULL DEFAULT false,      -- ➕ BARU: penanda sudah isi nama toko atau belum
  created_at           timestamp with time zone NOT NULL DEFAULT now(),
  updated_at           timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT users_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON DELETE SET NULL,
  CONSTRAINT users_role_check CHECK (role IN ('owner', 'admin', 'staff'))
);

-- Jika tabel sudah ada:
-- ALTER TABLE public.users ALTER COLUMN business_id DROP NOT NULL;
-- ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url text;
-- ALTER TABLE public.users ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;
```

> **Kenapa `business_id` harus nullable?** Urutan kejadian saat user daftar via Google:
> 1. User klik "Login dengan Google" → Supabase buat row di `auth.users`
> 2. Trigger otomatis buat row di `public.users` — **tapi toko belum ada!**
> 3. User diarahkan ke halaman onboarding → isi nama toko
> 4. Baru `businesses` dibuat, lalu `users.business_id` di-update
>
> Kalau `business_id` NOT NULL, langkah 2 akan gagal total dan user tidak bisa login sama sekali.

### 2.4 Trigger Auto-Create Profil Saat User Daftar (Email & Google)

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
        -- Google mengirim nama di raw_user_meta_data; email/password tidak, jadi fallback ke email
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            split_part(NEW.email, '@', 1)
        ),
        NEW.raw_user_meta_data->>'avatar_url',
        NULL,      -- belum punya toko
        false      -- belum onboarding
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

### 2.5 Function Onboarding — Buat Toko + Link ke User (Atomic)

Ini yang dipanggil aplikasi saat user submit form "Nama Toko":

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
    SELECT id INTO v_free_plan_id FROM public.plans
        WHERE product_id = v_product_id AND code = 'free';

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

**Cara panggil dari Next.js:**

```typescript
const { data, error } = await supabase.rpc('complete_onboarding', {
  p_business_name: 'Rental Kamera Jaya',
  p_phone: '081234567890',
  p_address: 'Jl. Merdeka No. 10',
});
// data = business_id yang baru dibuat
```

### 2.6 Tabel Billing — `products`, `plans`, `subscriptions`, `usage_counters`

> **Perubahan penting dari dokumen PRD sebelumnya:** semua di-scope ke **`business_id`**, bukan `user_id`. Karena toko adalah entitas yang berlangganan, bukan individu. Kalau nanti toko punya 3 staff, ketiganya berbagi satu langganan yang sama.

```sql
-- ============ PRODUCTS ============
CREATE TABLE IF NOT EXISTS public.products (
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
('rental_manager', 'Rental Manager', 'Manajemen inventaris & transaksi rental', 'https://rental.namadomain.com')
ON CONFLICT (code) DO NOTHING;

-- ============ PLANS ============
CREATE TABLE IF NOT EXISTS public.plans (
  id                          serial PRIMARY KEY,
  product_id                  integer NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  code                        character varying NOT NULL,
  name                        character varying NOT NULL,
  price                       numeric(12,2) NOT NULL DEFAULT 0,
  duration_days               integer,
  max_items                   integer NOT NULL DEFAULT 10,     -- -1 = unlimited
  max_bookings_per_month      integer NOT NULL DEFAULT 20,     -- -1 = unlimited
  max_customers               integer NOT NULL DEFAULT 50,     -- -1 = unlimited
  max_staff                   integer NOT NULL DEFAULT 1,      -- berapa user boleh join 1 toko
  features                    jsonb NOT NULL DEFAULT '{}',     -- fitur boolean: {"export_excel": true, "api_access": false}
  is_active                   boolean NOT NULL DEFAULT true,
  created_at                  timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (product_id, code)
);

INSERT INTO public.plans (product_id, code, name, price, duration_days, max_items, max_bookings_per_month, max_customers, max_staff, features)
SELECT id, 'free', 'Free', 0, NULL, 10, 20, 50, 1,
       '{"export_excel": false, "custom_logo": false, "api_access": false}'::jsonb
FROM public.products WHERE code = 'rental_manager'
ON CONFLICT (product_id, code) DO NOTHING;

INSERT INTO public.plans (product_id, code, name, price, duration_days, max_items, max_bookings_per_month, max_customers, max_staff, features)
SELECT id, 'pro_monthly', 'Pro Bulanan', 99000, 30, 500, -1, -1, 5,
       '{"export_excel": true, "custom_logo": true, "api_access": false}'::jsonb
FROM public.products WHERE code = 'rental_manager'
ON CONFLICT (product_id, code) DO NOTHING;

INSERT INTO public.plans (product_id, code, name, price, duration_days, max_items, max_bookings_per_month, max_customers, max_staff, features)
SELECT id, 'lifetime', 'Lifetime', 1499000, NULL, -1, -1, -1, 10,
       '{"export_excel": true, "custom_logo": true, "api_access": true}'::jsonb
FROM public.products WHERE code = 'rental_manager'
ON CONFLICT (product_id, code) DO NOTHING;

-- ============ SUBSCRIPTIONS ============
CREATE TABLE IF NOT EXISTS public.subscriptions (
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

-- Hanya boleh 1 subscription AKTIF per (toko × produk)
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_sub_per_business_product
    ON public.subscriptions(business_id, product_id) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_subscriptions_expires
    ON public.subscriptions(expires_at) WHERE plan_type = 'pro_monthly' AND is_active = true;

CREATE INDEX IF NOT EXISTS idx_subscriptions_order_id
    ON public.subscriptions(midtrans_order_id);

-- ============ USAGE COUNTERS ============
CREATE TABLE IF NOT EXISTS public.usage_counters (
  business_id             uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  product_id              integer NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  total_items             integer NOT NULL DEFAULT 0,
  total_customers         integer NOT NULL DEFAULT 0,
  total_bookings_this_month integer NOT NULL DEFAULT 0,
  period_month            date NOT NULL DEFAULT date_trunc('month', now())::date,
  updated_at              timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (business_id, product_id)
);

-- ============ PAYMENT LOGS (audit trail webhook) ============
CREATE TABLE IF NOT EXISTS public.payment_logs (
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

CREATE INDEX IF NOT EXISTS idx_payment_logs_order ON public.payment_logs(order_id);
```

### 2.7 Tabel Operasional (Direvisi — tambah unique constraint)

```sql
-- CATEGORIES: nama kategori unik per toko
ALTER TABLE public.categories
    ADD CONSTRAINT categories_business_name_unique UNIQUE (business_id, name);

-- RENTAL_ITEMS: SKU unik per toko (hanya yang tidak NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_rental_items_sku_unique
    ON public.rental_items(business_id, sku) WHERE sku IS NOT NULL;

-- Tambahan kolom yang berguna
ALTER TABLE public.rental_items ADD COLUMN IF NOT EXISTS deposit_amount numeric(12,2) NOT NULL DEFAULT 0;
ALTER TABLE public.rental_items ADD COLUMN IF NOT EXISTS price_unit character varying NOT NULL DEFAULT 'DAY';
ALTER TABLE public.rental_items ADD CONSTRAINT rental_items_price_unit_check
    CHECK (price_unit IN ('HOUR', 'DAY', 'WEEK', 'MONTH'));

-- BOOKINGS: nomor booking unik per toko
ALTER TABLE public.bookings
    ADD CONSTRAINT bookings_business_number_unique UNIQUE (business_id, booking_number);

-- BOOKINGS: pastikan end_at selalu setelah start_at
ALTER TABLE public.bookings
    ADD CONSTRAINT bookings_date_range_check CHECK (end_at > start_at);

-- BOOKINGS: tambahan kolom deposit & total dibayar
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS deposit_total numeric(12,2) NOT NULL DEFAULT 0;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS amount_paid numeric(12,2) NOT NULL DEFAULT 0;

-- CUSTOMERS: cegah duplikat nomor HP per toko
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_phone_unique
    ON public.customers(business_id, phone) WHERE phone IS NOT NULL;
```

### 2.8 Trigger Auto-Update `updated_at`

```sql
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Terapkan ke semua tabel yang punya kolom updated_at
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

### 2.9 Index untuk Performa

```sql
CREATE INDEX IF NOT EXISTS idx_users_business        ON public.users(business_id);
CREATE INDEX IF NOT EXISTS idx_categories_business   ON public.categories(business_id);
CREATE INDEX IF NOT EXISTS idx_rental_items_business ON public.rental_items(business_id);
CREATE INDEX IF NOT EXISTS idx_rental_items_category ON public.rental_items(category_id);
CREATE INDEX IF NOT EXISTS idx_customers_business    ON public.customers(business_id);
CREATE INDEX IF NOT EXISTS idx_bookings_business     ON public.bookings(business_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer     ON public.bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status       ON public.bookings(business_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates        ON public.bookings(business_id, start_at, end_at);
CREATE INDEX IF NOT EXISTS idx_booking_items_booking ON public.booking_items(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_items_item    ON public.booking_items(rental_item_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking      ON public.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_business     ON public.payments(business_id);
```

### 2.10 Trigger Usage Counter (untuk Enforcement Limit)

```sql
-- Hitung item
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

-- Hitung booking per bulan
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

-- Hitung customer
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

### 2.11 Helper Function: Cek Ketersediaan Stok

Ini yang hilang dari schema Anda — cara tahu berapa unit barang yang masih bisa disewa pada rentang tanggal tertentu:

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
      AND b.status IN ('CONFIRMED', 'ONGOING', 'OVERDUE')   -- PENDING & CANCELLED tidak mengunci stok
      AND (p_exclude_booking_id IS NULL OR b.id <> p_exclude_booking_id)
      AND b.start_at < p_end_at        -- logika overlap rentang waktu
      AND b.end_at > p_start_at;

    RETURN GREATEST(v_total - v_booked, 0);
END;
$$;
```

---

## BAGIAN 3 — Row Level Security (RLS)

⚠️ **Ini bagian yang paling krusial dan paling sering dilupakan.** Tanpa ini, siapa pun yang punya anon key (yang memang di-expose ke browser) bisa membaca data semua toko.

```sql
-- Helper: ambil business_id milik user yang sedang login
CREATE OR REPLACE FUNCTION public.current_business_id()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
    SELECT business_id FROM public.users WHERE id = auth.uid();
$$;

-- Aktifkan RLS di semua tabel
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

-- ===== BUSINESSES =====
CREATE POLICY "read own business" ON public.businesses FOR SELECT
    USING (id = public.current_business_id());
CREATE POLICY "update own business" ON public.businesses FOR UPDATE
    USING (id = public.current_business_id() AND owner_id = auth.uid());

-- ===== USERS =====
CREATE POLICY "read users in same business" ON public.users FOR SELECT
    USING (id = auth.uid() OR business_id = public.current_business_id());
CREATE POLICY "update own profile" ON public.users FOR UPDATE
    USING (id = auth.uid());

-- ===== TABEL OPERASIONAL (pola sama untuk semua) =====
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

-- booking_items tidak punya business_id, jadi cek lewat parent booking
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

-- ===== BILLING: READ-ONLY untuk user, WRITE hanya via service_role (Laravel) =====
CREATE POLICY "read own subscription" ON public.subscriptions FOR SELECT
    USING (business_id = public.current_business_id());

CREATE POLICY "read own usage" ON public.usage_counters FOR SELECT
    USING (business_id = public.current_business_id());
-- SENGAJA tidak ada policy INSERT/UPDATE/DELETE di 2 tabel ini.
-- Hanya service_role key (dipakai Laravel webhook) yang bisa menulis —
-- service_role otomatis bypass RLS. Ini mencegah user mengubah status
-- langganannya sendiri lewat browser.

-- ===== KATALOG: boleh dibaca semua orang yang login =====
CREATE POLICY "read active products" ON public.products FOR SELECT
    TO authenticated USING (is_active = true);
CREATE POLICY "read active plans" ON public.plans FOR SELECT
    TO authenticated USING (is_active = true);

-- payment_logs: tidak ada policy sama sekali → hanya service_role yang bisa akses
```

---

## BAGIAN 4 — Setup Google OAuth di Supabase

### 4.1 Buat Credential di Google Cloud Console

1. Buka https://console.cloud.google.com → buat project baru (atau pakai yang ada).
2. Menu **APIs & Services → OAuth consent screen** → pilih **External** → isi nama app, email support, logo.
3. Menu **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
4. Application type: **Web application**.
5. **Authorized redirect URIs**, isi dengan callback Supabase:
   ```
   https://xxxxxxxxxxxx.supabase.co/auth/v1/callback
   ```
   (ganti `xxxxxxxxxxxx` dengan project ref Supabase Anda)
6. Copy **Client ID** dan **Client Secret**.

### 4.2 Aktifkan di Supabase

1. Supabase Dashboard → **Authentication → Providers → Google** → toggle **Enabled**.
2. Paste Client ID & Client Secret → **Save**.
3. Menu **Authentication → URL Configuration**:
   - **Site URL**: `https://rental.namadomain.com`
   - **Redirect URLs** (tambahkan semua, satu per baris):
     ```
     http://localhost:3000/**
     https://rental.namadomain.com/**
     https://billing.namadomain.com/**
     ```

### 4.3 Kode Login di Next.js

```typescript
// components/GoogleLoginButton.tsx
'use client';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

export function GoogleLoginButton() {
  const supabase = createBrowserSupabaseClient();

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return <button onClick={handleLogin}>Masuk dengan Google</button>;
}
```

```typescript
// app/auth/callback/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(),
                   setAll: (c) => c.forEach(({ name, value, options }) =>
                     cookieStore.set(name, value, options)) } }
    );

    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && user) {
      // Cek apakah sudah onboarding
      const { data: profile } = await supabase
        .from('users')
        .select('onboarding_completed, business_id')
        .eq('id', user.id)
        .single();

      if (!profile?.onboarding_completed || !profile?.business_id) {
        return NextResponse.redirect(`${origin}/onboarding`);
      }
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
```

### 4.4 Halaman Onboarding (Input Nama Toko)

```tsx
// app/onboarding/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

export default function OnboardingPage() {
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  const handleSubmit = async () => {
    if (!businessName.trim()) return;
    setLoading(true);

    const { data, error } = await supabase.rpc('complete_onboarding', {
      p_business_name: businessName.trim(),
      p_phone: phone || null,
    });

    setLoading(false);
    if (error) {
      alert('Gagal membuat toko: ' + error.message);
      return;
    }
    router.push('/dashboard');
  };

  return (
    <div>
      <h1>Selamat datang! Buat toko rental Anda</h1>
      <input
        value={businessName}
        onChange={(e) => setBusinessName(e.target.value)}
        placeholder="Nama Toko (mis. Rental Kamera Jaya)"
      />
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Nomor WhatsApp (opsional)"
      />
      <button onClick={handleSubmit} disabled={loading || !businessName.trim()}>
        {loading ? 'Membuat...' : 'Mulai Gunakan'}
      </button>
    </div>
  );
}
```

### 4.5 Middleware Proteksi Onboarding

```typescript
// middleware.ts — pastikan user yang belum punya toko selalu diarahkan ke /onboarding
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(),
                 setAll: (c) => c.forEach(({ name, value, options }) =>
                   response.cookies.set(name, value, options)) } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  if (!user && !path.startsWith('/login') && !path.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (user && !path.startsWith('/onboarding') && !path.startsWith('/auth')) {
    const { data: profile } = await supabase
      .from('users').select('business_id').eq('id', user.id).single();

    if (!profile?.business_id) {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)'],
};
```

---

## BAGIAN 5 — Penyesuaian di Sisi Laravel

Karena entitas billing sekarang **`business_id`** (bukan `user_id`), format `order_id` Midtrans berubah:

```
{product_code}-{plan_code}-{business_id}-{timestamp}

Contoh:
rental_manager-pro_monthly-7c9e6679-7425-40de-944b-e07fc1f90ae7-1694761234
```

**Penyesuaian di `MidtransWebhookController`:**

```php
// parseOrderId() — variabel ketiga sekarang business_id, bukan user_id
private function parseOrderId(string $orderId): ?array
{
    if (preg_match('/^([a-z_]+)-(free|pro_monthly|lifetime)-([0-9a-f\-]{36})-\d+$/', $orderId, $m)) {
        return [$m[1], $m[2], $m[3]];   // [product_code, plan_code, business_id]
    }
    return null;
}

// Semua query yang tadinya ->where('user_id', $userId)
// diganti jadi ->where('business_id', $businessId)
```

**URL upgrade dari Next.js juga menyertakan `business_id`:**

```typescript
const upgradeUrl = `${process.env.NEXT_PUBLIC_BILLING_URL}/checkout`
  + `?product=rental_manager&plan=pro_monthly`
  + `&business=${businessId}`
  + `&callback=${encodeURIComponent(window.location.origin + '/billing/callback')}`;
```

**Query cek limit di Next.js jadi:**

```typescript
export async function canAddItem(businessId: string, productId: number) {
  const sub = await getActiveSubscription(businessId, productId);
  if (sub.maxItems === -1) return { allowed: true };

  const supabase = createServerSupabaseClient();
  const { data: counter } = await supabase
    .from('usage_counters')
    .select('total_items')
    .eq('business_id', businessId)      // 🔄 bukan user_id
    .eq('product_id', productId)
    .single();

  const current = counter?.total_items ?? 0;
  return {
    allowed: current < sub.maxItems,
    currentCount: current,
    limit: sub.maxItems,
    reason: current >= sub.maxItems ? 'ITEM_LIMIT_REACHED' : null,
  };
}
```

---

## BAGIAN 6 — Checklist Eksekusi

- [ ] Backup database existing (kalau sudah ada data)
- [ ] Jalankan §2.1 (ENUM types)
- [ ] Jalankan §2.2 & §2.3 (ALTER businesses & users — **`business_id` jadi nullable**)
- [ ] Jalankan §2.4 (trigger `handle_new_user`)
- [ ] Jalankan §2.6 (tabel billing: products, plans, subscriptions, usage_counters, payment_logs)
- [ ] Jalankan §2.5 (function `complete_onboarding` — harus setelah tabel billing ada)
- [ ] Jalankan §2.7 (unique constraints)
- [ ] Jalankan §2.8 (trigger updated_at)
- [ ] Jalankan §2.9 (index)
- [ ] Jalankan §2.10 (trigger usage counter)
- [ ] Jalankan §2.11 (function ketersediaan stok)
- [ ] Jalankan §3 (RLS policies) — **jangan dilewat**
- [ ] Setup Google OAuth (§4.1 & §4.2)
- [ ] Implementasi halaman login, callback, onboarding, middleware (§4.3–§4.5)
- [ ] Update format `order_id` & query di Laravel (§5)
- [ ] Test: daftar via Google → onboarding → cek row `businesses`, `users.business_id`, `subscriptions` (free) terisi otomatis

---

## Catatan Tambahan yang Perlu Dipikirkan Nanti

1. **Generate `booking_number` otomatis** — sebaiknya pakai sequence per toko (mis. `INV-2026-0001`), bisa dibuat dengan function terpisah. Saat ini masih harus diisi manual dari aplikasi.
2. **Sinkronisasi `amount_due` dan `amount_paid`** — sebaiknya dibuat trigger di tabel `payments` yang otomatis meng-update `bookings.amount_paid` setiap ada pembayaran masuk, supaya tidak perlu dihitung ulang di aplikasi.
3. **Status `OVERDUE` otomatis** — perlu cron job (Supabase Edge Function terjadwal) yang mengubah booking jadi `OVERDUE` kalau `end_at` sudah lewat tapi status masih `ONGOING`.
4. **Soft delete** — pertimbangkan menambah `deleted_at` di `rental_items` dan `customers`, karena menghapus permanen barang yang pernah ada di booking lama akan merusak riwayat (walaupun `item_name_snapshot` sudah menyelamatkan sebagian).
