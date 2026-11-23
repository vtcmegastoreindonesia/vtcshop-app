import React, { useMemo, useState } from 'react';
import {
  Coins,
  Crown,
  Gift,
  Sprout,
  Smartphone,
  HelpCircle,
  Disc3,
  Ticket,
  CheckCircle2,
} from 'lucide-react';
import { useMarketplace } from '../store/marketplaceStore';
import { computeVipTier, formatRupiah } from '../types';
import { ProductImage } from './ProductImage';

export const GamesVipHubPage: React.FC = () => {
  const {
    state,
    claimDailyCoins,
    playGameTanam,
    playGameGoyang,
    playGameTebakHarga,
    playGameRodaPutar,
  } = useMarketplace();

  const [voucherTab, setVoucherTab] = useState<'all' | 'store' | 'vtc' | 'shipping' | 'cashback'>('all');
  const [wheelAngle, setWheelAngle] = useState(0);
  const [guessIdx, setGuessIdx] = useState(0);

  const totalSpent = useMemo(
    () =>
      state.orders
        .filter((o) => o.status !== 'Dana Dikembalikan')
        .reduce((sum, o) => sum + o.totalAmount, 0),
    [state.orders]
  );

  const vip = computeVipTier(totalSpent);

  const filteredVouchers = useMemo(() => {
    if (voucherTab === 'all') return state.vouchers;
    return state.vouchers.filter((v) => {
      if (voucherTab === 'shipping') return v.type === 'shipping' || v.category === 'shipping';
      if (voucherTab === 'store') return v.category === 'store' || Boolean(v.sellerId);
      if (voucherTab === 'cashback') return v.category === 'cashback';
      return v.category === 'vtc' || (!v.sellerId && v.type === 'discount');
    });
  }, [state.vouchers, voucherTab]);

  // Tebak Harga question from real catalog products
  const guessProduct = state.products[guessIdx % state.products.length];
  const priceOptions = useMemo(() => {
    if (!guessProduct) return [];
    const exact = guessProduct.price;
    const alt1 = Math.round(exact * 1.35 / 1000) * 1000;
    const alt2 = Math.max(15000, Math.round(exact * 0.7 / 1000) * 1000);
    return [alt2, exact, alt1].sort((a, b) => a - b);
  }, [guessProduct]);

  const handleSpinWheel = () => {
    if (state.rodaSpinsLeft <= 0) {
      playGameRodaPutar();
      return;
    }
    setWheelAngle((prev) => prev + 720 + Math.floor(Math.random() * 360));
    playGameRodaPutar();
  };

  return (
    <div className="space-y-6">
      {/* VIP Membership + Coins Banner */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-3xl bg-[#111113] text-white p-5 sm:p-6 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-400 text-zinc-950 text-xs font-black uppercase">
              <Crown className="w-4 h-4" />
              VTC VIP Member · {vip.tier}
            </span>
            <span className="text-xs text-zinc-400 tabular-nums">
              Total Belanja: {formatRupiah(totalSpent)}
            </span>
          </div>
          <p className="text-sm font-bold text-orange-200">{vip.perk}</p>
          {vip.nextTier ? (
            <div className="space-y-1.5">
              <p className="text-xs text-zinc-300 tabular-nums">
                Belanja {formatRupiah(vip.remaining)} lagi untuk naik ke{' '}
                <strong>{vip.nextTier}</strong>
              </p>
              <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-amber-400"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(12, Math.round((totalSpent / (totalSpent + vip.remaining)) * 100))
                    )}%`,
                  }}
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-amber-400 font-bold">
              Level Tertinggi Tercapai! Nikmati semua prioritas eksklusif Diamond.
            </p>
          )}
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-[#EE4D2D] to-[#C83214] text-white p-5 sm:p-6 flex flex-col justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-orange-100 uppercase">
              Saldo VTC Coins (1 Koin = Rp 1)
            </p>
            <p className="text-3xl font-black tabular-nums mt-1 inline-flex items-center gap-2">
              <Coins className="w-7 h-7 text-amber-300" />
              {state.vtvCoins.toLocaleString('id-ID')}
            </p>
          </div>
          <button
            type="button"
            onClick={claimDailyCoins}
            className="w-full min-h-[44px] rounded-xl bg-white text-[#EE4D2D] text-xs font-extrabold cursor-pointer"
          >
            Check-In Harian (+500 Koin)
          </button>
        </div>
      </section>

      {/* 4 Mini Games */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-zinc-100 inline-flex items-center gap-2">
          <Gift className="w-5 h-5 text-[#EE4D2D]" />
          4 Mini-Games Berhadiah Koin & Voucher
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Game 1: VTC Tanam */}
          <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between gap-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                  <Sprout className="w-5 h-5" />
                </span>
                <span className="text-xs font-extrabold text-emerald-600 tabular-nums">
                  {state.tanamProgress}%
                </span>
              </div>
              <h3 className="text-sm font-extrabold">VTC Tanam</h3>
              <p className="text-xs text-zinc-500">
                Siram pohon koin hingga 100% dan panen +1.500 Koin!
              </p>
              <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all"
                  style={{ width: `${state.tanamProgress}%` }}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={playGameTanam}
              className="w-full min-h-[42px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold cursor-pointer"
            >
              {state.tanamProgress >= 100 ? 'Panen +1.500 Koin!' : 'Siram (+25% & 100 Koin)'}
            </button>
          </div>

          {/* Game 2: Goyang Koin */}
          <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between gap-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-[#EE4D2D] flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </span>
                <span className="text-xs font-bold text-zinc-500 tabular-nums">
                  {state.goyangCountToday}x hari ini
                </span>
              </div>
              <h3 className="text-sm font-extrabold">Goyang Koin</h3>
              <p className="text-xs text-zinc-500">
                Ketuk atau goyangkan HP untuk menjatuhkan hujan koin hingga +400 Koin!
              </p>
            </div>
            <button
              type="button"
              onClick={() => playGameGoyang()}
              className="w-full min-h-[42px] rounded-xl bg-[#EE4D2D] hover:bg-[#D73B1C] text-white text-xs font-extrabold cursor-pointer"
            >
              Goyang Sekarang!
            </button>
          </div>

          {/* Game 3: Tebak Harga */}
          <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between gap-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-extrabold">Tebak Harga</h3>
                  <p className="text-[11px] text-zinc-500">Benar = +500 Koin</p>
                </div>
              </div>
              {guessProduct && (
                <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/70">
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                    <ProductImage src={guessProduct.image} alt={guessProduct.name} />
                  </div>
                  <p className="text-[11px] font-bold line-clamp-2">{guessProduct.name}</p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {priceOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    playGameTebakHarga(opt === guessProduct?.price);
                    setGuessIdx((i) => i + 1);
                  }}
                  className="min-h-[34px] px-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-[#EE4D2D] hover:text-white text-xs font-bold tabular-nums cursor-pointer"
                >
                  {formatRupiah(opt)}
                </button>
              ))}
            </div>
          </div>

          {/* Game 4: Roda Putar */}
          <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between gap-3">
            <div className="space-y-2 text-center">
              <div className="flex items-center justify-between text-left">
                <h3 className="text-sm font-extrabold">Roda Putar</h3>
                <span className="text-xs font-bold text-[#EE4D2D] tabular-nums">
                  Sisa {state.rodaSpinsLeft}x
                </span>
              </div>
              <div className="py-2 flex justify-center">
                <Disc3
                  className="w-16 h-16 text-[#EE4D2D] transition-transform duration-700"
                  style={{ transform: `rotate(${wheelAngle}deg)` }}
                />
              </div>
              <p className="text-xs text-zinc-500">Hadiah utama s/d 2.500 Koin!</p>
            </div>
            <button
              type="button"
              onClick={handleSpinWheel}
              className="w-full min-h-[42px] rounded-xl bg-[#111113] dark:bg-[#EE4D2D] text-white text-xs font-extrabold cursor-pointer"
            >
              Putar Roda ({state.rodaSpinsLeft})
            </button>
          </div>
        </div>
      </section>

      {/* Voucher Saya by Category */}
      <section className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-extrabold inline-flex items-center gap-2">
            <Ticket className="w-5 h-5 text-[#EE4D2D]" />
            Dompet Voucher Saya ({filteredVouchers.length})
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'vtc', label: 'Voucher VTC' },
              { id: 'shipping', label: 'Gratis Ongkir' },
              { id: 'store', label: 'Voucher Toko' },
              { id: 'cashback', label: 'Cashback' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() =>
                  setVoucherTab(t.id as 'all' | 'store' | 'vtc' | 'shipping' | 'cashback')
                }
                className={`min-h-[34px] px-3 rounded-lg text-xs font-bold cursor-pointer ${
                  voucherTab === t.id
                    ? 'bg-[#EE4D2D] text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredVouchers.map((v) => (
            <div
              key={v.code}
              className={`p-3.5 rounded-2xl border flex items-center justify-between gap-2 ${
                v.used
                  ? 'opacity-50 border-zinc-200 dark:border-zinc-800'
                  : 'border-orange-200 dark:border-orange-900 bg-orange-50/40 dark:bg-orange-950/20'
              }`}
            >
              <div className="min-w-0">
                <p className="text-xs font-black text-[#EE4D2D]">{v.code}</p>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  {v.title}
                </p>
                <p className="text-[11px] text-zinc-500 tabular-nums">
                  Min. belanja {formatRupiah(v.minSpend)}
                </p>
              </div>
              <span className="text-[11px] font-bold inline-flex items-center gap-1 shrink-0 text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {v.used ? 'Terpakai' : 'Aktif'}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
