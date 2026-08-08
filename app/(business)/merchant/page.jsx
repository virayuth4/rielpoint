'use client';

import authenticatedFetch from '@/app/auth/authenticatedFetch';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
import { Label } from '@/components/ui/label';
import { Calendar, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { format } from 'date-fns';

export default function MerchantDashboard() {
  const router = useRouter();
  const [merchant, setMerchant] = useState(null);
  const [staffs, setStaffs] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [couponClaims, setCouponClaims] = useState([]);
  const [recentPointTransactions, setRecentPointTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBusinessDetails, setShowBusinessDetails] = useState(false);

  const [showAddStaff, setShowAddStaff] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');

  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [newCouponPoints, setNewCouponPoints] = useState('');
  const [newCouponDiscountType, setNewCouponDiscountType] = useState('percent');
  const [newCouponDiscountValue, setNewCouponDiscountValue] = useState('');
  const [newCouponTitle, setNewCouponTitle] = useState('');
  const [newCouponDescription, setNewCouponDescription] = useState('');
  const [newCouponExpiryMode, setNewCouponExpiryMode] = useState('none'); // 'none' | 'date'
  const [newCouponExpiryDate, setNewCouponExpiryDate] = useState('');
  const [newCouponCustomPerk, setNewCouponCustomPerk] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);
  const [isSubmittingCoupon, setIsSubmittingCoupon] = useState(false);
  const [couponFormError, setCouponFormError] = useState(null);
  const dateInputRef = useRef(null);

const formatDate = (isoDate) => {
  if (!isoDate) return null;
  const [y, m, d] = isoDate.split('-');
  return `${m}/${d}/${y}`;
};

  // discount_value from the API comes back as a string (e.g. "10.00"),
  // so we parseFloat it before formatting to avoid rendering "10.00% off".
  const DISCOUNT_TYPES = {
    percent: { label: '% off', format: (c) => `${parseFloat(c.discount_value)}% off` },
    amount: { label: '$ off ', format: (c) => `-$${parseFloat(c.discount_value)} on everything` },
    custom: { label: 'Custom perk', format: () => 'Custom perk' },
  };

  function getCouponTitle(c) {
    return c.title || DISCOUNT_TYPES[c.discount_type]?.format(c) || '—';
  }

  function getCouponValueLabel(c) {
    return DISCOUNT_TYPES[c.discount_type]?.format(c) ?? null;
  }

  // --- Add-coupon form derived state (mirrors the design reference) ---
  const needsValue = newCouponDiscountType !== 'custom';
  const isCustomDiscount = newCouponDiscountType === 'custom';
  const numericDiscountValue = Number(newCouponDiscountValue);

  const isCouponFormValid =
    newCouponPoints.trim().length > 0 &&
    (!needsValue || (newCouponDiscountValue.trim().length > 0 && numericDiscountValue > 0)) &&
    (!isCustomDiscount || newCouponCustomPerk.trim().length > 0) &&
    (!isCustomDiscount || newCouponTitle.trim().length > 0) &&
    (newCouponExpiryMode !== 'date' || newCouponExpiryDate.length > 0);

  const couponPreviewLabel = useMemo(() => {
    if (isCustomDiscount) {
      return newCouponCustomPerk.trim() ? `Custom perk — ${newCouponCustomPerk.trim()}` : 'Custom perk';
    }
    if (!(numericDiscountValue > 0)) {
      return newCouponDiscountType === 'percent' ? '—% off' : '-$— on everything';
    }
    return DISCOUNT_TYPES[newCouponDiscountType].format({ discount_value: newCouponDiscountValue });
  }, [newCouponDiscountType, newCouponDiscountValue, numericDiscountValue, isCustomDiscount, newCouponCustomPerk]);

  function resetCouponForm() {
    setNewCouponPoints('');
    setNewCouponDiscountType('percent');
    setNewCouponDiscountValue('');
    setNewCouponCustomPerk('');
    setNewCouponTitle('');
    setNewCouponExpiryMode('none');
    setNewCouponExpiryDate('');
    setNewCouponDescription('');
    setCouponFormError(null);
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    setError(null);
    try {
      const res = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/dashboard`
      );
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();

      setMerchant(data.merchant ?? null);
      setStaffs(data.staffs ?? []);
      setCoupons(data.coupons ?? []);
      setCouponClaims(data.couponClaims ?? []);
      setRecentPointTransactions(data.recentPointTransactions ?? []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }

  async function toggleStaffActive(staffId) {
    const previous = staffs;
    const target = staffs.find((s) => s.id === staffId);
    if (!target) return;
    const nextActive = !target.is_active;

    setStaffs((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, is_active: nextActive } : s))
    );

    try {
      const res = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/staff/status/${staffId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_active: nextActive }),
        }
      );
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
    } catch (err) {
      setStaffs(previous);
      setError(err.message || 'Failed to update staff status');
    }
  }

  async function addStaff() {
    if (!newStaffPhone.trim()) return;
    const previous = staffs;
    try {
      const res = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/staff/add`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ staff_phone: newStaffPhone.trim() }),
        }
      );
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();
      setStaffs((prev) => [...prev, data.staff]);
      setNewStaffPhone('');
      setShowAddStaff(false);
    } catch (err) {
      setStaffs(previous);
      setError(err.message || 'Failed to add staff');
    }
  }

  function requestRemoveStaff(staff) {
    setConfirmAction({ type: 'removeStaff', staff });
  }

  async function toggleCouponActive(coupon) {
    if (coupon.is_active) {
      setConfirmAction({ type: 'deactivate', coupon });
      return;
    }

    const previous = coupons;
    setCoupons((prev) =>
      prev.map((c) =>
        c.coupon_id === coupon.coupon_id ? { ...c, is_active: true } : c
      )
    );
    try {
      const res = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/coupon/status/${coupon.coupon_id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_active: true }),
        }
      );
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
    } catch (err) {
      setCoupons(previous);
      setError(err.message || 'Failed to activate coupon');
    }
  }

  async function addCoupon() {
    if (!isCouponFormValid || isSubmittingCoupon) return;

    setIsSubmittingCoupon(true);
    setCouponFormError(null);

    try {
      const res = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/coupon/create`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            points_cost: Number(newCouponPoints.trim()),
            discount_type: newCouponDiscountType,
            discount_value: newCouponDiscountType === 'custom' ? null : Number(newCouponDiscountValue.trim()),
            custom_perks: newCouponDiscountType === 'custom' ? newCouponCustomPerk.trim() : null,
            expires_at: newCouponExpiryMode === 'date' ? newCouponExpiryDate : null,
            title: newCouponTitle.trim() || null,
            description: newCouponDescription.trim() || null,
          }),
        }
      );
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();
      setCoupons((prev) => [...prev, data.coupon]);
      resetCouponForm();
      setShowAddCoupon(false);
    } catch (err) {
      setCouponFormError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmittingCoupon(false);
    }
  }

  function requestRemoveCoupon(coupon) {
    setConfirmAction({ type: 'remove', coupon });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-sm text-muted-foreground">Loading dashboard…</p>
      </div>
    );
  }

  async function handleConfirm() {
    if (!confirmAction) return;
    const { type, coupon, staff } = confirmAction;
    setConfirmAction(null);

    if (type === 'deactivate') {
      const url = `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/coupon/status/${coupon.coupon_id}`;
      const previous = coupons;
      setCoupons((prev) =>
        prev.map((c) =>
          c.coupon_id === coupon.coupon_id ? { ...c, is_active: false } : c
        )
      );
      try {
        const res = await authenticatedFetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_active: false }),
        });
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
      } catch (err) {
        setCoupons(previous);
        setError(err.message || 'Failed to deactivate coupon');
      }
    } else if (type === 'remove') {
      const previous = coupons;
      setCoupons((prev) => prev.filter((c) => c.coupon_id !== coupon.coupon_id));
      try {
        const res = await authenticatedFetch(
          `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/coupon/delete`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ couponId: coupon.coupon_id }),
          }
        );
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
      } catch (err) {
        setCoupons(previous);
        setError(err.message || 'Failed to remove coupon');
      }
    } else if (type === 'removeStaff') {
      const previousStaffs = staffs;
      setStaffs((prev) => prev.filter((s) => s.id !== staff.id));
      try {
        const res = await authenticatedFetch(
          `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/staff/remove/${staff.id}`,
          { method: 'POST' }
        );
        if (!res.ok) throw new Error('Failed to remove staff');
      } catch (err) {
        setStaffs(previousStaffs);
        setError(err.message || 'Failed to remove staff');
      }
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
        <p className="text-sm">{error}</p>
        <Button variant="outline" onClick={loadDashboard}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-16 font-sans bg-white">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <header className="mb-12 pb-8 border-b">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] tracking-[0.18em] uppercase font-medium mb-1 text-muted-foreground">
                Merchant dashboard
              </p>
              <h1 className="text-[28px] leading-tight tracking-tight font-semibold font-serif">
                {merchant?.name ?? 'Your business'}
              </h1>
            </div>
            {merchant?.status && (
              <Badge
                variant={merchant.status === 'active' ? 'default' : 'secondary'}
                className="mt-1.5 capitalize"
              >
                {merchant.status}
              </Badge>
            )}
          </div>
        </header>

        {/* Add points */}
        <div className="mb-8 flex justify-center gap-2">
          <Button size="sm" onClick={() => router.push('/merchant/points')}>
            Add points
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/merchant/verify')}
            className="text-[13px] h-auto py-1 px-2"
          >
            Verify coupon
          </Button>
        </div>

        {/* Business details */}
        {merchant && (
          <section className="mb-12">
            <button
              type="button"
              onClick={() => setShowBusinessDetails((v) => !v)}
              className="w-full flex items-center justify-between py-1 group"
            >
              <p className="text-[11px] tracking-[0.18em] uppercase font-medium text-muted-foreground">
                Business details
              </p>
              <span
                className={`text-muted-foreground text-[12px] transition-transform ${
                  showBusinessDetails ? 'rotate-180' : ''
                }`}
              >
                ▾
              </span>
            </button>

            {showBusinessDetails && (
              <Table className="mt-3">
                <TableBody>
                  <TableRow>
                    <TableCell className="text-muted-foreground pl-0">Slug</TableCell>
                    <TableCell className="text-right font-mono pr-0">{merchant.slug ?? '—'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-muted-foreground pl-0">Contact phone</TableCell>
                    <TableCell className="text-right font-mono pr-0">{merchant.contact_phone ?? '—'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-muted-foreground pl-0">Member since</TableCell>
                    <TableCell className="text-right pr-0">
                      {merchant.created_at
                        ? new Date(merchant.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : '—'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-muted-foreground pl-0">Next Payment</TableCell>
                    <TableCell className="text-right pr-0">Tomorrow</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}
          </section>
        )}

        {/* Staff */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] tracking-[0.18em] uppercase font-medium text-muted-foreground">
              Staff · {staffs.length}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddStaff((v) => !v)}
              className="text-[13px] h-auto py-1 px-2"
            >
              {showAddStaff ? 'Cancel' : '+ Add staff'}
            </Button>
          </div>

          {showAddStaff && (
            <div className="mb-4 flex flex-col sm:flex-row gap-2 border-b pb-4">
              <Input
                type="tel"
                placeholder="Phone number"
                value={newStaffPhone}
                onChange={(e) => setNewStaffPhone(e.target.value)}
                className="flex-1 text-[13px] font-mono p-3"
              />
              <Button className="p-3" onClick={addStaff}>
                Invite
              </Button>
            </div>
          )}

          <div className="divide-y">
            {staffs.length === 0 ? (
              <p className="py-6 text-[13px] text-muted-foreground">No staff yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-0 h-auto pb-2 text-[10px] tracking-[0.14em] uppercase font-medium text-muted-foreground">
                      Name
                    </TableHead>
                    <TableHead className="h-auto pb-2 text-[10px] tracking-[0.14em] uppercase font-medium text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="text-right pr-0 h-auto pb-2"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffs.map((s) => (
                    <TableRow key={s.staff_id}>
                      <TableCell className="pl-0">
                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${
                              s.is_active ? 'bg-green-500' : 'bg-muted-foreground/30'
                            }`}
                          />
                          <div>
                            <p className="text-[14px]">{s.fullname}</p>
                            <p className="text-[12px] mt-0.5 text-muted-foreground font-mono">
                              {s.phone_number}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-[13px] ${
                            s.is_active ? 'text-green-600' : 'text-muted-foreground'
                          }`}
                        >
                          {s.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-0">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => toggleStaffActive(s.id)}>
                            {s.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => requestRemoveStaff(s)}
                          >
                            Remove
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </section>

        {/* Coupons */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] tracking-[0.18em] uppercase font-medium text-muted-foreground">
              Coupons · {coupons.length}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddCoupon(true)}
              className="text-[13px] h-auto py-1 px-2"
            >
              + Add coupon
            </Button>

            {/* Confirm dialog (deactivate / remove coupon / remove staff) */}
            <Dialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
              <DialogContent className="sm:max-w-[380px]">
                <DialogHeader>
                  <DialogTitle>
                    {confirmAction?.type === 'remove'
                      ? 'Remove coupon?'
                      : confirmAction?.type === 'removeStaff'
                      ? 'Remove staff member?'
                      : 'Deactivate coupon?'}
                  </DialogTitle>
                  <DialogDescription>
                    {confirmAction?.type === 'remove'
                      ? 'This will permanently delete the coupon. Customers will no longer be able to redeem it.'
                      : confirmAction?.type === 'removeStaff'
                      ? 'This will permanently remove this staff member from your business. This cannot be undone.'
                      : 'Customers will no longer be able to redeem this coupon until you reactivate it.'}
                  </DialogDescription>
                </DialogHeader>

                {confirmAction?.coupon && (
                  <p className="text-[13px] text-muted-foreground -mt-2">
                    {DISCOUNT_TYPES[confirmAction.coupon.discount_type]?.format(confirmAction.coupon)}
                    {' · '}
                    {confirmAction.coupon.points_cost} pts
                  </p>
                )}

                {confirmAction?.staff && (
                  <p className="text-[13px] text-muted-foreground -mt-2">
                    {confirmAction.staff.fullname}
                    {' · '}
                    <span className="font-mono">{confirmAction.staff.phone_number}</span>
                  </p>
                )}

                <DialogFooter>
                  <Button variant="outline" onClick={() => setConfirmAction(null)}>
                    Cancel
                  </Button>
                  <Button
                    variant={confirmAction?.type === 'deactivate' ? 'default' : 'destructive'}
                    onClick={handleConfirm}
                  >
                    {confirmAction?.type === 'remove'
                      ? 'Remove'
                      : confirmAction?.type === 'removeStaff'
                      ? 'Remove'
                      : 'Deactivate'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Add coupon — restyled to match the sharp, black/white design reference */}
          <Dialog
            open={showAddCoupon}
            onOpenChange={(open) => {
              setShowAddCoupon(open);
              if (!open) resetCouponForm();
            }}
          >
             <DialogContent
  className="gap-0 overflow-y-auto overflow-x-hidden border-neutral-200 p-0
            fixed inset-0 h-full w-full max-w-none translate-x-0 translate-y-0 rounded-none
            sm:inset-auto sm:left-1/2 sm:top-1/2 sm:h-auto sm:max-h-[85vh] sm:w-full sm:max-w-105
            sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-none"
  style={{ scrollbarGutter: 'stable' }}
>
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-neutral-100 bg-white px-6 pt-6 pb-4 sm:border-none sm:pb-1">
          <DialogHeader className="text-left">
            <DialogTitle className="text-2xl font-semibold text-black">Add coupon</DialogTitle>
            <DialogDescription className="text-sm text-neutral-500">
              Create a new coupon customers can redeem with points.
            </DialogDescription>
          </DialogHeader>
          <button
            type="button"
            onClick={() => setShowAddCoupon(false)}
            className="ml-4 mt-1 shrink-0 rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-black"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

                    <div className="px-6 py-6">
                      <Label
                        htmlFor="coupon-title"
                        className="mb-1 block text-xs font-medium text-neutral-500"
                      >
                        Name{' '}
                        {newCouponDiscountType !== 'custom' && (
                          <span className="text-neutral-400">(optional)</span>
                        )}
                      </Label>
                      <Input
                        id="coupon-title"
                        placeholder="e.g. Free 1 Drink, Room Upgrade, New Year Special"
                        value={newCouponTitle}
                        onChange={(e) => setNewCouponTitle(e.target.value)}
                        className="mb-5 w-full rounded-none border-neutral-200 px-4 py-3 text-base md:text-sm text-black focus-visible:ring-0 focus-visible:border-black"
                      />

                      <Label
                        htmlFor="coupon-description"
                        className="mb-1 block text-xs font-medium text-neutral-500"
                      >
                        Description <span className="text-neutral-400">(optional)</span>
                      </Label>
                      <Input
                        id="coupon-description"
                        placeholder="e.g. Dine-in only, valid weekdays"
                        value={newCouponDescription}
                        onChange={(e) => setNewCouponDescription(e.target.value)}
                        className="mb-5 w-full rounded-none border-neutral-200 px-4 py-3 text-base md:text-sm text-black focus-visible:ring-0 focus-visible:border-black"
                      />

                      <Label className="mb-2 block text-xs font-medium text-neutral-500">Discount type</Label>
                      <div className="mb-5 flex gap-2">
                        {Object.entries(DISCOUNT_TYPES).map(([key, { label }]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              setNewCouponDiscountType(key);
                              if (key === 'custom') setNewCouponDiscountValue('');
                              else setNewCouponCustomPerk('');
                            }}
                            className={`flex-1 border py-2.5 text-xs font-semibold transition-colors ${
                              newCouponDiscountType === key
                                ? 'border-black bg-black text-white'
                                : 'border-neutral-200 bg-white text-neutral-500'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>

                      {needsValue ? (
                        <>
                          <Label
                            htmlFor="coupon-discount-value"
                            className="mb-1 block text-xs font-medium text-neutral-500"
                          >
                            {newCouponDiscountType === 'percent' ? 'Percent off' : 'Amount off ($)'}
                          </Label>
                          <Input
                            id="coupon-discount-value"
                            type="number"
                            placeholder={newCouponDiscountType === 'amount' ? '5' : '15'}
                            min="0"
                            step={newCouponDiscountType === 'percent' ? '1' : '0.01'}
                            value={newCouponDiscountValue}
                            onChange={(e) => setNewCouponDiscountValue(e.target.value)}
                            className="mb-5 w-full rounded-none border-neutral-200 px-4 py-3 font-mono text-base md:text-sm text-black focus-visible:ring-0 focus-visible:border-black"
                          />
                        </>
                      ) : (
                        <>
                          <Label
                            htmlFor="coupon-custom-perk"
                            className="mb-1 block text-xs font-medium text-neutral-500"
                          >
                            Custom perk
                          </Label>
                          <Input
                            id="coupon-custom-perk"
                            placeholder="e.g. Free dessert of your choice"
                            value={newCouponCustomPerk}
                            onChange={(e) => setNewCouponCustomPerk(e.target.value)}
                            className="mb-5 w-full rounded-none border-neutral-200 px-4 py-3 text-base md:text-sm text-black focus-visible:ring-0 focus-visible:border-black"
                          />
                        </>
                      )}

                      <Label
                        htmlFor="coupon-points"
                        className="mb-1 block text-xs font-medium text-neutral-500"
                      >
                        Points to redeem
                      </Label>
                      <Input
                        id="coupon-points"
                        type="number"
                        placeholder="e.g. 3000"
                        value={newCouponPoints}
                        onChange={(e) => setNewCouponPoints(e.target.value)}
                        className="mb-5 w-full rounded-none border-neutral-200 px-4 py-3 font-mono text-base md:text-sm text-black focus-visible:ring-0 focus-visible:border-black"
                      />

                   <Label className="mb-2 block text-xs font-medium text-neutral-500">Expiration</Label>
<div className="mb-6 flex gap-2">
  <button
    type="button"
    onClick={() => {
      setNewCouponExpiryMode('none');
      setNewCouponExpiryDate('');
    }}
    className={`flex-1 border py-2.5 text-xs font-semibold transition-colors ${
      newCouponExpiryMode === 'none'
        ? 'border-black bg-black text-white'
        : 'border-neutral-200 bg-white text-neutral-500'
    }`}
  >
    Until turned off
  </button>

  <button
    type="button"
    onClick={() => {
      setNewCouponExpiryMode('date');
      // open the native picker on the same click
      dateInputRef.current?.showPicker?.();
    }}
    className={`relative flex-1 border py-2.5 text-xs font-semibold transition-colors ${
      newCouponExpiryMode === 'date'
        ? 'border-black bg-black text-white'
        : 'border-neutral-200 bg-white text-neutral-500'
    }`}
  >
    {newCouponExpiryMode === 'date' && newCouponExpiryDate
      ? formatDate(newCouponExpiryDate)
      : 'On a date'}

    <input
      ref={dateInputRef}
      type="date"
      value={newCouponExpiryDate}
      onChange={(e) => {
        setNewCouponExpiryDate(e.target.value);
        setNewCouponExpiryMode('date');
      }}
      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      style={{ colorScheme: 'light' }}
      tabIndex={-1}
    />
  </button>
</div>

      {newCouponExpiryMode !== 'date' && <div className="mb-6" />}

                     {/* Live preview, matching the reference design */}
<div className="mb-6 border border-neutral-200 bg-neutral-50 px-4 py-3">
  <p className="mb-1 text-xs text-neutral-500">Preview</p>
  <p className="text-sm font-semibold text-black">
    {newCouponTitle || 'Untitled coupon'}
  </p>
  <p className="mt-0.5 font-mono text-xs text-neutral-500">{couponPreviewLabel}</p>
  <p className="mt-0.5 font-mono text-xs text-neutral-500">
    {newCouponExpiryMode === 'date' && newCouponExpiryDate
      ? `Expires ${formatDate(newCouponExpiryDate)}`
      : 'Until turned off'}
  </p>
</div>

                      <button
                        onClick={addCoupon}
                        disabled={!isCouponFormValid || isSubmittingCoupon}
                        className={`w-full bg-black py-3 text-sm font-semibold text-white transition-opacity ${
                          isCouponFormValid && !isSubmittingCoupon ? 'opacity-100' : 'opacity-40'
                        }`}
                      >
                        {isSubmittingCoupon ? 'Creating...' : couponFormError ? 'Retry' : 'Create coupon'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowAddCoupon(false)}
                        className="mt-3 w-full border border-neutral-200 bg-white py-3 text-sm font-semibold text-black transition-colors hover:bg-neutral-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </DialogContent>
          </Dialog>

          {coupons.length === 0 ? (
            <p className="py-6 text-[13px] text-muted-foreground">No coupons yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-0 h-auto pb-2 text-[10px] tracking-[0.14em] uppercase font-medium text-muted-foreground">
                    Discount
                  </TableHead>
                  <TableHead className="h-auto pb-2 text-[10px] tracking-[0.14em] uppercase font-medium text-muted-foreground">
                    Cost
                  </TableHead>
                  <TableHead className="text-right pr-0 h-auto pb-2"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((c) => (
                  <TableRow key={c.coupon_id}>
                    <TableCell className="pl-0">
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${
                            c.is_active ? 'bg-green-500' : 'bg-muted-foreground/30'
                          }`}
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-[13px]">{getCouponTitle(c)}</p>
                            {c.title && getCouponValueLabel(c) && (
                              <Badge variant="secondary" className="text-[10px] font-normal">
                                {getCouponValueLabel(c)}
                              </Badge>
                            )}
                          </div>
                          {c.description && (
                            <p className="text-[12px] mt-0.5 text-muted-foreground">{c.description}</p>
                          )}
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
                    <TableCell className="text-right pr-0">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => toggleCouponActive(c)}>
                          {c.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => requestRemoveCoupon(c)}
                        >
                          Remove
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>

        {/* Coupon claims */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] tracking-[0.18em] uppercase font-medium text-muted-foreground">
              Coupon claims · {couponClaims.length}
            </p>
          </div>

          {couponClaims.length === 0 ? (
            <p className="py-6 text-[13px] text-muted-foreground">No claims yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-0 h-auto pb-2 text-[10px] tracking-[0.14em] uppercase font-medium text-muted-foreground">
                    Customer
                  </TableHead>
                  <TableHead className="h-auto pb-2 text-[10px] tracking-[0.14em] uppercase font-medium text-muted-foreground">
                    Coupon
                  </TableHead>
                  <TableHead className="h-auto pb-2 text-[10px] tracking-[0.14em] uppercase font-medium text-muted-foreground">
                    Redeemed By
                  </TableHead>
                  <TableHead className="text-right pr-0 h-auto pb-2 text-[10px] tracking-[0.14em] uppercase font-medium text-muted-foreground">
                    Redeemed
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {couponClaims.map((claim) => {
                  const coupon = coupons.find(
                    (c) => String(c.coupon_id) === String(claim.coupon_id)
                  );
                  return (
                    <TableRow key={claim.claim_id}>
                      <TableCell className="pl-0">
                        <p className="text-[13px]">{claim.customer_phone ?? '—'}</p>
                        <p className="text-[12px] mt-0.5 text-muted-foreground font-mono">
                          Customer ID:{claim.customer_id}
                        </p>
                      </TableCell>
                      <TableCell className="text-[13px]">
                        {coupon ? (
                          <>
                            <p>{DISCOUNT_TYPES[coupon.discount_type]?.format(coupon) ?? '—'}</p>
                            <p className="text-[12px] mt-0.5 text-muted-foreground font-mono">
                              {coupon.points_cost} pts
                            </p>
                          </>
                        ) : (
                          <span className="text-muted-foreground font-mono text-[12px]">
                            #{claim.coupon_id}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-[13px]">
                        {claim.staff_fullname ? (
                          claim.staff_fullname
                        ) : claim.staff_id ? (
                          <span className="text-muted-foreground font-mono text-[12px]">
                            #{claim.staff_id}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right pr-0">
                        {claim.redeemed_at ? (
                          <p className="text-[13px]">
                            {new Date(claim.redeemed_at).toLocaleString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </p>
                        ) : (
                          <span className="text-[13px] text-muted-foreground">Not redeemed</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </section>

        {/* Recent point transactions */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] tracking-[0.18em] uppercase font-medium text-muted-foreground">
              Recent point transactions · {recentPointTransactions.length}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/merchant/points')}
              className="text-[13px] h-auto py-1 px-2"
            >
              + Add points
            </Button>
          </div>

          {recentPointTransactions.length === 0 ? (
            <p className="py-6 text-[13px] text-muted-foreground">No transactions yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-0 h-auto pb-2 text-[10px] tracking-[0.14em] uppercase font-medium text-muted-foreground">
                    Customer
                  </TableHead>
                  <TableHead className="h-auto pb-2 text-[10px] tracking-[0.14em] uppercase font-medium text-muted-foreground">
                    Checkout Amount
                  </TableHead>
                  <TableHead className="h-auto pb-2 text-[10px] tracking-[0.14em] uppercase font-medium text-muted-foreground">
                    Staff
                  </TableHead>
                  <TableHead className="text-right pr-0 h-auto pb-2 text-[10px] tracking-[0.14em] uppercase font-medium text-muted-foreground">
                    Points
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPointTransactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="pl-0">
                      <p className="text-[13px] font-mono">{t.customer_phone}</p>
                      <p className="text-[12px] mt-0.5 text-muted-foreground">
                        {new Date(t.created_at).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-[13px]">
                      ${parseFloat(t.amount).toFixed(2)} {t.currency}
                    </TableCell>
                    <TableCell className="text-[13px]">
                      {t.staff_fullname ? (
                        t.staff_fullname
                      ) : t.staff_id ? (
                        <span className="text-muted-foreground font-mono text-[12px]">
                          #{t.staff_id}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-0">
                      <p className="text-[13px] font-mono">+{t.points.toLocaleString()} pts</p>
                      {t.new_balance !== null && (
                        <p className="text-[12px] mt-0.5 text-muted-foreground">
                          Balance: {t.new_balance.toLocaleString()}
                        </p>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>
      </div>
    </div>
  );
}