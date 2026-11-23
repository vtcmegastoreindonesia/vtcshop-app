import React, { useMemo, useState } from 'react';
import {
  Package,
  Truck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Clock,
  RotateCcw,
  X,
  Ticket,
  Wallet,
  Coins,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  Star,
  FileText,
  Flag,
  MapPin,
  UploadCloud,
  Store,
} from 'lucide-react';
import { useMarketplace } from '../store/marketplaceStore';
import { Order, OrderStatus, formatDateId, formatRupiah } from '../types';
import { ProductImage } from './ProductImage';
import { VtcLogo } from './VtcLogo';

function resizeReturnPhotoToDataUrl(file: File): Promise<string> {
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

type OrderFilterValue = 'Semua' | 'Diproses' | 'Dikirim' | 'Selesai' | 'Komplain';

const ORDER_FILTERS: { label: string; value: OrderFilterValue }[] = [
  { label: 'Semua', value: 'Semua' },
  { label: 'Diproses', value: 'Diproses' },
  { label: 'Dikirim', value: 'Dikirim' },
  { label: 'Selesai', value: 'Selesai' },
  { label: 'Komplain / Retur', value: 'Komplain' },
];

export const BuyerOrdersView: React.FC = () => {
  const {
    state,
    currentUser,
    addToCart,
    confirmOrderReceived,
    submitComplaint,
    submitOneClickRefund,
    markOrderReviewSubmitted,
    addProductReview,
    submitFraudReport,
    claimLateVoucher,
    showToast,
  } = useMarketplace();
  const [filter, setFilter] = useState<OrderFilterValue>('Semua');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [complaintOrder, setComplaintOrder] = useState<Order | null>(null);
  const [complaintType, setComplaintType] = useState<'Komplain' | 'Return' | 'Refund'>('Komplain');
  const [complaintText, setComplaintText] = useState('');
  const [returnPhoto, setReturnPhoto] = useState('');
  const [expandedTimelineId, setExpandedTimelineId] = useState<string | null>(null);
  const [showVoucherList, setShowVoucherList] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [ratingOrder, setRatingOrder] = useState<Order | null>(null);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

  const activeVouchers = useMemo(
    () => state.vouchers.filter((v) => !v.used),
    [state.vouchers]
  );

  const totalSpent = useMemo(
    () =>
      state.orders
        .filter((o) => o.status !== 'Dana Dikembalikan')
        .reduce((sum, o) => sum + o.totalAmount, 0),
    [state.orders]
  );

  const filteredOrders = useMemo(() => {
    if (filter === 'Semua') return state.orders;
    if (filter === 'Diproses') {
      return state.orders.filter(
        (o) =>
          o.status === 'Diproses' ||
          o.status === 'Dipesan' ||
          o.status === 'Dibayar' ||
          o.status === 'Dikemas'
      );
    }
    if (filter === 'Dikirim') {
      return state.orders.filter(
        (o) => o.status === 'Dikirim' || o.status === 'Sampai'
      );
    }
    if (filter === 'Selesai') {
      return state.orders.filter(
        (o) => o.status === 'Selesai' || o.status === 'Diterima'
      );
    }
    return state.orders.filter(
      (o) => o.status === 'Komplain' || o.status === 'Dana Dikembalikan'
    );
  }, [state.orders, filter]);

  const handleCopyResi = (resi: string, orderId: string) => {
    navigator.clipboard?.writeText(resi).catch(() => {});
    setCopiedId(orderId);
    showToast(`No. Resi ${resi} disalin`, 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReturnPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await resizeReturnPhotoToDataUrl(file);
      setReturnPhoto(dataUrl);
      showToast('Foto bukti retur berhasil dilampirkan');
    } catch {
      showToast('Gagal memuat foto retur', 'warning');
    }
  };

  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintOrder || !complaintText.trim()) return;
    submitComplaint(
      complaintOrder.id,
      complaintText,
      complaintType,
      returnPhoto || undefined
    );
    setComplaintOrder(null);
    setComplaintText('');
    setReturnPhoto('');
  };

  const handleBuyAgain = (order: Order) => {
    order.items.forEach((item) => {
      addToCart(
        item.productId,
        item.quantity,
        item.selectedColor,
        item.selectedSize
      );
    });
  };

  const renderStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'Dipesan':
      case 'Dibayar':
      case 'Dikemas':
      case 'Diproses':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
            <Clock className="w-3.5 h-3.5" /> Diproses
          </span>
        );
      case 'Dikirim':
      case 'Sampai':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-lg">
            <Truck className="w-3.5 h-3.5" /> Dikirim
          </span>
        );
      case 'Selesai':
      case 'Diterima':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
            <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
          </span>
        );
      case 'Komplain':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
            <AlertCircle className="w-3.5 h-3.5" /> Komplain / Retur
          </span>
        );
      case 'Dana Dikembalikan':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-700 bg-zinc-100 border border-zinc-300 px-2.5 py-1 rounded-lg">
            <RotateCcw className="w-3.5 h-3.5" /> Dana Dikembalikan
          </span>
        );
    }
  };

  const getProgressStep = (status: OrderStatus) => {
    if (
      status === 'Dipesan' ||
      status === 'Dibayar' ||
      status === 'Diproses' ||
      status === 'Dikemas'
    ) {
      return 1;
    }
    if (status === 'Dikirim') return 2;
    if (status === 'Sampai') return 3;
    if (status === 'Selesai' || status === 'Diterima') return 4;
    return 0;
  };

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900">
          Pesanan Saya & Lacak Paket
        </h1>
        <p className="text-sm text-zinc-600">
          Pantau status pesanan Anda: Diproses &gt; Dikirim &gt; Sampai &gt; Selesai, lengkap dengan Pengirim, No. Resi, Retur &amp; Garansi VTC.
        </p>
      </div>

      {/* Saldo VTC Pay, Saldo Koin, Voucher Saya & Riwayat Summary */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-zinc-200 p-3.5">
          <p className="text-[11px] font-bold text-zinc-500 inline-flex items-center gap-1">
            <Wallet className="w-3.5 h-3.5 text-[#EE4D2D]" /> Saldo VTC Pay
          </p>
          <p className="text-base font-extrabold text-zinc-900 tabular-nums mt-0.5">
            {formatRupiah(state.vtvpayBalance)}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-200 p-3.5">
          <p className="text-[11px] font-bold text-zinc-500 inline-flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-amber-500" /> Saldo VTC Coins
          </p>
          <p className="text-base font-extrabold text-zinc-900 tabular-nums mt-0.5">
            {state.vtvCoins.toLocaleString('id-ID')} Koin
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowVoucherList((v) => !v)}
          className="bg-white rounded-2xl border border-zinc-200 hover:border-[#EE4D2D] p-3.5 text-left cursor-pointer"
        >
          <p className="text-[11px] font-bold text-zinc-500 inline-flex items-center gap-1">
            <Ticket className="w-3.5 h-3.5 text-[#EE4D2D]" /> Voucher Saya
          </p>
          <p className="text-base font-extrabold text-[#EE4D2D] tabular-nums mt-0.5">
            {activeVouchers.length} Aktif
          </p>
        </button>
        <div className="bg-white rounded-2xl border border-zinc-200 p-3.5">
          <p className="text-[11px] font-bold text-zinc-500 inline-flex items-center gap-1">
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" /> Total Belanja
          </p>
          <p className="text-base font-extrabold text-emerald-700 tabular-nums mt-0.5">
            {formatRupiah(totalSpent)}
          </p>
        </div>
      </section>

      {showVoucherList && (
        <section className="bg-orange-50/70 border border-orange-200 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-extrabold text-zinc-900">
              Voucher Saya ({activeVouchers.length} tersedia)
            </p>
            <button
              type="button"
              onClick={() => setShowVoucherList(false)}
              className="text-xs font-bold text-zinc-500 cursor-pointer"
            >
              Tutup
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {activeVouchers.map((v) => (
              <div
                key={v.code}
                className="bg-white rounded-xl border border-orange-200 p-3 text-xs"
              >
                <p className="font-mono font-extrabold text-[#EE4D2D]">
                  {v.code}
                </p>
                <p className="font-bold text-zinc-900">{v.title}</p>
                <p className="text-[11px] text-zinc-500 tabular-nums">
                  Hemat {formatRupiah(v.amount)} · Min. {formatRupiah(v.minSpend)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {ORDER_FILTERS.map((item) => {
          const active = filter === item.value;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={`min-h-[42px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                active
                  ? 'bg-[#EE4D2D] text-white'
                  : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200 p-10 text-center space-y-2">
          <Package className="w-10 h-10 text-zinc-300 mx-auto" />
          <p className="text-base font-bold text-zinc-800">Belum ada pesanan</p>
          <p className="text-sm text-zinc-500">
            Pesanan Anda akan muncul di sini setelah melakukan checkout.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const step = getProgressStep(order.status);
            const canAct = order.status === 'Dikirim' || order.status === 'Sampai';
            const isPastEta =
              new Date(order.estimatedDeliveryAt).getTime() < Date.now();

            return (
              <article
                key={order.id}
                className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 space-y-4"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-100">
                  <div className="space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                      <span className="font-mono font-semibold text-zinc-800">
                        {order.id}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{formatDateId(order.createdAt)}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-bold text-[#EE4D2D]">
                        {order.paymentMethod === 'COD'
                          ? 'COD GARANSI'
                          : order.paymentMethod}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-zinc-600">
                      Penerima: {order.buyerName} ({order.buyerPhone})
                    </p>
                    <p className="text-xs font-medium text-zinc-600 flex items-center gap-1">
                      <Store className="w-3.5 h-3.5 text-[#EE4D2D] shrink-0" />
                      <span>
                        Pengirim:{' '}
                        <strong className="text-zinc-800">
                          {order.senderName || order.items[0]?.sellerName || 'Toko VTC'}
                        </strong>
                        {order.senderAddress ? ` · ${order.senderAddress}` : ''}
                      </span>
                    </p>
                    {order.paymentCode && (
                      <p className="text-xs font-mono font-bold text-zinc-800">
                        Kode Bayar: {order.paymentCode}
                      </p>
                    )}
                  </div>
                  {renderStatusLabel(order.status)}
                </div>

                {/* 4-Step Tracking: Diproses -> Dikirim -> Sampai -> Selesai */}
                {step > 0 && (
                  <div className="bg-zinc-50 rounded-xl p-3.5 border border-zinc-100 space-y-3">
                    <div className="grid grid-cols-4 gap-1.5 text-center">
                      {[
                        { num: 1, title: 'Diproses' },
                        { num: 2, title: 'Dikirim' },
                        { num: 3, title: 'Sampai' },
                        { num: 4, title: 'Selesai' },
                      ].map((stage) => {
                        const reached = step >= stage.num;
                        return (
                          <div key={stage.num} className="space-y-1.5">
                            <div className="flex items-center justify-center">
                              <span
                                className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
                                  reached
                                    ? 'bg-[#EE4D2D] text-white'
                                    : 'bg-zinc-200 text-zinc-500'
                                }`}
                              >
                                {reached ? '✓' : stage.num}
                              </span>
                            </div>
                            <p
                              className={`text-[10px] sm:text-xs font-semibold ${
                                reached ? 'text-zinc-900' : 'text-zinc-400'
                              }`}
                            >
                              {stage.title}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Interactive Map Kurir Live when shipped or arrived */}
                    {(order.status === 'Dikirim' || order.status === 'Sampai') && (
                      <div className="rounded-xl bg-white border border-sky-200 p-3 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-extrabold text-sky-900 inline-flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#EE4D2D]" />
                            Map Kurir Live ({order.courier})
                          </span>
                          <span className="font-bold text-emerald-700 tabular-nums">
                            {order.status === 'Sampai'
                              ? '100% Tiba di Alamat'
                              : `${order.courierProgressPct || 75}% Menuju Tujuan`}
                          </span>
                        </div>
                        <svg viewBox="0 0 320 52" className="w-full h-12 rounded-lg bg-sky-50/70">
                          <line
                            x1="24"
                            y1="26"
                            x2="296"
                            y2="26"
                            stroke="#cbd5e1"
                            strokeWidth="4"
                            strokeLinecap="round"
                          />
                          <line
                            x1="24"
                            y1="26"
                            x2={order.status === 'Sampai' ? 296 : 225}
                            y2="26"
                            stroke="#EE4D2D"
                            strokeWidth="4"
                            strokeLinecap="round"
                          />
                          <circle cx="24" cy="26" r="6" fill="#111113" />
                          <circle
                            cx={order.status === 'Sampai' ? 296 : 225}
                            cy="26"
                            r="7"
                            fill="#EE4D2D"
                          />
                          <circle cx="296" cy="26" r="5" fill="#16a34a" />
                        </svg>
                        <div className="flex justify-between text-[10px] text-zinc-500 font-semibold">
                          <span>Gudang Seller</span>
                          <span>Posisi Kurir Saat Ini</span>
                          <span>{order.addressCity || 'Alamat Pembeli'}</span>
                        </div>
                      </div>
                    )}

                    {order.trackingHistory && order.trackingHistory.length > 0 && (
                      <div className="pt-2 border-t border-zinc-200/80">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedTimelineId((prev) =>
                              prev === order.id ? null : order.id
                            )
                          }
                          className="w-full flex items-center justify-between text-xs font-bold text-zinc-800 cursor-pointer"
                        >
                          <span>
                            Log Real-time: {order.trackingHistory[0].title}
                          </span>
                          {expandedTimelineId === order.id ? (
                            <ChevronUp className="w-4 h-4 text-zinc-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-zinc-500" />
                          )}
                        </button>

                        {expandedTimelineId === order.id && (
                          <div className="mt-2.5 space-y-2 border-l-2 border-[#EE4D2D]/40 pl-3">
                            {order.trackingHistory.map((ev, idx) => (
                              <div key={idx} className="text-xs">
                                <p className="font-bold text-zinc-900">
                                  {ev.title}
                                </p>
                                <p className="text-zinc-600">{ev.detail}</p>
                                <p className="text-[10px] text-zinc-400">
                                  {formatDateId(ev.time)}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Courier & Resi */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm bg-orange-50/50 border border-orange-100 rounded-xl px-3.5 py-2.5">
                  <div>
                    <span className="text-zinc-600">Kurir: </span>
                    <span className="font-bold text-zinc-900">{order.courier}</span>
                    <span aria-hidden="true" className="mx-2 text-zinc-300">|</span>
                    <span className="text-zinc-600">No. Resi: </span>
                    <span className="font-mono font-bold text-zinc-900">
                      {order.trackingNumber || 'Menunggu input Seller'}
                    </span>
                  </div>
                  {order.trackingNumber && (
                    <button
                      type="button"
                      onClick={() => handleCopyResi(order.trackingNumber, order.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#EE4D2D] hover:underline py-1 cursor-pointer"
                    >
                      {copiedId === order.id ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Disalin
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Salin Resi
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Garansi Tepat Waktu Banner */}
                <div className="rounded-xl bg-zinc-50 border border-zinc-200 px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-bold text-zinc-900">
                      Garansi Tepat Waktu:
                    </span>{' '}
                    <span className="text-zinc-600">
                      Target tiba {formatDateId(order.estimatedDeliveryAt)}
                    </span>
                  </div>
                  {order.lateVoucherClaimed ? (
                    <span className="font-bold text-emerald-700 inline-flex items-center gap-1">
                      <Ticket className="w-3.5 h-3.5" /> Voucher Rp 20rb Diklaim
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => claimLateVoucher(order.id)}
                      className="min-h-[34px] px-3 rounded-lg bg-[#111113] hover:bg-zinc-800 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Ticket className="w-3.5 h-3.5 text-[#EE4D2D]" />
                      {isPastEta
                        ? 'Paket Telat · Klaim Voucher Rp 20rb'
                        : 'Klaim Voucher Jika Telat'}
                    </button>
                  )}
                </div>

                {/* Items */}
                <div className="space-y-2.5">
                  {order.items.map((item) => {
                    const variantLabel = [item.selectedColor, item.selectedSize]
                      .filter(Boolean)
                      .join(' · ');
                    return (
                      <div
                        key={`${item.productId}-${item.selectedColor || ''}-${item.selectedSize || ''}`}
                        className="flex items-center gap-3"
                      >
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-100 shrink-0">
                          <ProductImage
                            src={item.productImage}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-zinc-500">{item.sellerName}</p>
                          <p className="text-sm font-semibold text-zinc-900 truncate">
                            {item.productName}
                          </p>
                          <p className="text-xs text-zinc-600 tabular-nums">
                            {variantLabel ? `${variantLabel} · ` : ''}
                            {item.quantity} × {formatRupiah(item.price)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {order.complaintReason && (
                  <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-900 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-bold">
                        Pengajuan {order.complaintType || 'Komplain'} Anda:
                      </p>
                      <span className="px-2 py-0.5 rounded-md bg-white border border-rose-200 text-[10px] font-extrabold text-rose-800">
                        {order.returnStatus === 'approved'
                          ? 'Retur Disetujui · Dana Kembali ke VTC Pay'
                          : order.returnStatus === 'requested'
                            ? 'Menunggu Konfirmasi Seller'
                            : 'Dalam Peninjauan'}
                      </span>
                    </div>
                    <p>{order.complaintReason}</p>
                    {order.returnPhoto && (
                      <img
                        src={order.returnPhoto}
                        alt="Foto bukti retur"
                        className="w-24 h-24 rounded-xl object-cover border border-rose-200"
                      />
                    )}
                  </div>
                )}

                {/* Footer Total & Actions */}
                <div className="pt-3 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-zinc-500">
                      Total ({order.shippingFee === 0 ? 'Bebas Ongkir' : `Ongkir ${formatRupiah(order.shippingFee)}`}
                      {order.codFee ? ` · Biaya COD ${formatRupiah(order.codFee)}` : ''})
                    </p>
                    <p className="text-lg font-extrabold text-[#EE4D2D] tabular-nums">
                      {formatRupiah(order.totalAmount)}
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Garansi VTC (Escrow):{' '}
                      <span className="font-semibold text-zinc-700">
                        {order.escrowStatus === 'held'
                          ? 'Uang Ditahan sampai Pembeli menekan Pesanan Diterima'
                          : order.escrowStatus === 'released'
                            ? 'Sudah Dibayarkan ke Seller'
                            : 'Dikembalikan ke Buyer'}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setInvoiceOrder(order)}
                      className="min-h-[40px] px-3 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Invoice</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        submitFraudReport(
                          'order',
                          `${order.items[0]?.sellerName || 'Seller'} (${order.id})`,
                          'Laporan Keamanan Pesanan 1-Klik'
                        )
                      }
                      className="min-h-[40px] px-3 rounded-xl border border-zinc-200 text-zinc-600 hover:text-rose-700 hover:border-rose-300 font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Flag className="w-3.5 h-3.5" />
                      <span>Laporkan Penipu</span>
                    </button>
                    {(order.status === 'Diproses' ||
                      order.status === 'Dipesan' ||
                      order.status === 'Dibayar' ||
                      order.status === 'Dikemas') && (
                      <span className="min-h-[40px] px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-bold text-xs inline-flex items-center">
                        Sedang disiapkan Seller
                      </span>
                    )}
                    {canAct && (
                      <>
                        <button
                          type="button"
                          onClick={() => submitOneClickRefund(order.id)}
                          className="min-h-[44px] px-3.5 py-2 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 font-bold text-xs hover:bg-amber-100 cursor-pointer"
                        >
                          Return/Refund 1-Klik
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setComplaintOrder(order);
                            setComplaintType('Return');
                            setComplaintText('');
                            setReturnPhoto('');
                          }}
                          className="min-h-[44px] px-3.5 py-2 rounded-xl border border-rose-300 text-rose-700 font-bold text-xs sm:text-sm hover:bg-rose-50 cursor-pointer"
                        >
                          Ajukan Retur / Komplain
                        </button>
                        <button
                          type="button"
                          onClick={() => confirmOrderReceived(order.id)}
                          className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm cursor-pointer"
                        >
                          Pesanan Diterima
                        </button>
                      </>
                    )}
                    {(order.status === 'Selesai' || order.status === 'Diterima') && (
                      <>
                        {!order.reviewSubmitted && (
                          <button
                            type="button"
                            onClick={() => {
                              setRatingOrder(order);
                              setRatingStars(5);
                              setRatingComment('');
                            }}
                            className="min-h-[44px] px-4 py-2 rounded-xl border border-amber-400 bg-amber-50 text-amber-900 font-bold text-xs sm:text-sm inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span>Beri Rating</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleBuyAgain(order)}
                          className="min-h-[44px] px-4 py-2 rounded-xl bg-[#EE4D2D] hover:bg-[#D73B1C] text-white font-bold text-xs sm:text-sm cursor-pointer"
                        >
                          Beli Lagi
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Complaint / Return / Refund Modal */}
      {complaintOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setComplaintOrder(null)}
        >
          <div
            className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-900">
                Ajukan Komplain / Return / Refund
              </h3>
              <button
                type="button"
                onClick={() => setComplaintOrder(null)}
                aria-label="Tutup modal komplain"
                className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-zinc-600">
              Pesanan <span className="font-mono font-bold">{complaintOrder.id}</span> · Dana ditahan VTC SHOP INDONESIA selama proses penyelesaian berlangsung.
            </p>
            <form onSubmit={handleComplaintSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {(['Komplain', 'Return', 'Refund'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setComplaintType(t)}
                    className={`min-h-[42px] rounded-xl border text-xs font-bold cursor-pointer ${
                      complaintType === t
                        ? 'border-rose-600 bg-rose-50 text-rose-700'
                        : 'border-zinc-200 text-zinc-700'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <textarea
                rows={4}
                required
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                placeholder="Jelaskan alasan retur / kendala produk (rusak, kurang, salah varian, atau refund dana)..."
                className="w-full p-3.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#EE4D2D] resize-none"
              />
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-700">
                  Upload Foto Bukti Kondisi Barang (Opsional / Disarankan untuk Retur)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 min-h-[44px] px-3.5 rounded-xl border border-dashed border-zinc-300 hover:border-[#EE4D2D] bg-zinc-50 flex items-center justify-center gap-2 text-xs font-bold text-zinc-700 cursor-pointer">
                    <UploadCloud className="w-4 h-4 text-[#EE4D2D]" />
                    <span>{returnPhoto ? 'Ganti Foto Bukti' : 'Pilih / Foto Produk'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleReturnPhotoChange}
                      className="sr-only"
                    />
                  </label>
                  {returnPhoto && (
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-zinc-200 shrink-0">
                      <img
                        src={returnPhoto}
                        alt="Preview retur"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setReturnPhoto('')}
                        aria-label="Hapus foto retur"
                        className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setComplaintOrder(null)}
                  className="min-h-[48px] rounded-xl border border-zinc-200 font-semibold text-sm text-zinc-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="min-h-[48px] rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm cursor-pointer"
                >
                  Kirim {complaintType}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Invoice Resmi */}
      {invoiceOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-4"
          onClick={() => setInvoiceOrder(null)}
        >
          <div
            className="bg-white w-full max-w-md rounded-3xl p-5 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="space-y-1">
                <VtcLogo size="sm" darkText />
                <h3 className="text-base font-extrabold text-zinc-900">
                  Invoice {invoiceOrder.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInvoiceOrder(null)}
                className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs space-y-1.5 text-zinc-600">
              <p>Tanggal: <strong className="text-zinc-900">{formatDateId(invoiceOrder.createdAt)}</strong></p>
              <p>Penerima: <strong className="text-zinc-900">{invoiceOrder.buyerName}</strong> ({invoiceOrder.buyerPhone})</p>
              <p>Alamat: {invoiceOrder.buyerAddress}</p>
              <p>Metode Bayar: <strong className="text-zinc-900">{invoiceOrder.paymentMethod}</strong> · Kurir: <strong className="text-zinc-900">{invoiceOrder.courier}</strong></p>
            </div>
            <div className="border-t border-b border-zinc-100 py-2.5 space-y-1.5 text-xs">
              {invoiceOrder.items.map((it) => (
                <div key={it.productId} className="flex justify-between gap-2">
                  <span className="truncate">{it.productName} × {it.quantity}</span>
                  <span className="font-bold tabular-nums shrink-0">{formatRupiah(it.price * it.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center text-sm font-extrabold">
              <span>Total Dibayar</span>
              <span className="text-[#EE4D2D] tabular-nums">{formatRupiah(invoiceOrder.totalAmount)}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                window.print?.();
                setInvoiceOrder(null);
              }}
              className="w-full min-h-[44px] rounded-xl bg-[#111113] text-white text-xs font-extrabold cursor-pointer"
            >
              Cetak / Simpan Invoice
            </button>
          </div>
        </div>
      )}

      {/* Modal Beri Rating Langsung */}
      {ratingOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-4"
          onClick={() => setRatingOrder(null)}
        >
          <div
            className="bg-white w-full max-w-md rounded-3xl p-5 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-zinc-900">
                Beri Rating & Ulasan ({ratingOrder.id})
              </h3>
              <button
                type="button"
                onClick={() => setRatingOrder(null)}
                className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRatingStars(s)}
                  className="p-1 cursor-pointer"
                >
                  <Star
                    className={`w-8 h-8 ${
                      s <= ratingStars ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <textarea
              rows={3}
              required
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              placeholder="Bagaimana kualitas produk & pengiriman pesanan ini?"
              className="w-full p-3 rounded-xl border border-zinc-200 text-sm resize-none"
            />
            <button
              type="button"
              onClick={() => {
                if (!ratingComment.trim()) return;
                const firstItem = ratingOrder.items[0];
                if (firstItem) {
                  addProductReview(firstItem.productId, {
                    buyerName: currentUser?.name || ratingOrder.buyerName,
                    rating: ratingStars,
                    variantLabel: [firstItem.selectedColor, firstItem.selectedSize].filter(Boolean).join(', ') || 'Standard',
                    comment: ratingComment.trim(),
                    photo: firstItem.productImage,
                  });
                }
                markOrderReviewSubmitted(ratingOrder.id);
                setRatingOrder(null);
              }}
              className="w-full min-h-[44px] rounded-xl bg-[#EE4D2D] text-white text-sm font-extrabold cursor-pointer"
            >
              Kirim Rating & Ulasan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
