import React, { useEffect, useMemo, useState } from 'react';
import {
  ShieldCheck,
  Store,
  Wallet,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Lock,
  MessageSquareText,
  Package,
  ShoppingBag,
  Percent,
} from 'lucide-react';
import { useMarketplace } from '../store/marketplaceStore';
import { formatDateId, formatRupiah } from '../types';
import { CsAdminInboxPanel } from './CsAdminInboxPanel';
import { CS_UPDATE_EVENT, loadCsThreads } from '../store/csChatStore';

type AdminSubTab = 'sellers' | 'escrow' | 'complaints' | 'cs';

export const AdminDashboard: React.FC = () => {
  const {
    state,
    authToken,
    currentUser,
    setAuthSession,
    approveSeller,
    rejectSeller,
    releaseFundsToSeller,
    refundToBuyer,
    setPlatformFeePercent,
    showToast,
  } = useMarketplace();

  const [tab, setTab] = useState<AdminSubTab>('sellers');
  const [feeInput, setFeeInput] = useState<string>(
    String(state.platformFeePercent ?? 5)
  );
  useEffect(() => {
    setFeeInput(String(state.platformFeePercent ?? 5));
  }, [state.platformFeePercent]);
  const [csUnreadCount, setCsUnreadCount] = useState<number>(() =>
    loadCsThreads().reduce((sum, t) => sum + (t.unreadByAdmin || 0), 0)
  );
  useEffect(() => {
    const syncUnread = () =>
      setCsUnreadCount(
        loadCsThreads().reduce((sum, t) => sum + (t.unreadByAdmin || 0), 0)
      );
    window.addEventListener(CS_UPDATE_EVENT, syncUnread);
    window.addEventListener('storage', syncUnread);
    return () => {
      window.removeEventListener(CS_UPDATE_EVENT, syncUnread);
      window.removeEventListener('storage', syncUnread);
    };
  }, []);
  const [adminStatusLoading, setAdminStatusLoading] = useState(true);
  const [needsClaim, setNeedsClaim] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [submittingPass, setSubmittingPass] = useState(false);

  useEffect(() => {
    let active = true;
    const checkStatus = async () => {
      if (!authToken) {
        setAdminStatusLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/admin/status', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const data = await res.json();
        if (active && res.ok) {
          setNeedsClaim(!data.hasEnvPasscode && !data.isClaimed);
        }
      } catch {
        // ignore transient errors
      } finally {
        if (active) setAdminStatusLoading(false);
      }
    };
    checkStatus();
    return () => {
      active = false;
    };
  }, [authToken]);

  const handleAdminPassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken) return;
    setAuthError('');
    setSubmittingPass(true);
    try {
      const endpoint = needsClaim ? '/api/admin/claim' : '/api/admin/verify';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ passcode: passcodeInput }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Akses Admin ditolak');
      }
      setAuthSession(data.token, data.user);
      setPasscodeInput('');
      setNeedsClaim(false);
      showToast('Akses Admin VTC SHOP INDONESIA terverifikasi!');
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : 'Passcode Admin tidak valid'
      );
    } finally {
      setSubmittingPass(false);
    }
  };

  const pendingSellers = useMemo(
    () => state.sellers.filter((s) => s.status === 'pending'),
    [state.sellers]
  );

  const heldOrders = useMemo(
    () =>
      state.orders.filter(
        (o) => o.escrowStatus === 'held' && o.status !== 'Komplain'
      ),
    [state.orders]
  );

  const complaintOrders = useMemo(
    () => state.orders.filter((o) => o.status === 'Komplain'),
    [state.orders]
  );

  const completedEscrowOrders = useMemo(
    () => state.orders.filter((o) => o.escrowStatus !== 'held'),
    [state.orders]
  );

  const approvedSellersCount = useMemo(
    () => state.sellers.filter((s) => s.status === 'approved').length,
    [state.sellers]
  );

  const totalGmv = useMemo(
    () =>
      state.orders
        .filter((o) => o.status !== 'Dana Dikembalikan')
        .reduce((sum, o) => sum + o.subtotal, 0),
    [state.orders]
  );

  const platformFeePct = state.platformFeePercent ?? 5;
  const totalCommissionEarned = useMemo(
    () =>
      Math.round(
        (state.orders
          .filter((o) => o.escrowStatus === 'released')
          .reduce((sum, o) => sum + o.subtotal, 0) *
          platformFeePct) /
          100
      ),
    [state.orders, platformFeePct]
  );

  // Strict server-verified Admin Guard
  if (currentUser?.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto py-8">
        <div className="bg-[#111113] text-white rounded-3xl p-6 space-y-5 border border-zinc-800 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EE4D2D] flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold">
                {needsClaim
                  ? 'Buat Passcode Admin VTC SHOP INDONESIA'
                  : 'Kunci Keamanan Admin VTC SHOP INDONESIA'}
              </h1>
              <p className="text-xs text-zinc-400">
                {needsClaim
                  ? 'Setup pertama kali: buat passcode khusus Admin (min. 6 karakter).'
                  : 'Masukkan passcode Admin VTC SHOP INDONESIA untuk membuka ACC Seller, Lepas Dana & Refund.'}
              </p>
            </div>
          </div>

          {adminStatusLoading ? (
            <p className="text-xs text-zinc-400 py-4 text-center">
              Memeriksa status keamanan Admin...
            </p>
          ) : (
            <form onSubmit={handleAdminPassSubmit} className="space-y-4">
              {authError && (
                <div className="rounded-xl bg-rose-950/70 border border-rose-500/40 px-3.5 py-2.5 text-xs font-semibold text-rose-200">
                  {authError}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  {needsClaim
                    ? 'Buat Passcode Admin Baru'
                    : 'Passcode Admin VTC SHOP INDONESIA'}
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full h-12 px-4 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none focus:border-[#EE4D2D]"
                />
              </div>
              <button
                type="submit"
                disabled={submittingPass}
                className="w-full h-12 rounded-xl bg-[#EE4D2D] hover:bg-[#D73B1C] text-white font-bold text-sm cursor-pointer disabled:opacity-60"
              >
                {submittingPass
                  ? 'Memverifikasi...'
                  : needsClaim
                    ? 'Simpan & Masuk Admin VTC SHOP INDONESIA'
                    : 'Buka Panel Admin VTC SHOP INDONESIA'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Platform Owner Header & KPI Overview */}
      <section className="bg-[#111113] text-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#EE4D2D] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-extrabold">
              Dashboard Admin Platform VTC SHOP
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300">
              Pemilik Platform (Bukan Seller): kelola verifikasi seller, biaya admin platform, escrow, komplain & CS VTC SHOP.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 pt-1">
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-[11px] sm:text-xs text-zinc-300 inline-flex items-center gap-1">
              <Store className="w-3.5 h-3.5 text-[#EE4D2D]" /> Total Seller
            </p>
            <p className="text-xl sm:text-2xl font-extrabold tabular-nums mt-0.5">
              {state.sellers.length}
            </p>
            <p className="text-[10px] text-zinc-400">
              {approvedSellersCount} Aktif · {pendingSellers.length} Pending
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-[11px] sm:text-xs text-zinc-300 inline-flex items-center gap-1">
              <Package className="w-3.5 h-3.5 text-sky-400" /> Total Produk
            </p>
            <p className="text-xl sm:text-2xl font-extrabold tabular-nums mt-0.5">
              {state.products.length}
            </p>
            <p className="text-[10px] text-zinc-400">
              Dikelola masing-masing seller
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-[11px] sm:text-xs text-zinc-300 inline-flex items-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" /> Total Transaksi
            </p>
            <p className="text-xl sm:text-2xl font-extrabold tabular-nums mt-0.5">
              {state.orders.length}
            </p>
            <p className="text-[10px] text-zinc-400 tabular-nums">
              Nilai: {formatRupiah(totalGmv)}
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-[11px] sm:text-xs text-zinc-300 inline-flex items-center gap-1">
              <Percent className="w-3.5 h-3.5 text-emerald-400" /> Komisi ({platformFeePct}%)
            </p>
            <p className="text-lg sm:text-xl font-extrabold text-emerald-400 tabular-nums mt-0.5">
              {formatRupiah(totalCommissionEarned)}
            </p>
            <p className="text-[10px] text-zinc-400">
              Escrow Ditahan: {heldOrders.length}
            </p>
          </div>
        </div>
      </section>

      {/* Admin Sub-Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white p-1.5 rounded-2xl border border-zinc-200">
        {[
          {
            id: 'sellers' as const,
            label: `Verifikasi Seller (${pendingSellers.length})`,
            icon: Store,
          },
          {
            id: 'escrow' as const,
            label: `Komisi & Escrow (${heldOrders.length})`,
            icon: Wallet,
          },
          {
            id: 'complaints' as const,
            label: `Laporan & Komplain (${complaintOrders.length + state.fraudReports.length})`,
            icon: AlertCircle,
          },
          {
            id: 'cs' as const,
            label: `CS VTC SHOP${csUnreadCount > 0 ? ` (${csUnreadCount})` : ''}`,
            icon: MessageSquareText,
          },
        ].map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`min-h-[46px] px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                active
                  ? 'bg-[#EE4D2D] text-white'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: ACC Seller */}
      {tab === 'sellers' && (
        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-900">
              Pengajuan Seller Baru ({pendingSellers.length})
            </h2>
            {pendingSellers.length === 0 ? (
              <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center text-sm text-zinc-500">
                Tidak ada pengajuan Seller baru yang menunggu ACC.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingSellers.map((seller) => (
                  <article
                    key={seller.id}
                    className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-zinc-900">
                          {seller.storeName}
                        </h3>
                        <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
                          Menunggu ACC
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-zinc-600">
                        Pemilik: {seller.ownerName} · {seller.phone} · {seller.city} · {seller.category}
                      </p>
                      <p className="text-xs text-zinc-500">{seller.description}</p>
                    </div>

                    <div className="grid grid-cols-2 sm:flex items-center gap-2.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => rejectSeller(seller.id)}
                        className="min-h-[46px] px-4 rounded-xl border border-rose-200 text-rose-700 font-bold text-sm hover:bg-rose-50 inline-flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" /> Tolak
                      </button>
                      <button
                        type="button"
                        onClick={() => approveSeller(seller.id)}
                        className="min-h-[46px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm inline-flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" /> ACC Seller
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-bold text-zinc-900">
              Daftar Seluruh Toko Terdaftar
            </h3>
            <div className="bg-white rounded-2xl border border-zinc-200 divide-y divide-zinc-100">
              {state.sellers.map((seller) => {
                const prodCount = state.products.filter(
                  (p) => p.sellerId === seller.id
                ).length;
                return (
                  <div
                    key={seller.id}
                    className="p-4 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-sm font-bold text-zinc-900">
                        {seller.storeName}
                      </p>
                      <p className="text-xs text-zinc-500">
                        Pemilik: {seller.ownerName} · {seller.phone} · {seller.city} · {seller.category} · {prodCount} Produk
                      </p>
                    </div>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 ${
                        seller.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : seller.status === 'pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {seller.status === 'approved'
                        ? 'Aktif (ACC)'
                        : seller.status === 'pending'
                          ? 'Menunggu Verifikasi'
                          : 'Ditolak'}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* Tab 2: Pengaturan Komisi / Biaya Admin Platform & Lepas Dana Escrow */}
      {tab === 'escrow' && (
        <div className="space-y-6">
          <section className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-zinc-900 inline-flex items-center gap-2">
                  <Percent className="w-5 h-5 text-[#EE4D2D]" />
                  <span>Pengaturan Komisi / Biaya Admin Platform</span>
                </h2>
                <p className="text-xs text-zinc-500">
                  Persentase biaya admin yang masuk ke Pemilik Platform dari setiap transaksi seller yang selesai.
                </p>
              </div>
              <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl tabular-nums">
                Aktif: {platformFeePct}% / transaksi
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const parsed = Number(feeInput);
                if (!isNaN(parsed)) {
                  setPlatformFeePercent(parsed);
                }
              }}
              className="flex flex-wrap items-center gap-2.5"
            >
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={30}
                  step={0.5}
                  value={feeInput}
                  onChange={(e) => setFeeInput(e.target.value)}
                  className="w-24 h-11 px-3 rounded-xl border border-zinc-200 font-mono text-sm font-bold text-zinc-900 focus:outline-none focus:border-[#EE4D2D]"
                />
                <span className="text-sm font-bold text-zinc-600">%</span>
              </div>
              <button
                type="submit"
                className="min-h-[44px] px-4 rounded-xl bg-[#EE4D2D] hover:bg-[#D73B1C] text-white text-xs sm:text-sm font-bold cursor-pointer"
              >
                Simpan Komisi Platform
              </button>
              <div className="flex items-center gap-1.5 ml-auto">
                {[3, 5, 8, 10].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setFeeInput(String(preset));
                      setPlatformFeePercent(preset);
                    }}
                    className={`min-h-[36px] px-3 rounded-lg text-xs font-bold border cursor-pointer ${
                      platformFeePct === preset
                        ? 'bg-[#111113] text-white border-[#111113]'
                        : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-[#EE4D2D]'
                    }`}
                  >
                    {preset}%
                  </button>
                ))}
              </div>
            </form>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-900">
              Dana Pesanan Ditahan VTC SHOP INDONESIA ({heldOrders.length})
            </h2>
            {heldOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center text-sm text-zinc-500">
                Semua dana pesanan non-komplain telah diproses.
              </div>
            ) : (
              <div className="space-y-3">
                {heldOrders.map((order) => {
                  const sellerName = order.items[0]?.sellerName ?? 'Toko Seller';
                  return (
                    <article
                      key={order.id}
                      className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-zinc-900">
                            {order.id}
                          </span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-orange-50 text-[#EE4D2D] border border-orange-200">
                            Status: {order.status}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-zinc-900">
                          Seller: {sellerName} · Buyer: {order.buyerName}
                        </p>
                        <p className="text-xs text-zinc-500">
                          Kurir: {order.courier} · Resi: {order.trackingNumber || 'Belum diinput'} · Nilai Produk:{' '}
                          <strong className="text-zinc-900 tabular-nums">
                            {formatRupiah(order.subtotal)}
                          </strong>
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => refundToBuyer(order.id)}
                          className="min-h-[46px] px-4 rounded-xl border border-rose-200 text-rose-700 font-bold text-xs sm:text-sm hover:bg-rose-50 cursor-pointer"
                        >
                          Refund ke Buyer
                        </button>
                        <button
                          type="button"
                          onClick={() => releaseFundsToSeller(order.id)}
                          className="min-h-[46px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm cursor-pointer"
                        >
                          Lepas Dana ke Seller
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {completedEscrowOrders.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-base font-bold text-zinc-900">
                Riwayat Pelepasan & Refund Dana
              </h3>
              <div className="bg-white rounded-2xl border border-zinc-200 divide-y divide-zinc-100">
                {completedEscrowOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 flex flex-wrap items-center justify-between gap-2"
                  >
                    <div>
                      <p className="text-sm font-bold text-zinc-900 font-mono">
                        {order.id}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {order.items[0]?.sellerName} · Buyer: {order.buyerName} ·{' '}
                        {formatDateId(order.updatedAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-extrabold tabular-nums text-zinc-900">
                        {formatRupiah(order.subtotal)}
                      </p>
                      <span
                        className={`text-xs font-bold ${
                          order.escrowStatus === 'released'
                            ? 'text-emerald-700'
                            : 'text-rose-700'
                        }`}
                      >
                        {order.escrowStatus === 'released'
                          ? 'Dilepas ke Seller'
                          : 'Refund ke Buyer'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Tab 3: Komplain & Refund Buyer */}
      {tab === 'complaints' && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-zinc-900">
            Penanganan Komplain & Refund Buyer ({complaintOrders.length})
          </h2>

          {complaintOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-zinc-200 p-10 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-base font-bold text-zinc-800">
                Tidak ada komplain aktif
              </p>
              <p className="text-sm text-zinc-500">
                Jika Buyer menekan tombol Komplain di halaman Pesanan Saya, laporan akan masuk ke sini untuk diputuskan Refund atau Lepas Dana.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {complaintOrders.map((order) => (
                <article
                  key={order.id}
                  className="bg-white rounded-2xl border border-rose-200 p-4 sm:p-5 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-zinc-900">
                        {order.id}
                      </span>
                      <span className="mx-2 text-zinc-300">·</span>
                      <span className="text-xs text-zinc-500">
                        Buyer: {order.buyerName} ({order.buyerPhone})
                      </span>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                      Komplain Pembeli
                    </span>
                  </div>

                  <div className="bg-rose-50/70 border border-rose-100 rounded-xl p-3.5 text-sm text-rose-950">
                    <p className="text-xs font-bold text-rose-800 mb-1">
                      Alasan Komplain Buyer:
                    </p>
                    <p>{order.complaintReason || 'Tidak ada catatan detail.'}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <div className="text-sm">
                      <span className="text-zinc-500">Total Refund: </span>
                      <span className="font-extrabold text-zinc-900 tabular-nums">
                        {formatRupiah(order.totalAmount)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => releaseFundsToSeller(order.id)}
                        className="min-h-[46px] px-4 rounded-xl border border-emerald-300 text-emerald-700 font-bold text-sm hover:bg-emerald-50 cursor-pointer"
                      >
                        Lepas Dana ke Seller
                      </button>
                      <button
                        type="button"
                        onClick={() => refundToBuyer(order.id)}
                        className="min-h-[46px] px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm inline-flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Refund ke Buyer
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Fraud Reports 1-Klik */}
          <div className="pt-4 space-y-3">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Laporan Penipu & Pelanggaran Keamanan 1-Klik ({state.fraudReports.length})
            </h3>
            {state.fraudReports.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 text-center text-xs text-zinc-500">
                Belum ada laporan pelanggaran keamanan.
              </div>
            ) : (
              <div className="space-y-2.5">
                {state.fraudReports.map((rep) => (
                  <div
                    key={rep.id}
                    className="bg-white dark:bg-zinc-900 rounded-2xl border border-amber-200 dark:border-amber-900/50 p-4 flex flex-wrap items-center justify-between gap-2"
                  >
                    <div>
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {rep.targetName}{' '}
                        <span className="text-xs font-normal text-zinc-500">
                          ({rep.targetType})
                        </span>
                      </p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        {rep.reason} · {formatDateId(rep.createdAt)}
                      </p>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                      Dalam Tinjauan
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Tab 4: Pesan CS (Admin Inbox & Manual Reply) */}
      {tab === 'cs' && <CsAdminInboxPanel isVerifiedAdmin />}
    </div>
  );
};
