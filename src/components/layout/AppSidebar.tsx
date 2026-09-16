"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Package,
  Users,
  CreditCard,
  Settings,
  FolderTree,
  LogOut,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { UsageIndicator } from "@/components/UsageIndicator";
import { UpgradeModal } from "@/components/UpgradeModal";
import { LogoutConfirmModal } from "@/components/LogoutConfirmModal";
import { useState } from "react";

interface SidebarProps {
  businessId: string;
  businessName: string;
  userName: string;
  planName: string;
  planType: string;
  itemsCurrent: number;
  itemsMax: number;
  bookingsCurrent: number;
  bookingsMax: number;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/bookings", label: "Booking", icon: ShoppingBag },
  { href: "/calendar", label: "Kalender Sewa", icon: CalendarDays },
  { href: "/items", label: "Inventaris Barang", icon: Package },
  { href: "/categories", label: "Kategori Barang", icon: FolderTree },
  { href: "/customers", label: "Pelanggan", icon: Users },
  { href: "/payments", label: "Riwayat Pembayaran", icon: CreditCard },
  { href: "/settings", label: "Pengaturan Toko", icon: Settings },
];

export function AppSidebar({
  businessId,
  businessName,
  userName,
  planName,
  planType,
  itemsCurrent,
  itemsMax,
  bookingsCurrent,
  bookingsMax,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
      toast.success("Berhasil keluar.");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Gagal keluar akun.");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-white border-r border-[#e2e8f0] p-4 shrink-0">
        {/* Workspace Brand */}
        <div className="flex items-center gap-2.5 px-2 py-3 border-b border-[#e2e8f0] mb-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0051d5] text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-sm text-[#0b1c30] truncate">{businessName}</h2>
            <p className="text-[11px] text-[#64748b] truncate">{userName}</p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? "bg-[#0051d5] text-white shadow-xs"
                    : "text-[#0b1c30] hover:bg-[#f8f9ff]"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Quota Indicator */}
        <div className="my-4">
          <UsageIndicator
            planName={planName}
            planType={planType}
            itemsCurrent={itemsCurrent}
            itemsMax={itemsMax}
            bookingsCurrent={bookingsCurrent}
            bookingsMax={bookingsMax}
            onUpgradeClick={() => setUpgradeOpen(true)}
          />
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-[#e2e8f0]">
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[#64748b] hover:text-red-600 hover:bg-red-50 text-xs font-medium transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>

      <UpgradeModal
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        businessId={businessId}
      />

      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        loading={loggingOut}
      />
    </>
  );
}
