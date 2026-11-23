import React, { useEffect, useMemo, useState } from 'react';
import {
  ShoppingCart,
  Home,
  Tv,
  User,
  Settings,
  Zap,
  LogOut,
  ArrowLeft,
  PlusCircle,
  Bell,
  Sun,
  Moon,
  Globe,
  LayoutGrid,
} from 'lucide-react';
import { MarketplaceProvider, useMarketplace } from './store/marketplaceStore';
import { AppTab } from './types';
import { BuyerHome } from './components/BuyerHome';
import { VtvLivePage } from './components/VtvLivePage';
import { VtvSuperTvPage } from './components/VtvSuperTvPage';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';
import { TopUpGameHub } from './components/TopUpGameHub';
import { AffiliateHubPage } from './components/AffiliateHubPage';
import { VtvPayHubPage } from './components/VtvPayHubPage';
import { GamesVipHubPage } from './components/GamesVipHubPage';
import { NotificationDrawer } from './components/NotificationDrawer';
import { ProfilePage } from './components/ProfilePage';
import { BuyerOrdersView } from './components/BuyerOrdersView';
import { SellerDashboard } from './components/SellerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { SettingsLitePage } from './components/SettingsLitePage';
import { CartCheckoutDrawer } from './components/CartCheckoutDrawer';
import { LoginPage } from './components/LoginPage';
import { AiAssistantWidget } from './components/AiAssistantWidget';
import { Toast } from './components/Toast';
import { ProductDetailView } from './components/ProductDetailView';
import { SellerStorePage } from './components/SellerStorePage';
import { SellerChatModal } from './components/SellerChatModal';
import { VtcLogo } from './components/VtcLogo';
import { SemuaAdaPage } from './components/SemuaAdaPage';

const MarketplaceShell: React.FC = () => {
  const {
    state,
    authToken,
    currentUser,
    authChecking,
    toggleLiteMode,
    toggleThemeMode,
    setLanguage,
    logout,
    showToast,
  } = useMarketplace();
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [chatTarget, setChatTarget] = useState<{
    sellerId: string;
    productName?: string;
  } | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartInitialStep, setCartInitialStep] = useState<'cart' | 'checkout'>('cart');
  const [notifOpen, setNotifOpen] = useState(false);
  const [loginNotice, setLoginNotice] = useState('');
  const [liveInitialMode, setLiveInitialMode] = useState<'live' | 'video'>('live');
  const [topUpInitialTab, setTopUpInitialTab] = useState<'game' | 'ppob'>('game');
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSplashDone(true), state.liteMode ? 350 : 900);
    return () => clearTimeout(timer);
  }, [state.liteMode]);

  const isEn = state.language === 'en';

  const totalCartItems = useMemo(
    () => state.cart.reduce((sum, item) => sum + item.quantity, 0),
    [state.cart]
  );

  const unreadNotifs = useMemo(
    () => state.notifications.filter((n) => !n.read).length,
    [state.notifications]
  );

  // Strict route guard: if unauthenticated and user tries to open Pesanan / Seller / Admin / any tab, redirect to Login
  const navigateTo = (tab: AppTab) => {
    if (!authToken || !currentUser) {
      setLoginNotice(
        'Silakan login terlebih dahulu sebelum membuka Pesanan, Seller, atau Admin.'
      );
      return;
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: state.liteMode ? 'auto' : 'smooth' });
  };

  const openProductDetail = (productId: string) => {
    setSelectedProductId(productId);
    navigateTo('product');
  };

  const openSellerStore = (sellerId: string) => {
    setSelectedStoreId(sellerId);
    navigateTo('store');
  };

  if (!splashDone || authChecking) {
    return (
      <div className="min-h-screen bg-[#FF6A00] text-white flex flex-col items-center justify-center p-6 select-none">
        <div className="flex flex-col items-center justify-center gap-3">
          <svg
            viewBox="0 0 100 100"
            className="w-36 h-36 sm:w-44 sm:h-44 block"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Logo VTC SHOP"
          >
            <path
              d="M25 19 H39.5 L50 50 L60.5 19 H75 L57 68 H43 Z"
              fill="#FFFFFF"
            />
            <text
              x="50"
              y="85"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="11.5"
              fontWeight="800"
              fontFamily="Plus Jakarta Sans, system-ui, -apple-system, sans-serif"
              letterSpacing="0.9"
            >
              VTC SHOP
            </text>
          </svg>
          <p className="text-xs font-semibold text-white/90 tracking-wide">
            {authChecking ? 'Memverifikasi akun Anda...' : 'Memuat VTC SHOP INDONESIA...'}
          </p>
        </div>
      </div>
    );
  }

  if (!authToken || !currentUser) {
    return (
      <>
        <LoginPage
          notice={loginNotice}
          onSuccess={() => {
            setLoginNotice('');
            setActiveTab('home');
          }}
        />
        <Toast />
      </>
    );
  }

  const desktopNavItems: { id: AppTab; label: string }[] = [
    { id: 'home', label: isEn ? 'Home' : 'Beranda' },
    { id: 'tv', label: 'VTC TV' },
    { id: 'semua', label: 'SEMUA ADA' },
    { id: 'orders', label: isEn ? 'Orders' : 'Pesanan Saya' },
    { id: 'seller', label: isEn ? 'Sell' : 'Jualan' },
    { id: 'profile', label: isEn ? 'My Account' : 'Akun Saya' },
  ];

  const isProfileSubPage =
    activeTab === 'orders' ||
    activeTab === 'seller' ||
    activeTab === 'admin' ||
    activeTab === 'settings' ||
    activeTab === 'affiliate' ||
    activeTab === 'games' ||
    activeTab === 'topup' ||
    activeTab === 'pay';

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F5] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      <OfflineIndicator />
      {/* Sticky Top Bar (Strict 3 Zones) */}
      <header className="sticky top-0 z-40 h-[52px] sm:h-16 bg-[#111113] text-white border-b border-zinc-800">
        <div className="max-w-6xl mx-auto h-full px-4 flex items-center justify-between gap-6">
          {/* Zone 1: Brand Wordmark */}
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="flex items-center shrink-0 cursor-pointer"
          >
            <VtcLogo size="md" />
          </button>

          {/* Zone 2: Desktop Navigation Links */}
          <nav
            aria-label="Navigasi Utama"
            className="hidden md:flex items-center gap-7"
          >
            {desktopNavItems.map((item) => {
              const active =
                activeTab === item.id ||
                (item.id === 'tv' && activeTab === 'live') ||
                (item.id === 'profile' &&
                  (activeTab === 'admin' ||
                    activeTab === 'settings' ||
                    activeTab === 'affiliate' ||
                    activeTab === 'games' ||
                    activeTab === 'pay'));
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigateTo(item.id)}
                  className={`relative py-2 text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'text-[#EE4D2D]'
                      : 'text-zinc-300 hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#EE4D2D] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action (Cart Button) */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => {
                setCartInitialStep('cart');
                setCartOpen(true);
              }}
              aria-label="Buka Keranjang Belanja"
              className="min-h-[40px] sm:min-h-[44px] px-3.5 sm:px-4 rounded-xl bg-[#EE4D2D] hover:bg-[#D73B1C] text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4 shrink-0" />
              <span>{isEn ? 'Cart' : 'Keranjang'}</span>
              <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-white text-[#EE4D2D] text-xs font-extrabold flex items-center justify-center tabular-nums">
                {totalCartItems}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Non-sticky Account + Notif + Dark/Light + ID/EN + Mode Lite + Pengaturan Strip */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate">
              {isEn ? 'Hi' : 'Halo'}, {currentUser.name}
            </span>
            <span aria-hidden="true" className="text-zinc-300 dark:text-zinc-700">·</span>
            <span className="text-zinc-500 dark:text-zinc-400 truncate">
              {currentUser.authMethod}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {/* Quick Pesanan Saya */}
            <button
              type="button"
              onClick={() => navigateTo('orders')}
              className={`min-h-[34px] px-2.5 rounded-lg font-bold inline-flex items-center gap-1 cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-[#EE4D2D] text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              <span>{isEn ? 'My Orders' : 'Pesanan Saya'}</span>
            </button>

            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => setNotifOpen(true)}
              aria-label="Notifikasi"
              className="relative min-h-[34px] px-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-[#EE4D2D]" />
              <span className="hidden sm:inline">{isEn ? 'Alerts' : 'Notifikasi'}</span>
              {unreadNotifs > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#EE4D2D] text-white text-[10px] font-extrabold flex items-center justify-center tabular-nums">
                  {unreadNotifs}
                </span>
              )}
            </button>

            {/* Dark / Light Theme Toggle */}
            <button
              type="button"
              onClick={() => toggleThemeMode()}
              title={state.themeMode === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
              aria-label="Ganti Mode Gelap atau Terang"
              className="min-h-[34px] px-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              {state.themeMode === 'dark' ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">
                {state.themeMode === 'dark' ? 'Terang' : 'Gelap'}
              </span>
            </button>

            {/* Language Switch ID/EN */}
            <button
              type="button"
              onClick={() => setLanguage(state.language === 'id' ? 'en' : 'id')}
              title="Bahasa ID / EN"
              className="min-h-[34px] px-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span className="uppercase">{state.language}</span>
            </button>

            {/* Mode Lite */}
            <button
              type="button"
              onClick={() => toggleLiteMode()}
              className={`min-h-[34px] px-2.5 sm:px-3 rounded-lg font-bold inline-flex items-center gap-1.5 cursor-pointer ${
                state.liteMode
                  ? 'bg-[#EE4D2D] text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{state.liteMode ? 'Mode Lite: ON' : 'Mode Lite'}</span>
            </button>

            {/* Settings */}
            <button
              type="button"
              onClick={() => navigateTo('settings')}
              className={`min-h-[34px] px-2.5 sm:px-3 rounded-lg font-bold inline-flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-[#111113] text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isEn ? 'Settings' : 'Pengaturan'}
              </span>
            </button>

            {/* PWA Install & Share Link */}
            <PWAInstallButton compact onNotify={(msg) => showToast(msg)} />

            {/* Logout */}
            <button
              type="button"
              onClick={logout}
              title="Keluar Akun"
              className="min-h-[34px] px-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 hover:text-rose-700 text-zinc-600 dark:text-zinc-300 font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isEn ? 'Logout' : 'Keluar'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 pt-4 sm:pt-6 pb-24 md:pb-24">
        {isProfileSubPage && (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => navigateTo('profile')}
              className="min-h-[40px] px-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-100 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isEn ? 'Back to Profile' : 'Kembali ke Profil'}</span>
            </button>
          </div>
        )}

        {activeTab === 'home' && (
          <BuyerHome
            onGoToLive={() => {
              setLiveInitialMode('live');
              navigateTo('live');
            }}
            onGoToVideo={() => {
              setLiveInitialMode('video');
              navigateTo('live');
            }}
            onOpenProduct={openProductDetail}
            onOpenStore={openSellerStore}
            onNavigate={navigateTo}
            onOpenTopUpHub={(tab) => {
              setTopUpInitialTab(tab);
              navigateTo('topup');
            }}
          />
        )}
        {activeTab === 'product' && selectedProductId && (
          <ProductDetailView
            productId={selectedProductId}
            onBack={() =>
              selectedStoreId ? navigateTo('store') : navigateTo('home')
            }
            onOpenProduct={openProductDetail}
            onOpenStore={openSellerStore}
            onOpenCheckout={() => {
              setCartInitialStep('checkout');
              setCartOpen(true);
            }}
            onOpenChat={(sellerId, productName) =>
              setChatTarget({ sellerId, productName })
            }
          />
        )}
        {activeTab === 'store' && selectedStoreId && (
          <SellerStorePage
            sellerId={selectedStoreId}
            onBack={() => {
              setSelectedStoreId(null);
              navigateTo('home');
            }}
            onOpenProduct={openProductDetail}
            onOpenChat={(sellerId) => setChatTarget({ sellerId })}
          />
        )}
        {activeTab === 'tv' && (
          <VtvSuperTvPage
            onOpenProduct={openProductDetail}
            onOpenCheckout={() => setCartOpen(true)}
            onGoToLiveStudio={() => {
              setLiveInitialMode('live');
              navigateTo('live');
            }}
          />
        )}
        {activeTab === 'live' && (
          <VtvLivePage
            initialMode={liveInitialMode}
            onOpenCheckout={() => setCartOpen(true)}
          />
        )}
        {activeTab === 'topup' && <TopUpGameHub initialTab={topUpInitialTab} />}
        {activeTab === 'pay' && <VtvPayHubPage />}
        {activeTab === 'affiliate' && <AffiliateHubPage />}
        {activeTab === 'games' && <GamesVipHubPage />}
        {activeTab === 'profile' && <ProfilePage onNavigate={navigateTo} />}
        {activeTab === 'orders' && <BuyerOrdersView />}
        {activeTab === 'seller' && (
          <SellerDashboard
            onGoToAdmin={() => navigateTo('admin')}
            onGoToLive={() => {
              setLiveInitialMode('live');
              navigateTo('live');
            }}
          />
        )}
        {activeTab === 'admin' && <AdminDashboard />}
        {activeTab === 'settings' && <SettingsLitePage />}
        {activeTab === 'semua' && (
          <SemuaAdaPage
            onBackHome={() => navigateTo('home')}
            onGoToTv={() => navigateTo('tv')}
            onGoToLive={() => {
              setLiveInitialMode('live');
              navigateTo('live');
            }}
            onGoToSeller={() => navigateTo('seller')}
          />
        )}
      </main>

      {/* Clean Footer */}
      <footer className="hidden md:block border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-6xl mx-auto px-4 pt-6 pb-20 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          <p>
            © 2026 VTC SHOP INDONESIA · VTC Super TV · Support Android 5.0+ & RAM 3GB
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigateTo('tv')}
              className="font-semibold text-zinc-700 dark:text-zinc-300 hover:text-[#EE4D2D] cursor-pointer"
            >
              VTC Super TV
            </button>
            <button
              type="button"
              onClick={() => navigateTo('pay')}
              className="font-semibold text-zinc-700 dark:text-zinc-300 hover:text-[#EE4D2D] cursor-pointer"
            >
              VTC Pay
            </button>
            <button
              type="button"
              onClick={() => navigateTo('affiliate')}
              className="font-semibold text-zinc-700 dark:text-zinc-300 hover:text-[#EE4D2D] cursor-pointer"
            >
              Affiliate
            </button>
            <button
              type="button"
              onClick={() => navigateTo('profile')}
              className="font-semibold text-zinc-700 dark:text-zinc-300 hover:text-[#EE4D2D] cursor-pointer"
            >
              Profil (Pesanan · Seller · Admin · Pengaturan)
            </button>
          </div>
        </div>
      </footer>

      {/* Desktop Floating Bottom-Center Menu: SEMUA ADA */}
      <div className="hidden md:flex fixed bottom-5 left-1/2 -translate-x-1/2 z-40">
        <button
          type="button"
          onClick={() => navigateTo('semua')}
          aria-label="Buka Menu Semua Ada"
          className={`h-12 px-5 rounded-2xl border shadow-xl inline-flex items-center gap-2 font-extrabold text-sm cursor-pointer active:scale-[0.97] transition-colors ${
            activeTab === 'semua'
              ? 'bg-[#D73B1C] border-white text-white ring-4 ring-[#EE4D2D]/25'
              : 'bg-[#EE4D2D] hover:bg-[#D73B1C] border-white/80 text-white'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>SEMUA ADA</span>
        </button>
      </div>

      {/* Fixed Mobile Bottom Navigation: Beranda, VTC TV, SEMUA ADA (tengah), Jualan, Keranjang, Akun Saya */}
      <nav
        aria-label="Navigasi Mobile"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-[64px] bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-6 items-center px-0.5"
      >
        {/* 1. Beranda */}
        <button
          type="button"
          onClick={() => navigateTo('home')}
          className={`h-full min-h-[44px] flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
            activeTab === 'home' ? 'text-[#EE4D2D]' : 'text-zinc-500 dark:text-zinc-400'
          }`}
        >
          <Home className="w-5 h-5" strokeWidth={activeTab === 'home' ? 2.4 : 1.8} />
          <span className="text-[10px] font-semibold tracking-tight whitespace-nowrap">
            {isEn ? 'Home' : 'Beranda'}
          </span>
        </button>

        {/* 2. VTC TV */}
        <button
          type="button"
          onClick={() => navigateTo('tv')}
          className={`h-full min-h-[44px] flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
            activeTab === 'tv' || activeTab === 'live'
              ? 'text-[#EE4D2D]'
              : 'text-zinc-500 dark:text-zinc-400'
          }`}
        >
          <Tv
            className="w-5 h-5"
            strokeWidth={activeTab === 'tv' || activeTab === 'live' ? 2.4 : 1.8}
          />
          <span className="text-[10px] font-semibold tracking-tight whitespace-nowrap">
            VTC TV
          </span>
        </button>

        {/* 3. SEMUA ADA (Menu Baru di Bawah Tengah) */}
        <button
          type="button"
          onClick={() => navigateTo('semua')}
          className="relative -mt-4 flex flex-col items-center justify-center gap-0.5 cursor-pointer"
        >
          <span
            className={`w-12 h-12 rounded-2xl text-white shadow-lg shadow-[#EE4D2D]/35 ring-4 ring-white dark:ring-zinc-900 flex items-center justify-center ${
              activeTab === 'semua'
                ? 'bg-[#D73B1C]'
                : 'bg-[#EE4D2D] hover:bg-[#D73B1C]'
            }`}
          >
            <LayoutGrid className="w-5 h-5" strokeWidth={2.2} />
          </span>
          <span
            className={`text-[9.5px] font-extrabold tracking-tight whitespace-nowrap ${
              activeTab === 'semua'
                ? 'text-[#EE4D2D]'
                : 'text-zinc-800 dark:text-zinc-200'
            }`}
          >
            SEMUA ADA
          </span>
        </button>

        {/* 4. Jualan */}
        <button
          type="button"
          onClick={() => navigateTo('seller')}
          className={`h-full min-h-[44px] flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
            activeTab === 'seller'
              ? 'text-[#EE4D2D]'
              : 'text-zinc-500 dark:text-zinc-400'
          }`}
        >
          <PlusCircle
            className="w-5 h-5"
            strokeWidth={activeTab === 'seller' ? 2.4 : 1.8}
          />
          <span className="text-[10px] font-semibold tracking-tight whitespace-nowrap">
            {isEn ? 'Sell' : 'Jualan'}
          </span>
        </button>

        {/* 4. Keranjang */}
        <button
          type="button"
          onClick={() => {
            setCartInitialStep('cart');
            setCartOpen(true);
          }}
          className="relative h-full min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-zinc-500 dark:text-zinc-400 hover:text-[#EE4D2D] cursor-pointer"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5" strokeWidth={1.8} />
            {totalCartItems > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-[#EE4D2D] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                {totalCartItems}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold tracking-tight whitespace-nowrap">
            {isEn ? 'Cart' : 'Keranjang'}
          </span>
        </button>

        {/* 6. Akun Saya (berisi Profil, Pesanan Saya, Seller, Admin, Pengaturan & Ekosistem Super App) */}
        <button
          type="button"
          onClick={() => navigateTo('profile')}
          className={`h-full min-h-[44px] flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
            activeTab === 'profile' || isProfileSubPage
              ? 'text-[#EE4D2D]'
              : 'text-zinc-500 dark:text-zinc-400'
          }`}
        >
          <User
            className="w-5 h-5"
            strokeWidth={
              activeTab === 'profile' || isProfileSubPage ? 2.4 : 1.8
            }
          />
          <span className="text-[10px] font-semibold tracking-tight whitespace-nowrap">
            {isEn ? 'Account' : 'Akun Saya'}
          </span>
        </button>
      </nav>

      {/* Cart & Checkout Drawer */}
      <CartCheckoutDrawer
        open={cartOpen}
        initialStep={cartInitialStep}
        onClose={() => setCartOpen(false)}
        onOrderSuccess={() => navigateTo('orders')}
      />

      {/* Notifications Drawer */}
      <NotificationDrawer
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        onNavigate={navigateTo}
      />

      {/* Chat Toko / Seller Modal */}
      <SellerChatModal
        sellerId={chatTarget?.sellerId ?? null}
        productContextName={chatTarget?.productName}
        onClose={() => setChatTarget(null)}
      />

      {/* Floating CS 24 Jam & Bantuan Belanja */}
      <AiAssistantWidget liftOnMobile={activeTab === 'product'} />

      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <MarketplaceProvider>
      <MarketplaceShell />
    </MarketplaceProvider>
  );
}
