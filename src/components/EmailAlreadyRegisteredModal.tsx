"use client";

import { AlertCircle, LogIn, ArrowLeft } from "lucide-react";

interface EmailAlreadyRegisteredModalProps {
  isOpen: boolean;
  email: string;
  onGoToLogin: () => void;
  onUseOtherEmail: () => void;
}

export function EmailAlreadyRegisteredModal({
  isOpen,
  email,
  onGoToLogin,
  onUseOtherEmail,
}: EmailAlreadyRegisteredModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#e2e8f0] shadow-xl overflow-hidden p-6 sm:p-7 text-center">
        {/* Warning Icon */}
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>

        {/* Modal Title & Text */}
        <h3 className="text-lg font-bold text-[#0b1c30]">
          Email Sudah Terdaftar
        </h3>
        <p className="text-xs sm:text-sm text-[#64748b] mt-2 leading-relaxed">
          Alamat email <strong className="text-[#0b1c30]">{email}</strong> telah digunakan oleh akun lain. Silakan masuk menggunakan kata sandi Anda atau daftar dengan alamat email berbeda.
        </p>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onGoToLogin}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0051d5] hover:bg-[#0041ab] text-white text-xs sm:text-sm font-semibold shadow-xs transition active:scale-[0.98]"
          >
            <LogIn className="w-4 h-4" />
            <span>Langsung Masuk ke Akun</span>
          </button>

          <button
            type="button"
            onClick={onUseOtherEmail}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[#e2e8f0] bg-white hover:bg-slate-50 text-[#0b1c30] text-xs sm:text-sm font-medium transition active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Gunakan Email Lain</span>
          </button>
        </div>
      </div>
    </div>
  );
}
