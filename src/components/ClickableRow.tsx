"use client";

import { useRouter } from "next/navigation";
import React from "react";

interface ClickableRowProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function ClickableRow({
  href,
  children,
  className = "",
}: ClickableRowProps) {
  const router = useRouter();

  return (
    <tr
      onClick={() => router.push(href)}
      className={`hover:bg-slate-50/80 transition cursor-pointer ${className}`}
    >
      {children}
    </tr>
  );
}

export function ClickableCard({
  href,
  children,
  className = "",
}: ClickableRowProps) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(href)}
      className={`cursor-pointer hover:border-[#0051d5] hover:shadow-sm transition ${className}`}
    >
      {children}
    </div>
  );
}

// Backward-compatible aliases for bookings
export function ClickableBookingRow({
  bookingId,
  children,
  className = "",
}: {
  bookingId: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <ClickableRow href={`/bookings/${bookingId}`} className={className}>
      {children}
    </ClickableRow>
  );
}

export function ClickableBookingCard({
  bookingId,
  children,
  className = "",
}: {
  bookingId: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <ClickableCard href={`/bookings/${bookingId}`} className={className}>
      {children}
    </ClickableCard>
  );
}
