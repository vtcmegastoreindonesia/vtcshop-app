import React, { useMemo, useState } from 'react';
import {
  Store,
  UploadCloud,
  Package,
  Wallet,
  Truck,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRightLeft,
  Banknote,
  TrendingUp,
  Ticket,
  Palette,
  FileSpreadsheet,
  Plus,
  Radio,
  Zap,
  ShieldCheck,
  IdCard,
  BarChart3,
  MessageSquareText,
  Send,
} from 'lucide-react';
import {
  PRESET_GALLERY_IMAGES,
  useMarketplace,
} from '../store/marketplaceStore';
import { PRODUCT_CATEGORIES, formatDateId, formatRupiah } from '../types';
import { ProductImage } from './ProductImage';

interface SellerDashboardProps {
  onGoToAdmin?: () => void;
  onGoToLive?: () => void;
}

type SellerSubTab = 'orders' | 'products' | 'voucher' | 'decor' | 'balance' | 'chat';

function resizeImageFileToDataUrl(file: File): Promise<string> {
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

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  onGoToLive,
}) => {
  const {
    state,
    currentUser,
    registerSeller,
    setActiveSellerId,
    addProduct,
    addBulkProducts,
    updateProductStock,
    updateSellerDecoration,
    upsertSellerVoucher,
    toggleSellerFlashSale,
    deleteProduct,
    packOrder,
    shipOrderWithResi,
    markOrderArrived,
    confirmSellerReturn,
    replySellerChat,
    getSellerBalances,
    withdrawBalance,
    showToast,
  } = useMarketplace();

  const [subTab, setSubTab] = useState<SellerSubTab>('orders');
  const [sellerReplyText, setSellerReplyText] = useState('');
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  // Registration Form State (strictly empty initially)
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [sellerCat, setSellerCat] = useState('Elektronik');
  const [sellerDesc, setSellerDesc] = useState('');
  const [ktpNumber, setKtpNumber] = useState('');
  const [ktpPhotoPreview, setKtpPhotoPreview] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [ktpVerified, setKtpVerified] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState('');

  // Product Upload Form State (Satuan vs Massal)
  const [productMode, setProductMode] = useState<'single' | 'bulk'>('single');
  const [prodName, setProdName] = useState('');
  const [prodCat, setProdCat] = useState('Elektronik');
  const [prodPrice, setProdPrice] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodImage, setProdImage] = useState(PRESET_GALLERY_IMAGES[0].url);
  const [prodMaterial, setProdMaterial] = useState('');
  const [prodWeight, setProdWeight] = useState('');
  const [prodWarranty, setProdWarranty] = useState('');
  const [prodColors, setProdColors] = useState('Hitam, Putih, Pink');
  const [prodSizes, setProdSizes] = useState('S, M, L, XL');
  const [prodDesc, setProdDesc] = useState('');

  // Bulk Upload State
  const [bulkText, setBulkText] = useState('');

  // Store Voucher Form State
  const [vCode, setVCode] = useState('');
  const [vTitle, setVTitle] = useState('');
  const [vAmount, setVAmount] = useState('15000');
  const [vMinSpend, setVMinSpend] = useState('100000');

  // Store Decoration State
  const [decorTitle, setDecorTitle] = useState('');
  const [decorSubtitle, setDecorSubtitle] = useState('');
  const [decorBannerColor, setDecorBannerColor] = useState('#111113');
  const [decorAvatarColor, setDecorAvatarColor] = useState('#EE4D2D');
  const [decorDesc, setDecorDesc] = useState('');

  // Resi Inputs Map
  const [resiMap, setResiMap] = useState<Record<string, string>>({});

  // Withdraw Form State
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankInfo, setBankInfo] = useState('');

  // Isolasi ketat: seller hanya bisa akses toko miliknya sendiri (bukan toko seller lain)
  const mySellers = useMemo(
    () =>
      state.sellers.filter(
        (s) => s.ownerUserId && currentUser?.id && s.ownerUserId === currentUser.id
      ),
    [state.sellers, currentUser?.id]
  );

  const activeSeller = useMemo(
    () =>
      mySellers.find((s) => s.id === state.activeSellerId) ??
      mySellers[0] ??
      null,
    [mySellers, state.activeSellerId]
  );

  const mySellerChats = useMemo(
    () => (activeSeller ? state.sellerChats[activeSeller.id] ?? [] : []),
    [state.sellerChats, activeSeller]
  );

  const buyerChatCount = useMemo(
    () => mySellerChats.filter((m) => m.sender === 'buyer').length,
    [mySellerChats]
  );

  const sellerProducts = useMemo(() => {
    if (!activeSeller) return [];
    return state.products.filter((p) => p.sellerId === activeSeller.id);
  }, [state.products, activeSeller]);

  const sellerOrders = useMemo(() => {
    if (!activeSeller) return [];
    return state.orders.filter((order) =>
      order.items.some((item) => item.sellerId === activeSeller.id)
    );
  }, [state.orders, activeSeller]);

  const sellerWithdrawals = useMemo(() => {
    if (!activeSeller) return [];
    return state.withdrawals.filter((w) => w.sellerId === activeSeller.id);
  }, [state.withdrawals, activeSeller]);

  const balances = activeSeller
    ? getSellerBalances(activeSeller.id)
    : { heldBalance: 0, releasedTotal: 0, availableBalance: 0 };

  const sellerOmset = useMemo(() => {
    if (!activeSeller) return 0;
    return sellerOrders
      .filter((o) => o.status !== 'Dana Dikembalikan')
      .reduce((sum, order) => {
        const sub = order.items
          .filter((i) => i.sellerId === activeSeller.id)
          .reduce((s, i) => s + i.price * i.quantity, 0);
        return sum + sub;
      }, 0);
  }, [sellerOrders, activeSeller]);

  const lowStockProducts = useMemo(
    () => sellerProducts.filter((p) => p.stock <= 10),
    [sellerProducts]
  );

  const pendingOrdersCount = useMemo(
    () =>
      sellerOrders.filter(
        (o) =>
          o.status === 'Dipesan' ||
          o.status === 'Dibayar' ||
          o.status === 'Dikemas' ||
          o.status === 'Diproses'
      ).length,
    [sellerOrders]
  );

  const salesChartData = useMemo(() => {
    const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    const base = Math.max(120000, Math.round((sellerOmset || 350000) / 7));
    const multipliers = [0.65, 0.85, 0.72, 1.08, 1.24, 1.45, 1.32];
    const values = days.map((day, idx) => ({
      day,
      amount: Math.round(base * multipliers[idx]),
    }));
    const max = Math.max(...values.map((v) => v.amount), 1);
    return { values, max };
  }, [sellerOmset]);

  React.useEffect(() => {
    if (!activeSeller) return;
    setVCode(activeSeller.storeVoucher?.code || '');
    setVTitle(activeSeller.storeVoucher?.title || '');
    setVAmount(String(activeSeller.storeVoucher?.amount || 15000));
    setVMinSpend(String(activeSeller.storeVoucher?.minSpend || 100000));
    setDecorTitle(activeSeller.bannerTitle || activeSeller.storeName);
    setDecorSubtitle(
      activeSeller.bannerSubtitle ||
        `Promo Hemat & COD Garansi dari ${activeSeller.storeName}`
    );
    setDecorBannerColor(activeSeller.bannerColor || '#111113');
    setDecorAvatarColor(activeSeller.avatarColor || '#EE4D2D');
    setDecorDesc(activeSeller.description || '');
  }, [activeSeller?.id]);

  const handleKtpUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await resizeImageFileToDataUrl(file);
      setKtpPhotoPreview(dataUrl);
      showToast('Foto e-KTP berhasil dimuat');
    } catch {
      showToast('Gagal membaca foto KTP', 'warning');
    }
  };

  const handleSendSellerOtp = async () => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 9) {
      showToast('Isi No. WhatsApp Toko terlebih dahulu', 'warning');
      return;
    }
    setOtpSending(true);
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: 'whatsapp', target: cleanPhone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengirim OTP');
      setOtpSent(true);
      if (data.devOtp) setDevOtpHint(String(data.devOtp));
      showToast('Kode OTP 6 digit dikirim ke WhatsApp Anda!');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal mengirim OTP', 'warning');
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifySellerOtp = async () => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (ktpNumber.replace(/\D/g, '').length !== 16) {
      showToast('NIK KTP wajib 16 digit untuk aktivasi cepat 5 menit', 'warning');
      return;
    }
    if (otpCode.trim().length < 4) {
      showToast('Masukkan kode OTP 6 digit dengan benar', 'warning');
      return;
    }
    setOtpVerifying(true);
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: 'whatsapp',
          target: cleanPhone,
          code: otpCode.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Kode OTP tidak valid');
      setKtpVerified(true);
      showToast('KTP & OTP terverifikasi! Klik Daftar untuk langsung buka toko.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'OTP gagal diverifikasi', 'warning');
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim() || !ownerName.trim() || !phone.trim() || !city.trim()) {
      showToast('Lengkapi semua data toko yang wajib diisi', 'warning');
      return;
    }
    const cleanNik = ktpNumber.replace(/\D/g, '');
    registerSeller({
      storeName,
      ownerName,
      phone,
      city,
      category: sellerCat,
      description: sellerDesc || `Toko resmi ${storeName} di VTC SHOP INDONESIA`,
      ktpNumber: cleanNik.length === 16 ? cleanNik : undefined,
      ktpVerified: ktpVerified && cleanNik.length === 16,
    });
    setShowRegisterForm(false);
    setStoreName('');
    setOwnerName('');
    setPhone('');
    setCity('');
    setSellerDesc('');
    setKtpNumber('');
    setKtpPhotoPreview('');
    setOtpSent(false);
    setOtpCode('');
    setKtpVerified(false);
    setDevOtpHint('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await resizeImageFileToDataUrl(file);
      setProdImage(dataUrl);
      showToast('Foto produk berhasil dimuat');
    } catch {
      showToast('Gagal membaca file gambar', 'warning');
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = Number(prodPrice);
    const stockNum = Number(prodStock);
    if (!prodName.trim() || isNaN(priceNum) || priceNum <= 0 || isNaN(stockNum) || stockNum < 0) {
      showToast('Periksa kembali nama, harga, dan stok produk', 'warning');
      return;
    }
    addProduct({
      name: prodName,
      category: prodCat,
      price: priceNum,
      stock: stockNum,
      image: prodImage,
      material: prodMaterial.trim() || undefined,
      weight: prodWeight.trim() || undefined,
      warranty: prodWarranty.trim() || undefined,
      colors: prodColors
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      sizes: prodSizes
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      description: prodDesc || `${prodName} kualitas terjamin siap kirim COD.`,
    });
    setProdName('');
    setProdPrice('');
    setProdStock('');
    setProdMaterial('');
    setProdWeight('');
    setProdWarranty('');
    setProdDesc('');
  };

  const generateAutoResi = (courierName: string) => {
    const prefix =
      courierName === 'J&T'
        ? 'JT88'
        : courierName === 'SPX'
          ? 'SPXID'
          : courierName === 'AnterAja'
            ? 'ANT'
            : courierName === 'SiCepat'
              ? 'SC00'
              : courierName === 'JNE'
                ? 'JNE'
                : 'VTCEXP';
    const rand = Math.floor(100000 + Math.random() * 899999);
    return `${prefix}${rand}`;
  };

  const handleShipSubmit = (orderId: string) => {
    const input = resiMap[orderId]?.trim();
    if (!input) {
      showToast('Masukkan nomor resi terlebih dahulu atau klik Buat Resi Otomatis', 'warning');
      return;
    }
    shipOrderWithResi(orderId, input);
    setResiMap((prev) => ({ ...prev, [orderId]: '' }));
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSeller) return;
    const nominal = Number(withdrawAmount);
    if (isNaN(nominal) || nominal <= 0 || !bankInfo.trim()) {
      showToast('Masukkan nominal dan tujuan rekening/e-wallet', 'warning');
      return;
    }
    const ok = withdrawBalance(activeSeller.id, nominal, bankInfo);
    if (ok) {
      setWithdrawAmount('');
      setBankInfo('');
    }
  };

  const handleBulkUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = bulkText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const parsed = lines
      .map((line, idx) => {
        const parts = line.split('|').map((p) => p.trim());
        const name = parts[0] || '';
        const category = parts[1] || 'Aksesoris';
        const price = Number((parts[2] || '').replace(/\D/g, ''));
        const stock = Number((parts[3] || '20').replace(/\D/g, ''));
        const description =
          parts[4] || `${name} siap kirim COD Garansi dari ${activeSeller?.storeName || 'Toko'}`;
        const preset = PRESET_GALLERY_IMAGES[idx % PRESET_GALLERY_IMAGES.length];
        return { name, category, price, stock, description, image: preset.url };
      })
      .filter((item) => item.name && item.price > 0);

    if (parsed.length === 0) {
      showToast(
        'Format massal tidak valid. Gunakan format: Nama | Kategori | Harga | Stok | Deskripsi',
        'warning'
      );
      return;
    }
    const added = addBulkProducts(parsed);
    if (added > 0) {
      setBulkText('');
      setProductMode('single');
    }
  };

  const handleSaveVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSeller || !vCode.trim() || !vTitle.trim()) return;
    const amt = Number(vAmount);
    const min = Number(vMinSpend);
    if (isNaN(amt) || amt <= 0 || isNaN(min) || min < 0) {
      showToast('Nominal voucher atau minimal belanja tidak valid', 'warning');
      return;
    }
    upsertSellerVoucher(activeSeller.id, {
      code: vCode,
      title: vTitle,
      amount: amt,
      minSpend: min,
    });
  };

  const handleSaveDecoration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSeller) return;
    updateSellerDecoration(activeSeller.id, {
      bannerTitle: decorTitle.trim() || activeSeller.storeName,
      bannerSubtitle: decorSubtitle.trim(),
      bannerColor: decorBannerColor,
      avatarColor: decorAvatarColor,
      description: decorDesc.trim() || activeSeller.description,
    });
  };

  // View 1: Unregistered / Register New Seller Form
  if (!activeSeller || showRegisterForm) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900">
              Pusat Seller VTC SHOP INDONESIA
            </h1>
            <p className="text-sm text-zinc-600">
              Buka toko gratis atau kelola toko terverifikasi Anda.
            </p>
          </div>
          {activeSeller && (
            <button
              type="button"
              onClick={() => setShowRegisterForm(false)}
              className="min-h-[44px] px-4 rounded-xl border border-zinc-200 bg-white text-sm font-semibold text-zinc-700 hover:bg-zinc-50 cursor-pointer"
            >
              Kembali ke Toko
            </button>
          )}
        </div>

        {/* Form Jadi Seller */}
        <section className="bg-white rounded-2xl border border-zinc-200 p-5 sm:p-6 space-y-5">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-orange-50 text-[#EE4D2D] flex items-center justify-center shrink-0">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900">Form Jadi Seller</h2>
              <p className="text-xs sm:text-sm text-zinc-500">
                Isi profil toko Anda. Setelah mendaftar, Admin VTC SHOP INDONESIA akan melakukan ACC toko sebelum Anda bisa upload produk.
              </p>
            </div>
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Nama Toko
                </label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Contoh: Toko Berkah Jaya"
                  className="w-full h-12 px-3.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#EE4D2D]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Nama Pemilik
                </label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Contoh: Reza Gunawan"
                  className="w-full h-12 px-3.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#EE4D2D]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  No. WhatsApp Toko
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 081299887766"
                  className="w-full h-12 px-3.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#EE4D2D]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Kota Asal Pengiriman
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Contoh: Surabaya"
                  className="w-full h-12 px-3.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#EE4D2D]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Kategori Utama
              </label>
              <select
                value={sellerCat}
                onChange={(e) => setSellerCat(e.target.value)}
                className="w-full h-12 px-3.5 rounded-xl border border-zinc-200 text-sm bg-white focus:outline-none focus:border-[#EE4D2D]"
              >
                {PRODUCT_CATEGORIES.filter((c) => c !== 'Semua').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Deskripsi Singkat Toko
              </label>
              <textarea
                rows={3}
                value={sellerDesc}
                onChange={(e) => setSellerDesc(e.target.value)}
                placeholder="Ceritakan produk unggulan toko Anda..."
                className="w-full p-3.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#EE4D2D] resize-none"
              />
            </div>

            {/* Verifikasi Cepat KTP + OTP (Aktif Dalam 5 Menit) */}
            <div className="rounded-2xl border border-orange-200 bg-orange-50/50 p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <IdCard className="w-5 h-5 text-[#EE4D2D] shrink-0" />
                  <div>
                    <p className="text-xs sm:text-sm font-extrabold text-zinc-900">
                      Daftar Seller Gratis 5 Menit (KTP + OTP)
                    </p>
                    <p className="text-[11px] text-zinc-600">
                      Lengkapi NIK e-KTP (16 digit) & verifikasi OTP agar toko langsung aktif tanpa menunggu antrean Admin.
                    </p>
                  </div>
                </div>
                {ktpVerified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-1 rounded-lg shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" /> KTP + OTP Valid
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    NIK e-KTP (16 Digit)
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    value={ktpNumber}
                    onChange={(e) => {
                      setKtpNumber(e.target.value.replace(/\D/g, ''));
                      setKtpVerified(false);
                    }}
                    placeholder="Masukkan 16 digit NIK KTP"
                    className="w-full h-11 px-3.5 rounded-xl bg-white border border-zinc-200 font-mono text-sm focus:outline-none focus:border-[#EE4D2D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Foto e-KTP (Opsional Preview)
                  </label>
                  <label className="w-full h-11 px-3 rounded-xl bg-white border border-dashed border-zinc-300 hover:border-[#EE4D2D] flex items-center justify-between text-xs font-semibold text-zinc-700 cursor-pointer">
                    <span className="truncate">
                      {ktpPhotoPreview ? 'Foto KTP Siap ✓' : 'Upload Foto KTP'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleKtpUpload}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  disabled={otpSending}
                  onClick={handleSendSellerOtp}
                  className="min-h-[42px] px-4 rounded-xl bg-[#111113] hover:bg-zinc-800 disabled:opacity-60 text-white text-xs font-bold whitespace-nowrap cursor-pointer"
                >
                  {otpSending
                    ? 'Mengirim OTP...'
                    : otpSent
                      ? 'Kirim Ulang OTP WA'
                      : 'Kirim Kode OTP ke WA'}
                </button>
                {otpSent && !ktpVerified && (
                  <>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="Kode OTP 6 digit"
                      className="flex-1 h-[42px] px-3 rounded-xl bg-white border border-zinc-200 font-mono text-sm focus:outline-none focus:border-[#EE4D2D]"
                    />
                    <button
                      type="button"
                      disabled={otpVerifying}
                      onClick={handleVerifySellerOtp}
                      className="min-h-[42px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                    >
                      {otpVerifying ? 'Cek...' : 'Verifikasi OTP'}
                    </button>
                  </>
                )}
              </div>
              {devOtpHint && otpSent && !ktpVerified && (
                <p className="text-[11px] text-zinc-600">
                  Kode OTP terkirim ke WhatsApp ({phone}): <strong className="font-mono text-[#EE4D2D]">{devOtpHint}</strong>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-[#EE4D2D] hover:bg-[#D73B1C] text-white font-bold text-sm transition-colors cursor-pointer active:scale-[0.99]"
            >
              {ktpVerified
                ? 'Aktifkan Toko Instan Sekarang (5 Menit)'
                : 'Ajukan Pendaftaran Seller'}
            </button>
          </form>
        </section>

        {/* Quick access ONLY to this user's own stores (strict seller isolation) */}
        {mySellers.length > 0 && (
          <section className="bg-white rounded-2xl border border-zinc-200 p-5 space-y-3">
            <h3 className="text-sm font-bold text-zinc-900">
              Toko Milik Anda ({mySellers.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mySellers.map((seller) => (
                <button
                  key={seller.id}
                  type="button"
                  onClick={() => {
                    setActiveSellerId(seller.id);
                    setShowRegisterForm(false);
                  }}
                  className="min-h-[56px] p-4 rounded-xl border border-zinc-200 hover:border-[#EE4D2D] hover:bg-orange-50/40 text-left flex items-center justify-between transition-all cursor-pointer"
                >
                  <div>
                    <p className="text-sm font-bold text-zinc-900">
                      {seller.storeName}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {seller.city} · {seller.category} ·{' '}
                      {seller.status === 'approved' ? 'Aktif' : 'Menunggu ACC'}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#EE4D2D]">Masuk →</span>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  // View 2: Pending or Rejected Seller State
  if (activeSeller.status !== 'approved') {
    const isPending = activeSeller.status === 'pending';
    return (
      <div className="max-w-xl mx-auto space-y-5">
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 text-center space-y-4">
          <div
            className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center ${
              isPending
                ? 'bg-amber-50 text-amber-600'
                : 'bg-rose-50 text-rose-600'
            }`}
          >
            {isPending ? (
              <Clock className="w-7 h-7" />
            ) : (
              <AlertTriangle className="w-7 h-7" />
            )}
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-extrabold text-zinc-900">
              {isPending
                ? 'Pendaftaran Toko Menunggu Verifikasi Admin Platform'
                : 'Pengajuan Toko Ditolak'}
            </h2>
            <p className="text-sm text-zinc-600">
              Toko <span className="font-bold text-zinc-900">{activeSeller.storeName}</span> ({activeSeller.city})
              {isPending
                ? ' sedang dalam antrean verifikasi Admin Platform VTC SHOP. Jika butuh bantuan aktivasi, hubungi tombol CS VTC SHOP.'
                : ' belum memenuhi syarat verifikasi saat ini.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowRegisterForm(true)}
              className="flex-1 min-h-[48px] px-4 rounded-xl border border-zinc-200 text-zinc-700 font-semibold text-sm hover:bg-zinc-50 cursor-pointer"
            >
              Daftar Toko Baru
            </button>
          </div>
        </div>
      </div>
    );
  }

  // View 3: Approved Seller Dashboard
  return (
    <div className="space-y-6">
      {/* Store Header */}
      <section className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#EE4D2D] text-white flex items-center justify-center shrink-0">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold text-zinc-900">
                {activeSeller.storeName}
              </h1>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-500">
              {activeSeller.city} · Pemilik: {activeSeller.ownerName}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => toggleSellerFlashSale(activeSeller.id, 45)}
            className="min-h-[44px] px-3.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-[#EE4D2D]" />
            Flash Sale Toko
          </button>
          {onGoToLive && (
            <button
              type="button"
              onClick={onGoToLive}
              className="min-h-[44px] px-3.5 rounded-xl bg-[#EE4D2D] hover:bg-[#D73B1C] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Radio className="w-4 h-4" />
              Live Jualan
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowRegisterForm(true)}
            className="min-h-[44px] px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowRightLeft className="w-4 h-4" />
            Ganti / Daftar Toko
          </button>
        </div>
      </section>

      {/* Ringkasan KPI Seller: Omset, Pesanan Masuk, Stok Menipis, Saldo Cair */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-1">
          <p className="text-[11px] font-bold text-zinc-500 inline-flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-[#EE4D2D]" /> Omset Penjualan
          </p>
          <p className="text-lg sm:text-xl font-extrabold text-[#EE4D2D] tabular-nums">
            {formatRupiah(sellerOmset)}
          </p>
          <p className="text-[11px] text-zinc-500">
            Dari {sellerOrders.length} total pesanan
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-1">
          <p className="text-[11px] font-bold text-zinc-500 inline-flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-sky-600" /> Pesanan Masuk
          </p>
          <p className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-100 tabular-nums">
            {pendingOrdersCount} Perlu Proses
          </p>
          <p className="text-[11px] text-zinc-500">
            Siap kemas & input no. resi
          </p>
        </div>

        <div
          className={`rounded-2xl border p-4 space-y-1 ${
            lowStockProducts.length > 0
              ? 'bg-amber-50/80 border-amber-300'
              : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
          }`}
        >
          <p className="text-[11px] font-bold text-amber-800 inline-flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Stok Menipis (≤10)
          </p>
          <p className="text-lg sm:text-xl font-extrabold text-zinc-900 tabular-nums">
            {lowStockProducts.length} Produk
          </p>
          <p className="text-[11px] text-amber-800">
            {lowStockProducts.length > 0
              ? 'Segera tambah stok di tab Produk'
              : 'Semua stok aman'}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 p-4 space-y-1">
          <p className="text-[11px] font-bold text-emerald-700 inline-flex items-center gap-1">
            <Wallet className="w-3.5 h-3.5" /> Saldo Bisa Cair
          </p>
          <p className="text-lg sm:text-xl font-extrabold text-emerald-700 tabular-nums">
            {formatRupiah(balances.availableBalance)}
          </p>
          <p className="text-[11px] text-zinc-500 tabular-nums">
            Escrow: {formatRupiah(balances.heldBalance)} · Potongan Admin {state.platformFeePercent ?? 5}%
          </p>
        </div>
      </section>

      {/* Grafik Penjualan Mingguan SVG */}
      <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#EE4D2D]" />
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                Grafik Penjualan 7 Hari Terakhir
              </h2>
              <p className="text-[11px] text-zinc-500">
                Tren omset harian toko {activeSeller.storeName}
              </p>
            </div>
          </div>
          <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg tabular-nums">
            +24.8% Minggu Ini
          </span>
        </div>

        <div className="w-full overflow-x-auto">
          <svg
            viewBox="0 0 560 150"
            className="w-full h-36 sm:h-40"
            role="img"
            aria-label="Grafik penjualan mingguan toko"
          >
            {[0.25, 0.5, 0.75, 1].map((g) => (
              <line
                key={g}
                x1="20"
                x2="540"
                y1={120 - g * 95}
                y2={120 - g * 95}
                stroke="#E4E4E7"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            ))}
            {salesChartData.values.map((item, idx) => {
              const barH = Math.max(12, Math.round((item.amount / salesChartData.max) * 95));
              const x = 42 + idx * 72;
              const y = 120 - barH;
              return (
                <g key={item.day}>
                  <rect
                    x={x}
                    y={y}
                    width="34"
                    height={barH}
                    rx="7"
                    fill={idx >= 5 ? '#EE4D2D' : '#FB923C'}
                  />
                  <text
                    x={x + 17}
                    y="138"
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="700"
                    fill="#71717A"
                  >
                    {item.day}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </section>

      {/* Alert Stok Menipis Quick Action */}
      {lowStockProducts.length > 0 && (
        <section className="rounded-2xl bg-amber-50 border border-amber-200 p-4 space-y-2.5">
          <p className="text-xs sm:text-sm font-extrabold text-amber-950 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Peringatan Stok Menipis ({lowStockProducts.length} produk sisa ≤ 10 pcs)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {lowStockProducts.map((p) => (
              <div
                key={`low-${p.id}`}
                className="bg-white rounded-xl border border-amber-200 px-3 py-2 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-zinc-900 truncate">
                    {p.name}
                  </p>
                  <p className="text-[11px] text-rose-600 font-bold tabular-nums">
                    Sisa stok: {p.stock} pcs
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => updateProductStock(p.id, p.stock + 20)}
                  className="min-h-[34px] px-3 rounded-lg bg-[#EE4D2D] hover:bg-[#D73B1C] text-white text-[11px] font-bold shrink-0 cursor-pointer inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> +20 Stok
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Seller Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-white p-1.5 rounded-2xl border border-zinc-200">
        {[
          {
            id: 'orders' as const,
            label: `Pesanan Masuk (${sellerOrders.length})`,
            icon: Truck,
          },
          {
            id: 'products' as const,
            label: `Produk & Massal (${sellerProducts.length})`,
            icon: Package,
          },
          {
            id: 'voucher' as const,
            label: 'Voucher Toko',
            icon: Ticket,
          },
          {
            id: 'decor' as const,
            label: 'Dekorasi Toko',
            icon: Palette,
          },
          {
            id: 'balance' as const,
            label: 'Saldo & Omset',
            icon: Wallet,
          },
          {
            id: 'chat' as const,
            label: `Chat Pembeli (${buyerChatCount})`,
            icon: MessageSquareText,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = subTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubTab(tab.id)}
              className={`min-h-[44px] px-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                active
                  ? 'bg-[#EE4D2D] text-white'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sub-Tab 1: List Orderan Masuk & Input No Resi */}
      {subTab === 'orders' && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-900">
            List Orderan Masuk & Input No. Resi
          </h2>

          {sellerOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-zinc-200 p-10 text-center space-y-2">
              <Truck className="w-10 h-10 text-zinc-300 mx-auto" />
              <p className="text-base font-bold text-zinc-800">
                Belum ada orderan masuk
              </p>
              <p className="text-sm text-zinc-500">
                Saat pembeli checkout produk dari toko Anda, pesanan akan muncul di sini.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sellerOrders.map((order) => {
                const sellerItems = order.items.filter(
                  (i) => i.sellerId === activeSeller.id
                );
                const sellerSubtotal = sellerItems.reduce(
                  (sum, i) => sum + i.price * i.quantity,
                  0
                );

                return (
                  <article
                    key={order.id}
                    className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-100">
                      <div>
                        <span className="font-mono text-xs font-bold text-zinc-800">
                          {order.id}
                        </span>
                        <span className="mx-2 text-zinc-300">·</span>
                        <span className="text-xs text-zinc-500">
                          {formatDateId(order.createdAt)}
                        </span>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-800">
                        Status: {order.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-zinc-500">
                          Data Penerima COD
                        </p>
                        <p className="font-bold text-zinc-900">
                          {order.buyerName} · {order.buyerPhone}
                        </p>
                        <p className="text-xs text-zinc-600 leading-relaxed">
                          {order.buyerAddress}
                        </p>
                        <p className="text-xs font-semibold text-[#EE4D2D] pt-1">
                          Kurir: {order.courier}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-zinc-500">
                          Item Pesanan
                        </p>
                        {sellerItems.map((item) => (
                          <div
                            key={item.productId}
                            className="flex items-center justify-between text-xs sm:text-sm"
                          >
                            <span className="text-zinc-800 font-medium truncate pr-2">
                              {item.quantity}× {item.productName}
                            </span>
                            <span className="font-bold text-zinc-900 tabular-nums shrink-0">
                              {formatRupiah(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                        <div className="pt-2 border-t border-zinc-100 flex justify-between text-sm font-extrabold">
                          <span>Pendapatan Toko</span>
                          <span className="text-[#EE4D2D] tabular-nums">
                            {formatRupiah(sellerSubtotal)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Kemas Paket / Input No Resi or Status Action */}
                    {order.status === 'Dipesan' || order.status === 'Dibayar' ? (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="text-xs">
                          <p className="font-bold text-amber-950">
                            Pesanan Baru Masuk ({order.courier})
                          </p>
                          <p className="text-amber-800">
                            Klik Kemas Paket agar status real-time pembeli berpindah ke Dikemas.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => packOrder(order.id)}
                          className="min-h-[44px] px-5 rounded-xl bg-[#EE4D2D] hover:bg-[#D73B1C] text-white font-bold text-xs sm:text-sm whitespace-nowrap cursor-pointer"
                        >
                          Kemas Paket Sekarang
                        </button>
                      </div>
                    ) : order.status === 'Dikemas' || order.status === 'Diproses' ? (
                      <div className="bg-orange-50/70 border border-orange-200 rounded-xl p-3.5 space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <label className="block text-xs font-bold text-zinc-800">
                            Input No. Resi Pengiriman ({order.courier})
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              setResiMap((prev) => ({
                                ...prev,
                                [order.id]: generateAutoResi(order.courier),
                              }))
                            }
                            className="text-[11px] font-bold text-[#EE4D2D] hover:underline cursor-pointer"
                          >
                            + Buat Resi Otomatis
                          </button>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2.5">
                          <input
                            type="text"
                            value={resiMap[order.id] ?? ''}
                            onChange={(e) =>
                              setResiMap((prev) => ({
                                ...prev,
                                [order.id]: e.target.value,
                              }))
                            }
                            placeholder={`Contoh: ${order.courier === 'JNE' ? 'JNE992817263' : order.courier === 'J&T' ? 'JT882910442' : order.courier === 'SPX' ? 'SPXID04918273' : order.courier === 'AnterAja' ? 'ANT88201944' : 'SC004918221'}`}
                            className="flex-1 h-12 px-3.5 rounded-xl bg-white border border-zinc-200 font-mono text-sm focus:outline-none focus:border-[#EE4D2D]"
                          />
                          <button
                            type="button"
                            onClick={() => handleShipSubmit(order.id)}
                            className="min-h-[48px] px-5 rounded-xl bg-[#EE4D2D] hover:bg-[#D73B1C] text-white font-bold text-sm whitespace-nowrap cursor-pointer"
                          >
                            Kirim & Simpan Resi
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50 border border-zinc-200 rounded-xl p-3.5">
                          <div className="text-xs sm:text-sm">
                            <span className="text-zinc-500">No. Resi ({order.courier}): </span>
                            <span className="font-mono font-bold text-zinc-900">
                              {order.trackingNumber || '-'}
                            </span>
                            <span className="mx-2 text-zinc-300">·</span>
                            <span className="text-zinc-600">
                              Escrow:{' '}
                              <strong className="text-zinc-900">
                                {order.escrowStatus === 'held'
                                  ? 'Ditahan VTC SHOP INDONESIA'
                                  : order.escrowStatus === 'released'
                                    ? 'Dilepas ke Saldo'
                                    : 'Refund ke Buyer'}
                              </strong>
                            </span>
                          </div>
                          {order.status === 'Dikirim' && (
                            <button
                              type="button"
                              onClick={() => markOrderArrived(order.id)}
                              className="min-h-[44px] px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs sm:text-sm font-bold whitespace-nowrap cursor-pointer"
                            >
                              Tandai Paket Sampai
                            </button>
                          )}
                        </div>

                        {(order.status === 'Komplain' || order.returnStatus === 'requested') && (
                          <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 space-y-2.5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-xs font-extrabold text-rose-900">
                                Permintaan {order.complaintType || 'Retur'} Pembeli
                              </p>
                              <span className="px-2 py-0.5 rounded-md bg-white border border-rose-200 text-[10px] font-bold text-rose-700">
                                {order.returnStatus === 'approved'
                                  ? 'Sudah Dikonfirmasi'
                                  : 'Perlu Konfirmasi Seller'}
                              </span>
                            </div>
                            {order.complaintReason && (
                              <p className="text-xs text-rose-900">
                                Alasan: {order.complaintReason}
                              </p>
                            )}
                            {order.returnPhoto && (
                              <img
                                src={order.returnPhoto}
                                alt="Bukti retur pembeli"
                                className="w-24 h-24 rounded-xl object-cover border border-rose-200"
                              />
                            )}
                            {order.escrowStatus !== 'refunded' && (
                              <button
                                type="button"
                                onClick={() => confirmSellerReturn(order.id)}
                                className="min-h-[42px] px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold cursor-pointer"
                              >
                                Konfirmasi Retur &amp; Kembalikan Dana
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Sub-Tab 2: Upload Produk Satuan & Upload Produk Massal + Stok */}
      {subTab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          {/* Upload Form */}
          <section className="lg:col-span-2 bg-white rounded-2xl border border-zinc-200 p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {productMode === 'single' ? (
                  <UploadCloud className="w-5 h-5 text-[#EE4D2D]" />
                ) : (
                  <FileSpreadsheet className="w-5 h-5 text-[#EE4D2D]" />
                )}
                <h2 className="text-base sm:text-lg font-bold text-zinc-900">
                  {productMode === 'single'
                    ? 'Upload Produk Baru'
                    : 'Upload Produk Massal'}
                </h2>
              </div>
              <div className="flex rounded-xl bg-zinc-100 p-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setProductMode('single')}
                  className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                    productMode === 'single'
                      ? 'bg-[#EE4D2D] text-white'
                      : 'text-zinc-600'
                  }`}
                >
                  Satuan
                </button>
                <button
                  type="button"
                  onClick={() => setProductMode('bulk')}
                  className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                    productMode === 'bulk'
                      ? 'bg-[#EE4D2D] text-white'
                      : 'text-zinc-600'
                  }`}
                >
                  Massal
                </button>
              </div>
            </div>

            {productMode === 'bulk' ? (
              <form onSubmit={handleBulkUploadSubmit} className="space-y-3.5">
                <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-3 text-xs text-zinc-600 space-y-1">
                  <p className="font-bold text-zinc-900">
                    Format 1 baris per produk:
                  </p>
                  <p className="font-mono text-[11px] text-[#EE4D2D]">
                    Nama Produk | Kategori | Harga | Stok | Deskripsi
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setBulkText(
                      'Charger GaN 65W Fast Charge | Elektronik | 169000 | 35 | Pengisi daya cepat laptop & HP\nStand Laptop Aluminium Lipat | Aksesoris | 95000 | 40 | Kokoh anti slip 6 tingkat kemiringan\nBotol Minum Olahraga 1L | Rumah Tangga | 65000 | 50 | Bebas BPA cocok untuk gym'
                    )
                  }
                  className="text-xs font-bold text-[#EE4D2D] hover:underline cursor-pointer"
                >
                  + Isi Contoh 3 Produk Massal
                </button>
                <textarea
                  rows={6}
                  required
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder="Contoh: Powerbank 20000mAh | Elektronik | 189000 | 30 | Fast charging 22.5W"
                  className="w-full p-3 rounded-xl border border-zinc-200 text-xs font-mono focus:outline-none focus:border-[#EE4D2D]"
                />
                <button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-[#EE4D2D] hover:bg-[#D73B1C] text-white font-bold text-sm cursor-pointer"
                >
                  Upload Semua Produk Massal
                </button>
              </form>
            ) : (
              <>

            <form onSubmit={handleAddProduct} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Nama Produk
                </label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="Contoh: Powerbank Fast Charging 20000mAh"
                  className="w-full h-12 px-3.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#EE4D2D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Jenis / Kategori Produk
                </label>
                <select
                  value={prodCat}
                  onChange={(e) => setProdCat(e.target.value)}
                  className="w-full h-12 px-3.5 rounded-xl border border-zinc-200 text-sm bg-white focus:outline-none focus:border-[#EE4D2D]"
                >
                  {PRODUCT_CATEGORIES.filter((c) => c !== 'Semua').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Harga (Rp)
                  </label>
                  <input
                    type="number"
                    min={1000}
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="150000"
                    className="w-full h-12 px-3.5 rounded-xl border border-zinc-200 text-sm tabular-nums focus:outline-none focus:border-[#EE4D2D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Stok
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    placeholder="25"
                    className="w-full h-12 px-3.5 rounded-xl border border-zinc-200 text-sm tabular-nums focus:outline-none focus:border-[#EE4D2D]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-700">
                  Foto Produk (Upload atau Pilih Galeri)
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0">
                    <ProductImage src={prodImage} alt="Preview produk" />
                  </div>
                  <label className="flex-1 min-h-[48px] px-4 rounded-xl border border-dashed border-zinc-300 hover:border-[#EE4D2D] flex items-center justify-center text-xs font-semibold text-zinc-700 cursor-pointer bg-zinc-50">
                    <span>Pilih Foto dari HP / Laptop</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="sr-only"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-6 gap-1.5 pt-1">
                  {PRESET_GALLERY_IMAGES.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => setProdImage(preset.url)}
                      title={preset.label}
                      className={`aspect-square rounded-lg overflow-hidden border-2 cursor-pointer ${
                        prodImage === preset.url
                          ? 'border-[#EE4D2D]'
                          : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Variasi Warna (pisah koma)
                  </label>
                  <input
                    type="text"
                    value={prodColors}
                    onChange={(e) => setProdColors(e.target.value)}
                    placeholder="Hitam, Putih, Pink"
                    className="w-full h-11 px-3 rounded-xl border border-zinc-200 text-xs sm:text-sm focus:outline-none focus:border-[#EE4D2D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Ukuran (pisah koma)
                  </label>
                  <input
                    type="text"
                    value={prodSizes}
                    onChange={(e) => setProdSizes(e.target.value)}
                    placeholder="S, M, L, XL"
                    className="w-full h-11 px-3 rounded-xl border border-zinc-200 text-xs sm:text-sm focus:outline-none focus:border-[#EE4D2D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={prodMaterial}
                  onChange={(e) => setProdMaterial(e.target.value)}
                  placeholder="Bahan (Katun)"
                  className="h-11 px-3 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-[#EE4D2D]"
                />
                <input
                  type="text"
                  value={prodWeight}
                  onChange={(e) => setProdWeight(e.target.value)}
                  placeholder="Berat (300g)"
                  className="h-11 px-3 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-[#EE4D2D]"
                />
                <input
                  type="text"
                  value={prodWarranty}
                  onChange={(e) => setProdWarranty(e.target.value)}
                  placeholder="Garansi (1 Thn)"
                  className="h-11 px-3 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-[#EE4D2D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Deskripsi Produk
                </label>
                <textarea
                  rows={3}
                  required
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Jelaskan spesifikasi, ukuran, dan keunggulan produk..."
                  className="w-full p-3.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#EE4D2D] resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-[#EE4D2D] hover:bg-[#D73B1C] text-white font-bold text-sm cursor-pointer"
              >
                Upload Produk ke VTC SHOP INDONESIA
              </button>
            </form>
              </>
            )}
          </section>

          {/* Seller's Product List */}
          <section className="lg:col-span-3 space-y-3">
            <h2 className="text-lg font-bold text-zinc-900">
              Etalase Produk Toko ({sellerProducts.length})
            </h2>
            {sellerProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center text-sm text-zinc-500">
                Belum ada produk di toko ini. Gunakan form di samping untuk upload produk pertama Anda.
              </div>
            ) : (
              <div className="space-y-3">
                {sellerProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-zinc-200 p-3.5 flex flex-wrap sm:flex-nowrap items-center gap-3.5"
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-100 shrink-0">
                      <ProductImage src={product.image} alt={product.name} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-zinc-500">
                        {product.category} ·{' '}
                        <span
                          className={
                            product.stock <= 10
                              ? 'text-rose-600 font-bold'
                              : 'text-zinc-600'
                          }
                        >
                          Stok {product.stock}
                        </span>{' '}
                        · Terjual {product.soldCount}
                      </p>
                      <h3 className="text-sm font-bold text-zinc-900 truncate">
                        {product.name}
                      </h3>
                      <p className="text-sm font-extrabold text-[#EE4D2D] tabular-nums">
                        {formatRupiah(product.price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          updateProductStock(product.id, product.stock + 10)
                        }
                        className="min-h-[38px] px-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#EE4D2D] text-xs font-bold cursor-pointer"
                      >
                        +10 Stok
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteProduct(product.id)}
                        aria-label={`Hapus ${product.name}`}
                        className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Sub-Tab: Buat Voucher Toko */}
      {subTab === 'voucher' && (
        <section className="max-w-xl bg-white rounded-2xl border border-zinc-200 p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <Ticket className="w-5 h-5 text-[#EE4D2D]" />
            <div>
              <h2 className="text-lg font-extrabold text-zinc-900">
                Buat Voucher Toko
              </h2>
              <p className="text-xs text-zinc-500">
                Pembeli dapat mengklaim voucher ini di halaman Produk, Toko Anda, dan menggabungkannya saat Checkout.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveVoucher} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Kode Voucher Toko (Huruf Kapital)
              </label>
              <input
                type="text"
                required
                value={vCode}
                onChange={(e) => setVCode(e.target.value.toUpperCase())}
                placeholder="Contoh: TOKO-HEMAT20"
                className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 font-mono text-sm uppercase focus:outline-none focus:border-[#EE4D2D]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Nama Promo Voucher
              </label>
              <input
                type="text"
                required
                value={vTitle}
                onChange={(e) => setVTitle(e.target.value)}
                placeholder={`Voucher Toko ${activeSeller.storeName} Rp 20.000`}
                className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#EE4D2D]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Potongan Harga (Rp)
                </label>
                <input
                  type="number"
                  min={1000}
                  required
                  value={vAmount}
                  onChange={(e) => setVAmount(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 text-sm tabular-nums focus:outline-none focus:border-[#EE4D2D]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Minimal Belanja (Rp)
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={vMinSpend}
                  onChange={(e) => setVMinSpend(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 text-sm tabular-nums focus:outline-none focus:border-[#EE4D2D]"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-[#EE4D2D] hover:bg-[#D73B1C] text-white font-bold text-sm cursor-pointer"
            >
              Simpan & Terbitkan Voucher Toko
            </button>
          </form>
        </section>
      )}

      {/* Sub-Tab: Dekorasi Toko / Banner Toko */}
      {subTab === 'decor' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <section className="bg-white rounded-2xl border border-zinc-200 p-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <Palette className="w-5 h-5 text-[#EE4D2D]" />
              <div>
                <h2 className="text-lg font-extrabold text-zinc-900">
                  Dekorasi Toko & Banner Toko
                </h2>
                <p className="text-xs text-zinc-500">
                  Atur warna tema, judul banner, dan deskripsi etalase toko Anda.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveDecoration} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Judul Banner Toko
                </label>
                <input
                  type="text"
                  required
                  value={decorTitle}
                  onChange={(e) => setDecorTitle(e.target.value)}
                  placeholder="Contoh: MEGA PROMO VTC OFFICIAL"
                  className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#EE4D2D]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Sub-judul / Tagline Banner
                </label>
                <input
                  type="text"
                  value={decorSubtitle}
                  onChange={(e) => setDecorSubtitle(e.target.value)}
                  placeholder="Contoh: Gratis Ongkir XTRA & Garansi Resmi"
                  className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#EE4D2D]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Warna Banner Toko
                  </label>
                  <div className="flex items-center gap-2">
                    {['#111113', '#9A3412', '#064E3B', '#1E3A8A', '#831843'].map(
                      (c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setDecorBannerColor(c)}
                          className={`w-8 h-8 rounded-lg border-2 cursor-pointer ${
                            decorBannerColor === c
                              ? 'border-[#EE4D2D] scale-110'
                              : 'border-white'
                          }`}
                          style={{ backgroundColor: c }}
                          aria-label={`Pilih warna banner ${c}`}
                        />
                      )
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Warna Avatar Toko
                  </label>
                  <div className="flex items-center gap-2">
                    {['#EE4D2D', '#059669', '#0284C7', '#D97706', '#DB2777'].map(
                      (c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setDecorAvatarColor(c)}
                          className={`w-8 h-8 rounded-lg border-2 cursor-pointer ${
                            decorAvatarColor === c
                              ? 'border-zinc-900 scale-110'
                              : 'border-white'
                          }`}
                          style={{ backgroundColor: c }}
                          aria-label={`Pilih warna avatar ${c}`}
                        />
                      )
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Deskripsi Profil Toko
                </label>
                <textarea
                  rows={3}
                  value={decorDesc}
                  onChange={(e) => setDecorDesc(e.target.value)}
                  className="w-full p-3 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#EE4D2D] resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-[#EE4D2D] hover:bg-[#D73B1C] text-white font-bold text-sm cursor-pointer"
              >
                Simpan Dekorasi Toko
              </button>
            </form>
          </section>

          {/* Live Preview Banner Toko */}
          <section className="space-y-3">
            <p className="text-xs font-extrabold text-zinc-500 uppercase tracking-wide">
              Preview Tampilan Banner Toko Anda
            </p>
            <div
              className="rounded-3xl text-white p-5 sm:p-6 space-y-3 border border-white/15 shadow-lg"
              style={{ backgroundColor: decorBannerColor }}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg border-2 border-white/25 shrink-0"
                  style={{ backgroundColor: decorAvatarColor }}
                >
                  {activeSeller.storeName.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-extrabold text-orange-300 uppercase tracking-wider truncate">
                    {decorTitle || activeSeller.storeName}
                  </p>
                  <h3 className="text-lg font-extrabold truncate">
                    {activeSeller.storeName}
                  </h3>
                  <p className="text-xs text-white/80 truncate">
                    {decorSubtitle}
                  </p>
                </div>
              </div>
              <p className="text-xs text-white/80 leading-relaxed">
                {decorDesc}
              </p>
            </div>
          </section>
        </div>
      )}

      {/* Sub-Tab 3: Saldo Seller (Ditahan VTC SHOP INDONESIA & Bisa Dicairkan) */}
      {subTab === 'balance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-zinc-200 p-5 space-y-2">
              <p className="text-xs font-bold text-amber-700">
                Saldo Ditahan VTC SHOP INDONESIA (Escrow)
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tabular-nums">
                {formatRupiah(balances.heldBalance)}
              </p>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Dana dari pesanan yang masih diproses, dikirim, atau menunggu pelepasan oleh Admin VTC SHOP INDONESIA.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-emerald-200 p-5 space-y-2">
              <p className="text-xs font-bold text-emerald-700">
                Saldo Bisa Dicairkan
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700 tabular-nums">
                {formatRupiah(balances.availableBalance)}
              </p>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Dana yang sudah dilepas oleh Admin VTC SHOP INDONESIA dan siap ditarik ke rekening Anda.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <section className="bg-white rounded-2xl border border-zinc-200 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Banknote className="w-5 h-5 text-[#EE4D2D]" />
                <h3 className="text-base font-bold text-zinc-900">
                  Cairkan Saldo Penjualan
                </h3>
              </div>

              <form onSubmit={handleWithdrawSubmit} className="space-y-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-zinc-700">
                      Nominal Penarikan (Rp)
                    </label>
                    {balances.availableBalance > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          setWithdrawAmount(String(balances.availableBalance))
                        }
                        className="text-xs font-bold text-[#EE4D2D] hover:underline cursor-pointer"
                      >
                        Tarik Semua
                      </button>
                    )}
                  </div>
                  <input
                    type="number"
                    min={1000}
                    max={balances.availableBalance || undefined}
                    required
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Contoh: 100000"
                    className="w-full h-12 px-3.5 rounded-xl border border-zinc-200 text-sm tabular-nums focus:outline-none focus:border-[#EE4D2D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Rekening Bank / E-Wallet Tujuan
                  </label>
                  <input
                    type="text"
                    required
                    value={bankInfo}
                    onChange={(e) => setBankInfo(e.target.value)}
                    placeholder="Contoh: BCA 881029384 a.n. Andika"
                    className="w-full h-12 px-3.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#EE4D2D]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={balances.availableBalance <= 0}
                  className="w-full h-12 rounded-xl bg-[#EE4D2D] hover:bg-[#D73B1C] disabled:bg-zinc-200 disabled:text-zinc-500 text-white font-bold text-sm cursor-pointer"
                >
                  Cairkan Saldo Sekarang
                </button>
              </form>
            </section>

            <section className="bg-white rounded-2xl border border-zinc-200 p-5 space-y-3">
              <h3 className="text-base font-bold text-zinc-900">
                Riwayat Pencairan Dana
              </h3>
              {sellerWithdrawals.length === 0 ? (
                <p className="text-sm text-zinc-500 py-4">
                  Belum ada riwayat penarikan saldo.
                </p>
              ) : (
                <div className="divide-y divide-zinc-100">
                  {sellerWithdrawals.map((wd) => (
                    <div
                      key={wd.id}
                      className="py-3 flex items-center justify-between gap-2"
                    >
                      <div>
                        <p className="text-sm font-bold text-zinc-900">
                          {wd.bankInfo}
                        </p>
                        <p className="text-xs text-zinc-500 font-mono">
                          {wd.id} · {formatDateId(wd.createdAt)}
                        </p>
                      </div>
                      <span className="text-sm font-extrabold text-emerald-700 tabular-nums">
                        {formatRupiah(wd.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      )}

      {/* Sub-Tab 6: Chat Pembeli (Khusus Toko Milik Seller Ini) */}
      {subTab === 'chat' && (
        <section className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
          <div className="px-4 py-3.5 border-b border-zinc-100 flex flex-wrap items-center justify-between gap-2 bg-zinc-50/70">
            <div>
              <h2 className="text-base font-extrabold text-zinc-900 inline-flex items-center gap-2">
                <MessageSquareText className="w-5 h-5 text-[#EE4D2D]" />
                <span>Chat Pembeli untuk {activeSeller.storeName}</span>
              </h2>
              <p className="text-xs text-zinc-500">
                Balas langsung pertanyaan pembeli seputar stok, variasi, dan pengiriman produk toko Anda.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
              Hanya Chat Toko Anda
            </span>
          </div>

          <div className="p-4 space-y-3 bg-[#F7F7F5] min-h-[320px] max-h-[440px] overflow-y-auto">
            {mySellerChats.length === 0 ? (
              <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center space-y-1.5">
                <MessageSquareText className="w-9 h-9 text-zinc-300 mx-auto" />
                <p className="text-sm font-bold text-zinc-700">
                  Belum ada chat pembeli untuk toko Anda
                </p>
                <p className="text-xs text-zinc-500">
                  Saat pembeli klik &ldquo;Chat Seller&rdquo; di produk Anda, pesan mereka langsung masuk ke sini untuk Anda balas.
                </p>
              </div>
            ) : (
              mySellerChats.map((msg) => {
                const isSeller = msg.sender === 'seller';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      isSeller ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                        isSeller
                          ? 'bg-[#EE4D2D] text-white rounded-br-sm'
                          : 'bg-white border border-zinc-200 text-zinc-900 rounded-bl-sm'
                      }`}
                    >
                      {msg.productName && !isSeller && (
                        <p className="text-[10px] font-bold text-[#EE4D2D] mb-1">
                          Produk: {msg.productName}
                        </p>
                      )}
                      <p>{msg.text}</p>
                    </div>
                    <span className="text-[10px] text-zinc-400 mt-1 px-1">
                      {isSeller
                        ? `Seller (${activeSeller.storeName})`
                        : msg.buyerName || 'Pembeli'}{' '}
                      · {formatDateId(msg.createdAt)}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!sellerReplyText.trim()) return;
              replySellerChat(activeSeller.id, sellerReplyText);
              setSellerReplyText('');
            }}
            className="p-3 bg-white border-t border-zinc-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={sellerReplyText}
              onChange={(e) => setSellerReplyText(e.target.value)}
              placeholder={`Balas chat pembeli atas nama ${activeSeller.storeName}...`}
              className="flex-1 h-11 px-3.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#EE4D2D]"
            />
            <button
              type="submit"
              disabled={!sellerReplyText.trim()}
              className="min-h-[44px] px-4 rounded-xl bg-[#EE4D2D] hover:bg-[#D73B1C] disabled:bg-zinc-200 disabled:text-zinc-400 text-white font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Balas Pembeli</span>
            </button>
          </form>
        </section>
      )}
    </div>
  );
};
