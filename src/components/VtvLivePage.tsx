import React, { useEffect, useMemo, useState } from 'react';
import {
  Radio,
  Video,
  Heart,
  MessageCircle,
  ShoppingBag,
  Plus,
  X,
  Eye,
  Send,
  Instagram,
  Youtube,
  Camera,
  UserPlus,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from 'lucide-react';
import { useMarketplace } from '../store/marketplaceStore';
import { LivePlatform, formatDateId, formatRupiah } from '../types';
import { ProductImage } from './ProductImage';
import { MediaPlayer } from './MediaPlayer';

interface VtvLivePageProps {
  onOpenCheckout: () => void;
  initialMode?: 'live' | 'video' | 'instagram';
}

const PLATFORMS: ('Semua' | LivePlatform)[] = [
  'Semua',
  'VTC Studio',
  'YouTube Live',
  'TikTok Live',
  'Facebook Live',
  'TV Live',
];

export const VtvLivePage: React.FC<VtvLivePageProps> = ({
  onOpenCheckout,
  initialMode = 'video',
}) => {
  const {
    state,
    currentUser,
    addToCart,
    createLiveStream,
    likeLiveStream,
    commentLiveStream,
    createShortVideo,
    likeShortVideo,
    commentShortVideo,
    toggleFollowSeller,
    likeInstagramPost,
    commentInstagramPost,
  } = useMarketplace();

  const [mode, setMode] = useState<'tiktok' | 'live' | 'instagram'>(
    initialMode === 'live'
      ? 'live'
      : initialMode === 'instagram'
        ? 'instagram'
        : 'tiktok'
  );

  useEffect(() => {
    setMode(
      initialMode === 'live'
        ? 'live'
        : initialMode === 'instagram'
          ? 'instagram'
          : 'tiktok'
    );
  }, [initialMode]);

  const [platformFilter, setPlatformFilter] = useState<'Semua' | LivePlatform>('Semua');
  const [selectedLiveId, setSelectedLiveId] = useState<string>(
    state.liveStreams[0]?.id ?? ''
  );
  const [commentInput, setCommentInput] = useState('');

  // Create Live modal
  const [showCreateLive, setShowCreateLive] = useState(false);
  const [liveTitle, setLiveTitle] = useState('');
  const [liveHost, setLiveHost] = useState(currentUser?.name || 'Toko VTC SHOP INDONESIA');
  const [livePlatform, setLivePlatform] = useState<LivePlatform>('YouTube Live');
  const [liveUrl, setLiveUrl] = useState('');
  const [liveProductId, setLiveProductId] = useState(state.products[0]?.id ?? '');

  // TikTok Short Video state
  const [activeShortIdx, setActiveShortIdx] = useState(0);
  const [videoCommentMap, setVideoCommentMap] = useState<Record<string, string>>({});
  const [showCreateVideo, setShowCreateVideo] = useState(false);
  const [vidTitle, setVidTitle] = useState('');
  const [vidCaption, setVidCaption] = useState('');
  const [vidProductId, setVidProductId] = useState(state.products[0]?.id ?? '');

  // Instagram Story Viewer & Feed Comments
  const [activeStoryIdx, setActiveStoryIdx] = useState<number | null>(null);
  const [igCommentMap, setIgCommentMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (activeStoryIdx === null) return;
    const timer = window.setTimeout(() => {
      if (activeStoryIdx < state.instagramStories.length - 1) {
        setActiveStoryIdx(activeStoryIdx + 1);
      } else {
        setActiveStoryIdx(null);
      }
    }, 6000);
    return () => window.clearTimeout(timer);
  }, [activeStoryIdx, state.instagramStories.length]);

  const filteredLives = useMemo(() => {
    if (platformFilter === 'Semua') return state.liveStreams;
    return state.liveStreams.filter((l) => l.platform === platformFilter);
  }, [state.liveStreams, platformFilter]);

  const activeLive = useMemo(
    () =>
      filteredLives.find((l) => l.id === selectedLiveId) ??
      filteredLives[0] ??
      null,
    [filteredLives, selectedLiveId]
  );

  const activeLiveProduct = useMemo(
    () =>
      state.products.find((p) => p.id === activeLive?.productId) ??
      state.products[0] ??
      null,
    [state.products, activeLive]
  );

  const handleCheckoutNow = (productId: string) => {
    addToCart(productId, 1);
    onOpenCheckout();
  };

  const handleCreateLiveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveTitle.trim() || !liveProductId) return;
    createLiveStream({
      title: liveTitle,
      hostName: liveHost || currentUser?.name || 'Seller VTC SHOP INDONESIA',
      platform: livePlatform,
      embedUrl: liveUrl,
      productId: liveProductId,
    });
    setShowCreateLive(false);
    setLiveTitle('');
    setLiveUrl('');
  };

  const handleCreateVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vidTitle.trim() || !vidProductId) return;
    createShortVideo({
      title: vidTitle,
      creatorName: `@${(currentUser?.name || 'vtc_seller').toLowerCase().replace(/\s+/g, '_')}`,
      productId: vidProductId,
      caption: vidCaption || vidTitle,
    });
    setShowCreateVideo(false);
    setVidTitle('');
    setVidCaption('');
    setActiveShortIdx(0);
  };

  const handleCommentSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLive || !commentInput.trim()) return;
    commentLiveStream(
      activeLive.id,
      currentUser?.name || 'Pembeli VTC SHOP INDONESIA',
      commentInput
    );
    setCommentInput('');
  };

  const activeShortVideo = state.shortVideos[activeShortIdx] ?? state.shortVideos[0];
  const activeStory =
    activeStoryIdx !== null ? state.instagramStories[activeStoryIdx] ?? null : null;

  return (
    <div className="space-y-5">
      {/* Top 3-in-1 Social Commerce Switcher: TikTok Shop | YouTube & Live | Instagram Toko */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="grid grid-cols-3 gap-1.5 bg-white dark:bg-zinc-900 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setMode('tiktok')}
            className={`min-h-[44px] px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'tiktok'
                ? 'bg-[#111113] dark:bg-[#FF6A00] text-white'
                : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900'
            }`}
          >
            <Video className="w-4 h-4 text-[#FF6A00]" />
            <span>TikTok Shop</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('live')}
            className={`min-h-[44px] px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'live'
                ? 'bg-[#EE4D2D] text-white'
                : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900'
            }`}
          >
            <Youtube className="w-4 h-4" />
            <span>YT & Live</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('instagram')}
            className={`min-h-[44px] px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'instagram'
                ? 'bg-gradient-to-r from-pink-600 to-orange-500 text-white'
                : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900'
            }`}
          >
            <Instagram className="w-4 h-4" />
            <span>IG Toko</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() =>
            mode === 'live' ? setShowCreateLive(true) : setShowCreateVideo(true)
          }
          className="min-h-[46px] px-4 rounded-xl bg-[#111113] hover:bg-zinc-800 text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#FF6A00]" />
          <span>
            {mode === 'live' ? 'Seller: Buat Live YouTube/Studio' : 'Unggah Video Produk'}
          </span>
        </button>
      </div>

      {/* ---------------- TAB 1: TIKTOK SHOP (VERTICAL SCROLL + AUDIO + BELI LANGSUNG) ---------------- */}
      {mode === 'tiktok' && activeShortVideo && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Active TikTok Vertical Feed Stage */}
          <div className="lg:col-span-5 bg-[#111113] text-white rounded-3xl overflow-hidden border border-zinc-800 shadow-xl">
            <div className="relative">
              <MediaPlayer
                key={activeShortVideo.id}
                src={activeShortVideo.videoUrl || '/videos/vtc-short-tiktok.mp4'}
                fallbackSrc="/videos/vtc-product-demo.mp4"
                poster={
                  state.products.find((p) => p.id === activeShortVideo.productId)?.image
                }
                autoPlay
                loop
                aspectClassName="aspect-[9/12]"
                badgeText={`TikTok Shop · ${activeShortVideo.creatorName}`}
                title={activeShortVideo.title}
                className="rounded-none"
              />

              {/* Next / Prev TikTok Video Navigation Buttons */}
              <div className="absolute top-14 right-3 flex flex-col gap-2 z-20">
                <button
                  type="button"
                  disabled={activeShortIdx === 0}
                  onClick={() => setActiveShortIdx((i) => Math.max(0, i - 1))}
                  aria-label="Video Sebelumnya"
                  className="w-9 h-9 rounded-full bg-black/70 disabled:opacity-35 text-white flex items-center justify-center cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 rotate-90" />
                </button>
                <button
                  type="button"
                  disabled={activeShortIdx >= state.shortVideos.length - 1}
                  onClick={() =>
                    setActiveShortIdx((i) =>
                      Math.min(state.shortVideos.length - 1, i + 1)
                    )
                  }
                  aria-label="Scroll ke Video Berikutnya"
                  className="w-9 h-9 rounded-full bg-[#FF6A00] disabled:opacity-35 text-white flex items-center justify-center cursor-pointer shadow"
                >
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </button>
              </div>
            </div>

            {(() => {
              const prod = state.products.find(
                (p) => p.id === activeShortVideo.productId
              );
              return (
                <div className="p-4 space-y-3 bg-zinc-900">
                  <div>
                    <h2 className="text-base font-extrabold text-white leading-snug">
                      {activeShortVideo.title}
                    </h2>
                    <p className="text-xs text-zinc-300 mt-0.5">
                      {activeShortVideo.caption}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => likeShortVideo(activeShortVideo.id)}
                      className="min-h-[42px] px-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold inline-flex items-center gap-1.5 tabular-nums cursor-pointer"
                    >
                      <Heart className="w-4 h-4 fill-[#EE4D2D] text-[#EE4D2D]" />
                      <span>{activeShortVideo.likes} Suka</span>
                    </button>

                    {prod && (
                      <button
                        type="button"
                        onClick={() => handleCheckoutNow(prod.id)}
                        className="flex-1 min-h-[42px] px-4 rounded-xl bg-[#FF6A00] hover:bg-[#E05E00] text-white text-xs font-extrabold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Beli Langsung · {formatRupiah(prod.price)}</span>
                      </button>
                    )}
                  </div>

                  {/* Comments */}
                  <div className="pt-2 border-t border-zinc-800 space-y-2">
                    <div className="space-y-1.5 max-h-28 overflow-y-auto">
                      {activeShortVideo.comments.map((c) => (
                        <p key={c.id} className="text-xs text-zinc-300">
                          <strong className="text-white">{c.author}:</strong> {c.text}
                        </p>
                      ))}
                    </div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const txt = videoCommentMap[activeShortVideo.id] || '';
                        if (!txt.trim()) return;
                        commentShortVideo(
                          activeShortVideo.id,
                          currentUser?.name || 'Pembeli VTC',
                          txt
                        );
                        setVideoCommentMap((prev) => ({
                          ...prev,
                          [activeShortVideo.id]: '',
                        }));
                      }}
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        value={videoCommentMap[activeShortVideo.id] ?? ''}
                        onChange={(e) =>
                          setVideoCommentMap((prev) => ({
                            ...prev,
                            [activeShortVideo.id]: e.target.value,
                          }))
                        }
                        placeholder="Tulis komentar video..."
                        className="flex-1 h-10 px-3 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#FF6A00]"
                      />
                      <button
                        type="submit"
                        aria-label="Kirim komentar"
                        className="min-w-[40px] min-h-[40px] rounded-xl bg-[#FF6A00] text-white flex items-center justify-center cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Scrollable Short Video Queue */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                Antrean Video TikTok Shop ({state.shortVideos.length})
              </h3>
              <span className="text-xs text-zinc-500">
                Klik atau tekan panah untuk ganti video
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {state.shortVideos.map((vid, idx) => {
                const product = state.products.find((p) => p.id === vid.productId);
                const selected = idx === activeShortIdx;
                return (
                  <article
                    key={vid.id}
                    className={`rounded-2xl border p-3.5 bg-white dark:bg-zinc-900 flex flex-col justify-between gap-3 ${
                      selected
                        ? 'border-[#FF6A00] ring-2 ring-[#FF6A00]/20'
                        : 'border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveShortIdx(idx)}
                      className="flex items-start gap-3 text-left cursor-pointer"
                    >
                      <div className="w-20 h-24 rounded-xl overflow-hidden bg-zinc-900 shrink-0 relative">
                        {product && (
                          <ProductImage src={product.image} alt={vid.title} />
                        )}
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[10px] font-bold">
                          {vid.views.toLocaleString('id-ID')}x
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <span className="text-[11px] font-bold text-[#FF6A00]">
                          {vid.creatorName}
                        </span>
                        <h4 className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-zinc-100 line-clamp-2">
                          {vid.title}
                        </h4>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2">
                          {vid.caption}
                        </p>
                      </div>
                    </button>

                    {product && (
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                        <span className="text-xs font-extrabold text-[#EE4D2D] tabular-nums">
                          {formatRupiah(product.price)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCheckoutNow(product.id)}
                          className="min-h-[34px] px-3 rounded-lg bg-[#111113] hover:bg-zinc-800 text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <ShoppingBag className="w-3 h-3 text-[#FF6A00]" />
                          <span>Beli Sekarang</span>
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ---------------- TAB 2: YOUTUBE & SELLER LIVE STREAMING ---------------- */}
      {mode === 'live' && (
        <div className="space-y-5">
          {/* Platform Filters */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {PLATFORMS.map((plat) => (
              <button
                key={plat}
                type="button"
                onClick={() => setPlatformFilter(plat)}
                className={`min-h-[40px] px-3.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer ${
                  platformFilter === plat
                    ? 'bg-[#111113] dark:bg-[#FF6A00] text-white'
                    : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                {plat}
              </button>
            ))}
          </div>

          {activeLive ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
              {/* Main Live / YouTube Stage with Real Audio Controls */}
              <section className="lg:col-span-2 bg-[#111113] text-white rounded-3xl overflow-hidden border border-zinc-800">
                <MediaPlayer
                  key={activeLive.id}
                  src={activeLive.embedUrl || activeLive.videoUrl || '/videos/vtc-live-studio.mp4'}
                  fallbackSrc="/videos/vtc-product-demo.mp4"
                  poster={activeLiveProduct?.image}
                  isLive={!activeLive.embedUrl}
                  autoPlay
                  loop
                  badgeText={`${activeLive.platform} · ${activeLive.viewerCount.toLocaleString('id-ID')} penonton`}
                  title={activeLive.title}
                  className="rounded-none"
                />

                <div className="px-4 py-3 bg-zinc-950 border-t border-zinc-800 space-y-1">
                  <p className="text-xs font-semibold text-orange-300">
                    Host: {activeLive.hostName}
                  </p>
                  <h2 className="text-base sm:text-lg font-extrabold text-white leading-snug">
                    {activeLive.title}
                  </h2>
                </div>

                {/* Pinned Product Checkout Bar */}
                {activeLiveProduct && (
                  <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                        <ProductImage
                          src={activeLiveProduct.image}
                          alt={activeLiveProduct.name}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-orange-400 font-bold">
                          Produk Etalase Live
                        </p>
                        <p className="text-sm font-bold text-white truncate">
                          {activeLiveProduct.name}
                        </p>
                        <p className="text-sm font-extrabold text-[#EE4D2D] tabular-nums">
                          {formatRupiah(activeLiveProduct.price)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => likeLiveStream(activeLive.id)}
                        className="min-h-[46px] px-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold inline-flex items-center gap-1.5 tabular-nums cursor-pointer"
                      >
                        <Heart className="w-4 h-4 fill-[#EE4D2D] text-[#EE4D2D]" />
                        <span>{activeLive.likes}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCheckoutNow(activeLiveProduct.id)}
                        className="flex-1 sm:flex-initial min-h-[46px] px-5 rounded-xl bg-[#EE4D2D] hover:bg-[#D73B1C] text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Beli Langsung</span>
                      </button>
                    </div>
                  </div>
                )}
              </section>

              {/* Live Comments */}
              <aside className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-4 flex flex-col justify-between gap-4 h-full">
                <div className="space-y-3">
                  <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 inline-flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-[#EE4D2D]" />
                    Chat Live ({activeLive.comments.length})
                  </h3>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {activeLive.comments.length === 0 ? (
                      <p className="text-xs text-zinc-500 py-4 text-center">
                        Jadilah yang pertama berkomentar di siaran ini!
                      </p>
                    ) : (
                      activeLive.comments.map((c) => (
                        <div
                          key={c.id}
                          className="bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 py-2 text-xs"
                        >
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">
                            {c.author}:{' '}
                          </span>
                          <span className="text-zinc-700 dark:text-zinc-300">
                            {c.text}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <form onSubmit={handleCommentSend} className="flex gap-2">
                  <input
                    type="text"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Tulis chat ke Host Live..."
                    className="flex-1 h-11 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#EE4D2D]"
                  />
                  <button
                    type="submit"
                    aria-label="Kirim komentar"
                    className="min-w-[44px] min-h-[44px] rounded-xl bg-[#EE4D2D] text-white flex items-center justify-center cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </aside>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 text-center text-sm text-zinc-500">
              Belum ada siaran Live di platform ini.
            </div>
          )}

          {/* Other Channels List */}
          <section className="space-y-3">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Semua Siaran Live YouTube & Seller ({filteredLives.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredLives.map((live) => {
                const prod = state.products.find((p) => p.id === live.productId);
                const selected = activeLive?.id === live.id;
                return (
                  <button
                    key={live.id}
                    type="button"
                    onClick={() => setSelectedLiveId(live.id)}
                    className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 cursor-pointer ${
                      selected
                        ? 'border-[#EE4D2D] bg-orange-50/50 dark:bg-orange-950/30'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0">
                      <ProductImage src={prod?.image || ''} alt={live.title} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-[#EE4D2D] inline-flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>
                          {live.platform} · {live.viewerCount}
                        </span>
                      </p>
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug">
                        {live.title}
                      </p>
                      <p className="text-xs text-zinc-500 truncate mt-0.5">
                        {live.hostName}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* ---------------- TAB 3: INSTAGRAM TOKO (STORY, FEED FOTO & FOLLOW TOKO) ---------------- */}
      {mode === 'instagram' && (
        <div className="space-y-5">
          {/* Story Toko Bar */}
          <section className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-zinc-100 inline-flex items-center gap-2">
                <Camera className="w-4 h-4 text-pink-600" />
                Story Toko Hari Ini
              </h2>
              <span className="text-[11px] text-zinc-500">
                Ketuk lingkaran Story untuk buka promo
              </span>
            </div>

            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-1">
              {state.instagramStories.map((story, idx) => (
                <button
                  key={story.id}
                  type="button"
                  onClick={() => setActiveStoryIdx(idx)}
                  className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
                >
                  <div className="p-0.5 rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600">
                    <div className="w-16 h-16 rounded-full p-0.5 bg-white dark:bg-zinc-900 overflow-hidden">
                      <img
                        src={story.avatarImage}
                        alt={story.storeName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 max-w-[74px] truncate">
                    {story.storeName}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Feed Foto Produk & Follow Toko */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.instagramPosts.map((post) => {
              const prod = state.products.find((p) => p.id === post.productId);
              const isFollowing = state.followedSellerIds.includes(post.sellerId);
              return (
                <article
                  key={post.id}
                  className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Post Header */}
                    <div className="p-3.5 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 truncate">
                          {post.storeName}
                        </p>
                        <p className="text-[11px] text-zinc-500 inline-flex items-center gap-1 truncate">
                          <span>{post.handle}</span>
                          <span>·</span>
                          <MapPin className="w-3 h-3 text-[#EE4D2D]" />
                          <span>{post.city}</span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleFollowSeller(post.sellerId)}
                        className={`min-h-[34px] px-3 rounded-xl text-xs font-bold inline-flex items-center gap-1 shrink-0 cursor-pointer ${
                          isFollowing
                            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700'
                            : 'bg-[#FF6A00] text-white'
                        }`}
                      >
                        {isFollowing ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Mengikuti</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Follow Toko</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Product Photo */}
                    <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 overflow-hidden relative">
                      <ProductImage src={post.image} alt={post.storeName} />
                      {prod && (
                        <button
                          type="button"
                          onClick={() => handleCheckoutNow(prod.id)}
                          className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/80 hover:bg-[#FF6A00] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{formatRupiah(prod.price)}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Caption, Likes, Comments, Buy */}
                  <div className="p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => likeInstagramPost(post.id)}
                        className="min-h-[36px] px-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 text-xs font-bold inline-flex items-center gap-1.5 tabular-nums cursor-pointer"
                      >
                        <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                        <span>{post.likes.toLocaleString('id-ID')} Suka</span>
                      </button>

                      {prod && (
                        <button
                          type="button"
                          onClick={() => handleCheckoutNow(prod.id)}
                          className="min-h-[36px] px-3.5 rounded-xl bg-[#EE4D2D] hover:bg-[#D73B1C] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Beli Produk</span>
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      <strong className="text-zinc-900 dark:text-zinc-100">
                        {post.handle}{' '}
                      </strong>
                      {post.caption}
                    </p>

                    {post.comments.length > 0 && (
                      <div className="space-y-1 max-h-20 overflow-y-auto">
                        {post.comments.slice(-2).map((c) => (
                          <p
                            key={c.id}
                            className="text-[11px] text-zinc-600 dark:text-zinc-400"
                          >
                            <strong className="text-zinc-800 dark:text-zinc-200">
                              {c.author}:
                            </strong>{' '}
                            {c.text}
                          </p>
                        ))}
                      </div>
                    )}

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const txt = igCommentMap[post.id] || '';
                        if (!txt.trim()) return;
                        commentInstagramPost(
                          post.id,
                          currentUser?.name || 'Pembeli VTC',
                          txt
                        );
                        setIgCommentMap((prev) => ({ ...prev, [post.id]: '' }));
                      }}
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        value={igCommentMap[post.id] ?? ''}
                        onChange={(e) =>
                          setIgCommentMap((prev) => ({
                            ...prev,
                            [post.id]: e.target.value,
                          }))
                        }
                        placeholder="Tambah komentar..."
                        className="flex-1 h-9 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100"
                      />
                      <button
                        type="submit"
                        aria-label="Kirim komentar IG"
                        className="min-w-[36px] min-h-[36px] rounded-xl bg-[#111113] text-white flex items-center justify-center cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* Story Viewer Modal */}
      {activeStory && activeStoryIdx !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-0 sm:p-4"
          onClick={() => setActiveStoryIdx(null)}
        >
          <div
            className="relative w-full max-w-sm h-full sm:h-[620px] bg-zinc-950 sm:rounded-3xl overflow-hidden flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeStory.storyImage}
              alt={activeStory.storeName}
              className="absolute inset-0 w-full h-full object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-transparent to-black/90" />

            {/* Top Progress + Store Header */}
            <div className="relative z-10 p-4 space-y-3">
              <div className="grid grid-cols-4 gap-1">
                {state.instagramStories.map((st, idx) => (
                  <div key={st.id} className="h-1 rounded-full bg-white/30 overflow-hidden">
                    <div
                      className={`h-full bg-white ${
                        idx <= activeStoryIdx ? 'w-full' : 'w-0'
                      }`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between gap-2 text-white">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={activeStory.avatarImage}
                    alt={activeStory.storeName}
                    className="w-9 h-9 rounded-full object-cover border border-white"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold truncate">
                      {activeStory.storeName}
                    </p>
                    <p className="text-[10px] text-zinc-300">
                      {activeStory.handle} · {formatDateId(activeStory.createdAt)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStoryIdx(null)}
                  className="w-9 h-9 rounded-full bg-black/50 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bottom Caption & CTA */}
            <div className="relative z-10 p-4 space-y-3 text-white">
              <p className="text-xs sm:text-sm font-medium leading-relaxed">
                {activeStory.caption}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleFollowSeller(activeStory.sellerId)}
                  className="min-h-[42px] px-3.5 rounded-xl bg-white/20 text-white text-xs font-bold cursor-pointer"
                >
                  {state.followedSellerIds.includes(activeStory.sellerId)
                    ? 'Mengikuti ✓'
                    : '+ Follow'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const pid = activeStory.productId;
                    setActiveStoryIdx(null);
                    handleCheckoutNow(pid);
                  }}
                  className="flex-1 min-h-[42px] px-4 rounded-xl bg-[#FF6A00] hover:bg-[#E05E00] text-white text-xs font-extrabold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Beli Produk Ini</span>
                </button>
              </div>
              <div className="flex justify-between text-[11px] text-zinc-300">
                <button
                  type="button"
                  disabled={activeStoryIdx === 0}
                  onClick={() => setActiveStoryIdx((i) => Math.max(0, (i ?? 0) - 1))}
                  className="px-2 py-1 disabled:opacity-35 cursor-pointer"
                >
                  ← Sebelumnya
                </button>
                <button
                  type="button"
                  onClick={() =>
                    activeStoryIdx < state.instagramStories.length - 1
                      ? setActiveStoryIdx(activeStoryIdx + 1)
                      : setActiveStoryIdx(null)
                  }
                  className="px-2 py-1 cursor-pointer"
                >
                  Berikutnya →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Buat Live (Seller) */}
      {showCreateLive && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setShowCreateLive(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Seller: Buat Live Streaming
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateLive(false)}
                className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center rounded-xl text-zinc-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateLiveSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Judul Live
                </label>
                <input
                  type="text"
                  required
                  value={liveTitle}
                  onChange={(e) => setLiveTitle(e.target.value)}
                  placeholder="Contoh: Cuci Gudang Diskon 50% + COD!"
                  className="w-full h-12 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Nama Toko / Host
                  </label>
                  <input
                    type="text"
                    required
                    value={liveHost}
                    onChange={(e) => setLiveHost(e.target.value)}
                    className="w-full h-12 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Platform Sumber
                  </label>
                  <select
                    value={livePlatform}
                    onChange={(e) => setLivePlatform(e.target.value as LivePlatform)}
                    className="w-full h-12 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm bg-white dark:bg-zinc-800"
                  >
                    <option value="YouTube Live">YouTube Live</option>
                    <option value="VTC Studio">VTC Studio</option>
                    <option value="TikTok Live">TikTok Live</option>
                    <option value="Facebook Live">Facebook Live</option>
                    <option value="TV Live">TV Live</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Link YouTube Live / Video (Opsional, https://)
                </label>
                <input
                  type="url"
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full h-12 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Produk yang Ditampilkan di Live
                </label>
                <select
                  value={liveProductId}
                  onChange={(e) => setLiveProductId(e.target.value)}
                  className="w-full h-12 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm bg-white dark:bg-zinc-800"
                >
                  {state.products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {formatRupiah(p.price)}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-[#EE4D2D] hover:bg-[#D73B1C] text-white font-bold text-sm cursor-pointer"
              >
                Mulai Tayangkan Live
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Unggah Video TikTok Shop */}
      {showCreateVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setShowCreateVideo(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Unggah Video TikTok Shop
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateVideo(false)}
                className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center rounded-xl text-zinc-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateVideoSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Judul Video
                </label>
                <input
                  type="text"
                  required
                  value={vidTitle}
                  onChange={(e) => setVidTitle(e.target.value)}
                  placeholder="Contoh: Unboxing Keyboard Mekanikal 75%"
                  className="w-full h-12 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Caption Singkat
                </label>
                <textarea
                  rows={2}
                  value={vidCaption}
                  onChange={(e) => setVidCaption(e.target.value)}
                  placeholder="Tulis review singkat atau info promo..."
                  className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Tautkan Produk Keranjang
                </label>
                <select
                  value={vidProductId}
                  onChange={(e) => setVidProductId(e.target.value)}
                  className="w-full h-12 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm bg-white dark:bg-zinc-800"
                >
                  {state.products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-[#EE4D2D] hover:bg-[#D73B1C] text-white font-bold text-sm cursor-pointer"
              >
                Publikasikan Video
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
