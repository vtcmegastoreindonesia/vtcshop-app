import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AffiliateProfile,
  AppLanguage,
  AppNotification,
  AppTab,
  AuthUser,
  COURIER_OPTIONS,
  CourierId,
  FraudReport,
  InstagramPost,
  InstagramStory,
  LivePlatform,
  LiveStreamItem,
  MarketplaceState,
  NotificationPrefs,
  Order,
  OrderItem,
  PaymentMethodId,
  Product,
  ProductReview,
  SavedAddress,
  Seller,
  ShortVideoItem,
  SocialVideoItem,
  ThemeMode,
  TopUpOrder,
  TvChannel,
  Voucher,
  VtvPayTransaction,
  formatRupiah,
} from '../types';

const STORAGE_KEY = 'vtv_shop_marketplace_v1';
const AUTH_TOKEN_STORAGE_KEY = 'vtv_auth_token';
const AUTH_USER_STORAGE_KEY = 'vtc_auth_user_v1';

export const BANNER_IMAGES = {
  promo: '/src/assets/images/banner_promo_superapp_1795257154273.jpg',
  superTv: '/src/assets/images/banner_super_tv_hero_1795257155612.jpg',
};

export const PRESET_GALLERY_IMAGES = [
  {
    label: 'Earbuds TWS',
    url: '/src/assets/images/prod_earbuds_orange_1795236669505.jpg',
  },
  {
    label: 'Sneakers Urban',
    url: '/src/assets/images/prod_sneakers_urban_1795236669228.jpg',
  },
  {
    label: 'Tumbler Hitam',
    url: '/src/assets/images/prod_tumbler_thermal_1795236670111.jpg',
  },
  {
    label: 'Serum Vitamin C',
    url: '/src/assets/images/prod_skincare_serum_1795236670640.jpg',
  },
  {
    label: 'Keyboard Mekanikal',
    url: '/src/assets/images/prod_keyboard_mech_1795236671078.jpg',
  },
  {
    label: 'Tas Ransel',
    url: '/src/assets/images/prod_backpack_canvas_1795236671576.jpg',
  },
  {
    label: 'Smartphone 5G',
    url: '/src/assets/images/prod_smartphone_5g_1795255860951.jpg',
  },
  {
    label: 'Helm Otomotif',
    url: '/src/assets/images/prod_helmet_otomotif_1795255861355.jpg',
  },
  {
    label: 'Perlengkapan Bayi',
    url: '/src/assets/images/prod_baby_diaper_bag_1795255861620.jpg',
  },
  {
    label: 'Kopi & Camilan',
    url: '/src/assets/images/prod_coffee_snacks_box_1795255860949.jpg',
  },
  {
    label: 'VTC Food Rice Bowl',
    url: '/src/assets/images/prod_food_boba_ricebowl_1795257154735.jpg',
  },
  {
    label: 'VTC Mart Segar',
    url: '/src/assets/images/prod_mart_fresh_veggies_1795257155284.jpg',
  },
  {
    label: 'VTC Halal Giftbox',
    url: '/src/assets/images/prod_halal_skincare_hijab_1795257155043.jpg',
  },
];

function buildInitialState(): MarketplaceState {
  const now = new Date();
  const hoursAgo = (h: number) =>
    new Date(now.getTime() - h * 3600 * 1000).toISOString();
  const hoursFromNow = (h: number) =>
    new Date(now.getTime() + h * 3600 * 1000).toISOString();

  const sellers: Seller[] = [
    {
      id: 'seller-vtv-official',
      ownerUserId: 'seed-partner-1',
      storeName: 'Nusantara Flagship ID',
      ownerName: 'Andika Pratama',
      phone: '081288990011',
      city: 'Jakarta Selatan',
      category: 'Aksesoris',
      description:
        'Toko mitra terpercaya di Jakarta Selatan. Spesialis tas komuter, perlengkapan kerja, dan aksesori harian bergaransi resmi 100% Original.',
      rating: 4.9,
      avatarColor: '#EE4D2D',
      isMall: true,
      isStarSeller: true,
      bannerTitle: 'NUSANTARA FLAGSHIP · 100% ORIGINAL',
      bannerSubtitle: 'Gratis Ongkir XTRA & Garansi Resmi 6 Bulan',
      bannerColor: '#111113',
      storeVoucher: {
        code: 'VTC-OFFICIAL15',
        title: 'Voucher Toko Nusantara Flagship Rp 15.000',
        amount: 15000,
        minSpend: 100000,
      },
      status: 'approved',
      createdAt: hoursAgo(180),
      withdrawnBalance: 0,
    },
    {
      id: 'seller-berkah-cell',
      storeName: 'Berkah Cell',
      ownerName: 'Hendra Wijaya',
      phone: '081377889900',
      city: 'Bandung',
      category: 'Elektronik',
      description:
        'Pusat gadget audio, TWS, smartphone 5G, dan keyboard mekanikal original di Kota Bandung. Packing bubble wrap tebal & garansi tukar unit.',
      rating: 4.9,
      avatarColor: '#059669',
      isMall: true,
      isStarSeller: true,
      bannerTitle: 'BERKAH CELL OFFICIAL MALL',
      bannerSubtitle: 'Audio & Gadget Original Garansi Tukar Unit 12 Bulan',
      bannerColor: '#064E3B',
      storeVoucher: {
        code: 'BERKAH-TECH25',
        title: 'Voucher Toko Berkah Cell Rp 25.000',
        amount: 25000,
        minSpend: 150000,
      },
      status: 'approved',
      createdAt: hoursAgo(160),
      withdrawnBalance: 0,
    },
    {
      id: 'seller-jaya-abadi',
      storeName: 'Jaya Abadi',
      ownerName: 'Rudi Hartono',
      phone: '082144556677',
      city: 'Surabaya',
      category: 'Fashion',
      description:
        'Distro & toko sepatu olahraga kasual terpercaya dari Surabaya. Jahitan rapi, sol empuk, dan bebas tukar ukuran.',
      rating: 4.8,
      avatarColor: '#0284C7',
      isMall: false,
      isStarSeller: true,
      bannerTitle: 'JAYA ABADI SPORT SURABAYA',
      bannerSubtitle: 'Koleksi Sepatu Kasual & Lari Nyaman Seharian',
      bannerColor: '#0C4A6E',
      storeVoucher: {
        code: 'JAYA-HEMAT20',
        title: 'Voucher Toko Jaya Abadi Rp 20.000',
        amount: 20000,
        minSpend: 150000,
      },
      status: 'approved',
      createdAt: hoursAgo(140),
      withdrawnBalance: 0,
    },
    {
      id: 'seller-dapur-modern',
      storeName: 'Dapur Modern',
      ownerName: 'Lina Kusuma',
      phone: '085711229988',
      city: 'Bekasi',
      category: 'Rumah Tangga',
      description:
        'Perlengkapan minum stainless food-grade & alat rumah tangga minimalis langsung dari gudang Bekasi.',
      rating: 4.9,
      avatarColor: '#D97706',
      isMall: false,
      isStarSeller: true,
      bannerTitle: 'DAPUR MODERN MINIMALIS',
      bannerSubtitle: 'Perlengkapan Rumah Tangga Food Grade Bebas BPA',
      bannerColor: '#78350F',
      storeVoucher: {
        code: 'DAPUR-PRO10',
        title: 'Voucher Toko Dapur Modern Rp 10.000',
        amount: 10000,
        minSpend: 70000,
      },
      status: 'approved',
      createdAt: hoursAgo(120),
      withdrawnBalance: 0,
    },
    {
      id: 'seller-glow-cantik',
      storeName: 'Glow Cantik ID',
      ownerName: 'Nadia Putri',
      phone: '087855664433',
      city: 'Tangerang',
      category: 'Kecantikan',
      description:
        'Skincare resmi BPOM 100% original dari distributor Tangerang. Tanggal kadaluarsa panjang dan aman untuk kulit sensitif.',
      rating: 4.8,
      avatarColor: '#DB2777',
      isMall: true,
      isStarSeller: true,
      bannerTitle: 'GLOW CANTIK MALL · BPOM RESMI',
      bannerSubtitle: '100% Original Skincare Aman & Terdaftar BPOM',
      bannerColor: '#831843',
      storeVoucher: {
        code: 'GLOW-CANTIK10',
        title: 'Voucher Toko Glow Cantik ID Rp 10.000',
        amount: 10000,
        minSpend: 80000,
      },
      status: 'approved',
      createdAt: hoursAgo(100),
      withdrawnBalance: 0,
    },
    {
      id: 'seller-otoprima',
      storeName: 'OtoPrima ID',
      ownerName: 'Bagas Kurniawan',
      phone: '081922334455',
      city: 'Jakarta Barat',
      category: 'Otomotif',
      description:
        'Aksesori berkendara SNI, helm full-face, dan perawatan motor/mobil resmi bergaransi.',
      rating: 4.9,
      avatarColor: '#EA580C',
      isMall: true,
      isStarSeller: true,
      bannerTitle: 'OTOPRIMA OFFICIAL GARAGE',
      bannerSubtitle: 'Perlengkapan Otomotif SNI & Original 100%',
      bannerColor: '#18181B',
      storeVoucher: {
        code: 'OTO-AMAN15',
        title: 'Voucher Toko OtoPrima ID Rp 15.000',
        amount: 15000,
        minSpend: 150000,
      },
      status: 'approved',
      createdAt: hoursAgo(90),
      withdrawnBalance: 0,
    },
    {
      id: 'seller-nusantara-mart',
      storeName: 'Nusantara Mart',
      ownerName: 'Ratna Sari',
      phone: '085277665544',
      city: 'Depok',
      category: 'Supermarket',
      description:
        'Supermarket online kebutuhan harian, kopi arabika nusantara, camilan sehat, dan perlengkapan bayi terpercaya.',
      rating: 4.9,
      avatarColor: '#16A34A',
      isMall: false,
      isStarSeller: true,
      bannerTitle: 'NUSANTARA MART SUPERMARKET',
      bannerSubtitle: 'Belanja Kebutuhan Harian & Makanan Termurah Se-Indonesia',
      bannerColor: '#14532D',
      storeVoucher: {
        code: 'MART-HEMAT10',
        title: 'Voucher Nusantara Mart Rp 10.000',
        amount: 10000,
        minSpend: 60000,
      },
      status: 'approved',
      createdAt: hoursAgo(80),
      withdrawnBalance: 0,
    },
    {
      id: 'seller-pending-1',
      storeName: 'Karya Nusantara Store',
      ownerName: 'Siti Rahmawati',
      phone: '085699887766',
      city: 'Semarang',
      category: 'Fashion',
      description:
        'Menjual tas kanvas lokal, sneakers kasual, dan perlengkapan kerja berkualitas.',
      rating: 5.0,
      avatarColor: '#7C3AED',
      status: 'pending',
      createdAt: hoursAgo(6),
      withdrawnBalance: 0,
    },
  ];

  const products: Product[] = [
    {
      id: 'prod-1',
      sellerId: 'seller-berkah-cell',
      sellerName: 'Berkah Cell',
      name: 'SoundBuds Pro TWS Wireless ANC Bluetooth 5.3',
      category: 'Elektronik',
      price: 199000,
      originalPrice: 995000,
      discountPercent: 80,
      isFlashSale: true,
      isMall: true,
      isStarSeller: true,
      isFreeShippingXtra: true,
      isOriginal: true,
      flashSaleStockTotal: 50,
      stock: 14,
      rating: 4.9,
      soldCount: 412,
      image: '/src/assets/images/prod_earbuds_orange_1795236669505.jpg',
      hasVideo: true,
      videoUrl: '/videos/vtc-product-demo.mp4',
      videoCaption: 'Tes kualitas bass & mode Active Noise Cancelling di luar ruangan',
      colors: ['Putih', 'Hitam', 'Pink'],
      sizes: ['Standard', 'Pro ANC'],
      variantStocks: {
        'Putih-Standard': 8,
        'Putih-Pro ANC': 6,
        'Hitam-Standard': 10,
        'Hitam-Pro ANC': 5,
        'Pink-Standard': 4,
        'Pink-Pro ANC': 3,
      },
      sizeChart: [
        { size: 'Standard', panjangCm: '5.2 cm', lebarCm: '4.4 cm' },
        { size: 'Pro ANC', panjangCm: '5.8 cm', lebarCm: '4.6 cm' },
      ],
      specs: {
        material: 'Polikarbonat Matte + Eartips Silikon Medis',
        dimensions: '5.8 × 4.6 × 2.4 cm (Case)',
        weight: '48 gram (dengan case)',
        warranty: 'Garansi Resmi Berkah Cell 12 Bulan',
        originCity: 'Kota Bandung',
      },
      reviews: [
        {
          id: 'rev-1',
          buyerName: 'Dimas Pratama',
          rating: 5,
          variantLabel: 'Warna: Putih, Ukuran: Pro ANC',
          comment:
            'Suara jernih banget, ANC bekerja nyata meredam bising di kereta. Pengiriman dari Bandung super cepat pakai J&T COD!',
          photo: '/src/assets/images/prod_earbuds_orange_1795236669505.jpg',
          hasVideo: true,
          videoCaption: 'Video unboxing & tes suara bass SoundBuds Pro',
          createdAt: hoursAgo(20),
        },
        {
          id: 'rev-2',
          buyerName: 'Sari Wulandari',
          rating: 5,
          variantLabel: 'Warna: Pink, Ukuran: Standard',
          comment:
            'Packing aman, baterai awet dipakai meeting seharian. Seller Berkah Cell sangat ramah.',
          createdAt: hoursAgo(45),
        },
      ],
      description:
        'SoundBuds Pro TWS hadir dengan chip Bluetooth 5.3 ultra stabil dan fitur Active Noise Cancellation hingga 38dB yang meredam suara bising sekitar secara efektif.\n\nKeunggulan utama:\n• Daya tahan baterai hingga 28 jam total pemakaian dengan casing pengisi daya USB-C Fast Charging.\n• Mikrofon ganda ENC membuat panggilan telepon tetap jernih meski di jalan raya.\n• Sertifikasi IPX5 tahan keringat dan percikan air hujan, cocok untuk olahraga maupun komuter.\n\nSetiap pembelian di Berkah Cell sudah termasuk kabel USB-C, 3 pasang eartips cadangan (S/M/L), dan kartu garansi resmi 1 tahun.',
      createdAt: hoursAgo(96),
    },
    {
      id: 'prod-2',
      sellerId: 'seller-jaya-abadi',
      sellerName: 'Jaya Abadi',
      name: 'Sepatu Lari Urban Knit Casual Sport',
      category: 'Fashion',
      price: 349000,
      originalPrice: 698000,
      discountPercent: 50,
      isFlashSale: false,
      isMall: false,
      isFreeShippingXtra: true,
      stock: 19,
      rating: 4.8,
      soldCount: 285,
      image: '/src/assets/images/prod_sneakers_urban_1795236669228.jpg',
      hasVideo: true,
      videoUrl: '/videos/vtc-short-tiktok.mp4',
      videoCaption: 'Uji kelenturan sol phylon & sirkulasi udara bahan rajut',
      colors: ['Putih', 'Hitam', 'Pink'],
      sizes: ['S', 'M', 'L', 'XL'],
      variantStocks: {
        'Putih-S': 4,
        'Putih-M': 6,
        'Putih-L': 5,
        'Putih-XL': 4,
        'Hitam-S': 7,
        'Hitam-M': 9,
        'Hitam-L': 6,
        'Hitam-XL': 3,
        'Pink-S': 5,
        'Pink-M': 4,
        'Pink-L': 2,
        'Pink-XL': 2,
      },
      sizeChart: [
        { size: 'S (38-39)', panjangCm: '24.5 cm', lebarCm: '9.2 cm' },
        { size: 'M (40-41)', panjangCm: '26.0 cm', lebarCm: '9.6 cm' },
        { size: 'L (42-43)', panjangCm: '27.5 cm', lebarCm: '10.0 cm' },
        { size: 'XL (44)', panjangCm: '28.5 cm', lebarCm: '10.4 cm' },
      ],
      specs: {
        material: 'Flyknit Breathable Mesh + Suede Heel + Sol Phylon Empuk',
        dimensions: 'Panjang Insole 24.5–28.5 cm (EU 38–44)',
        weight: '420 gram (sepasang)',
        warranty: 'Garansi Tukar Ukuran 7 Hari Jaya Abadi',
        originCity: 'Kota Surabaya',
      },
      reviews: [
        {
          id: 'rev-3',
          buyerName: 'Raka Wijaya',
          rating: 5,
          variantLabel: 'Warna: Putih, Ukuran: L',
          comment:
            'Ringan banget dipakai lari 5K, solnya empuk dan tidak bikin lecet. Warna putihnya bersih elegan!',
          photo: '/src/assets/images/prod_sneakers_urban_1795236669228.jpg',
          createdAt: hoursAgo(18),
        },
      ],
      description:
        'Sepatu Lari Urban Knit dari Toko Jaya Abadi Surabaya dirancang untuk pelari pemula hingga pemakaian kasual harian yang menuntut kenyamanan maksimal.\n\nMaterial upper menggunakan rajutan 3D Flyknit yang menjaga sirkulasi udara agar kaki tidak mudah gerah atau bau. Bagian tumit diperkuat lapisan suede lembut serta bantalan busa Memory Foam.\n\nPanduan Ukuran: Pilih ukuran S (EU 38-39), M (EU 40-41), L (EU 42-43), atau XL (EU 44). Tersedia garansi tukar ukuran bila kurang pas!',
      createdAt: hoursAgo(84),
    },
    {
      id: 'prod-3',
      sellerId: 'seller-dapur-modern',
      sellerName: 'Dapur Modern',
      name: 'Tumbler Vakum Stainless SUS 304 Anti Bocor',
      category: 'Rumah Tangga',
      price: 79000,
      originalPrice: 395000,
      discountPercent: 80,
      isFlashSale: true,
      flashSaleStockTotal: 80,
      stock: 22,
      rating: 4.9,
      soldCount: 640,
      image: '/src/assets/images/prod_tumbler_thermal_1795236670111.jpg',
      hasVideo: true,
      videoCaption: 'Tes es batu tahan 24 jam & uji balik botol anti bocor',
      colors: ['Hitam', 'Putih', 'Pink'],
      sizes: ['350ml', '600ml'],
      variantStocks: {
        'Hitam-350ml': 12,
        'Hitam-600ml': 22,
        'Putih-350ml': 9,
        'Putih-600ml': 15,
        'Pink-350ml': 6,
        'Pink-600ml': 8,
      },
      sizeChart: [
        { size: '350ml', panjangCm: '17.5 cm', lebarCm: '7.2 cm' },
        { size: '600ml', panjangCm: '23.0 cm', lebarCm: '7.6 cm' },
      ],
      specs: {
        material: 'Stainless Steel SUS 304 Double-Wall Vacuum Food Grade',
        weight: '310 gram',
        warranty: 'Garansi Anti Karat & Retur Pecah 30 Hari',
        originCity: 'Kota Bekasi',
      },
      reviews: [
        {
          id: 'rev-4',
          buyerName: 'Dewi Anggraini',
          rating: 5,
          variantLabel: 'Warna: Hitam, Ukuran: 600ml',
          comment:
            'Es batu dari pagi masih utuh sampai malam! Finishing matte hitamnya mewah dan tutupnya rapat tidak bocor di tas.',
          photo: '/src/assets/images/prod_tumbler_thermal_1795236670111.jpg',
          createdAt: hoursAgo(12),
        },
      ],
      description:
        'Tumbler Vakum Stainless dari Dapur Modern Bekasi menjaga suhu minuman panas hingga 12 jam dan dingin hingga 24 jam tanpa embun di bagian luar botol.\n\nDibuat dari material Stainless Steel 304 bebas BPA, tidak meninggalkan bau logam, dan dilengkapi pegangan tutup ergonomis yang mudah dibawa ke kantor, kampus, maupun gym.',
      createdAt: hoursAgo(72),
    },
    {
      id: 'prod-4',
      sellerId: 'seller-glow-cantik',
      sellerName: 'Glow Cantik ID',
      name: 'Serum Wajah Vitamin C Radiance Brightening',
      category: 'Kecantikan',
      price: 89000,
      originalPrice: 178000,
      discountPercent: 50,
      isFlashSale: false,
      isMall: true,
      isFreeShippingXtra: true,
      stock: 41,
      rating: 4.8,
      soldCount: 519,
      image: '/src/assets/images/prod_skincare_serum_1795236670640.jpg',
      hasVideo: true,
      videoCaption: 'Tekstur serum cepat meresap tanpa lengket di wajah',
      colors: ['Putih', 'Pink', 'Hitam'],
      sizes: ['15ml', '30ml'],
      variantStocks: {
        'Putih-15ml': 25,
        'Putih-30ml': 16,
        'Pink-15ml': 18,
        'Pink-30ml': 11,
        'Hitam-15ml': 10,
        'Hitam-30ml': 7,
      },
      sizeChart: [
        { size: '15ml (Travel)', panjangCm: '8.5 cm', lebarCm: '3.0 cm' },
        { size: '30ml (Full)', panjangCm: '10.5 cm', lebarCm: '3.6 cm' },
      ],
      specs: {
        material: '10% Ethyl Ascorbic Acid + Niacinamide + Hyaluronic Acid (BPOM)',
        dimensions: 'Tinggi 10.5 × Diameter 3.6 cm (30ml)',
        weight: '85 gram',
        warranty: 'Garansi 100% Original BPOM Resmi',
        originCity: 'Kota Tangerang',
      },
      reviews: [
        {
          id: 'rev-5',
          buyerName: 'Maya Kartika',
          rating: 5,
          variantLabel: 'Warna: Putih, Ukuran: 30ml',
          comment:
            'Pemakaian 2 minggu bekas jerawat mulai memudar, teksturnya ringan dan langsung meresap.',
          photo: '/src/assets/images/prod_skincare_serum_1795236670640.jpg',
          hasVideo: true,
          videoCaption: 'Review tekstur serum setelah 14 hari pemakaian',
          createdAt: hoursAgo(30),
        },
      ],
      description:
        'Serum Vitamin C Radiance dari Glow Cantik ID diformulasikan dengan turunan Vitamin C stabil yang lembut di kulit namun efektif mencerahkan wajah kusam.\n\nDilengkapi Hyaluronic Acid untuk mengunci kelembapan sepanjang hari dan botol kaca amber pelindung UV agar kandungan aktif tetap optimal hingga tetes terakhir.',
      createdAt: hoursAgo(60),
    },
    {
      id: 'prod-5',
      sellerId: 'seller-berkah-cell',
      sellerName: 'Berkah Cell',
      name: 'Keyboard Mekanikal Wireless 75% Tri-Mode Knob',
      category: 'Elektronik',
      price: 499000,
      originalPrice: 998000,
      discountPercent: 50,
      isFlashSale: false,
      isMall: true,
      isFreeShippingXtra: true,
      stock: 8,
      rating: 4.9,
      soldCount: 173,
      image: '/src/assets/images/prod_keyboard_mech_1795236671078.jpg',
      hasVideo: true,
      videoCaption: 'Sound test thocky switch & fungsi knob putar volume',
      colors: ['Putih', 'Hitam', 'Pink'],
      sizes: ['Red Switch', 'Brown Switch'],
      variantStocks: {
        'Putih-Red Switch': 12,
        'Putih-Brown Switch': 8,
        'Hitam-Red Switch': 6,
        'Hitam-Brown Switch': 7,
        'Pink-Red Switch': 4,
        'Pink-Brown Switch': 3,
      },
      sizeChart: [
        { size: '75% Compact', panjangCm: '32.5 cm', lebarCm: '13.8 cm' },
      ],
      specs: {
        material: 'ABS Gasket Mount + PBT Keycaps Double-Shot',
        dimensions: '32.5 × 13.8 × 3.9 cm',
        weight: '780 gram',
        warranty: 'Garansi Resmi Berkah Cell 12 Bulan',
        originCity: 'Kota Bandung',
      },
      reviews: [
        {
          id: 'rev-6',
          buyerName: 'Fajar Nugroho',
          rating: 5,
          variantLabel: 'Warna: Putih, Ukuran: Brown Switch',
          comment:
            'Suaranya empuk thocky enak banget buat coding dan ngetik lama. Koneksi Bluetooth ke MacBook lancar tanpa delay.',
          photo: '/src/assets/images/prod_keyboard_mech_1795236671078.jpg',
          createdAt: hoursAgo(16),
        },
      ],
      description:
        'Keyboard Mekanikal Tri-Mode 75% dari Berkah Cell Bandung mendukung 3 mode koneksi sekaligus: Bluetooth 5.0 (hingga 3 perangkat), 2.4GHz Wireless Dongle low-latency, dan kabel USB-C.\n\nDibekali struktur Gasket Mount dengan peredam busa silikon ganda, hot-swappable 5-pin PCB, serta rotary knob aluminium untuk mengatur volume secara cepat.',
      createdAt: hoursAgo(48),
    },
    {
      id: 'prod-6',
      sellerId: 'seller-vtv-official',
      sellerName: 'Nusantara Flagship ID',
      name: 'Tas Ransel Kerja Minimalis Anti Air Laptop 15.6"',
      category: 'Aksesoris',
      price: 139000,
      originalPrice: 695000,
      discountPercent: 80,
      isFlashSale: true,
      isMall: true,
      isFreeShippingXtra: true,
      flashSaleStockTotal: 40,
      stock: 6,
      rating: 4.9,
      soldCount: 310,
      image: '/src/assets/images/prod_backpack_canvas_1795236671576.jpg',
      hasVideo: true,
      videoCaption: 'Demo ketahanan air & kompartemen laptop 15.6 inci',
      colors: ['Hitam', 'Putih', 'Pink'],
      sizes: ['M', 'L'],
      variantStocks: {
        'Hitam-M': 5,
        'Hitam-L': 9,
        'Putih-M': 4,
        'Putih-L': 3,
        'Pink-M': 6,
        'Pink-L': 2,
      },
      sizeChart: [
        { size: 'M (14 Inch)', panjangCm: '40.0 cm', lebarCm: '28.0 cm' },
        { size: 'L (15.6 Inch)', panjangCm: '44.0 cm', lebarCm: '31.0 cm' },
      ],
      specs: {
        material: 'Nilon Ballistic 1680D Anti Percikan Air + Busa Eva',
        dimensions: '44 × 31 × 15 cm (Muat Laptop 15.6")',
        weight: '620 gram',
        warranty: 'Garansi Resleting & Jahitan Nusantara Flagship 6 Bulan',
        originCity: 'Jakarta Selatan',
      },
      reviews: [
        {
          id: 'rev-7',
          buyerName: 'Kevin Halim',
          rating: 5,
          variantLabel: 'Warna: Hitam, Ukuran: L',
          comment:
            'Muat laptop 15.6 inci + charger + jaket tipis. Tadi kehujanan naik motor airnya langsung meluncur tidak tembus ke dalam.',
          photo: '/src/assets/images/prod_backpack_canvas_1795236671576.jpg',
          createdAt: hoursAgo(9),
        },
      ],
      description:
        'Tas Ransel Komuter dari Nusantara Flagship ID Jakarta Selatan didesain ramping namun berkapasitas besar untuk kebutuhan kerja, kuliah, dan perjalanan harian.\n\nFitur lengkap:\n• Bahan Nilon 1680D waterproof dengan resleting YKK anti macet.\n• Kompartemen khusus laptop empuk anti benturan + slot botol minum.\n• Tali bahu ergonomis berbusa breathable dan strap belakang untuk dikaitkan ke gagang koper.',
      createdAt: hoursAgo(36),
    },
    {
      id: 'prod-7',
      sellerId: 'seller-berkah-cell',
      sellerName: 'Berkah Cell',
      name: 'Smartphone VTC X5 5G 8/256GB AMOLED 120Hz Garansi Resmi',
      category: 'HP & Aksesoris',
      price: 2799000,
      originalPrice: 3999000,
      discountPercent: 30,
      isFlashSale: false,
      isMall: true,
      isStarSeller: true,
      isFreeShippingXtra: true,
      isOriginal: true,
      stock: 15,
      rating: 4.9,
      soldCount: 248,
      image: '/src/assets/images/prod_smartphone_5g_1795255860951.jpg',
      hasVideo: true,
      videoCaption: 'Unboxing Smartphone VTC X5 5G & tes kamera malam OIS',
      colors: ['Hitam', 'Oranye'],
      sizes: ['8/128GB', '8/256GB'],
      variantStocks: {
        'Hitam-8/128GB': 8,
        'Hitam-8/256GB': 7,
        'Oranye-8/128GB': 5,
        'Oranye-8/256GB': 4,
      },
      sizeChart: [
        { size: '8/128GB', panjangCm: '16.1 cm', lebarCm: '7.4 cm' },
        { size: '8/256GB', panjangCm: '16.1 cm', lebarCm: '7.4 cm' },
      ],
      specs: {
        material: 'Kaca Gorilla Glass + Frame Aluminium Matte',
        dimensions: '16.1 × 7.4 × 0.79 cm (Layar 6.67" AMOLED 120Hz)',
        weight: '185 gram',
        warranty: 'Garansi Resmi Indonesia 12 Bulan + IMEI Terdaftar',
        originCity: 'Kota Bandung',
      },
      reviews: [
        {
          id: 'rev-8',
          buyerName: 'Wahyu Saputra',
          rating: 5,
          variantLabel: 'Warna: Hitam, Ukuran: 8/256GB',
          comment: 'Layar AMOLED 120Hz super mulus, baterai 5000mAh awet seharian & cas cepat!',
          photo: '/src/assets/images/prod_smartphone_5g_1795255860951.jpg',
          createdAt: hoursAgo(8),
        },
      ],
      description:
        'Smartphone VTC X5 5G hadir dengan layar AMOLED 120Hz, kamera 50MP OIS, baterai 5000mAh Fast Charging 45W, dan garansi resmi Indonesia 12 bulan. IMEI terdaftar resmi Kemenperin.',
      createdAt: hoursAgo(30),
    },
    {
      id: 'prod-8',
      sellerId: 'seller-otoprima',
      sellerName: 'OtoPrima ID',
      name: 'Helm Full Face Aero Carbon Visor Gelap SNI Original',
      category: 'Otomotif',
      price: 389000,
      originalPrice: 750000,
      discountPercent: 48,
      isFlashSale: false,
      isMall: true,
      isStarSeller: true,
      isFreeShippingXtra: true,
      isOriginal: true,
      stock: 11,
      rating: 4.9,
      soldCount: 192,
      image: '/src/assets/images/prod_helmet_otomotif_1795255861355.jpg',
      hasVideo: true,
      videoCaption: 'Tes aerodinamika helm SNI & mekanisme dual visor anti silau',
      colors: ['Hitam', 'Oranye'],
      sizes: ['M', 'L', 'XL'],
      variantStocks: {
        'Hitam-M': 4,
        'Hitam-L': 5,
        'Hitam-XL': 3,
        'Oranye-M': 4,
        'Oranye-L': 6,
        'Oranye-XL': 2,
      },
      sizeChart: [
        { size: 'M (57-58 cm)', panjangCm: '34.0 cm', lebarCm: '25.0 cm' },
        { size: 'L (59-60 cm)', panjangCm: '34.5 cm', lebarCm: '25.5 cm' },
        { size: 'XL (61-62 cm)', panjangCm: '35.0 cm', lebarCm: '26.0 cm' },
      ],
      specs: {
        material: 'Shell ABS High-Impact + Busa Hypoallergenic Bisa Dicuci',
        dimensions: '34.5 × 25.5 × 26 cm',
        weight: '1.350 gram',
        warranty: 'Garansi Visor & Pengunci SNI Resmi 6 Bulan',
        originCity: 'Jakarta Barat',
      },
      reviews: [
        {
          id: 'rev-9',
          buyerName: 'Reza Mahendra',
          rating: 5,
          variantLabel: 'Warna: Hitam, Ukuran: L',
          comment: 'Busa tebal empuk nyaman dipakai touring jauh, visor gelapnya adem di siang hari.',
          photo: '/src/assets/images/prod_helmet_otomotif_1795255861355.jpg',
          createdAt: hoursAgo(11),
        },
      ],
      description:
        'Helm Full Face bersertifikat SNI dari OtoPrima ID dengan ventilasi udara aktif, busa interior lembut bisa dilepas-cuci, dan pengait DD-Ring aman untuk harian maupun touring.',
      createdAt: hoursAgo(26),
    },
    {
      id: 'prod-9',
      sellerId: 'seller-nusantara-mart',
      sellerName: 'Nusantara Mart',
      name: 'Set Penghangat Botol Susu Digital & Selimut Rajut Bayi',
      category: 'Bayi & Anak',
      price: 169000,
      originalPrice: 340000,
      discountPercent: 50,
      isFlashSale: false,
      isMall: false,
      isStarSeller: true,
      isFreeShippingXtra: true,
      isOriginal: true,
      isTermurah: true,
      stock: 18,
      rating: 4.9,
      soldCount: 274,
      image: '/src/assets/images/prod_baby_diaper_bag_1795255861620.jpg',
      hasVideo: true,
      videoCaption: 'Demo pengatur suhu digital 40°C konstan untuk ASI & susu bayi',
      colors: ['Putih', 'Oranye'],
      sizes: ['Paket Lengkap'],
      variantStocks: {
        'Putih-Paket Lengkap': 12,
        'Oranye-Paket Lengkap': 10,
      },
      sizeChart: [
        { size: 'Paket Lengkap', panjangCm: '15.0 cm', lebarCm: '13.0 cm' },
      ],
      specs: {
        material: 'PP Food Grade Bebas BPA + Selimut Katun Organik 100%',
        dimensions: 'Warmer 15 × 13 × 22 cm + Selimut 90 × 110 cm',
        weight: '650 gram',
        warranty: 'Garansi Mesin Pemanas 12 Bulan',
        originCity: 'Kota Depok',
      },
      reviews: [
        {
          id: 'rev-10',
          buyerName: 'Fitri Handayani',
          rating: 5,
          variantLabel: 'Warna: Oranye, Ukuran: Paket Lengkap',
          comment: 'Praktis banget buat tengah malam nyiapin susu bayi, suhunya pas dan selimutnya lembut.',
          photo: '/src/assets/images/prod_baby_diaper_bag_1795255861620.jpg',
          createdAt: hoursAgo(15),
        },
      ],
      description:
        'Penghangat botol susu digital dengan kontrol suhu presisi 37°C–45°C bebas BPA lengkap dengan selimut rajut katun lembut aman untuk kulit bayi baru lahir.',
      createdAt: hoursAgo(24),
    },
    {
      id: 'prod-10',
      sellerId: 'seller-jaya-abadi',
      sellerName: 'Jaya Abadi',
      name: 'Paket Olahraga Lari: Sepatu Breathable + Tali Skipping Pro',
      category: 'Olahraga',
      price: 299000,
      originalPrice: 598000,
      discountPercent: 50,
      isFlashSale: false,
      isMall: false,
      isStarSeller: true,
      isFreeShippingXtra: true,
      isOriginal: true,
      stock: 16,
      rating: 4.8,
      soldCount: 158,
      image: '/src/assets/images/prod_sneakers_urban_1795236669228.jpg',
      colors: ['Putih', 'Hitam'],
      sizes: ['M', 'L', 'XL'],
      specs: {
        material: 'Mesh Olahraga Ringan + Sol Anti Slip Karet Alam',
        dimensions: 'EU 40–44 + Tali Gym 2.8m',
        weight: '540 gram',
        warranty: 'Garansi Sol & Jahitan 30 Hari',
        originCity: 'Kota Surabaya',
      },
      description:
        'Paket latihan lari & kardio dari Jaya Abadi Surabaya. Nyaman untuk jogging pagi, gym indoor, maupun jalan santai.',
      createdAt: hoursAgo(20),
    },
    {
      id: 'prod-11',
      sellerId: 'seller-nusantara-mart',
      sellerName: 'Nusantara Mart',
      name: 'Bundling Kopi Arabika Gayo Drip & Kacang Almond Panggang',
      category: 'Makanan',
      price: 59000,
      originalPrice: 120000,
      discountPercent: 51,
      isFlashSale: true,
      isMall: false,
      isStarSeller: true,
      isFreeShippingXtra: true,
      isOriginal: true,
      isTermurah: true,
      flashSaleStockTotal: 100,
      stock: 34,
      rating: 4.9,
      soldCount: 820,
      image: '/src/assets/images/prod_coffee_snacks_box_1795255860949.jpg',
      colors: ['Original Roast'],
      sizes: ['Paket Hemat', 'Paket Jumbo'],
      variantStocks: {
        'Original Roast-Paket Hemat': 24,
        'Original Roast-Paket Jumbo': 18,
      },
      sizeChart: [
        { size: 'Paket Hemat', panjangCm: '18.0 cm', lebarCm: '12.0 cm' },
        { size: 'Paket Jumbo', panjangCm: '24.0 cm', lebarCm: '16.0 cm' },
      ],
      specs: {
        material: '100% Biji Kopi Arabika Gayo + Almond Panggang Halal MUI & PIRT',
        dimensions: '3 Box Drip Coffee (180g) + 1 Jar Almond (180g)',
        weight: '420 gram',
        warranty: 'Jaminan Segel Baru & Kadaluarsa > 10 Bulan',
        originCity: 'Kota Depok',
      },
      reviews: [
        {
          id: 'rev-11',
          buyerName: 'Taufik Hidayat',
          rating: 5,
          variantLabel: 'Warna: Original Roast, Ukuran: Paket Hemat',
          comment: 'Aroma kopinya wangi banget & almond panggangnya renyah gurih tanpa minyak!',
          photo: '/src/assets/images/prod_coffee_snacks_box_1795255860949.jpg',
          createdAt: hoursAgo(5),
        },
      ],
      description:
        'Nikmati paket hemat Kopi Arabika Nusantara siap seduh (Gayo, Toraja, Kintamani) dipadukan dengan Roasted Almond sehat panggang tanpa pengawet. Tersertifikasi Halal & PIRT resmi.',
      createdAt: hoursAgo(18),
    },
    {
      id: 'prod-12',
      sellerId: 'seller-nusantara-mart',
      sellerName: 'Nusantara Mart',
      name: 'Supermarket Hemat: Paket Sembako Kopi, Snack & Botol Minum',
      category: 'Supermarket',
      price: 49000,
      originalPrice: 99000,
      discountPercent: 51,
      isFlashSale: false,
      isMall: false,
      isStarSeller: true,
      isFreeShippingXtra: true,
      isOriginal: true,
      isTermurah: true,
      stock: 45,
      rating: 4.9,
      soldCount: 910,
      image: '/src/assets/images/prod_coffee_snacks_box_1795255860949.jpg',
      colors: ['Paket Keluarga'],
      sizes: ['Reguler'],
      specs: {
        material: 'Produk Harian Terverifikasi BPOM & Halal MUI',
        dimensions: 'Kemasan Dus Rapi Anti Penyok',
        weight: '750 gram',
        warranty: 'Garansi Segel Utuh & Uang Kembali',
        originCity: 'Kota Depok',
      },
      description:
        'Paket Supermarket Termurah di VTC untuk stok dapur dan camilan keluarga. Pengiriman cepat same-day & COD tersedia.',
      createdAt: hoursAgo(14),
    },
    {
      id: 'prod-13',
      sellerId: 'seller-nusantara-mart',
      sellerName: 'Nusantara Mart',
      name: 'VTC Food: Paket Chicken Teriyaki Bowl + Boba (Beli 1 Gratis 1)',
      category: 'VTC Food',
      price: 39000,
      originalPrice: 78000,
      discountPercent: 50,
      isFlashSale: true,
      isStarSeller: true,
      isStarPlus: true,
      isFreeShippingXtra: true,
      isFood: true,
      isBuy1Get1: true,
      isHalal: true,
      fastDeliveryMins: 28,
      flashSaleStockTotal: 90,
      stock: 48,
      rating: 4.9,
      soldCount: 1420,
      image: '/src/assets/images/prod_food_boba_ricebowl_1795257154735.jpg',
      images: [
        '/src/assets/images/prod_food_boba_ricebowl_1795257154735.jpg',
        '/src/assets/images/prod_coffee_snacks_box_1795255860949.jpg',
      ],
      hasVideo: true,
      videoCaption: 'Masak hangat langsung antar 30 menit sampai depan rumah!',
      colors: ['Original Teriyaki', 'Pedas Sambal Matah'],
      sizes: ['Beli 1 Gratis 1', 'Paket Hemat 1 Porsi'],
      variantStocks: {
        'Original Teriyaki-Beli 1 Gratis 1': 24,
        'Pedas Sambal Matah-Beli 1 Gratis 1': 24,
      },
      specs: {
        material: '100% Daging Ayam Segar Halal MUI + Beras Pandan Wangi + Gula Aren',
        dimensions: 'Bowl 650ml + Cup Boba 500ml (Tiba < 30 Menit)',
        weight: '780 gram',
        warranty: 'Jaminan Hangat & Segar 30 Menit Antar',
        originCity: 'Kota Depok',
      },
      description:
        'Menu paling laris di VTC Food! Pesan 1 Chicken Teriyaki Rice Bowl & Brown Sugar Boba langsung dapat 1 porsi lagi GRATIS. Diantar kurir cepat GoSend / GrabExpress / VTC Express dalam 30 menit.',
      createdAt: hoursAgo(10),
    },
    {
      id: 'prod-14',
      sellerId: 'seller-dapur-modern',
      sellerName: 'Dapur Modern',
      name: 'VTC Food: Paket Kopi Susu Gula Aren & Camilan Hangat 30 Menit',
      category: 'VTC Food',
      price: 29000,
      originalPrice: 55000,
      discountPercent: 47,
      isStarSeller: true,
      isFreeShippingXtra: true,
      isFood: true,
      isHalal: true,
      fastDeliveryMins: 25,
      stock: 60,
      rating: 4.9,
      soldCount: 980,
      image: '/src/assets/images/prod_coffee_snacks_box_1795255860949.jpg',
      images: [
        '/src/assets/images/prod_coffee_snacks_box_1795255860949.jpg',
        '/src/assets/images/prod_food_boba_ricebowl_1795257154735.jpg',
      ],
      colors: ['Less Sugar', 'Normal Sugar'],
      sizes: ['Cup 500ml + Snack', 'Botol 1 Liter'],
      specs: {
        material: 'Espresso Arabika Segar + Susu Segar + Gula Aren Organik Halal',
        weight: '550 gram',
        warranty: 'Jaminan Tiba < 30 Menit',
        originCity: 'Kota Bekasi',
      },
      description:
        'Minuman favorit harian VTC Food dengan espresso arabika pilihan dan camilan renyah. Antar cepat dalam 25-30 menit.',
      createdAt: hoursAgo(9),
    },
    {
      id: 'prod-15',
      sellerId: 'seller-nusantara-mart',
      sellerName: 'Nusantara Mart',
      name: 'VTC Mart: Keranjang Sayur Organik, Tomat & Buah Segar Harian',
      category: 'VTC Mart',
      price: 54000,
      originalPrice: 95000,
      discountPercent: 43,
      isStarSeller: true,
      isStarPlus: true,
      isFreeShippingXtra: true,
      isMart: true,
      isHalal: true,
      isTermurah: true,
      fastDeliveryMins: 45,
      stock: 52,
      rating: 4.9,
      soldCount: 1120,
      image: '/src/assets/images/prod_mart_fresh_veggies_1795257155284.jpg',
      images: [
        '/src/assets/images/prod_mart_fresh_veggies_1795257155284.jpg',
        '/src/assets/images/prod_coffee_snacks_box_1795255860949.jpg',
      ],
      colors: ['Paket Sayur & Buah', 'Paket Masak Harian'],
      sizes: ['1.5 Kg', '3 Kg Keluarga'],
      specs: {
        material: 'Brokoli Hidroponik, Tomat Merah, Apel Fuji, Jeruk Medan Segar',
        weight: '1.500 gram',
        warranty: 'Garansi Segar — Layu Langsung Ganti Baru',
        originCity: 'Kota Depok',
      },
      description:
        'Belanja pasar tanpa keluar rumah lewat VTC Mart! Dipetik pagi hari dari petani lokal, dikemas higienis, dan diantar langsung ke dapur Anda.',
      createdAt: hoursAgo(8),
    },
    {
      id: 'prod-16',
      sellerId: 'seller-nusantara-mart',
      sellerName: 'Nusantara Mart',
      name: 'Supermarket Grosir: Paket Sembako Beras, Pasta, Oat & Minyak 5 Kg',
      category: 'Supermarket',
      price: 119000,
      originalPrice: 185000,
      discountPercent: 36,
      isStarSeller: true,
      isFreeShippingXtra: true,
      isMart: true,
      isWholesale: true,
      isHalal: true,
      isTermurah: true,
      stock: 80,
      rating: 4.9,
      soldCount: 1640,
      image: '/src/assets/images/prod_mart_fresh_veggies_1795257155284.jpg',
      images: [
        '/src/assets/images/prod_mart_fresh_veggies_1795257155284.jpg',
        '/src/assets/images/prod_coffee_snacks_box_1795255860949.jpg',
      ],
      colors: ['Harga Grosir Hemat'],
      sizes: ['1 Paket (5 Kg)', 'Grosir 3 Paket'],
      specs: {
        material: 'Beras Premium, Minyak Goreng Sawit Vitamin A, Oat & Pasta Halal MUI',
        weight: '5.000 gram',
        warranty: 'Garansi Kemasan Utuh & Harga Grosir Termurah',
        originCity: 'Kota Depok',
      },
      description:
        'Belanja Supermarket Harga Grosir di VTC SHOP INDONESIA! Cocok untuk stok bulanan rumah tangga atau warung sembako.',
      createdAt: hoursAgo(7),
    },
    {
      id: 'prod-17',
      sellerId: 'seller-glow-cantik',
      sellerName: 'Glow Cantik ID',
      name: 'VTC Halal: Gift Box Hijab Sutra Premium & Madu Herbal BPOM Halal MUI',
      category: 'VTC Halal',
      price: 149000,
      originalPrice: 299000,
      discountPercent: 50,
      isMall: true,
      isStarSeller: true,
      isStarPlus: true,
      isFreeShippingXtra: true,
      isOriginal: true,
      isHalal: true,
      stock: 32,
      rating: 5.0,
      soldCount: 684,
      image: '/src/assets/images/prod_halal_skincare_hijab_1795257155043.jpg',
      images: [
        '/src/assets/images/prod_halal_skincare_hijab_1795257155043.jpg',
        '/src/assets/images/prod_skincare_serum_1795236670640.jpg',
      ],
      hasVideo: true,
      videoCaption: 'Sertifikasi Halal MUI & BPOM resmi 100% bahan alami tanpa alkohol',
      colors: ['Terakota', 'Krem', 'Hitam'],
      sizes: ['Gift Box Lengkap', 'Hijab Saja'],
      specs: {
        material: 'Sutra Voal Premium + Madu Hutan & Olive Mist (Halal MUI & BPOM)',
        dimensions: 'Box 28 × 22 × 8 cm',
        weight: '520 gram',
        warranty: 'Sertifikat Halal MUI Resmi No. ID00110002819',
        originCity: 'Kota Tangerang',
      },
      description:
        'Kurasi spesial VTC Halal! Paket hadiah & perawatan diri tersertifikasi Halal MUI dan BPOM resmi. Bebas alkohol, nyaman dipakai harian, dan elegan untuk bingkisan.',
      createdAt: hoursAgo(5),
    },
    {
      id: 'prod-18',
      sellerId: 'seller-vtv-official',
      sellerName: 'Nusantara Flagship ID',
      name: 'VTC Halal: Paket Skincare Vitamin C & Perawatan Wajah Bebas Alkohol MUI',
      category: 'VTC Halal',
      price: 129000,
      originalPrice: 249000,
      discountPercent: 48,
      isMall: true,
      isStarSeller: true,
      isStarPlus: true,
      isFreeShippingXtra: true,
      isOriginal: true,
      isHalal: true,
      stock: 44,
      rating: 4.9,
      soldCount: 512,
      image: '/src/assets/images/prod_skincare_serum_1795236670640.jpg',
      images: [
        '/src/assets/images/prod_skincare_serum_1795236670640.jpg',
        '/src/assets/images/prod_halal_skincare_hijab_1795257155043.jpg',
      ],
      colors: ['Putih', 'Krem'],
      sizes: ['Set Lengkap'],
      specs: {
        material: 'Ekstrak Botanical Halal MUI, Niacinamide & Vitamin C Stabil',
        weight: '280 gram',
        warranty: 'Garansi 100% Original Halal MUI',
        originCity: 'Jakarta Selatan',
      },
      description:
        'Skincare halal MUI aman untuk ibu hamil, menyusui, dan kulit sensitif. 100% Original Nusantara Flagship ID Mall.',
      createdAt: hoursAgo(4),
    },
  ];

  const orders: Order[] = [
    {
      id: 'VTC-261120-0812',
      buyerName: 'Andra Pratama',
      buyerPhone: '081345678901',
      buyerAddress: 'Jl. Kemang Raya No. 45, Mampang Prapatan, Jakarta Selatan',
      senderName: 'Berkah Cell',
      senderAddress: 'Kota Bandung · 081377889900',
      courier: 'J&T',
      paymentMethod: 'COD',
      codFee: 2000,
      codConfirmed: true,
      shippingFee: 0,
      discountAmount: 0,
      trackingNumber: 'JT8829104421',
      items: [
        {
          productId: 'prod-1',
          productName: 'SoundBuds Pro TWS Wireless ANC Bluetooth 5.3',
          productImage: '/src/assets/images/prod_earbuds_orange_1795236669505.jpg',
          price: 199000,
          quantity: 1,
          selectedColor: 'Putih',
          selectedSize: 'Pro ANC',
          sellerId: 'seller-berkah-cell',
          sellerName: 'Berkah Cell',
        },
      ],
      subtotal: 199000,
      totalAmount: 201000,
      status: 'Sampai',
      escrowStatus: 'held',
      estimatedDeliveryAt: hoursAgo(2),
      lateVoucherClaimed: false,
      coinsEarned: 1990,
      trackingHistory: [
        {
          title: 'Paket Sampai di Alamat Tujuan',
          detail: 'Kurir J&T telah mengantar paket ke penerima di Jakarta Selatan.',
          time: hoursAgo(3),
        },
        {
          title: 'Dalam Pengiriman Kurir J&T',
          detail: 'Paket keluar dari Gudang Sortir Jakarta Pusat (Resi: JT8829104421).',
          time: hoursAgo(18),
        },
        {
          title: 'Dikemas oleh Seller',
          detail: 'Berkah Cell selesai mengemas pesanan dan menyerahkan ke kurir.',
          time: hoursAgo(32),
        },
        {
          title: 'Pesanan Dibuat',
          detail: 'Pesanan COD GARANSI diverifikasi oleh VTC SHOP INDONESIA.',
          time: hoursAgo(42),
        },
      ],
      createdAt: hoursAgo(42),
      updatedAt: hoursAgo(3),
    },
    {
      id: 'VTC-261120-0794',
      buyerName: 'Rina Marlina',
      buyerPhone: '082198765432',
      buyerAddress: 'Perumahan Taman Anggrek Blok C3 No. 12, Bekasi Barat',
      senderName: 'Dapur Modern',
      senderAddress: 'Kota Bekasi · 085711229988',
      courier: 'SPX',
      paymentMethod: 'COD',
      codFee: 2000,
      codConfirmed: true,
      shippingFee: 10000,
      discountAmount: 0,
      trackingNumber: '',
      items: [
        {
          productId: 'prod-3',
          productName: 'Tumbler Vakum Stainless SUS 304 Anti Bocor',
          productImage: '/src/assets/images/prod_tumbler_thermal_1795236670111.jpg',
          price: 79000,
          quantity: 1,
          selectedColor: 'Hitam',
          selectedSize: '600ml',
          sellerId: 'seller-dapur-modern',
          sellerName: 'Dapur Modern',
        },
      ],
      subtotal: 79000,
      totalAmount: 91000,
      status: 'Diproses',
      escrowStatus: 'held',
      estimatedDeliveryAt: hoursFromNow(48),
      lateVoucherClaimed: false,
      coinsEarned: 790,
      trackingHistory: [
        {
          title: 'Pesanan Diproses Seller',
          detail: 'Dapur Modern sedang menyiapkan & mengecek kualitas barang.',
          time: hoursAgo(2),
        },
        {
          title: 'Pesanan Dibuat',
          detail: 'Pesanan diterima sistem VTC SHOP INDONESIA.',
          time: hoursAgo(5),
        },
      ],
      createdAt: hoursAgo(5),
      updatedAt: hoursAgo(2),
    },
    {
      id: 'VTC-261119-0641',
      buyerName: 'Dewi Lestari',
      buyerPhone: '087811223344',
      buyerAddress: 'Jl. Setiabudi No. 88, Coblong, Kota Bandung',
      senderName: 'Glow Cantik ID',
      senderAddress: 'Kota Tangerang · 087855664433',
      courier: 'SiCepat',
      paymentMethod: 'VTCPay',
      shippingFee: 10000,
      discountAmount: 0,
      trackingNumber: 'SC0049182219',
      items: [
        {
          productId: 'prod-4',
          productName: 'Serum Wajah Vitamin C Radiance Brightening',
          productImage: '/src/assets/images/prod_skincare_serum_1795236670640.jpg',
          price: 89000,
          quantity: 1,
          selectedColor: 'Putih',
          selectedSize: '15ml',
          sellerId: 'seller-glow-cantik',
          sellerName: 'Glow Cantik ID',
        },
      ],
      subtotal: 89000,
      totalAmount: 99000,
      status: 'Selesai',
      escrowStatus: 'released',
      estimatedDeliveryAt: hoursAgo(10),
      lateVoucherClaimed: false,
      coinsEarned: 890,
      trackingHistory: [
        {
          title: 'Pesanan Diterima & Selesai',
          detail: 'Pembeli mengkonfirmasi barang sesuai. Dana dilepas ke Seller.',
          time: hoursAgo(14),
        },
        {
          title: 'Paket Dikirim SiCepat',
          detail: 'Kurir SiCepat mengantar dari Tangerang ke Bandung.',
          time: hoursAgo(36),
        },
        {
          title: 'Dikemas Glow Cantik ID',
          detail: 'Produk skincare dipacking dengan bubble wrap tebal.',
          time: hoursAgo(48),
        },
        {
          title: 'Pesanan Dibuat',
          detail: 'Pembayaran VTC Pay berhasil diverifikasi.',
          time: hoursAgo(54),
        },
      ],
      createdAt: hoursAgo(54),
      updatedAt: hoursAgo(14),
    },
  ];

  const vouchers: Voucher[] = [];

  const liveStreams: LiveStreamItem[] = [
    {
      id: 'live-1',
      title: 'Flash Sale 80% SoundBuds Pro ANC & Unboxing Live!',
      hostName: 'Berkah Cell Official',
      platform: 'VTC Studio',
      videoUrl: '/videos/vtc-live-studio.mp4',
      viewerCount: 1842,
      likes: 6420,
      productId: 'prod-1',
      isLive: true,
      createdAt: hoursAgo(1),
      comments: [
        {
          id: 'c1',
          author: 'Rizky_Jkt',
          text: 'Suaranya nge-bass banget ya kak? Bisa COD?',
          createdAt: hoursAgo(0.5),
        },
        {
          id: 'c2',
          author: 'Berkah Cell',
          text: 'Bisa COD Garansi! Uang ditahan VTC SHOP INDONESIA dulu sebelum diterima.',
          createdAt: hoursAgo(0.4),
        },
      ],
    },
    {
      id: 'live-2',
      title: 'Review Sepatu Lari Urban Knit — Diskon 50% Hari Ini',
      hostName: 'Jaya Abadi Surabaya',
      platform: 'TikTok Live',
      videoUrl: '/videos/vtc-short-tiktok.mp4',
      viewerCount: 935,
      likes: 3110,
      productId: 'prod-2',
      isLive: true,
      createdAt: hoursAgo(2),
      comments: [
        {
          id: 'c3',
          author: 'Nadia.S',
          text: 'Ukuran M ready kak?',
          createdAt: hoursAgo(0.2),
        },
      ],
    },
    {
      id: 'live-3',
      title: 'Setup Meja Kerja Minimalis + Keyboard Tri-Mode',
      hostName: 'Berkah Cell Bandung',
      platform: 'YouTube Live',
      videoUrl: '/videos/vtc-product-demo.mp4',
      viewerCount: 624,
      likes: 1980,
      productId: 'prod-5',
      isLive: true,
      createdAt: hoursAgo(3),
      comments: [],
    },
    {
      id: 'live-4',
      title: 'Belanja Hemat Skincare & Kebutuhan Rumah Tangga',
      hostName: 'Glow Cantik ID',
      platform: 'TV Live',
      videoUrl: '/videos/vtc-live-studio.mp4',
      viewerCount: 2410,
      likes: 8510,
      productId: 'prod-4',
      isLive: true,
      createdAt: hoursAgo(4),
      comments: [],
    },
    {
      id: 'live-5',
      title: 'Live Gudang Jakarta: Tas Kerja Anti Air Nusantara Flagship',
      hostName: 'Nusantara Flagship ID',
      platform: 'Facebook Live',
      videoUrl: '/videos/vtc-product-demo.mp4',
      viewerCount: 412,
      likes: 940,
      productId: 'prod-6',
      isLive: true,
      createdAt: hoursAgo(1.5),
      comments: [],
    },
  ];

  const shortVideos: ShortVideoItem[] = [
    {
      id: 'vid-1',
      title: 'Tes Noise Cancelling SoundBuds Pro di Kafe Ramai',
      creatorName: '@berkahcell_bdg',
      productId: 'prod-1',
      videoUrl: '/videos/vtc-short-tiktok.mp4',
      likes: 1240,
      views: 18400,
      caption: 'Mode ANC aktif langsung senyap! Flash Sale 80% cuma hari ini.',
      createdAt: hoursAgo(6),
      comments: [
        {
          id: 'vc1',
          author: 'dimas.p',
          text: 'Langsung checkout COD mumpung diskon 80%!',
          createdAt: hoursAgo(2),
        },
      ],
    },
    {
      id: 'vid-2',
      title: 'Tumbler 600ml Isi Es Batu Tahan 24 Jam Nonstop',
      creatorName: '@dapur_modern',
      productId: 'prod-3',
      videoUrl: '/videos/vtc-product-demo.mp4',
      likes: 890,
      views: 9200,
      caption: 'Cocok buat kerja & olahraga, tutup anti tumpah di dalam tas.',
      createdAt: hoursAgo(12),
      comments: [],
    },
    {
      id: 'vid-3',
      title: 'Isi Tas Ransel Kerja 15.6 Inci + Tes Siram Air',
      creatorName: '@vtc_official',
      productId: 'prod-6',
      videoUrl: '/videos/vtc-live-studio.mp4',
      likes: 1560,
      views: 21500,
      caption: 'Laptop aman saat hujan deras! Cek keranjang kuning di bawah.',
      createdAt: hoursAgo(18),
      comments: [],
    },
  ];

  const tvChannels: TvChannel[] = [
    {
      id: 'tv-sctv',
      name: 'SCTV',
      category: 'Sinetron',
      streamUrl: 'https://lnd0t3b922.tenbytecdn.com/ta-sg1/90369cf5-6ac2-411d-b3d0-15fae10a2e2c/master.m3u8',
      fallbackStreamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      viewerCount: 14820,
      currentShow: 'Sinetron Unggulan: Cinta di Langit Jakarta',
      nextShow: '21:00 · FTV Primetime Spesial',
      productId: 'prod-17',
      schedules: [
        { time: '18:30', program: 'Sinetron Unggulan: Cinta di Langit Jakarta' },
        { time: '21:00', program: 'FTV Primetime Spesial Malam' },
        { time: '23:00', program: 'Liputan 6 Malam' },
      ],
    },
    {
      id: 'tv-indosiar',
      name: 'Indosiar',
      category: 'Bola',
      streamUrl: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
      fallbackStreamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      viewerCount: 22410,
      currentShow: 'BRI Liga 1 Live: Big Match Nusantara',
      nextShow: '21:30 · D-Academy Konser Kemenangan',
      productId: 'prod-2',
      schedules: [
        { time: '19:00', program: 'BRI Liga 1 Live: Big Match Nusantara' },
        { time: '21:30', program: 'D-Academy Konser Kemenangan' },
        { time: '23:45', program: 'Fokus Malam' },
      ],
    },
    {
      id: 'tv-rcti',
      name: 'RCTI',
      category: 'Sinetron',
      streamUrl: 'https://jakarta.staratv.id/hls/0/stream.m3u8',
      fallbackStreamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      viewerCount: 19350,
      currentShow: 'Ikatan Keluarga & MasterChef Spesial',
      nextShow: '21:15 · Layar Drama Indonesia',
      productId: 'prod-3',
      schedules: [
        { time: '18:00', program: 'Ikatan Keluarga & MasterChef Spesial' },
        { time: '21:15', program: 'Layar Drama Indonesia' },
        { time: '23:15', program: 'Seputar iNews Malam' },
      ],
    },
    {
      id: 'tv-transtv',
      name: 'Trans TV',
      category: 'Film',
      streamUrl: 'https://video.detik.com/livecnn/smil:cnntv/chunklist_w268557525_b384000_sleng.m3u8',
      fallbackStreamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      viewerCount: 16200,
      currentShow: 'Bioskop Trans TV: Action Blockbuster HD',
      nextShow: '22:00 · Bioskop Trans TV Malam',
      productId: 'prod-1',
      schedules: [
        { time: '19:30', program: 'Insert Story Spesial' },
        { time: '21:00', program: 'Bioskop Trans TV: Action Blockbuster HD' },
        { time: '23:00', program: 'Bioskop Trans TV Tengah Malam' },
      ],
    },
    {
      id: 'tv-trans7',
      name: 'Trans 7',
      category: 'Anak',
      streamUrl: 'https://video.detik.com/livecnbc/smil:cnbctv/chunklist_w1279679883_b384000_sleng.m3u8',
      fallbackStreamUrl: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
      viewerCount: 11400,
      currentShow: 'Si Bolang & Lapor Pak! Komedi Live',
      nextShow: '21:30 · Lapor Pak! Spesial Akhir Pekan',
      productId: 'prod-13',
      schedules: [
        { time: '18:30', program: 'On The Spot Pilihan' },
        { time: '20:30', program: 'Arisan & Si Bolang Spesial' },
        { time: '21:30', program: 'Lapor Pak! Komedi Live' },
      ],
    },
    {
      id: 'tv-antv',
      name: 'ANTV',
      category: 'Drama Korea',
      streamUrl: 'https://pull.daaiplus.com/live-DAAIPLUS/live-DAAIPLUS_HD.m3u8',
      fallbackStreamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      viewerCount: 8940,
      currentShow: 'Drakor & Mega Bollywood Pilihan',
      nextShow: '22:00 · Sinema Horor Asia',
      productId: 'prod-4',
      schedules: [
        { time: '18:00', program: 'Drakor Romantis Pilihan' },
        { time: '20:30', program: 'Mega Bollywood Spesial' },
        { time: '22:00', program: 'Sinema Horor Asia' },
      ],
    },
    {
      id: 'tv-net',
      name: 'NET',
      category: 'Musik',
      streamUrl: 'https://tvstreamcast.com/indonesiana.m3u8',
      fallbackStreamUrl: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
      viewerCount: 9280,
      currentShow: 'NET Tonight Music & Drama Korea Populer',
      nextShow: '21:00 · Tonight Show Premiere',
      productId: 'prod-5',
      schedules: [
        { time: '19:00', program: 'Drakor Populer: Vincenzo' },
        { time: '21:00', program: 'Tonight Show Premiere' },
        { time: '22:30', program: '86 & Jatanras' },
      ],
    },
    {
      id: 'tv-tvri',
      name: 'TVRI',
      category: 'Berita',
      streamUrl: 'https://ott-balancer.tvri.go.id/live/eds/DKI/hls/DKI.m3u8',
      fallbackStreamUrl: 'https://ott-balancer.tvri.go.id/live/eds/Jatim/hls/Jatim.m3u8',
      viewerCount: 5420,
      currentShow: 'Pesona Nusantara & TVRI Sport Live',
      nextShow: '21:00 · Dunia Dalam Berita',
      productId: 'prod-15',
      schedules: [
        { time: '19:00', program: 'Pesona Nusantara Indonesia' },
        { time: '21:00', program: 'Dunia Dalam Berita' },
        { time: '22:00', program: 'TVRI Sport Arena' },
      ],
    },
    {
      id: 'tv-metrotv',
      name: 'Metro TV',
      category: 'Berita',
      streamUrl: 'https://edge.medcom.id/live-edge/smil:metro.smil/playlist.m3u8',
      fallbackStreamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      viewerCount: 7810,
      currentShow: 'Prime Time News & Ekonomi Indonesia',
      nextShow: '21:05 · Kick Andy Inspirasi',
      productId: 'prod-7',
      schedules: [
        { time: '18:30', program: 'Prime Time News' },
        { time: '21:05', program: 'Kick Andy Inspirasi' },
        { time: '22:30', program: 'Top News Malam' },
      ],
    },
    {
      id: 'tv-kompastv',
      name: 'Kompas TV',
      category: 'Berita',
      streamUrl: 'https://ott-balancer.tvri.go.id/live/eds/Jateng/hls/Jateng.m3u8',
      fallbackStreamUrl: 'https://edge.medcom.id/live-edge/smil:metro.smil/playlist.m3u8',
      viewerCount: 9630,
      currentShow: 'Kompas Malam & Stand Up Comedy Live',
      nextShow: '21:30 · Rosi Talkshow Eksklusif',
      productId: 'prod-6',
      schedules: [
        { time: '19:00', program: 'Sapa Indonesia Malam' },
        { time: '21:30', program: 'Rosi Talkshow Eksklusif' },
        { time: '22:30', program: 'Kompas Sport Malam' },
      ],
    },
    {
      id: 'tv-inews',
      name: 'iNews',
      category: 'Bola',
      streamUrl: 'https://ott-balancer.tvri.go.id/live/eds/Bali/hls/Bali.m3u8',
      fallbackStreamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      viewerCount: 10240,
      currentShow: 'iNews Sore & Siaran Langsung Bulutangkis',
      nextShow: '21:00 · Realita & Sport Tonight',
      productId: 'prod-10',
      schedules: [
        { time: '18:00', program: 'Siaran Langsung Bulutangkis BWF' },
        { time: '21:00', program: 'iNews Malam' },
        { time: '22:00', program: 'Sport Tonight' },
      ],
    },
    {
      id: 'tv-mnctv',
      name: 'MNC TV',
      category: 'Anak',
      streamUrl: 'https://ott-balancer.tvri.go.id/live/eds/Sumut/hls/Sumut.m3u8',
      fallbackStreamUrl: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
      viewerCount: 13560,
      currentShow: 'Upin & Ipin Spesial & Family 100',
      nextShow: '21:00 · Kontes Dangdut Nusantara',
      productId: 'prod-9',
      schedules: [
        { time: '18:00', program: 'Upin & Ipin Spesial' },
        { time: '19:30', program: 'Family 100 Indonesia' },
        { time: '21:00', program: 'Kontes Dangdut Nusantara' },
      ],
    },
  ];

  const socialVideos: SocialVideoItem[] = [
    {
      id: 'sv-1',
      platform: 'VTC Live Shopping',
      category: 'VTC Live Shopping',
      title: 'Unboxing SoundBuds Pro ANC Diskon 80% + Cek Keranjang Kuning!',
      creator: '@berkahcell_official',
      duration: '12:40',
      views: 42500,
      likes: 6410,
      productId: 'prod-1',
      thumbnail: '/src/assets/images/prod_earbuds_orange_1795236669505.jpg',
      videoUrl: '/videos/vtc-live-studio.mp4',
    },
    {
      id: 'sv-2',
      platform: 'TikTok',
      category: 'Drama Korea',
      title: 'Review Skincare Ala Drakor + Serum Vitamin C Glow Cantik BPOM',
      creator: '@nadia_beauty.id',
      duration: '01:15',
      views: 128400,
      likes: 18920,
      productId: 'prod-4',
      thumbnail: '/src/assets/images/prod_skincare_serum_1795236670640.jpg',
      videoUrl: '/videos/vtc-short-tiktok.mp4',
    },
    {
      id: 'sv-3',
      platform: 'YouTube',
      category: 'Film',
      title: 'Setup Cinema & Gaming Meja Kerja Keyboard Tri-Mode + Smartphone 5G',
      creator: 'Tech Nusantara ID',
      duration: '15:22',
      views: 64200,
      likes: 4820,
      productId: 'prod-5',
      thumbnail: '/src/assets/images/prod_keyboard_mech_1795236671078.jpg',
      videoUrl: '/videos/vtc-product-demo.mp4',
    },
    {
      id: 'sv-4',
      platform: 'Facebook Watch',
      category: 'Bola',
      title: 'Highlight Sepak Bola Nasional + Review Sepatu Lari Super Empuk',
      creator: 'Bola Nusantara Watch',
      duration: '08:45',
      views: 89100,
      likes: 9300,
      productId: 'prod-2',
      thumbnail: '/src/assets/images/prod_sneakers_urban_1795236669228.jpg',
      videoUrl: '/videos/vtc-live-studio.mp4',
    },
    {
      id: 'sv-5',
      platform: 'Facebook Reels',
      category: 'Sinetron',
      title: 'Mukbang Chicken Teriyaki & Boba Beli 1 Gratis 1 Sambil Nonton Sinetron',
      creator: 'Kuliner Malam FB',
      duration: '00:58',
      views: 53000,
      likes: 5110,
      productId: 'prod-13',
      thumbnail: '/src/assets/images/prod_food_boba_ricebowl_1795257154735.jpg',
      videoUrl: '/videos/vtc-short-tiktok.mp4',
    },
    {
      id: 'sv-6',
      platform: 'Instagram Reels',
      category: 'Musik',
      title: 'OOTD Hijab Sutra Halal & Madu Herbal Sambil Dengar Musik Akustik',
      creator: '@hijabstyle_halal',
      duration: '00:45',
      views: 74900,
      likes: 11200,
      productId: 'prod-17',
      thumbnail: '/src/assets/images/prod_halal_skincare_hijab_1795257155043.jpg',
      videoUrl: '/videos/vtc-short-tiktok.mp4',
    },
    {
      id: 'sv-7',
      platform: 'YouTube',
      category: 'Berita',
      title: 'Tips Belanja Sayur & Sembako Hemat 40% di VTC Mart & Supermarket',
      creator: 'Ibu Cerdas TV',
      duration: '06:18',
      views: 31800,
      likes: 2740,
      productId: 'prod-15',
      thumbnail: '/src/assets/images/prod_mart_fresh_veggies_1795257155284.jpg',
      videoUrl: '/videos/vtc-product-demo.mp4',
    },
    {
      id: 'sv-8',
      platform: 'TikTok',
      category: 'Anak',
      title: 'Persiapan Perlengkapan Susu Bayi Praktis Anti Ribet Buat Bunda',
      creator: '@bunda_hebat.id',
      duration: '01:05',
      views: 49200,
      likes: 6150,
      productId: 'prod-9',
      thumbnail: '/src/assets/images/prod_baby_diaper_bag_1795255861620.jpg',
      videoUrl: '/videos/vtc-short-tiktok.mp4',
    },
  ];

  const instagramStories: InstagramStory[] = [
    {
      id: 'ig-story-1',
      sellerId: 'seller-berkah-cell',
      storeName: 'Berkah Cell',
      handle: '@berkahcell.id',
      avatarImage: '/src/assets/images/prod_earbuds_orange_1795236669505.jpg',
      storyImage: '/src/assets/images/prod_earbuds_orange_1795236669505.jpg',
      caption: 'Restock SoundBuds Pro ANC Flash Sale 80%! Klaim voucher toko & COD gratis ongkir.',
      productId: 'prod-1',
      createdAt: hoursAgo(1),
    },
    {
      id: 'ig-story-2',
      sellerId: 'seller-vtv-official',
      storeName: 'Nusantara Flagship ID',
      handle: '@vtc_official',
      avatarImage: '/src/assets/images/prod_backpack_canvas_1795236671576.jpg',
      storyImage: '/src/assets/images/prod_backpack_canvas_1795236671576.jpg',
      caption: 'Tas Laptop Anti Air siap kirim dari Jakarta Selatan hari ini via SPX & J&T.',
      productId: 'prod-6',
      createdAt: hoursAgo(2),
    },
    {
      id: 'ig-story-3',
      sellerId: 'seller-glow-cantik',
      storeName: 'Glow Cantik ID',
      handle: '@glowcantik.mall',
      avatarImage: '/src/assets/images/prod_skincare_serum_1795236670640.jpg',
      storyImage: '/src/assets/images/prod_skincare_serum_1795236670640.jpg',
      caption: 'Serum Vitamin C BPOM 100% Original garansi uang kembali 2x lipat!',
      productId: 'prod-4',
      createdAt: hoursAgo(3),
    },
    {
      id: 'ig-story-4',
      sellerId: 'seller-jaya-abadi',
      storeName: 'Jaya Abadi',
      handle: '@jayaabadi.sport',
      avatarImage: '/src/assets/images/prod_sneakers_urban_1795236669228.jpg',
      storyImage: '/src/assets/images/prod_sneakers_urban_1795236669228.jpg',
      caption: 'Sepatu Lari Urban Knit ringan & empuk! Bisa tukar ukuran 7 hari.',
      productId: 'prod-2',
      createdAt: hoursAgo(4),
    },
  ];

  const instagramPosts: InstagramPost[] = [
    {
      id: 'ig-post-1',
      sellerId: 'seller-berkah-cell',
      storeName: 'Berkah Cell',
      handle: '@berkahcell.id',
      city: 'Kota Bandung',
      image: '/src/assets/images/prod_earbuds_orange_1795236669505.jpg',
      caption: 'Unboxing & Foto Real SoundBuds Pro TWS ANC! Stok Bandung siap kirim COD ke seluruh Indonesia.',
      likes: 2840,
      productId: 'prod-1',
      comments: [
        {
          id: 'igc1',
          author: 'putra_bandung',
          text: 'Baru sampai kemarin via J&T COD, bass mantap!',
          createdAt: hoursAgo(1),
        },
      ],
      createdAt: hoursAgo(3),
    },
    {
      id: 'ig-post-2',
      sellerId: 'seller-jaya-abadi',
      storeName: 'Jaya Abadi',
      handle: '@jayaabadi.sport',
      city: 'Kota Surabaya',
      image: '/src/assets/images/prod_sneakers_urban_1795236669228.jpg',
      caption: 'OOTD Lari Pagi bareng Urban Knit Casual Sport! Sol empuk anti pegal, harga diskon 50%.',
      likes: 1920,
      productId: 'prod-2',
      comments: [],
      createdAt: hoursAgo(5),
    },
    {
      id: 'ig-post-3',
      sellerId: 'seller-glow-cantik',
      storeName: 'Glow Cantik ID',
      handle: '@glowcantik.mall',
      city: 'Kota Tangerang',
      image: '/src/assets/images/prod_halal_skincare_hijab_1795257155043.jpg',
      caption: 'Paket Skincare Halal MUI + Giftbox Cantik cocok untuk kado & perawatan harian aman BPOM.',
      likes: 3410,
      productId: 'prod-17',
      comments: [],
      createdAt: hoursAgo(7),
    },
  ];

  const notifications: AppNotification[] = [
    {
      id: 'notif-1',
      type: 'wishlist',
      title: 'Harga Wishlist Turun 80%!',
      body: 'SoundBuds Pro TWS Wireless ANC kini Rp 199.000 di Flash Sale VTC.',
      targetTab: 'home',
      read: false,
      createdAt: hoursAgo(0.5),
    },
    {
      id: 'notif-2',
      type: 'live',
      title: 'Seller Berkah Cell Sedang LIVE!',
      body: 'Nonton di VTC TV & klik Keranjang Kuning untuk harga promo live.',
      targetTab: 'tv',
      read: false,
      createdAt: hoursAgo(1),
    },
    {
      id: 'notif-3',
      type: 'voucher',
      title: 'Voucher Gratis Ongkir XTRA Segera Berakhir',
      body: 'Pakai BEBAS-ONGKIR sebelum hangus malam ini bersama 2 voucher lainnya.',
      targetTab: 'games',
      read: false,
      createdAt: hoursAgo(2),
    },
    {
      id: 'notif-4',
      type: 'coins',
      title: 'Klaim +500 VTC Coins & Putar Roda Harian',
      body: 'Jangan sampai Koin Anda hangus — tukarkan 1 Koin = Rp 1 saat checkout!',
      targetTab: 'games',
      read: false,
      createdAt: hoursAgo(3),
    },
  ];

  const vtvpayTransactions: VtvPayTransaction[] = [];

  const affiliateProfile: AffiliateProfile = {
    step: 1,
    fullName: '',
    phone: '',
    email: '',
    socialPlatform: 'TikTok',
    socialLink: '',
    verifiedEmailCode: '',
    approved: false,
    clicks: 0,
    ordersCount: 0,
    pendingCommission: 0,
    availableCommission: 0,
    withdrawnCommission: 0,
    history: [],
  };

  return {
    seedVersion: 7,
    themeMode: 'light',
    language: 'id',
    twoFactorEnabled: false,
    notificationPrefs: { orders: true, promos: true, live: true },
    sellers,
    followedSellerIds: [],
    activeSellerId: null,
    platformFeePercent: 5,
    products,
    cart: [],
    savedAddresses: [],
    orders,
    withdrawals: [],
    vouchers,
    vtvpayBalance: 0,
    vtvpayTransactions,
    paylaterLimit: 5000000,
    paylaterUsed: 0,
    vtvPinjamBalance: 0,
    vtvCoins: 0,
    cashbackBalance: 0,
    lastCoinCheckInDate: undefined,
    tanamProgress: 25,
    lastTanamHarvestDate: undefined,
    goyangCountToday: 0,
    rodaSpinsLeft: 3,
    affiliateShares: 0,
    affiliateCommissionEstimate: 0,
    affiliateProfile,
    topUpOrders: [],
    tvChannels,
    socialVideos,
    instagramStories,
    instagramPosts,
    savedVideoIds: [],
    offlineVideoIds: [],
    continueWatching: {},
    notifications,
    fraudReports: [],
    liveStreams,
    shortVideos,
    sellerChats: {},
    wishlistIds: [],
    compareProductIds: [],
    priceAlerts: {},
    viewedProductIds: [],
    liteMode: false,
  };
}

function loadState(): MarketplaceState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildInitialState();
    const parsed = JSON.parse(raw) as MarketplaceState;
    if (!parsed || !Array.isArray(parsed.products) || !Array.isArray(parsed.sellers)) {
      return buildInitialState();
    }
    const base = buildInitialState();

    let mergedSellers = parsed.sellers;
    let mergedProducts = parsed.products;
    if ((parsed.seedVersion ?? 1) < 3) {
      const existingSellerIds = new Set(parsed.sellers.map((s) => s.id));
      mergedSellers = [
        ...parsed.sellers.map((s) => ({
          ...s,
          isStarSeller: s.isStarSeller ?? s.rating >= 4.8,
        })),
        ...base.sellers.filter((s) => !existingSellerIds.has(s.id)),
      ];
      const existingProductIds = new Set(parsed.products.map((p) => p.id));
      mergedProducts = [
        ...parsed.products.map((p) => ({
          ...p,
          isStarSeller: p.isStarSeller ?? true,
          isOriginal: p.isOriginal ?? true,
        })),
        ...base.products.filter((p) => !existingProductIds.has(p.id)),
      ];
    }

    const replaceVtvBrandText = (val: string): string =>
      val
        .replace(/VTV SHOP INDONESIA/g, 'VTC SHOP INDONESIA')
        .replace(/VTV Express/g, 'VTC Express')
        .replace(/VTVPay/g, 'VTCPay')
        .replace(/VTV Pay/g, 'VTC Pay')
        .replace(/VTV Official/g, 'Nusantara Flagship ID')
        .replace(/VTC Official/g, 'Nusantara Flagship ID')
        .replace(/VTV Food/g, 'VTC Food')
        .replace(/VTV Mart/g, 'VTC Mart')
        .replace(/VTV Halal/g, 'VTC Halal')
        .replace(/VTV Studio/g, 'VTC Studio')
        .replace(/VTV Live Shopping/g, 'VTC Live Shopping')
        .replace(/VTV Coins/g, 'VTC Coins')
        .replace(/VTV MALL/g, 'VTC MALL')
        .replace(/VTV TV/g, 'VTC TV')
        .replace(/VTV Pinjam/g, 'VTC Pinjam')
        .replace(/VTV X5/g, 'VTC X5')
        .replace(/VTV-/g, 'VTC-')
        .replace(/@vtv_official/g, '@vtc_official')
        .replace(/\bVTV\b/g, 'VTC');

    const needsVtcMigration = (parsed.seedVersion ?? 1) < 4;

    if (needsVtcMigration) {
      mergedSellers = mergedSellers.map((s) => ({
        ...s,
        storeName:
          s.storeName === 'VTV Official' || s.storeName === 'VTC Official'
            ? 'Nusantara Flagship ID'
            : replaceVtvBrandText(s.storeName),
        description: replaceVtvBrandText(s.description),
        bannerTitle: s.bannerTitle ? replaceVtvBrandText(s.bannerTitle) : s.bannerTitle,
        storeVoucher: s.storeVoucher
          ? {
              ...s.storeVoucher,
              code: replaceVtvBrandText(s.storeVoucher.code),
              title: replaceVtvBrandText(s.storeVoucher.title),
            }
          : s.storeVoucher,
      }));
      mergedProducts = mergedProducts.map((p) => ({
        ...p,
        sellerName:
          p.sellerName === 'VTV Official' || p.sellerName === 'VTC Official'
            ? 'Nusantara Flagship ID'
            : replaceVtvBrandText(p.sellerName),
        name: replaceVtvBrandText(p.name),
        category: replaceVtvBrandText(p.category),
        description: replaceVtvBrandText(p.description),
        videoCaption: p.videoCaption ? replaceVtvBrandText(p.videoCaption) : p.videoCaption,
        specs: p.specs
          ? {
              ...p.specs,
              warranty: replaceVtvBrandText(p.specs.warranty),
            }
          : p.specs,
      }));
    }

    const migratedOrders = Array.isArray(parsed.orders)
      ? needsVtcMigration
        ? parsed.orders.map((o) => ({
            ...o,
            id: replaceVtvBrandText(o.id),
            courier: (String(o.courier) === 'VTV Express' ? 'VTC Express' : o.courier) as CourierId,
            paymentMethod: (String(o.paymentMethod) === 'VTVPay' ? 'VTCPay' : o.paymentMethod) as PaymentMethodId,
            voucherCode: o.voucherCode ? replaceVtvBrandText(o.voucherCode) : o.voucherCode,
            voucherCodes: o.voucherCodes?.map(replaceVtvBrandText),
            items: o.items.map((it) => ({
              ...it,
              productName: replaceVtvBrandText(it.productName),
              sellerName: replaceVtvBrandText(it.sellerName),
            })),
            trackingHistory: o.trackingHistory?.map((th) => ({
              ...th,
              title: replaceVtvBrandText(th.title),
              detail: replaceVtvBrandText(th.detail),
            })),
          }))
        : parsed.orders
      : base.orders;

    const migratedVouchers = Array.isArray(parsed.vouchers)
      ? needsVtcMigration
        ? parsed.vouchers.map((v) => ({
            ...v,
            code: replaceVtvBrandText(v.code),
            title: replaceVtvBrandText(v.title),
            category: (String(v.category) === 'vtv' ? 'vtc' : v.category) as Voucher['category'],
          }))
        : parsed.vouchers
      : base.vouchers;

    const migratedLiveStreams = Array.isArray(parsed.liveStreams)
      ? needsVtcMigration
        ? parsed.liveStreams.map((l) => ({
            ...l,
            title: replaceVtvBrandText(l.title),
            hostName: replaceVtvBrandText(l.hostName),
            platform: (String(l.platform) === 'VTV Studio' ? 'VTC Studio' : l.platform) as LivePlatform,
            comments: l.comments.map((c) => ({
              ...c,
              text: replaceVtvBrandText(c.text),
            })),
          }))
        : parsed.liveStreams
      : base.liveStreams;

    const migratedShortVideos = Array.isArray(parsed.shortVideos)
      ? needsVtcMigration
        ? parsed.shortVideos.map((v) => ({
            ...v,
            creatorName: replaceVtvBrandText(v.creatorName),
            title: replaceVtvBrandText(v.title),
            caption: replaceVtvBrandText(v.caption),
          }))
        : parsed.shortVideos
      : base.shortVideos;

    const migratedSocialVideos =
      Array.isArray(parsed.socialVideos) && parsed.socialVideos.length > 0
        ? needsVtcMigration
          ? parsed.socialVideos.map((sv) => ({
              ...sv,
              platform: (String(sv.platform) === 'VTV Live Shopping'
                ? 'VTC Live Shopping'
                : sv.platform) as SocialVideoItem['platform'],
              category: (String(sv.category) === 'VTV Live Shopping'
                ? 'VTC Live Shopping'
                : sv.category) as SocialVideoItem['category'],
              title: replaceVtvBrandText(sv.title),
            }))
          : parsed.socialVideos
        : base.socialVideos;

    const migratedNotifications =
      Array.isArray(parsed.notifications) && parsed.notifications.length > 0
        ? needsVtcMigration
          ? parsed.notifications.map((n) => ({
              ...n,
              title: replaceVtvBrandText(n.title),
              body: replaceVtvBrandText(n.body),
            }))
          : parsed.notifications
        : base.notifications;

    const migratedPayTrx = Array.isArray(parsed.vtvpayTransactions)
      ? needsVtcMigration
        ? parsed.vtvpayTransactions.map((tx) => ({
            ...tx,
            title: replaceVtvBrandText(tx.title),
          }))
        : parsed.vtvpayTransactions
      : base.vtvpayTransactions;

    const tvById = new Map(base.tvChannels.map((ch) => [ch.id, ch]));
    const migratedTvChannels =
      Array.isArray(parsed.tvChannels) && parsed.tvChannels.length >= 12
        ? parsed.tvChannels.map((ch) => {
            const fresh = tvById.get(ch.id);
            return {
              ...ch,
              streamUrl: ch.streamUrl || fresh?.streamUrl || 'https://edge.medcom.id/live-edge/smil:metro.smil/playlist.m3u8',
              fallbackStreamUrl:
                ch.fallbackStreamUrl ||
                fresh?.fallbackStreamUrl ||
                'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
            };
          })
        : base.tvChannels;

    const prodVideoById = new Map(base.products.map((p) => [p.id, p.videoUrl]));
    const finalProducts = mergedProducts.map((p) => ({
      ...p,
      videoUrl:
        p.videoUrl ||
        prodVideoById.get(p.id) ||
        (p.hasVideo ? '/videos/vtc-product-demo.mp4' : undefined),
    }));

    const sellerMapForOrders = new Map(mergedSellers.map((s) => [s.id, s]));
    const finalOrders = migratedOrders.map((o) => {
      const firstSellerId = o.items?.[0]?.sellerId;
      const seller = firstSellerId ? sellerMapForOrders.get(firstSellerId) : undefined;
      return {
        ...o,
        senderName: o.senderName || seller?.storeName || o.items?.[0]?.sellerName || 'Toko VTC',
        senderAddress:
          o.senderAddress || (seller ? `${seller.city} · ${seller.phone}` : 'Gudang VTC Indonesia'),
      };
    });

    const finalLiveStreams = migratedLiveStreams.map((l, idx) => ({
      ...l,
      videoUrl:
        l.videoUrl ||
        (idx % 2 === 0 ? '/videos/vtc-live-studio.mp4' : '/videos/vtc-product-demo.mp4'),
    }));

    const finalShortVideos = migratedShortVideos.map((v) => ({
      ...v,
      videoUrl: v.videoUrl || '/videos/vtc-short-tiktok.mp4',
    }));

    const finalSocialVideos = migratedSocialVideos.map((sv) => ({
      ...sv,
      videoUrl: sv.videoUrl || '/videos/vtc-short-tiktok.mp4',
    }));

    const needsBalanceReset = (parsed.seedVersion ?? 1) < 6;
    const needsPartnerRebrand = (parsed.seedVersion ?? 1) < 7;

    if (needsPartnerRebrand) {
      mergedSellers = mergedSellers.map((s) =>
        s.id === 'seller-vtv-official'
          ? {
              ...s,
              ownerUserId: s.ownerUserId || 'seed-partner-1',
              storeName: 'Nusantara Flagship ID',
            }
          : s
      );
    }

    return {
      ...base,
      ...parsed,
      seedVersion: 7,
      themeMode: parsed.themeMode === 'dark' ? 'dark' : 'light',
      language: parsed.language === 'en' ? 'en' : 'id',
      twoFactorEnabled: Boolean(parsed.twoFactorEnabled),
      notificationPrefs:
        parsed.notificationPrefs && typeof parsed.notificationPrefs === 'object'
          ? { ...base.notificationPrefs, ...parsed.notificationPrefs }
          : base.notificationPrefs,
      sellers: mergedSellers,
      followedSellerIds: Array.isArray(parsed.followedSellerIds)
        ? parsed.followedSellerIds
        : [],
      products: finalProducts,
      orders: finalOrders,
      savedAddresses: Array.isArray(parsed.savedAddresses) ? parsed.savedAddresses : [],
      vtvpayTransactions: needsBalanceReset ? [] : migratedPayTrx,
      paylaterLimit:
        typeof parsed.paylaterLimit === 'number' ? parsed.paylaterLimit : base.paylaterLimit,
      paylaterUsed: typeof parsed.paylaterUsed === 'number' ? parsed.paylaterUsed : 0,
      vtvPinjamBalance:
        typeof parsed.vtvPinjamBalance === 'number' ? parsed.vtvPinjamBalance : 0,
      tanamProgress:
        typeof parsed.tanamProgress === 'number' ? parsed.tanamProgress : base.tanamProgress,
      goyangCountToday:
        typeof parsed.goyangCountToday === 'number' ? parsed.goyangCountToday : 0,
      rodaSpinsLeft:
        typeof parsed.rodaSpinsLeft === 'number' ? parsed.rodaSpinsLeft : base.rodaSpinsLeft,
      affiliateProfile:
        parsed.affiliateProfile && typeof parsed.affiliateProfile === 'object'
          ? { ...base.affiliateProfile, ...parsed.affiliateProfile }
          : base.affiliateProfile,
      topUpOrders: Array.isArray(parsed.topUpOrders) ? parsed.topUpOrders : [],
      tvChannels: migratedTvChannels,
      socialVideos: finalSocialVideos,
      instagramStories:
        Array.isArray(parsed.instagramStories) && parsed.instagramStories.length > 0
          ? parsed.instagramStories
          : base.instagramStories,
      instagramPosts:
        Array.isArray(parsed.instagramPosts) && parsed.instagramPosts.length > 0
          ? parsed.instagramPosts
          : base.instagramPosts,
      savedVideoIds: Array.isArray(parsed.savedVideoIds) ? parsed.savedVideoIds : [],
      offlineVideoIds: Array.isArray(parsed.offlineVideoIds) ? parsed.offlineVideoIds : [],
      continueWatching:
        parsed.continueWatching && typeof parsed.continueWatching === 'object'
          ? parsed.continueWatching
          : {},
      notifications: migratedNotifications,
      fraudReports: Array.isArray(parsed.fraudReports) ? parsed.fraudReports : [],
      vouchers: needsBalanceReset ? [] : migratedVouchers,
      liveStreams: finalLiveStreams,
      shortVideos: finalShortVideos,
      sellerChats:
        parsed.sellerChats && typeof parsed.sellerChats === 'object'
          ? parsed.sellerChats
          : {},
      wishlistIds: Array.isArray(parsed.wishlistIds) ? parsed.wishlistIds : [],
      compareProductIds: Array.isArray(parsed.compareProductIds)
        ? parsed.compareProductIds
        : [],
      priceAlerts:
        parsed.priceAlerts && typeof parsed.priceAlerts === 'object'
          ? parsed.priceAlerts
          : {},
      viewedProductIds: Array.isArray(parsed.viewedProductIds)
        ? parsed.viewedProductIds
        : [],
      vtvpayBalance: needsBalanceReset
        ? 0
        : typeof parsed.vtvpayBalance === 'number'
          ? parsed.vtvpayBalance
          : 0,
      vtvCoins: needsBalanceReset
        ? 0
        : typeof parsed.vtvCoins === 'number'
          ? parsed.vtvCoins
          : 0,
      cashbackBalance: needsBalanceReset
        ? 0
        : typeof parsed.cashbackBalance === 'number'
          ? parsed.cashbackBalance
          : 0,
      affiliateShares:
        typeof parsed.affiliateShares === 'number'
          ? parsed.affiliateShares
          : 0,
      affiliateCommissionEstimate:
        typeof parsed.affiliateCommissionEstimate === 'number'
          ? parsed.affiliateCommissionEstimate
          : 0,
      platformFeePercent:
        typeof parsed.platformFeePercent === 'number' &&
        parsed.platformFeePercent >= 0 &&
        parsed.platformFeePercent <= 30
          ? parsed.platformFeePercent
          : 5,
      liteMode: Boolean(parsed.liteMode),
    };
  } catch {
    return buildInitialState();
  }
}

interface ToastMessage {
  id: number;
  text: string;
  tone: 'success' | 'info' | 'warning';
}

interface MarketplaceContextValue {
  state: MarketplaceState;
  authToken: string | null;
  currentUser: AuthUser | null;
  authChecking: boolean;
  setAuthSession: (token: string | null, user: AuthUser | null) => void;
  updateCurrentUser: (patch: Partial<Pick<AuthUser, 'name' | 'phone' | 'email'>>) => void;
  logout: () => void;
  toast: ToastMessage | null;
  showToast: (text: string, tone?: 'success' | 'info' | 'warning') => void;
  toggleLiteMode: (enabled?: boolean) => void;
  toggleThemeMode: (mode?: ThemeMode) => void;
  setLanguage: (lang: AppLanguage) => void;
  toggleTwoFactor: (enabled?: boolean) => void;
  updateNotificationPrefs: (patch: Partial<NotificationPrefs>) => void;
  toggleFollowSeller: (sellerId: string) => void;
  likeInstagramPost: (postId: string) => void;
  commentInstagramPost: (postId: string, author: string, text: string) => void;
  addSavedAddress: (addr: Omit<SavedAddress, 'id'>) => void;
  removeSavedAddress: (id: string) => void;
  setPrimaryAddress: (id: string) => void;
  addToCart: (
    productId: string,
    quantity?: number,
    selectedColor?: string,
    selectedSize?: string
  ) => void;
  updateCartQty: (
    productId: string,
    quantity: number,
    selectedColor?: string,
    selectedSize?: string
  ) => void;
  removeFromCart: (
    productId: string,
    selectedColor?: string,
    selectedSize?: string
  ) => void;
  clearCart: () => void;
  placeOrder: (payload: {
    buyerName: string;
    buyerPhone: string;
    buyerAddress: string;
    addressCity?: string;
    addressCoords?: { lat: number; lng: number };
    courier: CourierId;
    paymentMethod: PaymentMethodId;
    paylaterTenor?: 1 | 3 | 6 | 12;
    voucherCode?: string;
    voucherCodes?: string[];
    useCoins?: boolean;
    insuranceProtected?: boolean;
    codConfirmed?: boolean;
  }) => Order[];
  trackProductView: (productId: string) => void;
  toggleWishlist: (productId: string) => void;
  toggleCompareProduct: (productId: string) => void;
  clearCompareProducts: () => void;
  togglePriceAlert: (productId: string, targetPrice?: number) => void;
  packOrder: (orderId: string) => void;
  confirmOrderReceived: (orderId: string) => void;
  submitComplaint: (
    orderId: string,
    reason: string,
    complaintType?: 'Komplain' | 'Return' | 'Refund',
    returnPhoto?: string
  ) => void;
  confirmSellerReturn: (orderId: string) => void;
  submitOneClickRefund: (orderId: string) => void;
  markOrderReviewSubmitted: (orderId: string) => void;
  claimLateVoucher: (orderId: string) => void;
  registerSeller: (payload: {
    storeName: string;
    ownerName: string;
    phone: string;
    city: string;
    category: string;
    description: string;
    ktpNumber?: string;
    ktpVerified?: boolean;
  }) => Seller;
  setActiveSellerId: (sellerId: string | null) => void;
  addProduct: (payload: {
    name: string;
    category: string;
    price: number;
    originalPrice?: number;
    stock: number;
    image: string;
    description: string;
    colors?: string[];
    sizes?: string[];
    material?: string;
    dimensions?: string;
    weight?: string;
    warranty?: string;
    videoUrl?: string;
  }) => void;
  addBulkProducts: (
    items: Array<{
      name: string;
      category: string;
      price: number;
      stock: number;
      description: string;
      image?: string;
    }>
  ) => number;
  updateProductStock: (productId: string, newStock: number) => void;
  updateSellerDecoration: (
    sellerId: string,
    payload: {
      bannerTitle: string;
      bannerSubtitle: string;
      bannerColor: string;
      avatarColor: string;
      description: string;
    }
  ) => void;
  upsertSellerVoucher: (
    sellerId: string,
    voucher: { code: string; title: string; amount: number; minSpend: number }
  ) => void;
  toggleSellerFlashSale: (sellerId: string, discountPct?: number) => void;
  deleteProduct: (productId: string) => void;
  shipOrderWithResi: (orderId: string, trackingNumber: string) => void;
  markOrderArrived: (orderId: string) => void;
  withdrawBalance: (sellerId: string, amount: number, bankInfo: string) => boolean;
  approveSeller: (sellerId: string) => void;
  rejectSeller: (sellerId: string) => void;
  releaseFundsToSeller: (orderId: string) => void;
  refundToBuyer: (orderId: string) => void;
  getSellerBalances: (sellerId: string) => {
    heldBalance: number;
    releasedTotal: number;
    availableBalance: number;
  };
  createLiveStream: (payload: {
    title: string;
    hostName: string;
    platform: LivePlatform;
    embedUrl?: string;
    productId: string;
  }) => void;
  likeLiveStream: (liveId: string) => void;
  commentLiveStream: (liveId: string, author: string, text: string) => void;
  createShortVideo: (payload: {
    title: string;
    creatorName: string;
    productId: string;
    caption: string;
  }) => void;
  likeShortVideo: (videoId: string) => void;
  commentShortVideo: (videoId: string, author: string, text: string) => void;
  topUpVtvpay: (amount: number, source: string) => void;
  transferVtvPay: (recipient: string, amount: number, bankOrUser: string) => boolean;
  takeVtvPinjam: (amount: number, tenorMonths: number) => void;
  payPayLaterBill: (amount: number) => boolean;
  submitInsuranceClaim: (orderId: string, reason: string) => void;
  claimDailyCoins: () => void;
  playGameTanam: () => void;
  playGameGoyang: () => number;
  playGameTebakHarga: (correct: boolean) => void;
  playGameRodaPutar: () => number;
  recordAffiliateShare: (productId: string, commissionEstimate: number) => void;
  updateAffiliateProfile: (patch: Partial<AffiliateProfile>) => void;
  withdrawAffiliateCommission: (amount: number, target: string) => boolean;
  placeTopUpOrder: (payload: {
    category: TopUpOrder['category'];
    serviceName: string;
    targetId: string;
    serverZone?: string;
    nickname?: string;
    itemLabel: string;
    price: number;
    paymentMethod: PaymentMethodId;
    usePromo10?: boolean;
  }) => TopUpOrder | null;
  toggleSaveVideo: (videoId: string) => void;
  toggleOfflineVideo: (videoId: string) => void;
  recordContinueWatching: (videoId: string, percent: number) => void;
  triggerKeranjangKuningCommission: (productId: string, sourceTitle: string) => void;
  submitFraudReport: (targetType: FraudReport['targetType'], targetName: string, reason: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  pushNotification: (notif: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => void;
  buyPulsa: (
    provider: string,
    phone: string,
    nominal: number,
    price: number
  ) => boolean;
  payBill: (service: string, customerNumber: string, amount: number) => boolean;
  claimPromoVoucher: (voucher: Omit<Voucher, 'used'>) => void;
  sendSellerChat: (sellerId: string, text: string, productName?: string) => void;
  replySellerChat: (sellerId: string, text: string) => void;
  setPlatformFeePercent: (percent: number) => void;
  addProductReview: (
    productId: string,
    review: Omit<ProductReview, 'id' | 'createdAt'>
  ) => void;
  resetDemoData: () => void;
}

const MarketplaceContext = createContext<MarketplaceContextValue | null>(null);

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<MarketplaceState>(() => loadState());
  const [authToken, setAuthToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem(AUTH_USER_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AuthUser;
        if (parsed && parsed.id && parsed.name) return parsed;
      }
    } catch {
      // ignore invalid stored user
    }
    return null;
  });
  const [authChecking, setAuthChecking] = useState<boolean>(() => {
    try {
      const hasToken = Boolean(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY));
      const hasUser = Boolean(localStorage.getItem(AUTH_USER_STORAGE_KEY));
      return hasToken && !hasUser;
    } catch {
      return false;
    }
  });
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Auto-login for returning users with valid session token & local HP backup
  useEffect(() => {
    let active = true;
    const savedToken = (() => {
      try {
        return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
      } catch {
        return null;
      }
    })();

    if (!savedToken) {
      setAuthChecking(false);
      return;
    }

    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${savedToken}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Sesi server diperbarui');
        return res.json();
      })
      .then((data) => {
        if (!active) return;
        if (data?.user) {
          setAuthToken(savedToken);
          setCurrentUser((prev) => {
            const merged = prev && prev.id === data.user.id ? { ...data.user, ...prev } : data.user;
            try {
              localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(merged));
            } catch {
              // ignore storage error
            }
            return merged;
          });
        }
      })
      .catch(() => {
        if (!active) return;
        // Keep locally saved user session on device if available so phone storage persists smoothly
        try {
          const rawUser = localStorage.getItem(AUTH_USER_STORAGE_KEY);
          if (rawUser) {
            const parsedUser = JSON.parse(rawUser) as AuthUser;
            if (parsedUser && parsedUser.id) {
              setAuthToken(savedToken);
              setCurrentUser(parsedUser);
              return;
            }
          }
          localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
        } catch {
          // ignore
        }
        setAuthToken(null);
        setCurrentUser(null);
      })
      .finally(() => {
        if (active) setAuthChecking(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors safely
    }
  }, [state]);

  useEffect(() => {
    if (state.liteMode) {
      document.documentElement.classList.add('lite-mode');
    } else {
      document.documentElement.classList.remove('lite-mode');
    }
  }, [state.liteMode]);

  useEffect(() => {
    if (state.themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.themeMode]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3400);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (
    text: string,
    tone: 'success' | 'info' | 'warning' = 'success'
  ) => {
    setToast({ id: Date.now(), text, tone });
  };

  const setAuthSession = (token: string | null, user: AuthUser | null) => {
    setAuthToken(token);
    setCurrentUser(user);
    try {
      if (token) {
        localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
      } else {
        localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      }
      if (user) {
        localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_USER_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  };

  const updateCurrentUser = (
    patch: Partial<Pick<AuthUser, 'name' | 'phone' | 'email'>>
  ) => {
    setCurrentUser((prev) => {
      if (!prev) return prev;
      const updated: AuthUser = {
        ...prev,
        ...(patch.name !== undefined ? { name: patch.name.trim() || prev.name } : {}),
        ...(patch.phone !== undefined ? { phone: patch.phone.trim() } : {}),
        ...(patch.email !== undefined ? { email: patch.email.trim() || prev.email } : {}),
      };
      try {
        localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore storage error
      }
      return updated;
    });
    showToast('Data Akun Saya berhasil disimpan di HP!');
  };

  const logout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    try {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    } catch {
      // ignore
    }
    showToast('Anda telah keluar dari akun', 'info');
  };

  const toggleLiteMode = (enabled?: boolean) => {
    setState((prev) => {
      const next = typeof enabled === 'boolean' ? enabled : !prev.liteMode;
      return { ...prev, liteMode: next };
    });
    showToast(
      enabled === false || (enabled === undefined && state.liteMode)
        ? 'Mode Normal diaktifkan'
        : 'Mode Lite Super Cepat aktif — animasi ringan & hemat kuota!',
      'info'
    );
  };

  const toggleThemeMode = (mode?: ThemeMode) => {
    setState((prev) => {
      const next = mode ?? (prev.themeMode === 'dark' ? 'light' : 'dark');
      return { ...prev, themeMode: next };
    });
  };

  const setLanguage = (lang: AppLanguage) => {
    setState((prev) => ({ ...prev, language: lang }));
    showToast(
      lang === 'en' ? 'Language switched to English' : 'Bahasa diubah ke Indonesia',
      'info'
    );
  };

  const toggleTwoFactor = (enabled?: boolean) => {
    setState((prev) => {
      const next = typeof enabled === 'boolean' ? enabled : !prev.twoFactorEnabled;
      return { ...prev, twoFactorEnabled: next };
    });
    showToast(
      enabled === false || (enabled === undefined && state.twoFactorEnabled)
        ? 'Verifikasi 2 Langkah (2FA) dinonaktifkan'
        : 'Verifikasi 2 Langkah (2FA) aktif untuk keamanan akun!',
      'info'
    );
  };

  const updateNotificationPrefs = (patch: Partial<NotificationPrefs>) => {
    setState((prev) => ({
      ...prev,
      notificationPrefs: { ...prev.notificationPrefs, ...patch },
    }));
    showToast('Pengaturan notifikasi disimpan!');
  };

  const toggleFollowSeller = (sellerId: string) => {
    const seller = state.sellers.find((s) => s.id === sellerId);
    const already = state.followedSellerIds.includes(sellerId);
    setState((prev) => ({
      ...prev,
      followedSellerIds: already
        ? prev.followedSellerIds.filter((id) => id !== sellerId)
        : [sellerId, ...prev.followedSellerIds],
    }));
    showToast(
      already
        ? `Berhenti mengikuti ${seller?.storeName || 'Toko'}`
        : `Sekarang mengikuti ${seller?.storeName || 'Toko'}!`,
      already ? 'info' : 'success'
    );
  };

  const likeInstagramPost = (postId: string) => {
    setState((prev) => ({
      ...prev,
      instagramPosts: prev.instagramPosts.map((p) =>
        p.id === postId ? { ...p, likes: p.likes + 1 } : p
      ),
    }));
  };

  const commentInstagramPost = (postId: string, author: string, text: string) => {
    if (!text.trim()) return;
    setState((prev) => ({
      ...prev,
      instagramPosts: prev.instagramPosts.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: [
                ...p.comments,
                {
                  id: `igc-${Date.now()}`,
                  author: author || 'Pembeli VTC',
                  text: text.trim(),
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : p
      ),
    }));
  };

  const addSavedAddress = (addr: Omit<SavedAddress, 'id'>) => {
    const newAddr: SavedAddress = { ...addr, id: `addr-${Date.now()}` };
    setState((prev) => {
      const list = addr.isPrimary
        ? prev.savedAddresses.map((a) => ({ ...a, isPrimary: false }))
        : prev.savedAddresses;
      return { ...prev, savedAddresses: [newAddr, ...list] };
    });
    showToast(`Alamat "${addr.label}" disimpan!`);
  };

  const removeSavedAddress = (id: string) => {
    setState((prev) => ({
      ...prev,
      savedAddresses: prev.savedAddresses.filter((a) => a.id !== id),
    }));
  };

  const setPrimaryAddress = (id: string) => {
    setState((prev) => ({
      ...prev,
      savedAddresses: prev.savedAddresses.map((a) => ({
        ...a,
        isPrimary: a.id === id,
      })),
    }));
  };

  const matchCartItem = (
    item: { productId: string; selectedColor?: string; selectedSize?: string },
    productId: string,
    selectedColor?: string,
    selectedSize?: string
  ) =>
    item.productId === productId &&
    (item.selectedColor || '') === (selectedColor || '') &&
    (item.selectedSize || '') === (selectedSize || '');

  const addToCart = (
    productId: string,
    quantity = 1,
    selectedColor?: string,
    selectedSize?: string
  ) => {
    const product = state.products.find((p) => p.id === productId);
    if (!product || product.stock <= 0) {
      showToast('Stok produk sedang habis', 'warning');
      return;
    }
    const resolvedColor = selectedColor ?? product.colors?.[0];
    const resolvedSize = selectedSize ?? product.sizes?.[0];
    const variantKey =
      resolvedColor && resolvedSize ? `${resolvedColor}-${resolvedSize}` : '';
    const maxVariantStock =
      variantKey && product.variantStocks?.[variantKey] !== undefined
        ? product.variantStocks[variantKey]
        : product.stock;

    if (maxVariantStock <= 0) {
      showToast('Stok variasi ini sedang habis', 'warning');
      return;
    }

    setState((prev) => {
      const existing = prev.cart.find((item) =>
        matchCartItem(item, productId, resolvedColor, resolvedSize)
      );
      const nextCart = existing
        ? prev.cart.map((item) =>
            matchCartItem(item, productId, resolvedColor, resolvedSize)
              ? {
                  ...item,
                  quantity: Math.min(maxVariantStock, item.quantity + quantity),
                }
              : item
          )
        : [
            ...prev.cart,
            {
              productId,
              quantity: Math.min(maxVariantStock, quantity),
              selectedColor: resolvedColor,
              selectedSize: resolvedSize,
            },
          ];
      return { ...prev, cart: nextCart };
    });
    const varLabel = [resolvedColor, resolvedSize].filter(Boolean).join(' · ');
    showToast(
      `${product.name}${varLabel ? ` (${varLabel})` : ''} masuk keranjang`
    );
  };

  const updateCartQty = (
    productId: string,
    quantity: number,
    selectedColor?: string,
    selectedSize?: string
  ) => {
    const product = state.products.find((p) => p.id === productId);
    const variantKey =
      selectedColor && selectedSize ? `${selectedColor}-${selectedSize}` : '';
    const maxStock = product
      ? variantKey && product.variantStocks?.[variantKey] !== undefined
        ? product.variantStocks[variantKey]
        : product.stock
      : 99;
    if (quantity <= 0) {
      removeFromCart(productId, selectedColor, selectedSize);
      return;
    }
    setState((prev) => ({
      ...prev,
      cart: prev.cart.map((item) =>
        matchCartItem(item, productId, selectedColor, selectedSize)
          ? { ...item, quantity: Math.min(Math.max(1, maxStock), quantity) }
          : item
      ),
    }));
  };

  const removeFromCart = (
    productId: string,
    selectedColor?: string,
    selectedSize?: string
  ) => {
    setState((prev) => ({
      ...prev,
      cart: prev.cart.filter(
        (item) => !matchCartItem(item, productId, selectedColor, selectedSize)
      ),
    }));
  };

  const clearCart = () => {
    setState((prev) => ({ ...prev, cart: [] }));
  };

  const placeOrder = (payload: {
    buyerName: string;
    buyerPhone: string;
    buyerAddress: string;
    addressCity?: string;
    addressCoords?: { lat: number; lng: number };
    courier: CourierId;
    paymentMethod: PaymentMethodId;
    paylaterTenor?: 1 | 3 | 6 | 12;
    voucherCode?: string;
    voucherCodes?: string[];
    useCoins?: boolean;
    insuranceProtected?: boolean;
    codConfirmed?: boolean;
  }): Order[] => {
    const courierObj =
      COURIER_OPTIONS.find((c) => c.id === payload.courier) ?? COURIER_OPTIONS[0];
    const now = new Date();
    const nowIso = now.toISOString();
    const etaIso = new Date(
      now.getTime() + courierObj.etaHours * 3600 * 1000
    ).toISOString();

    const groupedBySeller = new Map<string, OrderItem[]>();
    for (const cartItem of state.cart) {
      const product = state.products.find((p) => p.id === cartItem.productId);
      if (!product || product.stock < cartItem.quantity) continue;
      const list = groupedBySeller.get(product.sellerId) ?? [];
      list.push({
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        price: product.price,
        quantity: cartItem.quantity,
        selectedColor: cartItem.selectedColor,
        selectedSize: cartItem.selectedSize,
        sellerId: product.sellerId,
        sellerName: product.sellerName,
      });
      groupedBySeller.set(product.sellerId, list);
    }

    const requestedCodes = Array.from(
      new Set(
        [
          ...(payload.voucherCodes ?? []),
          ...(payload.voucherCode ? [payload.voucherCode] : []),
        ].filter(Boolean)
      )
    );
    const activeVouchers = state.vouchers.filter(
      (v) => !v.used && requestedCodes.includes(v.code)
    );

    const totalCartSubtotal = Array.from(groupedBySeller.values())
      .flat()
      .reduce((s, i) => s + i.price * i.quantity, 0);

    const shippingVouchers = activeVouchers.filter((v) => v.type === 'shipping');
    const discountVouchers = activeVouchers.filter((v) => v.type === 'discount');

    const totalDiscountFromVouchers = discountVouchers.reduce(
      (sum, v) => (totalCartSubtotal >= v.minSpend ? sum + v.amount : sum),
      0
    );

    const maxCoinsRedeemable = Math.min(
      state.vtvCoins,
      Math.floor(totalCartSubtotal * 0.5)
    );
    const coinsToSpend = payload.useCoins ? Math.max(0, maxCoinsRedeemable) : 0;

    if (
      payload.paymentMethod === 'VTCPay' &&
      state.vtvpayBalance < Math.max(0, totalCartSubtotal - totalDiscountFromVouchers - coinsToSpend)
    ) {
      showToast('Saldo VTC Pay tidak mencukupi. Pilih metode lain.', 'warning');
      return [];
    }

    if (
      payload.paymentMethod === 'PayLater' &&
      state.paylaterUsed + Math.max(0, totalCartSubtotal - totalDiscountFromVouchers - coinsToSpend) >
        state.paylaterLimit
    ) {
      showToast('Limit PayLater tidak mencukupi. Lunasi tagihan atau pilih metode lain.', 'warning');
      return [];
    }

    const createdOrders: Order[] = [];
    let idx = 0;
    let totalSpentVtvpay = 0;
    let totalSpentPaylater = 0;
    let remainingVoucherDiscount = totalDiscountFromVouchers;
    let remainingCoins = coinsToSpend;
    let totalCoinsEarned = 0;
    let totalCashbackEarned = 0;

    groupedBySeller.forEach((items, sellerId) => {
      idx += 1;
      const sellerObj = state.sellers.find((s) => s.id === sellerId);
      const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const hasShippingVoucher = shippingVouchers.some(
        (v) => totalCartSubtotal >= v.minSpend
      );
      const shippingDiscount =
        idx === 1 && hasShippingVoucher
          ? Math.min(courierObj.fee, shippingVouchers[0]?.amount ?? courierObj.fee)
          : 0;
      const shippingFee = Math.max(0, courierObj.fee - shippingDiscount);
      const codFee = payload.paymentMethod === 'COD' && idx === 1 ? 2000 : 0;
      const insuranceFee = payload.insuranceProtected
        ? Math.max(1500, Math.round(subtotal * 0.01))
        : 0;

      const appliedVoucherDiscount = Math.min(subtotal, remainingVoucherDiscount);
      remainingVoucherDiscount -= appliedVoucherDiscount;

      const afterVoucher = Math.max(0, subtotal - appliedVoucherDiscount);
      const appliedCoins = Math.min(afterVoucher, remainingCoins);
      remainingCoins -= appliedCoins;

      const discountAmount = appliedVoucherDiscount + appliedCoins;
      const totalAmount = Math.max(
        0,
        subtotal + shippingFee + codFee + insuranceFee - discountAmount
      );
      if (payload.paymentMethod === 'VTCPay') {
        totalSpentVtvpay += totalAmount;
      }
      if (payload.paymentMethod === 'PayLater') {
        totalSpentPaylater += totalAmount;
      }
      const earnedCoins = Math.max(50, Math.round(subtotal * 0.01));
      const cashbackAmount = Math.min(50000, Math.round(subtotal * 0.05));
      totalCoinsEarned += earnedCoins;
      totalCashbackEarned += cashbackAmount;

      const rand = Math.floor(1000 + Math.random() * 9000);
      const orderId = `VTC-${now.toISOString().slice(2, 10).replace(/-/g, '')}-${rand + idx}`;

      let paymentCode: string | undefined;
      if (
        payload.paymentMethod === 'BCA' ||
        payload.paymentMethod === 'BRI' ||
        payload.paymentMethod === 'Mandiri' ||
        payload.paymentMethod === 'Alfamart' ||
        payload.paymentMethod === 'Indomaret'
      ) {
        paymentCode = `${payload.paymentMethod.toUpperCase()}-${Math.floor(10000000 + Math.random() * 89999999)}`;
      }

      const initialStatus = 'Diproses';

      createdOrders.push({
        id: orderId,
        buyerName: payload.buyerName.trim(),
        buyerPhone: payload.buyerPhone.trim(),
        buyerAddress: payload.buyerAddress.trim(),
        senderName: sellerObj?.storeName || items[0]?.sellerName || 'Toko VTC',
        senderAddress: sellerObj
          ? `${sellerObj.city} · ${sellerObj.phone}`
          : 'Jakarta Selatan',
        addressCity: payload.addressCity || 'Jakarta Selatan',
        addressCoords: payload.addressCoords || { lat: -6.2615, lng: 106.8106 },
        courier: courierObj.id,
        paymentMethod: payload.paymentMethod,
        paylaterTenor:
          payload.paymentMethod === 'PayLater'
            ? payload.paylaterTenor || 3
            : undefined,
        paymentCode,
        paidAt: payload.paymentMethod === 'COD' ? undefined : nowIso,
        shippingFee,
        codFee,
        codConfirmed: payload.paymentMethod === 'COD' ? Boolean(payload.codConfirmed ?? true) : undefined,
        discountAmount,
        insuranceProtected: Boolean(payload.insuranceProtected),
        insuranceFee,
        voucherCode: idx === 1 ? activeVouchers[0]?.code : undefined,
        voucherCodes: idx === 1 ? activeVouchers.map((v) => v.code) : undefined,
        coinsUsed: appliedCoins,
        coinsEarned: earnedCoins,
        cashbackEarned: cashbackAmount,
        trackingNumber: '',
        courierProgressPct: 15,
        items,
        subtotal,
        totalAmount,
        status: initialStatus,
        escrowStatus: 'held',
        estimatedDeliveryAt: etaIso,
        lateVoucherClaimed: false,
        trackingHistory: [
          ...(payload.paymentMethod !== 'COD'
            ? [
                {
                  title: 'Pembayaran Terverifikasi (Dibayar)',
                  detail: `Pembayaran ${payload.paymentMethod} diterima & dilindungi Garansi Escrow VTC SHOP INDONESIA.`,
                  time: nowIso,
                },
              ]
            : []),
          {
            title: 'Pesanan Dibuat (Diproses)',
            detail: `Pesanan ${payload.paymentMethod}${
              payload.paymentMethod === 'PayLater'
                ? ` (Cicilan 0% ${payload.paylaterTenor || 3}x)`
                : ''
            } dikirim dari ${sellerObj?.storeName || items[0]?.sellerName} (${sellerObj?.city || 'Indonesia'}) via ${courierObj.name}.`,
            time: nowIso,
          },
        ],
        createdAt: nowIso,
        updatedAt: nowIso,
      });
    });

    if (createdOrders.length === 0) return [];

    const usedCodes = activeVouchers.map((v) => v.code);

    setState((prev) => {
      const updatedProducts = prev.products.map((product) => {
        const boughtList = prev.cart.filter((c) => c.productId === product.id);
        if (boughtList.length === 0) return product;
        const totalQty = boughtList.reduce((s, c) => s + c.quantity, 0);
        return {
          ...product,
          stock: Math.max(0, product.stock - totalQty),
          soldCount: product.soldCount + totalQty,
        };
      });
      const updatedVouchers =
        usedCodes.length > 0
          ? prev.vouchers.map((v) =>
              usedCodes.includes(v.code) ? { ...v, used: true } : v
            )
          : prev.vouchers;

      const newPayTrx: VtvPayTransaction[] = [];
      if (totalSpentVtvpay > 0) {
        newPayTrx.push({
          id: `TRX-${Date.now()}`,
          type: 'payment',
          title: `Pembayaran Belanja (${createdOrders[0].id})`,
          amount: -totalSpentVtvpay,
          createdAt: nowIso,
        });
      }
      if (totalCashbackEarned > 0) {
        newPayTrx.push({
          id: `CB-${Date.now() + 1}`,
          type: 'cashback',
          title: `Cashback 5% Pesanan ${createdOrders[0].id}`,
          amount: totalCashbackEarned,
          createdAt: nowIso,
        });
      }

      const orderNotif: AppNotification = {
        id: `notif-${Date.now()}`,
        type: 'order',
        title: `Pesanan ${createdOrders[0].id} Berhasil Dibuat`,
        body: `Pantau posisi kurir ${courierObj.name} real-time di halaman Pesanan Saya.`,
        targetTab: 'orders',
        read: false,
        createdAt: nowIso,
      };

      return {
        ...prev,
        products: updatedProducts,
        vouchers: updatedVouchers,
        vtvpayBalance: Math.max(
          0,
          prev.vtvpayBalance - totalSpentVtvpay + totalCashbackEarned
        ),
        vtvpayTransactions: [...newPayTrx, ...prev.vtvpayTransactions].slice(0, 40),
        paylaterUsed: prev.paylaterUsed + totalSpentPaylater,
        vtvCoins: Math.max(0, prev.vtvCoins - coinsToSpend + totalCoinsEarned),
        cashbackBalance: (prev.cashbackBalance ?? 0) + totalCashbackEarned,
        cart: [],
        orders: [...createdOrders, ...prev.orders],
        notifications: [orderNotif, ...prev.notifications].slice(0, 30),
      };
    });

    showToast(
      `Pesanan ${payload.paymentMethod} berhasil! Cashback Langsung ${formatRupiah(totalCashbackEarned)} + ${totalCoinsEarned.toLocaleString('id-ID')} Koin.`
    );
    return createdOrders;
  };

  const packOrder = (orderId: string) => {
    const nowIso = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: 'Dikemas',
              trackingHistory: [
                {
                  title: 'Pesanan Dikemas Seller',
                  detail: 'Seller sedang mengemas paket & menyiapkan label pengiriman.',
                  time: nowIso,
                },
                ...(order.trackingHistory ?? []),
              ],
              updatedAt: nowIso,
            }
          : order
      ),
    }));
    showToast('Status pesanan diubah menjadi Dikemas');
  };

  const confirmOrderReceived = (orderId: string) => {
    const nowIso = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: 'Selesai',
              escrowStatus: 'released',
              courierProgressPct: 100,
              trackingHistory: [
                {
                  title: 'Pesanan Diterima & Selesai (Garansi VTC)',
                  detail:
                    'Pembeli menekan Pesanan Diterima. Dana Escrow dilepas ke saldo Bisa Dicairkan Seller.',
                  time: nowIso,
                },
                ...(order.trackingHistory ?? []),
              ],
              updatedAt: nowIso,
            }
          : order
      ),
    }));
    showToast('Pesanan Diterima! Dana dilepas ke Seller sesuai Garansi VTC.');
  };

  const submitComplaint = (
    orderId: string,
    reason: string,
    complaintType: 'Komplain' | 'Return' | 'Refund' = 'Komplain',
    returnPhoto?: string
  ) => {
    const nowIso = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: 'Komplain',
              complaintType,
              complaintReason: reason.trim(),
              returnPhoto: returnPhoto || order.returnPhoto,
              returnStatus:
                complaintType === 'Return' || complaintType === 'Refund'
                  ? 'requested'
                  : order.returnStatus,
              trackingHistory: [
                {
                  title: `Pengajuan ${complaintType} Dikirim`,
                  detail: reason.trim(),
                  time: nowIso,
                },
                ...(order.trackingHistory ?? []),
              ],
              updatedAt: nowIso,
            }
          : order
      ),
    }));
    showToast(
      `Pengajuan ${complaintType} dikirim ke Seller & Admin! Dana tetap ditahan sampai dikonfirmasi.`,
      'info'
    );
  };

  const confirmSellerReturn = (orderId: string) => {
    const targetOrder = state.orders.find((o) => o.id === orderId);
    if (!targetOrder || targetOrder.escrowStatus === 'refunded') return;
    const nowIso = new Date().toISOString();
    setState((prev) => {
      const updatedProducts = prev.products.map((product) => {
        const refundedItems = targetOrder.items.filter(
          (i) => i.productId === product.id
        );
        if (refundedItems.length === 0) return product;
        const qty = refundedItems.reduce((s, r) => s + r.quantity, 0);
        return {
          ...product,
          stock: product.stock + qty,
        };
      });

      const refundAmt = targetOrder.totalAmount;
      return {
        ...prev,
        products: updatedProducts,
        vtvpayBalance: prev.vtvpayBalance + refundAmt,
        vtvpayTransactions: [
          {
            id: `RFD-${Date.now()}`,
            type: 'refund',
            title: `Pengembalian Dana Retur (${targetOrder.id})`,
            amount: refundAmt,
            createdAt: nowIso,
          },
          ...prev.vtvpayTransactions,
        ],
        orders: prev.orders.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: 'Dana Dikembalikan',
                escrowStatus: 'refunded',
                returnStatus: 'approved',
                trackingHistory: [
                  {
                    title: 'Retur Dikonfirmasi Seller · Uang Kembali',
                    detail: `Seller menyetujui retur. Dana ${formatRupiah(refundAmt)} dikembalikan ke VTC Pay pembeli.`,
                    time: nowIso,
                  },
                  ...(o.trackingHistory ?? []),
                ],
                updatedAt: nowIso,
              }
            : o
        ),
        notifications: [
          {
            id: `notif-${Date.now()}`,
            type: 'order',
            title: `Retur ${targetOrder.id} Disetujui Seller!`,
            body: `Dana ${formatRupiah(refundAmt)} telah dikembalikan ke saldo VTC Pay Anda.`,
            targetTab: 'orders',
            read: false,
            createdAt: nowIso,
          },
          ...prev.notifications,
        ],
      };
    });
    showToast(
      `Retur ${orderId} dikonfirmasi! Dana ${formatRupiah(targetOrder.totalAmount)} dikembalikan ke Pembeli.`
    );
  };

  const submitOneClickRefund = (orderId: string) => {
    const order = state.orders.find((o) => o.id === orderId);
    if (!order || order.escrowStatus === 'refunded') return;
    const nowIso = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      vtvpayBalance: prev.vtvpayBalance + order.totalAmount,
      vtvpayTransactions: [
        {
          id: `RFD-${Date.now()}`,
          type: 'refund',
          title: `Refund Instan 1-Klik (${order.id}) · Cair < 1x24 Jam`,
          amount: order.totalAmount,
          createdAt: nowIso,
        },
        ...prev.vtvpayTransactions,
      ],
      orders: prev.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'Dana Dikembalikan',
              escrowStatus: 'refunded',
              complaintType: 'Refund',
              complaintReason: 'Return/Refund Instan 1-Klik (Dana kembali ke VTC Pay)',
              trackingHistory: [
                {
                  title: 'Dana Refund Cair ke VTC Pay',
                  detail: `Dana ${formatRupiah(order.totalAmount)} dikembalikan instan ke VTC Pay (jaminan 1x24 jam).`,
                  time: nowIso,
                },
                ...(o.trackingHistory ?? []),
              ],
              updatedAt: nowIso,
            }
          : o
      ),
      notifications: [
        {
          id: `notif-${Date.now()}`,
          type: 'order',
          title: `Refund ${order.id} Cair ke VTC Pay!`,
          body: `${formatRupiah(order.totalAmount)} sudah masuk saldo VTC Pay dalam < 1x24 jam.`,
          targetTab: 'pay',
          read: false,
          createdAt: nowIso,
        },
        ...prev.notifications,
      ],
    }));
    showToast(`Refund 1-Klik berhasil! ${formatRupiah(order.totalAmount)} kembali ke VTC Pay.`);
  };

  const markOrderReviewSubmitted = (orderId: string) => {
    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) =>
        o.id === orderId ? { ...o, reviewSubmitted: true } : o
      ),
    }));
  };

  const claimLateVoucher = (orderId: string) => {
    const order = state.orders.find((o) => o.id === orderId);
    if (!order || order.lateVoucherClaimed) return;
    const newCode = `VTC-TELAT-${orderId.slice(-4)}`;
    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) =>
        o.id === orderId ? { ...o, lateVoucherClaimed: true } : o
      ),
      vouchers: [
        {
          code: newCode,
          title: 'Garansi Tepat Waktu · Voucher Telat Rp 20.000',
          type: 'discount',
          amount: 20000,
          minSpend: 50000,
          used: false,
        },
        ...prev.vouchers,
      ],
    }));
    showToast(
      `Voucher Garansi Tepat Waktu ${newCode} (Rp 20.000) masuk ke akun Anda!`
    );
  };

  const registerSeller = (payload: {
    storeName: string;
    ownerName: string;
    phone: string;
    city: string;
    category: string;
    description: string;
    ktpNumber?: string;
    ktpVerified?: boolean;
  }): Seller => {
    const slug = payload.storeName
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 6);
    const instantVerified = Boolean(payload.ktpVerified && payload.ktpNumber?.length === 16);
    const newSeller: Seller = {
      id: `seller-${Date.now()}`,
      ownerUserId: currentUser?.id || 'local-seller',
      storeName: payload.storeName.trim(),
      ownerName: payload.ownerName.trim(),
      phone: payload.phone.trim(),
      city: payload.city.trim(),
      category: payload.category,
      description: payload.description.trim(),
      rating: 5.0,
      avatarColor: '#EE4D2D',
      ktpNumber: payload.ktpNumber,
      ktpVerified: instantVerified,
      storeVoucher: {
        code: `${slug || 'TOKO'}-10K`,
        title: `Voucher Toko ${payload.storeName.trim()} Rp 10.000`,
        amount: 10000,
        minSpend: 75000,
      },
      status: instantVerified ? 'approved' : 'pending',
      createdAt: new Date().toISOString(),
      withdrawnBalance: 0,
    };

    setState((prev) => ({
      ...prev,
      sellers: [newSeller, ...prev.sellers],
      activeSellerId: newSeller.id,
    }));
    showToast(
      instantVerified
        ? 'Verifikasi KTP + OTP berhasil! Toko langsung aktif dalam 5 menit.'
        : 'Pendaftaran toko dikirim! Menunggu ACC Admin VTC SHOP INDONESIA.',
      instantVerified ? 'success' : 'info'
    );
    return newSeller;
  };

  const setActiveSellerId = (sellerId: string | null) => {
    setState((prev) => ({ ...prev, activeSellerId: sellerId }));
  };

  const addProduct = (payload: {
    name: string;
    category: string;
    price: number;
    originalPrice?: number;
    stock: number;
    image: string;
    description: string;
    colors?: string[];
    sizes?: string[];
    material?: string;
    dimensions?: string;
    weight?: string;
    warranty?: string;
    videoUrl?: string;
  }) => {
    const activeSeller = state.sellers.find(
      (s) => s.id === state.activeSellerId
    );
    if (!activeSeller || activeSeller.status !== 'approved') {
      showToast('Toko harus di-ACC Admin VTC SHOP INDONESIA terlebih dahulu', 'warning');
      return;
    }

    const orig =
      payload.originalPrice && payload.originalPrice > payload.price
        ? payload.originalPrice
        : Math.round(payload.price * 2);
    const discPct = Math.round(((orig - payload.price) / orig) * 100);
    const colors = payload.colors?.length
      ? payload.colors
      : ['Hitam', 'Putih', 'Pink'];
    const sizes = payload.sizes?.length ? payload.sizes : ['S', 'M', 'L', 'XL'];

    const variantStocks: Record<string, number> = {};
    for (const c of colors) {
      for (const s of sizes) {
        variantStocks[`${c}-${s}`] = Math.max(1, Math.round(payload.stock / 2));
      }
    }

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      sellerId: activeSeller.id,
      sellerName: activeSeller.storeName,
      name: payload.name.trim(),
      category: payload.category,
      price: payload.price,
      originalPrice: orig,
      discountPercent: discPct,
      isMall: activeSeller.isMall,
      isFreeShippingXtra: true,
      stock: payload.stock,
      rating: 5.0,
      soldCount: 0,
      image: payload.image,
      hasVideo: true,
      videoUrl: payload.videoUrl || '/videos/vtc-product-demo.mp4',
      videoCaption: `Video review resmi ${payload.name.trim()} dari ${activeSeller.storeName}`,
      colors,
      sizes,
      variantStocks,
      sizeChart: [
        { size: sizes[0], panjangCm: '66 cm', lebarCm: '48 cm' },
        ...(sizes[1]
          ? [{ size: sizes[1], panjangCm: '68 cm', lebarCm: '50 cm' }]
          : []),
        ...(sizes[2]
          ? [{ size: sizes[2], panjangCm: '70 cm', lebarCm: '52 cm' }]
          : []),
      ],
      specs: {
        material: payload.material || 'Material Premium Pilihan',
        dimensions: payload.dimensions || 'Standar Kemasan Toko',
        weight: payload.weight || '350 gram',
        warranty: payload.warranty || `Garansi Toko ${activeSeller.storeName} 30 Hari`,
        originCity: activeSeller.city,
      },
      reviews: [],
      description: payload.description.trim(),
      createdAt: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      products: [newProduct, ...prev.products],
    }));
    showToast(`Produk "${newProduct.name}" berhasil dipublikasikan!`);
  };

  const addBulkProducts = (
    items: Array<{
      name: string;
      category: string;
      price: number;
      stock: number;
      description: string;
      image?: string;
    }>
  ): number => {
    const activeSeller = state.sellers.find(
      (s) => s.id === state.activeSellerId
    );
    if (!activeSeller || activeSeller.status !== 'approved') {
      showToast('Toko harus di-ACC Admin VTC SHOP INDONESIA terlebih dahulu', 'warning');
      return 0;
    }

    const nowMs = Date.now();
    const created: Product[] = items
      .filter((it) => it.name.trim() && it.price > 0 && it.stock >= 0)
      .map((it, idx) => {
        const orig = Math.round(it.price * 1.8);
        return {
          id: `prod-bulk-${nowMs}-${idx}`,
          sellerId: activeSeller.id,
          sellerName: activeSeller.storeName,
          name: it.name.trim(),
          category: it.category || activeSeller.category || 'Elektronik',
          price: it.price,
          originalPrice: orig,
          discountPercent: Math.round(((orig - it.price) / orig) * 100),
          isMall: activeSeller.isMall,
          isFreeShippingXtra: true,
          stock: it.stock,
          rating: 5.0,
          soldCount: 0,
          image:
            it.image ||
            PRESET_GALLERY_IMAGES[idx % PRESET_GALLERY_IMAGES.length].url,
          colors: ['Hitam', 'Putih'],
          sizes: ['Standard'],
          variantStocks: {
            'Hitam-Standard': Math.max(1, Math.ceil(it.stock / 2)),
            'Putih-Standard': Math.max(1, Math.floor(it.stock / 2)),
          },
          specs: {
            material: 'Material Standar Resmi',
            dimensions: 'Standar Kemasan',
            weight: '300 gram',
            warranty: `Garansi ${activeSeller.storeName} 30 Hari`,
            originCity: activeSeller.city,
          },
          reviews: [],
          description:
            it.description.trim() || `${it.name.trim()} ready stok siap kirim COD.`,
          createdAt: new Date().toISOString(),
        };
      });

    if (created.length === 0) return 0;

    setState((prev) => ({
      ...prev,
      products: [...created, ...prev.products],
    }));
    showToast(`${created.length} produk berhasil diupload massal sekaligus!`);
    return created.length;
  };

  const updateProductStock = (productId: string, newStock: number) => {
    const safeStock = Math.max(0, Math.round(newStock));
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === productId ? { ...p, stock: safeStock } : p
      ),
    }));
    showToast(`Stok produk diperbarui menjadi ${safeStock} pcs`);
  };

  const updateSellerDecoration = (
    sellerId: string,
    payload: {
      bannerTitle: string;
      bannerSubtitle: string;
      bannerColor: string;
      avatarColor: string;
      description: string;
    }
  ) => {
    setState((prev) => ({
      ...prev,
      sellers: prev.sellers.map((s) =>
        s.id === sellerId
          ? {
              ...s,
              bannerTitle: payload.bannerTitle.trim(),
              bannerSubtitle: payload.bannerSubtitle.trim(),
              bannerColor: payload.bannerColor,
              avatarColor: payload.avatarColor,
              description: payload.description.trim(),
            }
          : s
      ),
    }));
    showToast('Dekorasi & Banner Toko berhasil disimpan!');
  };

  const upsertSellerVoucher = (
    sellerId: string,
    voucher: { code: string; title: string; amount: number; minSpend: number }
  ) => {
    const cleanCode = voucher.code.trim().toUpperCase();
    if (!cleanCode || voucher.amount <= 0) return;

    setState((prev) => {
      const updatedSellers = prev.sellers.map((s) =>
        s.id === sellerId
          ? {
              ...s,
              storeVoucher: {
                code: cleanCode,
                title: voucher.title.trim(),
                amount: voucher.amount,
                minSpend: voucher.minSpend,
              },
            }
          : s
      );

      const filteredVouchers = prev.vouchers.filter(
        (v) => v.code !== cleanCode && v.sellerId !== sellerId
      );

      const newStoreVoucher: Voucher = {
        code: cleanCode,
        title: voucher.title.trim(),
        type: 'discount',
        category: 'store',
        sellerId,
        amount: voucher.amount,
        minSpend: voucher.minSpend,
        used: false,
      };

      return {
        ...prev,
        sellers: updatedSellers,
        vouchers: [newStoreVoucher, ...filteredVouchers],
      };
    });
    showToast(`Voucher Toko ${cleanCode} aktif untuk pembeli!`);
  };

  const deleteProduct = (productId: string) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== productId),
      cart: prev.cart.filter((c) => c.productId !== productId),
    }));
    showToast('Produk dihapus dari etalase toko', 'info');
  };

  const shipOrderWithResi = (orderId: string, trackingNumber: string) => {
    const cleanResi = trackingNumber.trim().toUpperCase();
    if (!cleanResi) return;
    const nowIso = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              trackingNumber: cleanResi,
              status: 'Dikirim',
              trackingHistory: [
                {
                  title: `Paket Dikirim (${order.courier})`,
                  detail: `Paket diserahkan ke kurir ${order.courier} dengan No. Resi ${cleanResi}.`,
                  time: nowIso,
                },
                ...(order.trackingHistory ?? []),
              ],
              updatedAt: nowIso,
            }
          : order
      ),
    }));
    showToast(`No. Resi ${cleanResi} disimpan! Status: Dikirim.`);
  };

  const markOrderArrived = (orderId: string) => {
    const nowIso = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: 'Sampai',
              trackingHistory: [
                {
                  title: 'Paket Tiba di Alamat Tujuan',
                  detail: 'Kurir telah tiba dan menunggu konfirmasi Pesanan Diterima dari pembeli.',
                  time: nowIso,
                },
                ...(order.trackingHistory ?? []),
              ],
              updatedAt: nowIso,
            }
          : order
      ),
    }));
    showToast('Status diperbarui menjadi Sampai di tujuan');
  };

  const getSellerBalances = (sellerId: string) => {
    const seller = state.sellers.find((s) => s.id === sellerId);
    const feePct = state.platformFeePercent ?? 5;
    let heldGross = 0;
    let releasedGross = 0;

    for (const order of state.orders) {
      const sellerSubtotal = order.items
        .filter((item) => item.sellerId === sellerId)
        .reduce((sum, item) => sum + item.price * item.quantity, 0);

      if (sellerSubtotal <= 0) continue;

      if (order.escrowStatus === 'held') {
        heldGross += sellerSubtotal;
      } else if (order.escrowStatus === 'released') {
        releasedGross += sellerSubtotal;
      }
    }

    const heldBalance = Math.max(0, heldGross - Math.round((heldGross * feePct) / 100));
    const releasedTotal = Math.max(0, releasedGross - Math.round((releasedGross * feePct) / 100));
    const withdrawn = seller?.withdrawnBalance ?? 0;
    const availableBalance = Math.max(0, releasedTotal - withdrawn);
    return { heldBalance, releasedTotal, availableBalance };
  };

  const withdrawBalance = (
    sellerId: string,
    amount: number,
    bankInfo: string
  ) => {
    const { availableBalance } = getSellerBalances(sellerId);
    if (amount <= 0 || amount > availableBalance) {
      showToast('Nominal melebihi saldo yang bisa dicairkan', 'warning');
      return false;
    }

    const record = {
      id: `WD-${Date.now().toString().slice(-6)}`,
      sellerId,
      amount,
      bankInfo: bankInfo.trim(),
      createdAt: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      sellers: prev.sellers.map((s) =>
        s.id === sellerId
          ? { ...s, withdrawnBalance: s.withdrawnBalance + amount }
          : s
      ),
      withdrawals: [record, ...prev.withdrawals],
    }));
    showToast(`Pencairan dana berhasil diproses ke ${bankInfo}`);
    return true;
  };

  const approveSeller = (sellerId: string) => {
    setState((prev) => ({
      ...prev,
      sellers: prev.sellers.map((s) =>
        s.id === sellerId ? { ...s, status: 'approved' } : s
      ),
    }));
    showToast('Seller berhasil di-ACC dan sekarang aktif berjualan!');
  };

  const rejectSeller = (sellerId: string) => {
    setState((prev) => ({
      ...prev,
      sellers: prev.sellers.map((s) =>
        s.id === sellerId ? { ...s, status: 'rejected' } : s
      ),
    }));
    showToast('Pengajuan seller ditolak', 'info');
  };

  const releaseFundsToSeller = (orderId: string) => {
    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              escrowStatus: 'released',
              status: 'Diterima',
              updatedAt: new Date().toISOString(),
            }
          : order
      ),
    }));
    showToast('Dana escrow berhasil dilepas ke saldo Bisa Dicairkan Seller!');
  };

  const refundToBuyer = (orderId: string) => {
    const targetOrder = state.orders.find((o) => o.id === orderId);
    setState((prev) => {
      const updatedProducts = targetOrder
        ? prev.products.map((product) => {
            const refundedItems = targetOrder.items.filter(
              (i) => i.productId === product.id
            );
            if (refundedItems.length === 0) return product;
            const qty = refundedItems.reduce((s, r) => s + r.quantity, 0);
            return {
              ...product,
              stock: product.stock + qty,
            };
          })
        : prev.products;

      return {
        ...prev,
        products: updatedProducts,
        vtvpayBalance:
          targetOrder && targetOrder.paymentMethod !== 'COD'
            ? prev.vtvpayBalance + targetOrder.totalAmount
            : prev.vtvpayBalance,
        orders: prev.orders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                escrowStatus: 'refunded',
                status: 'Dana Dikembalikan',
                updatedAt: new Date().toISOString(),
              }
            : order
        ),
      };
    });
    showToast('Dana pesanan berhasil di-refund ke Buyer!', 'info');
  };

  const createLiveStream = (payload: {
    title: string;
    hostName: string;
    platform: LivePlatform;
    embedUrl?: string;
    productId: string;
  }) => {
    const newLive: LiveStreamItem = {
      id: `live-${Date.now()}`,
      title: payload.title.trim(),
      hostName: payload.hostName.trim(),
      platform: payload.platform,
      embedUrl: payload.embedUrl?.trim() || undefined,
      videoUrl: payload.embedUrl?.trim() || '/videos/vtc-live-studio.mp4',
      viewerCount: 1,
      likes: 0,
      productId: payload.productId,
      isLive: true,
      comments: [],
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      liveStreams: [newLive, ...prev.liveStreams],
    }));
    showToast(`Live "${newLive.title}" (${newLive.platform}) sedang tayang!`);
  };

  const likeLiveStream = (liveId: string) => {
    setState((prev) => ({
      ...prev,
      liveStreams: prev.liveStreams.map((l) =>
        l.id === liveId ? { ...l, likes: l.likes + 1 } : l
      ),
    }));
  };

  const commentLiveStream = (liveId: string, author: string, text: string) => {
    if (!text.trim()) return;
    setState((prev) => ({
      ...prev,
      liveStreams: prev.liveStreams.map((l) =>
        l.id === liveId
          ? {
              ...l,
              comments: [
                ...l.comments,
                {
                  id: `lc-${Date.now()}`,
                  author: author || 'Pembeli VTC SHOP INDONESIA',
                  text: text.trim(),
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : l
      ),
    }));
  };

  const createShortVideo = (payload: {
    title: string;
    creatorName: string;
    productId: string;
    caption: string;
  }) => {
    const newVid: ShortVideoItem = {
      id: `vid-${Date.now()}`,
      title: payload.title.trim(),
      creatorName: payload.creatorName.trim(),
      productId: payload.productId,
      videoUrl: '/videos/vtc-short-tiktok.mp4',
      likes: 0,
      views: 1,
      caption: payload.caption.trim(),
      comments: [],
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      shortVideos: [newVid, ...prev.shortVideos],
    }));
    showToast('Video TikTok Shop berhasil diunggah!');
  };

  const likeShortVideo = (videoId: string) => {
    setState((prev) => ({
      ...prev,
      shortVideos: prev.shortVideos.map((v) =>
        v.id === videoId ? { ...v, likes: v.likes + 1 } : v
      ),
    }));
  };

  const commentShortVideo = (videoId: string, author: string, text: string) => {
    if (!text.trim()) return;
    setState((prev) => ({
      ...prev,
      shortVideos: prev.shortVideos.map((v) =>
        v.id === videoId
          ? {
              ...v,
              comments: [
                ...v.comments,
                {
                  id: `vc-${Date.now()}`,
                  author: author || 'Pembeli VTC SHOP INDONESIA',
                  text: text.trim(),
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : v
      ),
    }));
  };

  const topUpVtvpay = (amount: number, source: string) => {
    if (amount <= 0) return;
    setState((prev) => ({
      ...prev,
      vtvpayBalance: prev.vtvpayBalance + amount,
    }));
    showToast(
      `Top Up VTC Pay Rp ${amount.toLocaleString('id-ID')} via ${source} berhasil!`
    );
  };

  const claimDailyCoins = () => {
    const today = new Date().toISOString().slice(0, 10);
    if (state.lastCoinCheckInDate === today) {
      showToast('Koin harian hari ini sudah diklaim. Kembali besok ya!', 'info');
      return;
    }
    const reward = 500;
    setState((prev) => ({
      ...prev,
      vtvCoins: prev.vtvCoins + reward,
      lastCoinCheckInDate: today,
    }));
    showToast(`Check-in harian berhasil! +${reward} VTC Coins masuk ke akun Anda.`);
  };

  const recordAffiliateShare = (_productId: string, commissionEstimate: number) => {
    const bonusCoins = 100;
    setState((prev) => ({
      ...prev,
      vtvCoins: prev.vtvCoins + bonusCoins,
      affiliateShares: prev.affiliateShares + 1,
      affiliateCommissionEstimate:
        prev.affiliateCommissionEstimate + Math.round(commissionEstimate),
    }));
    showToast(
      `Link berhasil disalin! Bonus +${bonusCoins} Koin & potensi komisi ${formatRupiah(Math.round(commissionEstimate))}/produk terjual.`
    );
  };

  const buyPulsa = (
    provider: string,
    phone: string,
    nominal: number,
    price: number
  ) => {
    if (state.vtvpayBalance < price) {
      showToast(
        'Saldo VTC Pay kurang. Silakan Top Up terlebih dahulu.',
        'warning'
      );
      return false;
    }
    setState((prev) => ({
      ...prev,
      vtvpayBalance: Math.max(0, prev.vtvpayBalance - price),
    }));
    showToast(
      `Pulsa ${provider} Rp ${nominal.toLocaleString('id-ID')} ke ${phone} berhasil dikirim!`
    );
    return true;
  };

  const payBill = (service: string, customerNumber: string, amount: number) => {
    if (!customerNumber.trim() || amount <= 0) return false;
    if (state.vtvpayBalance < amount) {
      showToast(
        'Saldo VTC Pay kurang. Silakan Top Up terlebih dahulu.',
        'warning'
      );
      return false;
    }
    setState((prev) => ({
      ...prev,
      vtvpayBalance: Math.max(0, prev.vtvpayBalance - amount),
      vtvCoins: prev.vtvCoins + 150,
    }));
    showToast(
      `Pembayaran ${service} (${customerNumber.trim()}) ${formatRupiah(amount)} berhasil! +150 VTC Coins.`
    );
    return true;
  };

  const trackProductView = (productId: string) => {
    setState((prev) => {
      const nextViewed = [
        productId,
        ...prev.viewedProductIds.filter((id) => id !== productId),
      ].slice(0, 12);
      return { ...prev, viewedProductIds: nextViewed };
    });
  };

  const toggleWishlist = (productId: string) => {
    const exists = state.wishlistIds.includes(productId);
    setState((prev) => ({
      ...prev,
      wishlistIds: exists
        ? prev.wishlistIds.filter((id) => id !== productId)
        : [productId, ...prev.wishlistIds],
    }));
    showToast(
      exists ? 'Dihapus dari Wishlist' : 'Produk disimpan ke Wishlist Anda!',
      exists ? 'info' : 'success'
    );
  };

  const toggleCompareProduct = (productId: string) => {
    const exists = state.compareProductIds.includes(productId);
    if (!exists && state.compareProductIds.length >= 3) {
      showToast('Maksimal 3 produk dapat dibandingkan sekaligus', 'warning');
      return;
    }
    setState((prev) => ({
      ...prev,
      compareProductIds: exists
        ? prev.compareProductIds.filter((id) => id !== productId)
        : [...prev.compareProductIds, productId],
    }));
    showToast(
      exists
        ? 'Produk dikeluarkan dari perbandingan'
        : 'Produk ditambahkan ke Bandingkan (maks. 3)',
      'info'
    );
  };

  const clearCompareProducts = () => {
    setState((prev) => ({ ...prev, compareProductIds: [] }));
  };

  const togglePriceAlert = (productId: string, targetPrice?: number) => {
    const product = state.products.find((p) => p.id === productId);
    const existing = state.priceAlerts[productId];
    if (existing?.active && targetPrice === undefined) {
      setState((prev) => {
        const next = { ...prev.priceAlerts };
        delete next[productId];
        return { ...prev, priceAlerts: next };
      });
      showToast('Pengingat harga turun dinonaktifkan', 'info');
      return;
    }
    const resolvedTarget =
      targetPrice && targetPrice > 0
        ? targetPrice
        : Math.round((product?.price || 100000) * 0.9);
    setState((prev) => ({
      ...prev,
      priceAlerts: {
        ...prev.priceAlerts,
        [productId]: {
          productId,
          targetPrice: resolvedTarget,
          active: true,
          createdAt: new Date().toISOString(),
        },
      },
    }));
    showToast(
      `Pengingat harga turun aktif! Anda akan diberi tahu jika harga mencapai ${formatRupiah(resolvedTarget)}.`
    );
  };

  const claimPromoVoucher = (voucher: Omit<Voucher, 'used'>) => {
    const exists = state.vouchers.some((v) => v.code === voucher.code);
    if (exists) {
      showToast(`Voucher ${voucher.code} sudah ada di dompet Anda`, 'info');
      return;
    }
    setState((prev) => ({
      ...prev,
      vouchers: [{ ...voucher, used: false }, ...prev.vouchers],
    }));
    showToast(`Voucher ${voucher.code} berhasil diklaim!`);
  };

  const sendSellerChat = (
    sellerId: string,
    text: string,
    productName?: string
  ) => {
    if (!text.trim()) return;
    const seller = state.sellers.find((s) => s.id === sellerId);
    const nowIso = new Date().toISOString();
    const buyerMsg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      sender: 'buyer' as const,
      buyerId: currentUser?.id,
      buyerName: currentUser?.name || 'Pembeli',
      productName: productName?.trim() || undefined,
      text: text.trim(),
      createdAt: nowIso,
    };
    setState((prev) => ({
      ...prev,
      sellerChats: {
        ...prev.sellerChats,
        [sellerId]: [...(prev.sellerChats[sellerId] ?? []), buyerMsg],
      },
    }));
    showToast(`Pesan terkirim ke Seller ${seller?.storeName || 'toko'}.`);
  };

  const replySellerChat = (sellerId: string, text: string) => {
    if (!text.trim()) return;
    const nowIso = new Date().toISOString();
    const sellerMsg = {
      id: `msg-s-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      sender: 'seller' as const,
      text: text.trim(),
      createdAt: nowIso,
    };
    setState((prev) => ({
      ...prev,
      sellerChats: {
        ...prev.sellerChats,
        [sellerId]: [...(prev.sellerChats[sellerId] ?? []), sellerMsg],
      },
    }));
    showToast('Balasan Seller terkirim ke pembeli!');
  };

  const setPlatformFeePercent = (percent: number) => {
    const clamped = Math.max(0, Math.min(30, Math.round(percent * 10) / 10));
    setState((prev) => ({
      ...prev,
      platformFeePercent: clamped,
    }));
    showToast(`Biaya Admin Platform diperbarui menjadi ${clamped}% per transaksi.`);
  };

  const addProductReview = (
    productId: string,
    review: Omit<ProductReview, 'id' | 'createdAt'>
  ) => {
    const newRev: ProductReview = {
      ...review,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === productId
          ? { ...p, reviews: [newRev, ...(p.reviews ?? [])] }
          : p
      ),
    }));
    showToast('Ulasan produk Anda berhasil ditambahkan!');
  };

  const toggleSellerFlashSale = (sellerId: string, discountPct = 30) => {
    setState((prev) => {
      const target = prev.sellers.find((s) => s.id === sellerId);
      const nextActive = !target?.flashSaleActive;
      return {
        ...prev,
        sellers: prev.sellers.map((s) =>
          s.id === sellerId
            ? {
                ...s,
                flashSaleActive: nextActive,
                flashSaleDiscountPct: discountPct,
              }
            : s
        ),
        products: prev.products.map((p) =>
          p.sellerId === sellerId
            ? {
                ...p,
                isFlashSale: nextActive || (p.discountPercent ?? 0) >= 70,
              }
            : p
        ),
      };
    });
    showToast('Status Flash Sale Toko diperbarui!');
  };

  const transferVtvPay = (recipient: string, amount: number, bankOrUser: string) => {
    if (!recipient.trim() || amount <= 0) return false;
    if (state.vtvpayBalance < amount) {
      showToast('Saldo VTC Pay tidak mencukupi untuk transfer', 'warning');
      return false;
    }
    const nowIso = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      vtvpayBalance: prev.vtvpayBalance - amount,
      vtvpayTransactions: [
        {
          id: `TRF-${Date.now()}`,
          type: 'transfer_out',
          title: `Transfer ke ${recipient.trim()} (${bankOrUser})`,
          amount: -amount,
          target: recipient.trim(),
          createdAt: nowIso,
        },
        ...prev.vtvpayTransactions,
      ],
    }));
    showToast(`Transfer ${formatRupiah(amount)} ke ${recipient.trim()} berhasil (Gratis Admin)!`);
    return true;
  };

  const takeVtvPinjam = (amount: number, tenorMonths: number) => {
    if (amount <= 0) return;
    const nowIso = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      vtvpayBalance: prev.vtvpayBalance + amount,
      vtvPinjamBalance: prev.vtvPinjamBalance + amount,
      vtvpayTransactions: [
        {
          id: `PJM-${Date.now()}`,
          type: 'pinjam',
          title: `Pencairan VTC Pinjam (Tenor ${tenorMonths} Bulan)`,
          amount,
          createdAt: nowIso,
        },
        ...prev.vtvpayTransactions,
      ],
    }));
    showToast(`Dana VTC Pinjam ${formatRupiah(amount)} langsung cair ke VTC Pay!`);
  };

  const payPayLaterBill = (amount: number) => {
    if (amount <= 0 || amount > state.paylaterUsed) return false;
    if (state.vtvpayBalance < amount) {
      showToast('Saldo VTC Pay tidak mencukupi untuk bayar tagihan PayLater', 'warning');
      return false;
    }
    const nowIso = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      vtvpayBalance: prev.vtvpayBalance - amount,
      paylaterUsed: Math.max(0, prev.paylaterUsed - amount),
      vtvpayTransactions: [
        {
          id: `PL-${Date.now()}`,
          type: 'payment',
          title: 'Pelunasan Tagihan PayLater 0%',
          amount: -amount,
          createdAt: nowIso,
        },
        ...prev.vtvpayTransactions,
      ],
    }));
    showToast(`Tagihan PayLater ${formatRupiah(amount)} lunas!`);
    return true;
  };

  const submitInsuranceClaim = (orderId: string, reason: string) => {
    const order = state.orders.find((o) => o.id === orderId);
    const refundAmt = order ? order.totalAmount : 150000;
    const nowIso = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      vtvpayBalance: prev.vtvpayBalance + refundAmt,
      vtvpayTransactions: [
        {
          id: `INS-${Date.now()}`,
          type: 'refund',
          title: `Klaim Asuransi 100% Barang Hilang/Rusak (${orderId || 'Proteksi'})`,
          amount: refundAmt,
          createdAt: nowIso,
        },
        ...prev.vtvpayTransactions,
      ],
    }));
    showToast(
      `Klaim Asuransi disetujui! ${formatRupiah(refundAmt)} (${reason || 'Barang Hilang/Rusak'}) cair ke VTC Pay.`
    );
  };

  const playGameTanam = () => {
    const today = new Date().toISOString().slice(0, 10);
    if (state.tanamProgress >= 100) {
      const reward = 1500;
      setState((prev) => ({
        ...prev,
        tanamProgress: 0,
        lastTanamHarvestDate: today,
        vtvCoins: prev.vtvCoins + reward,
      }));
      showToast(`Panen VTC Tanam berhasil! +${reward} VTC Coins masuk akun.`);
      return;
    }
    const nextProgress = Math.min(100, state.tanamProgress + 25);
    setState((prev) => ({
      ...prev,
      tanamProgress: nextProgress,
      vtvCoins: prev.vtvCoins + 100,
    }));
    showToast(
      nextProgress === 100
        ? 'Tanaman siap panen! Klik Panen untuk klaim +1.500 VTC Coins!'
        : `Disiram! Pertumbuhan ${nextProgress}% (+100 VTC Coins).`
    );
  };

  const playGameGoyang = () => {
    const reward = 150 + Math.floor(Math.random() * 250);
    setState((prev) => ({
      ...prev,
      vtvCoins: prev.vtvCoins + reward,
      goyangCountToday: prev.goyangCountToday + 1,
    }));
    showToast(`Goyang Koin berhadiah +${reward} VTC Coins!`);
    return reward;
  };

  const playGameTebakHarga = (correct: boolean) => {
    const reward = correct ? 500 : 50;
    setState((prev) => ({
      ...prev,
      vtvCoins: prev.vtvCoins + reward,
    }));
    showToast(
      correct
        ? `Tebakan Harga TEPAT! +${reward} VTC Coins!`
        : `Hampir tepat! Dapat bonus hiburan +${reward} VTC Coins.`
    );
  };

  const playGameRodaPutar = () => {
    if (state.rodaSpinsLeft <= 0) {
      showToast('Kesempatan Roda Putar hari ini habis. Belanja atau cek lagi besok!', 'info');
      return 0;
    }
    const prizes = [200, 500, 1000, 1500, 300, 2500];
    const reward = prizes[Math.floor(Math.random() * prizes.length)];
    setState((prev) => ({
      ...prev,
      rodaSpinsLeft: Math.max(0, prev.rodaSpinsLeft - 1),
      vtvCoins: prev.vtvCoins + reward,
    }));
    showToast(`Roda Putar berhenti di +${reward} VTC Coins!`);
    return reward;
  };

  const updateAffiliateProfile = (patch: Partial<AffiliateProfile>) => {
    setState((prev) => ({
      ...prev,
      affiliateProfile: {
        ...prev.affiliateProfile,
        ...patch,
      },
    }));
  };

  const withdrawAffiliateCommission = (amount: number, target: string) => {
    if (amount <= 0 || amount > state.affiliateProfile.availableCommission) {
      showToast('Nominal penarikan melebihi komisi tersedia', 'warning');
      return false;
    }
    const nowIso = new Date().toISOString();
    const toVtvPay =
      target.toLowerCase().includes('vtc pay') || target.toLowerCase().includes('vtv pay');
    setState((prev) => ({
      ...prev,
      vtvpayBalance: toVtvPay ? prev.vtvpayBalance + amount : prev.vtvpayBalance,
      vtvpayTransactions: toVtvPay
        ? [
            {
              id: `AFF-${Date.now()}`,
              type: 'affiliate',
              title: 'Pencairan Komisi Affiliate VTC',
              amount,
              createdAt: nowIso,
            },
            ...prev.vtvpayTransactions,
          ]
        : prev.vtvpayTransactions,
      affiliateProfile: {
        ...prev.affiliateProfile,
        availableCommission: prev.affiliateProfile.availableCommission - amount,
        withdrawnCommission: prev.affiliateProfile.withdrawnCommission + amount,
        history: [
          {
            id: `AH-${Date.now()}`,
            label: `Tarik Komisi ke ${target}`,
            amount: -amount,
            createdAt: nowIso,
          },
          ...prev.affiliateProfile.history,
        ],
      },
    }));
    showToast(`Komisi Affiliate ${formatRupiah(amount)} berhasil dicairkan ke ${target}!`);
    return true;
  };

  const placeTopUpOrder = (payload: {
    category: TopUpOrder['category'];
    serviceName: string;
    targetId: string;
    serverZone?: string;
    nickname?: string;
    itemLabel: string;
    price: number;
    paymentMethod: PaymentMethodId;
    usePromo10?: boolean;
  }): TopUpOrder | null => {
    const discountApplied = payload.usePromo10 ? Math.round(payload.price * 0.1) : 0;
    const finalPrice = Math.max(0, payload.price - discountApplied);
    if (payload.paymentMethod === 'VTCPay' && state.vtvpayBalance < finalPrice) {
      showToast('Saldo VTC Pay tidak mencukupi. Top Up atau pilih QRIS/VA.', 'warning');
      return null;
    }
    const cashbackCoins = Math.max(100, Math.round(finalPrice * 0.05));
    const nowIso = new Date().toISOString();
    const order: TopUpOrder = {
      id: `TOP-${Date.now().toString().slice(-6)}`,
      category: payload.category,
      serviceName: payload.serviceName,
      targetId: payload.targetId,
      serverZone: payload.serverZone,
      nickname: payload.nickname,
      itemLabel: payload.itemLabel,
      price: finalPrice,
      paymentMethod: payload.paymentMethod,
      discountApplied,
      cashbackCoins,
      voucherCode: payload.usePromo10 ? 'TOPUP-DISKON10' : undefined,
      status: 'Berhasil',
      createdAt: nowIso,
    };

    setState((prev) => ({
      ...prev,
      vtvpayBalance:
        payload.paymentMethod === 'VTCPay'
          ? Math.max(0, prev.vtvpayBalance - finalPrice)
          : prev.vtvpayBalance,
      vtvpayTransactions:
        payload.paymentMethod === 'VTCPay'
          ? [
              {
                id: `TRX-${Date.now()}`,
                type: 'payment',
                title: `${payload.serviceName} (${payload.itemLabel})`,
                amount: -finalPrice,
                createdAt: nowIso,
              },
              ...prev.vtvpayTransactions,
            ]
          : prev.vtvpayTransactions,
      vtvCoins: prev.vtvCoins + cashbackCoins,
      topUpOrders: [order, ...prev.topUpOrders],
      notifications: [
        {
          id: `notif-${Date.now()}`,
          type: 'topup',
          title: `${payload.serviceName} Berhasil Masuk!`,
          body: `${payload.itemLabel} untuk ${payload.nickname || payload.targetId} sukses + cashback ${cashbackCoins} Koin.`,
          targetTab: 'topup',
          read: false,
          createdAt: nowIso,
        },
        ...prev.notifications,
      ],
    }));
    showToast(
      `${payload.itemLabel} (${payload.serviceName}) masuk instan! +${cashbackCoins} Koin cashback.`
    );
    return order;
  };

  const toggleSaveVideo = (videoId: string) => {
    const exists = state.savedVideoIds.includes(videoId);
    setState((prev) => ({
      ...prev,
      savedVideoIds: exists
        ? prev.savedVideoIds.filter((id) => id !== videoId)
        : [videoId, ...prev.savedVideoIds],
    }));
    showToast(exists ? 'Dihapus dari Video Tersimpan' : 'Video disimpan ke Favorit!');
  };

  const toggleOfflineVideo = (videoId: string) => {
    const exists = state.offlineVideoIds.includes(videoId);
    setState((prev) => ({
      ...prev,
      offlineVideoIds: exists
        ? prev.offlineVideoIds.filter((id) => id !== videoId)
        : [videoId, ...prev.offlineVideoIds],
    }));
    showToast(
      exists ? 'Unduhan offline dihapus' : 'Video berhasil diunduh untuk tonton offline!',
      'info'
    );
  };

  const recordContinueWatching = (videoId: string, percent: number) => {
    setState((prev) => ({
      ...prev,
      continueWatching: {
        ...prev.continueWatching,
        [videoId]: Math.min(100, Math.max(5, Math.round(percent))),
      },
    }));
  };

  const triggerKeranjangKuningCommission = (productId: string, sourceTitle: string) => {
    const product = state.products.find((p) => p.id === productId);
    const commission = Math.min(50000, Math.round((product?.price || 100000) * 0.15));
    const nowIso = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      affiliateProfile: {
        ...prev.affiliateProfile,
        clicks: prev.affiliateProfile.clicks + 1,
        ordersCount: prev.affiliateProfile.ordersCount + 1,
        availableCommission: prev.affiliateProfile.availableCommission + commission,
        history: [
          {
            id: `KK-${Date.now()}`,
            label: `Komisi Keranjang Kuning: ${sourceTitle.slice(0, 32)}`,
            amount: commission,
            createdAt: nowIso,
          },
          ...prev.affiliateProfile.history,
        ],
      },
    }));
  };

  const submitFraudReport = (
    targetType: FraudReport['targetType'],
    targetName: string,
    reason: string
  ) => {
    const nowIso = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      fraudReports: [
        {
          id: `RPT-${Date.now()}`,
          targetType,
          targetName,
          reason: reason.trim() || 'Indikasi penipuan / pelanggaran',
          createdAt: nowIso,
        },
        ...prev.fraudReports,
      ],
      notifications: [
        {
          id: `notif-${Date.now()}`,
          type: 'security',
          title: `Laporan Keamanan Diterima (${targetName})`,
          body: 'Tim Keamanan VTC SHOP INDONESIA sedang menindaklanjuti laporan Anda 1x24 jam.',
          read: false,
          createdAt: nowIso,
        },
        ...prev.notifications,
      ],
    }));
    showToast(`Laporan penipuan terhadap "${targetName}" dikirim ke Tim Keamanan VTC!`, 'info');
  };

  const markNotificationRead = (id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  };

  const markAllNotificationsRead = () => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  };

  const pushNotification = (notif: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => {
    setState((prev) => ({
      ...prev,
      notifications: [
        {
          ...notif,
          id: `notif-${Date.now()}`,
          read: false,
          createdAt: new Date().toISOString(),
        },
        ...prev.notifications,
      ].slice(0, 30),
    }));
  };

  const resetDemoData = () => {
    const fresh = buildInitialState();
    setState(fresh);
    showToast('Data demo VTC SHOP INDONESIA berhasil direset ke kondisi awal', 'info');
  };

  return (
    <MarketplaceContext.Provider
      value={{
        state,
        authToken,
        currentUser,
        authChecking,
        setAuthSession,
        updateCurrentUser,
        logout,
        toast,
        showToast,
        toggleLiteMode,
        toggleThemeMode,
        setLanguage,
        toggleTwoFactor,
        updateNotificationPrefs,
        toggleFollowSeller,
        likeInstagramPost,
        commentInstagramPost,
        addSavedAddress,
        removeSavedAddress,
        setPrimaryAddress,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        placeOrder,
        packOrder,
        confirmOrderReceived,
        submitComplaint,
        confirmSellerReturn,
        submitOneClickRefund,
        markOrderReviewSubmitted,
        claimLateVoucher,
        registerSeller,
        setActiveSellerId,
        addProduct,
        addBulkProducts,
        updateProductStock,
        updateSellerDecoration,
        upsertSellerVoucher,
        toggleSellerFlashSale,
        deleteProduct,
        shipOrderWithResi,
        markOrderArrived,
        withdrawBalance,
        approveSeller,
        rejectSeller,
        releaseFundsToSeller,
        refundToBuyer,
        getSellerBalances,
        createLiveStream,
        likeLiveStream,
        commentLiveStream,
        createShortVideo,
        likeShortVideo,
        commentShortVideo,
        topUpVtvpay,
        transferVtvPay,
        takeVtvPinjam,
        payPayLaterBill,
        submitInsuranceClaim,
        claimDailyCoins,
        playGameTanam,
        playGameGoyang,
        playGameTebakHarga,
        playGameRodaPutar,
        recordAffiliateShare,
        updateAffiliateProfile,
        withdrawAffiliateCommission,
        placeTopUpOrder,
        toggleSaveVideo,
        toggleOfflineVideo,
        recordContinueWatching,
        triggerKeranjangKuningCommission,
        submitFraudReport,
        markNotificationRead,
        markAllNotificationsRead,
        pushNotification,
        buyPulsa,
        payBill,
        claimPromoVoucher,
        sendSellerChat,
        replySellerChat,
        setPlatformFeePercent,
        addProductReview,
        trackProductView,
        toggleWishlist,
        toggleCompareProduct,
        clearCompareProducts,
        togglePriceAlert,
        resetDemoData,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export function useMarketplace() {
  const ctx = useContext(MarketplaceContext);
  if (!ctx) {
    throw new Error('useMarketplace must be used within MarketplaceProvider');
  }
  return ctx;
}
