'use client';

import authenticatedFetch from '@/app/auth/authenticatedFetch';
import { useContext, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHeader,
  TableHead,
} from '@/components/ui/table';
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

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [claimingId, setClaimingId] = useState(null);
  const [claimedIds, setClaimedIds] = useState(new Set());
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const context = useContext(AuthContext);
  const currentUser = context?.currentUser || null;
  const userId = getUserId(currentUser);
  const userPhoneNumber = currentUser?.phone_number || null;

  const DISCOUNT_TYPES = {
    percent: { label: '% off', format: (v) => `${parseFloat(v)}% off` },
    amount: { label: '$ off everything', format: (v) => `-$${parseFloat(v)} on everything` },
  };

  async function loadCoupons() {
    setLoading(true);
    setError(null);
    try {
      const url = new URL(`${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/coupons`);
      if (userPhoneNumber) url.searchParams.set('userPhoneNumber', userPhoneNumber);

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();
      setCoupons(data.coupons ?? []);
    } catch (err) {
      setError(err.message || 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCoupons();
  }, [userPhoneNumber]);

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
        { method: 'POST' }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Claim failed (${res.status})`);
      }
      setClaimedIds((prev) => new Set(prev).add(couponId));
      setModalOpen(false);
    } catch (err) {
      alert(err.message || 'Failed to claim coupon');
    } finally {
      setClaimingId(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-sm text-muted-foreground">Loading coupons…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
        <p className="text-sm">{error}</p>
        <Button variant="outline" onClick={loadCoupons}>
          Retry
        </Button>
      </div>
    );
  }

  const grouped = coupons.reduce((acc, c) => {
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
    <div className="min-h-screen px-6 py-16 font-sans bg-white">
      <div className="max-w-xl mx-auto">
        <header className="mb-12 pb-8 border-b">
          <p className="text-[11px] tracking-[0.18em] uppercase font-medium mb-1 text-muted-foreground">
            Rewards
          </p>
          <h1 className="text-[28px] leading-tight tracking-tight font-semibold font-serif">
            Coupons
          </h1>
        </header>

        {coupons.length === 0 ? (
          <p className="py-6 text-[13px] text-muted-foreground">No coupons yet.</p>
        ) : (
          merchantNames.map((merchantName) => {
            const merchantCoupons = grouped[merchantName];
            const merchantPoints = merchantCoupons[0]?.user_points;

            return (
              <section key={merchantName} className="mb-10">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] tracking-[0.18em] uppercase font-medium text-muted-foreground">
                    {merchantName} · {merchantCoupons.length}
                  </p>
                  {userPhoneNumber && (
                    <p className="text-[11px] font-mono text-muted-foreground">
                      {merchantPoints ?? 0} pts
                    </p>
                  )}
                </div>

                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="pl-0 h-auto pb-2 text-[10px] tracking-[0.14em] uppercase font-medium text-muted-foreground">
                        Discount
                      </TableHead>
                      <TableHead className="h-auto pb-2 text-[10px] tracking-[0.14em] uppercase font-medium text-muted-foreground">
                        Cost
                      </TableHead>
                      <TableHead className="h-auto pb-2 text-[10px] tracking-[0.14em] uppercase font-medium text-muted-foreground">
                        Status
                      </TableHead>
                      <TableHead className="text-right pr-0 h-auto pb-2 text-[10px] tracking-[0.14em] uppercase font-medium text-muted-foreground">
                        Claim
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {merchantCoupons.map((c) => {
                      const isRowClaimed = c.is_claimed || claimedIds.has(c.coupon_id);

                      return (
                        <TableRow key={c.coupon_id}>
                          <TableCell className="pl-0">
                            <div className="flex items-center gap-3">
                              <span
                                className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${
                                  c.is_active ? 'bg-green-500' : 'bg-muted-foreground/30'
                                }`}
                              />
                              <div>
                                <p className="text-[13px]">
                                  {DISCOUNT_TYPES[c.discount_type]?.format(c.discount_value) ?? '—'}
                                </p>
                                <p className="text-[12px] mt-0.5 text-muted-foreground">
                                  {c.expires_at
                                    ? `Expires ${new Date(c.expires_at).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                      })}`
                                    : 'Until turned off'}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground font-mono text-[13px]">
                            {c.points_cost} pts
                          </TableCell>
                          <TableCell>
                            <Badge variant={c.is_active ? 'default' : 'secondary'}>
                              {c.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right pr-0">
                            <Button
                              size="sm"
                              variant={isRowClaimed ? 'secondary' : 'outline'}
                              disabled={!c.is_active || isRowClaimed}
                              onClick={() => openClaimModal(c)}
                            >
                              {isRowClaimed ? 'Claimed' : 'Claim'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </section>
            );
          })
        )}
      </div>

      {/* Claim confirmation modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm claim</DialogTitle>
            <DialogDescription>
              You're about to claim this coupon. This action can't be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedCoupon && (
            <div className="py-2 space-y-3">
              <div>
                <p className="text-[11px] tracking-[0.14em] uppercase font-medium text-muted-foreground mb-1">
                  Business
                </p>
                <p className="text-[14px] font-medium">
                  {selectedCoupon.merchant_name || 'Unassigned'}
                </p>
              </div>

              <div>
                <p className="text-[11px] tracking-[0.14em] uppercase font-medium text-muted-foreground mb-1">
                  Coupon
                </p>
                <p className="text-[14px]">
                  {DISCOUNT_TYPES[selectedCoupon.discount_type]?.format(selectedCoupon.discount_value) ?? '—'}
                </p>
                <p className="text-[12px] mt-0.5 text-muted-foreground">
                  {selectedCoupon.expires_at
                    ? `Expires ${new Date(selectedCoupon.expires_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}`
                    : 'Until turned off'}
                </p>
              </div>

              <div>
                <p className="text-[11px] tracking-[0.14em] uppercase font-medium text-muted-foreground mb-1">
                  Cost
                </p>
                <p className="text-[14px] font-mono">
                  {selectedCoupon.points_cost} pts
                </p>
              </div>

              {currentPoints != null && (
                <div className="pt-2 border-t space-y-1">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-muted-foreground">You have</span>
                    <span className="font-mono">{currentPoints} pts</span>
                  </div>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-muted-foreground">After claim</span>
                    <span className={`font-mono ${insufficientPoints ? 'text-red-600' : ''}`}>
                      {pointsAfterClaim} pts
                    </span>
                  </div>
                  {insufficientPoints && (
                    <p className="text-[12px] text-red-600 pt-1">
                      You don't have enough points for this coupon.
                    </p>
                  )}
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
    </div>
  );
}