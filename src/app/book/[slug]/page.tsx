"use client";

import { useEffect, useState, useMemo, use } from "react";
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
  ShoppingCart,
  X,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface Business {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  logo_url: string | null;
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
  image_url: string | null;
  description: string | null;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
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
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Dates
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");

  // Cart
  const [cart, setCart] = useState<Record<string, number>>({});
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [successBooking, setSuccessBooking] = useState<{
    booking_number: string;
    whatsapp_url: string | null;
    store_name: string;
  } | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Set default dates (today 09:00 to tomorrow 17:00)
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const pad = (n: number) => String(n).padStart(2, "0");
    setStartAt(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T09:00`);
    setEndAt(`${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T17:00`);
  }, []);

  // Fetch Store Catalog
  useEffect(() => {
    if (!slug) return;

    fetch(`/api/public/book/${slug}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.business) {
          setBusiness(json.business);
          setCategories(json.categories || []);
          setItems(json.items || []);
        } else {
          toast.error(json.error || "Toko tidak ditemukan.");
        }
      })
      .catch(() => {
        toast.error("Gagal memuat katalog toko.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  // Duration in days
  const rentalDays = useMemo(() => {
    if (!startAt || !endAt) return 1;
    const diffMs = new Date(endAt).getTime() - new Date(startAt).getTime();
    if (diffMs <= 0) return 1;
    return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }, [startAt, endAt]);

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      const current = prev[itemId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
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

    setSubmitting(true);

    try {
      const res = await fetch(`/api/public/book/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName,
          customer_phone: customerPhone,
          start_at: new Date(startAt).toISOString(),
          end_at: new Date(endAt).toISOString(),
          notes: customerNotes.trim() || null,
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
              <p className="text-xs text-[#64748b]">Katalog &amp; Reservasi Sewa Online</p>
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
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0051d5]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0b1c30]">
              Tentukan Waktu Sewa
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[#64748b] mb-1">Mulai Sewa (Pickup):</label>
              <input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e8f0] bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0051d5]/20"
              />
            </div>
            <div>
              <label className="block text-[#64748b] mb-1">Selesai Sewa (Return):</label>
              <input
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e8f0] bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0051d5]/20"
              />
            </div>
          </div>

          <p className="text-[11px] text-[#64748b]">
            Durasi sewa dihitung: <strong>{rentalDays} Hari</strong>
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

            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex items-center justify-between gap-3 hover:border-[#0051d5]/40 transition"
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
                    <p className="font-extrabold text-xs sm:text-sm text-[#0051d5] mt-0.5">
                      Rp {Number(item.price).toLocaleString("id-ID")}{" "}
                      <span className="text-[10px] font-normal text-[#64748b]">/ hari</span>
                    </p>
                    {item.description && (
                      <p className="text-[11px] text-[#64748b] truncate mt-0.5">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  {qtyInCart > 0 ? (
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
                        onClick={() => handleUpdateQuantity(item.id, 1)}
                        className="p-1 rounded-lg bg-white text-[#0051d5] hover:bg-slate-50 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(item.id, 1)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0051d5] hover:bg-[#0041ab] text-white text-xs font-semibold shadow-xs transition"
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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0051d5] hover:bg-[#0041ab] text-white text-xs sm:text-sm font-semibold shadow-md transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Booking via WhatsApp</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Checkout Modal ── */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#e2e8f0] p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-2 border-b border-[#e2e8f0]">
              <div>
                <h3 className="text-base font-bold text-[#0b1c30]">Data Pemesan</h3>
                <p className="text-xs text-[#64748b]">Konfirmasi pemesanan sewa ke {business.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                className="p-1.5 rounded-full text-[#64748b] hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitBooking} className="space-y-3.5">
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

              {/* Order Summary */}
              <div className="p-3 bg-[#f8f9ff] rounded-xl border border-slate-100 text-xs space-y-1">
                <div className="flex justify-between text-[#64748b]">
                  <span>Total Sewa ({rentalDays} Hari):</span>
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
                      <span>Menyimpan Pesanan...</span>
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
                Pesanan Anda telah langsung tercatat di sistem kami. Tim toko akan segera menyiapkan ketersediaan unit untuk Anda.
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
