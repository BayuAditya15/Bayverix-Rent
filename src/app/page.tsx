'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  CalendarDays,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Package,
  Users,
  CreditCard,
  Smartphone,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Tent,
  Camera,
  Shirt,
  Wrench,
  Baby,
  Compass,
  LogIn,
  LayoutDashboard,
  Check,
  Building2,
  HelpCircle,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function FadeIn({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
    );

    const node = ref.current;
    if (node) {
      observer.observe(node);
    }

    return () => {
      if (node) {
        observer.unobserve(node);
      }
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-600 ease-out transform will-change-[opacity,transform] ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = React.useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState<boolean>(false);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col selection:bg-[#eff4ff] selection:text-[#0051d5] overflow-x-clip">
      {/* ── Sticky Public Navigation ── */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 shrink-0 group">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-[#0051d5] text-white font-bold text-sm sm:text-base shadow-xs group-hover:bg-[#0041ab] transition-colors">
              B
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm sm:text-base text-[#0b1c30] leading-none group-hover:text-[#0051d5] transition-colors">
                Bayverix-Rent
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold text-[#0051d5] mt-0.5">
                Rental Management SaaS
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links (Visible on lg+) */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
            <a href="#fitur" className="hover:text-[#0051d5] transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-[2px] after:bg-[#0051d5] after:transition-all after:duration-200">
              Fitur Utama
            </a>
            <a href="#solusi" className="hover:text-[#0051d5] transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-[2px] after:bg-[#0051d5] after:transition-all after:duration-200">
              Solusi Bisnis
            </a>
            <a href="#alur" className="hover:text-[#0051d5] transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-[2px] after:bg-[#0051d5] after:transition-all after:duration-200">
              Alur Kerja
            </a>
            <a href="#harga" className="hover:text-[#0051d5] transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-[2px] after:bg-[#0051d5] after:transition-all after:duration-200">
              Paket Harga
            </a>
            <a href="#faq" className="hover:text-[#0051d5] transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-[2px] after:bg-[#0051d5] after:transition-all after:duration-200">
              FAQ
            </a>
          </nav>

          {/* Action CTAs & Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Tablet/Desktop Buttons */}
            <div className="hidden sm:flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="text-slate-700 hover:text-[#0051d5] hover:bg-slate-100/80 text-xs sm:text-sm font-medium px-3 transition-colors">
                <Link href="/login" className="flex items-center gap-1.5">
                  <LogIn className="h-4 w-4" />
                  <span>Masuk</span>
                </Link>
              </Button>

              <Button asChild size="sm" className="bg-[#0051d5] hover:bg-[#0041ab] active:scale-[0.98] text-white text-xs sm:text-sm font-medium shadow-xs hover:shadow-md px-3.5 gap-1.5 transition-all">
                <Link href="/dashboard">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Buka Dashboard</span>
                </Link>
              </Button>
            </div>

            {/* Mobile-only CTA */}
            <Button asChild size="sm" className="sm:hidden bg-[#0051d5] hover:bg-[#0041ab] text-white text-xs font-semibold px-3 h-8 shadow-xs">
              <Link href="/dashboard">
                <span>Dashboard</span>
              </Link>
            </Button>

            {/* Mobile/Tablet Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-lg text-slate-700 hover:text-[#0051d5] hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0051d5]/30"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile/Tablet Collapsible Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200/80 bg-white/98 backdrop-blur-md px-4 py-4 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-1 text-sm font-medium text-slate-700">
              <a
                href="#fitur"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg hover:bg-[#f8f9ff] hover:text-[#0051d5] transition-colors"
              >
                Fitur Utama
              </a>
              <a
                href="#solusi"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg hover:bg-[#f8f9ff] hover:text-[#0051d5] transition-colors"
              >
                Solusi Bisnis
              </a>
              <a
                href="#alur"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg hover:bg-[#f8f9ff] hover:text-[#0051d5] transition-colors"
              >
                Alur Kerja
              </a>
              <a
                href="#harga"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg hover:bg-[#f8f9ff] hover:text-[#0051d5] transition-colors"
              >
                Paket Harga
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg hover:bg-[#f8f9ff] hover:text-[#0051d5] transition-colors"
              >
                FAQ
              </a>
            </nav>

            {/* Mobile Drawer Action CTAs */}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Button asChild variant="outline" className="w-full justify-center h-10 text-sm font-medium border-slate-200 bg-white hover:bg-slate-50 text-slate-700">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  <span>Masuk ke Akun Toko</span>
                </Link>
              </Button>
              <Button asChild className="w-full justify-center h-10 text-sm font-semibold bg-[#0051d5] hover:bg-[#0041ab] text-white shadow-xs">
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Buka Dashboard Demo</span>
                </Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero Section ── */}
      <section className="relative pt-10 pb-14 sm:pt-16 sm:pb-20 md:pt-20 md:pb-24 overflow-hidden border-b border-slate-200/80 bg-white">
        {/* Next.js Optimized Background Image Layer (High Visibility & Crisp Detail) */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <Image
            src="/hero-bg.jpg"
            alt="Pencatatan & Inventaris Rental Peralatan Bayverix-Rent"
            fill
            priority
            quality={95}
            className="object-cover object-center opacity-90 select-none"
          />
          {/* Subtle Contrast Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/30 to-[#f8f9ff]/95" />
        </div>

        {/* Soft Ambient Glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] sm:w-[800px] h-[350px] bg-blue-500/20 blur-[100px] pointer-events-none rounded-full z-0" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 sm:space-y-8">
          {/* Headline */}
          <FadeIn className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0b1c30] leading-[1.2] sm:leading-[1.15]">
              Kelola Booking, Stok Unit, &amp; Jadwal Sewa{' '}
              <span className="text-[#0051d5]">
                Tanpa Pernah Bentrok.
              </span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
              Tinggalkan pencatatan manual di kertas &amp; chat WhatsApp. Pantau ketersediaan otomatis,
              serah-terima unit, uang muka (DP), dan rekap riwayat pelanggan dalam satu sistem cerdas.
            </p>
          </FadeIn>

          {/* Primary CTA Buttons */}
          <FadeIn delay={150} className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1 sm:pt-2 w-full max-w-xs sm:max-w-none mx-auto">
            <Button asChild size="lg" className="w-full sm:w-auto px-6 sm:px-8 h-11 sm:h-12 bg-[#0051d5] hover:bg-[#0041ab] active:scale-[0.98] text-white text-sm sm:text-base font-semibold shadow-sm hover:shadow-md gap-2 transition-all">
              <Link href="/dashboard">
                <span>Coba Demo Gratis Sekarang</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto px-5 sm:px-6 h-11 sm:h-12 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 active:scale-[0.98] border-slate-300 text-sm sm:text-base font-medium transition-all">
              <Link href="/login">
                <span>Masuk ke Akun Toko</span>
              </Link>
            </Button>
          </FadeIn>

          {/* Trust Highlights */}
          <FadeIn delay={180} className="pt-2 sm:pt-4 grid grid-cols-2 sm:flex sm:flex-wrap lg:flex-nowrap items-center justify-center gap-x-4 sm:gap-x-6 lg:gap-x-8 gap-y-2 sm:gap-y-2.5 text-xs sm:text-sm text-slate-600 font-medium max-w-sm sm:max-w-none mx-auto">
            <div className="flex items-center gap-1.5 text-left sm:text-center group cursor-default">
              <CheckCircle2 className="h-4 w-4 text-[#0051d5] shrink-0 group-hover:scale-110 transition-transform" />
              <span className="group-hover:text-slate-900 transition-colors">100% Anti Double-Booking</span>
            </div>
            <div className="flex items-center gap-1.5 text-left sm:text-center group cursor-default">
              <CheckCircle2 className="h-4 w-4 text-[#0051d5] shrink-0 group-hover:scale-110 transition-transform" />
              <span className="group-hover:text-slate-900 transition-colors">Akses HP, Tablet &amp; Laptop</span>
            </div>
            <div className="flex items-center gap-1.5 text-left sm:text-center group cursor-default">
              <CheckCircle2 className="h-4 w-4 text-[#0051d5] shrink-0 group-hover:scale-110 transition-transform" />
              <span className="group-hover:text-slate-900 transition-colors">WhatsApp Quick Action</span>
            </div>
            <div className="flex items-center gap-1.5 text-left sm:text-center group cursor-default">
              <CheckCircle2 className="h-4 w-4 text-[#0051d5] shrink-0 group-hover:scale-110 transition-transform" />
              <span className="group-hover:text-slate-900 transition-colors">Multi-Tenant Terisolasi</span>
            </div>
          </FadeIn>

          {/* ── Visual Product Preview Card ── */}
          <FadeIn delay={220} className="pt-4 sm:pt-8 max-w-5xl mx-auto">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-3 sm:p-5 shadow-xl hover:shadow-2xl transition-all duration-300 space-y-3 sm:space-y-4 text-left">
              {/* Fake Window Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 sm:pb-3 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex gap-1.5 shrink-0">
                    <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-400"></span>
                    <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-400"></span>
                    <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-400"></span>
                  </div>
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-500 ml-1 sm:ml-2 truncate">
                    Bayverix-Rent Dashboard — Pusat Operasional Rental
                  </span>
                </div>
                <Badge variant="confirmed" className="text-[9px] sm:text-[10px] shrink-0">
                  LIVE SYSTEM
                </Badge>
              </div>

              {/* Snapshot Metric Preview Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                <div className="p-2.5 sm:p-3 rounded-xl bg-[#f8f9ff] border border-slate-100 hover:border-slate-200 hover:bg-blue-50/20 transition-all">
                  <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Booking Aktif</span>
                  <p className="text-base sm:text-xl lg:text-2xl font-bold text-[#0b1c30]">12 Transaksi</p>
                  <span className="text-[10px] sm:text-[11px] text-[#0051d5] font-semibold">4 Perlu Disiapkan</span>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-[#f8f9ff] border border-slate-100 hover:border-slate-200 hover:bg-emerald-50/20 transition-all">
                  <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Unit Di Lapangan</span>
                  <p className="text-base sm:text-xl lg:text-2xl font-bold text-[#0b1c30]">28 Unit</p>
                  <span className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold">85% Utilisasi</span>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-[#f8f9ff] border border-slate-100 hover:border-slate-200 hover:bg-amber-50/20 transition-all">
                  <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Pengembalian Hari Ini</span>
                  <p className="text-base sm:text-xl lg:text-2xl font-bold text-[#0b1c30]">3 Jadwal</p>
                  <span className="text-[10px] sm:text-[11px] text-amber-600 font-semibold">Tempo 17:00 WIB</span>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-[#f8f9ff] border border-slate-100 hover:border-slate-200 hover:bg-blue-50/20 transition-all">
                  <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Total Omset Bulan Ini</span>
                  <p className="text-base sm:text-xl lg:text-2xl font-bold text-[#0b1c30] truncate">Rp14.850.000</p>
                  <span className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold">+18% vs Lalu</span>
                </div>
              </div>

              {/* Sample Dispatch Table preview */}
              <div className="rounded-xl border border-slate-100 overflow-hidden bg-slate-50/50">
                <div className="px-3 py-2 bg-slate-100/70 flex justify-between items-center text-[11px] sm:text-xs font-semibold text-slate-600">
                  <span>Antrean Serah Terima Unit Hari Ini</span>
                  <span className="text-[#0051d5]">Otomatis Terverifikasi</span>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="p-2.5 sm:p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white hover:bg-slate-50/80 transition-colors">
                    <div className="space-y-0.5">
                      <p className="font-bold text-[#0051d5]">RNT-2026-0012 &bull; Budi Santoso</p>
                      <p className="text-slate-500 text-[11px] sm:text-xs">2x Tenda Dome 4P, 2x Kursi Lipat &bull; Sewa 2 Hari</p>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-[#0051d5] font-semibold text-[10px]">
                        DIKONFIRMASI
                      </span>
                      <Button asChild size="sm" className="h-7 text-xs bg-[#0051d5] hover:bg-[#0041ab] active:scale-95 text-white transition-all">
                        <Link href="/dashboard">Cek Unit</Link>
                      </Button>
                    </div>
                  </div>
                  <div className="p-2.5 sm:p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white hover:bg-slate-50/80 transition-colors">
                    <div className="space-y-0.5">
                      <p className="font-bold text-[#0051d5]">RNT-2026-0014 &bull; Siti Rahma</p>
                      <p className="text-slate-500 text-[11px] sm:text-xs">1x Kompor Windproof, 1x Cookset &bull; Sewa 3 Hari</p>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                        SEDANG DISEWA
                      </span>
                      <Button asChild size="sm" variant="outline" className="h-7 text-xs border-slate-200 hover:bg-slate-100 active:scale-95 transition-all">
                        <Link href="/dashboard">Detail</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Section: Solusi Berbagai Jenis Bisnis Rental ── */}
      <section id="solusi" className="py-12 sm:py-16 md:py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
          <FadeIn className="text-center max-w-3xl mx-auto space-y-2 sm:space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0051d5]">
              Solusi Teruji untuk Berbagai Industri
            </h2>
            <p className="text-xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#0b1c30]">
              Cocok untuk Segala Jenis Bisnis Sewa &amp; Rental
            </p>
            <p className="text-xs sm:text-sm md:text-base text-slate-600">
              Bayverix-Rent dirancang fleksibel untuk mendukung operasional rental dengan inventaris harian, mingguan, maupun satuan khusus.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 md:gap-6">
            {/* 1. Rental Outdoor */}
            <FadeIn delay={60}>
              <Card className="group p-4 sm:p-5 bg-[#f8f9ff] border-slate-200/80 shadow-xs hover:border-[#0051d5]/50 hover:bg-white hover:shadow-md hover:-translate-y-1 transition-all duration-200 space-y-2.5 sm:space-y-3 h-full">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0051d5] flex items-center justify-center group-hover:bg-[#0051d5] group-hover:text-white group-hover:scale-105 transition-all duration-200">
                  <Tent className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-[#0b1c30] group-hover:text-[#0051d5] transition-colors">Rental Outdoor &amp; Camping Gear</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Kelola sewa tenda, matras, sleeping bag, kompor, dan carrier. Cek status kebersihan dan kelengkapan pasca pengembalian.
                </p>
              </Card>
            </FadeIn>

            {/* 2. Rental Kamera */}
            <FadeIn delay={120}>
              <Card className="group p-4 sm:p-5 bg-[#f8f9ff] border-slate-200/80 shadow-xs hover:border-[#0051d5]/50 hover:bg-white hover:shadow-md hover:-translate-y-1 transition-all duration-200 space-y-2.5 sm:space-y-3 h-full">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0051d5] flex items-center justify-center group-hover:bg-[#0051d5] group-hover:text-white group-hover:scale-105 transition-all duration-200">
                  <Camera className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-[#0b1c30] group-hover:text-[#0051d5] transition-colors">Rental Kamera &amp; Multimedia</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Catat nomor seri body kamera, lensa, gimbal stabilizer, dan lighting. Monitoring deposit jaminan dan kelengkapan memori.
                </p>
              </Card>
            </FadeIn>

            {/* 3. Rental Kostum & Gaun */}
            <FadeIn delay={180}>
              <Card className="group p-4 sm:p-5 bg-[#f8f9ff] border-slate-200/80 shadow-xs hover:border-[#0051d5]/50 hover:bg-white hover:shadow-md hover:-translate-y-1 transition-all duration-200 space-y-2.5 sm:space-y-3 h-full">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0051d5] flex items-center justify-center group-hover:bg-[#0051d5] group-hover:text-white group-hover:scale-105 transition-all duration-200">
                  <Shirt className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-[#0b1c30] group-hover:text-[#0051d5] transition-colors">Rental Gaun, Jas &amp; Kostum</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Atur jadwal sewa untuk wisuda, pernikahan, dan event. Pantau proses fitting, laundry, serta denda keterlambatan kembali.
                </p>
              </Card>
            </FadeIn>

            {/* 4. Rental Alat Proyek */}
            <FadeIn delay={240}>
              <Card className="group p-4 sm:p-5 bg-[#f8f9ff] border-slate-200/80 shadow-xs hover:border-[#0051d5]/50 hover:bg-white hover:shadow-md hover:-translate-y-1 transition-all duration-200 space-y-2.5 sm:space-y-3 h-full">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0051d5] flex items-center justify-center group-hover:bg-[#0051d5] group-hover:text-white group-hover:scale-105 transition-all duration-200">
                  <Wrench className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-[#0b1c30] group-hover:text-[#0051d5] transition-colors">Rental Perkakas &amp; Alat Proyek</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Sewa genset, mesin las, bor tembok, hingga scaffolding dengan durasi harian atau mingguan. Log maintenance alat berkala.
                </p>
              </Card>
            </FadeIn>

            {/* 5. Rental Perlengkapan Bayi */}
            <FadeIn delay={300}>
              <Card className="group p-4 sm:p-5 bg-[#f8f9ff] border-slate-200/80 shadow-xs hover:border-[#0051d5]/50 hover:bg-white hover:shadow-md hover:-translate-y-1 transition-all duration-200 space-y-2.5 sm:space-y-3 h-full">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0051d5] flex items-center justify-center group-hover:bg-[#0051d5] group-hover:text-white group-hover:scale-105 transition-all duration-200">
                  <Baby className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-[#0b1c30] group-hover:text-[#0051d5] transition-colors">Rental Stroller &amp; Baby Gear</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Manajemen persewaan stroller liburan, car seat, bouncer, dan mainan edukatif dengan sistem pencatatan sanitasi teratur.
                </p>
              </Card>
            </FadeIn>

            {/* 6. Rental Alat Hiking & Navigasi */}
            <FadeIn delay={360}>
              <Card className="group p-4 sm:p-5 bg-[#f8f9ff] border-slate-200/80 shadow-xs hover:border-[#0051d5]/50 hover:bg-white hover:shadow-md hover:-translate-y-1 transition-all duration-200 space-y-2.5 sm:space-y-3 h-full">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0051d5] flex items-center justify-center group-hover:bg-[#0051d5] group-hover:text-white group-hover:scale-105 transition-all duration-200">
                  <Compass className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-[#0b1c30] group-hover:text-[#0051d5] transition-colors">Rental Alat Hiking &amp; Navigasi</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Kelola sewa trekking pole, headlamp, GPS navigasi, carrier, dan perlengkapan survival outdoor dengan konfirmasi serah terima kilat.
                </p>
              </Card>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Section: Fitur-Fitur Utama ── */}
      <section id="fitur" className="py-12 sm:py-16 md:py-20 border-b border-slate-200/80 bg-[#f8f9ff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
          <FadeIn className="text-center max-w-3xl mx-auto space-y-2 sm:space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0051d5]">
              Fitur Lengkap &amp; Praktis
            </h2>
            <p className="text-xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#0b1c30]">
              Didesain Khusus Menjawab Masalah Nyata Bisnis Rental
            </p>
            <p className="text-xs sm:text-sm md:text-base text-slate-600">
              Setiap fitur dibuat ringkas, cepat diakses, dan langsung membantu alur kerja staf dari hari pertama.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Feature 1 */}
            <FadeIn delay={60}>
              <div className="group bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#0051d5]/50 hover:shadow-md hover:-translate-y-1 transition-all duration-200 space-y-2.5 sm:space-y-3 h-full">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0051d5] flex items-center justify-center group-hover:bg-[#0051d5] group-hover:text-white group-hover:scale-105 transition-all duration-200">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-[#0b1c30] group-hover:text-[#0051d5] transition-colors">Availability Engine (Cegah Bentrok)</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Sistem menghitung stok unit yang tersedia secara real-time pada tanggal sewa yang dipilih. Tidak akan ada lagi janji ganda kepada pelanggan.
                </p>
              </div>
            </FadeIn>

            {/* Feature 2 */}
            <FadeIn delay={120}>
              <div className="group bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#0051d5]/50 hover:shadow-md hover:-translate-y-1 transition-all duration-200 space-y-2.5 sm:space-y-3 h-full">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0051d5] flex items-center justify-center group-hover:bg-[#0051d5] group-hover:text-white group-hover:scale-105 transition-all duration-200">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-[#0b1c30] group-hover:text-[#0051d5] transition-colors">Jadwal Timeline &amp; Kalender Dispatch</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Pantau timeline pengambilan unit (Pickup) dan pengembalian (Return) dalam tampilan harian, mingguan, atau bulanan yang mudah discan.
                </p>
              </div>
            </FadeIn>

            {/* Feature 3 */}
            <FadeIn delay={180}>
              <div className="group bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#0051d5]/50 hover:shadow-md hover:-translate-y-1 transition-all duration-200 space-y-2.5 sm:space-y-3 h-full">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0051d5] flex items-center justify-center group-hover:bg-[#0051d5] group-hover:text-white group-hover:scale-105 transition-all duration-200">
                  <Package className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-[#0b1c30] group-hover:text-[#0051d5] transition-colors">Katalog Unit &amp; Kategori Rapi</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Kelola tarif harian, total unit fisik, dan kelompok kategori peralatan. Status unit langsung terlihat (siap sewa / sedang disewa).
                </p>
              </div>
            </FadeIn>

            {/* Feature 4 */}
            <FadeIn delay={240}>
              <div className="group bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#0051d5]/50 hover:shadow-md hover:-translate-y-1 transition-all duration-200 space-y-2.5 sm:space-y-3 h-full">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0051d5] flex items-center justify-center group-hover:bg-[#0051d5] group-hover:text-white group-hover:scale-105 transition-all duration-200">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-[#0b1c30] group-hover:text-[#0051d5] transition-colors">Database Pelanggan &amp; WhatsApp</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Simpan kontak WhatsApp, identitas jaminan (KTP/SIM), riwayat booking sebelumnya, dan catatan preferensi pelanggan.
                </p>
              </div>
            </FadeIn>

            {/* Feature 5 */}
            <FadeIn delay={300}>
              <div className="group bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#0051d5]/50 hover:shadow-md hover:-translate-y-1 transition-all duration-200 space-y-2.5 sm:space-y-3 h-full">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0051d5] flex items-center justify-center group-hover:bg-[#0051d5] group-hover:text-white group-hover:scale-105 transition-all duration-200">
                  <CreditCard className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-[#0b1c30] group-hover:text-[#0051d5] transition-colors">Catatan Pembayaran &amp; Uang Muka (DP)</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Hitung otomatis total sewa, pembayaran uang muka, sisa tagihan yang harus dilunasi saat serah terima, dan bukti pembayaran.
                </p>
              </div>
            </FadeIn>

            {/* Feature 6 */}
            <FadeIn delay={360}>
              <div className="group bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#0051d5]/50 hover:shadow-md hover:-translate-y-1 transition-all duration-200 space-y-2.5 sm:space-y-3 h-full">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0051d5] flex items-center justify-center group-hover:bg-[#0051d5] group-hover:text-white group-hover:scale-105 transition-all duration-200">
                  <Smartphone className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-[#0b1c30] group-hover:text-[#0051d5] transition-colors">Mobile-First Responsif</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Bekerja dengan nyaman dari layar smartphone di gudang, iPad/tablet di meja kasir, hingga monitor komputer admin di kantor.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Section: Alur Kerja Sederhana ── */}
      <section id="alur" className="py-12 sm:py-16 md:py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
          <FadeIn className="text-center max-w-3xl mx-auto space-y-2 sm:space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0051d5]">
              Alur Kerja Cepat &amp; Praktis
            </h2>
            <p className="text-xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#0b1c30]">
              Mulai dalam 3 Langkah Sederhana
            </p>
            <p className="text-xs sm:text-sm md:text-base text-slate-600">
              Tidak perlu instalasi aplikasi rumit. Buka browser dan langsung jalankan operasional toko Anda.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 relative">
            {/* Step 1 */}
            <FadeIn delay={80}>
              <div className="group p-5 sm:p-6 rounded-2xl bg-[#f8f9ff] border border-slate-200/80 hover:bg-white hover:border-slate-300 hover:shadow-md hover:-translate-y-1 transition-all duration-200 space-y-2.5 sm:space-y-3 text-center sm:text-left h-full">
                <div className="w-9 h-9 rounded-full bg-[#0051d5] text-white font-bold text-sm flex items-center justify-center mx-auto sm:mx-0 group-hover:scale-110 group-hover:bg-[#0041ab] transition-all">
                  1
                </div>
                <h3 className="font-bold text-sm sm:text-base text-[#0b1c30] group-hover:text-[#0051d5] transition-colors">Tambahkan Katalog &amp; Stok Unit</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Masukkan daftar barang rental, tentukan tarif sewa per hari, dan jumlah unit fisik yang tersedia di toko Anda.
                </p>
              </div>
            </FadeIn>

            {/* Step 2 */}
            <FadeIn delay={160}>
              <div className="group p-5 sm:p-6 rounded-2xl bg-[#f8f9ff] border border-slate-200/80 hover:bg-white hover:border-slate-300 hover:shadow-md hover:-translate-y-1 transition-all duration-200 space-y-2.5 sm:space-y-3 text-center sm:text-left h-full">
                <div className="w-9 h-9 rounded-full bg-[#0051d5] text-white font-bold text-sm flex items-center justify-center mx-auto sm:mx-0 group-hover:scale-110 group-hover:bg-[#0041ab] transition-all">
                  2
                </div>
                <h3 className="font-bold text-sm sm:text-base text-[#0b1c30] group-hover:text-[#0051d5] transition-colors">Catat Booking &amp; Cek Jadwal</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Pilih pelanggan, tentukan tanggal sewa, dan sistem langsung memvalidasi ketersediaan unit tanpa takut bentrok.
                </p>
              </div>
            </FadeIn>

            {/* Step 3 */}
            <FadeIn delay={240}>
              <div className="group p-5 sm:p-6 rounded-2xl bg-[#f8f9ff] border border-slate-200/80 hover:bg-white hover:border-slate-300 hover:shadow-md hover:-translate-y-1 transition-all duration-200 space-y-2.5 sm:space-y-3 text-center sm:text-left h-full">
                <div className="w-9 h-9 rounded-full bg-[#0051d5] text-white font-bold text-sm flex items-center justify-center mx-auto sm:mx-0 group-hover:scale-110 group-hover:bg-[#0041ab] transition-all">
                  3
                </div>
                <h3 className="font-bold text-sm sm:text-base text-[#0b1c30] group-hover:text-[#0051d5] transition-colors">Serah Terima &amp; Pelunasan</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Tandai unit saat diambil pelanggan, terima pelunasan sisa tagihan, dan konfirmasi selesai saat unit kembali ke gudang.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Section: Paket Harga / SaaS Pricing ── */}
      <section id="harga" className="py-12 sm:py-16 md:py-20 border-b border-slate-200/80 bg-[#f8f9ff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
          <FadeIn className="text-center max-w-3xl mx-auto space-y-2 sm:space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0051d5]">
              Investasi Terjangkau
            </h2>
            <p className="text-xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#0b1c30]">
              Pilihan Paket Fleksibel Sesuai Skala Bisnis
            </p>
            <p className="text-xs sm:text-sm md:text-base text-slate-600">
              Mulai gratis untuk uji coba, upgrade kapan saja saat unit peralatan rental Anda semakin berkembang.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
            {/* Starter Plan */}
            <FadeIn delay={80}>
              <Card className="p-5 sm:p-6 bg-white border-slate-200/80 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between space-y-6 h-full">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-[#0b1c30]">Starter / Free</h3>
                    <p className="text-xs text-slate-500 mt-1">Untuk mencoba fitur &amp; rental skala pemula</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30]">Rp0</span>
                    <span className="text-xs text-slate-500 font-medium">/ selamanya</span>
                  </div>
                  <div className="space-y-2.5 pt-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#0051d5] shrink-0" />
                      <span>Maksimal <strong>15 Unit Peralatan</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#0051d5] shrink-0" />
                      <span>Hingga <strong>20 Booking / bulan</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#0051d5] shrink-0" />
                      <span>Hingga 50 Kontak Pelanggan</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#0051d5] shrink-0" />
                      <span>Fitur Kalender &amp; Anti-Bentrok</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#0051d5] shrink-0" />
                      <span>1 Akun Pengelola Toko</span>
                    </div>
                  </div>
                </div>
                <Button asChild variant="outline" className="w-full h-10 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] text-slate-800 text-xs sm:text-sm transition-all">
                  <Link href="/dashboard">Mulai Gratis</Link>
                </Button>
              </Card>
            </FadeIn>

            {/* Pro Bulanan Plan (Popular) */}
            <FadeIn delay={160}>
              <Card className="p-5 sm:p-6 bg-white border-2 border-[#0051d5] shadow-md hover:shadow-xl md:-translate-y-1 hover:md:-translate-y-2 transition-all duration-200 flex flex-col justify-between space-y-6 relative h-full">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#0051d5] text-white text-[10px] sm:text-[11px] font-bold tracking-wider uppercase shadow-xs">
                  Paling Populer
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-[#0b1c30]">Pro Bulanan</h3>
                    <p className="text-xs text-slate-500 mt-1">Untuk toko rental aktif yang butuh operasional cepat</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#0051d5]">Rp99.000</span>
                    <span className="text-xs text-slate-500 font-medium">/ bulan</span>
                  </div>
                  <div className="space-y-2.5 pt-2 text-xs text-slate-700 font-medium">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#0051d5] shrink-0" />
                      <span>Hingga <strong>500 Unit Barang</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#0051d5] shrink-0" />
                      <span><strong>Unlimited Booking</strong> per bulan</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#0051d5] shrink-0" />
                      <span><strong>Unlimited Pelanggan</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#0051d5] shrink-0" />
                      <span>Integrasi Direct WhatsApp</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#0051d5] shrink-0" />
                      <span>Export Laporan Excel &amp; Struk</span>
                    </div>
                  </div>
                </div>
                <Button asChild className="w-full h-10 bg-[#0051d5] hover:bg-[#0041ab] active:scale-[0.98] text-white font-semibold shadow-xs hover:shadow-md text-xs sm:text-sm transition-all">
                  <Link href="/dashboard">Pilih Pro Bulanan</Link>
                </Button>
              </Card>
            </FadeIn>

            {/* Lifetime Plan */}
            <FadeIn delay={240}>
              <Card className="p-5 sm:p-6 bg-white border-slate-200/80 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between space-y-6 h-full">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-base sm:text-lg text-[#0b1c30]">Lifetime</h3>
                      <p className="text-xs text-slate-500 mt-1">Investasi sekali bayar untuk kepemilikan tanpa batas</p>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30]">Rp1.499.000</span>
                    <span className="text-xs text-slate-500 font-medium">/ selamanya</span>
                  </div>
                  <div className="space-y-2.5 pt-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#0051d5] shrink-0" />
                      <span><strong>Unlimited Barang &amp; Kategori</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#0051d5] shrink-0" />
                      <span><strong>Unlimited Booking &amp; Pelanggan</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#0051d5] shrink-0" />
                      <span>Hingga <strong>10 Akun Staf Toko</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#0051d5] shrink-0" />
                      <span>Export Laporan &amp; WhatsApp Direct</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#0051d5] shrink-0" />
                      <span>Akses Fitur Baru &amp; Update Selamanya</span>
                    </div>
                  </div>
                </div>
                <Button asChild variant="outline" className="w-full h-10 border-slate-900 bg-[#0b1c30] hover:bg-[#1e293b] text-white active:scale-[0.98] text-xs sm:text-sm transition-all">
                  <Link href="/dashboard">Pilih Paket Lifetime</Link>
                </Button>
              </Card>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Section: FAQ Accordion ── */}
      <section id="faq" className="py-12 sm:py-16 md:py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
          <FadeIn className="text-center space-y-2 sm:space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0051d5]">
              Pertanyaan Umum
            </h2>
            <p className="text-xl sm:text-3xl font-bold tracking-tight text-[#0b1c30]">
              Frequently Asked Questions (FAQ)
            </p>
          </FadeIn>

          <FadeIn delay={120} className="space-y-3">
            {[
              {
                q: 'Bagaimana Bayverix-Rent mencegah terjadinya booking bentrok (double booking)?',
                a: 'Bayverix-Rent memiliki availability engine bawaan yang otomatis menghitung overlap tanggal sewa. Ketika ada pelanggan ingin menyewa pada tanggal tertentu, sistem mengecek sisa stok unit yang belum terikat booking aktif. Jika stok habis, tombol booking akan menolak secara otomatis.',
              },
              {
                q: 'Apakah Bayverix-Rent bisa digunakan di smartphone / HP kasir tanpa install aplikasi?',
                a: 'Ya! Bayverix-Rent dibangun dengan arsitektur web modern yang responsif dan mobile-first. Anda cukup membuka browser (Google Chrome, Safari) di HP, tablet, maupun laptop dan tampilan akan menyesuaikan secara sempurna.',
              },
              {
                q: 'Apakah data bisnis dan pelanggan saya aman dan tidak tercampur toko lain?',
                a: 'Sangat aman. Bayverix-Rent menggunakan arsitektur database multi-tenant dengan PostgreSQL Row Level Security (RLS). Setiap data unit, transaksi, dan riwayat pelanggan terisolasi ketat berdasarkan ID bisnis Anda.',
              },
              {
                q: 'Bisakah mencatat pembayaran bertahap seperti Uang Muka (DP) dan Pelunasan?',
                a: 'Tentu. Bayverix-Rent menyediakan pencatatan pembayaran fleksibel (DP, Pelunasan, atau Pembayaran Penuh di Awal). Dashboard juga langsung memfilter mana saja transaksi yang masih memiliki sisa tagihan.',
              },
              {
                q: 'Apakah ada masa percobaan gratis sebelum berlangganan?',
                a: 'Ya, Anda dapat langsung mencoba seluruh alur operasional di paket Starter gratis tanpa perlu kartu kredit.',
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200/80 bg-[#f8f9ff] hover:border-[#0051d5]/40 hover:shadow-xs transition-all duration-200 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-3.5 sm:p-4 text-left flex items-center justify-between gap-3 font-semibold text-xs sm:text-sm md:text-base text-[#0b1c30] hover:text-[#0051d5] transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-[#0051d5] shrink-0 transition-transform" />
                  ) : (
                    <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 shrink-0 transition-transform" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-3.5 pb-3.5 sm:px-4 sm:pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/50 pt-3 bg-white animate-in fade-in-50 duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </FadeIn>
        </div>
      </section>

      {/* ── Bottom Call To Action Banner ── */}
      <section className="py-12 sm:py-16 md:py-20 bg-[#0b1c30] text-white">
        <FadeIn className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5 sm:space-y-6">
          <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Siap Merapikan Operasional &amp; Meningkatkan Omset Rental Anda?
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Bergabunglah dengan pengusaha rental lainnya yang telah meninggalkan kerumitan pencatatan manual.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-xs sm:max-w-none mx-auto">
            <Button asChild size="lg" className="w-full sm:w-auto px-6 sm:px-8 h-11 sm:h-12 bg-[#0051d5] hover:bg-[#0041ab] active:scale-[0.98] text-white text-sm sm:text-base font-semibold shadow-sm hover:shadow-md transition-all">
              <Link href="/dashboard">
                Buka Dashboard Sekarang &rarr;
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto px-5 sm:px-6 h-11 sm:h-12 bg-transparent text-white border-slate-700 hover:bg-white/10 active:scale-[0.98] text-sm sm:text-base font-medium transition-all">
              <Link href="/login">
                Masuk ke Akun Toko
              </Link>
            </Button>
          </div>
        </FadeIn>
      </section>

      {/* ── Public Footer ── */}
      <footer className="border-t border-slate-200/80 bg-white py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <div className="flex flex-wrap items-center justify-center gap-2 text-center">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0051d5] text-white font-bold text-xs shadow-2xs">
              B
            </div>
            <span className="font-bold text-sm text-[#0b1c30]">Bayverix-Rent</span>
            <span className="text-slate-400">&bull; &copy; 2026 Bayverix-Rent. Hak Cipta Dilindungi.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
