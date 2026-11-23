import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Store,
  Star,
  MapPin,
  Package,
  MessageCircle,
  Ticket,
  Search,
  Plus,
  CheckCircle2,
  Flag,
} from 'lucide-react';
import { useMarketplace } from '../store/marketplaceStore';
import { formatRupiah } from '../types';
import { ProductImage } from './ProductImage';

interface SellerStorePageProps {
  sellerId: string;
  onBack: () => void;
  onOpenProduct: (productId: string) => void;
  onOpenChat: (sellerId: string) => void;
}

export const SellerStorePage: React.FC<SellerStorePageProps> = ({
  sellerId,
  onBack,
  onOpenProduct,
  onOpenChat,
}) => {
  const { state, addToCart, claimPromoVoucher, submitFraudReport } =
    useMarketplace();
  const [storeQuery, setStoreQuery] = useState('');
  const [reported, setReported] = useState(false);
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc'>(
    'popular'
  );

  const seller = state.sellers.find((s) => s.id === sellerId) ?? null;

  const storeProducts = useMemo(() => {
    const q = storeQuery.trim().toLowerCase();
    const list = state.products.filter(
      (p) =>
        p.sellerId === sellerId &&
        (!q ||
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q))
    );
    return [...list].sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      return b.soldCount - a.soldCount;
    });
  }, [state.products, sellerId, storeQuery, sortBy]);

  if (!seller) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center space-y-3">
        <p className="text-base font-bold text-zinc-900">
          Toko seller tidak ditemukan
        </p>
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] px-5 rounded-xl bg-[#EE4D2D] text-white text-sm font-bold cursor-pointer"
        >
          Kembali
        </button>
      </div>
    );
  }

  const totalStoreProducts = state.products.filter(
    (p) => p.sellerId === seller.id
  ).length;
  const totalSold = state.products
    .filter((p) => p.sellerId === seller.id)
    .reduce((sum, p) => sum + p.soldCount, 0);

  const initials = seller.storeName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');

  const storeVoucher = seller.storeVoucher;
  const voucherClaimed = storeVoucher
    ? state.vouchers.some((v) => v.code === storeVoucher.code)
    : false;

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="min-h-[42px] px-3.5 rounded-xl bg-white border border-zinc-200 hover:border-zinc-300 text-xs sm:text-sm font-bold text-zinc-800 inline-flex items-center gap-1.5 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali</span>
      </button>

      {/* Store Profile Banner */}
      <section
        className="rounded-2xl sm:rounded-3xl text-white p-5 sm:p-6 border border-white/10 space-y-4"
        style={{ backgroundColor: seller.bannerColor || '#111113' }}
      >
        {(seller.bannerTitle || seller.bannerSubtitle) && (
          <div className="rounded-2xl bg-black/25 border border-white/10 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs sm:text-sm font-extrabold text-orange-300">
              {seller.bannerTitle || seller.storeName}
            </p>
            {seller.bannerSubtitle && (
              <p className="text-[11px] sm:text-xs text-white/85">
                {seller.bannerSubtitle}
              </p>
            )}
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl sm:text-2xl shrink-0 border-2 border-white/20"
              style={{ backgroundColor: seller.avatarColor || '#EE4D2D' }}
            >
              {initials || <Store className="w-8 h-8" />}
            </div>
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold truncate">
                  {seller.storeName}
                </h1>
                {seller.isMall && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold bg-[#EE4D2D] text-white px-2 py-0.5 rounded-md">
                    VTC MALL 100% ORI
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-3 h-3" /> Seller Resmi VTC SHOP INDONESIA
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-200 tabular-nums">
                <span className="inline-flex items-center gap-1 font-bold text-white">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {seller.rating.toFixed(1)} Rating Toko
                </span>
                <span className="text-white/30">·</span>
                <span className="inline-flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-[#EE4D2D]" />
                  {totalStoreProducts} Produk
                </span>
                <span className="text-white/30">·</span>
                <span>{totalSold} Terjual</span>
                <span className="text-white/30">·</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#EE4D2D]" />
                  {seller.city}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onOpenChat(seller.id)}
              className="min-h-[44px] px-5 rounded-xl bg-[#EE4D2D] hover:bg-[#D73B1C] text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat Toko</span>
            </button>
            <button
              type="button"
              disabled={reported}
              onClick={() => {
                submitFraudReport(
                  'seller',
                  seller.storeName,
                  `Laporan Keamanan 1-Klik pada toko ${seller.storeName}`
                );
                setReported(true);
              }}
              className="min-h-[44px] px-3.5 rounded-xl bg-white/10 hover:bg-rose-500/20 disabled:opacity-60 border border-white/20 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Flag className="w-3.5 h-3.5 text-rose-300" />
              <span>{reported ? 'Dilaporkan' : 'Laporkan Penipu'}</span>
            </button>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
          {seller.description}
        </p>
      </section>

      {/* Store Voucher */}
      {storeVoucher && (
        <section className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EE4D2D] text-white flex items-center justify-center shrink-0">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-zinc-900">
                {storeVoucher.title}
              </p>
              <p className="text-xs text-zinc-600 tabular-nums">
                Kode: <strong className="font-mono">{storeVoucher.code}</strong> · Minimal belanja {formatRupiah(storeVoucher.minSpend)}
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
            className="min-h-[42px] px-4 rounded-xl bg-[#EE4D2D] hover:bg-[#D73B1C] disabled:bg-zinc-200 disabled:text-zinc-500 text-white text-xs font-bold cursor-pointer"
          >
            {voucherClaimed ? 'Sudah Diklaim' : 'Klaim Voucher'}
          </button>
        </section>
      )}

      {/* Search & Sort Strictly Within This Store */}
      <section className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1 flex items-center">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
          <input
            type="search"
            value={storeQuery}
            onChange={(e) => setStoreQuery(e.target.value)}
            placeholder={`Cari produk di ${seller.storeName}...`}
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-zinc-200 text-sm focus:outline-none focus:border-[#EE4D2D]"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value as 'popular' | 'price_asc' | 'price_desc')
          }
          className="h-11 px-3.5 rounded-xl bg-white border border-zinc-200 text-xs sm:text-sm font-semibold text-zinc-800"
        >
          <option value="popular">Terlaris di Toko</option>
          <option value="price_asc">Harga Termurah</option>
          <option value="price_desc">Harga Termahal</option>
        </select>
      </section>

      {/* Store Catalog Grid (Only This Seller's Products) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-extrabold text-zinc-900">
            Etalase Produk {seller.storeName}
          </h2>
          <span className="text-xs text-zinc-500 tabular-nums">
            {storeProducts.length} produk
          </span>
        </div>

        {storeProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center text-sm text-zinc-500">
            Belum ada produk yang sesuai di etalase {seller.storeName}.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {storeProducts.map((product) => {
              const outOfStock = product.stock <= 0;
              return (
                <article
                  key={product.id}
                  className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 overflow-hidden flex flex-col hover:border-zinc-300"
                >
                  <button
                    type="button"
                    onClick={() => onOpenProduct(product.id)}
                    className="block w-full aspect-square bg-zinc-100 overflow-hidden text-left cursor-pointer"
                  >
                    <ProductImage
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </button>

                  <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-[11px] text-zinc-500 truncate">
                        {product.category} · Stok {product.stock}
                      </p>
                      <button
                        type="button"
                        onClick={() => onOpenProduct(product.id)}
                        className="text-left block w-full cursor-pointer"
                      >
                        <h3 className="text-sm font-semibold text-zinc-900 leading-snug line-clamp-2 min-h-[40px] hover:text-[#EE4D2D]">
                          {product.name}
                        </h3>
                      </button>

                      <div className="flex items-center gap-2 text-xs text-zinc-600 tabular-nums">
                        <span className="inline-flex items-center gap-1 font-semibold text-zinc-800">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {product.rating.toFixed(1)}
                        </span>
                        <span className="text-zinc-300">·</span>
                        <span>Terjual {product.soldCount}</span>
                      </div>

                      <div className="pt-0.5">
                        <p className="text-base font-extrabold text-[#EE4D2D] tabular-nums">
                          {formatRupiah(product.price)}
                        </p>
                        {product.originalPrice && (
                          <p className="text-[11px] text-zinc-400 line-through tabular-nums">
                            {formatRupiah(product.originalPrice)}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={outOfStock}
                      onClick={() => addToCart(product.id, 1)}
                      className={`w-full min-h-[42px] px-3 py-2 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer ${
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
    </div>
  );
};
