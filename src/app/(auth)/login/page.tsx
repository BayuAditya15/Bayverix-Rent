"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { LogIn, UserPlus, Loader2, Sparkles, Mail, KeyRound, RefreshCw, ArrowLeft, CheckCircle2 } from "lucide-react";
import { EmailAlreadyRegisteredModal } from "@/components/EmailAlreadyRegisteredModal";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [step, setStep] = useState<"form" | "otp">("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [showAlreadyRegisteredModal, setShowAlreadyRegisteredModal] = useState(false);

  const authError = searchParams.get("error");

  // Timer countdown for resend OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "otp" && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const handleOAuthLogin = async () => {
    try {
      setOauthLoading(true);
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) {
        toast.error("Gagal masuk dengan Google: " + error.message);
      }
    } catch {
      toast.error("Terjadi kesalahan sistem saat mencoba autentikasi Google.");
    } finally {
      setOauthLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Mohon isi email dan kata sandi.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim() || email.split("@")[0],
            },
          },
        });

        // Check if email already registered
        const isAlreadyRegistered =
          (error && (
            error.message.toLowerCase().includes("already registered") ||
            error.message.toLowerCase().includes("already in use") ||
            (error as any).code === "user_already_exists"
          )) ||
          (!error && data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0);

        if (isAlreadyRegistered) {
          setShowAlreadyRegisteredModal(true);
          return;
        }

        if (error) {
          toast.error("Pendaftaran gagal: " + error.message);
          return;
        }

        if (data?.session) {
          toast.success("Pendaftaran berhasil!");
          router.push("/onboarding");
          router.refresh();
        } else {
          // Email confirmation is enabled in Supabase -> proceed to OTP screen
          setStep("otp");
          setResendTimer(60);
          toast.success("Kode verifikasi telah dikirim ke email Anda!");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          toast.error("Gagal masuk: Email atau kata sandi tidak sesuai.");
          return;
        }

        toast.success("Berhasil masuk!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      toast.error("Terjadi kesalahan yang tidak terduga.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length < 6) {
      toast.error("Mohon masukkan 6 digit kode OTP.");
      return;
    }

    setOtpLoading(true);

    try {
      // First attempt with signup type
      let verifyRes = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otpCode.trim(),
        type: "signup",
      });

      // If signup type failed, try email type
      if (verifyRes.error) {
        verifyRes = await supabase.auth.verifyOtp({
          email: email.trim(),
          token: otpCode.trim(),
          type: "email",
        });
      }

      if (verifyRes.error) {
        toast.error("Kode verifikasi salah atau telah kedaluwarsa.");
        return;
      }

      toast.success("Email berhasil diverifikasi! Menyiapkan toko Anda...");
      router.push("/onboarding");
      router.refresh();
    } catch {
      toast.error("Gagal memverifikasi kode OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || resendLoading) return;

    setResendLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
      });

      if (error) {
        toast.error("Gagal mengirim ulang kode: " + error.message);
        return;
      }

      toast.success("Kode verifikasi baru telah dikirim ke email Anda.");
      setResendTimer(60);
    } catch {
      toast.error("Gagal mengirim ulang kode.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <>
      {/* Modal Popup if Email is already registered */}
      <EmailAlreadyRegisteredModal
        isOpen={showAlreadyRegisteredModal}
        email={email}
        onGoToLogin={() => {
          setShowAlreadyRegisteredModal(false);
          setMode("login");
          setStep("form");
        }}
        onUseOtherEmail={() => {
          setShowAlreadyRegisteredModal(false);
          setEmail("");
          setPassword("");
          setStep("form");
        }}
      />

      <div className="w-full max-w-md bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6 sm:p-8">
        {step === "otp" ? (
          /* ── OTP Verification Screen ── */
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#eff4ff] text-[#0051d5] mb-3">
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-[#0b1c30]">Verifikasi Email</h2>
              <p className="text-xs sm:text-sm text-[#64748b] mt-1.5 leading-relaxed">
                Kami telah mengirimkan 6 digit kode verifikasi ke alamat email:
              </p>
              <p className="text-xs sm:text-sm font-semibold text-[#0b1c30] mt-0.5">
                {email}
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4" suppressHydrationWarning>
              <div>
                <label className="block text-xs font-medium text-[#0b1c30] mb-1.5 text-center">
                  Masukkan 6 Digit Kode OTP
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    autoFocus
                    suppressHydrationWarning
                    className="w-full tracking-widest text-center text-xl font-bold py-3 px-4 rounded-xl border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5] letter-spacing-2"
                  />
                  <KeyRound className="w-4 h-4 text-[#64748b] absolute left-3.5 top-4" />
                </div>
                <p className="text-[11px] text-[#64748b] text-center mt-1.5">
                  Cek kotak masuk atau folder spam email Anda.
                </p>
              </div>

              <button
                type="submit"
                disabled={otpLoading || otpCode.trim().length < 6}
                suppressHydrationWarning
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0051d5] hover:bg-[#0041ab] text-white text-sm font-semibold transition disabled:opacity-60 shadow-xs active:scale-[0.98]"
              >
                {otpLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verifikasi &amp; Lanjutkan</span>
                  </>
                )}
              </button>
            </form>

            {/* Resend & Back Actions */}
            <div className="space-y-3 pt-2 text-center text-xs text-[#64748b] border-t border-slate-100">
              <div className="flex items-center justify-center gap-1.5">
                <span>Tidak menerima kode?</span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0 || resendLoading}
                  className="font-semibold text-[#0051d5] hover:underline disabled:text-slate-400 disabled:no-underline flex items-center gap-1"
                >
                  {resendLoading && <RefreshCw className="w-3 h-3 animate-spin" />}
                  <span>
                    {resendTimer > 0 ? `Kirim ulang (${resendTimer}s)` : "Kirim Ulang Kode"}
                  </span>
                </button>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => {
                    setStep("form");
                    setOtpCode("");
                  }}
                  className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 transition"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Kembali &amp; Ganti Email</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ── Main Login / Sign Up Form ── */
          <>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#eff4ff] text-[#0051d5] mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-[#0b1c30]">Bayverix-Rent</h1>
              <p className="text-sm text-[#64748b] mt-1">
                {mode === "login"
                  ? "Masuk ke dashboard manajemen bisnis rental Anda"
                  : "Daftar akun baru untuk mulai mengelola rental"}
              </p>
            </div>

            {authError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
                Autentikasi gagal atau sesi telah berakhir. Silakan coba masuk kembali.
              </div>
            )}

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleOAuthLogin}
              disabled={oauthLoading || loading}
              suppressHydrationWarning
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-[#e2e8f0] bg-white hover:bg-slate-50 text-sm font-medium text-[#0b1c30] transition disabled:opacity-60 shadow-xs"
            >
              {oauthLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#0051d5]" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Lanjutkan dengan Google</span>
            </button>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#e2e8f0]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-[#64748b]">atau dengan email</span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4" suppressHydrationWarning>
              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-medium text-[#0b1c30] mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="cth. Budi Santoso"
                    suppressHydrationWarning
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#0b1c30] mb-1">
                  Alamat Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@domain.com"
                  suppressHydrationWarning
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0b1c30] mb-1">
                  Kata Sandi
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  suppressHydrationWarning
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5]"
                />
              </div>

              <button
                type="submit"
                disabled={loading || oauthLoading}
                suppressHydrationWarning
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0051d5] hover:bg-[#0041ab] text-white text-sm font-medium transition disabled:opacity-60 shadow-xs mt-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : mode === "login" ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Masuk Sekarang</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Daftar Akun Baru</span>
                  </>
                )}
              </button>
            </form>

            {/* Toggle Mode */}
            <div className="mt-6 text-center text-xs text-[#64748b]">
              {mode === "login" ? (
                <p>
                  Belum punya akun?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    suppressHydrationWarning
                    className="font-semibold text-[#0051d5] hover:underline"
                  >
                    Daftar sekarang
                  </button>
                </p>
              ) : (
                <p>
                  Sudah punya akun?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    suppressHydrationWarning
                    className="font-semibold text-[#0051d5] hover:underline"
                  >
                    Masuk di sini
                  </button>
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col justify-center items-center px-4 py-8 bg-[#f8f9ff]">
      <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin text-[#0051d5]" />}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
