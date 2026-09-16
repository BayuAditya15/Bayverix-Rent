"use client";

import { useState } from "react";
import { Image as ImageIcon, ExternalLink, X, Eye } from "lucide-react";

export function PaymentProofViewer({ reference }: { reference: string | null }) {
  const [showModal, setShowModal] = useState(false);

  if (!reference) return null;

  const isImageUrl =
    reference.startsWith("http://") ||
    reference.startsWith("https://") ||
    reference.startsWith("data:image/");

  if (!isImageUrl) {
    return (
      <span className="text-[11px] font-mono text-[#64748b] bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
        Ref: {reference}
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0051d5] hover:underline bg-blue-50/80 px-2 py-0.5 rounded-md border border-blue-100 transition"
      >
        <ImageIcon className="w-3 h-3" />
        <span>Lihat Bukti Transfer</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-up">
          <div className="relative max-w-lg w-full bg-white rounded-2xl p-4 shadow-2xl space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#0b1c30] flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#0051d5]" />
                <span>Foto Bukti Pembayaran</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center p-2">
              <img
                src={reference}
                alt="Bukti Pembayaran"
                className="max-h-[65vh] w-auto object-contain rounded-lg shadow-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <a
                href={reference}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0051d5] text-white hover:bg-[#0041ab] transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka Gambar Penuh</span>
              </a>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#64748b] hover:bg-slate-100 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
