# Rules Rental Management SaaS

## Fixed Coding & Design Rules — V1

**Status:** FINAL / SCOPE LOCKED
**Stack:** Next.js + TypeScript + Supabase + Tailwind CSS + shadcn/ui
**Platform:** Responsive Web
**Design Strategy:** Mobile-first → Tablet/iPad → Desktop

---

# 1. Core Principles

Project harus mengikuti prinsip:

```text
SIMPLE
CONSISTENT
TYPE-SAFE
SECURE
ACCESSIBLE
SCALABLE
MOBILE-FIRST
```

Prioritas:

1. Correctness
2. Security
3. Maintainability
4. UX
5. Performance
6. Visual polish

---

# 2. Responsive Design — FIXED RULE

**Semua UI wajib dibuat dari Mobile terlebih dahulu.**

Urutan development dan testing:

```text
MOBILE
↓
TABLET / iPAD
↓
DESKTOP
```

Bukan:

```text
Desktop
↓
Tablet
↓
Mobile
```

## 2.1 Mobile

Mobile adalah **baseline design**.

Target:

```text
~320px+
```

Mobile harus dapat melakukan seluruh core workflow:

```text
Login
Create Booking
Edit Booking
Cancel Booking
Record Payment
View Booking
Search Customer
View Calendar
Manage Rental Item
```

Tidak boleh ada fitur V1 yang hanya usable di desktop.

---

# 3. Tablet / iPad

Setelah mobile selesai, layout dioptimalkan untuk tablet/iPad.

Target:

```text
~768px+
```

Gunakan ruang tambahan untuk:

```text
2-column layouts
Wider forms
Split views
Larger tables
Calendar
Dashboard cards
```

Jangan sekadar memperbesar mobile layout.

Contoh:

```text
Mobile:
Form
↓
Form
↓
Summary

Tablet:
┌──────────────┬──────────────┐
│ Form         │ Summary      │
└──────────────┴──────────────┘
```

---

# 4. Desktop

Target:

```text
~1024px+
```

Desktop dapat menggunakan:

```text
Sidebar
Multi-column layout
Full data tables
Expanded calendar
Dashboard grid
```

Namun desktop tetap mengikuti struktur dan hierarchy yang sudah dibuat untuk mobile.

---

# 5. Breakpoint Philosophy

Jangan mendesain berdasarkan device tertentu seperti:

```text
iPhone 15
iPad Pro
MacBook
```

Gunakan **content-based responsive design**.

Breakpoint digunakan ketika layout memang membutuhkan perubahan.

Prioritas:

```text
Content
↓
Available space
↓
Breakpoint
```

Bukan:

```text
Device name
↓
Breakpoint
```

---

# 6. Mobile-First Tailwind Rule

Default class harus merupakan mobile style.

Contoh:

```text
flex-col
```

kemudian:

```text
md:flex-row
lg:grid-cols-3
```

Bukan membuat desktop sebagai default lalu meng-overwrite semuanya untuk mobile.

Contoh yang benar:

```tsx
<div className="flex flex-col gap-4 md:flex-row">
```

---

# 7. Avoid Excessive `span`

**Jangan menggunakan `<span>` secara berlebihan hanya untuk styling.**

`span` digunakan ketika memang membutuhkan inline semantic grouping.

Hindari:

```tsx
<div>
  <span>Customer</span>
  <span>Budi</span>
  <span>08xxxx</span>
  <span>CONFIRMED</span>
</div>
```

Jika sebenarnya struktur tersebut adalah informasi terpisah, gunakan semantic structure:

```tsx
<div>
  <p className="text-sm text-muted-foreground">
    Customer
  </p>

  <p className="font-medium">
    Budi
  </p>

  <p className="text-sm">
    08xxxx
  </p>
</div>
```

---

# 8. Badge Usage — FIXED

**Badge tidak boleh digunakan untuk setiap informasi.**

Badge hanya digunakan untuk:

* Status
* State
* Category jika memang membantu scanning
* Informasi singkat yang membutuhkan visual distinction

Contoh yang benar:

```text
CONFIRMED
ONGOING
COMPLETED
CANCELLED
PENDING
```

Contoh yang tidak perlu badge:

```text
Rp500.000
Budi Santoso
12 Sep 2026
08xxxxxxxx
Tenda 4P
Quantity: 2
```

Gunakan typography dan layout biasa.

---

# 9. Status Badge

Status badge harus:

```text
Short
Readable
Consistent
Semantic
```

Contoh:

```text
[ CONFIRMED ]
[ ONGOING ]
[ COMPLETED ]
[ CANCELLED ]
```

Jangan membuat badge terlalu besar.

Hindari:

```text
[ 🟢 BOOKING SUDAH DIKONFIRMASI ]
```

Gunakan:

```text
[ CONFIRMED ]
```

---

# 10. Color Rules for Badges

Badge menggunakan semantic colors:

```text
DRAFT      → Neutral
PENDING    → Amber
CONFIRMED  → Blue
ONGOING    → Blue
COMPLETED  → Green
CANCELLED  → Red
```

Jangan menggunakan warna hanya untuk dekorasi.

---

# 11. Avoid Badge Spam

Satu row/card **tidak boleh penuh dengan badge**.

Buruk:

```text
┌─────────────────────────────┐
│ [CUSTOMER] [BOOKING]        │
│ [IDR] [PAID] [ACTIVE]       │
│ [CONFIRMED] [OUTDOOR]       │
└─────────────────────────────┘
```

Lebih baik:

```text
┌─────────────────────────────┐
│ RNT-00021                   │
│ Budi Santoso                │
│ 12 Sep → 14 Sep             │
│                             │
│ Rp500.000        [CONFIRMED]│
└─────────────────────────────┘
```

**Satu informasi penting → satu visual treatment.**

---

# 12. Typography Hierarchy

Gunakan typography untuk hierarchy sebelum menggunakan badge, border, color, atau card.

Prioritas:

```text
Typography
↓
Spacing
↓
Layout
↓
Color
↓
Badge / decoration
```

Jangan menyelesaikan hierarchy dengan menambahkan badge ke semua elemen.

---

# 13. Card Rules

Card digunakan untuk mengelompokkan informasi yang memang berkaitan.

Jangan setiap elemen dibuat card.

Buruk:

```text
┌──────────┐
│ Customer │
└──────────┘

┌──────────┐
│ Date     │
└──────────┘

┌──────────┐
│ Status   │
└──────────┘
```

Lebih baik:

```text
┌───────────────────────────┐
│ Booking Information       │
│                           │
│ Customer    Budi Santoso  │
│ Period      12 → 14 Sep   │
│ Status      [CONFIRMED]   │
└───────────────────────────┘
```

---

# 14. Mobile Card Rules

Pada mobile, informasi kompleks boleh berubah dari table menjadi card/list.

Desktop:

```text
Booking | Customer | Period | Total | Due | Status | Action
```

Mobile:

```text
RNT-00021
Budi Santoso

12 Sep → 14 Sep

Rp500.000
Due Rp200.000

[CONFIRMED]

View →
```

Jangan memaksakan desktop table ke layar kecil.

---

# 15. Tablet Layout Rules

Tablet/iPad menjadi **intermediate layout**, bukan sekadar mobile yang diperbesar.

Contoh Booking Detail:

```text
Mobile
┌───────────────┐
│ Booking Info  │
│ Items         │
│ Payment       │
│ Actions       │
└───────────────┘
```

Tablet:

```text
┌───────────────────────┐
│ Booking Info          │
├────────────┬──────────┤
│ Items      │ Payment  │
├────────────┴──────────┤
│ Actions               │
└───────────────────────┘
```

Desktop:

```text
┌──────────────────────────────────────┐
│ Booking Header                       │
├──────────────────────┬───────────────┤
│ Items                │ Payment       │
│                      │ Summary       │
├──────────────────────┴───────────────┤
│ Timeline / Notes / Actions            │
└──────────────────────────────────────┘
```

---

# 16. Desktop Layout

Desktop menggunakan:

```text
Sidebar
Main Content
Optional Secondary Panel
```

Contoh:

```text
┌────────────┬──────────────────────────────┐
│ Sidebar    │ Main Content                 │
│            │                              │
│ Dashboard  │ Dashboard                    │
│ Bookings   │                              │
│ Calendar   │                              │
│ Customers  │                              │
│ Items      │                              │
│ Payments   │                              │
│ Settings   │                              │
└────────────┴──────────────────────────────┘
```

---

# 17. Navigation Responsive

Mobile:

```text
Top Bar
+
Menu / Sheet
```

Tablet:

```text
Compact Navigation
```

Desktop:

```text
Persistent Sidebar
```

Navigation harus tetap mudah dijangkau tanpa memenuhi layar mobile.

---

# 18. Forms Responsive

Mobile:

```text
1 column
```

Tablet:

```text
1–2 columns
```

Desktop:

```text
2 columns jika memang membantu
```

Jangan membuat form desktop menjadi:

```text
4–5 columns
```

hanya karena ruang tersedia.

---

# 19. Buttons Responsive

Primary action harus mudah dijangkau.

Mobile:

```text
[ Create Booking ]
```

Jika action sangat penting, boleh menggunakan full-width.

Tablet/Desktop:

```text
[Create Booking]
```

Gunakan hierarchy:

```text
Primary
Secondary
Destructive
Ghost
```

Jangan semua button dibuat primary.

---

# 20. Mobile Action Placement

Action penting harus mudah ditemukan.

Contoh Booking:

```text
[ Edit Booking ]
[ Record Payment ]
[ Cancel Booking ]
```

Destructive action tidak boleh terlalu dekat dengan primary action tanpa confirmation.

---

# 21. Tables

Desktop:

```text
Full table
```

Tablet:

```text
Reduced columns
atau
horizontal scroll
```

Mobile:

```text
Card/list
```

Prioritas informasi:

```text
Booking Number
Customer
Period
Amount Due
Status
Action
```

Informasi sekunder dapat disembunyikan atau dipindahkan ke detail.

---

# 22. Calendar Responsive

Mobile:

```text
Agenda / simplified calendar
```

Tablet:

```text
Week / Month
```

Desktop:

```text
Month / Week / Day
```

Calendar tidak boleh terlalu padat di mobile.

---

# 23. Empty State

Empty state harus tetap sederhana.

```text
No bookings yet

Create your first booking to start managing
your rental business.

[Create Booking]
```

Jangan menambahkan:

```text
badge
multiple buttons
large illustration
excessive decoration
```

jika tidak diperlukan.

---

# 24. Loading State

Gunakan skeleton/loading state yang mengikuti struktur konten.

Jangan membuat loading screen berlebihan.

Contoh:

```text
████████████
██████
████████████████
```

---

# 25. Animation

Animation minimal.

Gunakan hanya ketika membantu:

```text
Dialog
Sheet
Dropdown
Loading
Feedback
```

Tidak ada:

```text
Excessive hover animation
Parallax
Large page transitions
Constant motion
```

---

# 26. Spacing

Gunakan Tailwind spacing scale.

Prioritas:

```text
4
8
12
16
24
32
48
```

Jangan menggunakan arbitrary spacing tanpa alasan.

Hindari:

```text
mt-[17px]
px-[23px]
gap-[13px]
```

jika spacing standar sudah mencukupi.

---

# 27. Typography

Gunakan satu font utama.

Default:

```text
Inter
```

Hierarchy:

```text
Page Title
Section Title
Card Title
Body
Caption
Helper Text
```

Typography harus menjadi alat utama untuk membedakan importance.

---

# 28. Color System

Neutral-first.

Semantic colors:

```text
Primary
Success
Warning
Danger
Info
Neutral
```

Jangan menggunakan banyak warna dekoratif.

---

# 29. Design Consistency

Semua halaman harus menggunakan:

```text
Same typography
Same spacing
Same button style
Same form style
Same status treatment
Same card style
Same table behavior
Same responsive behavior
```

Jangan membuat setiap halaman terasa seperti aplikasi berbeda.

---

# 30. Accessibility

Minimal:

```text
Semantic HTML
Keyboard navigation
Visible focus
Proper labels
Accessible contrast
ARIA hanya jika diperlukan
```

Icon-only button wajib memiliki accessible label.

Badge tidak boleh menjadi satu-satunya indikator status.

---

# 31. Coding Rules

Gunakan:

```text
Next.js App Router
TypeScript strict
React Server Components
Server Actions / Route Handlers
```

Default component:

```text
Server Component
```

Gunakan:

```text
"use client"
```

hanya ketika dibutuhkan.

---

# 32. Component Rules

Satu component harus memiliki tanggung jawab yang jelas.

Contoh:

```text
BookingPage
├── BookingHeader
├── BookingSummary
├── BookingItems
├── BookingPayment
└── BookingActions
```

Jangan membuat satu component berisi seluruh business logic.

---

# 33. Business Logic

Business logic harus berada di server/domain layer.

Contoh:

```text
createBooking()
checkAvailability()
calculateRentalTotal()
calculateAmountDue()
recordPayment()
cancelBooking()
```

UI tidak boleh menjadi source of truth.

---

# 34. Validation

Gunakan:

```text
React Hook Form
+
Zod
```

Validation dilakukan:

```text
Client
+
Server
```

Server tetap menjadi source of truth.

---

# 35. Security

Gunakan:

```text
Supabase Auth
+
PostgreSQL RLS
+
Server-side authorization
```

Semua business data harus diisolasi berdasarkan:

```text
business_id
```

Frontend filtering bukan security.

---

# 36. Financial Integrity

Database:

```text
NUMERIC(19,4)
```

Jangan gunakan floating point sebagai source of truth.

Server menghitung:

```text
Rental Total
Amount Paid
Amount Due
```

Frontend tidak dipercaya untuk mengirim hasil calculation.

---

# 37. Error Handling

Technical error tidak boleh ditampilkan mentah kepada user.

User-facing:

```text
Booking gagal dibuat.
Item sudah tidak tersedia pada periode tersebut.
```

Bukan:

```text
Postgres error 23505...
```

---

# 38. Dependency Rules

Jangan menambah library tanpa kebutuhan nyata.

Prioritas:

```text
Native Next.js
↓
React
↓
Supabase
↓
Existing project libraries
↓
New dependency jika benar-benar diperlukan
```

---

# 39. Git Rules

Commit format:

```text
feat: add booking creation
fix: prevent booking overlap
refactor: simplify booking service
style: update dashboard spacing
docs: update setup guide
```

Secret tidak boleh masuk Git.

---

# 40. Design Process — FIXED

Sebelum coding setiap feature:

```text
PRD requirement
↓
Mobile layout
↓
Tablet/iPad layout
↓
Desktop layout
↓
Component breakdown
↓
Implementation
↓
Responsive testing
```

Jangan langsung coding desktop kemudian "dibikin responsive".

---

# 41. Core Screen Design Order

Design terlebih dahulu:

```text
1. Login
2. Dashboard
3. Booking List
4. Booking Detail
5. Create Booking
6. Calendar
7. Rental Items
8. Customers
9. Payment Recording
10. Settings
```

Design tidak perlu pixel-perfect untuk seluruh aplikasi sebelum development.

Core screens menjadi **design reference** untuk screen lainnya.

---

# 42. Final Visual Rule

Rental Management SaaS harus terasa:

```text
Clean
Professional
Calm
Fast
Trustworthy
Easy to scan
```

Bukan:

```text
Over-designed
Gradient-heavy
Badge-heavy
Card-heavy
Animation-heavy
```

### Golden Rule

> **Use hierarchy, not decoration.**

Kalau sebuah informasi bisa dibuat jelas dengan:

```text
Typography
+
Spacing
+
Layout
```

jangan menambahkan:

```text
Badge
Color
Border
Icon
Card
```

hanya untuk membuatnya terlihat "lebih keren".

---

# 43. Final Responsive Rule

Semua feature V1 wajib lolos tiga level:

```text
MOBILE
↓
TABLET / iPAD
↓
DESKTOP
```

**Mobile adalah baseline.**

Tablet/iPad mendapatkan layout yang dioptimalkan.

Desktop mendapatkan layout yang memanfaatkan ruang lebih luas.

Tidak ada screen V1 yang hanya dirancang untuk desktop.

---

# 44. Golden Rules — V1

```text
1. Mobile-first always.
2. Tablet/iPad is a real layout, not enlarged mobile.
3. Desktop is optimized, not the design baseline.
4. Avoid excessive <span>.
5. Avoid badge spam.
6. Status may use badges; normal data usually does not.
7. Typography and spacing create hierarchy first.
8. Don't turn every element into a card.
9. Don't trust frontend calculations.
10. Don't trust frontend tenant filtering.
11. Server is the source of truth.
12. RLS is mandatory.
13. Keep dependencies minimal.
14. Keep V1 scope locked.
15. Simple UI > decorative UI.
```

**Final principle:**

> **Build mobile-first. Scale the layout intelligently to tablet/iPad and desktop. Use visual hierarchy instead of decoration.**
