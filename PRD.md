# Rental Management SaaS

## Product Requirements Document — V1

**Status:** Final / Scope Locked
**Target:** Rental business skala kecil–menengah
**Platform:** Web responsive, mobile-first
**Model:** SaaS multi-business
**Payment SaaS:** Manual — customer menghubungi admin via WhatsApp/email untuk berlangganan

---

# 1. Product Overview

Rental Management SaaS adalah aplikasi untuk membantu bisnis rental mengelola:

* Rental items/unit
* Customer
* Booking
* Availability
* Payment
* Operational status
* Dashboard

Produk harus bersifat **generic**, sehingga tidak terkunci pada satu industri.

Contoh bisnis yang dapat menggunakan sistem:

* Outdoor equipment rental
* Vehicle rental
* Camping gear rental
* Sports equipment rental
* Event equipment rental
* Kamera/equipment rental
* Dan kategori rental lainnya

---

# 2. V1 Goal

Tujuan utama V1:

> Membantu owner rental mengelola proses rental dari booking sampai transaksi selesai tanpa menggunakan spreadsheet/manual tracking.

Core workflow:

```text
Add Rental Item
       ↓
Add Customer
       ↓
Create Booking
       ↓
Check Availability
       ↓
Confirm Booking
       ↓
Record Payment
       ↓
Rental Ongoing
       ↓
Complete Booking
```

---

# 3. User Roles

## 3.1 Owner

Owner dapat:

* Mengelola bisnis
* Mengelola rental items
* Mengelola customer
* Membuat/edit booking
* Mencatat payment
* Mengubah status booking
* Melihat dashboard

## 3.2 Staff

V1 dapat menggunakan permission sederhana.

Staff dapat:

* Melihat customer
* Membuat booking
* Mengelola booking
* Mencatat payment

Staff tidak dapat:

* Menghapus bisnis
* Mengubah pengaturan penting
* Mengelola subscription

> Advanced role & permission masuk versi berikutnya.

---

# 4. Business Profile

Owner dapat mengatur:

* Business name
* Logo
* WhatsApp number
* Email
* Currency
* Business operating hours

### Acceptance Criteria

* Business name wajib diisi.
* Currency memiliki default `IDR`.
* WhatsApp number dapat disimpan.
* Logo bersifat optional.
* Pengaturan dapat diedit oleh Owner.
* Perubahan tersimpan dan digunakan pada aplikasi.

---

# 5. Rental Categories

Owner dapat membuat kategori rental.

Contoh:

```text
Outdoor
Vehicle
Camping
Sports
Event Equipment
```

Field:

```text
id
business_id
name
description
status
created_at
updated_at
```

### Acceptance Criteria

* Owner dapat membuat category.
* Owner dapat mengedit category.
* Owner dapat menonaktifkan category.
* Category yang sudah digunakan tidak boleh menyebabkan historical booking berubah.
* Category inactive tidak muncul sebagai pilihan untuk item baru.

---

# 6. Rental Items

Rental item adalah unit/barang yang dapat disewakan.

Contoh:

```text
Tenda 4P
Honda Scoopy
Carrier 60L
Projector Epson
```

Field minimal:

```text
id
business_id
category_id
name
description
image
sku
price
status
created_at
updated_at
```

Status:

```text
ACTIVE
INACTIVE
```

### Acceptance Criteria

* Owner dapat membuat rental item.
* Name wajib.
* Category optional.
* Price tidak boleh negatif.
* Item dapat diedit.
* Item dapat dinonaktifkan.
* Item inactive tidak dapat digunakan untuk booking baru.
* Historical booking tetap menyimpan data item yang digunakan saat booking dibuat.

---

# 7. Customer Management

Customer memiliki:

```text
id
business_id
name
phone
email
notes
created_at
updated_at
```

### Acceptance Criteria

* Owner/staff dapat membuat customer.
* Name wajib.
* Phone optional.
* Email optional.
* Customer dapat diedit.
* Customer dapat dicari berdasarkan nama atau nomor telepon.
* Customer memiliki halaman detail.
* Riwayat booking customer dapat dilihat.

---

# 8. Booking

Booking adalah transaksi utama sistem.

Booking terdiri dari:

```text
Booking
├── Customer
├── Rental Period
├── Booking Items
├── Rental Total
├── Amount Due
├── Payment Records
└── Status
```

---

# 9. Booking Fields

```text
id
business_id
customer_id
booking_number
start_at
end_at
rental_total
amount_due
currency
status
notes
created_by
created_at
updated_at
```

### Constraints

```text
start_at < end_at

rental_total >= 0

amount_due >= 0
```

---

# 10. Booking Items

Satu booking dapat memiliki beberapa rental item.

Contoh:

```text
Booking #RNT-00021

Tenda 4P       × 2
Sleeping Bag   × 3
Carrier 60L    × 1
```

Fields:

```text
id
booking_id
rental_item_id
item_name_snapshot
unit_price
quantity
subtotal
created_at
```

### Important Rule

`item_name_snapshot` dan `unit_price` disimpan untuk menjaga historical data.

Jika harga rental item berubah setelah booking dibuat, historical booking **tidak ikut berubah**.

### Acceptance Criteria

* Quantity harus > 0.
* Unit price tidak boleh negatif.
* Subtotal = `unit_price × quantity`.
* Booking dapat memiliki lebih dari satu item.
* Item yang sama dapat memiliki quantity lebih dari 1.

---

# 11. Availability

Sistem harus mencegah double booking untuk unit/item yang sama.

Contoh:

```text
Tenda 4P

10 Sep → 12 Sep
BOOKED

User mencoba:

11 Sep → 13 Sep

→ CONFLICT
```

### Acceptance Criteria

Saat membuat booking:

1. Sistem mengecek availability.
2. Sistem mencari booking aktif yang periodenya overlap.
3. Jika quantity yang tersedia tidak mencukupi, booking ditolak.
4. Jika tersedia, booking dapat dibuat.

Untuk V1, availability menggunakan konsep **quantity-based inventory**.

Contoh:

```text
Tenda 4P
Total Quantity: 5

Booking A
Quantity: 3

Remaining:
2
```

---

# 12. Booking Status

Status V1:

```text
DRAFT
PENDING
CONFIRMED
ONGOING
COMPLETED
CANCELLED
```

Workflow normal:

```text
DRAFT
  ↓
PENDING
  ↓
CONFIRMED
  ↓
ONGOING
  ↓
COMPLETED
```

Cancellation:

```text
DRAFT
PENDING
CONFIRMED
   ↓
CANCELLED
```

### Acceptance Criteria

* Status transition harus mengikuti workflow yang valid.
* Booking `COMPLETED` tidak dapat kembali ke `ONGOING`.
* Booking `CANCELLED` tidak dapat menjadi `CONFIRMED`.
* Booking `CANCELLED` tidak dapat menjadi `ONGOING`.
* Booking yang sudah `COMPLETED` tidak dapat dibatalkan melalui flow normal.

---

# 13. Create Booking Workflow

```text
1. Select Customer
        ↓
2. Select Rental Period
        ↓
3. Select Items
        ↓
4. Check Availability
        ↓
5. Calculate Rental Total
        ↓
6. Calculate Amount Due
        ↓
7. Create Booking
        ↓
8. Status = PENDING
```

### Acceptance Criteria

* Customer wajib dipilih.
* Start date/time wajib.
* End date/time wajib.
* Start harus lebih awal daripada end.
* Minimal satu item wajib.
* Availability harus lolos.
* Total dihitung oleh server.
* Client tidak boleh menentukan nilai total secara bebas.
* Booking number dibuat otomatis.
* Booking baru memiliki status `PENDING`.

---

# 14. Edit Booking

Owner/staff dapat mengedit booking selama status memungkinkan.

Editable:

* Customer
* Rental period
* Items
* Notes

### Allowed

```text
DRAFT
PENDING
CONFIRMED
```

### Restricted

```text
ONGOING
COMPLETED
CANCELLED
```

### Acceptance Criteria

* Edit booking melakukan availability check ulang.
* Perubahan item dapat mengubah rental total.
* Perubahan periode melakukan availability check ulang.
* Amount Due dihitung ulang berdasarkan kondisi terbaru.
* Historical payment tidak boleh berubah akibat edit booking.
* Booking number tidak berubah.

---

# 15. Cancel Booking

V1 mendukung **full booking cancellation**.

Fields cancellation:

```text
booking_id
reason
cancelled_by
cancelled_at
```

### Acceptance Criteria

* Booking dapat dibatalkan dari `DRAFT`, `PENDING`, atau `CONFIRMED`.
* Reason wajib.
* Cancellation tercatat.
* Status berubah menjadi `CANCELLED`.
* Item kembali tersedia.
* Booking tidak dapat diaktifkan kembali melalui normal workflow.
* Payment/refund tidak otomatis diproses pada V1.

---

# 16. Partial Cancellation

**Tidak termasuk V1.**

Contoh:

```text
Booking:

Tenda × 3
Carrier × 2

Cancel:

Tenda × 1
```

Feature ini masuk **V2**.

---

# 17. Payment

V1 hanya mendukung **manual payment recording**.

Payment method:

```text
CASH
BANK_TRANSFER
OTHER
```

Fields:

```text
id
booking_id
amount
currency
method
status
reference
paid_at
created_at
```

---

# 18. Record Payment Workflow

```text
Booking
   ↓
Record Payment
   ↓
Enter Amount
   ↓
Select Method
   ↓
Save
   ↓
Payment = COMPLETED
```

### Acceptance Criteria

* Payment amount harus > 0.
* Payment tidak boleh dicatat melebihi kebutuhan tanpa validasi.
* Payment memiliki reference optional.
* Payment method wajib.
* Payment status default `COMPLETED` untuk manual recording.
* Amount Paid dihitung dari completed payments.
* Amount Due tidak boleh menjadi negatif.

---

# 19. Financial Calculation

V1 memisahkan:

```text
Rental Total
Amount Paid
Amount Due
```

### Rental Total

Total biaya rental sebelum payment.

```text
Rental Total
=
SUM(booking item subtotal)
```

### Amount Paid

```text
Amount Paid
=
SUM(COMPLETED payments)
```

### Amount Due

```text
Amount Due
=
MAX(Rental Total - Amount Paid, 0)
```

### Important

`Amount Due` bukan `Rental Total`.

Contoh:

```text
Rental Total   Rp500.000
Amount Paid    Rp300.000
Amount Due     Rp200.000
```

---

# 20. Overpayment

**Tidak termasuk V1.**

Jika customer membayar lebih:

```text
Rental Total = Rp500.000
Paid         = Rp600.000
```

Handling:

* Overpayment
* Credit
* Refund

masuk **V2**.

V1 harus melakukan validasi agar payment tidak menyebabkan overpayment.

---

# 21. Deposit

**Tidak termasuk V1.**

Deposit:

* Deposit required
* Deposit received
* Deposit deduction
* Deposit refund

masuk **V2**.

---

# 22. Refund

**Tidak termasuk V1.**

V1 tidak melakukan refund management.

Jika terjadi cancellation dengan payment yang sudah masuk, sistem hanya menyimpan payment history.

Refund diproses secara manual di luar sistem sampai fitur refund V2 tersedia.

---

# 23. Credit

**Tidak termasuk V1.**

Customer credit balance dan credit transaction masuk V2.

---

# 24. Dashboard

Dashboard Owner menampilkan:

```text
Today's Bookings
Upcoming Bookings
Active Rentals
Outstanding Payments
Revenue
```

### Revenue

Untuk V1:

```text
Revenue
=
SUM(COMPLETED payments)
```

Dashboard tidak membutuhkan accounting-grade reporting.

### Acceptance Criteria

* Data dashboard berdasarkan business yang sedang login.
* Tidak boleh menampilkan data business lain.
* Angka berubah setelah transaction berhasil.
* Booking cancelled tidak dihitung sebagai active rental.

---

# 25. Booking Calendar

Calendar menampilkan booking berdasarkan rental period.

View minimal:

```text
Month
Week
Day
```

Calendar dapat digunakan untuk:

* Melihat booking
* Melihat availability
* Membuka booking detail

### Acceptance Criteria

* Booking tampil pada periode yang benar.
* Cancelled booking dibedakan secara visual.
* User dapat membuka booking dari calendar.
* Calendar hanya menampilkan booking business aktif.

---

# 26. Search & Filtering

Minimal tersedia:

### Booking

Search:

```text
Booking Number
Customer Name
Customer Phone
```

Filter:

```text
Status
Date
```

### Customer

Search:

```text
Name
Phone
```

### Rental Item

Search:

```text
Name
SKU
```

---

# 27. Authorization & Tenant Isolation

Karena produk adalah SaaS:

```text
Business A
    ↓
Users A
    ↓
Data A

Business B
    ↓
Users B
    ↓
Data B
```

User **tidak boleh mengakses data business lain**.

### Acceptance Criteria

Setiap query business data wajib memiliki tenant/business scope.

Contoh:

```text
WHERE business_id = current_business_id
```

Tidak boleh mengandalkan ID dari frontend saja.

---

# 28. Audit Information

Untuk perubahan penting, simpan:

```text
created_at
updated_at
created_by
```

Untuk cancellation:

```text
cancelled_at
cancelled_by
reason
```

V1 belum membutuhkan full audit-log system.

---

# 29. Notifications

**Tidak termasuk V1.**

Tidak ada:

* WhatsApp automation
* Email automation
* Reminder otomatis
* Payment reminder

Feature tersebut dapat masuk V3.

---

# 30. Subscription / SaaS Billing

V1 menggunakan **manual subscription sales**.

Flow:

```text
User mencoba aplikasi
        ↓
Memilih paket
        ↓
Hubungi Admin
        ↓
WhatsApp / Email
        ↓
Payment manual
        ↓
Admin mengaktifkan subscription
```

Tidak menggunakan payment gateway untuk subscription pada V1.

---

# 31. V1 Database Scope

Table utama:

```text
businesses
users
categories
rental_items
customers
bookings
booking_items
payments
```

Enum terpusat:

```text
app_enum.booking_status
app_enum.payment_status
app_enum.payment_method
```

V1 **tidak membutuhkan**:

```text
overpayments
overpayment_allocations
refunds
credit_accounts
credit_transactions
credit_applications
deposit_transactions
```

Table tersebut disiapkan untuk V2 ketika requirement sudah masuk.

---

# 32. V1 Out of Scope

Feature berikut secara eksplisit **tidak boleh dikerjakan dalam V1**:

* Partial cancellation
* Refund management
* Overpayment management
* Customer credit
* Deposit management
* Payment gateway
* WhatsApp API
* Email automation
* Customer portal
* Advanced accounting
* Advanced reports
* Multi-location
* Asset maintenance
* Damage/loss tracking
* Automated subscription billing
* Custom domain
* Advanced role & permission
* Mobile native application

---

# 33. V1 Definition of Done

V1 dianggap selesai jika owner dapat melakukan workflow berikut tanpa bantuan developer:

```text
LOGIN
  ↓
SETUP BUSINESS
  ↓
CREATE CATEGORY
  ↓
CREATE RENTAL ITEM
  ↓
CREATE CUSTOMER
  ↓
CREATE BOOKING
  ↓
CHECK AVAILABILITY
  ↓
CONFIRM BOOKING
  ↓
RECORD PAYMENT
  ↓
START RENTAL
  ↓
COMPLETE RENTAL
```

Dan:

```text
EDIT BOOKING
CANCEL BOOKING
SEARCH CUSTOMER
SEARCH BOOKING
VIEW CALENDAR
VIEW DASHBOARD
VIEW OUTSTANDING PAYMENT
```

seluruhnya berjalan tanpa merusak data tenant/business lain.

---

# 34. V1 Core Principle

> **Simple enough to launch, structured enough to scale.**

V1 fokus pada **operational rental management**, bukan accounting system.

Financial complexity seperti:

```text
Partial Cancellation
Refund
Overpayment
Credit
Deposit
```

ditunda ke V2 agar core product dapat selesai, diuji ke user nyata, dan mulai dijual lebih cepat.
