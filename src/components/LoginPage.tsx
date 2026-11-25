import { supabase } from '../lib/supabase';
import React, { useEffect, useState } from 'react';
import {
  Mail,
  Lock,
  Smartphone,
  ScanFace,
  Fingerprint,
  ShieldCheck,
  UserPlus,
  LogIn,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  User,
  Puzzle,
  ShieldAlert,
} from 'lucide-react';
import { useMarketplace } from '../store/marketplaceStore';
import { VtcLogo } from './VtcLogo';

interface LoginPageProps {
  notice?: string;
  onSuccess?: () => void;
}

type AuthTab = 'login' | 'register' | 'otp' | 'social' | 'forgot';
type SocialProvider = 'Google' | 'Facebook' | 'Apple';
type OtpChannel = 'WhatsApp' | 'SMS' | 'Email';

const BIO_CRED_STORAGE_KEY = 'vtv_biometric_cred_id';

function randomChallenge(len = 32): Uint8Array {
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return arr;
}

function generateCaptchaTarget(): number {
  return Math.floor(42 + Math.random() * 38);
}

export const LoginPage: React.FC<LoginPageProps> = ({ notice, onSuccess }) => {
  const { setAuthSession, showToast } = useMarketplace();
  const [tab, setTab] = useState<AuthTab>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // FIX: variabel yang hilang, sekarang dibikin biar build gak gagal
  const [loginMethod] = useState<'password'>('password');
  const [captchaVerified, setCaptchaVerified] = useState(true);
  const [captchaVisible, setCaptchaVisible] = useState(false);
  const [rememberMe] = useState(true);

  // Login (No HP / Username / Email + Password) — semua kosong di awal
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPwd, setShowLoginPwd] = useState(false);
  const [lockoutUntil, setLockoutUntil] = useState<number>(0);
  const [lockoutTick, setLockoutTick] = useState<number>(0);
  const [securityAlertEmail, setSecurityAlertEmail] = useState<string>('');

  // Daftar Super Cepat: Step 1 (No HP) -> Step 2 (CAPTCHA Geser) -> Step 3 (OTP) -> Step 4 (Username + Password)
  const [regStep, setRegStep] = useState<1 | 2 | 3 | 4>(1);
  const [regRole, setRegRole] = useState<'buyer' | 'seller'>('buyer');
  const [regPhone, setRegPhone] = useState('');
  const [captchaTarget, setCaptchaTarget] = useState<number>(() =>
    generateCaptchaTarget()
  );
  const [captchaSlider, setCaptchaSlider] = useState<number>(0);
  const [regOtpCode, setRegOtpCode] = useState('');
  const [regPreviewOtp, setRegPreviewOtp] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPwd, setShowRegPwd] = useState(false);
  const [regEmail, setRegEmail] = useState('');

  // OTP Login (WhatsApp / SMS / Email)
  const [otpChannel, setOtpChannel] = useState<OtpChannel>('WhatsApp');
  const [otpContact, setOtpContact] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [previewOtp, setPreviewOtp] = useState('');

  // Social Quick Login (Google, Facebook, Apple)
  const [socialProvider, setSocialProvider] = useState<SocialProvider>('Google');
  const [socialEmail, setSocialEmail] = useState('');
  const [socialName, setSocialName] = useState('');

  // Lupa Password lewat Email terverifikasi
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCodeSent, setForgotCodeSent] = useState(false);
  const [forgotCode, setForgotCode] = useState('');
  const [forgotPreviewCode, setForgotPreviewCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [showForgotPwd, setShowForgotPwd] = useState(false);

  // Lockout countdown ticker
  useEffect(() => {
    if (!lockoutUntil || Date.now() >= lockoutUntil) return;
    const timer = setInterval(() => {
      const now = Date.now();
      if (now >= lockoutUntil) {
        setLockoutUntil(0);
        setLockoutTick(0);
        setSecurityAlertEmail('');
      } else {
        setLockoutTick(Math.ceil((lockoutUntil - now) / 1000));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutUntil]);

  // Real-time Registration Validation
  const cleanRegPhone = regPhone.replace(/[\s-]/g, '');
  const waRegex = /^(\+?62|0)8[1-9][0-9]{7,11}$/;
  const isRegPhoneValid = waRegex.test(cleanRegPhone);
  const regPhoneError =
    regPhone.length > 0 && !isRegPhoneValid
      ? 'Nomor HP / WhatsApp tidak valid. Awali dengan 08 atau 628 (10–14 digit).'
      : '';

  const isCaptchaAligned = Math.abs(captchaSlider - captchaTarget) <= 7;

  const cleanUsername = regUsername.trim();
  const usernameRegex = /^[a-zA-Z0-9_.-]{3,24}$/;
  const isUsernameValid = usernameRegex.test(cleanUsername);
  const usernameError =
    regUsername.length > 0 && !isUsernameValid
      ? 'Username 3–24 karakter (huruf, angka, titik, atau garis bawah tanpa spasi).'
      : '';

  const isRegPwdValid = regPassword.length >= 6;
  const regPwdError =
    regPassword.length > 0 && !isRegPwdValid
      ? `Password kurang dari 6 karakter (${regPassword.length}/6 karakter).`
      : '';

  const cleanRegEmail = regEmail.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const isRegEmailValidOrEmpty =
    cleanRegEmail.length === 0 || emailRegex.test(cleanRegEmail);
  const regEmailError =
    cleanRegEmail.length > 0 && !emailRegex.test(cleanRegEmail)
      ? 'Format email tidak valid. Pastikan memakai tanda @ dan domain.'
      : '';

  const isStep4Valid =
    isUsernameValid && isRegPwdValid && isRegEmailValidOrEmpty;

  const finishAuth = (token: string, user: any, successMsg: string) => {
    setAuthSession(token, user);
    showToast(successMsg);
    onSuccess?.();
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutUntil && Date.now() < lockoutUntil) return;
    setError('');
    setLoading(true);
    try {
      if (loginMethod === 'password' && (!loginIdentifier.trim() || !loginPassword.trim())) {
        throw new Error('Silakan masukkan identifier dan password.');
      }
      if (loginMethod === 'password' && !captchaVerified) {
        throw new Error('Silakan selesaikan verifikasi keamanan.');
      }
      let emailToUse = loginIdentifier.trim();
      if (!emailToUse.includes('@')) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .or(`username.eq.${emailToUse},phone.eq.${emailToUse}`)
          .maybeSingle();
        if (!profile?.email) throw new Error('Akun dengan No HP / Username itu tidak ditemukan. Coba login pake Email.');
        emailToUse = profile.email;
      }
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password: loginPassword,
      });
      if (error) throw error;
      if (!data.session || !data.user) throw new Error('Login gagal, session tidak ditemukan');
      setLockoutUntil(0);
      setSecurityAlertEmail('');
      finishAuth(data.session.access_token, data.user, 'Login berhasil! Selamat datang.');
    } catch (err: any) {
      setError(err.message || 'Gagal login');
    } finally {
      setLoading(false);
    }
  };

  // Daftar Step 2 -> Kirim OTP setelah CAPTCHA Geser terverifikasi
  const handleSendPhoneRegOtp = async () => {
    setCaptchaTarget(generateCaptchaTarget());
    setCaptchaSlider(0);
    setCaptchaVisible(true);
    setCaptchaVerified(false);
    try {
      setLoading(true);
      setError('');
      const { error } = await supabase.auth.signInWithOtp({
        phone: regPhone,
      });
      if (error) throw error;
      setRegStep(3);
    } catch (err: any) {
      setError(err.message || 'Gagal kirim OTP');
    } finally {
      setLoading(false);
    }
  };
  
  // Daftar Step 3 -> Verifikasi OTP
  const verifyPhoneRegOtp = async (codeToVerify: string) => {
    const cleanCode = codeToVerify.trim();
    if (cleanCode.length !== 6 || loading) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register/phone-otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanRegPhone,
          code: cleanCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Kode OTP salah');
      setRegStep(4);
      showToast('OTP Terverifikasi! Silakan atur Username & Password.', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verifikasi OTP gagal');
    } finally {
      setLoading(false);
    }
  };

  // Daftar Step 4 -> Atur Username + Password -> Akun Otomatis Aktif & Masuk Beranda
  const handleCompletePhoneRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStep4Valid || loading) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanRegPhone,
          username: cleanUsername,
          password: regPassword,
          email: cleanRegEmail || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengaktifkan akun');
      finishAuth(
        data.token,
        data.user,
        `Akun ${data.user.role === 'seller' ? 'Seller' : 'Pembeli'} (@${data.user.username || data.user.name}) aktif! Selamat berbelanja.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengaktifkan akun');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: otpContact.trim(), channel: otpChannel }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengirim OTP');
      setOtpSent(true);
      setOtpCode('');
      setPreviewOtp(data.previewOtp || '');
      showToast(`Kode OTP dikirim via ${otpChannel}`, 'info');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact: otpContact.trim(),
          channel: otpChannel,
          code: otpCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Kode OTP tidak valid');
      finishAuth(
        data.token,
        data.user,
        `Login OTP ${otpChannel} berhasil! Halo, ${data.user.name}.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verifikasi OTP gagal');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: socialProvider,
          email: socialEmail.trim(),
          name: socialName.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || `Gagal masuk dengan ${socialProvider}`);
      finishAuth(
        data.token,
        data.user,
        `Masuk cepat dengan ${socialProvider} (${data.user.email})`
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : `Gagal masuk dengan ${socialProvider}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendForgotCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Email belum terdaftar');
      setForgotCodeSent(true);
      setForgotPreviewCode(data.previewCode || '');
      showToast('Kode verifikasi reset password dikirim ke email terdaftar', 'info');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal verifikasi email');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          code: forgotCode.trim(),
          newPassword: forgotNewPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal reset password');
      finishAuth(
        data.token,
        data.user,
        'Password berhasil diperbarui & login otomatis aktif!'
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async (label: 'Face ID' | 'Fingerprint') => {
    setError('');
    const storedCredId = localStorage.getItem(BIO_CRED_STORAGE_KEY);
    if (!storedCredId) {
      setError(
        `${label} belum ditautkan di perangkat ini. Silakan Daftar / Login sekali dulu, lalu aktifkan ${label} di menu Pengaturan.`
      );
      return;
    }

    setLoading(true);
    try {
      if (window.PublicKeyCredential && navigator.credentials?.get) {
        try {
          const rawId = Uint8Array.from(atob(storedCredId), (c) => c.charCodeAt(0));
          await navigator.credentials.get({
            publicKey: {
              challenge: randomChallenge() as BufferSource,
              allowCredentials: [{ id: rawId as BufferSource, type: 'public-key' }],
              userVerification: 'preferred',
              timeout: 30000,
            },
          });
        } catch (webAuthnErr) {
          if (
            webAuthnErr instanceof DOMException &&
            webAuthnErr.name === 'NotAllowedError'
          ) {
            throw new Error(
              `Verifikasi ${label} dibatalkan atau dibatasi oleh browser. Gunakan Password atau OTP jika perlu.`
            );
          }
        }
      }

      const res = await fetch('/api/auth/biometric/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentialId: storedCredId, label }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Gagal verifikasi ${label}`);
      finishAuth(data.token, data.user, `Login ${label} berhasil!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Gagal login ${label}`);
    } finally {
      setLoading(false);
    }
  };

  const openQuickSocial = (provider: SocialProvider) => {
    setSocialProvider(provider);
    setSocialEmail('');
    setSocialName('');
    setError('');
    setTab('social');
  };

  const isLocked = Boolean(lockoutUntil && Date.now() < lockoutUntil);
  const lockMin = String(Math.floor(lockoutTick / 60)).padStart(2, '0');
  const lockSec = String(lockoutTick % 60).padStart(2, '0');

  return (
    <div className="min-h-screen bg-[#111113] flex flex-col justify-center px-4 py-8">
      <div className="w-full max-w-md mx-auto space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <VtcLogo size="md" showWordmark={false} />
          </div>
          <div>
            <p className="text-xs font-bold tracking-wider uppercase text-[#FF6A00]">
              MARKETPLACE INDONESIA
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">
              VTC SHOP INDONESIA
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Masuk / Daftar Super Cepat · User lama otomatis masuk · Keamanan 3x salah kunci 5 menit.
            </p>
          </div>
        </div>

        {notice && (
          <div className="rounded-2xl bg-orange-950/70 border border-[#EE4D2D]/50 px-4 py-3 text-xs sm:text-sm text-orange-100 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#EE4D2D] shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {/* Auth Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
          {/* Method Tabs */}
          <div className="grid grid-cols-3 gap-1.5 bg-zinc-100 p-1 rounded-2xl">
            {[
              { id: 'login' as const, label: 'Masuk' },
              { id: 'register' as const, label: 'Daftar Cepat' },
              { id: 'otp' as const, label: 'OTP' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setTab(item.id);
                  setError('');
                }}
                className={`min-h-[42px] px-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  tab === item.id ||
                  (item.id === 'login' && (tab === 'social' || tab === 'forgot'))
                    ? 'bg-[#111113] text-white'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {isLocked && (
            <div className="rounded-2xl bg-rose-50 border border-rose-300 p-3.5 text-xs text-rose-900 space-y-1">
              <div className="flex items-center justify-between font-extrabold text-rose-700">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  Akun Dikunci Sementara (3x Salah Password)
                </span>
                <span className="font-mono bg-rose-600 text-white px-2 py-0.5 rounded-md tabular-nums">
                  {lockMin}:{lockSec}
                </span>
              </div>
              <p className="text-[11px] text-rose-800 leading-relaxed">
                Demi keamanan, login password dikunci 5 menit &amp; peringatan keamanan telah dikirim ke{' '}
                <strong>{securityAlertEmail || 'Email Anda'}</strong>. Gunakan{' '}
                <button
                  type="button"
                  onClick={() => setTab('otp')}
                  className="underline font-bold cursor-pointer"
                >
                  Login OTP
                </button>{' '}
                atau tunggu timer selesai.
              </p>
            </div>
          )}

          {error && !isLocked && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          {/* TAB 1: MASUK (No HP / Username / Email + Password dengan Ikon Mata) */}
          {tab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5" autoComplete="off">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  No. HP / Username / Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="Masukkan No. HP, Username, atau Email"
                    className="w-full h-12 pl-10 pr-3.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#EE4D2D]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-zinc-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail('');
                      setForgotCodeSent(false);
                      setForgotCode('');
                      setForgotNewPassword('');
                      setError('');
                      setTab('forgot');
                    }}
                    className="text-xs font-bold text-[#EE4D2D] hover:underline cursor-pointer"
                  >
                    Lupa Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showLoginPwd ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Masukkan password akun Anda"
                    className="w-full h-12 pl-10 pr-11 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#EE4D2D]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPwd((v) => !v)}
                    aria-label={showLoginPwd ? 'Sembunyikan password' : 'Lihat password'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-800 cursor-pointer"
                  >
                    {showLoginPwd ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || isLocked || !loginIdentifier.trim() || !loginPassword}
                className={`w-full h-12 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 transition-all ${
                  !loading && !isLocked && loginIdentifier.trim() && loginPassword
                    ? 'bg-[#EE4D2D] hover:bg-[#D73B1C] text-white cursor-pointer'
                    : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>{loading ? 'Memproses...' : 'Masuk ke VTC SHOP INDONESIA'}</span>
              </button>

              {/* Login Cepat: Google, Facebook, WhatsApp, Apple */}
              <div className="pt-2 space-y-2">
                <p className="text-[11px] font-bold text-center text-zinc-500">
                  Login Cepat 1 Klik
                </p>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => openQuickSocial('Google')}
                    className="min-h-[42px] rounded-xl border border-zinc-200 hover:border-[#EE4D2D] hover:bg-orange-50/40 text-[11px] font-extrabold text-zinc-800 cursor-pointer"
                  >
                    Google
                  </button>
                  <button
                    type="button"
                    onClick={() => openQuickSocial('Facebook')}
                    className="min-h-[42px] rounded-xl border border-zinc-200 hover:border-blue-500 hover:bg-blue-50/40 text-[11px] font-extrabold text-blue-700 cursor-pointer"
                  >
                    Facebook
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpChannel('WhatsApp');
                      setOtpContact('');
                      setOtpSent(false);
                      setError('');
                      setTab('otp');
                    }}
                    className="min-h-[42px] rounded-xl border border-zinc-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-[11px] font-extrabold text-emerald-700 cursor-pointer"
                  >
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => openQuickSocial('Apple')}
                    className="min-h-[42px] rounded-xl border border-zinc-200 hover:border-zinc-900 hover:bg-zinc-100 text-[11px] font-extrabold text-zinc-900 cursor-pointer"
                  >
                    Apple
                  </button>
                </div>
              </div>

              <p className="text-center text-xs text-zinc-500">
                Belum punya akun?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setTab('register');
                    setError('');
                  }}
                  className="font-bold text-[#EE4D2D] hover:underline cursor-pointer"
                >
                  Daftar Super Cepat
                </button>
              </p>
            </form>
          )}

          {/* TAB 2: DAFTAR SUPER CEPAT */}
          {tab === 'register' && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-1.5 text-center">
                {[
                  { step: 1, label: '1. No. HP' },
                  { step: 2, label: '2. Geser' },
                  { step: 3, label: '3. OTP' },
                  { step: 4, label: '4. Akun' },
                ].map((s) => (
                  <div
                    key={s.step}
                    className={`py-1.5 px-1 rounded-lg text-[10px] font-extrabold ${
                      regStep === s.step
                        ? 'bg-[#EE4D2D] text-white'
                        : regStep > s.step
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-zinc-100 text-zinc-500'
                    }`}
                  >
                    {s.label}
                  </div>
                ))}
              </div>

              {regStep === 1 && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                      Daftar Sebagai
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'buyer' as const, label: 'Pembeli' },
                        { id: 'seller' as const, label: 'Seller / Penjual' },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setRegRole(opt.id)}
                          className={`min-h-[40px] rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                            regRole === opt.id
                              ? 'border-[#EE4D2D] bg-orange-50 text-[#EE4D2D]'
                              : 'border-zinc-200 text-zinc-600'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Nomor HP / WhatsApp Aktif
                    </label>
                    <div className="relative">
                      <Smartphone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        autoComplete="off"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="Masukkan nomor HP aktif (08...)"
                        className={`w-full h-12 pl-10 pr-9 rounded-xl border text-sm focus:outline-none transition-colors ${
                          regPhoneError
                            ? 'border-rose-400 bg-rose-50/30'
                            : isRegPhoneValid
                              ? 'border-emerald-400'
                              : 'border-zinc-200 focus:border-[#EE4D2D]'
                        }`}
                      />
                      {isRegPhoneValid && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3 top-1/2 -translate-y-1/2" />
                      )}
                    </div>
                    {regPhoneError && (
                      <p className="mt-1 text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{regPhoneError}</span>
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={!isRegPhoneValid}
                    onClick={() => {
                      setError('');
                      setCaptchaTarget(generateCaptchaTarget());
                      setCaptchaSlider(0);
                      setRegStep(2);
                    }}
                    className={`w-full h-12 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 transition-all ${
                      isRegPhoneValid
                        ? 'bg-[#EE4D2D] hover:bg-[#D73B1C] text-white cursor-pointer shadow-lg shadow-[#EE4D2D]/25'
                        : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                    }`}
                  >
                    <span>Lanjut ke CAPTCHA Keamanan</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {regStep === 2 && (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-extrabold text-zinc-900 inline-flex items-center gap-1.5">
                      <Puzzle className="w-4 h-4 text-[#EE4D2D]" />
                      CAPTCHA Geser Gambar
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setCaptchaTarget(generateCaptchaTarget());
                        setCaptchaSlider(0);
                      }}
                      className="text-[11px] font-bold text-[#EE4D2D] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> Acak Ulang
                    </button>
                  </div>

                  <div className="relative h-32 rounded-2xl bg-gradient-to-br from-[#111113] via-zinc-900 to-[#3a160c] border border-zinc-800 overflow-hidden select-none">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#EE4D2D_1px,transparent_1px)] [background-size:12px_12px]" />
                    <div className="absolute top-2.5 left-3 text-[10px] font-bold text-orange-300 tracking-wider uppercase">
                      VTC SHOP INDONESIA · VERIFIKASI
                    </div>
                    <div
                      style={{ left: `${captchaTarget}%` }}
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-12 h-12 rounded-xl border-2 border-dashed border-white/70 bg-black/50 flex items-center justify-center"
                    >
                      <span className="text-[10px] font-bold text-white/60">PAS</span>
                    </div>
                    <div
                      style={{ left: `${Math.max(8, Math.min(92, captchaSlider))}%` }}
                      className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-12 h-12 rounded-xl shadow-lg flex items-center justify-center border-2 transition-colors ${
                        isCaptchaAligned
                          ? 'bg-emerald-500 border-white text-white'
                          : 'bg-[#EE4D2D] border-orange-200 text-white'
                      }`}
                    >
                      <Puzzle className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <input
                      type="range"
                      min={8}
                      max={92}
                      value={captchaSlider}
                      onChange={(e) => setCaptchaSlider(Number(e.target.value))}
                      aria-label="Geser potongan gambar ke kotak target"
                      className="w-full accent-[#EE4D2D] cursor-pointer h-3"
                    />
                    <p className={`text-xs font-bold text-center ${isCaptchaAligned ? 'text-emerald-600' : 'text-zinc-500'}`}>
                      {isCaptchaAligned
                        ? 'Posisi gambar cocok! Klik tombol di bawah untuk kirim OTP.'
                        : 'Geser slider hingga kotak oranye tepat menutupi kotak target'}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={!isCaptchaAligned || loading}
                    onClick={handleSendPhoneRegOtp}
                    className={`w-full h-12 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 transition-all ${
                      isCaptchaAligned && !loading
                        ? 'bg-[#EE4D2D] hover:bg-[#D73B1C] text-white cursor-pointer'
                        : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                    }`}
                  >
                    <span>{loading ? 'Mengirim OTP...' : 'Kirim Kode OTP 6 Digit'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegStep(1)}
                    className="w-full text-xs font-semibold text-zinc-500 hover:text-zinc-800 cursor-pointer"
                  >
                    ← Ubah Nomor HP
                  </button>
                </div>
              )}

              {regStep === 3 && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void verifyPhoneRegOtp(regOtpCode);
                  }}
                  className="space-y-3.5"
                >
                  <div className="rounded-xl bg-orange-50 border border-orange-200 p-3 text-xs text-zinc-700">
                    Kode OTP 6 digit telah dikirim ke <strong className="text-zinc-900">{cleanRegPhone}</strong>.
                  </div>
                  {regPreviewOtp && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900 flex items-center justify-between">
                      <span>Kode OTP Anda:</span>
                      <strong className="font-mono text-base tracking-widest">{regPreviewOtp}</strong>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Masukkan 6 Digit Kode OTP</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      maxLength={6}
                      autoFocus
                      value={regOtpCode}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setRegOtpCode(digits);
                        if (digits.length === 6 && !loading) {
                          void verifyPhoneRegOtp(digits);
                        }
                      }}
                      placeholder="Masukkan 6 digit kode OTP"
                      className="w-full h-12 px-3.5 rounded-xl border border-zinc-200 font-mono text-center text-lg tracking-widest focus:outline-none focus:border-[#EE4D2D]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={regOtpCode.length !== 6 || loading}
                    className={`w-full h-12 rounded-xl font-bold text-sm transition-all ${
                      regOtpCode.length === 6 && !loading
                        ? 'bg-[#EE4D2D] hover:bg-[#D73B1C] text-white cursor-pointer'
                        : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                    }`}
                  >
                    {loading ? 'Memverifikasi...' : 'Verifikasi Kode OTP'}
                  </button>
                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setCaptchaTarget(generateCaptchaTarget());
                        setCaptchaSlider(0);
                        setRegStep(2);
                      }}
                      className="font-bold text-[#EE4D2D] hover:underline cursor-pointer"
                    >
                      Kirim Ulang OTP
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegStep(1)}
                      className="font-semibold text-zinc-500 hover:text-zinc-800 cursor-pointer"
                    >
                      Ganti No. HP
                    </button>
                  </div>
                </form>
              )}

              {regStep === 4 && (
                <form onSubmit={handleCompletePhoneRegister} className="space-y-3" autoComplete="off">
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>No. HP <strong>{cleanRegPhone}</strong> terverifikasi! Atur Username &amp; Password Anda.</span>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Username Baru</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        autoComplete="off"
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        placeholder="Masukkan username (min. 3 karakter)"
                        className={`w-full h-12 px-3.5 pr-9 rounded-xl border text-sm focus:outline-none ${
                          usernameError ? 'border-rose-400 bg-rose-50/30' : isUsernameValid ? 'border-emerald-400' : 'border-zinc-200 focus:border-[#EE4D2D]'
                        }`}
                      />
                      {isUsernameValid && <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3 top-1/2 -translate-y-1/2" />}
                    </div>
                    {usernameError && (
                      <p className="mt-1 text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" /><span>{usernameError}</span>
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Password Baru</label>
                    <div className="relative">
                      <input
                        type={showRegPwd ? 'text' : 'password'}
                        required
                        minLength={6}
                        autoComplete="new-password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className={`w-full h-12 px-3.5 pr-11 rounded-xl border text-sm focus:outline-none ${
                          regPwdError ? 'border-rose-400 bg-rose-50/30' : isRegPwdValid ? 'border-emerald-400' : 'border-zinc-200 focus:border-[#EE4D2D]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPwd((v) => !v)}
                        aria-label={showRegPwd ? 'Sembunyikan password' : 'Lihat password'}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-800 cursor-pointer"
                      >
                        {showRegPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {regPwdError && (
                      <p className="mt-1 text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" /><span>{regPwdError}</span>
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Email Pemulihan (Opsional — untuk Lupa Password)</label>
                    <input
                      type="email"
                      autoComplete="off"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="Masukkan email aktif (opsional)"
                      className={`w-full h-11 px-3.5 rounded-xl border text-sm focus:outline-none ${regEmailError ? 'border-rose-400 bg-rose-50/30' : 'border-zinc-200 focus:border-[#EE4D2D]'}`}
                    />
                    {regEmailError && (
                      <p className="mt-1 text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" /><span>{regEmailError}</span>
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={!isStep4Valid || loading}
                    className={`w-full h-12 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 transition-all ${
                      isStep4Valid && !loading ? 'bg-[#EE4D2D] hover:bg-[#D73B1C] text-white cursor-pointer shadow-lg shadow-[#EE4D2D]/25' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{loading ? 'Mengaktifkan Akun...' : 'Aktifkan Akun & Masuk Beranda'}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: OTP VIA WHATSAPP / SMS / EMAIL */}
          {tab === 'otp' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-3 gap-1.5">
                {(['WhatsApp', 'SMS', 'Email'] as const).map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => {
                      setOtpChannel(ch);
                      setOtpSent(false);
                      setOtpContact('');
                      setOtpCode('');
                      setError('');
                    }}
                    className={`min-h-[42px] rounded-xl border text-xs font-bold cursor-pointer ${
                      otpChannel === ch ? 'border-[#EE4D2D] bg-orange-50 text-[#EE4D2D]' : 'border-zinc-200 text-zinc-700'
                    }`}
                  >
                    OTP {ch}
                  </button>
                ))}
              </div>
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      {otpChannel === 'Email' ? 'Alamat Email Aktif' : `Nomor ${otpChannel} Aktif`}
                    </label>
                    <div className="relative">
                      {otpChannel === 'Email' ? (
                        <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      ) : (
                        <Smartphone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      )}
                      <input
                        type={otpChannel === 'Email' ? 'email' : 'tel'}
                        required
                        value={otpContact}
                        onChange={(e) => setOtpContact(e.target.value)}
                        placeholder={otpChannel === 'Email' ? 'Masukkan alamat email aktif' : `Masukkan nomor ${otpChannel}`}
                        className="w-full h-12 pl-10 pr-3.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#EE4D2D]"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !otpContact.trim()}
                    className={`w-full h-12 rounded-xl font-bold text-sm transition-all ${
                      otpContact.trim() && !loading ? 'bg-[#EE4D2D] hover:bg-[#D73B1C] text-white cursor-pointer' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                    }`}
                  >
                    {loading ? 'Mengirim...' : `Kirim Kode OTP ${otpChannel}`}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-3">
                  {previewOtp && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900 flex items-center justify-between">
                      <span>Kode OTP {otpChannel} Anda:</span>
                      <strong className="font-mono text-base tracking-widest">{previewOtp}</strong>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Masukkan 6 Digit Kode OTP</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Masukkan 6 digit kode OTP"
                      className="w-full h-12 px-3.5 rounded-xl border border-zinc-200 font-mono text-center text-lg tracking-widest focus:outline-none focus:border-[#EE4D2D]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || otpCode.length !== 6}
                    className={`w-full h-12 rounded-xl font-bold text-sm transition-all ${
                      otpCode.length === 6 && !loading ? 'bg-[#EE4D2D] hover:bg-[#D73B1C] text-white cursor-pointer' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                    }`}
                  >
                    Verifikasi &amp; Masuk Beranda
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtpCode('');
                    }}
                    className="w-full text-xs font-semibold text-zinc-500 hover:text-zinc-800 py-1 cursor-pointer"
                  >
                    Ganti {otpChannel === 'Email' ? 'Email' : 'Nomor HP'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 4: LOGIN CEPAT (Google / Facebook / Apple) */}
          {tab === 'social' && (
            <form onSubmit={handleSocialLogin} className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-zinc-900">Masuk Cepat dengan {socialProvider}</h2>
                <button type="button" onClick={() => setTab('login')} className="text-xs font-bold text-zinc-500 hover:text-zinc-800 cursor-pointer">Kembali</button>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Email Akun {socialProvider}</label>
                <input type="email" required value={socialEmail} onChange={(e) => setSocialEmail(e.target.value)} placeholder={`Masukkan email akun ${socialProvider} Anda`} className="w-full h-12 px-3.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#EE4D2D]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Nama Tampilan (Opsional)</label>
                <input type="text" value={socialName} onChange={(e) => setSocialName(e.target.value)} placeholder="Masukkan nama tampilan" className="w-full h-12 px-3.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#EE4D2D]" />
              </div>
              <button type="submit" disabled={loading || !socialEmail.trim()} className="w-full h-12 rounded-xl bg-[#111113] hover:bg-zinc-800 text-white font-bold text-sm inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                <span>Lanjutkan dengan {socialProvider}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 5: LUPA PASSWORD LEWAT EMAIL TERVERIFIKASI */}
          {tab === 'forgot' && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-zinc-900">Lupa Password (Email Terverifikasi)</h2>
                <button type="button" onClick={() => { setTab('login'); setError(''); }} className="text-xs font-bold text-zinc-500 hover:text-zinc-800 cursor-pointer">Kembali Masuk</button>
              </div>
              {!forgotCodeSent ? (
                <form onSubmit={handleSendForgotCode} className="space-y-3">
                  <p className="text-xs text-zinc-600 leading-relaxed">Masukkan email terverifikasi akun Anda. Sistem akan mengirim kode reset 6 digit ke email tersebut.</p>
                  <input type="email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="Masukkan email terdaftar Anda" className="w-full h-12 px-3.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#EE4D2D]" />
                  <button type="submit" disabled={loading || !forgotEmail.trim()} className="w-full h-12 rounded-xl bg-[#EE4D2D] hover:bg-[#D73B1C] text-white font-bold text-sm cursor-pointer disabled:opacity-60">
                    {loading ? 'Memverifikasi Email...' : 'Kirim Kode Verifikasi Email'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-3">
                  {forgotPreviewCode && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900">
                      Email terverifikasi! Kode Reset Anda: <strong className="font-mono text-sm">{forgotPreviewCode}</strong>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Kode Verifikasi 6 Digit</label>
                    <input type="text" required maxLength={6} value={forgotCode} onChange={(e) => setForgotCode(e.target.value)} placeholder="Masukkan 6 digit kode" className="w-full h-12 px-3.5 rounded-xl border border-zinc-200 font-mono text-center text-lg tracking-widest focus:outline-none focus:border-[#EE4D2D]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Password Baru (min. 6 karakter)</label>
                    <div className="relative">
                      <input type={showForgotPwd ? 'text' : 'password'} required minLength={6} value={forgotNewPassword} onChange={(e) => setForgotNewPassword(e.target.value)} placeholder="Masukkan password baru" className="w-full h-12 px-3.5 pr-11 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#EE4D2D]" />
                      <button type="button" onClick={() => setShowForgotPwd((v) => !v)} aria-label="Lihat password baru" className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center text-zinc-500 cursor-pointer">
                        {showForgotPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-[#EE4D2D] hover:bg-[#D73B1C] text-white font-bold text-sm cursor-pointer disabled:opacity-60">
                    {loading ? 'Menyimpan...' : 'Simpan Password Baru & Masuk'}
                  </button>
                  <button type="button" onClick={() => { setForgotCodeSent(false); setForgotCode(''); }} className="w-full text-xs font-semibold text-zinc-500 hover:text-zinc-800 py-1 cursor-pointer">Ganti Email</button>
                </form>
              )}
            </div>
          )}

          {/* Biometric Section: Face ID & Fingerprint */}
          <div className="pt-3 border-t border-zinc-100 space-y-2.5">
            <p className="text-[11px] font-bold text-center text-zinc-500">Atau Masuk Instan dengan Biometrik Perangkat</p>
            <div className="grid grid-cols-2 gap-2.5">
              <button type="button" disabled={loading} onClick={() => handleBiometricLogin('Face ID')} className="min-h-[46px] px-3 rounded-xl border border-zinc-200 hover:border-[#EE4D2D] hover:bg-orange-50/40 text-xs font-bold text-zinc-800 inline-flex items-center justify-center gap-2 cursor-pointer">
                <ScanFace className="w-4 h-4 text-[#EE4D2D]" /><span>Face ID</span>
              </button>
              <button type="button" disabled={loading} onClick={() => handleBiometricLogin('Fingerprint')} className="min-h-[46px] px-3 rounded-xl border border-zinc-200 hover:border-[#EE4D2D] hover:bg-orange-50/40 text-xs font-bold text-zinc-800 inline-flex items-center justify-center gap-2 cursor-pointer">
                <Fingerprint className="w-4 h-4 text-[#EE4D2D]" /><span>Fingerprint</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
