import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Star,
  Truck,
  ShieldCheck,
  Store,
  MessageCircle,
  Play,
  Pause,
  Image as ImageIcon,
  Video,
  Ticket,
  Ruler,
  Package,
  MapPin,
  Minus,
  Plus,
  ShoppingCart,
  Camera,
  X,
  CheckCircle2,
  Share2,
  Copy,
  Coins,
  BadgeCheck,
  Heart,
  Scale,
  Bell,
  BellRing,
  Clock,
  Award,
  ZoomIn,
} from 'lucide-react';
import { useMarketplace } from '../store/marketplaceStore';
import { formatDateId, formatRupiah } from '../types';
import { ProductImage } from './ProductImage';
import { CompareProductsModal } from './CompareProductsModal';
import { MediaPlayer } from './MediaPlayer';

interface ProductDetailViewProps {
  productId: string;
  onBack: () => void;
  onOpenProduct?: (productId: string) => void;
  onOpenStore: (sellerId: string) => void;
  onOpenCheckout: () => void;
  onOpenChat: (sellerId: string, productName?: string) => void;
}

const COLOR_SWATCH: Record<string, string> = {
  Hitam: '#18181b',
  Putih: '#f4f4f5',
  Pink: '#ec4899',
  Oranye: '#EE4D2D',
  Biru: '#2563eb',
};

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  productId,
  onBack,
  onOpenProduct,
  onOpenStore,
  onOpenCheckout,
  onOpenChat,
}) => {
  const {
    state,
    currentUser,
    addToCart,
    claimPromoVoucher,
    addProductReview,
    recordAffiliateShare,
    trackProductView,
    toggleWishlist,
    toggleCompareProduct,
    togglePriceAlert,
    showToast,
  } = useMarketplace();

  const product = state.products.find((p) => p.id === productId) ?? null;
  const seller = product
    ? state.sellers.find((s) => s.id === product.sellerId) ?? null
    : null;

  const colors = product?.colors?.length
    ? product.colors
    : ['Hitam', 'Putih', 'Pink'];
  const sizes = product?.sizes?.length ? product.sizes : ['S', 'M', 'L', 'XL'];

  const [mediaMode, setMediaMode] = useState<'photo' | 'video'>('photo');
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [photoZoomed, setPhotoZoomed] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [qty, setQty] = useState(1);
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);

  // Add Review Form State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [revRating, setRevRating] = useState(5);
  const [revComment, setRevComment] = useState('');
  const [revPhoto, setRevPhoto] = useState('');
  const [revHasVideo, setRevHasVideo] = useState(false);
  const [revVideoCaption, setRevVideoCaption] = useState('');

  // Bagikan & Dapat Komisi Modal + Review Lightbox Video Flag + Bandingkan + Price Alert
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [lightboxIsVideo, setLightboxIsVideo] = useState(false);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [alertInputOpen, setAlertInputOpen] = useState(false);
  const [targetAlertPrice, setTargetAlertPrice] = useState('');

  useEffect(() => {
    if (!product) return;
    trackProductView(product.id);
    const c = product.colors?.length ? product.colors : ['Hitam', 'Putih', 'Pink'];
    const s = product.sizes?.length ? product.sizes : ['S', 'M', 'L', 'XL'];
    setSelectedColor(c[0]);
    setSelectedSize(s[0]);
    setQty(1);
    setMediaMode('photo');
    setActivePhotoIdx(0);
    setPhotoZoomed(false);
    setVideoPlaying(false);
    setAlertInputOpen(false);
    setTargetAlertPrice('');
  }, [product?.id]);

  const sellerProductCount = useMemo(() => {
    if (!product) return 0;
    return state.products.filter((p) => p.sellerId === product.sellerId).length;
  }, [state.products, product]);

  if (!product) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center space-y-3">
        <p className="text-base font-bold text-zinc-900">
          Produk tidak ditemukan
        </p>
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] px-5 rounded-xl bg-[#EE4D2D] text-white text-sm font-bold cursor-pointer"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  const variantKey = `${selectedColor}-${selectedSize}`;
  const availableVariantStock =
    product.variantStocks && product.variantStocks[variantKey] !== undefined
      ? product.variantStocks[variantKey]
      : product.stock;

  const discountPct =
    product.discountPercent ??
    (product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) * 100
        )
      : 0);

  const sizeChartRows =
    product.sizeChart && product.sizeChart.length > 0
      ? product.sizeChart
      : [
          { size: 'S', panjangCm: '66 cm', lebarCm: '48 cm' },
          { size: 'M', panjangCm: '69 cm', lebarCm: '51 cm' },
          { size: 'L', panjangCm: '72 cm', lebarCm: '54 cm' },
          { size: 'XL', panjangCm: '75 cm', lebarCm: '57 cm' },
        ];

  const specs = product.specs ?? {
    material: 'Material Berkualitas Tinggi',
    weight: '350 gram',
    warranty: 'Garansi Toko 30 Hari',
    originCity: seller?.city || 'Jakarta',
  };

  const reviews = product.reviews ?? [];
  const storeVoucher = seller?.storeVoucher;
  const voucherClaimed = storeVoucher
    ? state.vouchers.some((v) => v.code === storeVoucher.code)
    : false;

  const storeInitials = (seller?.storeName || product.sellerName)
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');

  const handleAddToCart = () => {
    if (availableVariantStock <= 0) {
      showToast('Stok variasi yang dipilih sedang habis', 'warning');
      return;
    }
    addToCart(product.id, qty, selectedColor, selectedSize);
  };

  const handleBuyNow = () => {
    if (availableVariantStock <= 0) {
      showToast('Stok variasi yang dipilih sedang habis', 'warning');
      return;
    }
    addToCart(product.id, qty, selectedColor, selectedSize);
    onOpenCheckout();
  };

  const handleReviewPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setRevPhoto(String(reader.result));
    reader.readAsDataURL(file);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revComment.trim()) return;
    addProductReview(product.id, {
      buyerName: currentUser?.name || 'Pembeli VTC SHOP INDONESIA',
      rating: revRating,
      variantLabel: `Warna: ${selectedColor}, Ukuran: ${selectedSize}`,
      comment: revComment.trim(),
      photo: revPhoto || product.image,
      hasVideo: revHasVideo,
      videoCaption: revHasVideo
        ? revVideoCaption.trim() || `Video ulasan ${product.name}`
        : undefined,
    });
    setRevComment('');
    setRevPhoto('');
    setRevHasVideo(false);
    setRevVideoCaption('');
    setShowReviewForm(false);
  };

  const estimatedCommission = Math.max(2000, Math.round(product.price * 0.05));
  const affiliateLink = `https://vtcshop.id/produk/${product.id}?ref=${encodeURIComponent(
    (currentUser?.name || 'vtc').toLowerCase().replace(/\s+/g, '-')
  )}`;

  const handleCopyAffiliate = () => {
    navigator.clipboard?.writeText(affiliateLink).catch(() => {});
    recordAffiliateShare(product.id, estimatedCommission);
    setShareModalOpen(false);
  };

  return (
    <div className="space-y-4 pb-20 md:pb-6">
      {/* Top Back Bar */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[42px] px-3.5 rounded-xl bg-white border border-zinc-200 hover:border-zinc-300 text-xs sm:text-sm font-bold text-zinc-800 inline-flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>
        <div className="flex items-center gap-2 min-w-0">
          <span className="hidden sm:inline text-xs font-semibold text-zinc-500 truncate">
            {product.category} · {seller?.city || specs.originCity}
          </span>
          <button
            type="button"
            onClick={() => setShareModalOpen(true)}
            className="min-h-[40px] px-3 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-900 text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Share2 className="w-3.5 h-3.5 text-[#EE4D2D]" />
            <span>Bagikan & Dapat Komisi</span>
          </button>
        </div>
      </div>

      {/* Main Split Card: Foto 1:1 + Video | Info Harga + Variasi */}
      <section className="bg-white rounded-2xl sm:rounded-3xl border border-zinc-200 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left: Foto Banyak + Zoom + Video Produk */}
        <div className="lg:col-span-5 p-4 sm:p-5 border-b lg:border-b-0 lg:border-r border-zinc-100 space-y-3">
          {(() => {
            const gallery =
              product.images && product.images.length > 0
                ? product.images
                : [product.image];
            const activePhotoSrc = gallery[activePhotoIdx] || product.image;
            return (
              <>
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200/70">
                  {mediaMode === 'photo' ? (
                    <div
                      onClick={() => setPhotoZoomed((z) => !z)}
                      className="w-full h-full cursor-zoom-in overflow-hidden"
                      title="Klik untuk Zoom 2x"
                    >
                      <ProductImage
                        src={activePhotoSrc}
                        alt={product.name}
                        className={`w-full h-full object-cover transition-transform duration-300 ${
                          photoZoomed ? 'scale-150 cursor-zoom-out' : 'scale-100'
                        }`}
                      />
                    </div>
                  ) : (
                    <MediaPlayer
                      src={product.videoUrl || '/videos/vtc-product-demo.mp4'}
                      fallbackSrc="/videos/vtc-short-tiktok.mp4"
                      poster={activePhotoSrc}
                      autoPlay={videoPlaying}
                      loop
                      aspectClassName="aspect-square"
                      badgeText="Video Produk"
                      title={product.name}
                      className="rounded-none w-full h-full"
                    />
                  )}

                  {discountPct > 0 && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-[#EE4D2D] text-white text-xs font-extrabold tabular-nums">
                      -{discountPct}%
                    </span>
                  )}

                  {mediaMode === 'photo' && (
                    <button
                      type="button"
                      onClick={() => {
                        setLightboxIsVideo(false);
                        setLightboxPhoto(activePhotoSrc);
                      }}
                      className="absolute bottom-3 right-3 px-2.5 py-1.5 rounded-xl bg-black/70 hover:bg-black/85 text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                      <span>{photoZoomed ? 'Zoom 2x · Layar Penuh' : 'Zoom Foto'}</span>
                    </button>
                  )}
                </div>

                {/* Multi-photo Thumbnails */}
                {gallery.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                    {gallery.map((imgUrl, idx) => (
                      <button
                        key={`${imgUrl}-${idx}`}
                        type="button"
                        onClick={() => {
                          setMediaMode('photo');
                          setActivePhotoIdx(idx);
                          setPhotoZoomed(false);
                        }}
                        className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer ${
                          mediaMode === 'photo' && activePhotoIdx === idx
                            ? 'border-[#EE4D2D]'
                            : 'border-zinc-200 opacity-75 hover:opacity-100'
                        }`}
                      >
                        <ProductImage src={imgUrl} alt={`${product.name} ${idx + 1}`} />
                      </button>
                    ))}
                  </div>
                )}

                {/* Switcher Foto 1:1 vs Video */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMediaMode('photo');
                      setVideoPlaying(false);
                    }}
                    className={`min-h-[42px] px-3 rounded-xl border text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                      mediaMode === 'photo'
                        ? 'border-[#EE4D2D] bg-orange-50 text-[#EE4D2D]'
                        : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Foto ({gallery.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMediaMode('video');
                      setVideoPlaying(true);
                    }}
                    className={`min-h-[42px] px-3 rounded-xl border text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                      mediaMode === 'video'
                        ? 'border-[#EE4D2D] bg-orange-50 text-[#EE4D2D]'
                        : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    <span>Video Produk</span>
                  </button>
                </div>
              </>
            );
          })()}
        </div>

        {/* Right: Price, COD & Gratis Ongkir Labels, Variations, Stock */}
        <div className="lg:col-span-7 p-4 sm:p-6 space-y-5">
          {/* Price Banner */}
          <div className="bg-orange-50/70 border border-orange-100 rounded-2xl p-4 space-y-2">
            <div className="flex flex-wrap items-baseline gap-2.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#EE4D2D] tabular-nums">
                {formatRupiah(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm sm:text-base text-zinc-400 line-through tabular-nums">
                  {formatRupiah(product.originalPrice)}
                </span>
              )}
              {discountPct > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-[#EE4D2D] text-white text-xs font-extrabold tabular-nums">
                  DISKON {discountPct}%
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {(product.isMall || seller?.isMall) && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EE4D2D] text-white text-[11px] font-extrabold">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  VTC MALL
                </span>
              )}
              {(product.isStarPlus || seller?.isStarPlus) && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-600 text-white text-[11px] font-extrabold">
                  <Award className="w-3.5 h-3.5" />
                  Star+
                </span>
              )}
              {(product.isStarSeller || seller?.isStarSeller) && !product.isStarPlus && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 text-white text-[11px] font-extrabold">
                  <Award className="w-3.5 h-3.5" />
                  Star Seller
                </span>
              )}
              {product.isHalal && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-700 text-white text-[11px] font-extrabold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Halal MUI
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold">
                <Truck className="w-3.5 h-3.5" />
                Gratis Ongkir XTRA
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-bold">
                <Clock className="w-3.5 h-3.5" />
                Garansi Tepat Waktu
              </span>
              {(product.isOriginal || product.isMall) && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 text-white text-[11px] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  100% Original
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#111113] text-white text-[11px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#EE4D2D]" />
                Bisa COD
              </span>
            </div>
          </div>

          {/* Title & Rating */}
          <div className="space-y-2">
            <h1 className="text-lg sm:text-2xl font-extrabold text-zinc-900 leading-snug">
              {product.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-zinc-600 tabular-nums">
              <span className="inline-flex items-center gap-1 font-bold text-zinc-900">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                {product.rating.toFixed(1)}
              </span>
              <span className="text-zinc-300">|</span>
              <span>{reviews.length} Ulasan</span>
              <span className="text-zinc-300">|</span>
              <span>{product.soldCount} Terjual</span>
            </div>
          </div>

          {/* Variasi Warna */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-800">
                Variasi Warna: <span className="text-[#EE4D2D]">{selectedColor}</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => {
                const active = selectedColor === color;
                const dotColor = COLOR_SWATCH[color] || '#d4d4d8';
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      setSelectedColor(color);
                      setQty(1);
                    }}
                    className={`min-h-[42px] px-3.5 rounded-xl border text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer ${
                      active
                        ? 'border-[#EE4D2D] bg-orange-50 text-[#EE4D2D] ring-1 ring-[#EE4D2D]'
                        : 'border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-zinc-300 shrink-0"
                      style={{ backgroundColor: dotColor }}
                    />
                    <span>{color}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Variasi Ukuran */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-800">
                Ukuran / Varian: <span className="text-[#EE4D2D]">{selectedSize}</span>
              </span>
              <span className="font-bold text-emerald-700 tabular-nums">
                Stok variasi tersedia: {availableVariantStock}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => {
                const active = selectedSize === size;
                const stockForBtn =
                  product.variantStocks?.[`${selectedColor}-${size}`] ??
                  product.stock;
                return (
                  <button
                    key={size}
                    type="button"
                    disabled={stockForBtn <= 0}
                    onClick={() => {
                      setSelectedSize(size);
                      setQty(1);
                    }}
                    className={`min-h-[42px] px-4 rounded-xl border text-xs sm:text-sm font-bold cursor-pointer ${
                      stockForBtn <= 0
                        ? 'border-zinc-200 bg-zinc-100 text-zinc-400 cursor-not-allowed line-through'
                        : active
                          ? 'border-[#EE4D2D] bg-orange-50 text-[#EE4D2D] ring-1 ring-[#EE4D2D]'
                          : 'border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Jumlah Beli + Stok per Variasi */}
          <div className="flex items-center justify-between bg-zinc-50 rounded-2xl p-3.5 border border-zinc-200/80">
            <div>
              <p className="text-xs sm:text-sm font-bold text-zinc-900">
                Jumlah Beli
              </p>
              <p className="text-[11px] text-zinc-500 tabular-nums">
                Stok ({selectedColor} · {selectedSize}):{' '}
                <strong className="text-zinc-800">{availableVariantStock} pcs</strong>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Kurangi jumlah"
                className="min-w-[42px] min-h-[42px] rounded-xl bg-white border border-zinc-200 flex items-center justify-center cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-9 text-center font-extrabold text-sm tabular-nums">
                {qty}
              </span>
              <button
                type="button"
                onClick={() =>
                  setQty((q) => Math.min(Math.max(1, availableVariantStock), q + 1))
                }
                aria-label="Tambah jumlah"
                className="min-w-[42px] min-h-[42px] rounded-xl bg-white border border-zinc-200 flex items-center justify-center cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Desktop Action Row */}
          <div className="hidden md:grid grid-cols-12 gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => onOpenChat(product.sellerId, product.name)}
              className="col-span-3 min-h-[48px] px-3 rounded-xl border border-zinc-300 hover:bg-zinc-50 text-zinc-800 font-bold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-[#EE4D2D]" />
              <span>Chat Seller</span>
            </button>
            <button
              type="button"
              disabled={availableVariantStock <= 0}
              onClick={handleAddToCart}
              className="col-span-4 min-h-[48px] px-4 rounded-xl border-2 border-[#EE4D2D] text-[#EE4D2D] hover:bg-orange-50 font-bold text-sm inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Tambah Keranjang</span>
            </button>
            <button
              type="button"
              disabled={availableVariantStock <= 0}
              onClick={handleBuyNow}
              className="col-span-5 min-h-[48px] px-4 rounded-xl bg-[#EE4D2D] hover:bg-[#D73B1C] text-white font-bold text-sm cursor-pointer"
            >
              Beli Sekarang
            </button>
          </div>
          {/* Wishlist, Bandingkan 3 Produk, & Pengingat Harga Turun */}
          {(() => {
            const inWishlist = state.wishlistIds.includes(product.id);
            const inCompare = state.compareProductIds.includes(product.id);
            const activeAlert = state.priceAlerts[product.id];
            return (
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product.id)}
                    className={`min-h-[42px] px-3 rounded-xl border text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                      inWishlist
                        ? 'border-rose-300 bg-rose-50 text-rose-700'
                        : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        inWishlist ? 'fill-rose-500 text-rose-500' : ''
                      }`}
                    />
                    <span>{inWishlist ? 'Di Wishlist ✓' : 'Simpan ke Wishlist'}</span>
                  </button>

                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => toggleCompareProduct(product.id)}
                      className={`flex-1 min-h-[42px] px-3 rounded-xl border text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                        inCompare
                          ? 'border-[#EE4D2D] bg-orange-50 text-[#EE4D2D]'
                          : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700'
                      }`}
                    >
                      <Scale className="w-4 h-4" />
                      <span>
                        {inCompare
                          ? `Dibandingkan (${state.compareProductIds.length}/3)`
                          : `Bandingkan (${state.compareProductIds.length}/3)`}
                      </span>
                    </button>
                    {state.compareProductIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setCompareModalOpen(true)}
                        className="min-h-[42px] px-3 rounded-xl bg-[#111113] text-white text-xs font-bold cursor-pointer shrink-0"
                      >
                        Lihat
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (activeAlert) {
                        togglePriceAlert(product.id);
                        setAlertInputOpen(false);
                      } else {
                        setAlertInputOpen((v) => !v);
                      }
                    }}
                    className={`min-h-[42px] px-3 rounded-xl border text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeAlert
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                        : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700'
                    }`}
                  >
                    {activeAlert ? (
                      <BellRing className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Bell className="w-4 h-4 text-[#EE4D2D]" />
                    )}
                    <span>
                      {activeAlert
                        ? `Pengingat Aktif (< ${formatRupiah(activeAlert.targetPrice)})`
                        : 'Pengingat Harga Turun'}
                    </span>
                  </button>
                </div>

                {alertInputOpen && !activeAlert && (
                  <div className="rounded-xl border border-orange-200 bg-orange-50/60 p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="number"
                      min={1000}
                      value={targetAlertPrice}
                      onChange={(e) => setTargetAlertPrice(e.target.value)}
                      placeholder={`Target harga turun (default ${formatRupiah(
                        Math.round(product.price * 0.9)
                      )})`}
                      className="flex-1 h-10 px-3 rounded-lg border border-zinc-200 bg-white text-xs focus:outline-none focus:border-[#EE4D2D]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const parsed = Number(targetAlertPrice.replace(/\D/g, ''));
                        togglePriceAlert(
                          product.id,
                          parsed >= 1000 ? parsed : undefined
                        );
                        setAlertInputOpen(false);
                        setTargetAlertPrice('');
                      }}
                      className="h-10 px-4 rounded-lg bg-[#EE4D2D] text-white text-xs font-bold cursor-pointer shrink-0"
                    >
                      Aktifkan Pengingat
                    </button>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Bagikan & Dapat Komisi Strip */}
          <button
            type="button"
            onClick={() => setShareModalOpen(true)}
            className="w-full rounded-2xl border border-amber-200 bg-amber-50/70 hover:bg-amber-50 px-4 py-3 flex items-center justify-between gap-3 text-left cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Coins className="w-5 h-5 text-amber-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-zinc-900">
                  Bagikan Produk & Dapat Komisi 5% ({formatRupiah(estimatedCommission)}/terjual)
                </p>
                <p className="text-[11px] text-zinc-600 truncate">
                  Salin link & bagikan ke teman untuk langsung bonus +100 VTC Coins
                </p>
              </div>
            </div>
            <span className="px-3 py-1.5 rounded-xl bg-[#111113] text-white text-[11px] font-bold shrink-0">
              Bagikan
            </span>
          </button>
        </div>
      </section>

      {/* HEADER TOKO SELLER */}
      <section className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shrink-0 shadow-sm"
              style={{ backgroundColor: seller?.avatarColor || '#EE4D2D' }}
            >
              {storeInitials || <Store className="w-6 h-6" />}
            </div>
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-zinc-900 truncate">
                  {seller?.storeName || product.sellerName}
                </h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-3 h-3" /> Toko Terverifikasi
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-600 tabular-nums">
                <span className="inline-flex items-center gap-1 font-bold text-zinc-900">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  Rating {(seller?.rating ?? 4.9).toFixed(1)}
                </span>
                <span className="text-zinc-300">·</span>
                <span className="inline-flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-[#EE4D2D]" />
                  {sellerProductCount} Produk
                </span>
                <span className="text-zinc-300">·</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                  {seller?.city || specs.originCity}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onOpenChat(product.sellerId, product.name)}
              className="min-h-[44px] px-4 rounded-xl border border-[#EE4D2D] text-[#EE4D2D] hover:bg-orange-50 text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat Toko</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenStore(product.sellerId)}
              className="min-h-[44px] px-4 rounded-xl bg-[#111113] hover:bg-zinc-800 text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Store className="w-4 h-4 text-[#EE4D2D]" />
              <span>Kunjungi Toko</span>
            </button>
          </div>
        </div>

        {/* Voucher Toko yang bisa diklaim */}
        {storeVoucher && (
          <div className="rounded-2xl bg-orange-50/70 border border-orange-200 p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#EE4D2D] text-white flex items-center justify-center shrink-0">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-extrabold text-zinc-900">
                  {storeVoucher.title}
                </p>
                <p className="text-[11px] text-zinc-600 tabular-nums">
                  Kode: <strong className="font-mono">{storeVoucher.code}</strong> · Min. belanja{' '}
                  {formatRupiah(storeVoucher.minSpend)}
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={voucherClaimed}
              onClick={() =>
                claimPromoVoucher({
                  code: storeVoucher.code,
                  title: storeVoucher.title,
                  type: 'discount',
                  amount: storeVoucher.amount,
                  minSpend: storeVoucher.minSpend,
                })
              }
              className="min-h-[40px] px-4 rounded-xl bg-[#EE4D2D] hover:bg-[#D73B1C] disabled:bg-zinc-200 disabled:text-zinc-500 text-white text-xs font-bold cursor-pointer"
            >
              {voucherClaimed ? 'Sudah Diklaim' : 'Klaim Voucher Toko'}
            </button>
          </div>
        )}
      </section>

      {/* Size Chart & Spesifikasi Produk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Size Chart */}
        <section className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-[#EE4D2D]" />
            <h2 className="text-base font-extrabold text-zinc-900">
              Size Chart (Panjang × Lebar cm)
            </h2>
          </div>
          <div className="overflow-hidden rounded-xl border border-zinc-200">
            <table className="w-full text-xs sm:text-sm text-left">
              <thead className="bg-zinc-50 text-zinc-600 font-bold border-b border-zinc-200">
                <tr>
                  <th className="py-2.5 px-3.5">Ukuran / Tipe</th>
                  <th className="py-2.5 px-3.5">Panjang</th>
                  <th className="py-2.5 px-3.5">Lebar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 tabular-nums">
                {sizeChartRows.map((row) => (
                  <tr key={row.size} className="bg-white">
                    <td className="py-2.5 px-3.5 font-bold text-zinc-900">
                      {row.size}
                    </td>
                    <td className="py-2.5 px-3.5 text-zinc-700">
                      {row.panjangCm}
                    </td>
                    <td className="py-2.5 px-3.5 text-zinc-700">
                      {row.lebarCm}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Spesifikasi Lengkap & Info Pengirim */}
        <section className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 space-y-3">
          <h2 className="text-base font-extrabold text-zinc-900">
            Spesifikasi Lengkap & Pengirim
          </h2>
          <div className="divide-y divide-zinc-100 text-xs sm:text-sm">
            {[
              { label: 'Jenis / Kategori Produk', value: product.category },
              {
                label: 'Pengirim (Toko)',
                value: `${seller?.storeName || product.sellerName} (${seller?.phone || 'Terverifikasi'})`,
              },
              {
                label: 'Kota Asal Pengirim',
                value: seller?.city || specs.originCity,
              },
              { label: 'Stok Tersedia', value: `${product.stock} unit (Real-time)` },
              { label: 'Bahan / Material', value: specs.material },
              {
                label: 'Ukuran / Dimensi',
                value: specs.dimensions || sizes.join(', '),
              },
              { label: 'Berat Produk', value: specs.weight },
              { label: 'Garansi Resmi', value: specs.warranty },
            ].map((row) => (
              <div
                key={row.label}
                className="py-2.5 flex items-start justify-between gap-4"
              >
                <span className="text-zinc-500 shrink-0">{row.label}</span>
                <span className="font-semibold text-zinc-900 text-right">
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Deskripsi Panjang dari Seller */}
      <section className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 space-y-3">
        <h2 className="text-base font-extrabold text-zinc-900">
          Deskripsi Produk dari {seller?.storeName || product.sellerName}
        </h2>
        <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed whitespace-pre-line">
          {product.description}
        </p>
      </section>

      {/* Ulasan Pembeli dengan Foto & Video */}
      <section className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-extrabold text-zinc-900">
              Ulasan Foto & Video Pembeli ({reviews.length})
            </h2>
            <p className="text-xs text-zinc-500">
              Rating produk {product.rating.toFixed(1)} / 5.0 dari pembeli terverifikasi
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowReviewForm((v) => !v)}
            className="min-h-[40px] px-3.5 rounded-xl border border-zinc-200 hover:border-[#EE4D2D] text-xs font-bold text-zinc-800 cursor-pointer"
          >
            {showReviewForm ? 'Tutup Form' : '+ Tulis Ulasan Foto/Video'}
          </button>
        </div>

        {showReviewForm && (
          <form
            onSubmit={handleReviewSubmit}
            className="rounded-2xl bg-zinc-50 border border-zinc-200 p-4 space-y-3"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-700">Rating:</span>
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setRevRating(num)}
                  className="p-1 cursor-pointer"
                >
                  <Star
                    className={`w-5 h-5 ${
                      num <= revRating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-zinc-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <textarea
              rows={2}
              required
              value={revComment}
              onChange={(e) => setRevComment(e.target.value)}
              placeholder="Ceritakan pengalaman Anda dengan produk ini..."
              className="w-full p-3 rounded-xl bg-white border border-zinc-200 text-sm focus:outline-none focus:border-[#EE4D2D] resize-none"
            />
            <div className="flex flex-wrap items-center gap-2">
              <label className="min-h-[40px] px-3.5 rounded-xl border border-dashed border-zinc-300 bg-white text-xs font-semibold text-zinc-700 inline-flex items-center gap-1.5 cursor-pointer">
                <Camera className="w-4 h-4 text-[#EE4D2D]" />
                <span>{revPhoto ? 'Foto Ulasan Terpilih ✓' : 'Tambah Foto Ulasan'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleReviewPhotoUpload}
                  className="sr-only"
                />
              </label>

              <button
                type="button"
                onClick={() => setRevHasVideo((v) => !v)}
                className={`min-h-[40px] px-3.5 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
                  revHasVideo
                    ? 'border-[#EE4D2D] bg-orange-50 text-[#EE4D2D]'
                    : 'border-zinc-300 bg-white text-zinc-700'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>{revHasVideo ? 'Video Unboxing Terlampir ✓' : '+ Lampirkan Video'}</span>
              </button>
            </div>

            {revHasVideo && (
              <input
                type="text"
                value={revVideoCaption}
                onChange={(e) => setRevVideoCaption(e.target.value)}
                placeholder="Judul singkat video ulasan (misal: Tes pemakaian & suara)"
                className="w-full h-10 px-3 rounded-xl bg-white border border-zinc-200 text-xs focus:outline-none focus:border-[#EE4D2D]"
              />
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                className="min-h-[42px] px-5 rounded-xl bg-[#EE4D2D] hover:bg-[#D73B1C] text-white text-xs font-bold cursor-pointer"
              >
                Kirim Ulasan
              </button>
            </div>
          </form>
        )}

        {reviews.length === 0 ? (
          <p className="text-xs sm:text-sm text-zinc-500 py-4 text-center">
            Belum ada ulasan untuk produk ini. Jadilah pembeli pertama yang mengulas!
          </p>
        ) : (
          <div className="divide-y divide-zinc-100">
            {reviews.map((rev) => (
              <article key={rev.id} className="py-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-zinc-900">
                      {rev.buyerName}
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      {rev.variantLabel} · {formatDateId(rev.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: rev.rating }).map((_, idx) => (
                      <Star
                        key={idx}
                        className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed">
                  {rev.comment}
                </p>

                <div className="flex flex-wrap items-center gap-2.5">
                  {rev.photo && (
                    <button
                      type="button"
                      onClick={() => {
                        setLightboxIsVideo(false);
                        setLightboxPhoto(rev.photo || null);
                      }}
                      className="w-20 h-20 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 cursor-pointer block"
                    >
                      <ProductImage
                        src={rev.photo}
                        alt={`Foto ulasan ${rev.buyerName}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  )}

                  {rev.hasVideo && (
                    <button
                      type="button"
                      onClick={() => {
                        setLightboxIsVideo(true);
                        setLightboxPhoto(rev.photo || product.image);
                      }}
                      className="relative w-28 h-20 rounded-xl overflow-hidden border border-zinc-300 bg-[#111113] text-white cursor-pointer block"
                    >
                      <ProductImage
                        src={rev.photo || product.image}
                        alt={rev.videoCaption || 'Video ulasan'}
                        className="w-full h-full object-cover opacity-55"
                      />
                      <span className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                        <span className="w-7 h-7 rounded-full bg-[#EE4D2D] flex items-center justify-center">
                          <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                        </span>
                        <span className="text-[10px] font-bold">Video Ulasan</span>
                      </span>
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Mobile Sticky Bottom Action Bar: Chat Seller, +Keranjang, Beli Sekarang */}
      <div className="md:hidden fixed bottom-[62px] left-0 right-0 z-30 bg-white border-t border-zinc-200 px-3 py-2 grid grid-cols-12 gap-2 shadow-lg">
        <button
          type="button"
          onClick={() => onOpenChat(product.sellerId, product.name)}
          className="col-span-3 min-h-[44px] rounded-xl border border-zinc-300 bg-zinc-50 text-zinc-800 text-[11px] font-bold flex flex-col items-center justify-center cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 text-[#EE4D2D]" />
          <span>Chat Seller</span>
        </button>
        <button
          type="button"
          disabled={availableVariantStock <= 0}
          onClick={handleAddToCart}
          className="col-span-4 min-h-[44px] rounded-xl border-2 border-[#EE4D2D] text-[#EE4D2D] text-xs font-extrabold flex items-center justify-center gap-1 cursor-pointer"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Tambah Keranjang</span>
        </button>
        <button
          type="button"
          disabled={availableVariantStock <= 0}
          onClick={handleBuyNow}
          className="col-span-5 min-h-[44px] rounded-xl bg-[#EE4D2D] text-white text-xs font-extrabold flex items-center justify-center cursor-pointer"
        >
          Beli Sekarang
        </button>
      </div>

      {/* Review Photo / Video Lightbox */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <div
            className="relative max-w-md w-full bg-white rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxPhoto(null)}
              className="absolute top-2 right-2 z-10 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            {lightboxIsVideo ? (
              <MediaPlayer
                src={product.videoUrl || '/videos/vtc-product-demo.mp4'}
                poster={lightboxPhoto}
                autoPlay
                badgeText="Video Ulasan Pembeli"
                title={product.name}
                className="rounded-none"
              />
            ) : (
              <img
                src={lightboxPhoto}
                alt="Ulasan pembeli"
                className="w-full h-auto max-h-[75vh] object-contain"
              />
            )}
          </div>
        </div>
      )}

      {/* Modal Bagikan & Dapat Komisi */}
      {shareModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/55 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setShareModalOpen(false)}
        >
          <div
            className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-[#EE4D2D]" />
                <h3 className="text-lg font-extrabold text-zinc-900">
                  Bagikan & Dapat Komisi
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShareModalOpen(false)}
                className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center rounded-xl text-zinc-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 space-y-1.5">
              <p className="text-xs font-bold text-amber-900 uppercase">
                Komisi Afiliasi VTC SHOP INDONESIA (5%)
              </p>
              <p className="text-2xl font-extrabold text-[#EE4D2D] tabular-nums">
                +{formatRupiah(estimatedCommission)}{' '}
                <span className="text-xs font-semibold text-zinc-600">
                  / produk terjual
                </span>
              </p>
              <p className="text-xs text-amber-900">
                Setiap kali Anda membagikan produk ini, Anda juga langsung mendapat bonus +100 VTC Coins!
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-700">
                Link Afiliasi Khusus Anda
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={affiliateLink}
                  className="flex-1 h-11 px-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono text-zinc-700"
                />
                <button
                  type="button"
                  onClick={handleCopyAffiliate}
                  className="min-h-[44px] px-4 rounded-xl bg-[#EE4D2D] hover:bg-[#D73B1C] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Copy className="w-4 h-4" />
                  <span>Salin Link</span>
                </button>
              </div>
            </div>

            <div className="rounded-xl bg-zinc-50 border border-zinc-200 px-3.5 py-2.5 flex items-center justify-between text-xs">
              <span className="text-zinc-600">Total Bagikan Anda</span>
              <span className="font-extrabold text-zinc-900 tabular-nums">
                {state.affiliateShares}× · Estimasi {formatRupiah(state.affiliateCommissionEstimate)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Compare up to 3 Products Modal */}
      <CompareProductsModal
        open={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        onOpenProduct={(id) => {
          setCompareModalOpen(false);
          onOpenProduct?.(id);
        }}
      />
    </div>
  );
};
