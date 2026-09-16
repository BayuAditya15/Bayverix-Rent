# Rental Management SaaS

Rental Management SaaS untuk membantu bisnis rental mengelola:

* Rental Items
* Customers
* Bookings
* Availability
* Payments
* Outstanding Payments
* Calendar
* Dashboard

---

# 1. Tech Stack

## Core

| Technology | Purpose                 |
| ---------- | ----------------------- |
| Next.js    | Web framework           |
| React      | UI                      |
| TypeScript | Type safety             |
| Supabase   | Database, Auth, Storage |
| PostgreSQL | Database                |
| Vercel     | Deployment              |

## UI

| Library      | Purpose             |
| ------------ | ------------------- |
| Tailwind CSS | Styling             |
| shadcn/ui    | UI components       |
| Lucide React | Icons               |
| Sonner       | Toast notifications |

## Forms & Validation

| Library         | Purpose         |
| --------------- | --------------- |
| React Hook Form | Form management |
| Zod             | Validation      |

## Data

| Library        | Purpose             |
| -------------- | ------------------- |
| TanStack Query | Client/server state |
| TanStack Table | Data tables         |
| date-fns       | Date manipulation   |

## Calendar

| Library      | Purpose          |
| ------------ | ---------------- |
| FullCalendar | Booking calendar |

## Testing

| Library    | Purpose      |
| ---------- | ------------ |
| Vitest     | Unit testing |
| Playwright | E2E testing  |

---

# 2. Requirements

Install terlebih dahulu:

* Node.js LTS
* npm
* Git

Check installation:

```bash
node -v
npm -v
git --version
```

Recommended:

```text
Node.js >= 20
npm >= 10
```

---

# 3. Create Next.js Project

Create project:

```bash
npx create-next-app@latest rental-management
```

Recommended answers:

```text
Would you like to use TypeScript?          Yes
Would you like to use ESLint?              Yes
Would you like to use Tailwind CSS?        Yes
Would you like your code inside a src/?    Yes
Would you like to use App Router?          Yes
Would you like to customize import alias?  Yes
```

Untuk import alias gunakan:

```text
@/*
```

Masuk ke project:

```bash
cd rental-management
```

Jalankan development server:

```bash
npm run dev
```

Buka:

```text
http://localhost:3000
```

---

# 4. Initialize Git

Jika project belum otomatis menggunakan Git:

```bash
git init
```

Kemudian:

```bash
git add .
git commit -m "chore: initialize project"
```

---

# 5. Install Supabase

Install:

```bash
npm install @supabase/supabase-js @supabase/ssr
```

Packages:

```text
@supabase/supabase-js
@supabase/ssr
```

Digunakan untuk:

* PostgreSQL
* Authentication
* Storage
* Server-side Supabase
* Client-side Supabase
* Session management

---

# 6. Environment Variables

Create:

```text
.env.local
```

Isi:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Isi value dari project Supabase.

> Jangan commit `.env.local`.

Pastikan `.gitignore` memiliki:

```text
.env*
```

---

# 7. Install shadcn/ui

Initialize:

```bash
npx shadcn@latest init
```

Gunakan konfigurasi yang sesuai dengan project.

Setelah itu install component yang dibutuhkan secara bertahap.

Contoh:

```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add select
npx shadcn@latest add table
npx shadcn@latest add tabs
npx shadcn@latest add textarea
npx shadcn@latest add badge
npx shadcn@latest add separator
npx shadcn@latest add sheet
npx shadcn@latest add skeleton
```

Tidak perlu meng-install semua component shadcn sekaligus.

Tambahkan hanya ketika dibutuhkan.

---

# 8. Install Icons

```bash
npm install lucide-react
```

Digunakan untuk:

```text
Calendar
Search
Plus
Edit
Trash
Settings
Users
Package
CreditCard
Menu
ArrowLeft
```

---

# 9. Install Form & Validation

React Hook Form:

```bash
npm install react-hook-form
```

Zod:

```bash
npm install zod
```

Resolver:

```bash
npm install @hookform/resolvers
```

Final:

```text
react-hook-form
zod
@hookform/resolvers
```

Workflow:

```text
User Input
    ↓
React Hook Form
    ↓
Zod
    ↓
Server Validation
    ↓
Database
```

---

# 10. Install TanStack Query

```bash
npm install @tanstack/react-query
```

Digunakan untuk client-side data management ketika diperlukan.

Contoh:

```text
Bookings
Customers
Rental Items
Dashboard data
```

Tidak semua server data wajib menggunakan TanStack Query.

Gunakan native Next.js Server Components jika sudah cukup.

---

# 11. Install TanStack Table

```bash
npm install @tanstack/react-table
```

Digunakan untuk:

```text
Booking Table
Customer Table
Rental Item Table
Payment Table
```

Features:

* Sorting
* Filtering
* Pagination
* Column visibility

---

# 12. Install date-fns

```bash
npm install date-fns
```

Digunakan untuk:

```text
Date calculation
Date comparison
Rental duration
Date formatting
Period validation
```

Jangan menggunakan Moment.js.

---

# 13. Install FullCalendar

Install core:

```bash
npm install @fullcalendar/core @fullcalendar/react
```

Install plugins:

```bash
npm install @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
```

Final packages:

```text
@fullcalendar/core
@fullcalendar/react
@fullcalendar/daygrid
@fullcalendar/timegrid
@fullcalendar/interaction
```

Digunakan untuk:

```text
Month View
Week View
Day View
Booking Events
Date Selection
Event Interaction
```

---

# 14. Install Sonner

```bash
npm install sonner
```

Digunakan untuk feedback:

```text
Booking created successfully.
Payment recorded successfully.
Booking cancelled.
Unable to save changes.
```

---

# 15. Install Testing Libraries

## Vitest

```bash
npm install -D vitest
```

Digunakan untuk unit testing business logic.

Contoh:

```text
calculateRentalTotal()
calculateAmountDue()
checkAvailability()
calculateRentalDuration()
```

---

# 16. Install Playwright

```bash
npm install -D @playwright/test
```

Initialize:

```bash
npx playwright install
```

Digunakan untuk E2E testing.

Contoh workflow:

```text
Login
↓
Create Customer
↓
Create Rental Item
↓
Create Booking
↓
Record Payment
↓
View Booking
↓
Cancel Booking
```

---

# 17. Install Prettier

```bash
npm install -D prettier
```

Create:

```text
.prettierrc
```

Recommended:

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "all"
}
```

---

# 18. Optional: Prettier Tailwind Plugin

Install:

```bash
npm install -D prettier-plugin-tailwindcss
```

Plugin ini akan membantu mengurutkan Tailwind classes secara konsisten.

---

# 19. Final Dependency List

## Production Dependencies

```text
@fullcalendar/core
@fullcalendar/daygrid
@fullcalendar/interaction
@fullcalendar/react
@fullcalendar/timegrid

@hookform/resolvers

@supabase/ssr
@supabase/supabase-js

@tanstack/react-query
@tanstack/react-table

date-fns

lucide-react
react-hook-form
sonner
zod
```

shadcn/ui components akan berada di:

```text
src/components/ui/
```

dan dependency pendukungnya akan dikelola oleh shadcn.

---

# 20. Development Dependencies

```text
@playwright/test
prettier
prettier-plugin-tailwindcss
vitest
```

Next.js juga akan menyediakan dependency development seperti ESLint sesuai konfigurasi project.

---

# 21. One-Time Installation

Setelah project dibuat, instalasi utama dapat dilakukan:

```bash
npm install \
@supabase/supabase-js \
@supabase/ssr \
@tanstack/react-query \
@tanstack/react-table \
date-fns \
lucide-react \
react-hook-form \
@hookform/resolvers \
sonner \
zod \
@fullcalendar/core \
@fullcalendar/react \
@fullcalendar/daygrid \
@fullcalendar/timegrid \
@fullcalendar/interaction
```

Development dependencies:

```bash
npm install -D \
vitest \
@playwright/test \
prettier \
prettier-plugin-tailwindcss
```

Kemudian:

```bash
npx playwright install
```

Dan initialize shadcn:

```bash
npx shadcn@latest init
```

---

# 22. Project Structure

Target structure:

```text
rental-management/
│
├── public/
│
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   ├── api/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── actions/
│   │   ├── bookings/
│   │   ├── customers/
│   │   ├── payments/
│   │   └── rental-items/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── bookings/
│   │   ├── customers/
│   │   ├── payments/
│   │   └── rental-items/
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   ├── validations/
│   │   ├── permissions/
│   │   └── utils/
│   │
│   ├── types/
│   │
│   └── config/
│
├── tests/
│   ├── unit/
│   └── e2e/
│
├── .env.local
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

# 23. Libraries We Explicitly DON'T Use in V1

Jangan install:

```text
Redux
Zustand
Axios
Prisma
Drizzle
Firebase
Auth.js
Clerk
Cloudinary
Moment.js
Stripe
Payment Gateway
```

Alasan:

> Jangan menambahkan abstraction/dependency sebelum ada kebutuhan nyata.

Supabase sudah menangani:

```text
Database
Authentication
Storage
```

Next.js sudah menangani:

```text
Routing
Server Components
Server Actions
Rendering
```

---

# 24. Installation Principle

Library baru hanya boleh ditambahkan jika:

```text
1. Ada requirement yang membutuhkan
2. Native solution tidak cukup
3. Library tersebut benar-benar mengurangi complexity
4. Tidak menduplikasi fungsi library yang sudah digunakan
```

Jangan install library hanya karena:

```text
"library ini populer"
"project lain pakai"
"katanya lebih bagus"
```

---

# 25. Responsive Development Rule

Semua component wajib dibuat:

```text
Mobile
↓
Tablet / iPad
↓
Desktop
```

Mobile adalah baseline.

Contoh:

```tsx
<div className="flex flex-col gap-4 md:flex-row">
```

Default:

```text
Mobile
```

`md:`:

```text
Tablet
```

`lg:`:

```text
Desktop
```

Breakpoint hanya digunakan ketika layout membutuhkan perubahan.

---

# 26. UI Rule

Prioritaskan:

```text
Hierarchy
↓
Spacing
↓
Typography
↓
Layout
↓
Color
↓
Decoration
```

Hindari:

```text
Excessive cards
Excessive badges
Excessive spans
Excessive colors
Excessive animations
```

Badge terutama digunakan untuk status.

Jangan menjadikan setiap data sebagai badge.

---

# 27. Start Development

Setelah instalasi selesai:

```bash
npm run dev
```

Development:

```text
http://localhost:3000
```

Build:

```bash
npm run build
```

Production start:

```bash
npm start
```

---

# 28. First Development Milestone

Jangan langsung membuat semua feature.

Milestone pertama:

```text
Project Setup
↓
Supabase Connection
↓
Auth
↓
Database Schema
↓
RLS
↓
Dashboard Layout
```

Setelah foundation stabil:

```text
Rental Items
↓
Customers
↓
Bookings
↓
Availability
↓
Payments
↓
Calendar
```

---

# 29. Golden Rule

> **Install only what V1 needs. Build mobile-first. Keep the stack simple. Let the database enforce data integrity and let the server enforce business rules.**
