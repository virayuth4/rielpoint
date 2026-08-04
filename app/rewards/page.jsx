'use client';

import authenticatedFetch from '@/app/auth/authenticatedFetch';
import { useContext, useEffect, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { auth } from '../firebase/config';
import { AuthContext, getUserId } from '../auth/authContext';

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

// Optional secondary line. Only shown when present — no fallback needed here.
function getCouponDescription(c) {
  return c?.description || null;
}

function formatDate(d) {
  return new Date(d).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(d) {
  return new Date(d).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]); // from /coupons (all available)
  const [myCoupons, setMyCoupons] = useState([]); // from /coupons/my (user's claims)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();
  const [claimingId, setClaimingId] = useState(null);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [otpModal, setOtpModal] = useState(null); // { otp, expiresInSeconds, coupon }
  const context = useContext(AuthContext);
  const currentUser = context?.currentUser || null;
  const userId = getUserId(currentUser);
  const userPhoneNumber = currentUser?.phone_number || null;
  const [viewingOtpId, setViewingOtpId] = useState(null);

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

  async function loadCoupons() {
    setLoading(true);
    setError(null);
    try {
      const availableUrl = new URL(`${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/coupons`);
      if (userPhoneNumber) availableUrl.searchParams.set('userPhoneNumber', userPhoneNumber);

      const [availableRes, myRes] = await Promise.all([
        authenticatedFetch(availableUrl.toString()),
        currentUser
          ? authenticatedFetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/coupons/my`)
          : Promise.resolve(null),
      ]);

      if (!availableRes.ok) throw new Error(`Request failed (${availableRes.status})`);
      const availableData = await availableRes.json();

      let myData = { coupons: [] };
      if (myRes) {
        if (!myRes.ok) throw new Error(`Request failed (${myRes.status})`);
        myData = await myRes.json();
      }

      setCoupons(availableData.coupons ?? []);
      setMyCoupons(myData.coupons ?? []);
    } catch (err) {
      setError(err.message || 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;

    async function run() {
      try {
        const availableUrl = new URL(`${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/coupons`);
        if (userPhoneNumber) availableUrl.searchParams.set('userPhoneNumber', userPhoneNumber);

        const [availableRes, myRes] = await Promise.all([
          fetch(availableUrl.toString()),
          currentUser
            ? authenticatedFetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/coupons/my`)
            : Promise.resolve(null),
        ]);

        if (!availableRes.ok) throw new Error(`Request failed (${availableRes.status})`);
        const availableData = await availableRes.json();

        let myData = { coupons: [] };
        if (myRes) {
          if (!myRes.ok) throw new Error(`Request failed (${myRes.status})`);
          myData = await myRes.json();
        }

        if (ignore) return;
        startTransition(() => {
          setCoupons(availableData.coupons ?? []);
          setMyCoupons(myData.coupons ?? []);
          setError(null);
          setLoading(false);
        });
      } catch (err) {
        if (ignore) return;
        startTransition(() => {
          setError(err.message || 'Failed to load coupons');
          setLoading(false);
        });
      }
    }

    startTransition(() => {
      setLoading(true);
      setError(null);
    });
    run();

    return () => {
      ignore = true;
    };
    // currentUser is intentionally included so a login/logout re-fetches /coupons/my
  }, [userPhoneNumber, currentUser]);

  function openClaimModal(coupon) {
    setSelectedCoupon(coupon);
    setModalOpen(true);
  }

  async function confirmClaim() {
    if (!selectedCoupon) return;
    const couponId = selectedCoupon.coupon_id;

    setClaimingId(couponId);
    try {
      const res = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/coupons/${couponId}/claim`,
        {
          method: 'POST',
          headers: { 'Idempotency-Key': crypto.randomUUID() },
        }
      );
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || `Claim failed (${res.status})`);

      setModalOpen(false);

      // Show the OTP now — this is the only time the backend returns it
      setOtpModal({
        otp: body.otp,
        expiresInSeconds: body.expiresInSeconds,
        coupon: selectedCoupon,
      });

      // Refresh both lists so the claimed coupon moves into "Your coupons"
      // and disappears from the available list.
      loadCoupons();
    } catch (err) {
      alert(err.message || 'Failed to claim coupon');
    } finally {
      setClaimingId(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
        <p className="text-sm text-neutral-400">Loading coupons…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#FAFAF8]">
        <p className="text-sm text-neutral-600">{error}</p>
        <Button variant="outline" onClick={loadCoupons}>
          Retry
        </Button>
      </div>
    );
  }

  // /coupons already marks is_claimed via the backend LEFT JOIN against
  // rielpoint_coupon_claims, so we just filter on it directly here.
  const availableCoupons = coupons.filter((c) => !c.is_claimed);

  const grouped = availableCoupons.reduce((acc, c) => {
    const key = c.merchant_name || 'Unassigned';
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});

  const merchantNames = Object.keys(grouped).sort((a, b) => {
    if (a === 'Unassigned') return 1;
    if (b === 'Unassigned') return -1;
    return a.localeCompare(b);
  });

  const isClaiming = selectedCoupon && claimingId === selectedCoupon.coupon_id;

  const currentPoints = selectedCoupon?.user_points != null ? Number(selectedCoupon.user_points) : null;
  const pointsAfterClaim =
    currentPoints != null ? currentPoints - Number(selectedCoupon.points_cost) : null;
  const insufficientPoints = pointsAfterClaim != null && pointsAfterClaim < 0;

  return (
    <div className="min-h-screen bg-[#FAFAF8] px-6 py-14 font-sans">
      <div className="max-w-2xl mx-auto">
        <header className="mb-10">
          <h1 className="text-[26px] font-serif font-semibold tracking-tight text-neutral-900">
            Rewards
          </h1>
          <p className="text-[13px] text-neutral-500 mt-1">
            Redeem points for coupons at businesses you follow.
          </p>
        </header>

        {/* Your coupons — from /coupons/my */}
      <section className="mb-10">
  <h2 className="text-[13px] font-medium text-neutral-900 mb-3">
    Your coupons {myCoupons.length > 0 && (
      <span className="text-neutral-400 font-normal">· {myCoupons.length}</span>
    )}
  </h2>

  {myCoupons.length === 0 ? (
    <div className="rounded-xl border border-dashed border-neutral-200 py-8 px-4 text-center">
      <p className="text-[13px] text-neutral-500">
        You haven&apos;t claimed any coupons yet — browse what&apos;s below.
      </p>
    </div>
  ) : (
    <div className="rounded-xl border border-neutral-200 divide-y divide-neutral-200 overflow-hidden bg-white">
      {myCoupons.map((c) => {
        const otpExpired = c.otp_expires_at && new Date(c.otp_expires_at) <= new Date();
        const isRedeemed = !!c.redeemed_at;
        const isClickable = !otpExpired && !isRedeemed;

        let statusLabel;
        let statusColor = 'text-neutral-400';
        if (isRedeemed) {
          statusLabel = `Redeemed ${formatDate(c.redeemed_at)}`;
          statusColor = 'text-neutral-400';
        } else if (otpExpired) {
          statusLabel = 'Expired';
          statusColor = 'text-neutral-400';
        } else if (viewingOtpId === c.claim_id) {
          statusLabel = 'Loading…';
          statusColor = 'text-neutral-400';
        } else {
          statusLabel = 'Tap for code';
          statusColor = 'text-amber-700';
        }

        const description = getCouponDescription(c);

        return (
          <div
            key={c.claim_id}
            className={`flex items-center justify-between px-4 py-3 ${
              isClickable ? 'cursor-pointer hover:bg-neutral-50' : ''
            }`}
            onClick={() => isClickable && viewOtp(c)}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-[13.5px] text-neutral-900 truncate">
                  {getCouponTitle(c)}
                </p>
                {c.title && getCouponValueLabel(c) && (
                  <span className="text-[11px] font-medium text-green-700 bg-amber-50 px-1.5 py-0.5 rounded-full shrink-0">
                    {getCouponValueLabel(c)}
                  </span>
                )}
              </div>
              {description && (
                <p className="text-[12px] text-neutral-500 truncate">
                  {description}
                </p>
              )}
              <p className="text-[12px] text-neutral-500 truncate">
                {c.merchant_name || 'Unassigned'}
                {c.expires_at && ` · Expires ${formatDate(c.expires_at)}`}
              </p>
            </div>
            <p className={`text-[12px] font-medium shrink-0 ml-3 ${statusColor}`}>
              {statusLabel}
            </p>
          </div>
        );
      })}
    </div>
  )}
</section>

        {/* Available coupons, grouped by merchant — from /coupons */}
        {availableCoupons.length === 0 ? (
          myCoupons.length === 0 && (
            <p className="py-6 text-[13px] text-neutral-400">No coupons yet.</p>
          )
        ) : (
          <div className="space-y-9">
            {merchantNames.map((merchantName) => {
              const merchantCoupons = grouped[merchantName];
              const merchantPoints = merchantCoupons[0]?.user_points;

              return (
                <section key={merchantName}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-[13px] font-medium text-neutral-900">
                      {merchantName}
                    </h2>
                    {userPhoneNumber && (
                      <span className="text-[11.5px] font-mono text-green-700 bg-amber-50 px-2 py-0.5 rounded-full">
                       You have:  {merchantPoints ?? 0} pts available
                      </span>
                    )}
                  </div>

                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {merchantCoupons.map((c) => {
                      const description = getCouponDescription(c);
                      return (
                        <div
                          key={c.coupon_id}
                          className={`rounded-xl border bg-white p-4 flex flex-col gap-3 ${
                            c.is_active ? 'border-neutral-200' : 'border-neutral-100 opacity-60'
                          }`}
                        >
                         <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[15px] font-medium text-neutral-900">
                            {getCouponTitle(c)}
                          </p>
                          {c.title && getCouponValueLabel(c) && (
                            <span className="text-[11px] font-medium text-green-700 bg-amber-50 px-1.5 py-0.5 rounded-full shrink-0">
                              {getCouponValueLabel(c)}
                            </span>
                          )}
                        </div>
                        {description && (
                          <p className="text-[12px] text-neutral-500 mt-0.5">{description}</p>
                        )}
                            <p className="text-[12px] text-neutral-500 mt-0.5">
                              {c.expires_at ? `Expires ${formatDate(c.expires_at)}` : 'Expires never'}
                            </p>
                          </div>
                          <div className="flex items-center justify-between mt-auto">
                            <span className="text-[12.5px] font-mono text-neutral-500">
                              {c.points_cost} pts
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={!c.is_active}
                              onClick={() => openClaimModal(c)}
                            >
                              {c.is_active ? 'Claim' : 'Inactive'}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      {/* Claim confirmation modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm claim</DialogTitle>
            <DialogDescription>
              This action can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedCoupon && (
            <div className="py-1">
              <div className="rounded-lg bg-neutral-50 p-3.5 mb-3">
               <p className="text-[14px] font-medium text-neutral-900">
                    {getCouponTitle(selectedCoupon)}
                  </p>
                  {selectedCoupon.title && getCouponValueLabel(selectedCoupon) && (
                    <p className="text-[12.5px] text-green-700 font-medium mt-0.5">
                      {getCouponValueLabel(selectedCoupon)}
                    </p>
                  )}
                {getCouponDescription(selectedCoupon) && (
                  <p className="text-[12.5px] text-neutral-500 mt-0.5">
                    {getCouponDescription(selectedCoupon)}
                  </p>
                )}
                <p className="text-[12.5px] text-neutral-500 mt-0.5">
                  {selectedCoupon.merchant_name || 'Unassigned'}
                  {selectedCoupon.expires_at && ` · Expires ${formatDate(selectedCoupon.expires_at)}`}
                </p>
              </div>

              {currentPoints != null ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-neutral-500">Cost</span>
                    <span className="font-mono text-neutral-900">{selectedCoupon.points_cost} pts</span>
                  </div>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-neutral-500">You have</span>
                    <span className="font-mono text-neutral-900">{currentPoints} pts</span>
                  </div>
                  <div className="flex items-center justify-between text-[13px] pt-1.5 border-t border-neutral-100">
                    <span className="text-neutral-500">After claim</span>
                    <span className={`font-mono ${insufficientPoints ? 'text-red-600' : 'text-neutral-900'}`}>
                      {pointsAfterClaim} pts
                    </span>
                  </div>
                  {insufficientPoints && (
                    <p className="text-[12px] text-red-600 pt-1">
                      You don&apos;t have enough points for this coupon.
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-neutral-500">Cost</span>
                  <span className="font-mono text-neutral-900">{selectedCoupon.points_cost} pts</span>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={isClaiming}>
              Cancel
            </Button>
            <Button onClick={confirmClaim} disabled={isClaiming || insufficientPoints}>
              {isClaiming ? 'Claiming…' : 'Confirm claim'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* OTP modal — shown once, right after a successful claim, or when tapping a code */}
      <Dialog open={!!otpModal} onOpenChange={(open) => !open && setOtpModal(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Coupon claimed</DialogTitle>
            <DialogDescription>Show this code to staff to redeem.</DialogDescription>
          </DialogHeader>
          {otpModal && (
            <div className="py-4 text-center">
              <p className="text-[32px] font-mono tracking-[0.2em] font-semibold text-neutral-900">
                {otpModal.otp}
              </p>
              <p className="text-[12px] mt-2 text-neutral-500">
                Expires in {Math.round(otpModal.expiresInSeconds / 60)} minutes
              </p>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setOtpModal(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}