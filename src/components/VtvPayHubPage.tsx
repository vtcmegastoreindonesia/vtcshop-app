import React, { useState } from 'react';
import {
  Wallet,
  Send,
  QrCode,
  CreditCard,
  ShieldCheck,
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useMarketplace } from '../store/marketplaceStore';
import { formatDateId, formatRupiah } from '../types';
import { VtcLogo } from './VtcLogo';

export const VtvPayHubPage: React.FC = () => {
  const {
    state,
    topUpVtvpay,
    transferVtvPay,
    takeVtvPinjam,
    payPayLaterBill,
    submitInsuranceClaim,
    showToast,
  } = useMarketplace();

  // Empty initial inputs
  const [topUpAmt, setTopUpAmt] = useState('');
  const [transferRecipient, setTransferRecipient] = useState('');
  const [transferBank, setTransferBank] = useState('Sesama VTC Pay');
  const [transferAmt, setTransferAmt] = useState('');
  const [pinjamAmt, setPinjamAmt] = useState('500000');
  const [pinjamTenor, setPinjamTenor] = useState(3);
  const [claimOrderId, setClaimOrderId] = useState(state.orders[0]?.id ?? '');
  const [claimReason, setClaimReason] = useState('');
  const [qrisModalOpen, setQrisModalOpen] = useState(false);

  const handleTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(topUpAmt);
    if (!num || num < 10000) {
      showToast('Minimal Top Up Rp 10.000', 'warning');
      return;
    }
    topUpVtvpay(num, 'Transfer Bank / QRIS');
    setTopUpAmt('');
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(transferAmt);
    if (!transferRecipient.trim() || !num) return;
    if (transferVtvPay(transferRecipient, num, transferBank)) {
      setTransferRecipient('');
      setTransferAmt('');
    }
  };

  const handleQrisPayDemo = () => {
    if (transferVtvPay('Merchant QRIS Nusantara', 25000, 'QRIS Instan')) {
      setQrisModalOpen(false);
    }
  };

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimReason.trim()) {
      showToast('Isi kronologi barang hilang / rusak untuk klaim 100%', 'warning');
      return;
    }
    submitInsuranceClaim(claimOrderId, claimReason);
    setClaimReason('');
  };

  const remainingLimit = Math.max(0, state.paylaterLimit - state.paylaterUsed);

  return (
    <div className="space-y-6">
      {/* Main Wallet Hero */}
      <section className="rounded-3xl bg-gradient-to-br from-[#EE4D2D] to-[#C83214] text-white p-5 sm:p-7 shadow-lg shadow-[#EE4D2D]/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <VtcLogo size="sm" showWordmark={false} />
              <span className="text-xs font-bold uppercase tracking-wider text-orange-100 inline-flex items-center gap-1.5">
                <Wallet className="w-4 h-4" />
                VTC Pay · Dompet Digital Resmi
              </span>
            </div>
            <p className="text-3xl sm:text-4xl font-black tabular-nums">
              {formatRupiah(state.vtvpayBalance)}
            </p>
            <p className="text-xs text-orange-100">
              Gratis Transfer Antar Pengguna & Bank · Cashback Koin hingga 5%
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => topUpVtvpay(100000, 'Instan VA')}
              className="min-h-[44px] px-4 rounded-xl bg-white text-[#EE4D2D] text-xs sm:text-sm font-extrabold cursor-pointer"
            >
              + Top Up Rp 100rb
            </button>
            <button
              type="button"
              onClick={() => setQrisModalOpen(true)}
              className="min-h-[44px] px-4 rounded-xl bg-[#111113] text-white text-xs sm:text-sm font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Scan QRIS</span>
            </button>
          </div>
        </div>
      </section>

      {/* Grid Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Up & Transfer */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-5">
          <form onSubmit={handleTopUp} className="space-y-2.5">
            <h2 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
              Top Up Saldo VTC Pay
            </h2>
            <div className="flex gap-2">
              <input
                type="number"
                min={10000}
                value={topUpAmt}
                onChange={(e) => setTopUpAmt(e.target.value)}
                placeholder="Masukkan nominal (Rp)..."
                className="flex-1 h-11 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm"
              />
              <button
                type="submit"
                className="min-h-[44px] px-4 rounded-xl bg-[#EE4D2D] text-white text-xs font-extrabold cursor-pointer"
              >
                Top Up
              </button>
            </div>
          </form>

          <form
            onSubmit={handleTransfer}
            className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800"
          >
            <h2 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 inline-flex items-center gap-1.5">
              <Send className="w-4 h-4 text-[#EE4D2D]" />
              Transfer Gratis Admin (Sesama VTC Pay / Bank)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <select
                value={transferBank}
                onChange={(e) => setTransferBank(e.target.value)}
                className="h-11 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs font-bold"
              >
                <option value="Sesama VTC Pay">Sesama Pengguna VTC Pay</option>
                <option value="BCA">Transfer Bank BCA</option>
                <option value="BRI">Transfer Bank BRI</option>
                <option value="Mandiri">Transfer Bank Mandiri</option>
              </select>
              <input
                type="text"
                required
                value={transferRecipient}
                onChange={(e) => setTransferRecipient(e.target.value)}
                placeholder="No. HP / No. Rekening tujuan"
                className="h-11 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                required
                min={1000}
                value={transferAmt}
                onChange={(e) => setTransferAmt(e.target.value)}
                placeholder="Nominal transfer (Rp)..."
                className="flex-1 h-11 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm"
              />
              <button
                type="submit"
                className="min-h-[44px] px-5 rounded-xl bg-[#111113] dark:bg-[#EE4D2D] text-white text-xs font-extrabold cursor-pointer"
              >
                Kirim Uang
              </button>
            </div>
          </form>
        </div>

        {/* PayLater 0% 12x & VTC Pinjam */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-5">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold inline-flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-[#EE4D2D]" />
                VTC PayLater (Cicilan 0% s/d 12x)
              </h2>
              <span className="text-xs font-bold text-emerald-600 tabular-nums">
                Limit Tersedia: {formatRupiah(remainingLimit)}
              </span>
            </div>
            <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-[#EE4D2D]"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round((remainingLimit / state.paylaterLimit) * 100)
                  )}%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500 tabular-nums">
                Tagihan Terpakai: {formatRupiah(state.paylaterUsed)}
              </span>
              {state.paylaterUsed > 0 && (
                <button
                  type="button"
                  onClick={() => payPayLaterBill(state.paylaterUsed)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold cursor-pointer"
                >
                  Lunasi Tagihan
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold inline-flex items-center gap-1.5">
                <Banknote className="w-4 h-4 text-emerald-600" />
                VTC Pinjam (Dana Tunai Cair ke VTC Pay)
              </h2>
              <span className="text-xs font-bold text-zinc-500 tabular-nums">
                Aktif: {formatRupiah(state.vtvPinjamBalance)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <select
                value={pinjamAmt}
                onChange={(e) => setPinjamAmt(e.target.value)}
                className="h-11 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs font-bold"
              >
                <option value="500000">Pinjam Rp 500.000</option>
                <option value="1000000">Pinjam Rp 1.000.000</option>
                <option value="2500000">Pinjam Rp 2.500.000</option>
              </select>
              <select
                value={pinjamTenor}
                onChange={(e) => setPinjamTenor(Number(e.target.value))}
                className="h-11 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs font-bold"
              >
                <option value={3}>Tenor 3 Bulan</option>
                <option value={6}>Tenor 6 Bulan</option>
                <option value={12}>Tenor 12 Bulan</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => takeVtvPinjam(Number(pinjamAmt), pinjamTenor)}
              className="w-full min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold cursor-pointer"
            >
              Cairkan Dana VTC Pinjam Sekarang
            </button>
          </div>
        </div>
      </div>

      {/* Asuransi Pengiriman 100% + Riwayat Transaksi */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <form
          onSubmit={handleClaimSubmit}
          className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-3"
        >
          <h3 className="text-sm font-extrabold inline-flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#EE4D2D]" />
            Klaim Asuransi Barang Hilang / Rusak (Ganti Rugi 100%)
          </h3>
          <select
            value={claimOrderId}
            onChange={(e) => setClaimOrderId(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs font-bold"
          >
            {state.orders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.id} — {formatRupiah(o.totalAmount)} ({o.status})
              </option>
            ))}
          </select>
          <textarea
            rows={2}
            required
            value={claimReason}
            onChange={(e) => setClaimReason(e.target.value)}
            placeholder="Jelaskan kondisi barang rusak/hilang di pengiriman..."
            className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs resize-none"
          />
          <button
            type="submit"
            className="min-h-[44px] px-5 rounded-xl bg-[#EE4D2D] text-white text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Ajukan Klaim 100% Cair ke VTC Pay</span>
          </button>
        </form>

        <section className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-3">
          <h3 className="text-sm font-extrabold">
            Riwayat Transaksi VTC Pay ({state.vtvpayTransactions.length})
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {state.vtvpayTransactions.map((trx) => {
              const incoming = trx.amount >= 0;
              return (
                <div
                  key={trx.id}
                  className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        incoming
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {incoming ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold truncate text-zinc-900 dark:text-zinc-100">
                        {trx.title}
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        {formatDateId(trx.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`font-extrabold tabular-nums shrink-0 ${
                      incoming ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {incoming ? '+' : ''}
                    {formatRupiah(trx.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Modal QRIS Scan Simulator */}
      {qrisModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setQrisModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-3xl max-w-sm w-full p-5 space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold">Scan QRIS Instan</h3>
              <button
                type="button"
                onClick={() => setQrisModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="w-44 h-44 mx-auto rounded-2xl bg-zinc-950 text-white flex flex-col items-center justify-center gap-2 border-4 border-[#EE4D2D]">
              <QrCode className="w-20 h-20 text-white" />
              <span className="text-[11px] font-bold text-orange-300">
                QRIS VTC SHOP INDONESIA
              </span>
            </div>
            <p className="text-xs text-zinc-500">
              Simulasi pembayaran QRIS Merchant Nusantara sebesar Rp 25.000
              langsung dari saldo VTC Pay.
            </p>
            <button
              type="button"
              onClick={handleQrisPayDemo}
              className="w-full min-h-[44px] rounded-xl bg-[#EE4D2D] text-white text-sm font-extrabold cursor-pointer"
            >
              Konfirmasi Bayar QRIS Rp 25.000
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
