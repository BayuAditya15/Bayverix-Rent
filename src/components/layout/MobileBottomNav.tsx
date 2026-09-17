"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  CalendarDays,
  Menu as MenuIcon,
  Package,
  FolderTree,
  Users,
  CreditCard,
  Settings,
  LogOut,
  X,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { LogoutConfirmModal } from "@/components/LogoutConfirmModal";
import { UpgradeModal } from "@/components/UpgradeModal";

interface MobileBottomNavProps {
  businessId?: string;
  businessName: string;
  userName: string;
  planName: string;
}

export function MobileBottomNav({ businessId, businessName, userName, planName }: MobileBottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
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

  // 4 Primary Core Tabs on Bottom Bar (Dashboard, Booking, Kalender, Menu)
  const primaryNav = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/bookings", label: "Booking", icon: ShoppingBag },
    { href: "/calendar", label: "Kalender", icon: CalendarDays },
  ];

  // Secondary Features in 'Menu' Bottom Sheet
  const moreNav = [
    { href: "/items", label: "Inventaris Barang", icon: Package },
    { href: "/categories", label: "Kategori Barang", icon: FolderTree },
    { href: "/customers", label: "Data Pelanggan", icon: Users },
    { href: "/payments", label: "Riwayat Pembayaran", icon: CreditCard },
    { href: "/settings", label: "Pengaturan Toko", icon: Settings },
  ];

  const isMoreActive = moreNav.some((item) => pathname.startsWith(item.href));

  return (
    <>
      {/* ── Fixed 4-Tab Bottom Navigation Bar (<1024px) ── */}
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#e2e8f0] shadow-lg pb-[env(safe-area-inset-bottom,0px)]"
      >
        <div className="grid grid-cols-4 h-16 items-center px-3 max-w-md mx-auto">
          {primaryNav.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center h-full py-1 text-center transition-colors ${
                  isActive ? "text-[#0051d5]" : "text-[#64748b] hover:text-[#0b1c30]"
                }`}
              >
                <div
                  className={`p-1.5 rounded-xl transition-transform ${
                    isActive ? "bg-[#eff4ff] scale-105 text-[#0051d5]" : ""
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[11px] mt-0.5 ${
                    isActive ? "font-bold text-[#0051d5]" : "font-medium"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* 4th Tab: Menu / Lainnya */}
          <button
            type="button"
            onClick={() => setShowMoreMenu(true)}
            className={`flex flex-col items-center justify-center h-full py-1 text-center transition-colors ${
              showMoreMenu || isMoreActive
                ? "text-[#0051d5]"
                : "text-[#64748b] hover:text-[#0b1c30]"
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition-transform ${
                showMoreMenu || isMoreActive
                  ? "bg-[#eff4ff] scale-105 text-[#0051d5]"
                  : ""
              }`}
            >
              <MenuIcon className="w-5 h-5" />
            </div>
            <span
              className={`text-[11px] mt-0.5 ${
                showMoreMenu || isMoreActive
                  ? "font-bold text-[#0051d5]"
                  : "font-medium"
              }`}
            >
              Menu
            </span>
          </button>
        </div>
      </nav>

      {/* ── Mobile Action Sheet Modal for 'Menu' ── */}
      {showMoreMenu && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setShowMoreMenu(false)}
          />

          <div className="relative bg-white rounded-t-3xl border-t border-[#e2e8f0] shadow-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            {/* Sheet Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#0051d5] text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#0b1c30]">{businessName}</h3>
                  {businessId ? (
                    <button
                      type="button"
                      onClick={() => {
                        setShowMoreMenu(false);
                        setUpgradeOpen(true);
                      }}
                      className="text-[11px] text-[#0051d5] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Paket {planName} (Lihat Harga)</span>
                    </button>
                  ) : (
                    <p className="text-[11px] text-[#64748b]">Paket {planName}</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMoreMenu(false)}
                className="p-1.5 rounded-full text-[#64748b] hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="space-y-1.5">
              {moreNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMoreMenu(false)}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-medium transition ${
                      isActive
                        ? "bg-[#0051d5] text-white shadow-xs font-semibold"
                        : "text-[#0b1c30] bg-[#f8f9ff] hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Profile & Logout */}
            <div className="pt-3 border-t border-[#e2e8f0] space-y-2">
              <p className="text-xs text-[#64748b] truncate">
                Masuk sebagai: <strong>{userName}</strong>
              </p>
              <button
                type="button"
                onClick={() => {
                  setShowMoreMenu(false);
                  setShowLogoutModal(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition active:scale-[0.99]"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar Akun</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Price List Modal */}
      {businessId && (
        <UpgradeModal
          isOpen={upgradeOpen}
          onClose={() => setUpgradeOpen(false)}
          businessId={businessId}
        />
      )}

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        loading={loggingOut}
      />
    </>
  );
}
