export type AppTab =
  | 'home'
  | 'tv'
  | 'live'
  | 'profile'
  | 'orders'
  | 'seller'
  | 'admin'
  | 'settings'
  | 'product'
  | 'store'
  | 'affiliate'
  | 'games'
  | 'topup'
  | 'pay'
  | 'semua';

export type AppLanguage = 'id' | 'en';
export type ThemeMode = 'light' | 'dark';

export type CourierId =
  | 'VTC Express'
  | 'GoSend'
  | 'GrabExpress'
  | 'J&T'
  | 'SPX'
  | 'SiCepat'
  | 'AnterAja'
  | 'JNE'
  | 'Pos Indonesia';

export interface CourierOption {
  id: CourierId;
  name: string;
  service: string;
  eta: string;
  etaHours: number;
  fee: number;
}

export const COURIER_OPTIONS: CourierOption[] = [
  {
    id: 'J&T',
    name: 'J&T Express',
    service: 'Express COD · Favorit',
    eta: '1–2 hari kerja',
    etaHours: 36,
    fee: 10000,
  },
  {
    id: 'SPX',
    name: 'SPX Express',
    service: 'Standard / Hemat COD',
    eta: '1–2 hari kerja',
    etaHours: 36,
    fee: 10000,
  },
  {
    id: 'AnterAja',
    name: 'AnterAja',
    service: 'Reguler COD',
    eta: '1–3 hari kerja',
    etaHours: 48,
    fee: 10000,
  },
  {
    id: 'SiCepat',
    name: 'SiCepat',
    service: 'HALU / REG COD',
    eta: '1–2 hari kerja',
    etaHours: 36,
    fee: 10000,
  },
  {
    id: 'VTC Express',
    name: 'VTC Express Same Day',
    service: 'Tiba Hari Ini · Prioritas',
    eta: 'Hari ini (3–6 jam)',
    etaHours: 6,
    fee: 10000,
  },
  {
    id: 'JNE',
    name: 'JNE',
    service: 'REG / YES COD',
    eta: '2–3 hari kerja',
    etaHours: 60,
    fee: 12000,
  },
  {
    id: 'GoSend',
    name: 'GoSend Instant',
    service: 'Instan Kurir Motor',
    eta: '1–3 jam tiba',
    etaHours: 3,
    fee: 15000,
  },
  {
    id: 'GrabExpress',
    name: 'GrabExpress Same Day',
    service: 'Kilat Dalam Kota',
    eta: '2–5 jam tiba',
    etaHours: 5,
    fee: 14000,
  },
  {
    id: 'Pos Indonesia',
    name: 'Pos Indonesia',
    service: 'Pos Kilat Nusantara',
    eta: '2–4 hari kerja',
    etaHours: 72,
    fee: 9000,
  },
];

export type PaymentMethodId =
  | 'VTCPay'
  | 'PayLater'
  | 'COD'
  | 'BCA'
  | 'BRI'
  | 'Mandiri'
  | 'Kartu'
  | 'QRIS'
  | 'DANA'
  | 'OVO'
  | 'GoPay'
  | 'Pulsa'
  | 'Alfamart'
  | 'Indomaret';

export interface PaymentMethodOption {
  id: PaymentMethodId;
  label: string;
  group:
    | 'Dompet & Cicilan'
    | 'Bayar di Tempat'
    | 'Transfer & Virtual Account'
    | 'Kartu Kredit / Debit'
    | 'QRIS, E-Wallet & Pulsa'
    | 'Gerai Retail';
  note: string;
}

export const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: 'VTCPay',
    label: 'VTC Pay',
    group: 'Dompet & Cicilan',
    note: 'Instan tanpa biaya admin · Ekstra cashback Koin 5%',
  },
  {
    id: 'PayLater',
    label: 'PayLater 0% 12x',
    group: 'Dompet & Cicilan',
    note: 'Beli sekarang bayar nanti · Cicilan 0% 1/3/6/12 bln',
  },
  {
    id: 'COD',
    label: 'COD GARANSI (Bayar di Tempat)',
    group: 'Bayar di Tempat',
    note: 'Uang ditahan dulu di Escrow VTC SHOP INDONESIA sebelum dibayar ke Seller',
  },
  {
    id: 'BCA',
    label: 'BCA Virtual Account',
    group: 'Transfer & Virtual Account',
    note: 'Virtual Account BCA cek otomatis 1 detik',
  },
  {
    id: 'BRI',
    label: 'BRI BRIVA / VA',
    group: 'Transfer & Virtual Account',
    note: 'BRIVA Virtual Account otomatis 24 jam',
  },
  {
    id: 'Mandiri',
    label: 'Mandiri Virtual Account',
    group: 'Transfer & Virtual Account',
    note: 'VA Bank Mandiri & Livin cek otomatis',
  },
  {
    id: 'Kartu',
    label: 'Kartu Kredit / Debit',
    group: 'Kartu Kredit / Debit',
    note: 'Visa, Mastercard, GPN · Proteksi 3D Secure',
  },
  {
    id: 'QRIS',
    label: 'QRIS Instan',
    group: 'QRIS, E-Wallet & Pulsa',
    note: 'Scan QR dari semua bank & dompet digital',
  },
  {
    id: 'DANA',
    label: 'DANA',
    group: 'QRIS, E-Wallet & Pulsa',
    note: 'Potong langsung dari saldo DANA',
  },
  {
    id: 'OVO',
    label: 'OVO',
    group: 'QRIS, E-Wallet & Pulsa',
    note: 'Bayar cepat melalui OVO Cash',
  },
  {
    id: 'GoPay',
    label: 'GoPay',
    group: 'QRIS, E-Wallet & Pulsa',
    note: 'Bayar praktis dengan GoPay',
  },
  {
    id: 'Pulsa',
    label: 'Potong Pulsa Operator',
    group: 'QRIS, E-Wallet & Pulsa',
    note: 'Telkomsel, Indosat, XL, Tri, Smartfren',
  },
  {
    id: 'Alfamart',
    label: 'Alfamart',
    group: 'Gerai Retail',
    note: 'Bayar tunai di kasir Alfamart terdekat',
  },
  {
    id: 'Indomaret',
    label: 'Indomaret',
    group: 'Gerai Retail',
    note: 'Bayar tunai di kasir Indomaret terdekat',
  },
];

export const PRODUCT_CATEGORIES = [
  'Semua',
  'Elektronik',
  'Fashion',
  'HP & Aksesoris',
  'Rumah Tangga',
  'Kecantikan',
  'Otomotif',
  'Bayi & Anak',
  'Olahraga',
  'VTC Food',
  'VTC Mart',
  'Supermarket',
  'VTC Halal',
  'Makanan',
  'Aksesoris',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export type SellerStatus = 'pending' | 'approved' | 'rejected';

export interface StoreVoucherInfo {
  code: string;
  title: string;
  amount: number;
  minSpend: number;
}

export interface Seller {
  id: string;
  ownerUserId?: string;
  storeName: string;
  ownerName: string;
  phone: string;
  city: string;
  category: string;
  description: string;
  rating: number;
  avatarColor?: string;
  isMall?: boolean;
  isStarSeller?: boolean;
  isStarPlus?: boolean;
  bannerTitle?: string;
  bannerSubtitle?: string;
  bannerColor?: string;
  storeVoucher?: StoreVoucherInfo;
  ktpNumber?: string;
  ktpVerified?: boolean;
  flashSaleActive?: boolean;
  flashSaleDiscountPct?: number;
  status: SellerStatus;
  createdAt: string;
  withdrawnBalance: number;
}

export interface ProductSizeChartRow {
  size: string;
  panjangCm: string;
  lebarCm: string;
}

export interface ProductReview {
  id: string;
  buyerName: string;
  rating: number;
  variantLabel: string;
  comment: string;
  photo?: string;
  hasVideo?: boolean;
  videoCaption?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  sellerId: string;
  sellerName: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  isFlashSale?: boolean;
  isMall?: boolean;
  isStarSeller?: boolean;
  isStarPlus?: boolean;
  isFreeShippingXtra?: boolean;
  isOriginal?: boolean;
  isTermurah?: boolean;
  isFood?: boolean;
  isMart?: boolean;
  isHalal?: boolean;
  isWholesale?: boolean;
  isBuy1Get1?: boolean;
  fastDeliveryMins?: number;
  flashSaleStockTotal?: number;
  stock: number;
  rating: number;
  soldCount: number;
  image: string;
  images?: string[];
  hasVideo?: boolean;
  videoUrl?: string;
  videoCaption?: string;
  colors?: string[];
  sizes?: string[];
  variantStocks?: Record<string, number>;
  sizeChart?: ProductSizeChartRow[];
  specs?: {
    material: string;
    dimensions?: string;
    weight: string;
    warranty: string;
    originCity: string;
  };
  reviews?: ProductReview[];
  description: string;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface SavedAddress {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  fullAddress: string;
  city: string;
  district: string;
  lat: number;
  lng: number;
  isPrimary: boolean;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  sellerId: string;
  sellerName: string;
}

export type OrderStatus =
  | 'Diproses'
  | 'Dipesan'
  | 'Dibayar'
  | 'Dikemas'
  | 'Dikirim'
  | 'Sampai'
  | 'Selesai'
  | 'Diterima'
  | 'Komplain'
  | 'Dana Dikembalikan';

export type EscrowStatus = 'held' | 'released' | 'refunded';

export interface OrderTrackingEvent {
  title: string;
  detail: string;
  time: string;
}

export interface Order {
  id: string;
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  senderName?: string;
  senderAddress?: string;
  addressCity?: string;
  addressCoords?: { lat: number; lng: number };
  courier: CourierId;
  paymentMethod: PaymentMethodId;
  paylaterTenor?: 1 | 3 | 6 | 12;
  paymentCode?: string;
  paidAt?: string;
  shippingFee: number;
  codFee?: number;
  codConfirmed?: boolean;
  discountAmount: number;
  insuranceProtected?: boolean;
  insuranceFee?: number;
  voucherCode?: string;
  voucherCodes?: string[];
  coinsUsed?: number;
  coinsEarned?: number;
  cashbackEarned?: number;
  trackingNumber: string;
  courierProgressPct?: number;
  items: OrderItem[];
  subtotal: number;
  totalAmount: number;
  status: OrderStatus;
  escrowStatus: EscrowStatus;
  estimatedDeliveryAt: string;
  lateVoucherClaimed?: boolean;
  complaintReason?: string;
  complaintType?: 'Komplain' | 'Return' | 'Refund';
  returnPhoto?: string;
  returnStatus?: 'requested' | 'approved' | 'rejected';
  reviewSubmitted?: boolean;
  trackingHistory?: OrderTrackingEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface WithdrawalRecord {
  id: string;
  sellerId: string;
  amount: number;
  bankInfo: string;
  createdAt: string;
}

export interface Voucher {
  code: string;
  title: string;
  type: 'shipping' | 'discount';
  category?: 'store' | 'shipping' | 'vtc' | 'cashback';
  sellerId?: string;
  amount: number;
  minSpend: number;
  used: boolean;
}

export type LivePlatform =
  | 'VTC Studio'
  | 'TikTok Live'
  | 'Facebook Live'
  | 'YouTube Live'
  | 'TV Live';

export interface LiveComment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface LiveStreamItem {
  id: string;
  title: string;
  hostName: string;
  platform: LivePlatform;
  embedUrl?: string;
  videoUrl?: string;
  viewerCount: number;
  likes: number;
  productId: string;
  comments: LiveComment[];
  isLive: boolean;
  createdAt: string;
}

export interface ShortVideoItem {
  id: string;
  title: string;
  creatorName: string;
  productId: string;
  videoUrl?: string;
  likes: number;
  views: number;
  caption: string;
  comments: LiveComment[];
  createdAt: string;
}

export interface InstagramStory {
  id: string;
  sellerId: string;
  storeName: string;
  handle: string;
  avatarImage: string;
  storyImage: string;
  caption: string;
  productId: string;
  createdAt: string;
}

export interface InstagramPost {
  id: string;
  sellerId: string;
  storeName: string;
  handle: string;
  city: string;
  image: string;
  caption: string;
  likes: number;
  productId: string;
  comments: LiveComment[];
  createdAt: string;
}

export interface NotificationPrefs {
  orders: boolean;
  promos: boolean;
  live: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  username?: string;
  email: string;
  phone?: string;
  role: 'buyer' | 'seller' | 'admin';
  authMethod: string;
  hasBiometric?: boolean;
}

export interface PriceAlert {
  productId: string;
  targetPrice: number;
  active: boolean;
  createdAt: string;
}

export interface AiSpecData {
  productTitle: string;
  summary: string;
  specs: { label: string; value: string }[];
  priceComparison: {
    storeName: string;
    priceRange: string;
    highlight: string;
    isRecommended: boolean;
  }[];
  bestRecommendation: string;
  shortReview: string;
}

export interface SellerChatMessage {
  id: string;
  sender: 'buyer' | 'seller';
  buyerId?: string;
  buyerName?: string;
  productName?: string;
  text: string;
  createdAt: string;
}

export interface VtvPayTransaction {
  id: string;
  type:
    | 'topup'
    | 'payment'
    | 'transfer_in'
    | 'transfer_out'
    | 'refund'
    | 'pinjam'
    | 'cashback'
    | 'affiliate';
  title: string;
  amount: number;
  target?: string;
  createdAt: string;
}

export interface AffiliateHistoryItem {
  id: string;
  label: string;
  amount: number;
  createdAt: string;
}

export interface AffiliateProfile {
  step: 1 | 2 | 3 | 4 | 5;
  fullName: string;
  phone: string;
  email: string;
  socialPlatform: 'TikTok' | 'Instagram' | 'YouTube' | 'Facebook';
  socialLink: string;
  verifiedEmailCode: string;
  approved: boolean;
  joinedAt?: string;
  clicks: number;
  ordersCount: number;
  pendingCommission: number;
  availableCommission: number;
  withdrawnCommission: number;
  history: AffiliateHistoryItem[];
}

export interface TopUpOrder {
  id: string;
  category: 'game' | 'ppob' | 'hiburan' | 'ewallet' | 'travel';
  serviceName: string;
  targetId: string;
  serverZone?: string;
  nickname?: string;
  itemLabel: string;
  price: number;
  paymentMethod: PaymentMethodId;
  discountApplied: number;
  cashbackCoins: number;
  voucherCode?: string;
  status: 'Berhasil';
  createdAt: string;
}

export type TvCategory =
  | 'VTC Live Shopping'
  | 'Film'
  | 'Sinetron'
  | 'Drama Korea'
  | 'Bola'
  | 'Berita'
  | 'Anak'
  | 'Musik';

export interface TvChannel {
  id: string;
  name: string;
  category: Exclude<TvCategory, 'VTC Live Shopping'>;
  streamUrl: string;
  fallbackStreamUrl?: string;
  viewerCount: number;
  currentShow: string;
  nextShow: string;
  productId: string;
  schedules: { time: string; program: string }[];
}

export interface SocialVideoItem {
  id: string;
  platform:
    | 'TikTok'
    | 'YouTube'
    | 'Facebook Watch'
    | 'Facebook Reels'
    | 'Instagram Reels'
    | 'VTC Live Shopping';
  category: TvCategory;
  title: string;
  creator: string;
  duration: string;
  views: number;
  likes: number;
  productId: string;
  thumbnail: string;
  videoUrl?: string;
}

export interface AppNotification {
  id: string;
  type: 'wishlist' | 'live' | 'voucher' | 'coins' | 'order' | 'topup' | 'security';
  title: string;
  body: string;
  targetTab?: AppTab;
  read: boolean;
  createdAt: string;
}

export interface FraudReport {
  id: string;
  targetType: 'seller' | 'order' | 'chat';
  targetName: string;
  reason: string;
  createdAt: string;
}

export type VipTier = 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

export interface MarketplaceState {
  seedVersion?: number;
  themeMode: ThemeMode;
  language: AppLanguage;
  twoFactorEnabled: boolean;
  notificationPrefs: NotificationPrefs;
  sellers: Seller[];
  followedSellerIds: string[];
  activeSellerId: string | null;
  platformFeePercent: number;
  products: Product[];
  cart: CartItem[];
  savedAddresses: SavedAddress[];
  orders: Order[];
  withdrawals: WithdrawalRecord[];
  vouchers: Voucher[];
  vtvpayBalance: number;
  vtvpayTransactions: VtvPayTransaction[];
  paylaterLimit: number;
  paylaterUsed: number;
  vtvPinjamBalance: number;
  vtvCoins: number;
  cashbackBalance?: number;
  lastCoinCheckInDate?: string;
  tanamProgress: number;
  lastTanamHarvestDate?: string;
  goyangCountToday: number;
  rodaSpinsLeft: number;
  affiliateShares: number;
  affiliateCommissionEstimate: number;
  affiliateProfile: AffiliateProfile;
  topUpOrders: TopUpOrder[];
  tvChannels: TvChannel[];
  socialVideos: SocialVideoItem[];
  instagramStories: InstagramStory[];
  instagramPosts: InstagramPost[];
  savedVideoIds: string[];
  offlineVideoIds: string[];
  continueWatching: Record<string, number>;
  notifications: AppNotification[];
  fraudReports: FraudReport[];
  liveStreams: LiveStreamItem[];
  shortVideos: ShortVideoItem[];
  sellerChats: Record<string, SellerChatMessage[]>;
  wishlistIds: string[];
  compareProductIds: string[];
  priceAlerts: Record<string, PriceAlert>;
  viewedProductIds: string[];
  liteMode: boolean;
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateId(iso: string): string {
  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function computeVipTier(totalSpent: number): {
  tier: VipTier;
  nextTier: VipTier | null;
  remaining: number;
  perk: string;
} {
  if (totalSpent >= 5000000) {
    return {
      tier: 'Diamond',
      nextTier: null,
      remaining: 0,
      perk: 'Gratis Ongkir Tanpa Min. Belanja + Prioritas CS 24 Jam + Cashback 10%',
    };
  }
  if (totalSpent >= 1500000) {
    return {
      tier: 'Platinum',
      nextTier: 'Diamond',
      remaining: 5000000 - totalSpent,
      perk: 'Gratis Ongkir XTRA 10x/bln + Voucher Ulang Tahun Rp 100rb',
    };
  }
  if (totalSpent >= 500000) {
    return {
      tier: 'Gold',
      nextTier: 'Platinum',
      remaining: 1500000 - totalSpent,
      perk: 'Voucher Cashback Koin 2x + Akses Awal Flash Sale',
    };
  }
  return {
    tier: 'Silver',
    nextTier: 'Gold',
    remaining: Math.max(0, 500000 - totalSpent),
    perk: 'Voucher Member Baru + Bonus Koin Check-in Harian',
  };
}
