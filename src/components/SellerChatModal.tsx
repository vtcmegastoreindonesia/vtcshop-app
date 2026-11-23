import React, { useEffect, useRef, useState } from 'react';
import { X, Send, Store, MapPin, Star } from 'lucide-react';
import { useMarketplace } from '../store/marketplaceStore';
import { formatDateId } from '../types';

interface SellerChatModalProps {
  sellerId: string | null;
  productContextName?: string;
  onClose: () => void;
}

const QUICK_PROMPTS = [
  'Halo kak, apakah stok produk ini masih ready?',
  'Bisa kirim pakai COD Garansi hari ini?',
  'Apakah ada garansi tukar jika ukuran tidak pas?',
];

export const SellerChatModal: React.FC<SellerChatModalProps> = ({
  sellerId,
  productContextName,
  onClose,
}) => {
  const { state, sendSellerChat } = useMarketplace();
  const [text, setText] = useState('');
  const endRef = useRef<HTMLDivElement | null>(null);

  const seller = state.sellers.find((s) => s.id === sellerId) ?? null;
  const messages = sellerId ? state.sellerChats[sellerId] ?? [] : [];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: state.liteMode ? 'auto' : 'smooth' });
  }, [messages.length, sellerId, state.liteMode]);

  if (!sellerId || !seller) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendSellerChat(seller.id, text, productContextName);
    setText('');
  };

  const initials = seller.storeName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');

  const lastMessage = messages[messages.length - 1];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md h-[84vh] sm:h-[600px] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#111113] text-white px-4 py-3.5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm text-white shrink-0 border border-white/20"
              style={{ backgroundColor: seller.avatarColor || '#EE4D2D' }}
            >
              {initials || <Store className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-extrabold truncate">{seller.storeName}</p>
              <p className="text-[11px] text-zinc-300 flex items-center gap-2 truncate">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#EE4D2D]" />
                  {seller.city}
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {seller.rating.toFixed(1)}
                </span>
                <span>·</span>
                <span className="text-emerald-400 font-semibold">Dibalas Seller</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup chat toko"
            className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center rounded-xl text-zinc-300 hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {productContextName && (
          <div className="px-4 py-2 bg-orange-50 border-b border-orange-100 text-xs text-zinc-700 truncate shrink-0">
            Menanyakan produk:{' '}
            <strong className="text-[#EE4D2D]">{productContextName}</strong>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F7F7F5]">
          {messages.length === 0 ? (
            <div className="bg-white rounded-2xl border border-zinc-200 p-4 text-center space-y-2">
              <p className="text-sm font-bold text-zinc-900">
                Chat Langsung dengan Seller {seller.storeName}
              </p>
              <p className="text-xs text-zinc-500">
                Tanyakan stok variasi, ukuran, pengiriman dari {seller.city}, atau detail produk langsung ke pemilik toko.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isBuyer = msg.sender === 'buyer';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    isBuyer ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                      isBuyer
                        ? 'bg-[#EE4D2D] text-white rounded-br-sm'
                        : 'bg-white border border-zinc-200 text-zinc-800 rounded-bl-sm'
                    }`}
                  >
                    {msg.productName && isBuyer && (
                      <p className="text-[10px] font-bold text-white/85 mb-1">
                        Produk: {msg.productName}
                      </p>
                    )}
                    <p>{msg.text}</p>
                  </div>
                  <span className="text-[10px] text-zinc-400 mt-1 px-1">
                    {isBuyer ? 'Anda' : `Seller · ${seller.storeName}`} ·{' '}
                    {formatDateId(msg.createdAt)}
                  </span>
                </div>
              );
            })
          )}
          {lastMessage?.sender === 'buyer' && (
            <div className="flex justify-center pt-1">
              <span className="px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-[11px] font-semibold text-amber-800">
                Pesan masuk ke inbox Seller {seller.storeName}. Menunggu balasan Seller...
              </span>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Quick Prompts */}
        <div className="px-3 py-2 bg-white border-t border-zinc-100 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {QUICK_PROMPTS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => sendSellerChat(seller.id, q, productContextName)}
              className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-orange-50 hover:text-[#EE4D2D] text-[11px] font-semibold text-zinc-700 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="p-3 bg-white border-t border-zinc-200 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Tulis pesan ke Seller ${seller.storeName}...`}
            className="flex-1 h-11 px-3.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#EE4D2D]"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            aria-label="Kirim pesan"
            className="min-w-[44px] h-11 px-4 rounded-xl bg-[#EE4D2D] hover:bg-[#D73B1C] disabled:bg-zinc-200 disabled:text-zinc-400 text-white font-bold text-sm inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
