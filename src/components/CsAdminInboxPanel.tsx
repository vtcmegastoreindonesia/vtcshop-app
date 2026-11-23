import React, { useEffect, useMemo, useState } from 'react';
import {
  MessageSquareText,
  Send,
  UserCheck,
  Clock,
  Inbox,
  ExternalLink,
} from 'lucide-react';
import { useMarketplace } from '../store/marketplaceStore';
import {
  CS_UPDATE_EVENT,
  CsThread,
  appendAdminCsReply,
  loadCsThreads,
  markThreadReadByAdmin,
  mergeServerThreads,
} from '../store/csChatStore';
import { formatDateId } from '../types';

interface CsAdminInboxPanelProps {
  isVerifiedAdmin?: boolean;
}

export const CsAdminInboxPanel: React.FC<CsAdminInboxPanelProps> = ({
  isVerifiedAdmin = false,
}) => {
  const { authToken, currentUser, showToast } = useMarketplace();
  const [threads, setThreads] = useState<CsThread[]>(() => loadCsThreads());
  const [selectedId, setSelectedId] = useState<string | null>(
    () => loadCsThreads()[0]?.id ?? null
  );
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const syncFromStorage = () => {
    const latest = loadCsThreads();
    setThreads(latest);
    setSelectedId((prev) =>
      prev && latest.some((t) => t.id === prev) ? prev : latest[0]?.id ?? null
    );
  };

  useEffect(() => {
    syncFromStorage();
    window.addEventListener(CS_UPDATE_EVENT, syncFromStorage);
    window.addEventListener('storage', syncFromStorage);
    return () => {
      window.removeEventListener(CS_UPDATE_EVENT, syncFromStorage);
      window.removeEventListener('storage', syncFromStorage);
    };
  }, []);

  useEffect(() => {
    if (!authToken) return;
    let active = true;
    const fetchServerThreads = async () => {
      try {
        const res = await fetch('/api/cs/admin/threads', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (active && Array.isArray(data.threads)) {
          const merged = mergeServerThreads(data.threads);
          setThreads(merged);
          setSelectedId((prev) =>
            prev && merged.some((t) => t.id === prev) ? prev : merged[0]?.id ?? null
          );
        }
      } catch {
        // Keep localStorage threads on transient network error
      }
    };
    fetchServerThreads();
    const interval = setInterval(fetchServerThreads, 6000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [authToken]);

  const activeThread = useMemo(
    () => threads.find((t) => t.id === selectedId) ?? threads[0] ?? null,
    [threads, selectedId]
  );

  const handleSelectThread = (id: string) => {
    setSelectedId(id);
    markThreadReadByAdmin(id);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeThread || !replyText.trim() || sending) return;

    const clean = replyText.trim();
    setSending(true);
    setReplyText('');

    const updated = appendAdminCsReply(activeThread.id, clean);
    setThreads(updated);

    try {
      if (authToken) {
        await fetch('/api/cs/reply', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            threadId: activeThread.id,
            text: clean,
            adminName: currentUser?.name || 'Admin VTC SHOP',
          }),
        });
      }
      showToast('Balasan Admin terkirim ke pembeli.');
    } catch {
      showToast('Balasan tersimpan di riwayat lokal.', 'info');
    } finally {
      setSending(false);
    }
  };

  const buyerMessageThreads = useMemo(
    () =>
      threads.filter((t) => t.messages.some((m) => m.sender === 'buyer')),
    [threads]
  );

  const displayThreads = buyerMessageThreads.length > 0 ? buyerMessageThreads : threads;
  const visibleMessages = activeThread
    ? activeThread.messages.filter((m) => m.sender !== 'system')
    : [];

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 inline-flex items-center gap-2">
            <MessageSquareText className="w-5 h-5 text-[#EE4D2D]" />
            <span>Pesan CS (Balas Langsung oleh Admin)</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Semua pesan masuk dari pembeli di widget CS tersimpan di sini untuk Anda balas langsung tanpa robot.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          <UserCheck className="w-3.5 h-3.5" />
          Mode Balasan Manual Admin Aktif
        </span>
      </div>

      {displayThreads.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-10 text-center space-y-2">
          <Inbox className="w-10 h-10 text-zinc-300 mx-auto" />
          <p className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
            Belum ada pesan CS masuk dari pembeli
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Saat pembeli mengirim pesan lewat tombol mengambang CS, pesan akan langsung tampil di kotak masuk ini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Thread List */}
          <div className="lg:col-span-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 text-xs font-extrabold text-zinc-700 dark:text-zinc-300">
              Antrean Chat Pembeli ({displayThreads.length})
            </div>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 max-h-[460px] overflow-y-auto">
              {displayThreads.map((t) => {
                const isSelected = activeThread?.id === t.id;
                const lastBuyerOrAdmin = [...t.messages]
                  .reverse()
                  .find((m) => m.sender !== 'system');
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelectThread(t.id)}
                    className={`w-full text-left px-4 py-3 flex items-start justify-between gap-2 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-orange-50/80 dark:bg-orange-950/30 border-l-4 border-l-[#EE4D2D]'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 truncate">
                          {t.buyerName}
                        </p>
                        {t.unreadByAdmin > 0 && (
                          <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#EE4D2D] text-white text-[10px] font-extrabold flex items-center justify-center tabular-nums">
                            {t.unreadByAdmin}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                        {lastBuyerOrAdmin?.text || 'Belum ada pesan'}
                      </p>
                      <p className="text-[10px] text-zinc-400 mt-1 inline-flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {formatDateId(t.updatedAt)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Conversation */}
          <div className="lg:col-span-8 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col min-h-[460px] max-h-[540px] overflow-hidden">
            {activeThread ? (
              <>
                <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 bg-zinc-50/70 dark:bg-zinc-950/40">
                  <div>
                    <p className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                      {activeThread.buyerName}
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {activeThread.buyerEmail || 'Pembeli VTC SHOP'}
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-[#EE4D2D] bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 px-2.5 py-1 rounded-lg">
                    Balasan Anda langsung masuk ke Chat CS pembeli
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F7F7F5] dark:bg-zinc-950">
                  {visibleMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.sender === 'admin' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                          msg.sender === 'admin'
                            ? 'bg-[#EE4D2D] text-white rounded-br-sm'
                            : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-bl-sm'
                        }`}
                      >
                        <p>{msg.text}</p>
                        {isVerifiedAdmin && msg.waForwardUrl && (
                          <a
                            href={msg.waForwardUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Teruskan ke WhatsApp Admin</span>
                          </a>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-400 mt-1 px-1">
                        {msg.sender === 'admin' ? 'Admin' : activeThread.buyerName} ·{' '}
                        {new Date(msg.createdAt).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))}
                </div>

                <form
                  onSubmit={handleSendReply}
                  className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Balas pesan ${activeThread.buyerName} sebagai Admin...`}
                    className="flex-1 h-11 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-[#EE4D2D]"
                  />
                  <button
                    type="submit"
                    disabled={sending || !replyText.trim()}
                    className="min-h-[44px] px-4 rounded-xl bg-[#EE4D2D] hover:bg-[#D73B1C] disabled:bg-zinc-200 disabled:text-zinc-400 text-white font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Kirim Balasan</span>
                  </button>
                </form>
              </>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
};
