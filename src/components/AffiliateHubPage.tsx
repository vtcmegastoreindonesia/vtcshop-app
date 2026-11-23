import React, { useState } from 'react';
import {
  Share2,
  CheckCircle2,
  Award,
  Wallet,
  TrendingUp,
  Copy,
  Mail,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { useMarketplace } from '../store/marketplaceStore';
import { formatDateId, formatRupiah } from '../types';
import { ProductImage } from './ProductImage';

const LEADERBOARD = [
  { rank: 1, name: '@nadia_review', orders: 428, commission: 14850000, bonus: 'Bonus Emas + Rp 2.500.000' },
  { rank: 2, name: '@tekno_gadget_id', orders: 312, commission: 11200000, bonus: 'Bonus Saldo Rp 1.500.000' },
  { rank: 3, name: '@dapurhemat_rina', orders: 265, commission: 8940000, bonus: 'Bonus Saldo Rp 750.000' },
];

export const AffiliateHubPage: React.FC = () => {
  const {
    state,
    updateAffiliateProfile,
    withdrawAffiliateCommission,
    recordAffiliateShare,
    showToast,
  } = useMarketplace();

  const aff = state.affiliateProfile;

  // Empty initial form inputs!
  const [fullName, setFullName] = useState(aff.fullName || '');
  const [phone, setPhone] = useState(aff.phone || '');
  const [email, setEmail] = useState(aff.email || '');
  const [socialPlatform, setSocialPlatform] = useState<
    'TikTok' | 'Instagram' | 'YouTube' | 'Facebook'
  >(aff.socialPlatform || 'TikTok');
  const [socialLink, setSocialLink] = useState(aff.socialLink || '');
  const [otpInput, setOtpInput] = useState('');
  const [sentCode, setSentCode] = useState('');
  const [withdrawTarget, setWithdrawTarget] = useState('VTC Pay');
  const [withdrawAmt, setWithdrawAmt] = useState('');

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !email.trim()) return;
    updateAffiliateProfile({
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      step: 2,
    });
  };

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socialLink.trim()) return;
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setSentCode(code);
    updateAffiliateProfile({
      socialPlatform,
      socialLink: socialLink.trim(),
      step: 3,
    });
    showToast(
      `Kode Verifikasi Email dikirim ke ${aff.email || email} (Kode Simulasi: ${code})`,
      'info'
    );
  };

  const handleStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput.trim().length < 4) {
      showToast('Masukkan 6 digit kode verifikasi email dengan benar', 'warning');
      return;
    }
    if (sentCode && otpInput.trim() !== sentCode) {
      showToast('Kode verifikasi email tidak cocok', 'warning');
      return;
    }
    updateAffiliateProfile({
      verifiedEmailCode: otpInput.trim(),
      step: 4,
    });
  };

  const handleCompleteStep4To5 = () => {
    updateAffiliateProfile({
      step: 5,
      approved: true,
      joinedAt: new Date().toISOString(),
    });
    showToast('Selamat! Akun Affiliate VTC SHOP INDONESIA Anda Resmi Aktif!');
  };

  const handleShareProduct = (productId: string, name: string, price: number) => {
    const commission = Math.min(50000, Math.round(price * 0.15));
    const shareUrl = `https://vtcshop.id/aff/${productId}?ref=${encodeURIComponent(
      (aff.fullName || 'creator').replace(/\s+/g, '').toLowerCase()
    )}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).catch(() => {});
    }
    recordAffiliateShare(productId, commission);
    showToast(`Link Affiliate "${name}" disalin! Komisi s/d 20% (Maks Rp50rb).`);
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = Number(withdrawAmt);
    if (!numeric || numeric <= 0) return;
    if (withdrawAffiliateCommission(numeric, withdrawTarget)) {
      setWithdrawAmt('');
    }
  };

  const weeklyStats = [
    { day: 'Sen', val: 38 },
    { day: 'Sel', val: 52 },
    { day: 'Rab', val: 64 },
    { day: 'Kam', val: 58 },
    { day: 'Jum', val: 85 },
    { day: 'Sab', val: 95 },
    { day: 'Min', val: 100 },
  ];

  return (
    <div className="space-y-6">
      {/* Banner Header */}
      <section className="rounded-3xl bg-[#111113] text-white p-5 sm:p-7 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EE4D2D] text-[11px] font-extrabold uppercase">
            <Share2 className="w-3.5 h-3.5" />
            VTC AFFILIATE SUPER PROGRAM
          </span>
          <h1 className="text-xl sm:text-2xl font-black">
            Komisi 10% – 20% (Maks Rp 50.000 / Produk) · Cair ke VTC Pay & Bank
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300">
            Bagikan link produk atau aktifkan Keranjang Kuning di VTC Super TV & Video
            untuk langsung mendapatkan komisi otomatis.
          </p>
        </div>

        <div className="px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-right shrink-0">
          <p className="text-[11px] text-zinc-400">Komisi Bisa Dicairkan</p>
          <p className="text-xl font-black text-amber-400 tabular-nums">
            {formatRupiah(aff.availableCommission)}
          </p>
        </div>
      </section>

      {/* 5-Step Registration Wizard if not approved yet */}
      {!aff.approved ? (
        <section className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 space-y-5">
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
              Pendaftaran Affiliate (5 Langkah Mudah)
            </h2>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                '1. Data Diri',
                '2. Link Medsos',
                '3. Kode Email',
                '4. Verifikasi',
                '5. Berhasil',
              ].map((label, idx) => {
                const stepNum = idx + 1;
                const active = aff.step >= stepNum;
                return (
                  <div
                    key={label}
                    className={`p-2 rounded-xl text-center text-[10px] sm:text-xs font-bold ${
                      active
                        ? 'bg-[#EE4D2D] text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                    }`}
                  >
                    {label}
                  </div>
                );
              })}
            </div>
          </div>

          {aff.step === 1 && (
            <form onSubmit={handleStep1} className="space-y-3.5 max-w-lg">
              <div>
                <label className="block text-xs font-bold mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Masukkan nama lengkap Anda"
                  className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">No. WhatsApp / HP</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Masukkan nomor WhatsApp aktif"
                  className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Alamat Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email aktif Anda"
                  className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm"
                />
              </div>
              <button
                type="submit"
                className="min-h-[46px] px-6 rounded-xl bg-[#EE4D2D] hover:bg-[#D73B1C] text-white text-sm font-extrabold inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Lanjut ke Link Medsos</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {aff.step === 2 && (
            <form onSubmit={handleStep2} className="space-y-3.5 max-w-lg">
              <div>
                <label className="block text-xs font-bold mb-1">Platform Utama</label>
                <select
                  value={socialPlatform}
                  onChange={(e) =>
                    setSocialPlatform(
                      e.target.value as 'TikTok' | 'Instagram' | 'YouTube' | 'Facebook'
                    )
                  }
                  className="w-full h-11 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm"
                >
                  <option value="TikTok">TikTok</option>
                  <option value="Instagram">Instagram</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Facebook">Facebook</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Link Profil Media Sosial</label>
                <input
                  type="url"
                  required
                  value={socialLink}
                  onChange={(e) => setSocialLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm"
                />
              </div>
              <button
                type="submit"
                className="min-h-[46px] px-6 rounded-xl bg-[#EE4D2D] hover:bg-[#D73B1C] text-white text-sm font-extrabold inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Kirim Kode Verifikasi ke Email</span>
                <Mail className="w-4 h-4" />
              </button>
            </form>
          )}

          {aff.step === 3 && (
            <form onSubmit={handleStep3} className="space-y-3.5 max-w-lg">
              <div className="p-3.5 rounded-2xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900 text-xs">
                Kode 6 digit telah dikirim ke <strong>{aff.email}</strong>
                {sentCode ? ` (Kode Anda: ${sentCode})` : ''}.
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">
                  Masukkan Kode Verifikasi Email
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="6 digit kode verifikasi"
                  className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm tracking-widest font-bold"
                />
              </div>
              <button
                type="submit"
                className="min-h-[46px] px-6 rounded-xl bg-[#EE4D2D] text-white text-sm font-extrabold cursor-pointer"
              >
                Verifikasi Kode Email
              </button>
            </form>
          )}

          {aff.step === 4 && (
            <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-3 max-w-lg">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-extrabold text-sm">
                <Clock className="w-5 h-5" />
                <span>Menunggu Konfirmasi via Email ({aff.email})</span>
              </div>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                Sistem sedang menyinkronkan profil media sosial Anda ({aff.socialPlatform}).
                Klik tombol di bawah untuk menyelesaikan aktivasi instan.
              </p>
              <button
                type="button"
                onClick={handleCompleteStep4To5}
                className="min-h-[46px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-extrabold inline-flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Konfirmasi Aktivasi Affiliate (Langkah 5)</span>
              </button>
            </div>
          )}
        </section>
      ) : (
        <div className="space-y-6">
          {/* Active Affiliate Metrics + SVG Chart */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Total Klik Link', value: aff.clicks.toLocaleString('id-ID'), accent: 'text-zinc-900 dark:text-white' },
              { label: 'Pesanan Tervalidasi', value: `${aff.ordersCount} Pesanan`, accent: 'text-zinc-900 dark:text-white' },
              { label: 'Komisi Tersedia', value: formatRupiah(aff.availableCommission), accent: 'text-emerald-600' },
              { label: 'Sudah Dicairkan', value: formatRupiah(aff.withdrawnCommission), accent: 'text-[#EE4D2D]' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
              >
                <p className="text-xs text-zinc-500">{stat.label}</p>
                <p className={`text-lg sm:text-xl font-black mt-1 tabular-nums ${stat.accent}`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* SVG Weekly Commission Chart */}
            <section className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 inline-flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#EE4D2D]" />
                  Performa Komisi Affiliate 7 Hari Terakhir
                </h2>
                <span className="text-xs font-bold text-emerald-600">
                  Rate: 10% – 20% (Max Rp50rb)
                </span>
              </div>

              <svg
                viewBox="0 0 420 150"
                className="w-full h-40 overflow-visible"
                role="img"
                aria-label="Grafik komisi mingguan Affiliate"
              >
                {weeklyStats.map((d, i) => {
                  const barHeight = Math.round((d.val / 100) * 105);
                  const x = 18 + i * 56;
                  const y = 120 - barHeight;
                  return (
                    <g key={d.day}>
                      <rect
                        x={x}
                        y={y}
                        width={34}
                        height={barHeight}
                        rx={8}
                        fill={i === weeklyStats.length - 1 ? '#EE4D2D' : '#FB923C'}
                      />
                      <text
                        x={x + 17}
                        y={140}
                        textAnchor="middle"
                        className="fill-zinc-500 text-[11px] font-bold"
                      >
                        {d.day}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Shareable Product Links */}
              <div className="space-y-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-500">
                  Bagikan Produk Pilihan & Dapatkan Komisi Instan
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {state.products.slice(0, 4).map((p) => {
                    const est = Math.min(50000, Math.round(p.price * 0.15));
                    return (
                      <div
                        key={p.id}
                        className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2.5"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-11 h-11 rounded-xl overflow-hidden bg-zinc-100 shrink-0">
                            <ProductImage src={p.image} alt={p.name} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate text-zinc-900 dark:text-zinc-100">
                              {p.name}
                            </p>
                            <p className="text-[11px] font-extrabold text-emerald-600 tabular-nums">
                              Komisi {formatRupiah(est)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleShareProduct(p.id, p.name, p.price)}
                          className="min-h-[36px] px-3 rounded-xl bg-[#EE4D2D] text-white text-xs font-bold inline-flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Tarik Komisi + Leaderboard */}
            <aside className="space-y-4">
              <form
                onSubmit={handleWithdraw}
                className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3"
              >
                <h3 className="text-sm font-extrabold inline-flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-[#EE4D2D]" />
                  Tarik Komisi Affiliate
                </h3>
                <select
                  value={withdrawTarget}
                  onChange={(e) => setWithdrawTarget(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs font-bold"
                >
                  <option value="VTC Pay">VTC Pay (Cair Instan Bebas Admin)</option>
                  <option value="Bank BCA">Transfer Bank BCA</option>
                  <option value="Bank BRI">Transfer Bank BRI</option>
                  <option value="Bank Mandiri">Transfer Bank Mandiri</option>
                </select>
                <input
                  type="number"
                  min={10000}
                  max={aff.availableCommission}
                  value={withdrawAmt}
                  onChange={(e) => setWithdrawAmt(e.target.value)}
                  placeholder="Nominal penarikan (Rp)..."
                  className="w-full h-11 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm"
                />
                <button
                  type="submit"
                  className="w-full min-h-[44px] rounded-xl bg-[#111113] dark:bg-[#EE4D2D] text-white text-xs font-extrabold cursor-pointer"
                >
                  Cairkan Komisi Sekarang
                </button>
                {aff.history.length > 0 && (
                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-1.5 max-h-36 overflow-y-auto">
                    {aff.history.slice(0, 4).map((h) => (
                      <div key={h.id} className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-600 dark:text-zinc-400 truncate pr-2">
                          {h.label}
                        </span>
                        <span className="font-bold tabular-nums text-emerald-600">
                          {formatRupiah(h.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </form>

              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-2.5">
                <h3 className="text-sm font-extrabold inline-flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  Leaderboard Top Affiliate
                </h3>
                {LEADERBOARD.map((row) => (
                  <div
                    key={row.rank}
                    className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/70 flex items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <p className="font-extrabold">
                        #{row.rank} {row.name}
                      </p>
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                        {row.bonus}
                      </p>
                    </div>
                    <span className="font-black tabular-nums text-zinc-900 dark:text-zinc-100">
                      {formatRupiah(row.commission)}
                    </span>
                  </div>
                ))}
                {aff.joinedAt && (
                  <p className="text-[10px] text-zinc-400">
                    Bergabung: {formatDateId(aff.joinedAt)}
                  </p>
                )}
              </div>
            </aside>
          </div>
        </div>
      )}
    </div>
  );
};
