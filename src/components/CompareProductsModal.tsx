import React from 'react';
import { X, Star, ShieldCheck, Truck, Plus, Scale } from 'lucide-react';
import { useMarketplace } from '../store/marketplaceStore';
import { formatRupiah } from '../types';
import { ProductImage } from './ProductImage';

interface CompareProductsModalProps {
  open: boolean;
  onClose: () => void;
  onOpenProduct: (productId: string) => void;
}

export const CompareProductsModal: React.FC<CompareProductsModalProps> = ({
  open,
  onClose,
  onOpenProduct,
}) => {
  const {
    state,
    toggleCompareProduct,
    clearCompareProducts,
    addToCart,
  } = useMarketplace();

  if (!open) return null;

  const items = state.compareProductIds
    .map((id) => state.products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-4xl max-h-[90vh] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#EE4D2D]" />
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-zinc-900">
                Bandingkan Produk ({items.length}/3)
              </h2>
              <p className="text-[11px] text-zinc-500">
                Bandingkan harga, spesifikasi, garansi, dan ongkir hingga 3 produk sekaligus
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                type="button"
                onClick={clearCompareProducts}
                className="text-xs font-bold text-rose-600 hover:underline px-2 py-1 cursor-pointer"
              >
                Kosongkan
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup perbandingan"
              className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 sm:p-5">
          {items.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Scale className="w-10 h-10 text-zinc-300 mx-auto" />
              <p className="text-sm font-bold text-zinc-800">
                Belum ada produk untuk dibandingkan
              </p>
              <p className="text-xs text-zinc-500">
                Klik tombol Bandingkan pada kartu produk atau halaman detail produk (maksimal 3 produk).
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[540px] text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200">
                    <th className="w-32 text-left py-2 pr-3 font-bold text-zinc-500 align-top">
                      Produk
                    </th>
                    {items.map((p) => (
                      <th
                        key={p.id}
                        className="text-left py-2 px-3 align-top min-w-[165px]"
                      >
                        <div className="relative rounded-2xl border border-zinc-200 p-2.5 bg-zinc-50 space-y-2">
                          <button
                            type="button"
                            onClick={() => toggleCompareProduct(p.id)}
                            aria-label="Hapus dari perbandingan"
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white border border-zinc-200 text-zinc-500 hover:text-rose-600 flex items-center justify-center cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onOpenProduct(p.id);
                            }}
                            className="block w-24 h-24 rounded-xl overflow-hidden bg-white mx-auto cursor-pointer"
                          >
                            <ProductImage src={p.image} alt={p.name} />
                          </button>
                          <p className="font-bold text-zinc-900 line-clamp-2 min-h-[34px]">
                            {p.name}
                          </p>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  <tr>
                    <td className="py-2.5 pr-3 font-bold text-zinc-600">Harga</td>
                    {items.map((p) => (
                      <td key={p.id} className="py-2.5 px-3">
                        <p className="text-sm sm:text-base font-extrabold text-[#EE4D2D] tabular-nums">
                          {formatRupiah(p.price)}
                        </p>
                        {p.originalPrice && (
                          <p className="text-[11px] text-zinc-400 line-through tabular-nums">
                            {formatRupiah(p.originalPrice)}
                          </p>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-3 font-bold text-zinc-600">Toko &amp; Status</td>
                    {items.map((p) => (
                      <td key={p.id} className="py-2.5 px-3 space-y-1">
                        <p className="font-bold text-zinc-900">{p.sellerName}</p>
                        <div className="flex flex-wrap gap-1">
                          {p.isMall && (
                            <span className="px-1.5 py-0.5 rounded bg-[#111113] text-white text-[10px] font-bold">
                              VTC MALL
                            </span>
                          )}
                          {p.isStarSeller && (
                            <span className="px-1.5 py-0.5 rounded bg-[#EE4D2D] text-white text-[10px] font-bold">
                              Star Seller
                            </span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-3 font-bold text-zinc-600">Rating &amp; Terjual</td>
                    {items.map((p) => (
                      <td key={p.id} className="py-2.5 px-3 tabular-nums">
                        <span className="inline-flex items-center gap-1 font-bold text-zinc-900">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {p.rating.toFixed(1)}
                        </span>{' '}
                        <span className="text-zinc-500">· {p.soldCount} terjual</span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-3 font-bold text-zinc-600">Stok Real-time</td>
                    {items.map((p) => (
                      <td key={p.id} className="py-2.5 px-3 font-bold text-emerald-700 tabular-nums">
                        {p.stock} pcs tersedia
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-3 font-bold text-zinc-600">Bahan / Material</td>
                    {items.map((p) => (
                      <td key={p.id} className="py-2.5 px-3 text-zinc-700">
                        {p.specs?.material || 'Standar Resmi'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-3 font-bold text-zinc-600">Berat</td>
                    {items.map((p) => (
                      <td key={p.id} className="py-2.5 px-3 text-zinc-700">
                        {p.specs?.weight || '-'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-3 font-bold text-zinc-600">Garansi</td>
                    {items.map((p) => (
                      <td key={p.id} className="py-2.5 px-3 text-zinc-700">
                        {p.specs?.warranty || 'Garansi Toko'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-3 font-bold text-zinc-600">Jaminan</td>
                    {items.map((p) => (
                      <td key={p.id} className="py-2.5 px-3 space-y-1 text-[11px]">
                        <p className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                          <Truck className="w-3.5 h-3.5" /> Gratis Ongkir XTRA
                        </p>
                        <p className="inline-flex items-center gap-1 text-zinc-800 font-bold block">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#EE4D2D]" /> Bisa COD &amp; 100% Ori
                        </p>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 pr-3 font-bold text-zinc-600">Aksi</td>
                    {items.map((p) => (
                      <td key={p.id} className="py-3 px-3">
                        <button
                          type="button"
                          disabled={p.stock <= 0}
                          onClick={() => addToCart(p.id, 1)}
                          className="w-full min-h-[40px] px-3 rounded-xl bg-[#EE4D2D] hover:bg-[#D73B1C] disabled:bg-zinc-200 text-white text-xs font-bold inline-flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Keranjang</span>
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
