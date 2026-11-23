import React, { useState } from 'react';
import {
  Gamepad2,
  Smartphone,
  Tv,
  Wallet,
  Plane,
  CheckCircle2,
  Coins,
  Tag,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { useMarketplace } from '../store/marketplaceStore';
import { PAYMENT_METHODS, PaymentMethodId, TopUpOrder, formatDateId, formatRupiah } from '../types';

type HubCategory = TopUpOrder['category'];

const GAME_CATALOG = [
  {
    id: 'ml',
    name: 'Mobile Legends (MLBB)',
    needsZone: true,
    items: [
      { label: '86 Diamonds', price: 22000 },
      { label: '172 Diamonds', price: 43000 },
      { label: '257 Diamonds', price: 65000 },
      { label: 'Weekly Diamond Pass', price: 27000 },
    ],
  },
  {
    id: 'ff',
    name: 'Free Fire (FF Diamond)',
    needsZone: false,
    items: [
      { label: '140 Diamonds', price: 19500 },
      { label: '355 Diamonds', price: 48000 },
      { label: '720 Diamonds', price: 96000 },
    ],
  },
  {
    id: 'pubg',
    name: 'PUBG Mobile (UC)',
    needsZone: false,
    items: [
      { label: '60 UC Global', price: 15000 },
      { label: '325 UC + Bonus', price: 75000 },
      { label: '660 UC + Bonus', price: 149000 },
    ],
  },
  {
    id: 'genshin',
    name: 'Genshin Impact (Genesis Crystal)',
    needsZone: true,
    items: [
      { label: 'Blessing Welkin Moon', price: 72000 },
      { label: '300 Genesis Crystal', price: 75000 },
      { label: '980 Genesis Crystal', price: 235000 },
    ],
  },
  {
    id: 'hsr',
    name: 'Honkai: Star Rail (Oneiric Shard)',
    needsZone: true,
    items: [
      { label: 'Express Supply Pass', price: 72000 },
      { label: '300 Oneiric Shards', price: 75000 },
    ],
  },
  {
    id: 'valorant',
    name: 'Valorant (VP Riot ID)',
    needsZone: false,
    items: [
      { label: '475 Valorant Points', price: 54000 },
      { label: '1000 Valorant Points', price: 108000 },
      { label: '2050 Valorant Points', price: 215000 },
    ],
  },
  {
    id: 'roblox',
    name: 'Roblox (Robux Voucher)',
    needsZone: false,
    items: [
      { label: '400 Robux Resmi', price: 74000 },
      { label: '800 Robux Resmi', price: 145000 },
    ],
  },
];

const PPOB_CATALOG = [
  { id: 'pulsa', name: 'Pulsa All Operator (Telkomsel/XL/Indosat/Tri)', items: [{ label: 'Pulsa Rp 25.000', price: 25500 }, { label: 'Pulsa Rp 50.000', price: 50000 }, { label: 'Pulsa Rp 100.000', price: 98500 }] },
  { id: 'data', name: 'Paket Data Internet Harian & Bulanan', items: [{ label: 'Kuota 15GB / 30 Hari', price: 55000 }, { label: 'Kuota 50GB / 30 Hari', price: 115000 }] },
  { id: 'pln', name: 'Token Listrik PLN Prabayar', items: [{ label: 'Token PLN Rp 50.000', price: 51500 }, { label: 'Token PLN Rp 100.000', price: 101500 }, { label: 'Token PLN Rp 200.000', price: 201500 }] },
  { id: 'pdam', name: 'Tagihan Air PDAM Nusantara', items: [{ label: 'Bayar Tagihan PDAM Bulan Ini', price: 85000 }] },
  { id: 'bpjs', name: 'Iuran BPJS Kesehatan', items: [{ label: 'Kelas 1 / Keluarga', price: 150000 }, { label: 'Kelas 2 / Mandiri', price: 100000 }] },
];

const HIBURAN_CATALOG = [
  { id: 'netflix', name: 'Netflix Premium Private/Sharing', items: [{ label: 'Netflix 1 Bulan Ultra HD', price: 54000 }, { label: 'Netflix 3 Bulan Family', price: 155000 }] },
  { id: 'yt', name: 'YouTube Premium Tanpa Iklan', items: [{ label: 'YouTube Premium 1 Bulan', price: 45000 }, { label: 'YouTube Family 1 Bulan', price: 79000 }] },
  { id: 'spotify', name: 'Spotify Premium Hi-Fi', items: [{ label: 'Spotify Individual 1 Bulan', price: 39000 }, { label: 'Spotify Duo 1 Bulan', price: 55000 }] },
];

const EWALLET_CATALOG = [
  { id: 'gopay', name: 'Top Up Saldo GoPay', items: [{ label: 'GoPay Rp 50.000', price: 51000 }, { label: 'GoPay Rp 100.000', price: 101000 }, { label: 'GoPay Rp 250.000', price: 251000 }] },
  { id: 'ovo', name: 'Top Up Saldo OVO Cash', items: [{ label: 'OVO Rp 50.000', price: 51000 }, { label: 'OVO Rp 100.000', price: 101000 }] },
  { id: 'dana', name: 'Top Up Saldo DANA', items: [{ label: 'DANA Rp 50.000', price: 50500 }, { label: 'DANA Rp 100.000', price: 100500 }] },
];

const TRAVEL_CATALOG = [
  { id: 'kereta', name: 'Tiket Kereta Api KAI Resmi', items: [{ label: 'Jakarta – Bandung Argo Parahyangan', price: 150000 }, { label: 'Jakarta – Surabaya Eksekutif', price: 420000 }] },
  { id: 'pesawat', name: 'Tiket Pesawat Domestik & Internasional', items: [{ label: 'CGK → DPS (Bali) Ekonomi', price: 695000 }, { label: 'CGK → SUB (Surabaya)', price: 580000 }] },
  { id: 'hotel', name: 'Voucher Hotel Bintang 4 & 5', items: [{ label: 'Staycation 1 Malam City Hotel', price: 385000 }] },
  { id: 'bioskop', name: 'Tiket Bioskop XXI / CGV', items: [{ label: '2 Tiket Reguler + Popcorn', price: 110000 }] },
];

export const TopUpGameHub: React.FC<{ initialTab?: HubCategory }> = ({
  initialTab = 'game',
}) => {
  const { state, placeTopUpOrder, showToast } = useMarketplace();
  const [tab, setTab] = useState<HubCategory>(initialTab);
  const [selectedServiceIdx, setSelectedServiceIdx] = useState(0);
  const [selectedItemIdx, setSelectedItemIdx] = useState(0);

  React.useEffect(() => {
    setTab(initialTab);
    setSelectedServiceIdx(0);
    setSelectedItemIdx(0);
  }, [initialTab]);

  // Empty initial form inputs!
  const [targetId, setTargetId] = useState('');
  const [serverZone, setServerZone] = useState('');
  const [checkedNickname, setCheckedNickname] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>('VTCPay');
  const [usePromo10, setUsePromo10] = useState(true);

  const catalog =
    tab === 'game'
      ? GAME_CATALOG
      : tab === 'ppob'
        ? PPOB_CATALOG
        : tab === 'hiburan'
          ? HIBURAN_CATALOG
          : tab === 'ewallet'
            ? EWALLET_CATALOG
            : TRAVEL_CATALOG;

  const activeService = catalog[selectedServiceIdx] ?? catalog[0];
  const activeItem =
    activeService.items[selectedItemIdx] ?? activeService.items[0];
  const discountAmt = usePromo10 ? Math.round(activeItem.price * 0.1) : 0;
  const finalPrice = Math.max(0, activeItem.price - discountAmt);
  const cashbackEst = Math.max(100, Math.round(finalPrice * 0.05));

  const handleTabSwitch = (nextTab: HubCategory) => {
    setTab(nextTab);
    setSelectedServiceIdx(0);
    setSelectedItemIdx(0);
    setCheckedNickname('');
  };

  const handleCheckGameId = () => {
    const clean = targetId.trim();
    if (!clean) {
      showToast('Masukkan ID Game / Nomor tujuan terlebih dahulu', 'warning');
      return;
    }
    const zoneTag = serverZone.trim() ? ` (${serverZone.trim()})` : '';
    const verifiedName = `VTC_Player_${clean.slice(-4).toUpperCase()}${zoneTag}`;
    setCheckedNickname(verifiedName);
    showToast(`ID Terverifikasi: ${verifiedName}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId.trim()) {
      showToast('Isi ID Game / Nomor Tujuan terlebih dahulu', 'warning');
      return;
    }
    placeTopUpOrder({
      category: tab,
      serviceName: activeService.name,
      targetId: targetId.trim(),
      serverZone: serverZone.trim() || undefined,
      nickname: checkedNickname || undefined,
      itemLabel: activeItem.label,
      price: activeItem.price,
      paymentMethod,
      usePromo10,
    });
    setTargetId('');
    setServerZone('');
    setCheckedNickname('');
  };

  const payOptions = PAYMENT_METHODS.filter((p) =>
    ['VTCPay', 'PayLater', 'QRIS', 'BCA', 'BRI', 'Mandiri', 'Pulsa', 'DANA', 'OVO', 'GoPay'].includes(
      p.id
    )
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <section className="rounded-3xl bg-[#111113] text-white p-5 sm:p-6 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EE4D2D] text-[11px] font-extrabold uppercase">
            <Gamepad2 className="w-3.5 h-3.5" />
            TOP UP GAME, PPOB, HIBURAN & TRAVEL RESMI
          </span>
          <h1 className="text-xl sm:text-2xl font-black">
            Masuk 1 Detik · Voucher Diskon 10% + Cashback Koin 5%
          </h1>
          <p className="text-xs text-zinc-300">
            Saldo VTC Pay Anda:{' '}
            <strong className="text-white tabular-nums">
              {formatRupiah(state.vtvpayBalance)}
            </strong>{' '}
            · VTC Coins:{' '}
            <strong className="text-amber-400 tabular-nums">
              {state.vtvCoins.toLocaleString('id-ID')} Koin
            </strong>
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold shrink-0">
          <ShieldCheck className="w-4 h-4" />
          <span>Resmi & Instan 24 Jam</span>
        </div>
      </section>

      {/* 5 Sub-Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {[
          { id: 'game' as HubCategory, label: 'Top Up Game', icon: Gamepad2 },
          { id: 'ppob' as HubCategory, label: 'Pulsa & Tagihan', icon: Smartphone },
          { id: 'hiburan' as HubCategory, label: 'Netflix & Hiburan', icon: Tv },
          { id: 'ewallet' as HubCategory, label: 'Top Up E-Wallet', icon: Wallet },
          { id: 'travel' as HubCategory, label: 'Tiket Travel', icon: Plane },
        ].map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleTabSwitch(item.id)}
              className={`min-h-[46px] px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                active
                  ? 'bg-[#EE4D2D] border-[#EE4D2D] text-white'
                  : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-5"
        >
          {/* Step 1: Pilih Layanan */}
          <div className="space-y-2.5">
            <h2 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
              1. Pilih Layanan
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {catalog.map((svc, idx) => (
                <button
                  key={svc.id}
                  type="button"
                  onClick={() => {
                    setSelectedServiceIdx(idx);
                    setSelectedItemIdx(0);
                    setCheckedNickname('');
                  }}
                  className={`p-3 rounded-2xl border text-left text-xs font-bold cursor-pointer ${
                    selectedServiceIdx === idx
                      ? 'border-[#EE4D2D] bg-orange-50/70 dark:bg-orange-950/30 text-[#EE4D2D]'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200'
                  }`}
                >
                  {svc.name}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Masukkan ID + Server + Cek ID Otomatis */}
          <div className="space-y-2.5">
            <h2 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
              2. Masukkan{' '}
              {tab === 'game'
                ? 'ID Game & Zone/Server'
                : tab === 'ppob'
                  ? 'Nomor HP / ID Pelanggan PLN / PDAM / BPJS'
                  : tab === 'travel'
                    ? 'Nama Penumpang & No. HP'
                    : 'Nomor HP / Email Akun'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <input
                type="text"
                required
                value={targetId}
                onChange={(e) => {
                  setTargetId(e.target.value);
                  setCheckedNickname('');
                }}
                placeholder={
                  tab === 'game'
                    ? 'Masukkan ID Game...'
                    : 'Masukkan nomor / email tujuan...'
                }
                className="sm:col-span-2 h-12 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:border-[#EE4D2D]"
              />
              {tab === 'game' && (
                <input
                  type="text"
                  value={serverZone}
                  onChange={(e) => setServerZone(e.target.value)}
                  placeholder="Zone / Server (Opsional)"
                  className="h-12 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:border-[#EE4D2D]"
                />
              )}
            </div>

            {tab === 'game' && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCheckGameId}
                  className="min-h-[40px] px-3.5 rounded-xl bg-zinc-900 dark:bg-zinc-800 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Cek ID Otomatis</span>
                </button>
                {checkedNickname && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Akun Terverifikasi: {checkedNickname}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Step 3: Pilih Nominal / Paket */}
          <div className="space-y-2.5">
            <h2 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
              3. Pilih Nominal / Paket
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {activeService.items.map((item, idx) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setSelectedItemIdx(idx)}
                  className={`p-3.5 rounded-2xl border text-left flex items-center justify-between gap-2 cursor-pointer ${
                    selectedItemIdx === idx
                      ? 'border-[#EE4D2D] bg-orange-50/70 dark:bg-orange-950/30'
                      : 'border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {item.label}
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-[#EE4D2D] tabular-nums">
                    {formatRupiah(item.price)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 4: Voucher Diskon 10% + Pembayaran */}
          <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <label className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900 cursor-pointer">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                <Tag className="w-4 h-4 text-[#EE4D2D]" />
                <span>Pakai Voucher Diskon 10% + Cashback Koin 5%</span>
              </div>
              <input
                type="checkbox"
                checked={usePromo10}
                onChange={(e) => setUsePromo10(e.target.checked)}
                className="w-5 h-5 accent-[#EE4D2D]"
              />
            </label>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Metode Pembayaran
              </label>
              <select
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(e.target.value as PaymentMethodId)
                }
                className="w-full h-12 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm font-semibold"
              >
                {payOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5 text-xs">
                <p className="text-zinc-500 dark:text-zinc-400">
                  Total Bayar ({activeItem.label})
                </p>
                <p className="text-xl font-black text-[#EE4D2D] tabular-nums">
                  {formatRupiah(finalPrice)}
                </p>
                <p className="text-emerald-600 dark:text-emerald-400 font-bold inline-flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5" />
                  Dapat +{cashbackEst} Koin Cashback
                </p>
              </div>
              <button
                type="submit"
                className="min-h-[48px] px-6 rounded-xl bg-[#EE4D2D] hover:bg-[#D73B1C] text-white text-sm font-extrabold cursor-pointer"
              >
                Bayar & Kirim Instan
              </button>
            </div>
          </div>
        </form>

        {/* Order History */}
        <aside className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
          <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
            Riwayat Transaksi Top Up ({state.topUpOrders.length})
          </h3>
          {state.topUpOrders.length === 0 ? (
            <p className="text-xs text-zinc-500 py-6 text-center">
              Belum ada transaksi Top Up Game, Pulsa, Hiburan, atau Tiket Travel.
            </p>
          ) : (
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {state.topUpOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-zinc-900 dark:text-zinc-100">
                      {ord.serviceName}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                      {ord.status}
                    </span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-300">
                    {ord.itemLabel} → <strong>{ord.nickname || ord.targetId}</strong>
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
                    <span className="tabular-nums">{formatDateId(ord.createdAt)}</span>
                    <span className="font-extrabold text-[#EE4D2D] tabular-nums">
                      {formatRupiah(ord.price)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
