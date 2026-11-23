import React from 'react';
import {
  ArrowLeft,
  ExternalLink,
  LayoutGrid,
  ShoppingBag,
  Tv,
  Radio,
  Store,
} from 'lucide-react';
import { openCsChatWindow } from '../store/csChatStore';

interface SemuaAdaPageProps {
  onBackHome: () => void;
  onGoToTv: () => void;
  onGoToLive: () => void;
  onGoToSeller: () => void;
}

const FacebookIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.5 1.6-1.5h1.6V4.9c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1V11H7.6v3h2.7v8h3.2z" />
  </svg>
);

const TikTokIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M16.6 5.82s.51.5 0 0A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z" />
  </svg>
);

const YouTubeIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M21.58 7.19a2.75 2.75 0 0 0-1.94-1.95C17.93 4.75 12 4.75 12 4.75s-5.93 0-7.64.49A2.75 2.75 0 0 0 2.42 7.19C1.93 8.91 1.93 12 1.93 12s0 3.09.49 4.81a2.75 2.75 0 0 0 1.94 1.95c1.71.49 7.64.49 7.64.49s5.93 0 7.64-.49a2.75 2.75 0 0 0 1.94-1.95c.49-1.72.49-4.81.49-4.81s0-3.09-.49-4.81zM10 15.1V8.9l5.2 3.1-5.2 3.1z" />
  </svg>
);

const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
    <circle cx="12" cy="12" r="4.2" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.79 14.08c-.24.68-1.41 1.3-1.95 1.38-.5.08-1.13.11-1.82-.11-.42-.14-.96-.32-1.65-.62-2.91-1.26-4.81-4.18-4.96-4.38-.15-.2-1.18-1.57-1.18-3 0-1.43.75-2.13 1.01-2.42.26-.29.58-.36.77-.36.19 0 .39 0 .56.01.18.01.42-.07.66.5.24.59.82 2.02.89 2.17.07.15.12.32.02.52-.1.2-.15.32-.29.49-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.76 1.25 1.63 2.03 1.12 1 2.06 1.31 2.35 1.46.29.15.46.12.63-.07.17-.2.73-.85.92-1.14.19-.29.39-.24.65-.15.27.1 1.68.79 1.97.94.29.15.48.22.55.34.07.12.07.69-.17 1.37z" />
  </svg>
);

export const SemuaAdaPage: React.FC<SemuaAdaPageProps> = ({
  onBackHome,
  onGoToTv,
  onGoToLive,
  onGoToSeller,
}) => {
  const tiles = [
    {
      id: 'belanja',
      number: 1,
      title: 'Belanja',
      subtitle: 'Ke Beranda',
      badgeBg: 'bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-800 text-[#EE4D2D]',
      icon: <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />,
      type: 'internal' as const,
      onClick: onBackHome,
    },
    {
      id: 'tv',
      number: 2,
      title: 'VTC TV',
      subtitle: 'Siaran TV Live',
      badgeBg: 'bg-sky-50 dark:bg-sky-950/50 border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400',
      icon: <Tv className="w-5 h-5 sm:w-6 sm:h-6" />,
      type: 'internal' as const,
      onClick: onGoToTv,
    },
    {
      id: 'live',
      number: 3,
      title: 'VTC LIVE',
      subtitle: 'Live & Video',
      badgeBg: 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400',
      icon: <Radio className="w-5 h-5 sm:w-6 sm:h-6" />,
      type: 'internal' as const,
      onClick: onGoToLive,
    },
    {
      id: 'facebook',
      number: 4,
      title: 'Facebook',
      subtitle: 'facebook.com',
      badgeBg: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400',
      icon: <FacebookIcon className="w-5 h-5 sm:w-6 sm:h-6" />,
      type: 'external' as const,
      href: 'https://facebook.com',
    },
    {
      id: 'tiktok',
      number: 5,
      title: 'TikTok',
      subtitle: 'tiktok.com',
      badgeBg: 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white',
      icon: <TikTokIcon className="w-5 h-5 sm:w-6 sm:h-6" />,
      type: 'external' as const,
      href: 'https://tiktok.com',
    },
    {
      id: 'youtube',
      number: 6,
      title: 'YouTube',
      subtitle: 'youtube.com',
      badgeBg: 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400',
      icon: <YouTubeIcon className="w-5 h-5 sm:w-6 sm:h-6" />,
      type: 'external' as const,
      href: 'https://youtube.com',
    },
    {
      id: 'instagram',
      number: 7,
      title: 'Instagram',
      subtitle: 'instagram.com',
      badgeBg: 'bg-pink-50 dark:bg-pink-950/50 border-pink-200 dark:border-pink-800 text-pink-600 dark:text-pink-400',
      icon: <InstagramIcon className="w-5 h-5 sm:w-6 sm:h-6" />,
      type: 'external' as const,
      href: 'https://instagram.com',
    },
    {
      id: 'cs-admin',
      number: 8,
      title: 'CS VTC SHOP',
      subtitle: 'Admin Platform',
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400',
      icon: <WhatsAppIcon className="w-5 h-5 sm:w-6 sm:h-6" />,
      type: 'internal' as const,
      onClick: () => {
        openCsChatWindow();
      },
    },
    {
      id: 'jualan',
      number: 9,
      title: 'Jualan',
      subtitle: 'Pusat Seller',
      badgeBg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400',
      icon: <Store className="w-5 h-5 sm:w-6 sm:h-6" />,
      type: 'internal' as const,
      onClick: onGoToSeller,
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Top Action Bar with Back to Home */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBackHome}
          className="min-h-[42px] px-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-[#EE4D2D] text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-100 inline-flex items-center gap-2 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#EE4D2D]" />
          <span>Kembali ke Beranda</span>
        </button>

        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#EE4D2D] bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900 px-3 py-1.5 rounded-xl">
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Menu Cepat 3×3</span>
        </span>
      </div>

      {/* Header Banner */}
      <section className="rounded-2xl bg-gradient-to-r from-[#EE4D2D] to-[#FF6A00] text-white p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
            <LayoutGrid className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight">
              SEMUA ADA
            </h1>
            <p className="text-xs sm:text-sm text-white/90 mt-0.5">
              Satu pintu untuk Belanja, VTC TV, VTC LIVE, Media Sosial, WhatsApp CS & Pusat Seller.
            </p>
          </div>
        </div>
      </section>

      {/* Grid 3x3 Container (rapi seperti menu utama) */}
      <section
        aria-label="Daftar Menu Semua Ada"
        className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-3 sm:p-5 shadow-xs"
      >
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          {tiles.map((item) => {
            const innerContent = (
              <>
                <span
                  className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border flex items-center justify-center transition-transform group-hover:scale-105 ${item.badgeBg}`}
                >
                  {item.icon}
                  {item.type === 'external' && (
                    <span
                      aria-hidden="true"
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-300 flex items-center justify-center shadow-xs"
                    >
                      <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  )}
                </span>

                <div className="text-center space-y-0.5 min-w-0 w-full">
                  <p className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-zinc-100 leading-tight truncate">
                    {item.title}
                  </p>
                  <p className="text-[10px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400 leading-tight truncate">
                    {item.subtitle}
                  </p>
                </div>
              </>
            );

            const cardClass =
              'group flex flex-col items-center justify-center gap-2 sm:gap-2.5 p-3 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 hover:border-[#EE4D2D] hover:bg-orange-50/50 dark:hover:bg-zinc-800/70 active:scale-[0.98] transition-all cursor-pointer min-h-[112px] sm:min-h-[136px]';

            if (item.type === 'external') {
              return (
                <a
                  key={item.id}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cardClass}
                >
                  {innerContent}
                </a>
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                className={cardClass}
              >
                {innerContent}
              </button>
            );
          })}
        </div>

        {/* Bottom Back to Home button */}
        <div className="mt-4 sm:mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Klik menu media sosial untuk membuka di tab baru, atau Chat CS Admin langsung di aplikasi.
          </p>
          <button
            type="button"
            onClick={onBackHome}
            className="min-h-[42px] px-4 rounded-xl bg-[#EE4D2D] hover:bg-[#D73B1C] text-white text-xs sm:text-sm font-extrabold inline-flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </button>
        </div>
      </section>
    </div>
  );
};
