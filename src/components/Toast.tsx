import React from 'react';
import { CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { useMarketplace } from '../store/marketplaceStore';

export const Toast: React.FC = () => {
  const { toast } = useMarketplace();
  if (!toast) return null;

  const styles =
    toast.tone === 'warning'
      ? 'bg-amber-950 text-amber-50 border-amber-800'
      : toast.tone === 'info'
        ? 'bg-zinc-900 text-white border-zinc-700'
        : 'bg-zinc-900 text-white border-zinc-700';

  const Icon =
    toast.tone === 'warning'
      ? AlertTriangle
      : toast.tone === 'info'
        ? Info
        : CheckCircle2;

  const iconColor =
    toast.tone === 'warning'
      ? 'text-amber-400'
      : toast.tone === 'info'
        ? 'text-sky-400'
        : 'text-emerald-400';

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md pointer-events-none"
    >
      <div
        className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border shadow-xl text-sm font-medium ${styles}`}
      >
        <Icon className={`w-5 h-5 shrink-0 ${iconColor}`} />
        <span className="leading-snug">{toast.text}</span>
      </div>
    </div>
  );
};
