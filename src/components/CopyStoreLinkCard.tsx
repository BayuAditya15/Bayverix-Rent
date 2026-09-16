"use client";

import { useState, useEffect } from "react";
import { Copy, Check, ExternalLink, Link as LinkIcon } from "lucide-react";

export function CopyStoreLinkCard({
  slug,
  businessName,
  phone,
}: {
  slug: string | null;
  businessName: string;
  phone: string | null;
}) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setMounted(true);
    setOrigin(window.location.origin);
  }, []);

  // Fallback slug if empty
  const cleanSlug = slug || "store";
  const publicUrl = mounted && origin ? `${origin}/book/${cleanSlug}` : `/book/${cleanSlug}`;

  const handleCopy = async () => {
    try {
      const fullUrl = typeof window !== "undefined" ? `${window.location.origin}/book/${cleanSlug}` : `/book/${cleanSlug}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="p-5 sm:p-7 rounded-2xl bg-gradient-to-br from-[#f8faff] to-[#eff4ff] border border-[#dbe6fe] shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#0051d5] text-white flex items-center justify-center shadow-sm">
            <LinkIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#0b1c30]">Link Booking Online Toko</h2>
            <p className="text-[11px] text-[#64748b]">
              Bagikan link ini ke bio Instagram / WhatsApp pelanggan Anda
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* URL Input Box */}
          <div className="flex-1 flex items-center bg-white px-3 py-2.5 rounded-xl border border-[#cbd5e1] min-w-0">
            <input
              type="text"
              readOnly
              value={publicUrl}
              suppressHydrationWarning
              className="w-full text-xs font-mono font-medium text-[#0b1c30] bg-transparent outline-none truncate select-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#0051d5] text-white hover:bg-[#0040a8] transition-colors shadow-xs active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Link</span>
                </>
              )}
            </button>

            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl border border-[#cbd5e1] bg-white text-[#64748b] hover:text-[#0051d5] hover:bg-slate-50 transition-colors shrink-0"
              title="Buka Halaman Publik"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {!phone && (
          <p className="text-[11px] text-amber-600 font-medium">
            ⚠️ Nomor WhatsApp toko belum diisi di profil. Pelanggan tidak akan bisa kirim pesan WA otomatis sampai nomor diisi.
          </p>
        )}
      </div>
    </div>
  );
}
