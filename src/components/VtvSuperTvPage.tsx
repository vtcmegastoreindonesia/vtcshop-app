import React, { useMemo, useState } from 'react';
import {
  Tv,
  Radio,
  Play,
  Bookmark,
  Download,
  ShoppingBag,
  Eye,
  Heart,
  Clock,
  CheckCircle2,
  Sparkles,
  Film,
  Video,
} from 'lucide-react';
import { BANNER_IMAGES, useMarketplace } from '../store/marketplaceStore';
import { TvCategory, formatRupiah } from '../types';
import { ProductImage } from './ProductImage';
import { VtcLogo } from './VtcLogo';
import { MediaPlayer } from './MediaPlayer';

interface VtvSuperTvPageProps {
  onOpenProduct: (productId: string) => void;
  onOpenCheckout: () => void;
  onGoToLiveStudio: () => void;
}

const TV_CATEGORIES: ('Semua' | TvCategory)[] = [
  'Semua',
  'VTC Live Shopping',
  'Film',
  'Sinetron',
  'Drama Korea',
  'Bola',
  'Berita',
  'Anak',
  'Musik',
];

const SOCIAL_PLATFORMS = [
  'Semua',
  'VTC Live Shopping',
  'TikTok',
  'YouTube',
  'Facebook Watch',
  'Facebook Reels',
  'Instagram Reels',
] as const;

export const VtvSuperTvPage: React.FC<VtvSuperTvPageProps> = ({
  onOpenProduct,
  onOpenCheckout,
  onGoToLiveStudio,
}) => {
  const {
    state,
    addToCart,
    toggleSaveVideo,
    toggleOfflineVideo,
    recordContinueWatching,
    triggerKeranjangKuningCommission,
    showToast,
  } = useMarketplace();

  const [subView, setSubView] = useState<'tv' | 'social' | 'saved'>('tv');
  const [selectedCategory, setSelectedCategory] = useState<'Semua' | TvCategory>('Semua');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('Semua');
  const [activeChannelId, setActiveChannelId] = useState<string>(
    state.tvChannels[0]?.id ?? ''
  );
  const [activeSocialId, setActiveSocialId] = useState<string>(
    state.socialVideos[0]?.id ?? ''
  );

  const filteredChannels = useMemo(() => {
    if (selectedCategory === 'Semua' || selectedCategory === 'VTC Live Shopping') {
      return state.tvChannels;
    }
    return state.tvChannels.filter((ch) => ch.category === selectedCategory);
  }, [state.tvChannels, selectedCategory]);

  const activeChannel = useMemo(
    () =>
      filteredChannels.find((c) => c.id === activeChannelId) ??
      filteredChannels[0] ??
      state.tvChannels[0],
    [filteredChannels, activeChannelId, state.tvChannels]
  );

  const filteredSocialVideos = useMemo(() => {
    return state.socialVideos.filter((v) => {
      const catOk =
        selectedCategory === 'Semua' || v.category === selectedCategory;
      const platOk =
        selectedPlatform === 'Semua' || v.platform === selectedPlatform;
      return catOk && platOk;
    });
  }, [state.socialVideos, selectedCategory, selectedPlatform]);

  const activeSocial = useMemo(
    () =>
      filteredSocialVideos.find((v) => v.id === activeSocialId) ??
      filteredSocialVideos[0] ??
      state.socialVideos[0],
    [filteredSocialVideos, activeSocialId, state.socialVideos]
  );

  const activeProduct = useMemo(() => {
    const pid =
      subView === 'tv' ? activeChannel?.productId : activeSocial?.productId;
    return (
      state.products.find((p) => p.id === pid) ?? state.products[0] ?? null
    );
  }, [subView, activeChannel, activeSocial, state.products]);

  const handleKeranjangKuning = (productId: string, sourceTitle: string) => {
    addToCart(productId, 1);
    triggerKeranjangKuningCommission(productId, sourceTitle);
    showToast(
      'Keranjang Kuning: Produk masuk keranjang & komisi affiliate tercatat!',
      'success'
    );
    onOpenCheckout();
  };

  const handleWatchStep = (videoId: string) => {
    setActiveSocialId(videoId);
    const current = state.continueWatching[videoId] ?? 15;
    const next = current >= 95 ? 25 : Math.min(100, current + 25);
    recordContinueWatching(videoId, next);
  };

  const savedAndOfflineVideos = useMemo(
    () =>
      state.socialVideos.filter(
        (v) =>
          state.savedVideoIds.includes(v.id) ||
          state.offlineVideoIds.includes(v.id)
      ),
    [state.socialVideos, state.savedVideoIds, state.offlineVideoIds]
  );

  return (
    <div className="space-y-5">
      {/* Hero Banner VTC SUPER TV */}
      <section className="relative rounded-3xl overflow-hidden bg-[#111113] text-white border border-zinc-800">
        {!state.liteMode && (
          <img
            src={BANNER_IMAGES.superTv}
            alt="VTC Super TV Streaming"
            className="absolute inset-0 w-full h-full object-cover opacity-35"
          />
        )}
        <div className="relative z-10 p-5 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-black/85 via-black/70 to-black/45">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <VtcLogo size="sm" showWordmark={false} />
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EE4D2D] text-[11px] font-extrabold uppercase tracking-wider">
                <Tv className="w-3.5 h-3.5" />
                VTC SUPER TV STREAMING · HLS LIVE
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black tracking-tight">
              12 TV Nasional Live Streaming, TikTok, YouTube & IG dalam 1 Tempat
            </h1>
            <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
              Siaran TV Nasional langsung dengan HLS (.m3u8), kontrol suara lengkap, mode layar penuh,
              jadwal acara WIB, simpan video offline, dan checkout Keranjang Kuning instan.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              type="button"
              onClick={onGoToLiveStudio}
              className="min-h-[44px] px-4 rounded-xl bg-[#FF6A00] hover:bg-[#E05E00] text-white text-xs sm:text-sm font-extrabold inline-flex items-center gap-2 cursor-pointer"
            >
              <Radio className="w-4 h-4" />
              <span>Buka TikTok / YT / IG Shop</span>
            </button>
          </div>
        </div>
      </section>

      {/* Sub-navigation Tabs */}
      <div className="grid grid-cols-3 gap-2 bg-white dark:bg-zinc-900 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => setSubView('tv')}
          className={`min-h-[44px] px-3 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer ${
            subView === 'tv'
              ? 'bg-[#EE4D2D] text-white'
              : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
          }`}
        >
          <Tv className="w-4 h-4" />
          <span>12 TV Nasional ({state.tvChannels.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setSubView('social')}
          className={`min-h-[44px] px-3 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer ${
            subView === 'social'
              ? 'bg-[#111113] dark:bg-[#EE4D2D] text-white'
              : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Sosmed & Reels ({state.socialVideos.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setSubView('saved')}
          className={`min-h-[44px] px-3 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer ${
            subView === 'saved'
              ? 'bg-[#111113] dark:bg-[#EE4D2D] text-white'
              : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Tersimpan & Offline ({savedAndOfflineVideos.length})</span>
        </button>
      </div>

      {/* Category Strip */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {TV_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`min-h-[38px] px-3.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#EE4D2D] text-white'
                : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ---------------- TAB 1: 12 TV NASIONAL LIVE HLS ---------------- */}
      {subView === 'tv' && activeChannel && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          {/* Active Real HLS TV Stage */}
          <section className="lg:col-span-2 bg-[#111113] text-white rounded-3xl overflow-hidden border border-zinc-800">
            <MediaPlayer
              key={activeChannel.id}
              src={activeChannel.streamUrl}
              fallbackSrc={
                activeChannel.fallbackStreamUrl ||
                'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
              }
              poster={BANNER_IMAGES.superTv}
              isLive
              autoPlay
              badgeText={`${activeChannel.name} · ${activeChannel.category} · ${activeChannel.viewerCount.toLocaleString('id-ID')} penonton`}
              title={`${activeChannel.name} — ${activeChannel.currentShow}`}
              className="rounded-none"
            />

            <div className="px-4 py-3 bg-zinc-950 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-[#FF6A00]">
                  Sedang Tayang di {activeChannel.name}
                </p>
                <h2 className="text-sm sm:text-base font-extrabold text-white truncate">
                  {activeChannel.currentShow}
                </h2>
                <p className="text-[11px] text-zinc-400">
                  Berikutnya: {activeChannel.nextShow}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-200 text-[11px] font-bold inline-flex items-center gap-1.5 tabular-nums">
                <Eye className="w-3.5 h-3.5 text-[#FF6A00]" />
                {activeChannel.viewerCount.toLocaleString('id-ID')} menonton
              </span>
            </div>

            {/* Keranjang Kuning Bar on TV */}
            {activeProduct && (
              <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onOpenProduct(activeProduct.id)}
                  className="flex items-center gap-3 min-w-0 text-left cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                    <ProductImage
                      src={activeProduct.image}
                      alt={activeProduct.name}
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-400">
                      <Sparkles className="w-3 h-3" />
                      Keranjang Kuning TV · Komisi Affiliate 15%
                    </span>
                    <p className="text-sm font-bold text-white truncate">
                      {activeProduct.name}
                    </p>
                    <p className="text-sm font-extrabold text-[#EE4D2D] tabular-nums">
                      {formatRupiah(activeProduct.price)}
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleKeranjangKuning(activeProduct.id, activeChannel.name)
                  }
                  className="min-h-[46px] px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs sm:text-sm font-extrabold inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Checkout Keranjang Kuning</span>
                </button>
              </div>
            )}
          </section>

          {/* Jadwal Acara Channel Ini */}
          <aside className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 inline-flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#EE4D2D]" />
                Jadwal Acara {activeChannel.name}
              </h3>
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                WIB Live
              </span>
            </div>
            <div className="space-y-2">
              {activeChannel.schedules.map((sch, idx) => (
                <div
                  key={`${sch.time}-${idx}`}
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                    idx === 0
                      ? 'bg-orange-50 dark:bg-orange-950/30 border-[#EE4D2D] text-zinc-900 dark:text-zinc-100'
                      : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="font-bold truncate">{sch.program}</p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 tabular-nums">
                      {sch.time} WIB
                    </p>
                  </div>
                  {idx === 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-[#EE4D2D] text-white text-[10px] font-extrabold shrink-0">
                      TAYANG
                    </span>
                  )}
                </div>
              ))}
            </div>
          </aside>

          {/* 12 TV Channel Grid */}
          <section className="lg:col-span-3 space-y-3">
            <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
              Pilih 12 Saluran TV Nasional Live ({filteredChannels.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {filteredChannels.map((ch) => {
                const selected = ch.id === activeChannel.id;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setActiveChannelId(ch.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-colors cursor-pointer ${
                      selected
                        ? 'border-[#EE4D2D] bg-orange-50/70 dark:bg-orange-950/40'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                        {ch.name}
                      </span>
                      <span className="w-2 h-2 rounded-full bg-[#EE4D2D]" />
                    </div>
                    <p className="text-[11px] font-semibold text-[#EE4D2D]">
                      {ch.category}
                    </p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-1 mt-0.5">
                      {ch.currentShow}
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-1 tabular-nums">
                      {ch.viewerCount.toLocaleString('id-ID')} penonton
                    </p>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* ---------------- TAB 2: SOCIAL AGGREGATOR WITH REAL VIDEO PLAYER ---------------- */}
      {subView === 'social' && (
        <div className="space-y-4">
          {activeSocial && (
            <section className="bg-[#111113] text-white rounded-3xl overflow-hidden border border-zinc-800 grid grid-cols-1 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <MediaPlayer
                  key={activeSocial.id}
                  src={activeSocial.videoUrl || '/videos/vtc-short-tiktok.mp4'}
                  fallbackSrc="/videos/vtc-product-demo.mp4"
                  poster={activeSocial.thumbnail}
                  autoPlay
                  loop
                  badgeText={`${activeSocial.platform} · ${activeSocial.creator}`}
                  title={activeSocial.title}
                  className="rounded-none"
                />
              </div>
              <div className="p-4 sm:p-5 flex flex-col justify-between gap-4 bg-zinc-900">
                <div className="space-y-2">
                  <span className="inline-block px-2.5 py-1 rounded-lg bg-[#EE4D2D] text-[11px] font-extrabold">
                    {activeSocial.platform} · {activeSocial.category}
                  </span>
                  <h2 className="text-base font-extrabold leading-snug">
                    {activeSocial.title}
                  </h2>
                  <p className="text-xs text-zinc-400">{activeSocial.creator}</p>
                </div>

                {activeProduct && (
                  <div className="rounded-2xl bg-zinc-800/90 border border-zinc-700 p-3 space-y-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-700 shrink-0">
                        <ProductImage src={activeProduct.image} alt={activeProduct.name} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white line-clamp-1">
                          {activeProduct.name}
                        </p>
                        <p className="text-sm font-extrabold text-[#FF6A00] tabular-nums">
                          {formatRupiah(activeProduct.price)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleKeranjangKuning(activeProduct.id, activeSocial.title)
                      }
                      className="w-full min-h-[42px] rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-extrabold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Beli Lewat Keranjang Kuning</span>
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {SOCIAL_PLATFORMS.map((plat) => (
              <button
                key={plat}
                type="button"
                onClick={() => setSelectedPlatform(plat)}
                className={`min-h-[36px] px-3 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedPlatform === plat
                    ? 'bg-[#111113] dark:bg-white text-white dark:text-zinc-900'
                    : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                {plat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSocialVideos.map((vid) => {
              const prod = state.products.find((p) => p.id === vid.productId);
              const saved = state.savedVideoIds.includes(vid.id);
              const offline = state.offlineVideoIds.includes(vid.id);
              const watchPct = state.continueWatching[vid.id] ?? 0;
              return (
                <article
                  key={vid.id}
                  onClick={() => setActiveSocialId(vid.id)}
                  className={`rounded-3xl overflow-hidden border bg-white dark:bg-zinc-900 flex flex-col justify-between cursor-pointer ${
                    activeSocial?.id === vid.id
                      ? 'border-[#EE4D2D] ring-2 ring-[#EE4D2D]/20'
                      : 'border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  <div>
                    <div className="relative aspect-video bg-zinc-900">
                      <img
                        src={vid.thumbnail}
                        alt={vid.title}
                        className="w-full h-full object-cover opacity-80"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/45" />
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 text-[11px] font-bold text-white">
                        <span className="px-2 py-0.5 rounded-md bg-[#EE4D2D]">
                          {vid.platform}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-black/65 tabular-nums">
                          {vid.duration}
                        </span>
                      </div>

                      <div className="absolute bottom-2.5 left-3 right-3 text-white space-y-1">
                        <span className="text-[11px] font-bold text-orange-300">
                          {vid.category} · {vid.creator}
                        </span>
                        <h3 className="text-sm font-extrabold leading-snug line-clamp-2">
                          {vid.title}
                        </h3>
                      </div>
                    </div>

                    {watchPct > 0 && (
                      <div className="px-3.5 pt-2.5 space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold text-[#EE4D2D] tabular-nums">
                          <span>Lanjut Nonton</span>
                          <span>{watchPct}%</span>
                        </div>
                        <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#EE4D2D] rounded-full"
                            style={{ width: `${watchPct}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-3.5 space-y-3">
                    <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {vid.views.toLocaleString('id-ID')}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-[#EE4D2D]" />
                        {vid.likes.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWatchStep(vid.id);
                        }}
                        className="min-h-[38px] rounded-xl bg-zinc-900 dark:bg-zinc-800 text-white text-[11px] font-bold inline-flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>{watchPct > 0 ? 'Lanjut' : 'Putar'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaveVideo(vid.id);
                        }}
                        className={`min-h-[38px] rounded-xl text-[11px] font-bold inline-flex items-center justify-center gap-1 cursor-pointer ${
                          saved
                            ? 'bg-orange-100 text-[#EE4D2D]'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200'
                        }`}
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>{saved ? 'Disimpan' : 'Simpan'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleOfflineVideo(vid.id);
                        }}
                        className={`min-h-[38px] rounded-xl text-[11px] font-bold inline-flex items-center justify-center gap-1 cursor-pointer ${
                          offline
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200'
                        }`}
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{offline ? 'Offline' : 'Unduh'}</span>
                      </button>
                    </div>

                    {prod && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleKeranjangKuning(prod.id, vid.title);
                        }}
                        className="w-full min-h-[42px] px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-extrabold flex items-center justify-between gap-2 cursor-pointer"
                      >
                        <span className="inline-flex items-center gap-1.5 truncate">
                          <ShoppingBag className="w-4 h-4 shrink-0" />
                          <span className="truncate">Keranjang Kuning: {prod.name}</span>
                        </span>
                        <span className="tabular-nums shrink-0">
                          {formatRupiah(prod.price)}
                        </span>
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------- TAB 3: TERSIMPAN & OFFLINE ---------------- */}
      {subView === 'saved' && (
        <div className="space-y-3">
          {savedAndOfflineVideos.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 text-center space-y-2">
              <Video className="w-8 h-8 text-zinc-300 mx-auto" />
              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                Belum ada video tersimpan atau unduhan offline
              </p>
              <p className="text-xs text-zinc-500">
                Buka tab Sosmed & Reels lalu tekan tombol Simpan atau Unduh Offline.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedAndOfflineVideos.map((vid) => {
                const isOffline = state.offlineVideoIds.includes(vid.id);
                return (
                  <div
                    key={vid.id}
                    className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3"
                  >
                    <MediaPlayer
                      src={vid.videoUrl || '/videos/vtc-product-demo.mp4'}
                      poster={vid.thumbnail}
                      badgeText={vid.platform}
                      title={vid.title}
                    />
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2">
                        {vid.title}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {isOffline ? 'Siap Tonton Offline' : 'Video Tersimpan'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleWatchStep(vid.id)}
                        className="min-h-[34px] px-3 rounded-lg bg-[#EE4D2D] text-white font-bold cursor-pointer"
                      >
                        Progres ({state.continueWatching[vid.id] ?? 10}%)
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
