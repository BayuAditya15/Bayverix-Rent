"use client";

import { MessageCircle } from "lucide-react";

interface WhatsAppChatButtonProps {
  phone: string;
  className?: string;
  size?: "sm" | "md";
}

export function WhatsAppChatButton({
  phone,
  className = "",
  size = "sm",
}: WhatsAppChatButtonProps) {
  const cleanPhone = phone?.replace(/^0/, "62").replace(/\D/g, "");

  if (!cleanPhone) return null;

  return (
    <a
      href={`https://wa.me/${cleanPhone}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={`inline-flex items-center gap-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold transition ${
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
      } ${className}`}
    >
      <MessageCircle className="w-3.5 h-3.5" />
      <span>WhatsApp</span>
    </a>
  );
}
