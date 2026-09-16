"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle2,
  PackageCheck,
  Search,
  Package,
  Check,
  Layers,
  CreditCard,
  Banknote,
  QrCode,
  Wallet,
  ImagePlus,
  X,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { uploadToSupabaseStorage } from "@/lib/supabase/storage";

interface Customer {
  id: string;
  name: string;
  phone: string | null;
}

interface RentalItem {
  id: string;
  name: string;
  price: number;
  price_unit: string;
  deposit_amount: number;
  total_quantity: number;
  image_url: string | null;
  categories: { id: string; name: string } | null;
}

interface SelectedItem {
  rental_item_id: string;
  name: string;
  unit_price: number;
  quantity: number;
  available_quantity: number;
  image_url?: string | null;
}

export default function NewBookingPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [itemsList, setItemsList] = useState<RentalItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [itemSearch, setItemSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [notes, setNotes] = useState("");
  const [depositTotal, setDepositTotal] = useState("");
  const [paymentType, setPaymentType] = useState<"UNPAID" | "DP" | "PAID">("UNPAID");
  const [customPaymentAmount, setCustomPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "TRANSFER" | "QRIS" | "EWALLET" | "CARD">("CASH");
  const [paymentRef, setPaymentRef] = useState("");
  const proofInputRef = useRef<HTMLInputElement>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingStock, setCheckingStock] = useState(false);

  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran foto bukti transfer maksimal 5 MB.");
        return;
      }
      setProofFile(file);
      const url = URL.createObjectURL(file);
      setProofPreview(url);
    }
  };

  const handleRemoveProof = () => {
    setProofFile(null);
    setProofPreview(null);
    if (proofInputRef.current) {
      proofInputRef.current.value = "";
    }
  };

  // Set default dates (today 09:00 to tomorrow 17:00)
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const pad = (n: number) => String(n).padStart(2, "0");
    const fmtStart = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T09:00`;
    const fmtEnd = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T17:00`;

    setStartAt(fmtStart);
    setEndAt(fmtEnd);
  }, []);

  // Fetch Customers & Items
  useEffect(() => {
    fetch("/api/customers")
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setCustomers(json.data);
      })
      .catch(() => {});

    fetch("/api/items")
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setItemsList(json.data);
      })
      .catch(() => {});
  }, []);

  // Calculate rental duration in days
  const rentalDays = useMemo(() => {
    if (!startAt || !endAt) return 1;
    const diffMs = new Date(endAt).getTime() - new Date(startAt).getTime();
    if (diffMs <= 0) return 1;
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(1, days);
  }, [startAt, endAt]);

  // Check stock availability whenever dates or item selection changes
  const checkStockForSelectedItems = async () => {
    if (!startAt || !endAt || selectedItems.length === 0) return;

    setCheckingStock(true);
    try {
      const updated = await Promise.all(
        selectedItems.map(async (item) => {
          const res = await fetch("/api/bookings/check-availability", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              rental_item_id: item.rental_item_id,
              start_at: new Date(startAt).toISOString(),
              end_at: new Date(endAt).toISOString(),
            }),
          });
          const json = await res.json();
          return {
            ...item,
            available_quantity: typeof json.available_quantity === "number" ? json.available_quantity : 0,
          };
        })
      );
      setSelectedItems(updated);
    } catch {
      // Stock check fail
    } finally {
      setCheckingStock(false);
    }
  };

  useEffect(() => {
    if (startAt && endAt && selectedItems.length > 0) {
      checkStockForSelectedItems();
    }
  }, [startAt, endAt]);

  // Categories list derived from items
  const categoriesList = useMemo(() => {
    const map = new Map<string, string>();
    itemsList.forEach((item) => {
      if (item.categories?.id && item.categories?.name) {
        map.set(item.categories.id, item.categories.name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [itemsList]);

  // Filtered items based on search and category
  const filteredRentalItems = useMemo(() => {
    return itemsList.filter((item) => {
      const matchCat =
        selectedCategory === "ALL" || item.categories?.id === selectedCategory;
      const matchSearch =
        !itemSearch.trim() ||
        item.name.toLowerCase().includes(itemSearch.toLowerCase().trim()) ||
        (item.categories?.name && item.categories.name.toLowerCase().includes(itemSearch.toLowerCase().trim()));
      return matchCat && matchSearch;
    });
  }, [itemsList, selectedCategory, itemSearch]);

  // Stepper quantity handler (Adds, increments, decrements, removes)
  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setSelectedItems((prev) => {
      const existing = prev.find((i) => i.rental_item_id === itemId);
      if (!existing) {
        if (delta > 0) {
          const item = itemsList.find((i) => i.id === itemId);
          if (!item) return prev;
          return [
            ...prev,
            {
              rental_item_id: item.id,
              name: item.name,
              unit_price: Number(item.price),
              quantity: 1,
              available_quantity: item.total_quantity,
              image_url: item.image_url,
            },
          ];
        }
        return prev;
      }

      const nextQty = existing.quantity + delta;
      if (nextQty <= 0) {
        return prev.filter((i) => i.rental_item_id !== itemId);
      }

      return prev.map((i) =>
        i.rental_item_id === itemId ? { ...i, quantity: nextQty } : i
      );
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems((prev) => prev.filter((i) => i.rental_item_id !== itemId));
  };

  const estimatedTotal = useMemo(() => {
    return selectedItems.reduce((acc, item) => {
      return acc + item.unit_price * item.quantity * rentalDays;
    }, 0);
  }, [selectedItems, rentalDays]);

  const filteredCustomers = useMemo(() => {
    if (!customerName.trim() || selectedCustomerId) return [];
    const q = customerName.toLowerCase().trim();
    return customers
      .filter((c) => c.name.toLowerCase().includes(q) || (c.phone && c.phone.includes(q)))
      .slice(0, 5);
  }, [customers, customerName, selectedCustomerId]);

  const handleSelectCustomer = (c: Customer) => {
    setSelectedCustomerId(c.id);
    setCustomerName(c.name);
    setCustomerPhone(c.phone || "");
    setShowSuggestions(false);
  };

  const handleClearCustomer = () => {
    setSelectedCustomerId("");
    setCustomerName("");
    setCustomerPhone("");
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomerId && !customerName.trim()) {
      toast.error("Silakan isi nama pelanggan.");
      return;
    }

    if (selectedItems.length === 0) {
      toast.error("Tambahkan minimal 1 barang yang disewa.");
      return;
    }

    // Check if any item exceeds availability
    const stockErrors = selectedItems.filter((i) => i.quantity > i.available_quantity);
    if (stockErrors.length > 0) {
      toast.error(
        `Stok ${stockErrors[0].name} tidak mencukupi (sisa ${stockErrors[0].available_quantity} unit).`
      );
      return;
    }

    const payAmount = paymentType === "PAID"
      ? estimatedTotal
      : paymentType === "DP"
      ? Math.max(0, Number(customPaymentAmount) || 0)
      : 0;

    if (paymentType === "DP" && payAmount <= 0) {
      toast.error("Masukkan nominal DP yang valid.");
      return;
    }

    if (payAmount > estimatedTotal) {
      toast.error("Nominal pembayaran melebihi total biaya sewa.");
      return;
    }

    setLoading(true);

    try {
      let finalReference = paymentRef.trim() || undefined;

      if (payAmount > 0 && proofFile) {
        try {
          setUploadingProof(true);
          const uploadedUrl = await uploadToSupabaseStorage(proofFile, "proofs");
          if (uploadedUrl) {
            finalReference = uploadedUrl;
          }
        } catch {
          console.warn("Gagal mengupload bukti pembayaran, melanjutkan booking...");
        } finally {
          setUploadingProof(false);
        }
      }

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: selectedCustomerId || undefined,
          customer_name: !selectedCustomerId ? customerName.trim() : undefined,
          customer_phone: !selectedCustomerId ? (customerPhone.trim() || undefined) : undefined,
          start_at: new Date(startAt).toISOString(),
          end_at: new Date(endAt).toISOString(),
          deposit_total: depositTotal ? Number(depositTotal) : 0,
          notes: notes.trim() || null,
          payment_amount: payAmount,
          payment_method: payAmount > 0 ? paymentMethod : undefined,
          payment_reference: finalReference,
          items: selectedItems.map((item) => ({
            rental_item_id: item.rental_item_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
          })),
        }),
      });

      const json = await res.json();

      if (res.status === 402) {
        toast.error("Batas kuota booking bulanan telah tercapai. Silakan upgrade paket.");
        return;
      }

      if (!res.ok) {
        toast.error(json.message || json.error || "Gagal membuat booking.");
        return;
      }

      toast.success("Booking berhasil dibuat!");
      router.push(`/bookings/${json.data.id}`);
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan sistem saat membuat booking.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/bookings"
          className="p-2 rounded-xl border border-[#e2e8f0] bg-white text-[#64748b] hover:text-[#0b1c30] hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0b1c30]">Buat Transaksi Booking</h1>
          <p className="text-xs text-[#64748b]">Pilih pelanggan, rentang waktu sewa, dan barang rental</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Customer & Date Period (2 Column Layout) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-[#0b1c30]">1. Data Pelanggan &amp; Durasi Sewa</h2>

          {/* Customer Input with Autocomplete Suggestions */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name Input with Dropdown Autocomplete */}
              <div className="relative">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-[#0b1c30]">
                    Nama Pelanggan <span className="text-red-500">*</span>
                  </label>
                  {selectedCustomerId && (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Terdaftar
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (selectedCustomerId) {
                        setSelectedCustomerId(""); // User modified name, dissociate from old id
                      }
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Ketik nama pelanggan..."
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#e2e8f0] bg-white focus:outline-none focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5]"
                  />
                  {customerName && (
                    <button
                      type="button"
                      onClick={handleClearCustomer}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs px-1"
                      title="Reset Nama"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Dropdown Suggestions if previous customers found */}
                {showSuggestions && filteredCustomers.length > 0 && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white rounded-xl border border-[#cbd5e1] shadow-lg overflow-hidden divide-y divide-slate-100 animate-fade-up">
                    <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold text-[#64748b] uppercase tracking-wider">
                      Pelanggan Pernah Booking ({filteredCustomers.length})
                    </div>
                    {filteredCustomers.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectCustomer(c)}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-[#eff4ff] transition flex items-center justify-between gap-2"
                      >
                        <div>
                          <p className="font-bold text-xs text-[#0b1c30]">{c.name}</p>
                          <p className="text-[11px] text-[#64748b]">{c.phone || "Tanpa No. HP"}</p>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-[#0051d5] font-semibold shrink-0">
                          Pilih
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Phone Input */}
              <div>
                <label className="block text-xs font-medium text-[#0b1c30] mb-1">
                  Nomor WhatsApp / HP
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="cth. 08123456789"
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#e2e8f0] bg-white focus:outline-none focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5]"
                />
              </div>
            </div>

            {/* Hint Badge */}
            {!selectedCustomerId && customerName.trim() && (
              <p className="text-[11px] text-[#64748b] bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                💡 Pelanggan baru ini akan otomatis tersimpan ke daftar kontak pelanggan.
              </p>
            )}
          </div>

          {/* Date Range Inputs */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid grid-cols-2 gap-2 sm:col-span-2">
              <div>
                <label className="block text-xs font-medium text-[#0b1c30] mb-1">
                  Mulai Sewa (Pickup)
                </label>
                <input
                  type="datetime-local"
                  required
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                  className="w-full px-2 py-2 text-xs rounded-lg border border-[#e2e8f0] bg-white focus:outline-none focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0b1c30] mb-1">
                  Selesai (Return)
                </label>
                <input
                  type="datetime-local"
                  required
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                  className="w-full px-2 py-2 text-xs rounded-lg border border-[#e2e8f0] bg-white focus:outline-none focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5]"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#64748b] bg-[#f8f9ff] p-2.5 rounded-xl border border-slate-100">
            <Calendar className="w-4 h-4 text-[#0051d5]" />
            <span>
              Estimasi durasi: <strong>{rentalDays} Hari Sewa</strong>
            </span>
          </div>
        </div>

        {/* Step 2: Item Selection & Availability Engine */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-5">
          <div>
            <h2 className="text-sm font-bold text-[#0b1c30]">2. Pilih Barang Rental</h2>
            <p className="text-xs text-[#64748b]">
              Cari dan pilih barang yang akan disewa. Ketersediaan stok dihitung otomatis secara real-time.
            </p>
          </div>

          {/* Search & Category Filter Toolbar */}
          <div className="bg-[#f8f9ff] p-3 sm:p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  placeholder="Cari nama barang atau kategori sewa..."
                  className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-[#e2e8f0] bg-white focus:outline-none focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5]"
                />
                {itemSearch && (
                  <button
                    type="button"
                    onClick={() => setItemSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs px-1"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Category Filter Dropdown */}
              {categoriesList.length > 0 && (
                <div className="w-full sm:w-48">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#e2e8f0] bg-white focus:outline-none"
                  >
                    <option value="ALL">Semua Kategori</option>
                    {categoriesList.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Item Quick Selection Grid (Max 6 or filtered results) */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-[#64748b] block mb-2">
                Katalog Barang ({filteredRentalItems.length} barang ditemukan):
              </span>

              {filteredRentalItems.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#64748b] bg-white rounded-lg border border-dashed border-slate-200">
                  Tidak ada barang yang cocok dengan pencarian &quot;{itemSearch}&quot;.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
                  {filteredRentalItems.map((item) => {
                    const selected = selectedItems.find((s) => s.rental_item_id === item.id);
                    const selectedQty = selected ? selected.quantity : 0;

                    return (
                      <div
                        key={item.id}
                        className={`p-2.5 rounded-xl border transition flex items-center justify-between gap-2.5 ${
                          selectedQty > 0
                            ? "bg-[#eff4ff] border-[#0051d5]/40 shadow-xs"
                            : "bg-white border-[#e2e8f0] hover:border-slate-300 shadow-2xs"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-100"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 border border-slate-200">
                              <Package className="w-5 h-5" />
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-xs text-[#0b1c30] truncate">{item.name}</p>
                            <p className="text-[11px] font-semibold text-[#0051d5]">
                              Rp {Number(item.price).toLocaleString("id-ID")}
                              <span className="text-[10px] text-[#64748b] font-normal"> /hari</span>
                            </p>
                            <p className="text-[10px] text-[#64748b]">
                              Stok Total: {item.total_quantity} Unit
                            </p>
                          </div>
                        </div>

                        {/* Qty Stepper right on Catalog Card */}
                        {selectedQty === 0 ? (
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.id, 1)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0051d5] hover:bg-[#0041ab] text-white shadow-xs flex items-center gap-1 transition shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" /> Tambah
                          </button>
                        ) : (
                          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#0051d5]/30 shrink-0 shadow-xs">
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item.id, -1)}
                              className="w-6 h-6 rounded bg-[#f8f9ff] hover:bg-red-50 text-[#0051d5] hover:text-red-600 font-bold text-xs flex items-center justify-center transition"
                              title="Kurangi"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center font-bold text-xs text-[#0051d5]">
                              {selectedQty}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item.id, 1)}
                              className="w-6 h-6 rounded bg-[#0051d5] hover:bg-[#0041ab] text-white font-bold text-xs flex items-center justify-center transition"
                              title="Tambah"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Selected Items Review & Total Summary (Bottom Section) */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0b1c30]">
                Ringkasan Pilihan Barang ({selectedItems.length} jenis barang):
              </span>
              {checkingStock && (
                <span className="text-[11px] text-[#0051d5] flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Memeriksa ketersediaan jadwal...
                </span>
              )}
            </div>

            {selectedItems.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-[#e2e8f0] rounded-xl p-4 text-xs text-[#64748b] bg-slate-50/50">
                Pilih barang dari katalog di atas dengan menekan tombol <strong>+ Tambah</strong>.
              </div>
            ) : (
              <div className="space-y-2">
                {selectedItems.map((item) => {
                  const subtotal = item.unit_price * item.quantity * rentalDays;
                  const isOutOfStock = item.quantity > item.available_quantity;

                  return (
                    <div
                      key={item.rental_item_id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                        isOutOfStock ? "bg-red-50/60 border-red-200" : "bg-white border-[#e2e8f0]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-9 h-9 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-100"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                            <Package className="w-4 h-4" />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs text-[#0b1c30] truncate">{item.name}</p>
                          <div className="flex items-center gap-2 text-[11px] text-[#64748b]">
                            <span>{item.quantity} Unit &times; Rp {item.unit_price.toLocaleString("id-ID")} ({rentalDays} Hari)</span>
                            <span>&bull;</span>
                            <span className={isOutOfStock ? "text-red-600 font-semibold" : "text-emerald-700"}>
                              Tersedia: {item.available_quantity}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <p className="font-bold text-xs text-[#0051d5]">
                          Rp {subtotal.toLocaleString("id-ID")}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.rental_item_id)}
                          className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Financial Summary, Payment Method & Notes */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-5">
          <div>
            <h2 className="text-sm font-bold text-[#0b1c30]">3. Pembayaran &amp; Catatan Transaksi</h2>
            <p className="text-xs text-[#64748b]">
              Tentukan status pembayaran awal (Lunas, DP, atau Bayar Nanti) dan metode pembayaran yang digunakan
            </p>
          </div>

          {/* Payment Status Switcher */}
          <div className="space-y-3 bg-[#f8f9ff] p-4 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold text-[#0b1c30]">
              Status Pembayaran Awal:
            </label>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentType("UNPAID")}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                  paymentType === "UNPAID"
                    ? "bg-[#131b2e] text-white border-[#131b2e] shadow-xs"
                    : "bg-white text-[#64748b] border-[#e2e8f0] hover:bg-slate-50"
                }`}
              >
                Bayar Nanti (Belum Bayar)
              </button>

              <button
                type="button"
                onClick={() => setPaymentType("DP")}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                  paymentType === "DP"
                    ? "bg-[#0051d5] text-white border-[#0051d5] shadow-xs"
                    : "bg-white text-[#64748b] border-[#e2e8f0] hover:bg-slate-50"
                }`}
              >
                Bayar Uang Muka (DP)
              </button>

              <button
                type="button"
                onClick={() => setPaymentType("PAID")}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                  paymentType === "PAID"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-white text-[#64748b] border-[#e2e8f0] hover:bg-slate-50"
                }`}
              >
                Langsung Lunas (Full)
              </button>
            </div>

            {/* If DP or Paid: Select Payment Method & Amount */}
            {paymentType !== "UNPAID" && (
              <div className="pt-3 border-t border-slate-200/80 space-y-3 animate-fade-up">
                {paymentType === "DP" && (
                  <div>
                    <label className="block text-xs font-medium text-[#0b1c30] mb-1">
                      Nominal Uang Muka (DP) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={estimatedTotal}
                      required
                      value={customPaymentAmount}
                      onChange={(e) => setCustomPaymentAmount(e.target.value)}
                      placeholder="cth. 100000"
                      className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#e2e8f0] bg-white focus:outline-none focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5] font-bold text-[#0051d5]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-[#0b1c30] mb-1.5">
                    Metode Pembayaran:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { id: "CASH", label: "Tunai / Cash", icon: Banknote },
                      { id: "TRANSFER", label: "Transfer Bank", icon: CreditCard },
                      { id: "QRIS", label: "QRIS", icon: QrCode },
                      { id: "EWALLET", label: "E-Wallet", icon: Wallet },
                      { id: "CARD", label: "Kartu Debit", icon: CreditCard },
                    ].map((m) => {
                      const Icon = m.icon;
                      const isSelected = paymentMethod === m.id;

                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setPaymentMethod(m.id as any)}
                          className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                            isSelected
                              ? "bg-blue-50 border-[#0051d5] text-[#0051d5] shadow-xs font-bold"
                              : "bg-white border-[#e2e8f0] text-[#64748b] hover:bg-slate-50 font-medium"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-[11px]">{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Payment Proof Photo Upload */}
                <div>
                  <label className="block text-xs font-medium text-[#0b1c30] mb-1.5">
                    Bukti Pembayaran / Transfer (Foto / Screenshot, Opsional)
                  </label>

                  <input
                    type="file"
                    ref={proofInputRef}
                    onChange={handleProofChange}
                    accept="image/*"
                    className="hidden"
                  />

                  {proofPreview ? (
                    <div className="relative p-2.5 rounded-xl border border-blue-200 bg-white flex items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <img
                          src={proofPreview}
                          alt="Bukti Transfer"
                          className="w-12 h-12 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#0b1c30] truncate">
                            {proofFile?.name || "Bukti_Pembayaran.jpg"}
                          </p>
                          <p className="text-[10px] text-emerald-600 font-medium">
                            ✓ Foto bukti siap diunggah
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleRemoveProof}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                        title="Hapus Foto"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => proofInputRef.current?.click()}
                      className="cursor-pointer border-2 border-dashed border-[#cbd5e1] hover:border-[#0051d5] rounded-xl p-3 text-center bg-white hover:bg-slate-50/70 transition flex items-center justify-center gap-2 text-xs font-medium text-[#64748b]"
                    >
                      <ImagePlus className="w-4 h-4 text-[#0051d5]" />
                      <span>Upload / Ambil Foto Bukti Transfer (Screenshot/Struk)</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Deposit & Notes Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#0b1c30] mb-1">
                Jaminan / Deposit Tambahan (Rp, Opsional)
              </label>
              <input
                type="number"
                min={0}
                value={depositTotal}
                onChange={(e) => setDepositTotal(e.target.value)}
                placeholder="cth. 200000"
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#e2e8f0] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0b1c30] mb-1">
                Catatan Transaksi / Keperluan (Opsional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="cth. Digunakan untuk camping Gunung Prau."
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#e2e8f0] focus:outline-none"
              />
            </div>
          </div>

          {/* Bottom Bar: Total & Submit */}
          <div className="pt-4 border-t border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-[#64748b]">Total Estimasi Biaya Sewa:</span>
              <p className="text-2xl font-bold text-[#0051d5]">
                Rp {estimatedTotal.toLocaleString("id-ID")}
              </p>
              {paymentType === "DP" && Number(customPaymentAmount) > 0 && (
                <p className="text-[11px] text-amber-600 font-medium mt-0.5">
                  DP: Rp {Number(customPaymentAmount).toLocaleString("id-ID")} &bull; Sisa Tagihan: Rp {Math.max(0, estimatedTotal - Number(customPaymentAmount)).toLocaleString("id-ID")}
                </p>
              )}
              {paymentType === "PAID" && (
                <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                  ✓ Langsung Lunas: Rp {estimatedTotal.toLocaleString("id-ID")} ({paymentMethod})
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/bookings"
                className="px-4 py-2.5 rounded-xl border border-[#e2e8f0] text-xs font-medium text-[#64748b] hover:bg-slate-50"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={loading || selectedItems.length === 0}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0051d5] hover:bg-[#0041ab] text-white text-xs font-semibold shadow-xs transition disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memproses Booking...</span>
                  </>
                ) : (
                  <>
                    <PackageCheck className="w-4 h-4" />
                    <span>Konfirmasi &amp; Simpan Booking</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
