'use client';

import { useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import authenticatedFetch from '../auth/authenticatedFetch';
import { AuthContext } from '../auth/authContext';
import WithdrawalRequestModal from './withdrawalRequestModal';
import { TELEGRAM_SUPPORT_URL } from '@/lib/constants';

// --- status metadata (transaction history) ------------------------------
const STATUS_META = {
  pending: {
    label: 'Pending',
    cashbackLabel: 'Potential cashback',
    color: '#B08900',
    amountColor: '#B08900',
    note: 'Expected payout: 60–90 days after your stay is completed',
  },
  merchant_confirmed: {
    label: 'Merchant confirmed',
    cashbackLabel: 'Estimated cashback',
    color: '#B08900',
    amountColor: '#B08900',
    note:
      'Confirmed by the merchant. Payout can take up to 30 additional days — the merchant controls this timing and RielPoint is unable to speed it up.',
  },
  rielpoint_confirmed: {
    label: 'Withdrawable',
    cashbackLabel: 'Cashback',
    color: '#1F5C3F',
    amountColor: '#1F5C3F',
    note: 'This cashback is confirmed and available to withdraw.',
  },
  confirmed: {
    label: 'Paid out',
    cashbackLabel: 'Cashback',
    color: '#1F5C3F',
    amountColor: '#1F5C3F',
    note: null,
  },
  rejected: {
    label: 'Rejected',
    cashbackLabel: 'Cashback',
    color: '#B3453D',
    amountColor: '#9A9A9A',
    note: null,
  },
  cancelled: {
    label: 'Cancelled',
    cashbackLabel: 'Cashback',
    color: '#B3453D',
    amountColor: '#9A9A9A',
    note: null,
  },
  refunded: {
    label: 'Refunded',
    cashbackLabel: 'Cashback',
    color: '#B3453D',
    amountColor: '#9A9A9A',
    note: null,
  },
};

const DEFAULT_STATUS_META = {
  label: 'Unknown',
  cashbackLabel: 'Cashback',
  color: '#9A9A9A',
  amountColor: '#9A9A9A',
  note: null,
};

function metaFor(status) {
  return STATUS_META[status] ?? DEFAULT_STATUS_META;
}

// --- withdrawal status metadata ------------------------------------------
const WITHDRAWAL_STATUS_META = {
  requested: { label: 'Requested', color: '#B08900' },
  processing: { label: 'Processing', color: '#B08900' },
  paid: { label: 'Paid', color: '#1F5C3F' },
  failed: { label: 'Failed — refunded to balance', color: '#B3453D' },
};

// --- mapping helpers -------------------------------------------------
function initialFor(name) {
  return (name || '?').trim().charAt(0).toUpperCase();
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatCurrency(amount, currency) {
  if (amount == null) return '';
  const n = Number(amount);
  return `${currency ?? 'USD'} ${n.toFixed(2)}`;
}

function mapTransaction(row) {
  const when = row.transaction_at ?? row.created_at;
  return {
    id: row.id,
    shop: row.merchant_name ?? 'Unknown shop',
    initial: initialFor(row.merchant_name),
    date: formatDate(when),
    time: formatTime(when),
    status: row.status,
    cashbackAmount: row.cashback_amount,
    currency: row.currency,
    orderAmountLabel: formatCurrency(row.order_amount, row.currency),
    code: row.external_transaction_id ? row.external_transaction_id.slice(0, 8) : '',
  };
}

// --- auth hook ---------------------------------------------------------
function useAuthUser() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return unsubscribe;
  }, []);

  return user;
}

// --- data hook: transaction history --------------------------------------
function useTransactions(enabled) {
  const [transactions, setTransactions] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    async function load() {
      try {
        const res = await authenticatedFetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/cashback/transactions`);
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);

        const data = await res.json();
        if (!cancelled) {
          const rows = data.transactions ?? [];
          setTransactions(rows.map(mapTransaction));
          setStatus('success');
        }
      } catch (err) {
        console.error('Error loading transactions:', err);
        if (!cancelled) setStatus('error');
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { transactions, status };
}

// --- data hook: ledger-backed balance + withdrawal history ---------------
function useWallet(enabled) {
  const [balance, setBalance] = useState(0);
  const [withdrawals, setWithdrawals] = useState([]);
  const [status, setStatus] = useState('loading');

  const reload = useCallback(async () => {
    setStatus('loading');
    try {
      const [balanceRes, withdrawalsRes] = await Promise.all([
        authenticatedFetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/wallet/balance`),
        authenticatedFetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/wallet/withdrawals`),
      ]);

      if (!balanceRes.ok) throw new Error(`Balance request failed: ${balanceRes.status}`);

      const balanceData = await balanceRes.json();
      setBalance(balanceData.balance ?? 0);

      // Withdrawal history endpoint is optional — don't fail the whole
      // wallet load if it's not wired up yet.
      if (withdrawalsRes.ok) {
        const withdrawalsData = await withdrawalsRes.json();
        setWithdrawals(withdrawalsData.withdrawals ?? []);
      }

      setStatus('success');
    } catch (err) {
      console.error('Error loading wallet:', err);
      setStatus('error');
    }
  }, []);

useEffect(() => {
  if (!enabled) return;

  const timeout = setTimeout(() => {
    reload();
  }, 0);

  return () => clearTimeout(timeout);
}, [enabled, reload]);

  return { balance, withdrawals, status, reload };
}

// --- page ---------------------------------------------------------------

export default function WalletPage() {
  const router = useRouter();
  const user = useAuthUser();
  const authLoading = user === undefined;
  const isAuthenticated = !!user;

  const { transactions, status: txStatus } = useTransactions(isAuthenticated);
  const { balance, withdrawals, status: walletStatus, reload: reloadWallet } = useWallet(isAuthenticated);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const context = useContext(AuthContext);
  const currentUser = context?.currentUser || null;

  function handleWithdrawalSuccess() {
    // Re-fetch balance + history so the locked amount disappears from
    // "available" immediately and shows up in the withdrawal list.
    reloadWallet();
  }

  return (
    <main
      className="min-h-screen"
      style={{ background: '#FFFFFF', fontFamily: 'var(--font-body)' }}
    >
      <div className="mx-auto max-w-md px-6 pt-10 pb-20">
        <p className="text-[11px] uppercase tracking-[0.18em] mb-6" style={{ color: '#9A9A9A' }}>
          Wallet
        </p>

        {authLoading && (
          <p className="text-sm text-center py-10" style={{ color: '#9A9A9A' }}>
            Loading…
          </p>
        )}

        {!authLoading && isAuthenticated && (
          <>
            {/* Balance card */}
            <div className="rounded-2xl px-6 py-7 mb-4" style={{ background: '#0F0F0E' }}>
              <div className="flex items-center justify-between mb-8">
                <span className="text-xs font-semibold tracking-wide" style={{ color: '#F5F5F0' }}>
                  RielPoint
                </span>
                <span className="h-6 w-9 rounded-sm" style={{ background: '#1F5C3F' }} aria-hidden="true" />
              </div>

              <p className="text-xs mb-1" style={{ color: '#9A9A94' }}>
                Available to withdraw
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-semibold" style={{ color: '#FFFFFF', fontFamily: 'var(--font-mono)' }}>
                  {walletStatus === 'loading' ? '—' : formatCurrency(balance, 'USD')}
                </span>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <span className="text-xs tracking-wider" style={{ color: '#FFFFFF', fontFamily: 'var(--font-mono)' }}>
                  {currentUser?.customer_number}
                </span>
                <span className="text-xs" style={{ color: '#FFFFFF' }}>
                  {currentUser?.fullname?.toUpperCase()}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowWithdrawModal(true)}
              disabled={walletStatus !== 'success' || balance <= 0}
              className="w-full rounded-full p-3 text-center mb-10 transition-opacity hover:opacity-90 active:scale-[0.99] disabled:opacity-40"
              style={{ background: '#0F0F0E' }}
            >
              <span className="block text-sm font-medium" style={{ color: '#FFFFFF' }}>
                Withdraw
              </span>
            </button>

            <div className=" mb-6  text-center">
            <p className="text-xs" style={{ color: '#9A9A9A' }}>
              Missing cashback?{' '}
              <a
                href={TELEGRAM_SUPPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline underline-offset-2"
                style={{ color: '#0F0F0E' }}
              >
                Contact us on Telegram
              </a>
            </p>
          </div>

            {/* Withdrawal history */}
            {withdrawals.length > 0 && (
              <div className="mb-10">
                <h2 className="text-sm font-semibold mb-3" style={{ color: '#0F0F0E' }}>
                  Withdrawal requests
                </h2>
                <div>
                  {withdrawals.map((w, i) => {
                    const meta = WITHDRAWAL_STATUS_META[w.status] ?? {
                      label: w.status,
                      color: '#9A9A9A',
                    };
                    return (
                      <div
                        key={w.id}
                        className="flex items-center justify-between py-3"
                        style={{ borderTop: i === 0 ? 'none' : '1px solid #EFEFED' }}
                      >
                        <div>
                          <p className="text-sm font-medium" style={{ color: '#0F0F0E' }}>
                            {formatCurrency(w.amount, w.currency)}
                          </p>
                          <p className="text-xs" style={{ color: '#9A9A9A' }}>
                            Requested {formatDate(w.requested_at)}
                          </p>
                        </div>
                        <span className="text-xs font-medium" style={{ color: meta.color }}>
                          {meta.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Cashback history */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold" style={{ color: '#0F0F0E' }}>
                Cashback history
              </h2>
              {txStatus === 'success' && (
                <span className="text-xs" style={{ color: '#9A9A9A' }}>
                  {transactions.length}
                </span>
              )}
            </div>

            {txStatus === 'loading' && (
              <p className="text-sm text-center py-10" style={{ color: '#9A9A9A' }}>
                Loading transactions…
              </p>
            )}

            {txStatus === 'error' && (
              <p className="text-sm text-center py-10" style={{ color: '#B3453D' }}>
                Couldn&apos;t load your transaction history. Pull to refresh or try again later.
              </p>
            )}

            {txStatus === 'success' && (
              <div>
                {transactions.map((item, i) => {
                  const meta = metaFor(item.status);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-4"
                      style={{ borderTop: i === 0 ? 'none' : '1px solid #EFEFED' }}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                          style={{ background: '#F3F3EF', color: '#0F0F0E' }}
                        >
                          {item.initial}
                        </span>
                        <div>
                          <p className="text-sm font-medium" style={{ color: '#0F0F0E' }}>
                            {item.shop}
                          </p>
                          <p className="text-xs" style={{ color: '#9A9A9A' }}>
                            {item.date} &middot; {item.time}
                            {item.orderAmountLabel ? ` \u00b7 ${item.orderAmountLabel}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] font-medium mb-0.5" style={{ color: meta.color }}>
                          {meta.cashbackLabel}
                        </p>
                        <p className="text-sm font-medium" style={{ color: meta.amountColor }}>
                          {item.cashbackAmount != null ? `+${formatCurrency(item.cashbackAmount, item.currency)}` : ''}
                        </p>
                        <p className="text-[11px]" style={{ color: meta.color }}>
                          {meta.label}
                        </p>
                        {meta.note && (
                          <p
                            className="text-[10px] leading-tight mt-0.5 max-w-[130px] ml-auto"
                            style={{ color: '#9A9A9A' }}
                          >
                            {meta.note}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}

                {transactions.length === 0 && (
                  <p className="text-sm text-center py-10" style={{ color: '#9A9A9A' }}>
                    No cashback yet.
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {/* Signed-out: explainer cards */}
        {!authLoading && !isAuthenticated && (
          <div>
            <h2 className="text-sm font-semibold mb-2" style={{ color: '#0F0F0E' }}>
              You&apos;re not logged in. Sign up and become a member.
            </h2>
            <p className="text-sm mb-8 leading-relaxed" style={{ color: '#9A9A9A' }}>
              Shop with partner merchants, earn cashback automatically. Sign in to see your balance and start claiming cash on each purchase.
            </p>

            <div className="space-y-3 mb-10">
              {[
                {
                  title: 'Real cashback, no extra step',
                  description:
                    'Every purchase at a RielPoint merchant earns you real cash back automatically, with nothing extra to do.',
                },
                {
                  title: 'International & local merchants',
                  description:
                    'Earn cashback across a growing network of international and local partner merchants.',
                },
                {
                  title: 'Easy to reclaim',
                  description:
                    'Once confirmed, money will be deposited in your bank in less than 24 hours.',
                },
              ].map((step, i) => (
                <div
                  key={step.title}
                  className="flex items-start gap-4 rounded-2xl px-5 py-5"
                  style={{ background: '#F8F8F6' }}
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                    style={{ background: '#0F0F0E', color: '#F5F5F0', fontFamily: 'var(--font-mono)' }}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: '#0F0F0E' }}>
                      {step.title}
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: '#9A9A9A' }}>
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => router.push('/login')}
              className="w-full rounded-full p-3 text-center transition-opacity hover:opacity-90 active:scale-[0.99]"
              style={{ background: '#0F0F0E' }}
            >
              <span className="block text-sm font-medium" style={{ color: '#FFFFFF' }}>
                Login & start earning cashback
              </span>
            </button>
          </div>
        )}
      </div>

      {showWithdrawModal && (
        <WithdrawalRequestModal
          availableBalance={balance}
          onClose={() => setShowWithdrawModal(false)}
          onSuccess={handleWithdrawalSuccess}
        />
      )}
    </main>
  );
}