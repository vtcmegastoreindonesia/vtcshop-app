import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      setShowBackOnline(false);
    };
    const handleOnline = () => {
      setIsOffline(false);
      setShowBackOnline(true);
      window.setTimeout(() => setShowBackOnline(false), 3000);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline && !showBackOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`px-3 py-2 text-xs font-bold flex items-center justify-center gap-2 ${
        isOffline
          ? 'bg-zinc-900 text-amber-300 border-b border-amber-500/40'
          : 'bg-emerald-600 text-white'
      }`}
    >
      {isOffline ? (
        <>
          <WifiOff className="w-3.5 h-3.5 shrink-0" />
          <span>
            Mode Offline Aktif — Katalog, keranjang & pesanan tersimpan tetap bisa dibuka.
          </span>
        </>
      ) : (
        <>
          <Wifi className="w-3.5 h-3.5 shrink-0" />
          <span>Koneksi internet kembali terhubung!</span>
        </>
      )}
    </div>
  );
};
