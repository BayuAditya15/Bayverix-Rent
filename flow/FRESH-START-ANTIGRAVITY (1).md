# Fresh Start — Database dari 0 + Workflow Antigravity

**Kondisi:** Belum ada data production yang perlu dipertahankan. Bebas drop & rebuild.
**Ini jauh lebih simpel dari skenario "setengah jalan"** — tidak perlu backfill, tidak perlu audit kode existing yang rusak.

---

## TAHAP 1 — Reset & Bangun Schema (Manual, Supabase SQL Editor)

### 1.1 (Opsional) Bersihkan Dulu Kalau Ada Sisa Tabel Lama

Kalau project Supabase-nya sudah pernah dipakai coba-coba dan mau benar-benar bersih:

```sql
-- ⚠️ HATI-HATI: ini menghapus semua tabel di schema public. Pastikan memang mau mulai dari 0.
DROP TABLE IF EXISTS public.payment_logs CASCADE;
DROP TABLE IF EXISTS public.usage_counters CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.plans CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.booking_items CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.rental_items CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.businesses CASCADE;

DROP TYPE IF EXISTS booking_status CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;

-- Hapus trigger di auth.users kalau ada sisa dari percobaan sebelumnya
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
```

Kalau mau lebih bersih lagi (termasuk semua user Auth yang pernah dibuat saat testing): Supabase Dashboard → **Authentication → Users** → hapus manual satu-satu, atau lewat **Project Settings → General → Reset Database** kalau memang mau reset total project (ini juga hapus storage, dsb — pikir dulu).

### 1.2 Jalankan Schema Lengkap Sekali Jalan

Karena tidak ada data lama yang perlu dijaga, Anda **tidak perlu pecah per blok seperti skenario sebelumnya** — cukup jalankan seluruh isi `SUPABASE-SCHEMA-FINAL.md` bagian §2 (kecuali komentar `ALTER TABLE ... IF NOT EXISTS` yang memang untuk kasus tabel sudah ada, boleh diskip karena `CREATE TABLE` versi lengkapnya sudah mencakup kolom itu).

Urutan yang tetap harus dijaga (karena foreign key & dependency function):

```
1. §2.1  ENUM types
2. §2.2  CREATE TABLE businesses (versi lengkap, bukan ALTER)
3. §2.3  CREATE TABLE users (versi lengkap, bukan ALTER)
4. CREATE TABLE categories, rental_items, customers, bookings, booking_items, payments
   (copy dari dokumen sebelumnya yang Anda kasih ke saya, sudah benar strukturnya)
5. §2.6  Tabel billing: products, plans, subscriptions, usage_counters, payment_logs
6. §2.4  Trigger handle_new_user
7. §2.5  Function complete_onboarding
8. §2.7  Unique constraints
9. §2.8  Trigger updated_at
10. §2.9 Index
11. §2.10 Trigger usage counter
12. §2.11 Function get_available_quantity
13. §3   RLS policies
```

**Tidak perlu Tahap "Backfill Data Existing"** yang ada di dokumen `ANTIGRAVITY-WORKFLOW.md` sebelumnya — skip bagian itu sepenuhnya, karena memang belum ada toko/user lama yang perlu disesuaikan.

### 1.3 Verifikasi Cepat

```sql
-- Pastikan semua tabel ada
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Pastikan RLS aktif di semua tabel
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public' ORDER BY tablename;
-- rowsecurity harus 't' semua

-- Pastikan data seed plans sudah masuk
SELECT p.code AS product, pl.code AS plan, pl.price, pl.max_items
FROM public.plans pl JOIN public.products p ON p.id = pl.product_id;
```

### 1.4 Generate TypeScript Types (Sebelum Masuk Antigravity)

```bash
npx supabase login
npx supabase gen types typescript --project-id [PROJECT_ID_ANDA] --schema public > lib/database.types.ts
```

Ini penting dilakukan **manual dulu** sebelum minta Antigravity coding, supaya dia langsung punya definisi tipe yang akurat sejak awal, bukan menebak-nebak struktur tabel dari nama kolom di prompt.

---

## TAHAP 2 — Setup Google OAuth (Manual, Sama Seperti Sebelumnya)

Tidak berubah dari dokumen sebelumnya — ikuti `SUPABASE-SCHEMA-FINAL.md` §4.1 dan §4.2.

---

## TAHAP 3 — Siapkan Project untuk Antigravity

### 3.1 Struktur Folder Awal

Karena mulai dari 0, kemungkinan Anda juga mulai project Next.js dari `create-next-app`. Susun begini dulu sebelum panggil Antigravity:

```
project-rental/
├── docs/
│   ├── PRD-SaaS-Rental-Hybrid.md
│   └── SUPABASE-SCHEMA-FINAL.md
├── lib/
│   └── database.types.ts        ← hasil generate di 1.4
├── .env.local                    ← isi manual, JANGAN commit
├── .antigravity/
│   └── rules.md
└── (folder app/, dst — biarkan Antigravity yang isi)
```

### 3.2 File Rules (Disesuaikan untuk Fresh Start)

Bedanya dengan versi "setengah jalan": tidak perlu menyebut kondisi migrasi/legacy sama sekali, karena tidak ada beban kompatibilitas mundur.

```markdown
# Project Rules — SaaS Rental (Fresh Build)

## Konteks
Aplikasi SaaS rental multi-tenant, dibangun dari 0. Bagian dari platform
multi-produk yang lebih besar (billing di Laravel, app di Next.js per produk).

- Frontend: Next.js 14+ App Router, TypeScript strict, di Vercel
- Auth & DB: Supabase (PostgreSQL + Auth + RLS)
- Billing: Laravel + Midtrans (repo terpisah, sudah ada schema di database)

## Schema Database — SUDAH ADA, jangan mengarang struktur baru
Baca @docs/SUPABASE-SCHEMA-FINAL.md dan @lib/database.types.ts sebagai
sumber kebenaran struktur tabel. Semua tabel dan function berikut SUDAH
dibuat di Supabase — jangan buat migration baru untuk tabel yang sama:
businesses, users, categories, rental_items, customers, bookings,
booking_items, payments, products, plans, subscriptions, usage_counters,
payment_logs.

Function yang sudah ada dan siap dipakai:
- complete_onboarding(p_business_name, p_phone, p_address) → uuid
- get_available_quantity(p_rental_item_id, p_start_at, p_end_at, p_exclude_booking_id) → integer
- current_business_id() → uuid (helper RLS, dipakai otomatis oleh policy)

## Aturan WAJIB
1. Semua data operasional di-scope ke `business_id`, BUKAN `user_id`.
   Ini aplikasi multi-tenant per toko.
2. Ambil business_id user yang login lewat helper terpusat (buat sekali,
   pakai di semua tempat) — jangan query berulang ke tabel users di
   setiap function terpisah.
3. Billing (subscriptions, usage_counters) juga di-scope ke business_id,
   dan HANYA BOLEH DIBACA dari Next.js — tidak pernah ditulis dari
   client/server Next.js. Penulisan hanya lewat webhook Laravel
   (service_role, bypass RLS).
4. SUPABASE_SERVICE_ROLE_KEY hanya boleh dipakai di Route Handler
   server-side, tidak pernah di Client Component, tidak pernah di
   NEXT_PUBLIC_* env var.
5. Setiap operasi INSERT wajib mengisi business_id dari session server,
   BUKAN dari body request/input client.
6. Cek limit (usage_counters vs plans) WAJIB di server sebelum INSERT,
   tidak cukup hanya divalidasi di UI.
7. TypeScript strict, pakai types dari lib/database.types.ts, jangan
   buat interface manual yang duplikat dengan generated types.

## Struktur Folder yang Diharapkan
lib/supabase/{client,server}.ts  → Supabase client (browser & server)
lib/auth/getCurrentBusiness.ts   → helper ambil business_id user login
lib/billing/                      → subscription & limit check
app/api/                          → Route Handlers
app/(auth)/login, app/onboarding  → flow autentikasi
app/(app)/...                     → halaman aplikasi utama (grouped route)
components/                       → komponen UI
```

---

## TAHAP 4 — Prompt Antigravity (Urutan untuk Fresh Build)

> Karena mulai dari 0, urutannya jadi **bangun fondasi dulu, baru fitur** — beda dari skenario setengah jalan yang mulai dengan "audit apa yang rusak".

### PROMPT 1 — Bootstrap Project & Supabase Client

```
Baca @docs/SUPABASE-SCHEMA-FINAL.md dan @lib/database.types.ts.

Setup fondasi project Next.js ini:

1. Install dependency: @supabase/supabase-js @supabase/ssr
2. lib/supabase/client.ts — browser client pakai anon key
3. lib/supabase/server.ts — server client pakai anon key untuk operasi
   yang tunduk RLS (baca data toko sendiri)
4. lib/supabase/admin.ts — server client TERPISAH pakai service_role key,
   HANYA untuk dipakai di kasus yang eksplisit butuh bypass RLS
   (jelaskan di komentar file ini kenapa bahaya kalau salah pakai)
5. .env.local.example — template env var yang dibutuhkan (JANGAN isi
   value asli, cuma nama variabelnya)

Jangan buat halaman atau fitur apapun dulu di prompt ini, fokus fondasi saja.
```

### PROMPT 2 — Auth & Onboarding Flow

```
Baca @docs/SUPABASE-SCHEMA-FINAL.md bagian 4 dan 2.5 (function complete_onboarding).

Bangun flow autentikasi lengkap dari 0:

1. app/(auth)/login/page.tsx
   - Tombol "Masuk dengan Google" via supabase.auth.signInWithOAuth
   - Form email/password sebagai alternatif (magic link atau password, pilih salah satu yang lebih simpel — sertakan alasan singkat pilihan Anda)

2. app/auth/callback/route.ts
   - Exchange code for session
   - Cek public.users.onboarding_completed
   - Redirect ke /onboarding kalau belum, /dashboard kalau sudah

3. app/onboarding/page.tsx
   - Form: nama toko (wajib), WhatsApp (opsional), alamat (opsional)
   - Panggil RPC complete_onboarding — function-nya SUDAH ADA di database,
     jangan buat ulang logikanya di sisi aplikasi
   - Handle loading & error state

4. middleware.ts
   - Redirect ke /login kalau belum auth
   - Redirect ke /onboarding kalau auth tapi business_id masih null
   - Kecualikan: /login, /auth/*, /onboarding, static assets

Pakai @supabase/ssr, bukan library auth-helpers yang lama.
```

### PROMPT 3 — Helper Business Context

```
Buat lib/auth/getCurrentBusiness.ts

- Function getCurrentBusinessId(): ambil business_id dari public.users
  untuk user yang sedang login (pakai auth.getUser() lalu query)
- Bungkus dengan React cache() supaya tidak query berulang dalam 1 request
- Return null kalau user belum onboarding (jangan throw error di sini,
  biar pemanggil yang putuskan mau redirect atau tampilkan apa)
- Buat juga getCurrentBusinessOrRedirect() yang otomatis redirect ke
  /onboarding kalau null — dipakai di halaman yang wajib ada toko
```

### PROMPT 4 — CRUD Dasar: Items, Customers, Categories

```
Baca @docs/SUPABASE-SCHEMA-FINAL.md struktur tabel rental_items, customers,
categories, dan @lib/database.types.ts untuk tipe datanya.

Bangun CRUD dasar (belum termasuk limit check, itu prompt berikutnya):

1. app/(app)/items/page.tsx — list barang, pakai getCurrentBusinessOrRedirect()
2. app/(app)/items/new/page.tsx — form tambah barang
3. app/api/items/route.ts — GET (list) & POST (create)
   business_id WAJIB diambil dari getCurrentBusinessId() di server,
   JANGAN diterima dari request body
4. Ulangi pola yang sama untuk customers dan categories

Semua query pakai lib/supabase/server.ts (bukan admin.ts) supaya tunduk RLS
sebagai lapis keamanan kedua.
```

### PROMPT 5 — Limit Enforcement & Billing Read

```
Baca @docs/PRD-SaaS-Rental-Hybrid.md bagian 5 dan
@docs/SUPABASE-SCHEMA-FINAL.md bagian 5 & 6.

Implementasikan:

1. lib/billing/getActiveSubscription.ts
   - Input: businessId
   - JOIN subscriptions + plans, filter product_id rental_manager, is_active
   - Handle pro_monthly yang sudah expired → treat sebagai free secara logic
   - Return: planType, isActive, isLifetime, expiresAt, maxItems,
     maxBookingsPerMonth, maxCustomers, features

2. lib/billing/checkLimit.ts
   - canAddItem(businessId), canAddBooking(businessId), canAddCustomer(businessId)
   - Baca dari usage_counters (bukan COUNT query)
   - -1 = unlimited

3. Terapkan di app/api/items/route.ts (dan customers, bookings) yang
   dibuat di prompt sebelumnya: cek limit SEBELUM insert, return 402
   kalau gagal dengan body { error, message, upgradeUrl }

   upgradeUrl formatnya:
   ${process.env.NEXT_PUBLIC_BILLING_URL}/checkout?product=rental_manager&plan=pro_monthly&business=${businessId}&callback=${encodeURIComponent(appUrl + '/billing/callback')}

4. components/UpgradeModal.tsx — modal upgrade
5. components/UsageIndicator.tsx — progress bar pemakaian
6. app/billing/callback/page.tsx — halaman tunggu setelah bayar,
   polling status subscription tiap 2 detik maks 30 detik
```

### PROMPT 6 — Booking dengan Cek Ketersediaan Stok

```
Baca @docs/SUPABASE-SCHEMA-FINAL.md bagian 2.11 (function get_available_quantity).

Bangun fitur booking:

1. app/(app)/bookings/new/page.tsx
   - Pilih barang, tanggal mulai & selesai, pilih/buat customer
   - Sebelum submit, panggil get_available_quantity() via RPC untuk
     validasi stok tersedia di rentang tanggal tsb
   - Tampilkan sisa stok tersedia secara real-time saat user pilih tanggal

2. app/api/bookings/route.ts
   - Cek limit booking bulanan (pakai checkLimit dari prompt sebelumnya)
   - Cek ketersediaan stok via get_available_quantity (JANGAN hitung manual
     di aplikasi, function-nya sudah ada dan sudah benar logic overlap-nya)
   - Insert ke bookings + booking_items dalam satu transaksi
   - Generate booking_number (format: INV-{tahun}-{nomor urut per toko},
     cek dulu apakah sudah ada function generator di database — kalau
     belum, buat logic sederhana di aplikasi dulu, catat sebagai TODO
     untuk dipindah ke database function nanti)
```

### PROMPT 7 — Laravel Billing (Repo Terpisah)

Sama seperti workflow sebelumnya, tidak ada perubahan karena sisi Laravel memang tidak terpengaruh apakah database dibangun fresh atau migrasi:

```
Baca @docs/PRD-SaaS-Rental-Hybrid.md bagian 6 dan
@docs/SUPABASE-SCHEMA-FINAL.md bagian 5.

Implementasikan MidtransWebhookController, CheckoutController, dan
scheduled task auto-downgrade — detail sama seperti yang sudah dijelaskan
di dokumen PRD. Semua query pakai DB facade, bukan Eloquent model,
karena schema dikelola di Supabase.
```

---

## Perbedaan Ringkas: Fresh Start vs Setengah Jalan

| Aspek | Fresh Start (dokumen ini) | Setengah Jalan (dokumen sebelumnya) |
|---|---|---|
| Backup dulu | Tidak wajib (tidak ada data penting) | Wajib |
| Jalankan SQL | Sekali jalan, urutan tetap dijaga | Bertahap per blok, pelan-pelan |
| Backfill data lama | **Tidak perlu** | Wajib (owner_id, subscriptions, usage_counters) |
| Prompt Antigravity #1 | Bootstrap fondasi | Audit kode yang akan rusak |
| Risiko | Rendah — bebas eksperimen | Tinggi — bisa merusak data/fitur yang sudah jalan |
| Urutan kerja | Fondasi → Auth → CRUD → Billing → Booking | Audit → Refactor → Tambal fitur baru |

---

## Checklist Eksekusi

- [ ] (Opsional) Drop tabel lama kalau ada sisa percobaan
- [ ] Jalankan schema lengkap §1.2 di Supabase SQL Editor
- [ ] Verifikasi tabel, RLS, seed plans (§1.3)
- [ ] Generate TypeScript types (§1.4)
- [ ] Setup Google OAuth (Tahap 2)
- [ ] Susun folder `docs/` + `.antigravity/rules.md` (Tahap 3)
- [ ] Jalankan Prompt 1–7 berurutan, review tiap hasil sebelum lanjut
- [ ] Test: daftar → onboarding → tambah barang sampai limit → upgrade → bayar sandbox → limit terbuka
