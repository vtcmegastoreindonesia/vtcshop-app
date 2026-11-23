import React from 'react';
import {
  Bell,
  X,
  CheckCheck,
  Tag,
  Coins,
  PackageCheck,
  Radio,
  Heart,
  Gamepad2,
  ShieldAlert,
} from 'lucide-react';
import { useMarketplace } from '../store/marketplaceStore';
import { AppNotification, AppTab, formatDateId } from '../types';

interface NotificationDrawerProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (tab: AppTab) => void;
}

const iconForType = (type: AppNotification['type']) => {
  switch (type) {
    case 'wishlist':
      return Heart;
    case 'live':
      return Radio;
    case 'voucher':
      return Tag;
    case 'coins':
      return Coins;
    case 'topup':
      return Gamepad2;
    case 'security':
      return ShieldAlert;
    default:
      return PackageCheck;
  }
};

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  open,
  onClose,
  onNavigate,
}) => {
  const { state, markNotificationRead, markAllNotificationsRead } = useMarketplace();

  if (!open) return null;

  const unreadCount = state.notifications.filter((n) => !n.read).length;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex justify-end"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-zinc-900 h-full flex flex-col shadow-2xl border-l border-zinc-200 dark:border-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#EE4D2D]" />
            <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
              Notifikasi ({unreadCount} baru)
            </h2>
          </div>
          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllNotificationsRead}
                className="min-h-[36px] px-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Tandai Dibaca</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup Notifikasi"
              className="w-9 h-9 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {state.notifications.length === 0 ? (
            <p className="text-center text-xs text-zinc-500 py-12">
              Belum ada notifikasi baru.
            </p>
          ) : (
            state.notifications.map((notif) => {
              const Icon = iconForType(notif.type);
              return (
                <button
                  key={notif.id}
                  type="button"
                  onClick={() => {
                    markNotificationRead(notif.id);
                    if (notif.targetTab) {
                      onNavigate(notif.targetTab);
                    }
                    onClose();
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl border flex items-start gap-3 transition-colors cursor-pointer ${
                    notif.read
                      ? 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                      : 'bg-orange-50/70 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900'
                  }`}
                >
                  <span
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      notif.read
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                        : 'bg-[#EE4D2D] text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">
                        {notif.title}
                      </p>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-[#EE4D2D] shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {notif.body}
                    </p>
                    <p className="text-[10px] text-zinc-400 pt-0.5">
                      {formatDateId(notif.createdAt)}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
