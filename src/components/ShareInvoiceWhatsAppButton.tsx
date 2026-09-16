"use client";

import { useState } from "react";
import { MessageCircle, Share2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface ShareInvoiceProps {
  bookingNumber: string;
  storeName: string;
  customerName: string;
  customerPhone: string | null;
  startDate: string;
  endDate: string;
  items: {
    name: string;
    quantity: number;
    subtotal: number;
  }[];
  rentalTotal: number;
  depositTotal: number;
  amountPaid: number;
  amountDue: number;
  status: string;
  notes?: string | null;
}

export function ShareInvoiceWhatsAppButton({
  bookingNumber,
  storeName,
  customerName,
  customerPhone,
  startDate,
  endDate,
  items,
  rentalTotal,
  depositTotal,
  amountPaid,
  amountDue,
  status,
  notes,
}: ShareInvoiceProps) {
  const [copied, setCopied] = useState(false);

  const cleanPhone = customerPhone
    ? customerPhone.replace(/^0/, "62").replace(/\D/g, "")
    : "";

  const itemLines = items
    .map((i) => `• ${i.quantity}x ${i.name} (Rp ${Number(i.subtotal).toLocaleString("id-ID")})`)
    .join("\n");

  const invoiceMessage =
    `🧾 *INVOICE SEWA — ${storeName.toUpperCase()}*\n` +
    `----------------------------------------\n` +
    `📌 *No. Invoice:* ${bookingNumber}\n` +
    `👤 *Nama Penyewa:* ${customerName}\n` +
    `📅 *Periode Sewa:*\n` +
    `   Ambil: ${startDate}\n` +
    `   Kembali: ${endDate}\n\n` +
    `🎒 *Rincian Barang:*\n${itemLines}\n\n` +
    `💰 *Total Biaya Sewa:* Rp ${Number(rentalTotal).toLocaleString("id-ID")}\n` +
    (depositTotal > 0 ? `🛡️ *Jaminan/Deposit:* Rp ${Number(depositTotal).toLocaleString("id-ID")}\n` : "") +
    `💳 *Terbayar:* Rp ${Number(amountPaid).toLocaleString("id-ID")}\n` +
    `⚠️ *Sisa Tagihan:* ${amountDue > 0 ? `Rp ${Number(amountDue).toLocaleString("id-ID")}` : "LUNAS ✅"}\n` +
    `📊 *Status:* ${status}\n` +
    (notes ? `\n📝 *Catatan:* ${notes}\n` : "") +
    `----------------------------------------\n` +
    `Terima kasih telah menyewa di *${storeName}*!`;

  const handleShareWhatsApp = () => {
    if (cleanPhone) {
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(invoiceMessage)}`;
      window.open(waUrl, "_blank");
    } else {
      // Prompt user or copy to clipboard
      navigator.clipboard.writeText(invoiceMessage);
      toast.info("No. WhatsApp pelanggan belum diisi. Teks invoice telah disalin ke clipboard!");
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(invoiceMessage);
      setCopied(true);
      toast.success("Format teks invoice berhasil disalin!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={handleShareWhatsApp}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition"
        title="Kirim invoice ke WhatsApp Pelanggan"
      >
        <MessageCircle className="w-4 h-4" />
        <span>Kirim Invoice WA</span>
      </button>

      <button
        type="button"
        onClick={handleCopyText}
        className="p-2 rounded-xl border border-[#e2e8f0] bg-white hover:bg-slate-50 text-[#64748b] hover:text-[#0b1c30] transition shadow-2xs"
        title="Salin Teks Invoice"
      >
        {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}
