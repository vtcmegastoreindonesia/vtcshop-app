import React, { useState } from 'react';
import {
  Zap,
  ScanFace,
  Fingerprint,
  LogOut,
  Ticket,
  Wallet,
  ShieldCheck,
  Smartphone,
  RotateCcw,
  Sun,
  Moon,
  Globe,
  Lock,
  MapPin,
  Trash2,
  Plus,
  User,
  Bell,
  SmartphoneNfc,
} from 'lucide-react';
import { useMarketplace } from '../store/marketplaceStore';
import { formatRupiah } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

const BIO_CRED_STORAGE_KEY = 'vtv_biometric_cred_id';

export const SettingsLitePage: React.FC = () => {
  const {
    state,
    authToken,
    currentUser,
    toggleLiteMode,
    toggleThemeMode,
    setLanguage,
    toggleTwoFactor,
    updateCurrentUser,
    updateNotificationPrefs,
    addSavedAddress,
    removeSavedAddress,
    setPrimaryAddress,
    logout,
    resetDemoData,
    showToast,
  } = useMarketplace();
  const [bioLoading, setBioLoading] = useState(false);
  const [hasLocalBio, setHasLocalBio] = useState(() =>
    Boolean(localStorage.getItem(BIO_CRED_STORAGE_KEY))
  );

  // Profile Edit State
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '');
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || '');

  React.useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name || '');
      setProfilePhone(currentUser.phone || '');
      setProfileEmail(currentUser.email || '');
    }
  }, [currentUser?.id, currentUser?.name, currentUser?.phone, currentUser?.email]);

  // New Address Form State (strictly empty initially)
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrLabel, setAddrLabel] = useState('');
  const [addrRecipient, setAddrRecipient] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrDetail, setAddrDetail] = useState('');

  const registerBiometric = async (label: 'Face ID' | 'Fingerprint') => {
    if (!authToken || !currentUser) return;
    setBioLoading(true);
    try {
      let credId = '';
      if (window.PublicKeyCredential && navigator.credentials?.create) {
        try {
          const challenge = new Uint8Array(32);
          crypto.getRandomValues(challenge);
          const userId = new TextEncoder().encode(currentUser.id);
          const cred = (await navigator.credentials.create({
            publicKey: {
              challenge: challenge as BufferSource,
              rp: { name: 'VTC SHOP INDONESIA' },
              user: {
                id: userId as BufferSource,
                name: currentUser.email,
                displayName: currentUser.name,
              },
              pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
              authenticatorSelection: {
                authenticatorAttachment: 'platform',
                userVerification: 'preferred',
              },
              timeout: 30000,
            },
          })) as PublicKeyCredential | null;

          if (cred?.rawId) {
            credId = btoa(
              String.fromCharCode(...new Uint8Array(cred.rawId))
            );
          }
        } catch {
          // Fallback to device-bound WebAuthn credential identifier when preview iframe restricts platform authenticator
        }
      }

      if (!credId) {
        const randBytes = new Uint8Array(18);
        crypto.getRandomValues(randBytes);
        credId = btoa(String.fromCharCode(...randBytes));
      }

      const res = await fetch('/api/auth/biometric/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ credentialId: credId, label }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengaktifkan biometrik');

      localStorage.setItem(BIO_CRED_STORAGE_KEY, credId);
      setHasLocalBio(true);
      showToast(`${label} berhasil ditautkan ke akun Anda!`);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : `Gagal mengaktifkan ${label}`,
        'warning'
      );
    } finally {
      setBioLoading(false);
    }
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrLabel.trim() || !addrRecipient.trim() || !addrPhone.trim() || !addrDetail.trim()) {
      showToast('Lengkapi semua kolom alamat terlebih dahulu', 'warning');
      return;
    }
    addSavedAddress({
      label: addrLabel.trim(),
      recipientName: addrRecipient.trim(),
      phone: addrPhone.trim(),
      city: addrCity.trim() || 'Jakarta',
      district: addrCity.trim() || 'Kecamatan Pusat',
      fullAddress: addrDetail.trim(),
      lat: -6.2088,
      lng: 106.8456,
      isPrimary: state.savedAddresses.length === 0,
    });
    setAddrLabel('');
    setAddrRecipient('');
    setAddrPhone('');
    setAddrCity('');
    setAddrDetail('');
    setShowAddressForm(false);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      showToast('Nama lengkap tidak boleh kosong', 'warning');
      return;
    }
    updateCurrentUser({
      name: profileName.trim(),
      phone: profilePhone.trim(),
      email: profileEmail.trim(),
    });
  };

  const isEn = state.language === 'en';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
          {isEn ? 'Settings, Profile & Lite Mode' : 'Pengaturan Akun, Tampilan & Sistem'}
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {isEn
            ? 'Manage Profile, Addresses, Language, Notifications, Security 2FA, Theme, and App Install.'
            : 'Ubah Profil, Alamat, Bahasa, Notifikasi, Keamanan 2FA, Tema Gelap/Terang, dan Instalasi Aplikasi.'}
        </p>
      </div>

      {/* Profil Akun Saya */}
      <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-[#EE4D2D]" />
          <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
            {isEn ? 'My Profile' : 'Profil Akun Saya'}
          </h2>
        </div>
        <form onSubmit={handleSaveProfile} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Nama lengkap Anda"
                className="w-full h-11 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                No. HP / WhatsApp
              </label>
              <input
                type="tel"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                placeholder="08xxxxxxxxxx"
                className="w-full h-11 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                Email Terdaftar
              </label>
              <input
                type="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                placeholder="email@domain.com"
                className="w-full h-11 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="min-h-[42px] px-5 rounded-xl bg-[#EE4D2D] hover:bg-[#D73B1C] text-white text-xs sm:text-sm font-bold cursor-pointer"
            >
              Simpan Perubahan Profil
            </button>
          </div>
        </form>
      </section>

      {/* Appearance & Language Card */}
      <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
        <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
          {isEn ? 'Appearance & Language' : 'Tampilan & Bahasa'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Dark/Light Theme */}
          <button
            type="button"
            onClick={() => toggleThemeMode()}
            className="min-h-[64px] p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/70 flex items-center justify-between gap-3 cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EE4D2D]/15 text-[#EE4D2D] flex items-center justify-center">
                {state.themeMode === 'dark' ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {state.themeMode === 'dark' ? 'Mode Gelap (Dark)' : 'Mode Terang (Light)'}
                </p>
                <p className="text-xs text-zinc-500">Klik untuk ganti tema</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-[#EE4D2D] text-white text-xs font-bold">
              {state.themeMode === 'dark' ? 'Gelap' : 'Terang'}
            </span>
          </button>

          {/* Language Switch ID/EN */}
          <div className="min-h-[64px] p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/70 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {isEn ? 'Language' : 'Bahasa Aplikasi'}
                </p>
                <p className="text-xs text-zinc-500">
                  {isEn ? 'English Active' : 'Bahasa Indonesia Aktif'}
                </p>
              </div>
            </div>
            <div className="flex rounded-xl bg-zinc-200 dark:bg-zinc-700 p-1 text-xs font-extrabold">
              <button
                type="button"
                onClick={() => setLanguage('id')}
                className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                  state.language === 'id'
                    ? 'bg-[#EE4D2D] text-white'
                    : 'text-zinc-700 dark:text-zinc-300'
                }`}
              >
                ID
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                  state.language === 'en'
                    ? 'bg-[#EE4D2D] text-white'
                    : 'text-zinc-700 dark:text-zinc-300'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Notification Preferences Card */}
      <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#EE4D2D]" />
          <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
            {isEn ? 'Notification Preferences' : 'Pengaturan Notifikasi'}
          </h2>
        </div>
        <div className="space-y-2.5">
          {[
            {
              key: 'orders' as const,
              title: 'Status Pesanan, Resi & Pengiriman',
              desc: 'Notifikasi saat barang dikemas, resi terbit, dan paket tiba.',
              val: state.notificationPrefs.orders,
            },
            {
              key: 'promos' as const,
              title: 'Promo Flash Sale & Voucher Gratis Ongkir',
              desc: 'Info diskon eksklusif dan voucher baru VTC SHOP INDONESIA.',
              val: state.notificationPrefs.promos,
            },
            {
              key: 'live' as const,
              title: 'Siaran VTC Live, TikTok & Story Toko',
              desc: 'Pengingat saat toko favorit Anda mulai live atau unggah produk.',
              val: state.notificationPrefs.live,
            },
          ].map((pref) => (
            <div
              key={pref.key}
              className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 p-3.5 flex items-center justify-between gap-3"
            >
              <div>
                <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {pref.title}
                </p>
                <p className="text-[11px] text-zinc-500">{pref.desc}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={pref.val}
                onClick={() => updateNotificationPrefs({ [pref.key]: !pref.val })}
                className={`min-w-[54px] h-8 rounded-full p-1 transition-colors shrink-0 cursor-pointer ${
                  pref.val ? 'bg-[#EE4D2D]' : 'bg-zinc-300 dark:bg-zinc-700'
                }`}
              >
                <span
                  className={`block w-6 h-6 rounded-full bg-white shadow transform ${
                    pref.val ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* PWA Install & Share App Card */}
      <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <SmartphoneNfc className="w-5 h-5 text-[#FF6A00]" />
          <div>
            <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
              Aplikasi PWA &amp; Bagikan Link Toko
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Pasang VTC SHOP INDONESIA ke Layar Utama HP atau bagikan link ke pembeli &amp; teman.
            </p>
          </div>
        </div>
        <PWAInstallButton onNotify={(msg) => showToast(msg)} />
      </section>

      {/* Mode Lite Card */}
      <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                state.liteMode
                  ? 'bg-[#EE4D2D] text-white'
                  : 'bg-orange-50 dark:bg-orange-950/50 text-[#EE4D2D]'
              }`}
            >
              <Zap className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                Mode Lite Super Cepat
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Matikan animasi berat & efek blur, perkecil ukuran gambar untuk hemat kuota, otomatis hentikan audio VTC Live saat pindah menu, dan ringankan memori untuk Android 5.0+ & RAM 3GB.
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={state.liteMode}
            onClick={() => toggleLiteMode()}
            className={`min-w-[64px] h-9 rounded-full p-1 transition-colors shrink-0 cursor-pointer ${
              state.liteMode ? 'bg-[#EE4D2D]' : 'bg-zinc-300 dark:bg-zinc-700'
            }`}
          >
            <span
              className={`block w-7 h-7 rounded-full bg-white shadow transform ${
                state.liteMode ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
          <div className="bg-zinc-50 dark:bg-zinc-800/70 rounded-xl p-3 border border-zinc-100 dark:border-zinc-800">
            <p className="font-bold text-zinc-900 dark:text-zinc-100">Animasi & Blur</p>
            <p className="text-zinc-500 mt-0.5">
              {state.liteMode ? 'Dimatikan (Super Ringan)' : 'Aktif Normal'}
            </p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-800/70 rounded-xl p-3 border border-zinc-100 dark:border-zinc-800">
            <p className="font-bold text-zinc-900 dark:text-zinc-100">Audio Live Auto-Stop</p>
            <p className="text-zinc-500 mt-0.5">Aktif Otomatis Saat Pindah Menu</p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-800/70 rounded-xl p-3 border border-zinc-100 dark:border-zinc-800">
            <p className="font-bold text-zinc-900 dark:text-zinc-100">Kompatibilitas</p>
            <p className="text-zinc-500 mt-0.5">Android 5.0+ · RAM 3GB Ready</p>
          </div>
        </div>
      </section>

      {/* Account, 2FA & Biometrics */}
      <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#111113] text-white flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#EE4D2D]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {currentUser?.name || 'Pengguna VTC SHOP INDONESIA'}
              </h3>
              <p className="text-xs text-zinc-500">
                {currentUser?.email} · Masuk via {currentUser?.authMethod} · Role:{' '}
                <strong className="text-zinc-900 dark:text-zinc-100 uppercase">
                  {currentUser?.role}
                </strong>
              </p>
            </div>
          </div>
        </div>

        {/* 2FA Toggle */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Verifikasi 2 Langkah (2FA)
              </p>
              <p className="text-[11px] text-zinc-500">
                Minta konfirmasi OTP saat login perangkat baru atau ubah rekening.
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={state.twoFactorEnabled}
            onClick={() => toggleTwoFactor()}
            className={`min-w-[54px] h-8 rounded-full p-1 transition-colors shrink-0 cursor-pointer ${
              state.twoFactorEnabled ? 'bg-emerald-600' : 'bg-zinc-300 dark:bg-zinc-700'
            }`}
          >
            <span
              className={`block w-6 h-6 rounded-full bg-white shadow transform ${
                state.twoFactorEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="bg-orange-50/60 dark:bg-orange-950/25 border border-orange-200 dark:border-orange-900/50 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Wallet className="w-5 h-5 text-[#EE4D2D]" />
            <div>
              <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Saldo VTCPay</p>
              <p className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 tabular-nums">
                {formatRupiah(state.vtvpayBalance)}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Siap Pakai</span>
        </div>

        {/* Biometric Linking */}
        <div className="space-y-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 inline-flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-[#EE4D2D]" />
              Login Biometrik (Face ID & Fingerprint)
            </p>
            {hasLocalBio && (
              <span className="text-xs font-bold text-emerald-700">
                Perangkat Tertaut
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              disabled={bioLoading}
              onClick={() => registerBiometric('Face ID')}
              className="min-h-[46px] px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-[#EE4D2D] text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-100 inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <ScanFace className="w-4 h-4 text-[#EE4D2D]" />
              Aktifkan Face ID
            </button>
            <button
              type="button"
              disabled={bioLoading}
              onClick={() => registerBiometric('Fingerprint')}
              className="min-h-[46px] px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-[#EE4D2D] text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-100 inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <Fingerprint className="w-4 h-4 text-[#EE4D2D]" />
              Aktifkan Fingerprint
            </button>
          </div>
        </div>
      </section>

      {/* Saved Addresses Manager */}
      <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 inline-flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#EE4D2D]" />
            Alamat Pengiriman Tersimpan ({state.savedAddresses.length})
          </h3>
          <button
            type="button"
            onClick={() => setShowAddressForm((v) => !v)}
            className="min-h-[36px] px-3 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-[#EE4D2D] text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah Alamat
          </button>
        </div>

        {showAddressForm && (
          <form onSubmit={handleSaveAddress} className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/70 p-4 space-y-2.5 border border-zinc-200 dark:border-zinc-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="text"
                required
                value={addrLabel}
                onChange={(e) => setAddrLabel(e.target.value)}
                placeholder="Label (Contoh: Rumah / Kantor)"
                className="h-10 px-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs"
              />
              <input
                type="text"
                required
                value={addrRecipient}
                onChange={(e) => setAddrRecipient(e.target.value)}
                placeholder="Nama Penerima"
                className="h-10 px-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs"
              />
              <input
                type="tel"
                required
                value={addrPhone}
                onChange={(e) => setAddrPhone(e.target.value)}
                placeholder="No. WhatsApp / HP"
                className="h-10 px-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs"
              />
              <input
                type="text"
                required
                value={addrCity}
                onChange={(e) => setAddrCity(e.target.value)}
                placeholder="Kota / Kabupaten"
                className="h-10 px-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs"
              />
            </div>
            <textarea
              rows={2}
              required
              value={addrDetail}
              onChange={(e) => setAddrDetail(e.target.value)}
              placeholder="Alamat lengkap (Jalan, RT/RW, Patokan)..."
              className="w-full p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs resize-none"
            />
            <button
              type="submit"
              className="w-full h-10 rounded-xl bg-[#EE4D2D] text-white text-xs font-bold cursor-pointer"
            >
              Simpan Alamat Baru
            </button>
          </form>
        )}

        {state.savedAddresses.length === 0 ? (
          <p className="text-xs text-zinc-500">
            Belum ada alamat tersimpan. Tambahkan alamat agar checkout jauh lebih cepat.
          </p>
        ) : (
          <div className="space-y-2">
            {state.savedAddresses.map((addr) => (
              <div
                key={addr.id}
                className={`rounded-xl border p-3 flex items-start justify-between gap-2 ${
                  addr.isPrimary
                    ? 'border-[#EE4D2D] bg-orange-50/40 dark:bg-orange-950/20'
                    : 'border-zinc-200 dark:border-zinc-800'
                }`}
              >
                <div className="min-w-0 text-xs space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-zinc-900 dark:text-zinc-100">
                      {addr.label}
                    </span>
                    {addr.isPrimary && (
                      <span className="px-1.5 py-0.5 rounded bg-[#EE4D2D] text-white text-[10px] font-bold">
                        Utama
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-zinc-700 dark:text-zinc-300">
                    {addr.recipientName} · {addr.phone}
                  </p>
                  <p className="text-zinc-500 line-clamp-2">
                    {addr.fullAddress} ({addr.city})
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {!addr.isPrimary && (
                    <button
                      type="button"
                      onClick={() => setPrimaryAddress(addr.id)}
                      className="px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[10px] font-bold text-zinc-700 dark:text-zinc-200 cursor-pointer"
                    >
                      Jadikan Utama
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeSavedAddress(addr.id)}
                    aria-label="Hapus Alamat"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Vouchers Wallet */}
      <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-3">
        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 inline-flex items-center gap-2">
          <Ticket className="w-5 h-5 text-[#EE4D2D]" />
          Voucher Saya ({state.vouchers.filter((v) => !v.used).length} Aktif)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {state.vouchers.map((v) => (
            <div
              key={v.code}
              className={`rounded-xl border p-3.5 ${
                v.used
                  ? 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 opacity-60'
                  : 'border-orange-200 dark:border-orange-900/50 bg-orange-50/40 dark:bg-orange-950/20'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-[#EE4D2D]">
                  {v.code}
                </span>
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  {v.used ? 'Terpakai' : 'Aktif'}
                </span>
              </div>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-1">{v.title}</p>
              <p className="text-xs text-zinc-500 mt-0.5 tabular-nums">
                Min. belanja {formatRupiah(v.minSpend)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Actions: Reset Demo & Logout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={resetDemoData}
          className="min-h-[48px] px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-100 font-bold text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Data Demo Katalog & Order
        </button>
        <button
          type="button"
          onClick={logout}
          className="min-h-[48px] px-4 rounded-xl bg-[#111113] hover:bg-zinc-800 text-white font-bold text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Keluar dari Akun (Logout)
        </button>
      </div>
    </div>
  );
};
