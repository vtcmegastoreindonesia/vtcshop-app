import React, { useMemo } from 'react';
import {
  Package,
  Store,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronRight,
  Wallet,
  Ticket,
  Zap,
  Coins,
  Tv,
  Gamepad2,
  Share2,
  Trophy,
  Crown,
  Lock,
  Save,
  MapPin,
  Smartphone,
} from 'lucide-react';
import { useMarketplace } from '../store/marketplaceStore';
import { AppTab, computeVipTier, formatRupiah } from '../types';

interface ProfilePageProps {
  onNavigate: (tab: AppTab) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const {
    state,
    currentUser,
    updateCurrentUser,
    addSavedAddress,
    removeSavedAddress,
    logout,
    toggleLiteMode,
    claimDailyCoins,
  } = useMarketplace();
  const [showVouchers, setShowVouchers] = React.useState(false);
  const [editingAccount, setEditingAccount] = React.useState(false);
  const [accName, setAccName] = React.useState(currentUser?.name || '');
  const [accPhone, setAccPhone] = React.useState(currentUser?.phone || '');
  const [accEmail, setAccEmail] = React.useState(currentUser?.email || '');
  const [addrLabel, setAddrLabel] = React.useState('Rumah');
  const [addrCity, setAddrCity] = React.useState('');
  const [addrDetail, setAddrDetail] = React.useState('');
  const [showAddrForm, setShowAddrForm] = React.useState(false);

  React.useEffect(() => {
    setAccName(currentUser?.name || '');
    setAccPhone(currentUser?.phone || '');
    setAccEmail(currentUser?.email || '');
  }, [currentUser?.name, currentUser?.phone, currentUser?.email]);

  const isEn = state.language === 'en';
  const totalSpent = useMemo(
    () => state.orders.reduce((sum, o) => sum + o.totalAmount, 0),
    [state.orders]
  );
  const vipInfo = useMemo(() => computeVipTier(totalSpent), [totalSpent]);
  const vipTier = vipInfo.tier;

  const activeOrdersCount = useMemo(
    () =>
      state.orders.filter(
        (o) => o.status !== 'Diterima' && o.status !== 'Dana Dikembalikan'
      ).length,
    [state.orders]
  );

  const pendingAdminCount = useMemo(() => {
    const pendingSellers = state.sellers.filter(
      (s) => s.status === 'pending'
    ).length;
    const complaints = state.orders.filter(
      (o) => o.status === 'Komplain'
    ).length;
    return pendingSellers + complaints + state.fraudReports.length;
  }, [state.sellers, state.orders, state.fraudReports]);

  const activeVouchers = useMemo(
    () => state.vouchers.filter((v) => !v.used),
    [state.vouchers]
  );

  const todayKey = new Date().toISOString().slice(0, 10);
  const coinClaimedToday = state.lastCoinCheckInDate === todayKey;

  const initialLetter = (currentUser?.name || 'V').charAt(0).toUpperCase();

  const superAppHubs: Array<{
    id: AppTab;
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    accent: string;
  }> = [
    {
      id: 'tv',
      title: 'VTC Super TV',
      subtitle: '12 TV Nasional Live + TikTok & YouTube',
      icon: Tv,
      badge: 'LIVE',
      accent: 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400',
    },
    {
      id: 'pay',
      title: 'VTC Pay & PayLater',
      subtitle: 'Top Up, Transfer Gratis, QRIS & Pinjam',
      icon: Wallet,
      badge: formatRupiah(state.vtvpayBalance),
      accent: 'bg-orange-50 text-[#EE4D2D] dark:bg-orange-950/50',
    },
    {
      id: 'topup',
      title: 'Top Up Game & Travel',
      subtitle: 'ML, FF, Pulsa, PLN, Netflix & Tiket',
      icon: Gamepad2,
      badge: 'Diskon 10%',
      accent: 'bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400',
    },
    {
      id: 'affiliate',
      title: 'VTC Affiliate Program',
      subtitle: 'Share Produk, Komisi 10–20% Cair Instan',
      icon: Share2,
      badge: formatRupiah(state.affiliateProfile.availableCommission),
      accent: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
    },
    {
      id: 'games',
      title: 'Mini-Games & VIP Member',
      subtitle: '4 Game Koin + Reward Member VIP',
      icon: Trophy,
      badge: `VIP ${vipTier}`,
      accent: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {isEn ? 'My Account' : 'Akun Saya'}
          </h1>
          <p className="text-xs text-zinc-500">
            Semua data akun, keranjang, alamat &amp; pesanan tersimpan otomatis di HP Anda.
          </p>
        </div>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
          <Smartphone className="w-3.5 h-3.5" /> Tersimpan di HP
        </span>
      </div>

      {/* User Summary Card */}
      <section className="bg-[#111113] text-white rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-[#EE4D2D] text-white text-xl font-extrabold flex items-center justify-center shrink-0">
              {initialLetter}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold truncate">
                  {currentUser?.name || 'Pembeli VTC SHOP INDONESIA'}
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[11px] font-extrabold">
                  <Crown className="w-3 h-3" /> VIP {vipTier}
                </span>
              </div>
              <p className="text-xs text-zinc-400 truncate">
                {currentUser?.email} {currentUser?.phone ? `· ${currentUser.phone}` : ''} · {currentUser?.authMethod}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditingAccount((v) => !v)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer"
            >
              {editingAccount ? 'Tutup Edit' : 'Edit Profil'}
            </button>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold border ${
                state.twoFactorEnabled
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-zinc-800 text-zinc-300 border-zinc-700'
              }`}
            >
              <Lock className="w-3 h-3" />
              {state.twoFactorEnabled ? '2FA Aktif' : '2FA'}
            </span>
          </div>
        </div>

        {editingAccount && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateCurrentUser({
                name: accName,
                phone: accPhone,
                email: accEmail,
              });
              setEditingAccount(false);
            }}
            className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 space-y-3"
          >
            <p className="text-xs font-extrabold text-white">
              Ubah Data Akun Saya (Simpan Permanen di HP)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <input
                type="text"
                required
                value={accName}
                onChange={(e) => setAccName(e.target.value)}
                placeholder="Nama Lengkap"
                className="h-10 px-3 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-white focus:outline-none focus:border-[#EE4D2D]"
              />
              <input
                type="tel"
                value={accPhone}
                onChange={(e) => setAccPhone(e.target.value)}
                placeholder="Nomor HP / WhatsApp"
                className="h-10 px-3 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-white focus:outline-none focus:border-[#EE4D2D]"
              />
              <input
                type="email"
                required
                value={accEmail}
                onChange={(e) => setAccEmail(e.target.value)}
                placeholder="Email"
                className="h-10 px-3 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-white focus:outline-none focus:border-[#EE4D2D]"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="min-h-[38px] px-4 rounded-xl bg-[#EE4D2D] hover:bg-[#D73B1C] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Data Akun</span>
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <button
            type="button"
            onClick={() => onNavigate('pay')}
            className="bg-white/10 hover:bg-white/15 rounded-2xl p-3.5 text-left cursor-pointer"
          >
            <p className="text-[11px] text-zinc-300 inline-flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 text-[#EE4D2D]" /> Saldo VTC Pay
            </p>
            <p className="text-base sm:text-lg font-extrabold tabular-nums mt-0.5">
              {formatRupiah(state.vtvpayBalance)}
            </p>
          </button>
          <div className="bg-white/10 rounded-2xl p-3.5 flex items-center justify-between gap-2">
            <div>
              <p className="text-[11px] text-zinc-300 inline-flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-400" /> Saldo Koin
              </p>
              <p className="text-base sm:text-lg font-extrabold tabular-nums mt-0.5">
                {state.vtvCoins.toLocaleString('id-ID')}
              </p>
            </div>
            <button
              type="button"
              disabled={coinClaimedToday}
              onClick={claimDailyCoins}
              className="px-2.5 py-1.5 rounded-lg bg-[#EE4D2D] disabled:bg-zinc-700 disabled:text-zinc-400 text-white text-[10px] font-bold cursor-pointer shrink-0"
            >
              {coinClaimedToday ? 'Klaim ✓' : '+500'}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowVouchers((v) => !v)}
            className="bg-white/10 hover:bg-white/15 rounded-2xl p-3.5 text-left cursor-pointer"
          >
            <p className="text-[11px] text-zinc-300 inline-flex items-center gap-1">
              <Ticket className="w-3.5 h-3.5 text-[#EE4D2D]" /> Voucher Saya
            </p>
            <p className="text-base sm:text-lg font-extrabold tabular-nums mt-0.5">
              {activeVouchers.length} Voucher
            </p>
          </button>
        </div>

        {/* VTC Guarantee Shield */}
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/25 px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>VTC Guarantee Escrow:</strong> Dana belanja aman ditahan hingga barang diterima · Refund 1-Klik &lt; 24 jam
            </span>
          </div>
        </div>

        {showVouchers && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 space-y-2">
            <p className="text-xs font-extrabold text-white">
              Daftar Voucher Saya (Bisa Digabung 3 Saat Checkout)
            </p>
            {activeVouchers.length === 0 ? (
              <p className="text-xs text-zinc-400">
                Belum ada voucher aktif. Klaim voucher di halaman Beranda!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeVouchers.map((v) => (
                  <div
                    key={v.code}
                    className="rounded-xl bg-zinc-800/90 border border-zinc-700 p-2.5 text-xs"
                  >
                    <p className="font-mono font-bold text-[#EE4D2D]">
                      {v.code}
                    </p>
                    <p className="font-semibold text-white truncate">{v.title}</p>
                    <p className="text-[11px] text-zinc-400 tabular-nums">
                      Hemat {formatRupiah(v.amount)} · Min. {formatRupiah(v.minSpend)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Super App Ecosystem Hubs */}
      <section className="space-y-2.5">
        <h2 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 px-1">
          {isEn ? 'VTC Super App Ecosystem' : 'Ekosistem Super App VTC SHOP INDONESIA'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {superAppHubs.map((hub) => {
            const Icon = hub.icon;
            return (
              <button
                key={hub.id}
                type="button"
                onClick={() => onNavigate(hub.id)}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-[#EE4D2D] p-3.5 flex items-center justify-between gap-3 text-left cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${hub.accent}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-zinc-100 truncate">
                      {hub.title}
                    </p>
                    <p className="text-[11px] text-zinc-500 truncate">
                      {hub.subtitle}
                    </p>
                  </div>
                </div>
                {hub.badge && (
                  <span className="px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[10px] font-extrabold text-[#EE4D2D] shrink-0 tabular-nums">
                    {hub.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Profile Menu: Pesanan, Seller, Admin, Pengaturan */}
      <section className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden">
        <button
          type="button"
          onClick={() => onNavigate('orders')}
          className="w-full min-h-[72px] p-4 sm:px-5 flex items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-left cursor-pointer"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-orange-50 dark:bg-orange-950/50 text-[#EE4D2D] flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                {isEn ? 'My Orders' : 'Pesanan Saya (Diproses · Dikirim · Selesai)'}
              </p>
              <p className="text-xs text-zinc-500 truncate">
                Lacak Paket, Status Diproses/Dikirim/Selesai, Invoice &amp; Rating
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {activeOrdersCount > 0 && (
              <span className="min-w-[24px] h-6 px-2 rounded-full bg-[#EE4D2D] text-white text-xs font-extrabold flex items-center justify-center tabular-nums">
                {activeOrdersCount}
              </span>
            )}
            <ChevronRight className="w-5 h-5 text-zinc-400" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('seller')}
          className="w-full min-h-[72px] p-4 sm:px-5 flex items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-left cursor-pointer"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-orange-50 dark:bg-orange-950/50 text-[#EE4D2D] flex items-center justify-center shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                {isEn ? 'Seller Center & My Store' : 'Seller & Toko Saya (Jualan)'}
              </p>
              <p className="text-xs text-zinc-500 truncate">
                Daftar Seller 5 Menit (KTP+OTP), Grafik Omset, Flash Sale & Saldo
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-400 shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('admin')}
          className="w-full min-h-[72px] p-4 sm:px-5 flex items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-left cursor-pointer"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-[#111113] text-[#EE4D2D] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                Admin VTC SHOP INDONESIA (Proteksi Passcode)
              </p>
              <p className="text-xs text-zinc-500 truncate">
                ACC Seller, Lepas Dana ke Seller, Refund & Laporan Penipu
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {pendingAdminCount > 0 && (
              <span className="min-w-[24px] h-6 px-2 rounded-full bg-[#111113] text-white text-xs font-extrabold flex items-center justify-center tabular-nums">
                {pendingAdminCount}
              </span>
            )}
            <ChevronRight className="w-5 h-5 text-zinc-400" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('settings')}
          className="w-full min-h-[72px] p-4 sm:px-5 flex items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-left cursor-pointer"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center shrink-0">
              <Settings className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                {isEn ? 'Settings, Theme & Lite Mode' : 'Pengaturan, Tema Gelap, Bahasa & Mode Lite'}
              </p>
              <p className="text-xs text-zinc-500 truncate">
                Mode Gelap/Terang, Bahasa ID/EN, 2FA, Alamat & Versi Lite RAM 3GB
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-400 shrink-0" />
        </button>
      </section>

      {/* Alamat Pengiriman Tersimpan di HP */}
      <section className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#EE4D2D]" />
            <h2 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
              Alamat Pengiriman Tersimpan ({state.savedAddresses.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setShowAddrForm((v) => !v)}
            className="text-xs font-bold text-[#EE4D2D] hover:underline cursor-pointer"
          >
            {showAddrForm ? 'Tutup' : '+ Tambah Alamat'}
          </button>
        </div>

        {showAddrForm && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!addrDetail.trim()) return;
              addSavedAddress({
                label: addrLabel.trim() || 'Alamat Utama',
                recipientName: currentUser?.name || 'Pembeli VTC',
                phone: currentUser?.phone || '081200000000',
                fullAddress: addrDetail.trim(),
                city: addrCity.trim() || 'Indonesia',
                district: 'Utama',
                lat: -6.244,
                lng: 106.799,
                isPrimary: state.savedAddresses.length === 0,
              });
              setAddrCity('');
              setAddrDetail('');
              setShowAddrForm(false);
            }}
            className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 p-3.5 space-y-2.5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={addrLabel}
                onChange={(e) => setAddrLabel(e.target.value)}
                placeholder="Label (Rumah / Kantor)"
                className="h-10 px-3 rounded-xl border border-zinc-200 bg-white text-xs text-zinc-900"
              />
              <input
                type="text"
                value={addrCity}
                onChange={(e) => setAddrCity(e.target.value)}
                placeholder="Kota / Kabupaten"
                className="h-10 px-3 rounded-xl border border-zinc-200 bg-white text-xs text-zinc-900"
              />
            </div>
            <textarea
              rows={2}
              required
              value={addrDetail}
              onChange={(e) => setAddrDetail(e.target.value)}
              placeholder="Alamat Lengkap (Jalan, No. Rumah, RT/RW, Kecamatan)"
              className="w-full p-2.5 rounded-xl border border-zinc-200 bg-white text-xs text-zinc-900 resize-none"
            />
            <button
              type="submit"
              className="min-h-[38px] px-4 rounded-xl bg-[#EE4D2D] text-white text-xs font-bold cursor-pointer"
            >
              Simpan Alamat di HP
            </button>
          </form>
        )}

        {state.savedAddresses.length === 0 ? (
          <p className="text-xs text-zinc-500">
            Belum ada alamat tersimpan. Tambahkan alamat agar Checkout COD lebih cepat.
          </p>
        ) : (
          <div className="space-y-2">
            {state.savedAddresses.map((addr) => (
              <div
                key={addr.id}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-3 flex items-start justify-between gap-2 text-xs"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">
                    {addr.label} · {addr.recipientName} ({addr.phone})
                  </p>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    {addr.fullAddress}, {addr.city}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeSavedAddress(addr.id)}
                  className="text-[11px] font-bold text-rose-600 hover:underline shrink-0 cursor-pointer"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick Mode Lite Toggle & Logout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => toggleLiteMode()}
          className={`min-h-[50px] px-4 rounded-2xl border font-bold text-sm inline-flex items-center justify-center gap-2 cursor-pointer ${
            state.liteMode
              ? 'bg-[#EE4D2D] border-[#EE4D2D] text-white'
              : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>{state.liteMode ? 'Mode Lite: AKTIF' : 'Aktifkan Mode Lite'}</span>
        </button>

        <button
          type="button"
          onClick={logout}
          className="min-h-[50px] px-4 rounded-2xl bg-[#111113] hover:bg-zinc-800 text-white font-bold text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>{isEn ? 'Sign Out' : 'Keluar dari Akun'}</span>
        </button>
      </div>
    </div>
  );
};
