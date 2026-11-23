import React, { useEffect, useRef, useState } from 'react';
import { Headphones, X, Send, CheckCheck, Clock } from 'lucide-react';
import { useMarketplace } from '../store/marketplaceStore';
import {
  CS_OPEN_EVENT,
  CS_UPDATE_EVENT,
  CsThread,
  appendBuyerCsMessage,
  getOrCreateBuyerThread,
  markThreadReadByBuyer,
  mergeServerThreads,
} from '../store/csChatStore';

const QUICK_OPTIONS = [
  'Akun Bermasalah',
  'Pembayaran',
  'Refund',
  'Laporan Seller Nakal',
  'Cara Buka Toko',
] as const;

interface AiAssistantWidgetProps {
  liftOnMobile?: boolean;
}

const AdminAvatar: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'md' }) => {
  const dim = size === 'sm' ? 'w-7 h-7' : 'w-10 h-10';
  return (
    <div className={`relative ${dim} rounded-full shrink-0`}>
      <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-amber-100 to-orange-200 border-2 border-white/90 flex items-center justify-center shadow-xs">
        <svg
          viewBox="0 0 64 64"
          className="w-full h-full"
          aria-hidden="true"
        >
          <rect width="64" height="64" fill="#FFF3E8" />
          <circle cx="32" cy="24" r="11" fill="#F2B880" />
          <path
            d="M21 22 C21 13, 43 13, 43 22 C41 17, 23 17, 21 22 Z"
            fill="#1F242D"
          />
          <path
            d="M14 58 C14 43, 50 43, 50 58 Z"
            fill="#EE4D2D"
          />
          <path
            d="M27 44 L32 51 L37 44"
            fill="#FFFFFF"
          />
          <circle cx="28" cy="24" r="1.3" fill="#1F242D" />
          <circle cx="36" cy="24" r="1.3" fill="#1F242D" />
          <path
            d="M28.5 29 Q32 32 35.5 29"
            fill="none"
            stroke="#9E563B"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M19 25 Q18 33 25 34"
            fill="none"
            stroke="#1F242D"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="25.5" cy="34" r="1.8" fill="#EE4D2D" />
        </svg>
      </div>
      <span
        aria-hidden="true"
        className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-[#111113]"
      />
    </div>
  );
};

export const AiAssistantWidget: React.FC<AiAssistantWidgetProps> = ({
  liftOnMobile = false,
}) => {
  const { authToken, currentUser } = useMarketplace();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const buyerIdentity = {
    id: currentUser?.id || 'guest-buyer',
    name: currentUser?.name || 'Pembeli VTC SHOP',
    email: currentUser?.email || '',
  };

  const [thread, setThread] = useState<CsThread>(() =>
    getOrCreateBuyerThread(buyerIdentity)
  );

  const refreshThread = () => {
    const latest = getOrCreateBuyerThread({
      id: currentUser?.id || 'guest-buyer',
      name: currentUser?.name || 'Pembeli VTC SHOP',
      email: currentUser?.email || '',
    });
    setThread(latest);
  };

  useEffect(() => {
    refreshThread();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id, currentUser?.name]);

  useEffect(() => {
    const handleUpdate = () => refreshThread();
    const handleOpen = () => {
      refreshThread();
      setOpen(true);
      markThreadReadByBuyer(buyerIdentity.id);
    };

    window.addEventListener(CS_UPDATE_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener(CS_OPEN_EVENT, handleOpen);
    return () => {
      window.removeEventListener(CS_UPDATE_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener(CS_OPEN_EVENT, handleOpen);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  // Mark buyer messages read when modal is open
  useEffect(() => {
    if (open) {
      markThreadReadByBuyer(buyerIdentity.id);
    }
  }, [open, buyerIdentity.id, thread.messages.length]);

  // Auto-scroll to newest chat message
  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [open, thread.messages.length]);

  // Background poll for Admin replies while Chat CS window is open
  useEffect(() => {
    if (!open || !authToken) return;
    let active = true;
    const syncThread = async () => {
      try {
        const res = await fetch(
          `/api/cs/threads/${encodeURIComponent(buyerIdentity.id)}`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );
        if (!res.ok) return;
        const data = await res.json();
        if (active && data.thread) {
          mergeServerThreads([data.thread]);
          refreshThread();
        }
      } catch {
        // Ignore transient network errors; localStorage retains chat history
      }
    };
    syncThread();
    const timer = setInterval(syncThread, 5000);
    return () => {
      active = false;
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, authToken, buyerIdentity.id]);

  const handleSendMessage = async (textToSend: string) => {
    const clean = textToSend.trim();
    if (!clean || sending) return;

    setSending(true);
    setInput('');

    const { thread: updatedThread, message } = appendBuyerCsMessage(
      buyerIdentity,
      clean
    );
    setThread(updatedThread);

    // Silently forward message to server-side Admin WhatsApp relay (number hidden from buyer)
    try {
      await fetch('/api/cs/forward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          threadId: buyerIdentity.id,
          buyerName: buyerIdentity.name,
          buyerEmail: buyerIdentity.email,
          messageId: message.id,
          text: clean,
          createdAt: message.createdAt,
        }),
      });
    } catch {
      // History already saved safely in localStorage
    } finally {
      setSending(false);
    }
  };

  const unreadCount = thread.unreadByBuyer || 0;

  return (
    <>
      {/* Floating Button "CS VTC SHOP" di pojok kanan bawah di semua halaman */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Buka CS VTC SHOP"
        className={`fixed right-4 md:bottom-6 md:right-6 z-40 h-12 px-4 rounded-2xl bg-[#EE4D2D] hover:bg-[#D73B1C] text-white border-2 border-white shadow-xl flex items-center gap-2 font-extrabold text-xs sm:text-sm cursor-pointer active:scale-[0.97] transition-all ${
          liftOnMobile ? 'bottom-36' : 'bottom-20'
        }`}
      >
        <Headphones className="w-4 h-4 text-white" />
        <span>CS VTC SHOP</span>
        {unreadCount > 0 && (
          <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#111113] text-white text-[10px] font-extrabold flex items-center justify-center tabular-nums">
            {unreadCount}
          </span>
        )}
      </button>

      {/* In-App Chat CS VTC SHOP Window */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-end sm:justify-end p-0 sm:p-5"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 w-full sm:max-w-md h-[84vh] sm:h-[580px] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: CS VTC SHOP - Online + Foto Admin + Status Online - Dibalas Admin Platform */}
            <div className="bg-[#111113] text-white px-4 py-3.5 flex items-center justify-between shrink-0 border-b border-zinc-800">
              <div className="flex items-center gap-3 min-w-0">
                <AdminAvatar size="md" />
                <div className="min-w-0">
                  <h2 className="text-sm font-extrabold truncate">
                    CS VTC SHOP - Online
                  </h2>
                  <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Online - Dibalas Admin Platform</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup Chat CS"
                className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center rounded-xl text-zinc-300 hover:bg-white/10 cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages Stream */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F7F7F5] dark:bg-zinc-950"
            >
              {thread.messages.map((msg) => {
                if (msg.sender === 'system') {
                  return (
                    <div key={msg.id} className="flex justify-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-[11px] font-semibold text-amber-800 dark:text-amber-300 text-center">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>{msg.text}</span>
                      </div>
                    </div>
                  );
                }

                const isBuyer = msg.sender === 'buyer';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${
                      isBuyer ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {!isBuyer && <AdminAvatar size="sm" />}
                    <div
                      className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                        isBuyer
                          ? 'bg-[#EE4D2D] text-white rounded-br-sm'
                          : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-bl-sm'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <div
                        className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                          isBuyer ? 'text-white/80' : 'text-zinc-400'
                        }`}
                      >
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {isBuyer && <CheckCheck className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tombol Pilihan Cepat */}
            <div className="px-3.5 py-2.5 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
              <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-400 mb-1.5">
                Pilihan Cepat:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    disabled={sending}
                    onClick={() => handleSendMessage(opt)}
                    className="text-xs font-bold bg-orange-50/70 dark:bg-zinc-800 border border-orange-200 dark:border-zinc-700 hover:bg-[#EE4D2D] hover:text-white hover:border-[#EE4D2D] text-zinc-800 dark:text-zinc-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Kotak Ketik Pesan + Tombol Kirim */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(input);
              }}
              className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Kendala akun, pembayaran, refund, seller..."
                className="flex-1 h-11 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-[#EE4D2D]"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                aria-label="Kirim pesan"
                className="min-h-[44px] px-4 rounded-xl bg-[#EE4D2D] hover:bg-[#D73B1C] disabled:bg-zinc-200 disabled:text-zinc-400 text-white font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Kirim</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
