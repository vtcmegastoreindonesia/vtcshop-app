import React, { useState } from 'react';
import { Download, CheckCircle2, Share2, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  compact?: boolean;
  onNotify?: (message: string) => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  compact = false,
  onNotify,
}) => {
  const { canPromptInstall, isInstalled, promptInstall } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  const handleInstallClick = async () => {
    const result = await promptInstall();
    if (result === 'accepted') {
      onNotify?.('VTC SHOP INDONESIA berhasil diinstal ke layar utama!');
    } else if (result === 'manual') {
      setShowGuideModal(true);
    }
  };

  const handleShareApp = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: 'VTC SHOP INDONESIA — Belanja, Live & TV Online',
      text: 'Belanja hemat, COD aman bergaransi, Live TikTok/YT/IG & TV Nasional dalam satu aplikasi VTC SHOP INDONESIA!',
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        onNotify?.('Link VTC SHOP INDONESIA siap dibagikan!');
        return;
      }
    } catch {
      // Fall through to clipboard copy if share was cancelled/unsupported
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      onNotify?.('Link aplikasi VTC SHOP INDONESIA disalin! Siap di-share.');
    } catch {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      <div className="inline-flex items-center gap-1.5">
        {isInstalled ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>App Terinstal</span>
          </span>
        ) : (
          <button
            type="button"
            onClick={handleInstallClick}
            className={`inline-flex items-center justify-center gap-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
              compact
                ? 'min-h-[34px] px-2.5 bg-[#FF6A00] hover:bg-[#E05E00] text-white text-[11px]'
                : 'min-h-[44px] px-4 bg-[#FF6A00] hover:bg-[#E05E00] text-white text-xs sm:text-sm'
            }`}
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>{canPromptInstall ? 'Install App' : 'Add to Home'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleShareApp}
          title="Bagikan Link Aplikasi VTC SHOP INDONESIA"
          className={`inline-flex items-center justify-center gap-1.5 rounded-xl font-bold border transition-colors cursor-pointer ${
            compact
              ? 'min-h-[34px] px-2.5 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:border-[#FF6A00] text-[11px]'
              : 'min-h-[44px] px-4 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 hover:border-[#FF6A00] text-xs sm:text-sm'
          }`}
        >
          <Share2 className="w-3.5 h-3.5 text-[#FF6A00] shrink-0" />
          <span>Share Link</span>
        </button>
      </div>

      {showGuideModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setShowGuideModal(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl border border-zinc-200 dark:border-zinc-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#FF6A00] text-white flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                    Pasang Aplikasi VTC SHOP
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Akses cepat layar penuh seperti aplikasi asli
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-zinc-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-zinc-700 dark:text-zinc-300">
              <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-3 space-y-1">
                <p className="font-bold text-zinc-900 dark:text-zinc-100">
                  Android (Chrome / Edge):
                </p>
                <p>
                  Tekan menu titik tiga <strong>⋮</strong> di kanan atas browser, lalu pilih{' '}
                  <strong>Tambahkan ke Layar Utama / Install App</strong>.
                </p>
              </div>
              <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-3 space-y-1">
                <p className="font-bold text-zinc-900 dark:text-zinc-100">
                  iPhone / iPad (Safari):
                </p>
                <p>
                  Tekan ikon <strong>Bagikan (Share)</strong> di bawah layar Safari, lalu pilih{' '}
                  <strong>Tambahkan ke Layar Utama (Add to Home Screen)</strong>.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard?.writeText(window.location.href).catch(() => undefined);
                onNotify?.('Link VTC SHOP INDONESIA disalin!');
                setShowGuideModal(false);
              }}
              className="w-full min-h-[46px] rounded-xl bg-[#FF6A00] hover:bg-[#E05E00] text-white font-bold text-sm cursor-pointer"
            >
              Salin Link Aplikasi Sekarang
            </button>
          </div>
        </div>
      )}
    </>
  );
};
