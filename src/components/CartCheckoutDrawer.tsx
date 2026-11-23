import React, { useMemo, useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Truck,
  Banknote,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Ticket,
  Clock,
  Coins,
  MapPin,
} from 'lucide-react';
import { useMarketplace } from '../store/marketplaceStore';
import {
  COURIER_OPTIONS,
  CourierId,
  PAYMENT_METHODS,
  PaymentMethodId,
  formatRupiah,
} from '../types';
import { ProductImage } from './ProductImage';

interface CartCheckoutDrawerProps {
  open: boolean;
  initialStep?: 'cart' | 'checkout';
  onClose: () => void;
  onOrderSuccess: () => void;
}

const MAP_PINS = [
  { city: 'Jakarta Selatan', district: 'Kebayoran Baru', x: 112, y: 118, lat: -6.244, lng: 106.799 },
  { city: 'Bandung', district: 'Coblong', x: 128, y: 128, lat: -6.891, lng: 107.61 },
  { city: 'Semarang', district: 'Tembalang', x: 162, y: 124, lat: -7.05, lng: 110.44 },
  { city: 'Surabaya', district: 'Gubeng', x: 196, y: 126, lat: -7.275, lng: 112.75 },
  { city: 'Medan', district: 'Medan Baru', x: 48, y: 42, lat: 3.575, lng: 98.65 },
  { city: 'Makassar', district: 'Panakkukang', x: 248, y: 92, lat: -5.147, lng: 119.43 },
];

export const CartCheckoutDrawer: React.FC<CartCheckoutDrawerProps> = ({
  open,
  initialStep = 'cart',
  onClose,
  onOrderSuccess,
}) => {
  const {
    state,
    currentUser,
    updateCartQty,
    removeFromCart,
    placeOrder,
    addSavedAddress,
  } = useMarketplace();
  const [step, setStep] = useState<'cart' | 'checkout'>(initialStep);
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressCoords, setAddressCoords] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [courier, setCourier] = useState<CourierId>('VTC Express');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>('COD');
  const [paylaterTenor, setPaylaterTenor] = useState<1 | 3 | 6 | 12>(3);
  const [storeVoucherCode, setStoreVoucherCode] = useState<string>('');
  const [shippingVoucherCode, setShippingVoucherCode] = useState<string>('');
  const [vtvVoucherCode, setVtvVoucherCode] = useState<string>('');
  const [useCoins, setUseCoins] = useState<boolean>(false);
  const [insuranceProtected, setInsuranceProtected] = useState<boolean>(false);
  const [codConfirmed, setCodConfirmed] = useState<boolean>(false);
  const [formError, setFormError] = useState('');

  React.useEffect(() => {
    if (open) {
      setStep(initialStep);
      const primary = state.savedAddresses.find((a) => a.isPrimary) ?? state.savedAddresses[0];
      if (primary) {
        if (!buyerName) setBuyerName(primary.recipientName);
        if (!buyerPhone) setBuyerPhone(primary.phone);
        if (!buyerAddress) {
          setBuyerAddress(`${primary.fullAddress}, ${primary.district}, ${primary.city}`);
        }
        if (!addressCity) setAddressCity(primary.city);
      }
    }
  }, [open, initialStep]);

  const cartDetails = useMemo(() => {
    return state.cart
      .map((item) => {
        const product = state.products.find((p) => p.id === item.productId);
        if (!product) return null;
        return { ...item, product };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [state.cart, state.products]);

  const subtotal = useMemo(
    () =>
      cartDetails.reduce(
        (sum, entry) => sum + entry.product.price * entry.quantity,
        0
      ),
    [cartDetails]
  );

  const uniqueSellersCount = useMemo(() => {
    const ids = new Set(cartDetails.map((d) => d.product.sellerId));
    return Math.max(1, ids.size);
  }, [cartDetails]);

  const cartSellerIds = useMemo(
    () => new Set(cartDetails.map((d) => d.product.sellerId)),
    [cartDetails]
  );

  const selectedCourier =
    COURIER_OPTIONS.find((c) => c.id === courier) ?? COURIER_OPTIONS[0];
  const baseShipping =
    cartDetails.length > 0 ? selectedCourier.fee * uniqueSellersCount : 0;

  const eligibleVouchers = useMemo(
    () => state.vouchers.filter((v) => !v.used && subtotal >= v.minSpend),
    [state.vouchers, subtotal]
  );

  const storeVouchers = useMemo(
    () =>
      eligibleVouchers.filter(
        (v) =>
          v.type === 'discount' &&
          (v.category === 'store' || Boolean(v.sellerId)) &&
          (!v.sellerId || cartSellerIds.has(v.sellerId))
      ),
    [eligibleVouchers, cartSellerIds]
  );

  const shippingVouchers = useMemo(
    () =>
      eligibleVouchers.filter(
        (v) => v.type === 'shipping' || v.category === 'shipping'
      ),
    [eligibleVouchers]
  );

  const vtvVouchers = useMemo(
    () =>
      eligibleVouchers.filter(
        (v) =>
          v.type === 'discount' &&
          v.category !== 'store' &&
          !v.sellerId
      ),
    [eligibleVouchers]
  );

  const chosenStoreVoucher = storeVouchers.find(
    (v) => v.code === storeVoucherCode
  );
  const chosenShippingVoucher = shippingVouchers.find(
    (v) => v.code === shippingVoucherCode
  );
  const chosenVtvVoucher = vtvVouchers.find((v) => v.code === vtvVoucherCode);

  const shippingDiscount = chosenShippingVoucher
    ? Math.min(baseShipping, chosenShippingVoucher.amount)
    : 0;
  const finalShipping = Math.max(0, baseShipping - shippingDiscount);

  const voucherDiscount = Math.min(
    subtotal,
    (chosenStoreVoucher?.amount || 0) + (chosenVtvVoucher?.amount || 0)
  );

  const coinsDiscount = useCoins
    ? Math.min(state.vtvCoins, Math.floor((subtotal - voucherDiscount) * 0.5))
    : 0;

  const codFee = paymentMethod === 'COD' && cartDetails.length > 0 ? 2000 : 0;

  const insuranceFee =
    insuranceProtected && subtotal > 0
      ? Math.max(1500, Math.round(subtotal * 0.01))
      : 0;

  const grandTotal = Math.max(
    0,
    subtotal + finalShipping + codFee + insuranceFee - voucherDiscount - coinsDiscount
  );
  const cashbackEstimate =
    subtotal > 0 ? Math.min(50000, Math.round(subtotal * 0.05)) : 0;

  if (!open) return null;

  const handleClose = () => {
    setStep('cart');
    setFormError('');
    onClose();
  };

  const handleFillAccount = () => {
    if (currentUser?.name) setBuyerName(currentUser.name);
    if (currentUser?.phone) setBuyerPhone(currentUser.phone);
    setFormError('');
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName.trim() || !buyerPhone.trim() || !buyerAddress.trim()) {
      setFormError(
        'Mohon lengkapi nama penerima, nomor HP, dan alamat pengiriman.'
      );
      return;
    }
    if (paymentMethod === 'COD' && !codConfirmed) {
      setFormError(
        'Centang konfirmasi pembayaran COD di bawah terlebih dahulu sebelum membuat pesanan.'
      );
      return;
    }
    const selectedCodes = [
      chosenStoreVoucher?.code,
      chosenShippingVoucher?.code,
      chosenVtvVoucher?.code,
    ].filter((c): c is string => Boolean(c));

    const orders = placeOrder({
      buyerName,
      buyerPhone,
      buyerAddress,
      addressCity: addressCity || undefined,
      addressCoords,
      courier,
      paymentMethod,
      paylaterTenor: paymentMethod === 'PayLater' ? paylaterTenor : undefined,
      voucherCodes: selectedCodes,
      useCoins,
      insuranceProtected,
      codConfirmed,
    });
    if (orders.length > 0) {
      setStep('cart');
      setFormError('');
      setStoreVoucherCode('');
      setShippingVoucherCode('');
      setVtvVoucherCode('');
      setUseCoins(false);
      setCodConfirmed(false);
      onClose();
      onOrderSuccess();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 flex items-end sm:items-stretch sm:justify-end"
      onClick={handleClose}
    >
      <div
        className="bg-white w-full sm:max-w-md h-[92vh] sm:h-full rounded-t-3xl sm:rounded-none flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden w-10 h-1.5 bg-zinc-300 rounded-full mx-auto mt-3 shrink-0" />

        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 shrink-0">
          <div className="flex items-center gap-2">
            {step === 'checkout' && (
              <button
                type="button"
                onClick={() => setStep('cart')}
                aria-label="Kembali ke keranjang"
                className="min-w-[44px] min-h-[44px] -ml-2 flex items-center justify-center rounded-xl text-zinc-700 hover:bg-zinc-100 cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-lg font-bold text-zinc-900">
              {step === 'cart'
                ? `Keranjang (${cartDetails.length})`
                : 'Checkout & Pembayaran'}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Tutup keranjang"
            className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {cartDetails.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-[#EE4D2D]">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="text-base font-bold text-zinc-900">
                Keranjang masih kosong
              </p>
              <p className="text-sm text-zinc-500 max-w-xs">
                Belanja minimal Rp 150.000 otomatis dapat Bebas Ongkir & COD Garansi VTC SHOP INDONESIA!
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="min-h-[46px] px-6 rounded-xl bg-[#EE4D2D] text-white font-semibold text-sm hover:bg-[#D73B1C] cursor-pointer"
              >
                Lihat Produk
              </button>
            </div>
          ) : step === 'cart' ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-orange-50 border border-orange-200 px-3.5 py-2.5 text-xs font-semibold text-zinc-800 flex items-center justify-between gap-2">
                <span>Ongkir Reguler COD Flat:</span>
                <strong className="text-[#EE4D2D] tabular-nums">Rp 10.000</strong>
              </div>

              {cartDetails.map(({ product, quantity, selectedColor, selectedSize }) => {
                const variantText = [selectedColor, selectedSize]
                  .filter(Boolean)
                  .join(' · ');
                return (
                  <div
                    key={`${product.id}-${selectedColor || ''}-${selectedSize || ''}`}
                    className="flex gap-3.5 p-3 rounded-2xl border border-zinc-200 bg-white"
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-100 shrink-0">
                      <ProductImage
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <p className="text-xs text-zinc-500 truncate">
                          {product.sellerName}
                        </p>
                        <h3 className="text-sm font-semibold text-zinc-900 line-clamp-2 leading-snug">
                          {product.name}
                        </h3>
                        {variantText && (
                          <p className="text-[11px] font-semibold text-zinc-600 mt-0.5">
                            Variasi: {variantText}
                          </p>
                        )}
                        <p className="text-xs text-zinc-500 tabular-nums mt-1">
                          {formatRupiah(product.price)} / pcs ·{' '}
                          <strong className="text-[#EE4D2D]">
                            Total {formatRupiah(product.price * quantity)}
                          </strong>
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              updateCartQty(
                                product.id,
                                quantity - 1,
                                selectedColor,
                                selectedSize
                              )
                            }
                            aria-label="Kurangi"
                            className="min-w-[38px] min-h-[38px] rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold tabular-nums">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateCartQty(
                                product.id,
                                quantity + 1,
                                selectedColor,
                                selectedSize
                              )
                            }
                            aria-label="Tambah"
                            className="min-w-[38px] min-h-[38px] rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeFromCart(
                              product.id,
                              selectedColor,
                              selectedSize
                            )
                          }
                          aria-label="Hapus dari keranjang"
                          className="min-h-[36px] px-2.5 inline-flex items-center gap-1 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <form
              id="vtv-checkout-form"
              onSubmit={handleCheckoutSubmit}
              className="space-y-5"
            >
              {/* Address section + Saved Addresses + Pilih di Peta */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-zinc-900">
                    Alamat Pengiriman
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowMapPicker((v) => !v)}
                      className="text-xs font-bold text-[#EE4D2D] inline-flex items-center gap-1 hover:underline py-1 cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{showMapPicker ? 'Tutup Peta' : 'Pilih di Peta'}</span>
                    </button>
                    {(currentUser?.name || currentUser?.phone) && (
                      <button
                        type="button"
                        onClick={handleFillAccount}
                        className="text-xs font-semibold text-zinc-700 hover:underline py-1 cursor-pointer"
                      >
                        Isi Data Akun
                      </button>
                    )}
                  </div>
                </div>

                {state.savedAddresses.length > 0 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                    {state.savedAddresses.map((addr) => (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => {
                          setBuyerName(addr.recipientName);
                          setBuyerPhone(addr.phone);
                          setBuyerAddress(`${addr.fullAddress}, ${addr.district}, ${addr.city}`);
                          setAddressCity(addr.city);
                          setAddressCoords({ lat: addr.lat, lng: addr.lng });
                        }}
                        className="px-3 py-1.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:border-[#EE4D2D] text-[11px] font-bold text-zinc-800 whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        📍 {addr.label} ({addr.city})
                      </button>
                    ))}
                  </div>
                )}

                {showMapPicker && (
                  <div className="rounded-2xl border border-orange-200 bg-orange-50/50 p-3 space-y-2">
                    <p className="text-[11px] font-bold text-zinc-800">
                      Ketuk Pin Kota di Peta Pengiriman Indonesia:
                    </p>
                    <svg
                      viewBox="0 0 320 155"
                      className="w-full h-36 rounded-xl bg-sky-50 border border-sky-200"
                    >
                      <path
                        d="M20,30 L75,65 L65,92 L25,52 Z"
                        fill="#d1fae5"
                        stroke="#6ee7b7"
                      />
                      <path
                        d="M88,112 L210,122 L208,136 L86,128 Z"
                        fill="#d1fae5"
                        stroke="#6ee7b7"
                      />
                      <path
                        d="M140,42 L196,42 L194,88 L138,85 Z"
                        fill="#d1fae5"
                        stroke="#6ee7b7"
                      />
                      <path
                        d="M225,54 L268,54 L262,102 L228,96 Z"
                        fill="#d1fae5"
                        stroke="#6ee7b7"
                      />
                      {MAP_PINS.map((pin) => {
                        const selected = addressCity === pin.city;
                        return (
                          <g
                            key={pin.city}
                            onClick={() => {
                              setAddressCity(pin.city);
                              setAddressCoords({ lat: pin.lat, lng: pin.lng });
                              if (!buyerAddress.trim()) {
                                setBuyerAddress(`Kec. ${pin.district}, Kota ${pin.city}`);
                              }
                            }}
                            className="cursor-pointer"
                          >
                            <circle
                              cx={pin.x}
                              cy={pin.y}
                              r={selected ? 7 : 5}
                              fill={selected ? '#EE4D2D' : '#111113'}
                            />
                            <text
                              x={pin.x}
                              y={pin.y - 9}
                              textAnchor="middle"
                              className="fill-zinc-800 text-[9px] font-bold"
                            >
                              {pin.city.split(' ')[0]}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                    {addressCoords && (
                      <p className="text-[11px] font-semibold text-emerald-700 tabular-nums">
                        Titik GPS Dipilih: {addressCity} ({addressCoords.lat.toFixed(3)},{' '}
                        {addressCoords.lng.toFixed(3)})
                      </p>
                    )}
                  </div>
                )}

                <input
                  type="text"
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="Nama Penerima"
                  className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#EE4D2D]"
                />
                <input
                  type="tel"
                  required
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="No. HP / WhatsApp Aktif"
                  className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#EE4D2D]"
                />
                <textarea
                  rows={2}
                  required
                  value={buyerAddress}
                  onChange={(e) => setBuyerAddress(e.target.value)}
                  placeholder="Alamat Lengkap (Jalan, No. Rumah, Kecamatan, Kota)"
                  className="w-full p-3 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#EE4D2D] resize-none"
                />
                {buyerName.trim() && buyerPhone.trim() && buyerAddress.trim() && (
                  <button
                    type="button"
                    onClick={() =>
                      addSavedAddress({
                        label: addressCity ? `Alamat ${addressCity}` : 'Alamat Baru',
                        recipientName: buyerName.trim(),
                        phone: buyerPhone.trim(),
                        fullAddress: buyerAddress.trim(),
                        city: addressCity || 'Indonesia',
                        district: 'Utama',
                        lat: addressCoords?.lat ?? -6.244,
                        lng: addressCoords?.lng ?? 106.799,
                        isPrimary: false,
                      })
                    }
                    className="text-[11px] font-bold text-[#EE4D2D] hover:underline cursor-pointer"
                  >
                    + Simpan ke Daftar Alamat
                  </button>
                )}
              </div>

              {/* Courier Selection */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#EE4D2D]" />
                  Ekspedisi (J&amp;T, SPX, AnterAja, SiCepat, VTC Express)
                </h3>
                <div className="space-y-2">
                  {COURIER_OPTIONS.map((option) => {
                    const active = courier === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setCourier(option.id)}
                        className={`w-full min-h-[54px] px-3.5 py-2.5 rounded-2xl border text-left flex items-center justify-between cursor-pointer ${
                          active
                            ? 'border-[#EE4D2D] bg-orange-50/60 ring-1 ring-[#EE4D2D]'
                            : 'border-zinc-200 bg-white'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-bold text-zinc-900">
                            {option.name} ·{' '}
                            <span className="font-medium text-zinc-500">
                              {option.service}
                            </span>
                          </p>
                          <p className="text-xs text-zinc-500">
                            Estimasi {option.eta}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-zinc-900 tabular-nums">
                            {formatRupiah(option.fee * uniqueSellersCount)}
                          </p>
                          {active && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#EE4D2D]">
                              <CheckCircle2 className="w-3 h-3" /> Dipilih
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3 Voucher Sekaligus (Toko + Gratis Ongkir + VTC) & Pakai Koin */}
              <div className="space-y-3 rounded-2xl border border-orange-200 bg-orange-50/40 p-3.5">
                <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
                  <Ticket className="w-4 h-4 text-[#EE4D2D]" />
                  Pakai 3 Voucher Sekaligus + VTC Coins
                </h3>

                {/* 1. Voucher Toko */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                    1. Voucher Toko
                  </label>
                  <select
                    value={storeVoucherCode}
                    onChange={(e) => setStoreVoucherCode(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-zinc-200 text-xs bg-white"
                  >
                    <option value="">
                      {storeVouchers.length > 0
                        ? '-- Pilih Voucher Toko --'
                        : 'Tidak ada voucher toko yang memenuhi min. belanja'}
                    </option>
                    {storeVouchers.map((v) => (
                      <option key={v.code} value={v.code}>
                        {v.code} — Hemat {formatRupiah(v.amount)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Voucher Gratis Ongkir */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                    2. Voucher Gratis Ongkir XTRA
                  </label>
                  <select
                    value={shippingVoucherCode}
                    onChange={(e) => setShippingVoucherCode(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-zinc-200 text-xs bg-white"
                  >
                    <option value="">
                      {shippingVouchers.length > 0
                        ? '-- Pilih Voucher Gratis Ongkir --'
                        : 'Belum ada voucher ongkir memenuhi syarat'}
                    </option>
                    {shippingVouchers.map((v) => (
                      <option key={v.code} value={v.code}>
                        {v.code} — Potongan Ongkir {formatRupiah(v.amount)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Voucher VTC */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                    3. Voucher VTC SHOP INDONESIA
                  </label>
                  <select
                    value={vtvVoucherCode}
                    onChange={(e) => setVtvVoucherCode(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-zinc-200 text-xs bg-white"
                  >
                    <option value="">
                      {vtvVouchers.length > 0
                        ? '-- Pilih Voucher VTC --'
                        : 'Belum ada voucher VTC memenuhi syarat'}
                    </option>
                    {vtvVouchers.map((v) => (
                      <option key={v.code} value={v.code}>
                        {v.code} — Hemat {formatRupiah(v.amount)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Toggle Pakai Koin */}
                <button
                  type="button"
                  disabled={state.vtvCoins <= 0}
                  onClick={() => setUseCoins((v) => !v)}
                  className={`w-full min-h-[46px] px-3 py-2 rounded-xl border flex items-center justify-between gap-2 text-left cursor-pointer ${
                    useCoins
                      ? 'border-amber-400 bg-amber-50'
                      : 'border-zinc-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Coins className="w-4 h-4 text-amber-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-zinc-900">
                        Tukarkan VTC Coins ({state.vtvCoins.toLocaleString('id-ID')} Koin)
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        {useCoins
                          ? `Hemat ${formatRupiah(coinsDiscount)} diterapkan`
                          : 'Aktifkan untuk potong total belanja'}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold shrink-0 ${
                      useCoins
                        ? 'bg-[#EE4D2D] text-white'
                        : 'bg-zinc-100 text-zinc-700'
                    }`}
                  >
                    {useCoins ? 'AKTIF' : 'PAKAI'}
                  </span>
                </button>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
                  <Banknote className="w-4 h-4 text-[#EE4D2D]" />
                  Pembayaran (VTC Pay, PayLater 0%, Transfer, COD, Kartu)
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map((pm) => {
                    const active = paymentMethod === pm.id;
                    return (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMethod(pm.id)}
                        className={`min-h-[54px] p-2.5 rounded-xl border text-left cursor-pointer ${
                          active
                            ? 'border-[#EE4D2D] bg-orange-50/70 ring-1 ring-[#EE4D2D]'
                            : 'border-zinc-200 bg-white hover:border-zinc-300'
                        }`}
                      >
                        <p className="text-xs font-extrabold text-zinc-900 truncate">
                          {pm.label}
                        </p>
                        <p className="text-[10px] text-zinc-500 truncate">
                          {pm.id === 'VTCPay'
                            ? `Saldo ${formatRupiah(state.vtvpayBalance)}`
                            : pm.group}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* PayLater Cicilan 0% sampai 12 Bulan */}
                {paymentMethod === 'PayLater' && (
                  <div className="rounded-2xl border border-[#EE4D2D]/30 bg-orange-50/70 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-extrabold text-zinc-900">
                        Pilih Tenor PayLater Cicilan 0% (s/d 12 Bulan)
                      </p>
                      <span className="px-2 py-0.5 rounded-md bg-[#EE4D2D] text-white text-[10px] font-extrabold">
                        BUNGA 0%
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {([1, 3, 6, 12] as const).map((tenor) => {
                        const activeTenor = paylaterTenor === tenor;
                        const perMonth = Math.ceil(grandTotal / tenor);
                        return (
                          <button
                            key={tenor}
                            type="button"
                            onClick={() => setPaylaterTenor(tenor)}
                            className={`p-2 rounded-xl border text-center cursor-pointer ${
                              activeTenor
                                ? 'border-[#EE4D2D] bg-white ring-1 ring-[#EE4D2D]'
                                : 'border-orange-200 bg-white/70 hover:bg-white'
                            }`}
                          >
                            <p className="text-xs font-extrabold text-zinc-900">
                              {tenor}×
                            </p>
                            <p className="text-[10px] font-semibold text-[#EE4D2D] tabular-nums truncate">
                              {formatRupiah(perMonth)}
                            </p>
                            <p className="text-[9px] text-zinc-500">
                              /bulan 0%
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* COD Confirmation Box */}
                {paymentMethod === 'COD' && (
                  <div className="rounded-2xl border border-amber-300 bg-amber-50/80 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-extrabold text-amber-950">
                      <span>Bayar di Tempat (COD)</span>
                      <span className="text-[#EE4D2D] tabular-nums">
                        Biaya Penanganan {formatRupiah(codFee)}
                      </span>
                    </div>
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={codConfirmed}
                        onChange={(e) => {
                          setCodConfirmed(e.target.checked);
                          setFormError('');
                        }}
                        className="mt-0.5 w-4 h-4 accent-[#EE4D2D] shrink-0"
                      />
                      <span className="text-[11px] font-semibold text-zinc-800 leading-relaxed">
                        Saya setuju membayar tunai{' '}
                        <strong className="text-[#EE4D2D] tabular-nums">
                          {formatRupiah(grandTotal)}
                        </strong>{' '}
                        kepada kurir saat paket tiba (uang aman dilindungi Garansi VTC).
                      </span>
                    </label>
                  </div>
                )}

                {/* Cashback Langsung 5% Banner */}
                <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-3.5 py-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-amber-950">
                      Cashback Langsung 5% ke Saldo VTC Pay
                    </p>
                    <p className="text-[11px] text-amber-800">
                      Otomatis cair setelah pesanan selesai dibuat (maks. Rp 50rb)
                    </p>
                  </div>
                  <span className="text-xs font-extrabold text-[#EE4D2D] tabular-nums shrink-0">
                    +{formatRupiah(cashbackEstimate)}
                  </span>
                </div>
              </div>

              {/* Asuransi Barang Hilang/Rusak 100% */}
              <label className="rounded-2xl border border-blue-200 bg-blue-50/70 p-3.5 flex items-center justify-between gap-3 cursor-pointer">
                <div className="space-y-0.5">
                  <p className="text-xs font-extrabold text-blue-950 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    Asuransi Barang Hilang / Rusak (Ganti Rugi 100%)
                  </p>
                  <p className="text-[11px] text-blue-800">
                    Proteksi pengiriman 100% cair ke VTC Pay (+{formatRupiah(insuranceFee || 1500)})
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={insuranceProtected}
                  onChange={(e) => setInsuranceProtected(e.target.checked)}
                  className="w-5 h-5 accent-[#EE4D2D] shrink-0"
                />
              </label>

              {/* COD Garansi & Garansi Tepat Waktu Info */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5 space-y-1.5">
                <p className="text-xs font-extrabold text-emerald-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  COD GARANSI: Uang Ditahan Dulu Baru Dibayar
                </p>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Pembayaran Anda dijaga Escrow VTC SHOP INDONESIA dan baru diteruskan ke Seller setelah paket dikonfirmasi diterima.
                </p>
                <p className="text-[11px] font-bold text-emerald-900 flex items-center gap-1 pt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                  Garansi Tepat Waktu: Telat tiba dapat Voucher Rp 20.000!
                </p>
              </div>

              {formError && (
                <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2.5">
                  {formError}
                </p>
              )}
            </form>
          )}
        </div>

        {/* Drawer Footer */}
        {cartDetails.length > 0 && (
          <div className="p-5 border-t border-zinc-200 bg-white space-y-3 shrink-0">
            {step === 'cart' ? (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-600">Subtotal Produk</span>
                  <span className="text-lg font-extrabold text-[#EE4D2D] tabular-nums">
                    {formatRupiah(subtotal)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('checkout')}
                  className="w-full h-12 rounded-xl bg-[#EE4D2D] hover:bg-[#D73B1C] text-white font-bold text-sm cursor-pointer"
                >
                  Lanjut Checkout ({cartDetails.length} item)
                </button>
              </>
            ) : (
              <>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-zinc-600">
                    <span>Subtotal Produk</span>
                    <span className="tabular-nums">{formatRupiah(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>Ongkir ({courier})</span>
                    <span className="tabular-nums">
                      {finalShipping === 0
                        ? 'Rp 0 (Bebas Ongkir)'
                        : formatRupiah(finalShipping)}
                    </span>
                  </div>
                  {codFee > 0 && (
                    <div className="flex justify-between text-amber-800 font-semibold">
                      <span>Biaya Penanganan COD</span>
                      <span className="tabular-nums">{formatRupiah(codFee)}</span>
                    </div>
                  )}
                  {insuranceFee > 0 && (
                    <div className="flex justify-between text-blue-700 font-semibold">
                      <span>Asuransi 100%</span>
                      <span className="tabular-nums">{formatRupiah(insuranceFee)}</span>
                    </div>
                  )}
                  {voucherDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Diskon Voucher</span>
                      <span className="tabular-nums">
                        -{formatRupiah(voucherDiscount)}
                      </span>
                    </div>
                  )}
                  {coinsDiscount > 0 && (
                    <div className="flex justify-between text-amber-700 font-semibold">
                      <span>Tukar VTC Coins</span>
                      <span className="tabular-nums">
                        -{formatRupiah(coinsDiscount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Cashback Langsung (5%)</span>
                    <span className="tabular-nums">
                      +{formatRupiah(cashbackEstimate)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1.5 border-t border-zinc-100">
                    <div>
                      <span className="font-bold text-zinc-900 block">
                        Total ({paymentMethod}
                        {paymentMethod === 'PayLater' ? ` ${paylaterTenor}× 0%` : ''})
                      </span>
                      {paymentMethod === 'PayLater' && (
                        <span className="text-[10px] text-zinc-500 tabular-nums">
                          Cicilan {formatRupiah(Math.ceil(grandTotal / paylaterTenor))}/bln
                        </span>
                      )}
                    </div>
                    <span className="text-lg font-extrabold text-[#EE4D2D] tabular-nums">
                      {formatRupiah(grandTotal)}
                    </span>
                  </div>
                </div>
                <button
                  type="submit"
                  form="vtv-checkout-form"
                  className="w-full h-12 rounded-xl bg-[#EE4D2D] hover:bg-[#D73B1C] text-white font-bold text-sm cursor-pointer"
                >
                  Buat Pesanan · {formatRupiah(grandTotal)}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
