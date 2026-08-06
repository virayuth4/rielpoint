'use client';

import { useCallback, useContext, useEffect, useState } from 'react';
import { Inter, Space_Mono } from 'next/font/google';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import authenticatedFetch from '../auth/authenticatedFetch';
import { AuthContext, getUserId } from '../auth/authContext';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
});

const mono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
});

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

// Pure fallback formatting — used only when the coupon has no `title` set.
const DISCOUNT_TYPES = {
  percent: { label: '% off', format: (c) => `${parseFloat(c?.discount_value)}% off` },
  amount: { label: '$ off everything', format: (c) => `-$${parseFloat(c?.discount_value)} on everything` },
  custom: { label: 'Custom perk', format: () => 'Custom perk' },
};

// Display title: prefer the coupon's own `title`, otherwise fall back to the
// old discount_value + discount_type formatting.
function getCouponTitle(c) {
  if (c?.title) return c.title;
  return DISCOUNT_TYPES[c?.discount_type]?.format(c) ?? '—';
}
function getCouponValueLabel(c) {
  return DISCOUNT_TYPES[c?.discount_type]?.format(c) ?? null;
}
function getCouponDescription(c) {
  return c?.description || null;
}

function mapTransaction(row) {
  return {
    id: row.id,
    shop: row.merchant_name ?? 'Unknown shop',
    initial: initialFor(row.merchant_name),
    date: formatDate(row.created_at),
    time: formatTime(row.created_at),
    points: row.points,
    amountLabel: formatCurrency(row.usd_amount ?? row.amount, row.currency),
    code: row.idempotency_key ? row.idempotency_key.slice(0, 8) : '',
    newBalance: row.new_balance,
  };
}

function useMyCoupons(enabled) {
  const [coupons, setCoupons] = useState([]);
  const [status, setStatus] = useState('loading');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    async function load() {
      try {
        const res = await authenticatedFetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/coupons/my`);
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setCoupons(data.coupons ?? []);
          setStatus('success');
        }
      } catch (err) {
        console.error('Error loading coupons:', err);
        if (!cancelled) setStatus('error');
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [enabled, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return { coupons, status, reload };
}

function useAvailableCoupons(enabled) {
  const [coupons, setCoupons] = useState([]);
  const [status, setStatus] = useState('loading');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    async function load() {
      try {
        const res = await authenticatedFetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/coupons/available`);
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setCoupons(data.coupons ?? []);
          setStatus('success');
        }
      } catch (err) {
        console.error('Error loading available coupons:', err);
        if (!cancelled) setStatus('error');
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [enabled, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return { coupons, status, reload };
}
// --- auth hook ---------------------------------------------------------
// undefined = still resolving, null = signed out, object = signed in

function useAuthUser() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return unsubscribe;
  }, []);

  return user;
}

// --- data hooks (authenticated) -----------------------------------------

function useTransactions(enabled) {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    async function load() {
      try {
        const res = await authenticatedFetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/points/transactions`);
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);

        const data = await res.json();
        console.log("recent transaction", data)
        if (!cancelled) {
          const rows = data.transactions ?? [];
          setTransactions(rows.map(mapTransaction));
          if (rows.length > 0) setBalance(rows[0].new_balance);
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

  return { transactions, balance, status };
}



// --- guest phone lookup ---------------------------------------------------

function useGuestTransactions() {
  const [phone, setPhone] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  

  async function lookup(inputPhone) {
    const trimmed = inputPhone.trim();
    if (!trimmed) return;

    setStatus('loading');
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/points/transactions/${encodeURIComponent(trimmed)}`
      );
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      const rows = data.transactions ?? [];
      setTransactions(rows.map(mapTransaction));
      setBalance(rows.length > 0 ? rows[0].new_balance : 0);
      setStatus('success');
    } catch (err) {
      console.error('Error looking up guest transactions:', err);
      setStatus('error');
    }
  }

  return { phone, setPhone, transactions, balance, status, lookup };
}

// --- page ---------------------------------------------------------------

export default function WalletPage() {
  const user = useAuthUser();
  const authLoading = user === undefined;
  const isAuthenticated = !!user;

  const { transactions, balance, status } = useTransactions(isAuthenticated);
const { coupons: myCoupons, status: couponsStatus, reload: reloadMyCoupons } = useMyCoupons(isAuthenticated);
const { coupons: availableCoupons, status: availableStatus, reload: reloadAvailableCoupons } = useAvailableCoupons(isAuthenticated);

const [selectedCoupon, setSelectedCoupon] = useState(null);
const [claimModalOpen, setClaimModalOpen] = useState(false);
const [claimingId, setClaimingId] = useState(null);
  const guest = useGuestTransactions();

  const [viewingOtpId, setViewingOtpId] = useState(null);
  const [otpModal, setOtpModal] = useState(null); // { otp, expiresInSeconds, coupon }
  const context = useContext(AuthContext);
  const currentUser = context?.currentUser || null;

  async function viewOtp(claim) {
    setViewingOtpId(claim.claim_id);
    try {
      const res = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/coupons/my/${claim.claim_id}/otp`
      );
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || `Failed (${res.status})`);
      setOtpModal({ otp: body.otp, expiresInSeconds: body.expiresInSeconds, coupon: claim });
    } catch (err) {
      alert(err.message || 'Failed to load code');
    } finally {
      setViewingOtpId(null);
    }
  }

  function openClaimModal(coupon) {
  setSelectedCoupon(coupon);
  setClaimModalOpen(true);
}

async function confirmClaim() {
  if (!selectedCoupon) return;
  const couponId = selectedCoupon.id ?? selectedCoupon.coupon_id;

  setClaimingId(couponId);
  try {
    const res = await authenticatedFetch(
      `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/coupons/${couponId}/claim`,
      { method: 'POST', headers: { 'Idempotency-Key': crypto.randomUUID() } }
    );
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || `Claim failed (${res.status})`);

    setClaimModalOpen(false);
    setOtpModal({ otp: body.otp, expiresInSeconds: body.expiresInSeconds, coupon: selectedCoupon });

    // Move it out of "available" and into "your coupons"
    reloadMyCoupons();
    reloadAvailableCoupons();
  } catch (err) {
    alert(err.message || 'Failed to claim coupon');
  } finally {
    setClaimingId(null);
  }
}

  return (
    <main
      className={`${inter.variable} ${mono.variable} min-h-screen`}
      style={{ background: '#FFFFFF', fontFamily: 'var(--font-body)' }}
    >
      <div className="mx-auto max-w-md px-6 pt-10 pb-20">
        {/* Page label */}
        <p className="text-[11px] uppercase tracking-[0.18em] mb-6" style={{ color: '#9A9A9A' }}>
          Wallet
        </p>

        {authLoading && (
          <p className="text-sm text-center py-10" style={{ color: '#9A9A9A' }}>
            Loading…
          </p>
        )}

        {/* Signed-in: balance card, coupons, history */}
        {!authLoading && isAuthenticated && (
          <>
            {/* Balance card */}
            <div className="rounded-2xl px-6 py-7 mb-10" style={{ background: '#0F0F0E' }}>
              <div className="flex items-center justify-between mb-8">
                <span className="text-xs font-semibold tracking-wide" style={{ color: '#F5F5F0' }}>
                  RielPoint
                </span>
                <span className="h-6 w-9 rounded-sm" style={{ background: '#1F5C3F' }} aria-hidden="true" />
              </div>

              <p className="text-xs mb-1" style={{ color: '#9A9A94' }}>
                Available balance
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-semibold" style={{ color: '#FFFFFF', fontFamily: 'var(--font-mono)' }}>
                  {(balance ?? 0).toLocaleString()}
                </span>
                <span className="text-sm" style={{ color: '#9A9A94' }}>
                  pts
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

            {/* Your coupons */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold" style={{ color: '#0F0F0E' }}>
                Your coupons
              </h2>
              {couponsStatus === 'success' && (
                <span className="text-xs" style={{ color: '#9A9A9A' }}>
                  {myCoupons.length}
                </span>
              )}
            </div>

            {couponsStatus === 'loading' && (
              <p className="text-sm text-center py-10" style={{ color: '#9A9A9A' }}>
                Loading coupons…
              </p>
            )}

            {couponsStatus === 'error' && (
              <p className="text-sm text-center py-10" style={{ color: '#B3453D' }}>
                Couldn&apos;t load your coupons. Pull to refresh or try again later.
              </p>
            )}

            {couponsStatus === 'success' && (
              <div className="mb-10">
                {myCoupons.map((c, i) => {
                  const otpExpired = c.otp_expires_at && new Date(c.otp_expires_at) <= new Date();
                  const isRedeemed = !!c.redeemed_at;
                  const isClickable = !otpExpired && !isRedeemed;

                  let statusLabel;
                  let statusColor = '#9A9A9A';
                  if (isRedeemed) {
                    statusLabel = `Redeemed ${new Date(c.redeemed_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}`;
                  } else if (otpExpired) {
                    statusLabel = 'Expired';
                  } else if (viewingOtpId === c.claim_id) {
                    statusLabel = 'Loading…';
                  } else {
                    statusLabel = 'Tap for code';
                    statusColor = '#1F5C3F';
                  }

                  return (
                    <div
                      key={c.claim_id}
                      className="flex items-center justify-between py-4"
                      style={{
                        borderTop: i === 0 ? 'none' : '1px solid #EFEFED',
                        cursor: isClickable ? 'pointer' : 'default',
                      }}
                      onClick={() => isClickable && viewOtp(c)}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                          style={{ background: '#F3F3EF', color: '#0F0F0E' }}
                        >
                          {initialFor(c.merchant_name)}
                        </span>
                     <div>
  <div className="flex items-center gap-2 flex-wrap">
    <p className="text-sm font-medium" style={{ color: '#0F0F0E' }}>
      {getCouponTitle(c)}
    </p>
    {c.title && getCouponValueLabel(c) && (
      <span
        className="text-[11px] font-medium px-1.5 py-0.5 rounded-full shrink-0"
        style={{ color: '#1F5C3F', background: '#F3F3EF' }}
      >
        {getCouponValueLabel(c)}
      </span>
    )}
  </div>
  {getCouponDescription(c) && (
    <p className="text-xs" style={{ color: '#9A9A9A' }}>
      {getCouponDescription(c)}
    </p>
  )}
  <p className="text-xs" style={{ color: '#9A9A9A' }}>
    {c.merchant_name || 'Unassigned'} &middot; {c.points_cost} pts
  </p>
</div>
                      </div>

                      <p className="text-xs font-medium" style={{ color: statusColor }}>
                        {statusLabel}
                      </p>
                    </div>
                  );
                })}

                {myCoupons.length === 0 && (
                  <p className="text-sm text-center py-10" style={{ color: '#9A9A9A' }}>
                    You haven&apos;t claimed any coupons yet.
                  </p>
                )}
              </div>
            )}

            {/* Coupons you can claim, based on merchants you've earned points from */}
<div className="flex items-center justify-between mb-4">
  <h2 className="text-sm font-semibold" style={{ color: '#0F0F0E' }}>
    Coupons you can claim
  </h2>
  {availableStatus === 'success' && (
    <span className="text-xs" style={{ color: '#9A9A9A' }}>
      {availableCoupons.length}
    </span>
  )}
</div>

{availableStatus === 'loading' && (
  <p className="text-sm text-center py-10" style={{ color: '#9A9A9A' }}>
    Loading coupons…
  </p>
)}

{availableStatus === 'error' && (
  <p className="text-sm text-center py-10" style={{ color: '#B3453D' }}>
    Couldn&apos;t load available coupons. Pull to refresh or try again later.
  </p>
)}

{availableStatus === 'success' && (
  <div className="mb-10">
    {availableCoupons.map((c, i) => (
      <div
        key={c.id}
        className="flex items-center justify-between py-4"
        style={{ borderTop: i === 0 ? 'none' : '1px solid #EFEFED' }}
      >
        <div className="flex items-center gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
            style={{ background: '#F3F3EF', color: '#0F0F0E' }}
          >
            {initialFor(c.merchant_name)}
          </span>
      <div>
  <div className="flex items-center gap-2 flex-wrap">
    <p className="text-sm font-medium" style={{ color: '#0F0F0E' }}>
      {getCouponTitle(c)}
    </p>
    {c.title && getCouponValueLabel(c) && (
      <span
        className="text-[11px] font-medium px-1.5 py-0.5 rounded-full shrink-0"
        style={{ color: '#1F5C3F', background: '#F3F3EF' }}
      >
        {getCouponValueLabel(c)}
      </span>
    )}
  </div>
  {getCouponDescription(c) && (
    <p className="text-xs" style={{ color: '#9A9A9A' }}>
      {getCouponDescription(c)}
    </p>
  )}
  <p className="text-xs" style={{ color: '#9A9A9A' }}>
    {c.merchant_name} &middot; {c.points_cost} pts
  </p>
</div>
        </div>

       <button
  className="rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-50"
  style={{ background: '#0F0F0E', color: '#FFFFFF' }}
  disabled={c.is_active === false || claimingId === (c.id ?? c.coupon_id)}
  onClick={() => openClaimModal(c)}
>
  {c.is_active === false ? 'Inactive' : 'Claim'}
</button>
      </div>
    ))}

    {availableCoupons.length === 0 && (
      <p className="text-sm text-center py-10" style={{ color: '#9A9A9A' }}>
        No coupons available from merchants you&apos;ve earned points with yet.
      </p>
    )}
  </div>
)}

            {/* History */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold" style={{ color: '#0F0F0E' }}>
                Points history
              </h2>
              {status === 'success' && (
                <span className="text-xs" style={{ color: '#9A9A9A' }}>
                  {transactions.length} this month
                </span>
              )}
            </div>

            {status === 'loading' && (
              <p className="text-sm text-center py-10" style={{ color: '#9A9A9A' }}>
                Loading redemptions…
              </p>
            )}

            {status === 'error' && (
              <p className="text-sm text-center py-10" style={{ color: '#B3453D' }}>
                Couldn&apos;t load your redemption history. Pull to refresh or try again later.
              </p>
            )}

            {status === 'success' && (
              <div>
                {transactions.map((item, i) => (
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
                          {item.amountLabel ? ` \u00b7 ${item.amountLabel}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-medium" style={{ color: '#1F5C3F' }}>
                        {item.points != null ? `+${item.points} pts` : ''}
                      </p>
                      <p className="text-[11px]" style={{ color: '#B8B8B2', fontFamily: 'var(--font-mono)' }}>
                        {item.code}
                      </p>
                    </div>
                  </div>
                ))}

                {transactions.length === 0 && (
                  <p className="text-sm text-center py-10" style={{ color: '#9A9A9A' }}>
                    No redemptions yet.
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {/* Signed-out: phone lookup + point history only. No wallet, no coupons. */}
        {!authLoading && !isAuthenticated && (
          <div>
            <h2 className="text-sm font-semibold mb-3" style={{ color: '#0F0F0E' }}>
              Points history
            </h2>
              <p className="text-sm mb-3" style={{ color: '#9A9A9A' }}>
              Sign in to see your points history.
            </p>
              <p className="text-sm mb-3" style={{ color: '#9A9A9A' }}>
              OR
            </p>
            <p className="text-sm mb-3" style={{ color: '#9A9A9A' }}>
              Enter your phone number to check your points and recent transactions.
            </p>

            <form
              className="flex items-center gap-2 mb-6"
              onSubmit={(e) => {
                e.preventDefault();
                guest.lookup(guest.phone);
              }}
            >
              <input
                type="tel"
                inputMode="tel"
                value={guest.phone}
                onChange={(e) => guest.setPhone(e.target.value)}
                placeholder="e.g. 012 345 678"
                className="flex-1 rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: '#F3F3EF', color: '#0F0F0E' }}
              />
              <button
                type="submit"
                disabled={guest.status === 'loading' || !guest.phone.trim()}
                className="rounded-xl px-4 py-3 text-sm font-medium disabled:opacity-50"
                style={{ background: '#0F0F0E', color: '#FFFFFF' }}
              >
                Check
              </button>
            </form>

            {guest.status === 'loading' && (
              <p className="text-sm text-center py-6" style={{ color: '#9A9A9A' }}>
                Looking up your points…
              </p>
            )}

            {guest.status === 'error' && (
              <p className="text-sm text-center py-6" style={{ color: '#B3453D' }}>
                Couldn&apos;t find a record for that number. Double-check it and try again.
              </p>
            )}

            {guest.status === 'success' && (
              <div>
                {guest.balance != null && (
                  <div className="flex items-baseline justify-between mb-4">
                    <span className="text-xs" style={{ color: '#9A9A9A' }}>
                      Total points
                    </span>
                    <span
                      className="text-lg font-semibold"
                      style={{ color: '#0F0F0E', fontFamily: 'var(--font-mono)' }}
                    >
                      {guest.balance.toLocaleString()} pts
                    </span>
                  </div>
                )}

                {guest.transactions.map((item, i) => (
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
                          {item.amountLabel ? ` \u00b7 ${item.amountLabel}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-medium" style={{ color: '#1F5C3F' }}>
                        {item.points != null ? `+${item.points} pts` : ''}
                      </p>
                      <p className="text-[11px]" style={{ color: '#B8B8B2', fontFamily: 'var(--font-mono)' }}>
                        {item.code}
                      </p>
                    </div>
                  </div>
                ))}

                {guest.transactions.length === 0 && (
                  <p className="text-sm text-center py-10" style={{ color: '#9A9A9A' }}>
                    No transactions found for that number yet.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

    
{/* OTP modal */}
{otpModal && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    style={{ background: 'rgba(15,15,14,0.6)' }}
    onClick={() => setOtpModal(null)}
  >
    <div
      className="w-full max-w-sm rounded-2xl p-6 sm:p-7 shadow-lg mb-24"
      style={{ background: '#FFFFFF' }}
      onClick={(e) => e.stopPropagation()}
    >
      <p className="text-sm font-semibold mb-1" style={{ color: '#0F0F0E' }}>
        Coupon code
      </p>
      <p className="text-xs mb-6" style={{ color: '#9A9A9A' }}>
        Show this code to staff to redeem.
      </p>
      <div className="text-center py-4">
        <p className="text-[32px] font-semibold tracking-[0.2em]" style={{ fontFamily: 'var(--font-mono)', color: '#0F0F0E' }}>
          {otpModal.otp}
        </p>
        <p className="text-xs mt-2" style={{ color: '#9A9A9A' }}>
          Expires in {Math.round(otpModal.expiresInSeconds / 60)} minutes
        </p>
      </div>
      <button
        className="w-full rounded-xl py-3 mt-4 text-sm font-medium"
        style={{ background: '#0F0F0E', color: '#FFFFFF' }}
        onClick={() => setOtpModal(null)}
      >
        Done
      </button>
    </div>
  </div>
)}
    {claimModalOpen && selectedCoupon && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    style={{ background: 'rgba(15,15,14,0.6)' }}
    onClick={() => !claimingId && setClaimModalOpen(false)}
  >
    <div
      className="w-full max-w-sm rounded-2xl p-6 sm:p-7 shadow-lg mb-24"
      style={{ background: '#FFFFFF' }}
      onClick={(e) => e.stopPropagation()}
    >
      <p className="text-sm font-semibold mb-1" style={{ color: '#0F0F0E' }}>
        Confirm claim
      </p>
      <p className="text-xs mb-5" style={{ color: '#9A9A9A' }}>
        This action can&apos;t be undone.
      </p>

      <div className="rounded-xl px-4 py-3 mb-5" style={{ background: '#F3F3EF' }}>
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium" style={{ color: '#0F0F0E' }}>
            {getCouponTitle(selectedCoupon)}
          </p>
          {selectedCoupon.title && getCouponValueLabel(selectedCoupon) && (
            <span
              className="text-[11px] font-medium px-1.5 py-0.5 rounded-full shrink-0"
              style={{ color: '#1F5C3F', background: '#FFFFFF' }}
            >
              {getCouponValueLabel(selectedCoupon)}
            </span>
          )}
        </div>
        {getCouponDescription(selectedCoupon) && (
          <p className="text-xs mt-0.5" style={{ color: '#9A9A9A' }}>
            {getCouponDescription(selectedCoupon)}
          </p>
        )}
        <p className="text-xs mt-0.5" style={{ color: '#9A9A9A' }}>
          {selectedCoupon.merchant_name || 'Unassigned'}
          {selectedCoupon.expires_at && ` · Expires ${formatDate(selectedCoupon.expires_at)}`}
        </p>
      </div>

      <div className="flex items-center justify-between text-xs mb-6">
        <span style={{ color: '#9A9A9A' }}>Cost</span>
        <span style={{ color: '#0F0F0E', fontFamily: 'var(--font-mono)' }}>
          {selectedCoupon.points_cost} pts
        </span>
      </div>

      <div className="flex gap-2">
        <button
          className="flex-1 rounded-xl py-3 text-sm font-medium disabled:opacity-50"
          style={{ background: '#F3F3EF', color: '#0F0F0E' }}
          onClick={() => setClaimModalOpen(false)}
          disabled={!!claimingId}
        >
          Cancel
        </button>
        <button
          className="flex-1 rounded-xl py-3 text-sm font-medium disabled:opacity-50"
          style={{ background: '#0F0F0E', color: '#FFFFFF' }}
          onClick={confirmClaim}
          disabled={!!claimingId}
        >
          {claimingId ? 'Claiming…' : 'Confirm claim'}
        </button>
      </div>
    </div>
  </div>
)}
    </main>
  );
}