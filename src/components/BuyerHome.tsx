import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  Mic,
  Camera,
  Star,
  Plus,
  X,
  ShieldCheck,
  Truck,
  Store,
  ShoppingBag,
  Sparkles,
  Flame,
  Clock,
  SlidersHorizontal,
  RefreshCw,
  Smartphone,
  Ticket,
  Radio,
  Wallet,
  Coins,
  BadgeCheck,
  Eye,
  Play,
  Heart,
  Scale,
  Tag,
  ShoppingBasket,
  Award,
  Receipt,
  CheckCircle2,
  Video,
  Tv,
  Gamepad2,
  UtensilsCrossed,
  Leaf,
  MoonStar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { BANNER_IMAGES, useMarketplace } from '../store/marketplaceStore';
import {
  AiSpecData,
  AppTab,
  PRODUCT_CATEGORIES,
  formatRupiah,
} from '../types';
import { ProductImage } from './ProductImage';
import { CompareProductsModal } from './CompareProductsModal';
import { VtcLogo } from './VtcLogo';

interface BuyerHomeProps {
  onGoToLive: () => void;
  onGoToVideo?: () => void;
  onOpenProduct: (productId: string) => void;
  onOpenStore: (sellerId: string) => void;
  onNavigate?: (tab: AppTab) => void;
  onOpenTopUpHub?: (tab: 'game' | 'ppob') => void;
}

type SortOption = 'popular' | 'price_asc' | 'price_desc' | 'rating';
type QuickServiceModal = 'pulsa' | 'voucher' | 'topup' | 'ongkir' | null;

function resizeCameraPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxSide = 640;
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(reader.result));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = reject;
      img.src = String(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const BuyerHome: React.FC<BuyerHomeProps> = ({
  onGoToLive,
  onGoToVideo,
  onOpenProduct,
  onOpenStore,
  onNavigate,
  onOpenTopUpHub,
}) => {
  const {
    state,
    addToCart,
    showToast,
    topUpVtvpay,
    buyPulsa,
    payBill,
    claimPromoVoucher,
    claimDailyCoins,
    toggleWishlist,
    toggleCompareProduct,
  } = useMarketplace();
  const [searchQuery, setSearchQuery] = useState('');
  const [bannerIdx, setBannerIdx] = useState(0);
  const [activeAiQuery, setActiveAiQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [onlyMall, setOnlyMall] = useState(false);
  const [onlyTermurah, setOnlyTermurah] = useState(false);
  const [onlyWishlist, setOnlyWishlist] = useState(false);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  // Quick Service Modals (Pulsa & Tagihan, Voucher, Top Up, Gratis Ongkir)
  const [serviceModal, setServiceModal] = useState<QuickServiceModal>(null);
  const [pulsaTab, setPulsaTab] = useState<'pulsa' | 'tagihan'>('pulsa');
  const [pulsaProvider, setPulsaProvider] = useState('Telkomsel');
  const [pulsaPhone, setPulsaPhone] = useState('');
  const [pulsaNominal, setPulsaNominal] = useState(25000);
  const [billService, setBillService] = useState('PLN Token');
  const [billNumber, setBillNumber] = useState('');
  const [billAmount, setBillAmount] = useState(50000);
  const [topUpSource, setTopUpSource] = useState('BCA Virtual Account');
  const [topUpAmount, setTopUpAmount] = useState(100000);

  // Flash Sale Countdown
  const [countdownSec, setCountdownSec] = useState(4 * 3600 + 38 * 60 + 25);

  // Smart Spec Panel State (runs silently in background)
  const [aiSpec, setAiSpec] = useState<AiSpecData | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  // Voice Search Modal State
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [voiceListening, setVoiceListening] = useState(false);
  const [voiceStatusMsg, setVoiceStatusMsg] = useState('');
  const recognitionRef = useRef<any>(null);

  // Camera Visual Search Modal State
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraPreview, setCameraPreview] = useState('');
  const [visualNotes, setVisualNotes] = useState('');

  useEffect(() => {
    if (state.liteMode) return;
    const timer = setInterval(() => {
      setCountdownSec((prev) => (prev > 0 ? prev - 1 : 4 * 3600));
    }, 1000);
    return () => clearInterval(timer);
  }, [state.liteMode]);

  useEffect(() => {
    if (state.liteMode) return;
    const slideTimer = setInterval(() => {
      setBannerIdx((prev) => (prev + 1) % 3);
    }, 4500);
    return () => clearInterval(slideTimer);
  }, [state.liteMode]);

  const formatCountdown = (sec: number) => {
    const h = String(Math.floor(sec / 3600)).padStart(2, '0');
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  // Accurate Price & Search Filtering
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const minVal = minPrice.trim() ? Number(minPrice.replace(/\D/g, '')) : 0;
    const maxVal = maxPrice.trim()
      ? Number(maxPrice.replace(/\D/g, ''))
      : Number.POSITIVE_INFINITY;

    const effectiveMin =
      minVal && maxVal !== Number.POSITIVE_INFINITY && minVal > maxVal
        ? maxVal
        : minVal;
    const effectiveMax =
      minVal && maxVal !== Number.POSITIVE_INFINITY && minVal > maxVal
        ? minVal
        : maxVal;

    const list = state.products.filter((product) => {
      const matchCat =
        selectedCategory === 'Semua' ||
        product.category === selectedCategory ||
        (selectedCategory === 'Makanan' && Boolean(product.isFood)) ||
        (selectedCategory === 'VTC Halal' && Boolean(product.isHalal)) ||
        (selectedCategory === 'VTC Mart' && Boolean(product.isMart));
      const matchSearch =
        !q ||
        product.name.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q) ||
        product.sellerName.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q) ||
        (product.specs?.material?.toLowerCase().includes(q) ?? false);
      const matchPrice =
        product.price >= effectiveMin && product.price <= effectiveMax;
      const matchMall = !onlyMall || Boolean(product.isMall);
      const matchTermurah =
        !onlyTermurah || Boolean(product.isTermurah || product.price <= 160000);
      const matchWishlist =
        !onlyWishlist || state.wishlistIds.includes(product.id);
      return (
        matchCat &&
        matchSearch &&
        matchPrice &&
        matchMall &&
        matchTermurah &&
        matchWishlist
      );
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return b.soldCount - a.soldCount;
    });
  }, [
    state.products,
    state.wishlistIds,
    searchQuery,
    selectedCategory,
    minPrice,
    maxPrice,
    sortBy,
    onlyMall,
    onlyTermurah,
    onlyWishlist,
  ]);

  // Background recommendation ranking based on purchase, wishlist & viewing history
  const recommendedProducts = useMemo(() => {
    const categoryAffinity = new Map<string, number>();
    const sellerAffinity = new Map<string, number>();

    state.orders.forEach((order) => {
      order.items.forEach((item) => {
        const prod = state.products.find((p) => p.id === item.productId);
        if (!prod) return;
        categoryAffinity.set(
          prod.category,
          (categoryAffinity.get(prod.category) || 0) + 5
        );
        sellerAffinity.set(
          prod.sellerId,
          (sellerAffinity.get(prod.sellerId) || 0) + 3
        );
      });
    });

    state.wishlistIds.forEach((id) => {
      const prod = state.products.find((p) => p.id === id);
      if (!prod) return;
      categoryAffinity.set(
        prod.category,
        (categoryAffinity.get(prod.category) || 0) + 4
      );
    });

    state.viewedProductIds.forEach((id, idx) => {
      const prod = state.products.find((p) => p.id === id);
      if (!prod) return;
      const recencyBoost = Math.max(1, 3 - Math.floor(idx / 3));
      categoryAffinity.set(
        prod.category,
        (categoryAffinity.get(prod.category) || 0) + recencyBoost
      );
    });

    return [...state.products]
      .map((product) => {
        const catScore = categoryAffinity.get(product.category) || 0;
        const sellScore = sellerAffinity.get(product.sellerId) || 0;
        const qualityScore = product.rating * 2 + Math.min(5, product.soldCount / 150);
        const totalScore = catScore * 3 + sellScore * 2 + qualityScore;
        return { product, totalScore };
      })
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 4)
      .map((entry) => entry.product);
  }, [state.products, state.orders, state.wishlistIds, state.viewedProductIds]);

  const flashSaleProducts = useMemo(
    () => state.products.filter((p) => p.isFlashSale || (p.discountPercent ?? 0) >= 70),
    [state.products]
  );

  const mallProducts = useMemo(
    () => state.products.filter((p) => p.isMall),
    [state.products]
  );

  const todayKey = new Date().toISOString().slice(0, 10);
  const coinClaimedToday = state.lastCoinCheckInDate === todayKey;

  // Smart Spec Panel via /api/ai/spec with silent local catalog fallback (never shows error)
  const fetchAiSpec = async (queryText: string) => {
    const clean = queryText.trim();
    if (!clean) {
      setAiSpec(null);
      setActiveAiQuery('');
      setAiError('');
      return;
    }

    const qLower = clean.toLowerCase();
    const matched = state.products.filter(
      (p) =>
        p.name.toLowerCase().includes(qLower) ||
        p.category.toLowerCase().includes(qLower) ||
        p.sellerName.toLowerCase().includes(qLower) ||
        p.description.toLowerCase().includes(qLower)
    );

    const buildLocalFallback = (): AiSpecData => {
      const top = matched[0];
      return {
        productTitle: top ? top.name : clean,
        summary: top
          ? `Ditemukan ${matched.length} produk cocok untuk "${clean}" di VTC SHOP INDONESIA, termasuk ${top.name} dari ${top.sellerName} dengan rating ${top.rating.toFixed(1)}/5.0.`
          : `Menampilkan pencarian katalog VTC SHOP INDONESIA untuk "${clean}".`,
        specs: top
          ? [
              { label: 'Kategori', value: top.category },
              { label: 'Bahan / Material', value: top.specs?.material || 'Standar Resmi' },
              { label: 'Berat', value: top.specs?.weight || '350 gram' },
              { label: 'Garansi', value: top.specs?.warranty || 'Garansi Toko Resmi' },
            ]
          : [{ label: 'Kata Kunci', value: clean }],
        priceComparison: matched.slice(0, 3).map((p, idx) => ({
          storeName: p.sellerName,
          priceRange: formatRupiah(p.price),
          highlight: `Stok ${p.stock} · ★ ${p.rating.toFixed(1)}`,
          isRecommended: idx === 0,
        })),
        bestRecommendation: top
          ? `${top.name} (${formatRupiah(top.price)}) dari ${top.sellerName} — bisa COD & dikirim dari ${top.specs?.originCity || 'Indonesia'}.`
          : 'Gunakan filter kategori atau rentang harga untuk hasil paling sesuai.',
        shortReview: top?.reviews?.[0]?.comment || 'Produk populer dengan ulasan tinggi dan pengiriman cepat.',
      };
    };

    setActiveAiQuery(clean);
    setAiLoading(true);
    setAiError('');
    try {
      const res = await fetch('/api/ai/spec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: clean, matchedProducts: matched }),
      });
      const data = await res.json();
      if (!res.ok || !data?.spec) {
        setAiSpec(buildLocalFallback());
        return;
      }
      setAiSpec(data.spec);
    } catch {
      setAiSpec(buildLocalFallback());
    } finally {
      setAiLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAiSpec(searchQuery);
    document
      .getElementById('catalog-results-section')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Voice Search
  const startVoiceSearch = () => {
    setVoiceModalOpen(true);
    setVoiceStatusMsg('Mendengarkan suara Anda... Silakan ucapkan nama produk.');
    const SpeechRec =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      setVoiceListening(false);
      setVoiceStatusMsg(
        'Bisa ucapkan lagi? Saya tidak terlalu dengar (Browser tidak mendukung mic langsung, pilih contoh suara di bawah).'
      );
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.lang = 'id-ID';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognitionRef.current = recognition;
      setVoiceListening(true);

      let gotResult = false;
      recognition.onresult = (event: any) => {
        gotResult = true;
        const transcript = event.results?.[0]?.[0]?.transcript || '';
        setVoiceListening(false);
        if (!transcript.trim()) {
          setVoiceStatusMsg('Bisa ucapkan lagi? Saya tidak terlalu dengar');
          return;
        }
        setVoiceModalOpen(false);
        setSearchQuery(transcript);
        fetchAiSpec(transcript);
        showToast(`Pencarian suara: "${transcript}"`);
      };

      recognition.onerror = () => {
        setVoiceListening(false);
        setVoiceStatusMsg('Bisa ucapkan lagi? Saya tidak terlalu dengar');
      };

      recognition.onend = () => {
        setVoiceListening(false);
        if (!gotResult) {
          setVoiceStatusMsg('Bisa ucapkan lagi? Saya tidak terlalu dengar');
        }
      };

      recognition.start();
    } catch {
      setVoiceListening(false);
      setVoiceStatusMsg('Bisa ucapkan lagi? Saya tidak terlalu dengar');
    }
  };

  // Camera Visual Search
  const handleCameraFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCameraLoading(true);
    setVisualNotes('');
    try {
      const dataUrl = await resizeCameraPhoto(file);
      setCameraPreview(dataUrl);

      const res = await fetch('/api/ai/visual-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: dataUrl,
          mimeType: 'image/jpeg',
          catalogItems: state.products.map((p) => ({
            id: p.id,
            name: p.name,
            category: p.category,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mencari gambar');

      const result = data.result;
      const keywords = result?.searchKeywords || result?.detectedItemName || '';
      setVisualNotes(
        `${result?.detectedItemName || 'Produk terdeteksi'} — ${result?.visualNotes || ''}`
      );
      if (keywords) {
        setSearchQuery(keywords);
        fetchAiSpec(keywords);
      }
      setCameraModalOpen(false);
      showToast(`Kamera menemukan: ${result?.detectedItemName || keywords}`);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Gagal analisis foto produk',
        'warning'
      );
    } finally {
      setCameraLoading(false);
    }
  };

  const applyPricePreset = (min: string, max: string) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  return (
    <div className="space-y-6">
      {/* VTC SHOP INDONESIA Hero + Auto-Sliding Banner Carousel */}
      <section className="rounded-2xl sm:rounded-3xl bg-[#111113] text-white border border-zinc-800 relative overflow-hidden">
        {!state.liteMode && (
          <img
            src={bannerIdx === 1 ? BANNER_IMAGES.superTv : BANNER_IMAGES.promo}
            alt="Banner VTC SHOP INDONESIA"
            className="absolute inset-0 w-full h-full object-cover opacity-30 transition-opacity duration-500"
          />
        )}
        <div className="relative z-10 p-5 sm:p-7 bg-gradient-to-r from-[#111113]/95 via-[#111113]/85 to-[#111113]/55 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-2xl space-y-3">
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-extrabold">
              <VtcLogo size="sm" />
              <span className="text-orange-300">
                {bannerIdx === 1
                  ? 'VTC SUPER TV · 12 TV Nasional Live + Keranjang Kuning'
                  : bannerIdx === 2
                    ? 'FLASH SALE 80% + VTC FOOD Beli 1 Gratis 1 Antar < 30 Menit'
                    : state.language === 'en'
                      ? 'Super App #1 Indonesia · Up to 80% Off Today'
                      : 'Aplikasi Super #1 Indonesia · Diskon s/d 80% Hari Ini'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight [text-wrap:balance]">
              {bannerIdx === 1
                ? 'VTC Super TV Streaming + Belanja Live'
                : bannerIdx === 2
                  ? 'VTC Food, Mart Segar & Halal MUI Terpercaya'
                  : 'Belanja Cerdas Hemat Tepat'}
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-xl">
              {bannerIdx === 1
                ? 'Nonton 12 TV Nasional Live HLS, TikTok Shop, YouTube & Instagram Toko dalam 1 aplikasi dengan audio jernih!'
                : bannerIdx === 2
                  ? 'Pesan makanan Beli 1 Gratis 1 tiba dalam 30 menit, sayuran segar VTC Mart, harga grosir Supermarket & kurasi VTC Halal.'
                  : 'COD GARANSI uang ditahan dulu di Escrow VTC SHOP INDONESIA baru dibayar ke Seller · Gratis Ongkir XTRA · Garansi Tepat Waktu (telat dapat voucher Rp 20rb).'}
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-xs font-semibold text-zinc-200">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-300">
                <Truck className="w-4 h-4 text-emerald-400" /> Gratis Ongkir XTRA
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#EE4D2D]" /> COD Garansi Escrow
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#EE4D2D]" /> Garansi Tepat Waktu
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck className="w-4 h-4 text-amber-400" /> VTC MALL 100% Original
              </span>
            </div>
          </div>

          {/* Banner Slide Controls & CTA */}
          <div className="flex items-center gap-2 shrink-0">
            {bannerIdx === 1 && (
              <button
                type="button"
                onClick={() => onNavigate?.('tv')}
                className="min-h-[40px] px-4 rounded-xl bg-[#EE4D2D] hover:bg-[#D73B1C] text-white text-xs font-extrabold cursor-pointer"
              >
                Buka VTC TV →
              </button>
            )}
            <button
              type="button"
              onClick={() => setBannerIdx((i) => (i + 2) % 3)}
              aria-label="Banner sebelumnya"
              className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 px-1">
              {[0, 1, 2].map((idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setBannerIdx(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    bannerIdx === idx ? 'w-5 bg-[#EE4D2D]' : 'w-2 bg-white/40'
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setBannerIdx((i) => (i + 1) % 3)}
              aria-label="Banner berikutnya"
              className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* CARI 3 CARA + MENU ICON BULAT (Pulsa, Voucher, Live, Top Up, Gratis Ongkir) */}
      <section className="space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1 flex items-center">
            <Search className="w-5 h-5 text-zinc-400 absolute left-4 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ketik nama produk atau cari dengan Suara / Kamera..."
              aria-label="Cari produk 3 cara"
              className="w-full h-13 pl-12 pr-28 rounded-2xl bg-white border border-zinc-300 text-sm sm:text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#EE4D2D] focus:ring-2 focus:ring-[#EE4D2D]/15"
            />

            <div className="absolute right-2 flex items-center gap-1">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveAiQuery('');
                    setAiSpec(null);
                    setAiError('');
                    setVisualNotes('');
                  }}
                  aria-label="Hapus pencarian"
                  className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={startVoiceSearch}
                title="Cari dengan Suara"
                aria-label="Cari dengan Suara"
                className="min-w-[42px] min-h-[42px] rounded-xl bg-orange-50 hover:bg-orange-100 text-[#EE4D2D] flex items-center justify-center cursor-pointer"
              >
                <Mic className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setCameraModalOpen(true)}
                title="Cari dengan Kamera"
                aria-label="Cari dengan Kamera"
                className="min-w-[42px] min-h-[42px] rounded-xl bg-[#111113] hover:bg-zinc-800 text-white flex items-center justify-center cursor-pointer"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 sm:flex-initial min-h-[52px] px-5 rounded-2xl bg-[#EE4D2D] hover:bg-[#D73B1C] text-white font-bold text-sm inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Cari Produk</span>
            </button>
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              aria-label="Filter Harga Akurat"
              className={`min-h-[52px] px-4 rounded-2xl border font-bold text-sm inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                showFilters || minPrice || maxPrice
                  ? 'border-[#EE4D2D] bg-orange-50 text-[#EE4D2D]'
                  : 'border-zinc-300 bg-white text-zinc-700'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filter Harga</span>
            </button>
          </div>
        </form>

        {/* 15 Menu Super App VTC SHOP INDONESIA */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-3 sm:p-4">
          <div className="grid grid-cols-5 gap-x-1.5 gap-y-3 text-center">
            {[
              {
                id: 'mall',
                label: 'VTC MALL',
                icon: BadgeCheck,
                active: onlyMall,
                onClick: () => {
                  setOnlyMall((v) => !v);
                  setOnlyTermurah(false);
                },
              },
              {
                id: 'tv',
                label: 'VTC TV',
                icon: Tv,
                active: false,
                onClick: () => (onNavigate ? onNavigate('tv') : onGoToLive()),
              },
              {
                id: 'live',
                label: 'VTC LIVE',
                icon: Radio,
                active: false,
                onClick: onGoToLive,
              },
              {
                id: 'video',
                label: 'VTC VIDEO',
                icon: Video,
                active: false,
                onClick: () => (onGoToVideo ? onGoToVideo() : onGoToLive()),
              },
              {
                id: 'topupgame',
                label: 'Top Up Game',
                icon: Gamepad2,
                active: false,
                onClick: () =>
                  onOpenTopUpHub
                    ? onOpenTopUpHub('game')
                    : onNavigate
                      ? onNavigate('topup')
                      : setServiceModal('pulsa'),
              },
              {
                id: 'food',
                label: 'VTC Food',
                icon: UtensilsCrossed,
                active: selectedCategory === 'VTC Food',
                onClick: () => {
                  setSearchQuery('');
                  setOnlyMall(false);
                  setOnlyTermurah(false);
                  setOnlyWishlist(false);
                  setSelectedCategory((prev) =>
                    prev === 'VTC Food' ? 'Semua' : 'VTC Food'
                  );
                  setTimeout(() => {
                    document
                      .getElementById('catalog-results-section')
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 60);
                },
              },
              {
                id: 'mart',
                label: 'VTC Mart',
                icon: Leaf,
                active: selectedCategory === 'VTC Mart',
                onClick: () => {
                  setSearchQuery('');
                  setOnlyMall(false);
                  setOnlyTermurah(false);
                  setOnlyWishlist(false);
                  setSelectedCategory((prev) =>
                    prev === 'VTC Mart' ? 'Semua' : 'VTC Mart'
                  );
                  setTimeout(() => {
                    document
                      .getElementById('catalog-results-section')
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 60);
                },
              },
              {
                id: 'pulsa',
                label: 'Pulsa & Tagihan',
                icon: Smartphone,
                active: false,
                onClick: () => {
                  if (onOpenTopUpHub) {
                    onOpenTopUpHub('ppob');
                  } else if (onNavigate) {
                    onNavigate('topup');
                  } else {
                    setPulsaTab('pulsa');
                    setServiceModal('pulsa');
                  }
                },
              },
              {
                id: 'voucher',
                label: 'Voucher',
                icon: Ticket,
                active: false,
                onClick: () => setServiceModal('voucher'),
              },
              {
                id: 'coins',
                label: 'VTC Coins',
                icon: Coins,
                active: false,
                onClick: () => {
                  if (onNavigate) {
                    onNavigate('games');
                  } else if (!coinClaimedToday) {
                    claimDailyCoins();
                  } else {
                    showToast(
                      `Saldo VTC Coins Anda: ${state.vtvCoins.toLocaleString('id-ID')} Koin`
                    );
                  }
                },
              },
              {
                id: 'flash',
                label: 'Flash Sale',
                icon: Flame,
                active: false,
                onClick: () => {
                  setSearchQuery('');
                  setSelectedCategory('Semua');
                  setOnlyMall(false);
                  setOnlyTermurah(false);
                  setOnlyWishlist(false);
                  setTimeout(() => {
                    document
                      .getElementById('flash-sale-section')
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 60);
                },
              },
              {
                id: 'ongkir',
                label: 'Gratis Ongkir XTRA',
                icon: Truck,
                active: false,
                onClick: () => setServiceModal('ongkir'),
              },
              {
                id: 'termurah',
                label: 'Termurah di VTC',
                icon: Tag,
                active: onlyTermurah,
                onClick: () => {
                  setSearchQuery('');
                  setSelectedCategory('Semua');
                  setOnlyTermurah((prev) => {
                    const next = !prev;
                    if (next) setSortBy('price_asc');
                    return next;
                  });
                  setOnlyMall(false);
                  setTimeout(() => {
                    document
                      .getElementById('catalog-results-section')
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 60);
                },
              },
              {
                id: 'supermarket',
                label: 'Supermarket',
                icon: ShoppingBasket,
                active: selectedCategory === 'Supermarket',
                onClick: () => {
                  setSearchQuery('');
                  setOnlyMall(false);
                  setOnlyTermurah(false);
                  setOnlyWishlist(false);
                  setSelectedCategory((prev) =>
                    prev === 'Supermarket' ? 'Semua' : 'Supermarket'
                  );
                  setTimeout(() => {
                    document
                      .getElementById('catalog-results-section')
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 60);
                },
              },
              {
                id: 'halal',
                label: 'VTC Halal',
                icon: MoonStar,
                active: selectedCategory === 'VTC Halal',
                onClick: () => {
                  setSearchQuery('');
                  setOnlyMall(false);
                  setOnlyTermurah(false);
                  setOnlyWishlist(false);
                  setSelectedCategory((prev) =>
                    prev === 'VTC Halal' ? 'Semua' : 'VTC Halal'
                  );
                  setTimeout(() => {
                    document
                      .getElementById('catalog-results-section')
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 60);
                },
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.onClick}
                  className={`flex flex-col items-center gap-1 py-1 px-0.5 rounded-xl transition-colors cursor-pointer group ${
                    item.active
                      ? 'bg-orange-50 dark:bg-orange-950/40'
                      : 'hover:bg-orange-50/60 dark:hover:bg-zinc-800/70'
                  }`}
                >
                  <span
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full border flex items-center justify-center transition-colors ${
                      item.active
                        ? 'bg-[#EE4D2D] border-[#EE4D2D] text-white'
                        : 'bg-orange-50 dark:bg-zinc-800 border-orange-200 dark:border-zinc-700 text-[#EE4D2D] group-hover:bg-[#EE4D2D] group-hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-zinc-800 dark:text-zinc-200 leading-tight line-clamp-2">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => (onNavigate ? onNavigate('pay') : setServiceModal('topup'))}
              className="inline-flex items-center gap-1.5 font-bold text-zinc-700 dark:text-zinc-300 hover:text-[#EE4D2D] cursor-pointer"
            >
              <Wallet className="w-3.5 h-3.5 text-[#EE4D2D]" />
              <span>
                Saldo VTC Pay:{' '}
                <strong className="text-zinc-900 dark:text-white tabular-nums">
                  {formatRupiah(state.vtvpayBalance)}
                </strong>{' '}
                · <span className="text-[#EE4D2D]">Top Up / PayLater</span>
              </span>
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate?.('affiliate')}
                className="text-[#EE4D2D] font-extrabold hover:underline cursor-pointer"
              >
                Affiliate Komisi 20%
              </button>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold tabular-nums hidden sm:inline">
                Cashback: {formatRupiah(state.cashbackBalance ?? 0)}
              </span>
            </div>
          </div>
        </div>
        {/* VTC Coins, Saldo VTC Pay & Klaim Voucher Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* VTC Coins & Saldo */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-zinc-200 p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                <Coins className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">
                  VTC Coins Anda
                </p>
                <p className="text-base font-extrabold text-zinc-900 tabular-nums truncate">
                  {state.vtvCoins.toLocaleString('id-ID')} Koin
                </p>
                <p className="text-[11px] text-emerald-700 font-semibold tabular-nums">
                  VTC Pay: {formatRupiah(state.vtvpayBalance)}
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={coinClaimedToday}
              onClick={claimDailyCoins}
              className={`min-h-[42px] px-3.5 rounded-xl text-xs font-extrabold shrink-0 cursor-pointer ${
                coinClaimedToday
                  ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                  : 'bg-[#EE4D2D] hover:bg-[#D73B1C] text-white'
              }`}
            >
              {coinClaimedToday ? 'Sudah Check-In ✓' : '+500 Koin Harian'}
            </button>
          </div>

          {/* Klaim Voucher Strip */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-zinc-200 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-extrabold text-zinc-900 inline-flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-[#EE4D2D]" />
                Klaim Voucher Gratis Ongkir XTRA & Diskon VTC
              </p>
              <button
                type="button"
                onClick={() => setServiceModal('voucher')}
                className="text-[11px] font-bold text-[#EE4D2D] hover:underline cursor-pointer"
              >
                Lihat Semua
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                {
                  code: 'XTRA-ONGKIR-20',
                  title: 'Gratis Ongkir XTRA Rp 20rb',
                  type: 'shipping' as const,
                  category: 'shipping' as const,
                  amount: 20000,
                  minSpend: 40000,
                },
                {
                  code: 'VTC-HEMAT-30',
                  title: 'Voucher VTC Diskon Rp 30rb',
                  type: 'discount' as const,
                  category: 'vtc' as const,
                  amount: 30000,
                  minSpend: 120000,
                },
                {
                  code: 'BERKAH-TECH25',
                  title: 'Voucher Toko Berkah Rp 25rb',
                  type: 'discount' as const,
                  category: 'store' as const,
                  sellerId: 'seller-berkah-cell',
                  amount: 25000,
                  minSpend: 150000,
                },
              ].map((v) => {
                const claimed = state.vouchers.some((x) => x.code === v.code);
                return (
                  <div
                    key={v.code}
                    className="rounded-xl border border-orange-200 bg-orange-50/50 px-2.5 py-2 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-[11px] font-extrabold text-zinc-900 truncate">
                        {v.title}
                      </p>
                      <p className="text-[10px] text-zinc-500 tabular-nums">
                        Min. {formatRupiah(v.minSpend)}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={claimed}
                      onClick={() => claimPromoVoucher(v)}
                      className="min-h-[32px] px-2.5 rounded-lg bg-[#EE4D2D] disabled:bg-zinc-200 disabled:text-zinc-500 text-white text-[11px] font-bold shrink-0 cursor-pointer"
                    >
                      {claimed ? 'Klaim ✓' : 'Klaim'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Accurate Price Filter Panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl border border-zinc-200 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-extrabold text-zinc-900">
                Filter Harga Akurat & Urutkan
              </p>
              <button
                type="button"
                onClick={() => {
                  setMinPrice('');
                  setMaxPrice('');
                  setSortBy('popular');
                }}
                className="text-xs font-bold text-[#EE4D2D] hover:underline cursor-pointer"
              >
                Reset Harga
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                  Harga Minimum (Rp)
                </label>
                <input
                  type="number"
                  min={0}
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="0"
                  className="w-full h-11 px-3 rounded-xl border border-zinc-200 text-sm tabular-nums focus:outline-none focus:border-[#EE4D2D]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                  Harga Maksimum (Rp)
                </label>
                <input
                  type="number"
                  min={0}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Tanpa batas"
                  className="w-full h-11 px-3 rounded-xl border border-zinc-200 text-sm tabular-nums focus:outline-none focus:border-[#EE4D2D]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                  Urutkan Hasil
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full h-11 px-3 rounded-xl border border-zinc-200 text-sm bg-white"
                >
                  <option value="popular">Terlaris</option>
                  <option value="price_asc">Harga Termurah (Akurat)</option>
                  <option value="price_desc">Harga Termahal</option>
                  <option value="rating">Rating Tertinggi</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Semua Harga', min: '', max: '' },
                { label: '< Rp 150rb', min: '0', max: '150000' },
                { label: 'Rp 150rb – 350rb', min: '150000', max: '350000' },
                { label: '> Rp 350rb', min: '350000', max: '' },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyPricePreset(preset.min, preset.max)}
                  className={`min-h-[36px] px-3 rounded-xl text-xs font-semibold border cursor-pointer ${
                    minPrice === preset.min && maxPrice === preset.max
                      ? 'bg-[#111113] text-white border-[#111113]'
                      : 'bg-zinc-50 text-zinc-700 border-zinc-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Category Filter Strip */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {PRODUCT_CATEGORIES.map((category) => {
            const active = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => {
                  setSelectedCategory(category);
                  setTimeout(() => {
                    document
                      .getElementById('catalog-results-section')
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 40);
                }}
                className={`min-h-[40px] px-4 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#EE4D2D] text-white'
                    : 'bg-white text-zinc-700 border border-zinc-200 hover:border-zinc-300'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </section>

      {/* AI SPEC PANEL OTOMATIS */}
      {(aiLoading || aiSpec || aiError || visualNotes) && (
        <section className="rounded-2xl sm:rounded-3xl bg-white border-2 border-[#EE4D2D]/30 p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#EE4D2D] text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-zinc-900">
                  Ringkasan & Spesifikasi Produk · "{activeAiQuery || searchQuery}"
                </h2>
                {visualNotes && (
                  <p className="text-xs text-[#EE4D2D] font-semibold">
                    Deteksi Kamera: {visualNotes}
                  </p>
                )}
              </div>
            </div>
            {activeAiQuery && (
              <button
                type="button"
                onClick={() => fetchAiSpec(activeAiQuery)}
                className="min-h-[38px] px-3 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-700 inline-flex items-center gap-1 hover:bg-zinc-50 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Perbarui
              </button>
            )}
          </div>

          {aiLoading && (
            <div className="py-6 text-center text-sm font-semibold text-zinc-600">
              Sedang menganalisis spesifikasi, perbandingan harga 3 toko, dan review singkat...
            </div>
          )}

          {aiError && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs sm:text-sm font-semibold text-rose-800">
                {aiError}
              </p>
              <button
                type="button"
                onClick={() => fetchAiSpec(activeAiQuery || searchQuery)}
                className="min-h-[40px] px-4 rounded-xl bg-rose-600 text-white text-xs font-bold cursor-pointer shrink-0"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {aiSpec && !aiLoading && (
            <div className="space-y-4">
              <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed">
                {aiSpec.summary}
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200/70 space-y-2">
                  <h3 className="text-xs font-extrabold text-zinc-900 uppercase tracking-wide">
                    Spesifikasi Produk
                  </h3>
                  <div className="divide-y divide-zinc-200/70 text-xs">
                    {(aiSpec.specs ?? []).map((sp, i) => (
                      <div key={i} className="py-1.5 flex justify-between gap-3">
                        <span className="text-zinc-500">{sp.label}</span>
                        <span className="font-bold text-zinc-900 text-right">
                          {sp.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200/70 space-y-2">
                  <h3 className="text-xs font-extrabold text-zinc-900 uppercase tracking-wide">
                    Perbandingan Harga 3 Toko
                  </h3>
                  <div className="space-y-2">
                    {(aiSpec.priceComparison ?? []).map((st, i) => (
                      <div
                        key={i}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                          st.isRecommended
                            ? 'bg-orange-50 border-[#EE4D2D]/40'
                            : 'bg-white border-zinc-200'
                        }`}
                      >
                        <div>
                          <p className="font-bold text-zinc-900">
                            {st.storeName}{' '}
                            {st.isRecommended && (
                              <span className="text-[#EE4D2D]">· Terbaik</span>
                            )}
                          </p>
                          <p className="text-[11px] text-zinc-500">{st.highlight}</p>
                        </div>
                        <span className="font-extrabold text-[#EE4D2D] tabular-nums shrink-0">
                          {st.priceRange}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5">
                  <p className="font-extrabold text-emerald-900 mb-1">
                    Rekomendasi Terbaik
                  </p>
                  <p className="text-emerald-800 leading-relaxed">
                    {aiSpec.bestRecommendation}
                  </p>
                </div>
                <div className="rounded-xl bg-zinc-100 border border-zinc-200 p-3.5">
                  <p className="font-extrabold text-zinc-900 mb-1">
                    Review Singkat Pembeli
                  </p>
                  <p className="text-zinc-700 leading-relaxed">
                    {aiSpec.shortReview}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* FLASH SALE 80% + COUNTDOWN */}
      {!searchQuery && selectedCategory === 'Semua' && flashSaleProducts.length > 0 && (
        <section
          id="flash-sale-section"
          className="bg-[#111113] text-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#EE4D2D]" />
              <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
                FLASH SALE 80%
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="text-zinc-400">Berakhir dalam</span>
              <span className="font-mono bg-[#EE4D2D] text-white px-2.5 py-1 rounded-lg tabular-nums">
                {state.liteMode ? '04:00:00' : formatCountdown(countdownSec)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {flashSaleProducts.map((product) => {
              const total = product.flashSaleStockTotal || 50;
              const pctLeft = Math.min(
                100,
                Math.max(8, Math.round((product.stock / total) * 100))
              );
              return (
                <div
                  key={product.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 flex flex-col justify-between gap-2.5"
                >
                  <button
                    type="button"
                    onClick={() => onOpenProduct(product.id)}
                    className="text-left space-y-1.5 cursor-pointer"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden bg-zinc-800">
                      <ProductImage src={product.image} alt={product.name} />
                    </div>
                    <p className="text-xs font-bold text-white line-clamp-1 pt-0.5 hover:text-[#EE4D2D]">
                      {product.name}
                    </p>
                    <div>
                      <p className="text-sm sm:text-base font-extrabold text-[#EE4D2D] tabular-nums">
                        {formatRupiah(product.price)}
                      </p>
                      {product.originalPrice && (
                        <p className="text-[11px] text-zinc-400 line-through tabular-nums">
                          {formatRupiah(product.originalPrice)}
                        </p>
                      )}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenStore(product.sellerId)}
                    className="text-left text-[11px] text-zinc-400 hover:text-orange-300 inline-flex items-center gap-1 truncate cursor-pointer"
                  >
                    <Store className="w-3 h-3 text-[#EE4D2D] shrink-0" />
                    <span className="truncate">{product.sellerName}</span>
                  </button>

                  <div className="space-y-1.5">
                    <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-[#EE4D2D]"
                        style={{ width: `${pctLeft}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-zinc-400 tabular-nums">
                      Diskon {product.discountPercent || 80}% · Sisa {product.stock}
                    </p>
                    <button
                      type="button"
                      onClick={() => addToCart(product.id, 1)}
                      className="w-full min-h-[40px] rounded-xl bg-[#EE4D2D] hover:bg-[#D73B1C] text-white text-xs font-bold cursor-pointer"
                    >
                      + Keranjang
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* VTC MALL (100% ORIGINAL) */}
      {!searchQuery && selectedCategory === 'Semua' && mallProducts.length > 0 && (
        <section className="bg-white rounded-2xl sm:rounded-3xl border border-zinc-200 p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-lg bg-[#EE4D2D] text-white text-xs font-extrabold tracking-wide">
                VTC MALL
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-zinc-900">
                  100% Original · Garansi Resmi & Gratis Ongkir XTRA
                </h2>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
              <BadgeCheck className="w-3.5 h-3.5" /> Terjamin Ori 2x Uang Kembali
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {mallProducts.slice(0, 4).map((product) => (
              <article
                key={`mall-${product.id}`}
                className="rounded-2xl border border-zinc-200 bg-zinc-50/50 overflow-hidden flex flex-col justify-between"
              >
                <button
                  type="button"
                  onClick={() => onOpenProduct(product.id)}
                  className="text-left cursor-pointer"
                >
                  <div className="relative aspect-square bg-zinc-100 overflow-hidden">
                    <ProductImage src={product.image} alt={product.name} />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#111113] text-white text-[10px] font-extrabold">
                      MALL · 100% ORI
                    </span>
                  </div>
                  <div className="p-3 space-y-1">
                    <p className="text-xs font-bold text-zinc-900 line-clamp-2 min-h-[32px]">
                      {product.name}
                    </p>
                    <p className="text-sm font-extrabold text-[#EE4D2D] tabular-nums">
                      {formatRupiah(product.price)}
                    </p>
                  </div>
                </button>
                <div className="px-3 pb-3 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenStore(product.sellerId)}
                    className="text-[11px] font-semibold text-zinc-600 hover:text-[#EE4D2D] truncate cursor-pointer"
                  >
                    {product.sellerName}
                  </button>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">
                    Ongkir XTRA
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* VTC LIVE SHOWCASE */}
      {!searchQuery && selectedCategory === 'Semua' && state.liveStreams.length > 0 && (
        <section className="bg-gradient-to-r from-[#111113] to-zinc-900 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EE4D2D] text-white text-xs font-extrabold">
                <Radio className="w-3.5 h-3.5" /> VTC LIVE
              </span>
              <h2 className="text-base sm:text-lg font-extrabold">
                Sedang Tayang · Checkout Harga Live!
              </h2>
            </div>
            <button
              type="button"
              onClick={onGoToLive}
              className="min-h-[38px] px-4 rounded-xl bg-white text-zinc-900 hover:bg-orange-50 text-xs font-extrabold cursor-pointer"
            >
              Tonton Semua Live →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {state.liveStreams.slice(0, 3).map((stream) => {
              const linkedProd = state.products.find(
                (p) => p.id === stream.productId
              );
              return (
                <button
                  key={stream.id}
                  type="button"
                  onClick={onGoToLive}
                  className="text-left bg-zinc-800/90 hover:bg-zinc-800 border border-zinc-700 rounded-2xl p-3 flex items-center gap-3 cursor-pointer"
                >
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-zinc-700 shrink-0">
                    {linkedProd && (
                      <ProductImage src={linkedProd.image} alt={stream.title} />
                    )}
                    <span className="absolute inset-0 bg-black/35 flex items-center justify-center">
                      <Play className="w-5 h-5 text-white fill-white" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold">
                      <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white">
                        LIVE
                      </span>
                      <span className="text-zinc-300 truncate">
                        {stream.platform}
                      </span>
                      <span className="text-zinc-400 inline-flex items-center gap-0.5 ml-auto tabular-nums shrink-0">
                        <Eye className="w-3 h-3" /> {stream.viewerCount}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-white line-clamp-2">
                      {stream.title}
                    </p>
                    {linkedProd && (
                      <p className="text-xs font-extrabold text-[#EE4D2D] tabular-nums">
                        {formatRupiah(linkedProd.price)}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* REKOMENDASI PILIHAN BERDASARKAN RIWAYAT BELANJA */}
      {!searchQuery &&
        selectedCategory === 'Semua' &&
        !onlyMall &&
        !onlyTermurah &&
        !onlyWishlist &&
        recommendedProducts.length > 0 && (
          <section className="bg-white rounded-2xl sm:rounded-3xl border border-zinc-200 p-4 sm:p-5 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#EE4D2D]" />
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-zinc-900">
                    Rekomendasi Untuk Anda
                  </h2>
                  <p className="text-[11px] text-zinc-500">
                    Dipilih otomatis sesuai riwayat belanja, pencarian & produk yang sering Anda lihat
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#EE4D2D] bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-lg">
                Dipersonalisasi
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {recommendedProducts.map((product) => (
                <article
                  key={`rec-${product.id}`}
                  className="rounded-2xl border border-zinc-200 bg-zinc-50/40 overflow-hidden flex flex-col justify-between"
                >
                  <button
                    type="button"
                    onClick={() => onOpenProduct(product.id)}
                    className="text-left cursor-pointer"
                  >
                    <div className="aspect-square bg-zinc-100 overflow-hidden relative">
                      <ProductImage src={product.image} alt={product.name} />
                      {product.isStarSeller && (
                        <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-amber-500 text-white text-[10px] font-extrabold">
                          Star Seller
                        </span>
                      )}
                    </div>
                    <div className="p-3 space-y-1">
                      <p className="text-xs font-bold text-zinc-900 line-clamp-2 min-h-[32px]">
                        {product.name}
                      </p>
                      <p className="text-sm font-extrabold text-[#EE4D2D] tabular-nums">
                        {formatRupiah(product.price)}
                      </p>
                      <p className="text-[10px] text-zinc-500 truncate">
                        {product.sellerName} · ★ {product.rating.toFixed(1)}
                      </p>
                    </div>
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}

      {/* Catalog Grid */}
      <section id="catalog-results-section" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900">
              {onlyWishlist
                ? 'Wishlist Produk Saya'
                : onlyMall
                  ? 'VTC MALL (100% Original)'
                  : onlyTermurah
                    ? 'Termurah di VTC SHOP INDONESIA'
                    : selectedCategory === 'Semua'
                      ? 'Semua Produk Pilihan VTC SHOP INDONESIA'
                      : `Kategori ${selectedCategory}`}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setOnlyWishlist((v) => !v)}
              className={`min-h-[34px] px-3 rounded-xl border text-xs font-bold inline-flex items-center gap-1 cursor-pointer ${
                onlyWishlist
                  ? 'border-rose-300 bg-rose-50 text-rose-700'
                  : 'border-zinc-200 bg-white text-zinc-700'
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  onlyWishlist ? 'fill-rose-500 text-rose-500' : ''
                }`}
              />
              <span>Wishlist ({state.wishlistIds.length})</span>
            </button>

            {(onlyMall || onlyTermurah || onlyWishlist || selectedCategory !== 'Semua' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setOnlyMall(false);
                  setOnlyTermurah(false);
                  setOnlyWishlist(false);
                  setSelectedCategory('Semua');
                  setSearchQuery('');
                  setMinPrice('');
                  setMaxPrice('');
                }}
                className="min-h-[34px] px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-xs font-bold text-zinc-700 cursor-pointer"
              >
                Reset Filter
              </button>
            )}

            <span className="text-xs sm:text-sm text-zinc-500 tabular-nums ml-1">
              {filteredProducts.length} produk
            </span>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-zinc-200 p-10 text-center space-y-3">
            <ShoppingBag className="w-10 h-10 text-zinc-300 mx-auto" />
            <p className="text-base font-semibold text-zinc-800">
              Produk tidak ditemukan
            </p>
            <p className="text-sm text-zinc-500">
              Coba kata kunci atau rentang harga lain, atau lihat ringkasan spesifikasi di atas.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Semua');
                setOnlyMall(false);
                setOnlyTermurah(false);
                setOnlyWishlist(false);
                setMinPrice('');
                setMaxPrice('');
              }}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#EE4D2D] text-white text-sm font-semibold cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filteredProducts.map((product) => {
              const outOfStock = product.stock <= 0;
              const inWishlist = state.wishlistIds.includes(product.id);
              const inCompare = state.compareProductIds.includes(product.id);
              return (
                <article
                  key={product.id}
                  className="bg-white rounded-2xl border border-zinc-200/90 overflow-hidden flex flex-col hover:border-zinc-300"
                >
                  <div className="relative aspect-square bg-zinc-100 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => onOpenProduct(product.id)}
                      className="block w-full h-full text-left cursor-pointer"
                    >
                      <ProductImage
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </button>

                    {/* Quick Wishlist & Compare Corner Buttons */}
                    <div className="absolute top-2 right-2 flex flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={() => toggleWishlist(product.id)}
                        aria-label="Simpan ke Wishlist"
                        title="Simpan ke Wishlist"
                        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm cursor-pointer ${
                          inWishlist
                            ? 'bg-rose-500 text-white'
                            : 'bg-white/90 text-zinc-700 hover:text-rose-500'
                        }`}
                      >
                        <Heart
                          className={`w-4 h-4 ${inWishlist ? 'fill-white' : ''}`}
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleCompareProduct(product.id)}
                        aria-label="Bandingkan Produk"
                        title="Bandingkan hingga 3 produk"
                        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm cursor-pointer ${
                          inCompare
                            ? 'bg-[#EE4D2D] text-white'
                            : 'bg-white/90 text-zinc-700 hover:text-[#EE4D2D]'
                        }`}
                      >
                        <Scale className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1">
                        {product.isMall && (
                          <span className="px-1.5 py-0.5 rounded bg-[#EE4D2D] text-white text-[10px] font-extrabold">
                            VTC MALL
                          </span>
                        )}
                        {product.isStarPlus ? (
                          <span className="px-1.5 py-0.5 rounded bg-amber-600 text-white text-[10px] font-extrabold inline-flex items-center gap-0.5">
                            <Award className="w-2.5 h-2.5" /> Star+
                          </span>
                        ) : (
                          product.isStarSeller && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500 text-white text-[10px] font-extrabold inline-flex items-center gap-0.5">
                              <Award className="w-2.5 h-2.5" /> Star Seller
                            </span>
                          )
                        )}
                        {product.isBuy1Get1 && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[10px] font-extrabold">
                            Beli 1 Gratis 1
                          </span>
                        )}
                        {product.fastDeliveryMins && (
                          <span className="px-1.5 py-0.5 rounded bg-sky-600 text-white text-[10px] font-bold">
                            Antar {product.fastDeliveryMins} mnt
                          </span>
                        )}
                        {product.isHalal && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-700 text-white text-[10px] font-extrabold">
                            Halal MUI
                          </span>
                        )}
                        {product.isWholesale && (
                          <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-bold">
                            Harga Grosir
                          </span>
                        )}
                        {product.isFreeShippingXtra && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-extrabold">
                            Gratis Ongkir XTRA
                          </span>
                        )}
                        {(product.isOriginal || product.isMall) && (
                          <span className="px-1.5 py-0.5 rounded bg-zinc-900 text-white text-[10px] font-bold">
                            100% Ori
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700 text-[10px] font-bold">
                          Bisa COD
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-zinc-500 truncate">
                        {product.category} · Stok {product.stock}
                        {product.discountPercent
                          ? ` · Hemat ${product.discountPercent}%`
                          : ''}
                      </p>
                      <button
                        type="button"
                        onClick={() => onOpenProduct(product.id)}
                        className="text-left block w-full cursor-pointer"
                      >
                        <h3 className="text-sm sm:text-[15px] font-semibold text-zinc-900 leading-snug line-clamp-2 min-h-[40px] hover:text-[#EE4D2D]">
                          {product.name}
                        </h3>
                      </button>

                      <div className="flex items-center gap-2 text-xs text-zinc-600 tabular-nums">
                        <span className="inline-flex items-center gap-1 font-semibold text-zinc-800">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {product.rating.toFixed(1)}
                        </span>
                        <span aria-hidden="true" className="text-zinc-300">·</span>
                        <span>Terjual {product.soldCount}</span>
                      </div>

                      <div className="pt-0.5">
                        <p className="text-base sm:text-lg font-extrabold text-[#EE4D2D] tabular-nums">
                          {formatRupiah(product.price)}
                        </p>
                        {product.originalPrice && (
                          <p className="text-[11px] text-zinc-400 line-through tabular-nums">
                            {formatRupiah(product.originalPrice)}
                          </p>
                        )}
                      </div>

                      {/* Nama Toko di bawah setiap produk (bisa diklik kunjungi toko) */}
                      <button
                        type="button"
                        onClick={() => onOpenStore(product.sellerId)}
                        className="text-left text-[11px] sm:text-xs font-semibold text-zinc-600 hover:text-[#EE4D2D] inline-flex items-center gap-1 pt-0.5 truncate max-w-full cursor-pointer"
                      >
                        <Store className="w-3.5 h-3.5 text-[#EE4D2D] shrink-0" />
                        <span className="truncate">{product.sellerName}</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      disabled={outOfStock}
                      onClick={() => addToCart(product.id, 1)}
                      className={`w-full min-h-[44px] px-3 py-2 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer ${
                        outOfStock
                          ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                          : 'bg-[#EE4D2D] hover:bg-[#D73B1C] text-white'
                      }`}
                    >
                      <Plus className="w-4 h-4 shrink-0" />
                      <span>{outOfStock ? 'Stok Habis' : '+ Keranjang'}</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Quick Services Modals: Pulsa, Voucher, Top Up, Gratis Ongkir */}
      {serviceModal && (
        <div
          className="fixed inset-0 z-50 bg-black/55 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setServiceModal(null)}
        >
          <div
            className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-zinc-900">
                {serviceModal === 'pulsa'
                  ? 'Pulsa, Paket Data & Tagihan'
                  : serviceModal === 'voucher'
                    ? 'Klaim Voucher VTC SHOP INDONESIA'
                    : serviceModal === 'topup'
                      ? 'Top Up Saldo VTCPay'
                      : 'Promo Gratis Ongkir'}
              </h3>
              <button
                type="button"
                onClick={() => setServiceModal(null)}
                className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center rounded-xl text-zinc-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {serviceModal === 'pulsa' && (
              <div className="space-y-3.5">
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPulsaTab('pulsa')}
                    className={`min-h-[38px] rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                      pulsaTab === 'pulsa'
                        ? 'bg-white text-zinc-900 shadow-sm'
                        : 'text-zinc-600'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 text-[#EE4D2D]" />
                    <span>Pulsa & Data</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPulsaTab('tagihan')}
                    className={`min-h-[38px] rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                      pulsaTab === 'tagihan'
                        ? 'bg-white text-zinc-900 shadow-sm'
                        : 'text-zinc-600'
                    }`}
                  >
                    <Receipt className="w-3.5 h-3.5 text-[#EE4D2D]" />
                    <span>Tagihan (PLN / BPJS)</span>
                  </button>
                </div>

                {pulsaTab === 'pulsa' ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const ok = buyPulsa(
                        pulsaProvider,
                        pulsaPhone,
                        pulsaNominal,
                        pulsaNominal
                      );
                      if (ok) {
                        setPulsaPhone('');
                        setServiceModal(null);
                      }
                    }}
                    className="space-y-3.5"
                  >
                    <p className="text-xs text-zinc-600">
                      Bayar instan pakai VTCPay (Saldo:{' '}
                      <strong className="text-zinc-900 tabular-nums">
                        {formatRupiah(state.vtvpayBalance)}
                      </strong>
                      )
                    </p>
                    <div className="grid grid-cols-2 gap-2.5">
                      <select
                        value={pulsaProvider}
                        onChange={(e) => setPulsaProvider(e.target.value)}
                        className="h-11 px-3 rounded-xl border border-zinc-200 text-sm bg-white"
                      >
                        <option>Telkomsel</option>
                        <option>Indosat</option>
                        <option>XL Axiata</option>
                        <option>Tri</option>
                        <option>Smartfren</option>
                      </select>
                      <input
                        type="tel"
                        required
                        value={pulsaPhone}
                        onChange={(e) => setPulsaPhone(e.target.value)}
                        placeholder="Masukkan Nomor HP"
                        className="h-11 px-3 rounded-xl border border-zinc-200 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[10000, 25000, 50000, 100000].map((nom) => (
                        <button
                          key={nom}
                          type="button"
                          onClick={() => setPulsaNominal(nom)}
                          className={`min-h-[46px] rounded-xl border text-xs font-bold tabular-nums cursor-pointer ${
                            pulsaNominal === nom
                              ? 'border-[#EE4D2D] bg-orange-50 text-[#EE4D2D]'
                              : 'border-zinc-200 text-zinc-800'
                          }`}
                        >
                          {formatRupiah(nom)}
                        </button>
                      ))}
                    </div>
                    <button
                      type="submit"
                      className="w-full h-12 rounded-xl bg-[#EE4D2D] hover:bg-[#D73B1C] text-white font-bold text-sm cursor-pointer"
                    >
                      Beli Pulsa {formatRupiah(pulsaNominal)}
                    </button>
                  </form>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const ok = payBill(billService, billNumber, billAmount);
                      if (ok) {
                        setBillNumber('');
                        setServiceModal(null);
                      }
                    }}
                    className="space-y-3.5"
                  >
                    <p className="text-xs text-zinc-600">
                      Bayar tagihan PLN, BPJS, PDAM tanpa antre (Saldo VTCPay:{' '}
                      <strong className="text-zinc-900 tabular-nums">
                        {formatRupiah(state.vtvpayBalance)}
                      </strong>
                      )
                    </p>
                    <select
                      value={billService}
                      onChange={(e) => setBillService(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-zinc-200 text-sm bg-white"
                    >
                      <option value="PLN Token">Listrik PLN Token</option>
                      <option value="PLN Pascabayar">Listrik PLN Pascabayar</option>
                      <option value="BPJS Kesehatan">BPJS Kesehatan</option>
                      <option value="PDAM">Air PDAM</option>
                      <option value="Internet & TV">Internet & TV Kabel</option>
                    </select>
                    <input
                      type="text"
                      required
                      value={billNumber}
                      onChange={(e) => setBillNumber(e.target.value)}
                      placeholder="Masukkan ID Pelanggan / No. Meter"
                      className="w-full h-11 px-3 rounded-xl border border-zinc-200 text-sm"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      {[50000, 100000, 200000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setBillAmount(amt)}
                          className={`min-h-[44px] rounded-xl border text-xs font-bold tabular-nums cursor-pointer ${
                            billAmount === amt
                              ? 'border-[#EE4D2D] bg-orange-50 text-[#EE4D2D]'
                              : 'border-zinc-200 text-zinc-800'
                          }`}
                        >
                          {formatRupiah(amt)}
                        </button>
                      ))}
                    </div>
                    <button
                      type="submit"
                      className="w-full h-12 rounded-xl bg-[#EE4D2D] hover:bg-[#D73B1C] text-white font-bold text-sm cursor-pointer"
                    >
                      Bayar {billService} · {formatRupiah(billAmount)}
                    </button>
                  </form>
                )}
              </div>
            )}

            {serviceModal === 'topup' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  topUpVtvpay(topUpAmount, topUpSource);
                  setServiceModal(null);
                }}
                className="space-y-3.5"
              >
                <p className="text-xs text-zinc-600">
                  Saldo saat ini:{' '}
                  <strong className="text-[#EE4D2D] tabular-nums">
                    {formatRupiah(state.vtvpayBalance)}
                  </strong>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[50000, 100000, 250000, 500000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTopUpAmount(amt)}
                      className={`min-h-[46px] rounded-xl border text-xs font-bold tabular-nums cursor-pointer ${
                        topUpAmount === amt
                          ? 'border-[#EE4D2D] bg-orange-50 text-[#EE4D2D]'
                          : 'border-zinc-200 text-zinc-800'
                      }`}
                    >
                      + {formatRupiah(amt)}
                    </button>
                  ))}
                </div>
                <select
                  value={topUpSource}
                  onChange={(e) => setTopUpSource(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-zinc-200 text-sm bg-white"
                >
                  <option>BCA Virtual Account</option>
                  <option>BRI BRIVA</option>
                  <option>QRIS</option>
                  <option>Alfamart</option>
                  <option>Indomaret</option>
                </select>
                <button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-[#EE4D2D] hover:bg-[#D73B1C] text-white font-bold text-sm cursor-pointer"
                >
                  Top Up {formatRupiah(topUpAmount)}
                </button>
              </form>
            )}

            {serviceModal === 'voucher' && (
              <div className="space-y-3">
                <div className="rounded-xl bg-zinc-50 border border-zinc-200 px-3.5 py-2.5 flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-600">Voucher Saya Saat Ini:</span>
                  <strong className="text-[#EE4D2D] tabular-nums">
                    {state.vouchers.filter((v) => !v.used).length} Voucher Aktif
                  </strong>
                </div>
                {[
                  {
                    code: 'XTRA-ONGKIR-20',
                    title: 'Gratis Ongkir XTRA Rp 20rb',
                    type: 'shipping' as const,
                    amount: 20000,
                    minSpend: 40000,
                  },
                  {
                    code: 'VTC-HEMAT-30',
                    title: 'Voucher Belanja Hemat Rp 30.000',
                    type: 'discount' as const,
                    amount: 30000,
                    minSpend: 120000,
                  },
                  {
                    code: 'ONGKIR-KILAT',
                    title: 'Voucher Gratis Ongkir J&T / SiCepat',
                    type: 'shipping' as const,
                    amount: 15000,
                    minSpend: 30000,
                  },
                ].map((v) => {
                  const claimed = state.vouchers.some((x) => x.code === v.code);
                  return (
                    <div
                      key={v.code}
                      className="rounded-2xl border border-orange-200 bg-orange-50/40 p-3.5 flex items-center justify-between gap-3"
                    >
                      <div>
                        <p className="font-mono text-xs font-bold text-[#EE4D2D]">
                          {v.code}
                        </p>
                        <p className="text-sm font-bold text-zinc-900">
                          {v.title}
                        </p>
                        <p className="text-xs text-zinc-500 tabular-nums">
                          Min. belanja {formatRupiah(v.minSpend)}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={claimed}
                        onClick={() => claimPromoVoucher(v)}
                        className="min-h-[40px] px-4 rounded-xl bg-[#EE4D2D] disabled:bg-zinc-200 disabled:text-zinc-500 text-white text-xs font-bold shrink-0 cursor-pointer"
                      >
                        {claimed ? 'Diklaim' : 'Klaim'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {serviceModal === 'ongkir' && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 space-y-1.5">
                  <p className="text-sm font-extrabold text-emerald-950">
                    Gratis Ongkir Otomatis Setiap Hari!
                  </p>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Belanja minimal Rp 150.000 langsung mendapat Gratis Ongkir J&T, SiCepat, atau JNE di halaman Checkout. Atau klaim voucher di bawah untuk belanja mulai Rp 30.000!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    claimPromoVoucher({
                      code: 'ONGKIR-KILAT',
                      title: 'Voucher Gratis Ongkir J&T / SiCepat',
                      type: 'shipping',
                      amount: 15000,
                      minSpend: 30000,
                    });
                    setServiceModal(null);
                  }}
                  className="w-full h-12 rounded-xl bg-[#EE4D2D] hover:bg-[#D73B1C] text-white font-bold text-sm cursor-pointer"
                >
                  Klaim Voucher Gratis Ongkir Sekarang
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Voice Search Modal */}
      {voiceModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => {
            recognitionRef.current?.stop?.();
            setVoiceModalOpen(false);
          }}
        >
          <div
            className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-5 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-2xl bg-orange-50 text-[#EE4D2D] mx-auto flex items-center justify-center">
              <Mic className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-extrabold text-zinc-900">
                Pencarian Suara VTC SHOP INDONESIA
              </h3>
              <p className="text-sm text-zinc-700 font-medium">
                {voiceStatusMsg}
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {['Earbuds TWS', 'Sepatu Lari', 'Tumbler Stainless', 'Keyboard'].map(
                (phrase) => (
                  <button
                    key={phrase}
                    type="button"
                    onClick={() => {
                      setVoiceModalOpen(false);
                      setSearchQuery(phrase);
                      fetchAiSpec(phrase);
                    }}
                    className="min-h-[38px] px-3 rounded-xl bg-zinc-100 hover:bg-orange-50 hover:text-[#EE4D2D] text-xs font-bold text-zinc-700 cursor-pointer"
                  >
                    "{phrase}"
                  </button>
                )
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  recognitionRef.current?.stop?.();
                  setVoiceModalOpen(false);
                }}
                className="min-h-[48px] rounded-xl border border-zinc-200 font-bold text-sm text-zinc-700 cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                disabled={voiceListening}
                onClick={startVoiceSearch}
                className="min-h-[48px] rounded-xl bg-[#EE4D2D] text-white font-bold text-sm cursor-pointer disabled:opacity-60"
              >
                {voiceListening ? 'Mendengarkan...' : 'Ucapkan Lagi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera Visual Search Modal */}
      {cameraModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setCameraModalOpen(false)}
        >
          <div
            className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-zinc-900">
                Cari Produk dengan Kamera
              </h3>
              <button
                type="button"
                onClick={() => setCameraModalOpen(false)}
                className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center rounded-xl text-zinc-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600">
              Ambil foto atau pilih gambar produk dari galeri Anda. Sistem akan mengenali barangnya dan mencari produk mirip di VTC SHOP INDONESIA.
            </p>

            {cameraPreview && (
              <div className="aspect-square max-h-52 mx-auto rounded-2xl overflow-hidden border border-zinc-200">
                <img
                  src={cameraPreview}
                  alt="Preview kamera"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <label className="w-full min-h-[52px] px-4 rounded-2xl bg-[#EE4D2D] hover:bg-[#D73B1C] text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer">
              <Camera className="w-5 h-5" />
              <span>
                {cameraLoading
                  ? 'Sedang Mengenali Produk...'
                  : 'Ambil Foto / Pilih Gambar Produk'}
              </span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                disabled={cameraLoading}
                onChange={handleCameraFile}
                className="sr-only"
              />
            </label>
          </div>
        </div>
      )}

      {/* Sticky Compare Bar (up to 3 products) */}
      {state.compareProductIds.length > 0 && (
        <div className="fixed bottom-[70px] md:bottom-5 left-4 z-30">
          <button
            type="button"
            onClick={() => setCompareModalOpen(true)}
            className="min-h-[46px] px-4 rounded-2xl bg-[#111113] hover:bg-zinc-800 text-white shadow-xl border border-zinc-700 text-xs sm:text-sm font-extrabold inline-flex items-center gap-2 cursor-pointer"
          >
            <Scale className="w-4 h-4 text-[#EE4D2D]" />
            <span>Bandingkan Produk ({state.compareProductIds.length}/3)</span>
          </button>
        </div>
      )}

      <CompareProductsModal
        open={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        onOpenProduct={(id) => {
          setCompareModalOpen(false);
          onOpenProduct(id);
        }}
      />
    </div>
  );
};
