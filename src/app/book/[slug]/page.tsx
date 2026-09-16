"use client";

import { useEffect, useState, useMemo, use, useRef } from "react";
import {
  Package,
  Calendar,
  Phone,
  MapPin,
  Plus,
  Minus,
  MessageCircle,
  Loader2,
  CheckCircle2,
  Store,
  CreditCard,
  Banknote,
  Upload,
  X,
  Sparkles,
  AlertCircle,
  Image as ImageIcon,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { uploadToSupabaseStorage } from "@/lib/supabase/storage";

interface Business {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  logo_url: string | null;
  bank_name?: string | null;
  bank_account_number?: string | null;
  bank_account_holder?: string | null;
}

interface Category {
  id: string;
  name: string;
}

interface Item {
  id: string;
  name: string;
  category_id: string | null;
  price: number;
  price_unit: string;
  deposit_amount: number;
  total_quantity: number;
  available_quantity?: number;
  image_url: string | null;
  description: string | null;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  available_quantity: number;
}

export default function PublicBookingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [business, setBusiness] = useState<Business | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStock, setLoadingStock] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Dates initialized synchronously
  const [startAt, setStartAt] = useState(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T09:00`;
  });
  const [endAt, setEndAt] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T17:00`;
  });

  // Cart & Modals
  const [cart, setCart] = useState<Record<string, number>>({});
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [successBooking, setSuccessBooking] = useState<{
    booking_number: string;
    whatsapp_url: string | null;
    store_name: string;
    payment_method?: string;
  } | null>(null);

  // Form inputs
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"BAYAR_NANTI" | "TRANSFER">("BAYAR_NANTI");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch Store Catalog and Real-Time Stock with debounce
  useEffect(() => {
    if (!slug) return;

    const timer = setTimeout(() => {
      let url = `/api/public/book/${slug}`;
      if (startAt && endAt) {
        url += `?start_at=${encodeURIComponent(new Date(startAt).toISOString())}&end_at=${encodeURIComponent(new Date(endAt).toISOString())}`;
      }

      setLoadingStock(true);
      fetch(url)
        .then((res) => res.json())
        .then((json) => {
          if (json.business) {
            setBusiness(json.business);
            setCategories(json.categories || []);
            setItems(json.items || []);

            // Auto-adjust cart if booked items exceed newly computed availability
            if (json.items) {
              setCart((prevCart) => {
                const updatedCart: Record<string, number> = {};
                for (const [itemId, qty] of Object.entries(prevCart)) {
                  const fetchedItem = (json.items as Item[]).find((i) => i.id === itemId);
                  const maxAvail = fetchedItem ? (fetchedItem.available_quantity ?? fetchedItem.total_quantity) : 0;
                  if (maxAvail > 0) {
                    updatedCart[itemId] = Math.min(qty, maxAvail);
                  }
                }
                return updatedCart;
              });
            }
          } else {
            toast.error(json.error || "Toko tidak ditemukan.");
          }
        })
        .catch(() => {
          toast.error("Gagal memuat katalog toko.");
        })
        .finally(() => {
          setLoading(false);
          setLoadingStock(false);
        });
    }, 200);

    return () => clearTimeout(timer);
  }, [slug, startAt, endAt]);

  // Duration in days
  const rentalDays = useMemo(() => {
    if (!startAt || !endAt) return 1;
    const diffMs = new Date(endAt).getTime() - new Date(startAt).getTime();
    if (diffMs <= 0) return 1;
    return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }, [startAt, endAt]);

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    const item = items.find((i) => i.id === itemId);
    const maxAvail = item ? (item.available_quantity ?? item.total_quantity) : 999;

    setCart((prev) => {
      const current = prev[itemId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      if (next > maxAvail) {
        toast.warning(`Maksimal ${maxAvail} unit tersedia untuk periode tanggal ini.`);
        return { ...prev, [itemId]: maxAvail };
      }
      return { ...prev, [itemId]: next };
    });
  };

  const cartList: CartItem[] = useMemo(() => {
    return Object.entries(cart)
      .map(([itemId, qty]) => {
        const itm = items.find((i) => i.id === itemId);
        if (!itm) return null;
        return {
          id: itm.id,
          name: itm.name,
          price: Number(itm.price),
          quantity: qty,
          available_quantity: itm.available_quantity ?? itm.total_quantity,
        };
      })
      .filter(Boolean) as CartItem[];
  }, [cart, items]);

  const totalEstimate = useMemo(() => {
    return cartList.reduce((acc, item) => {
      return acc + item.price * item.quantity * rentalDays;
    }, 0);
  }, [cartList, rentalDays]);

  const totalItemsCount = useMemo(() => {
    return Object.values(cart).reduce((a, b) => a + b, 0);
  }, [cart]);

  const filteredItems = useMemo(() => {
    if (!selectedCategory) return items;
    return items.filter((i) => i.category_id === selectedCategory);
  }, [items, selectedCategory]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 5MB.");
        return;
      }
      setProofFile(file);
      const reader = new FileReader();
      reader.onload = () => setProofPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleClearProof = () => {
    setProofFile(null);
    setProofPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCopyBank = () => {
    const textToCopy = business?.bank_account_number
      ? `${business.bank_account_number}`
      : `${business?.bank_name || "BCA"} 7310892831 a/n ${business?.name || "Rental"}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedBank(true);
    toast.success("Nomor rekening toko berhasil disalin!");
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error("Mohon isi nama dan nomor WhatsApp Anda.");
      return;
    }

    if (cartList.length === 0) {
      toast.error("Pilih minimal 1 barang sewa.");
      return;
    }

    if (paymentMethod === "TRANSFER" && !proofFile) {
      toast.error("Mohon unggah foto bukti transfer pembayaran.");
      return;
    }

    setSubmitting(true);

    try {
      let uploadedProofUrl: string | undefined = undefined;

      if (paymentMethod === "TRANSFER" && proofFile) {
        toast.loading("Mengunggah bukti pembayaran...", { id: "upload-proof" });
        uploadedProofUrl = await uploadToSupabaseStorage(proofFile, "proofs");
        toast.dismiss("upload-proof");
      }

      const res = await fetch(`/api/public/book/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName,
          customer_phone: customerPhone,
          start_at: new Date(startAt).toISOString(),
          end_at: new Date(endAt).toISOString(),
          notes: customerNotes.trim() || null,
          payment_method: paymentMethod,
          payment_proof_url: uploadedProofUrl,
          items: cartList.map((c) => ({
            rental_item_id: c.id,
            quantity: c.quantity,
          })),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Gagal mengirim booking.");
        return;
      }

      toast.success("Pesanan sewa berhasil dikirim!");
      setShowCheckoutModal(false);
      setSuccessBooking(json);
      setCart({});
      setCustomerNotes("");
      handleClearProof();
    } catch {
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9ff]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0051d5]" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#f8f9ff] text-center">
        <Store className="w-12 h-12 text-[#64748b] mb-3" />
        <h1 className="text-lg font-bold text-[#0b1c30]">Toko Tidak Ditemukan</h1>
        <p className="text-xs text-[#64748b] mt-1">
          Halaman booking untuk alamat &quot;{slug}&quot; tidak tersedia.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] pb-28">
      {/* ── Store Header Banner ── */}
      <header className="bg-white border-b border-[#e2e8f0] px-4 py-6 sm:py-8 shadow-xs">
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0051d5] text-white flex items-center justify-center font-bold text-xl shadow-xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-[#0b1c30]">{business.name}</h1>
              <p className="text-xs text-[#64748b]">Katalog &amp; Reservasi Sewa Online Real-Time</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#64748b] pt-1">
            {business.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>{business.phone}</span>
              </div>
            )}
            {business.address && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#0051d5]" />
                <span className="truncate max-w-xs">{business.address}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Booking Content ── */}
      <main className="max-w-3xl mx-auto p-4 space-y-6">
        {/* Date Selector Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0051d5]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#0b1c30]">
                Tentukan Waktu Sewa
              </h2>
            </div>
            {loadingStock && (
              <span className="inline-flex items-center gap-1 text-[11px] text-[#0051d5]">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Cek Stok...</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[#64748b] mb-1 font-medium">Mulai Sewa (Pickup):</label>
              <input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e8f0] bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0051d5]/20 font-sans"
              />
            </div>
            <div>
              <label className="block text-[#64748b] mb-1 font-medium">Selesai Sewa (Return):</label>
              <input
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e8f0] bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0051d5]/20 font-sans"
              />
            </div>
          </div>

          <p className="text-[11px] text-[#64748b]">
            Durasi sewa dihitung: <strong>{rentalDays} Hari</strong> &bull; Stok dihitung otomatis berdasarkan tanggal di atas.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory("")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              !selectedCategory
                ? "bg-[#0051d5] text-white shadow-xs"
                : "bg-white border border-[#e2e8f0] text-[#0b1c30] hover:bg-slate-50"
            }`}
          >
            Semua ({items.length})
          </button>
          {categories.map((cat) => {
            const count = items.filter((i) => i.category_id === cat.id).length;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? "bg-[#0051d5] text-white shadow-xs"
                    : "bg-white border border-[#e2e8f0] text-[#0b1c30] hover:bg-slate-50"
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Items Catalog List */}
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const qtyInCart = cart[item.id] || 0;
            const available = item.available_quantity ?? item.total_quantity;
            const isOutOfStock = available <= 0;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl bg-white border transition ${
                  isOutOfStock
                    ? "border-slate-200 opacity-75"
                    : "border-[#e2e8f0] hover:border-[#0051d5]/40 shadow-xs"
                } flex items-center justify-between gap-3`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-[#eff4ff] border border-[#dce9ff] flex items-center justify-center shrink-0">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-6 h-6 text-[#0051d5]" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-bold text-xs sm:text-sm text-[#0b1c30] truncate">
                      {item.name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                      <p className="font-extrabold text-xs sm:text-sm text-[#0051d5]">
                        Rp {Number(item.price).toLocaleString("id-ID")}{" "}
                        <span className="text-[10px] font-normal text-[#64748b]">/ hari</span>
                      </p>

                      {isOutOfStock ? (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                          Stok Habis
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          Tersedia: {available} unit
                        </span>
                      )}
                    </div>

                    {item.description && (
                      <p className="text-[11px] text-[#64748b] truncate mt-0.5">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  {isOutOfStock ? (
                    <button
                      type="button"
                      disabled
                      className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-medium cursor-not-allowed"
                    >
                      Habis
                    </button>
                  ) : qtyInCart > 0 ? (
                    <div className="flex items-center gap-1.5 bg-[#eff4ff] p-1 rounded-xl border border-[#dce9ff]">
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.id, -1)}
                        className="p-1 rounded-lg bg-white text-[#0051d5] hover:bg-slate-50 transition"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-bold text-xs text-[#0051d5] px-1.5 min-w-[20px] text-center">
                        {qtyInCart}
                      </span>
                      <button
                        type="button"
                        disabled={qtyInCart >= available}
                        onClick={() => handleUpdateQuantity(item.id, 1)}
                        className="p-1 rounded-lg bg-white text-[#0051d5] hover:bg-slate-50 transition disabled:opacity-40"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(item.id, 1)}
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#0051d5] hover:bg-[#0041ab] text-white text-xs font-semibold shadow-xs transition active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Sewa</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* ── Fixed Bottom Sticky Bar for Checkout ── */}
      {totalItemsCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#e2e8f0] p-4 shadow-xl backdrop-blur-md">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] text-[#64748b]">
                {totalItemsCount} Unit &bull; {rentalDays} Hari Sewa
              </p>
              <p className="text-base sm:text-lg font-extrabold text-[#0051d5]">
                Rp {totalEstimate.toLocaleString("id-ID")}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowCheckoutModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0051d5] hover:bg-[#0041ab] text-white text-xs sm:text-sm font-semibold shadow-md transition active:scale-95"
            >
              <span>Lanjut Pemesanan</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Checkout Modal ── */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#e2e8f0] p-5 sm:p-6 space-y-4 my-8 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-2 border-b border-[#e2e8f0]">
              <div>
                <h3 className="text-base font-bold text-[#0b1c30]">Formulir Pemesanan Sewa</h3>
                <p className="text-xs text-[#64748b]">Konfirmasi data dan metode pembayaran ke {business.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                className="p-1.5 rounded-full text-[#64748b] hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitBooking} className="space-y-4">
              {/* Customer Info */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#0b1c30] mb-1">
                    Nama Lengkap Anda <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="cth. Budi Santoso"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#0b1c30] mb-1">
                    Nomor WhatsApp Anda <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="cth. 08123456789"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#0b1c30] mb-1">
                    Catatan Tambahan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="cth. Ambil pagi jam 09.00 ya kak."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5]"
                  />
                </div>
              </div>

              {/* Payment Method Selector (2 Options: Bayar Nanti vs Transfer) */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-bold text-[#0b1c30]">
                  Pilihan Metode Pembayaran <span className="text-red-500">*</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Option 1: Bayar Nanti */}
                  <label
                    className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition ${
                      paymentMethod === "BAYAR_NANTI"
                        ? "border-[#0051d5] bg-[#eff4ff] ring-1 ring-[#0051d5]"
                        : "border-[#e2e8f0] hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="BAYAR_NANTI"
                      checked={paymentMethod === "BAYAR_NANTI"}
                      onChange={() => setPaymentMethod("BAYAR_NANTI")}
                      className="mt-0.5 text-[#0051d5] focus:ring-[#0051d5]"
                    />
                    <div className="text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-[#0b1c30]">
                        <Banknote className="w-4 h-4 text-[#0051d5]" />
                        <span>Bayar di Toko</span>
                      </div>
                      <p className="text-[11px] text-[#64748b] mt-0.5">
                        Bayar tunai / QRIS saat ambil unit rental di toko.
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Transfer Bank */}
                  <label
                    className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition ${
                      paymentMethod === "TRANSFER"
                        ? "border-[#0051d5] bg-[#eff4ff] ring-1 ring-[#0051d5]"
                        : "border-[#e2e8f0] hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="TRANSFER"
                      checked={paymentMethod === "TRANSFER"}
                      onChange={() => setPaymentMethod("TRANSFER")}
                      className="mt-0.5 text-[#0051d5] focus:ring-[#0051d5]"
                    />
                    <div className="text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-[#0b1c30]">
                        <CreditCard className="w-4 h-4 text-[#0051d5]" />
                        <span>Transfer Bank</span>
                      </div>
                      <p className="text-[11px] text-[#64748b] mt-0.5">
                        Transfer bank &amp; unggah bukti transfer.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Transfer Details & Proof Upload Section */}
              {paymentMethod === "TRANSFER" && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-[#64748b]">Rekening Resmi Toko:</p>
                      <p className="text-xs font-bold text-[#0b1c30]">
                        {business.bank_name ? `${business.bank_name}: ` : "BCA: "}
                        {business.bank_account_number || "7310892831"}
                      </p>
                      <p className="text-[11px] text-[#64748b]">
                        a/n {business.bank_account_holder || business.name}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyBank}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-white border border-[#e2e8f0] hover:bg-slate-50 text-[#0b1c30] transition"
                    >
                      {copiedBank ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-[#64748b]" />}
                      <span>{copiedBank ? "Tersalin" : "Salin No. Rek"}</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#0b1c30] mb-1.5">
                      Unggah Bukti Transfer <span className="text-red-500">*</span>
                    </label>

                    {proofPreview ? (
                      <div className="relative rounded-xl border border-slate-200 bg-white p-2 flex items-center gap-3">
                        <img
                          src={proofPreview}
                          alt="Bukti Transfer Preview"
                          className="w-16 h-16 object-cover rounded-lg border border-slate-100"
                        />
                        <div className="flex-1 min-w-0 text-xs">
                          <p className="font-semibold text-[#0b1c30] truncate">{proofFile?.name}</p>
                          <p className="text-[11px] text-emerald-600 flex items-center gap-1 mt-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Foto siap dikirim
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleClearProof}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-[#dce9ff] hover:border-[#0051d5] bg-white rounded-xl p-3.5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1"
                      >
                        <Upload className="w-5 h-5 text-[#0051d5]" />
                        <p className="text-xs font-medium text-[#0b1c30]">
                          Klik untuk pilih foto bukti transfer
                        </p>
                        <p className="text-[10px] text-[#64748b]">JPG, PNG, atau Screenshot (Maks 5MB)</p>
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div className="p-3 bg-[#f8f9ff] rounded-xl border border-slate-100 text-xs space-y-1">
                <div className="flex justify-between text-[#64748b]">
                  <span>Total Biaya Sewa ({rentalDays} Hari):</span>
                  <span className="font-bold text-[#0051d5]">
                    Rp {totalEstimate.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0051d5] hover:bg-[#0041ab] text-white text-xs sm:text-sm font-bold shadow-md transition disabled:opacity-60 active:scale-[0.98]"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memproses Pesanan...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Kirim Pesanan Sewa</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Success Booking Modal ── */}
      {successBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSuccessBooking(null)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl border border-[#e2e8f0] shadow-xl overflow-hidden p-6 sm:p-7 text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#0051d5] border border-blue-100 mb-1.5 font-mono">
                {successBooking.booking_number}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-[#0b1c30]">
                Pesanan Sewa Berhasil Dikirim!
              </h3>
              <p className="text-xs sm:text-sm text-[#64748b] mt-1.5 leading-relaxed">
                Status pesanan Anda saat ini adalah <strong className="text-amber-700 font-semibold">PENDING</strong>. Tim toko akan segera mengonfirmasi ketersediaan unit dan pembayaran Anda.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              {successBooking.whatsapp_url && (
                <a
                  href={successBooking.whatsapp_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition active:scale-[0.98]"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat Toko via WhatsApp (Opsional)</span>
                </a>
              )}

              <button
                type="button"
                onClick={() => setSuccessBooking(null)}
                className="w-full py-2.5 px-4 rounded-xl border border-[#e2e8f0] bg-white hover:bg-slate-50 text-[#0b1c30] text-xs sm:text-sm font-medium transition active:scale-[0.98]"
              >
                Selesai &amp; Kembali ke Katalog
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

