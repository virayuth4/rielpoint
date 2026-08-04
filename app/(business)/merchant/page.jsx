'use client';

import authenticatedFetch from '@/app/auth/authenticatedFetch';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  const [confirmAction, setConfirmAction] = useState(null);




  // discount_value from the API comes back as a string (e.g. "10.00"),
  // so we parseFloat it before formatting to avoid rendering "10.00% off".
const DISCOUNT_TYPES = {
  percent: { label: '% off', format: (c) => `${parseFloat(c.discount_value)}% off` },
  amount: { label: '$ off everything', format: (c) => `-$${parseFloat(c.discount_value)} on everything` },
  custom: { label: 'Custom perk', format: () => 'Custom perk' },
};

function getCouponTitle(c) {
  return c.title || DISCOUNT_TYPES[c.discount_type]?.format(c) || '—';
}

function getCouponValueLabel(c) {
  return DISCOUNT_TYPES[c.discount_type]?.format(c) ?? null;
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
      console.log("coupon data", data.coupons);
      console.log("Recent", data.recentPointTransactions);
      console.log("data", data)
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

  // Optimistic update
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
    setStaffs(previous); // rollback
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

async function removeStaff(rowId) {
  const previousStaffs = staffs;

  // Optimistic update
  setStaffs((prev) => prev.filter((s) => s.id !== rowId));

  try {
    const res = await authenticatedFetch(
      `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/staff/remove/${rowId}`,
      { method: 'POST' }
    );

    if (!res.ok) {
      throw new Error('Failed to remove staff');
    }
  } catch (err) {
    console.error('Remove staff error:', err);
    setStaffs(previousStaffs);
    setError(err.message || 'Failed to remove staff');
  }
}

 async function toggleCouponActive(coupon) {
  console.log('[toggleCouponActive] called with', coupon);
  if (coupon.is_active) {
    // deactivating — needs confirmation
    console.log('[toggleCouponActive] is_active=true → opening confirm dialog');
    setConfirmAction({ type: 'deactivate', coupon });
    return;
  }

  // activating — no confirmation needed
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
    setCoupons(previous); // rollback the optimistic update
    setError(err.message || 'Failed to activate coupon');
  }
}

async function addCoupon() {
  if (!newCouponPoints.trim()) return;
  if (newCouponDiscountType === 'custom' && !newCouponTitle.trim()) return;
  if (newCouponDiscountType !== 'custom' && !newCouponDiscountValue.trim()) return;
  if (newCouponExpiryMode === 'date' && !newCouponExpiryDate) return;

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
        expires_at: newCouponExpiryMode === 'date' ? newCouponExpiryDate : null,
        title: newCouponTitle.trim() || null,
        description: newCouponDescription.trim() || null,
      }),
      }
    );
    if (!res.ok) throw new Error(`Request failed (${res.status})`);
    const data = await res.json();
    setCoupons((prev) => [...prev, data.coupon]);
    setNewCouponPoints('');
    setNewCouponDiscountType('percent');
    setNewCouponDiscountValue('');
    setNewCouponTitle('');
    setNewCouponExpiryMode('none');
    setNewCouponExpiryDate('');
    setNewCouponDescription('');
    setShowAddCoupon(false);
  } catch (err) {
    setError(err.message || 'Failed to create coupon');
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
   console.log('[handleConfirm] fired, confirmAction =', confirmAction);
  if (!confirmAction) {
    console.log('[handleConfirm] no confirmAction, bailing');
    return;
  }
  const { type, coupon } = confirmAction;
  setConfirmAction(null);

  if (type === 'deactivate') {
    const url = `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/coupon/status/${coupon.coupon_id}`;
    console.log('[handleConfirm] deactivate → POST', url);

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
      console.log('[handleConfirm] response status:', res.status);
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.log('[handleConfirm] error body:', text);
        throw new Error(`Request failed (${res.status})`);
      }
      const data = await res.json();
      console.log('[handleConfirm] success body:', data);
    } catch (err) {
      console.log('[handleConfirm] caught error:', err);
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
    // Backend always soft-deletes (is_deleted = true), so no need to
    // re-add the coupon to the list on success.
  } catch (err) {
    setCoupons(previous);
    setError(err.message || 'Failed to remove coupon');
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
          <Button
            size="sm"
            onClick={() => router.push('/merchant/points')}
          >
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
                className="flex-1 text-[13px] font-mono"
              />
              <Button size="sm" onClick={addStaff}>
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleStaffActive(s.id)}
              >
                {s.is_active ? 'Deactivate' : 'Activate'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => removeStaff(s.id)}
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
            <Dialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
  <DialogContent className="sm:max-w-[380px]">
    <DialogHeader>
      <DialogTitle>
        {confirmAction?.type === 'remove' ? 'Remove coupon?' : 'Deactivate coupon?'}
      </DialogTitle>
      <DialogDescription>
        {confirmAction?.type === 'remove'
          ? 'This will permanently delete the coupon. Customers will no longer be able to redeem it.'
          : 'Customers will no longer be able to redeem this coupon until you reactivate it.'}
      </DialogDescription>
    </DialogHeader>
    {confirmAction?.coupon && (
      <p className="text-[13px] text-muted-foreground -mt-2">
        {DISCOUNT_TYPES[confirmAction.coupon.discount_type]?.format(confirmAction.coupon.discount_value)}
        {' · '}
        {confirmAction.coupon.points_cost} pts
      </p>
    )}
    <DialogFooter>
      <Button variant="outline" onClick={() => setConfirmAction(null)}>
        Cancel
      </Button>
      <Button
        variant={confirmAction?.type === 'remove' ? 'destructive' : 'default'}
        onClick={handleConfirm}
      >
        {confirmAction?.type === 'remove' ? 'Remove' : 'Deactivate'}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
          </div>

          <Dialog open={showAddCoupon} onOpenChange={setShowAddCoupon}>
            <DialogContent className="m:max-w-100">
              <DialogHeader>
                <DialogTitle>Add coupon</DialogTitle>
                <DialogDescription>
                  Create a new coupon customers can redeem with points.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-1.5">
  <Label htmlFor="coupon-title">
    Name {newCouponDiscountType !== 'custom' && <span className="text-muted-foreground">(optional)</span>}
  </Label>
  <Input
    id="coupon-title"
    placeholder="e.g. Free 1 Drink, Room Upgrade, New Year Special"
    value={newCouponTitle}
    onChange={(e) => setNewCouponTitle(e.target.value)}
  />
</div>
<div className="flex flex-col gap-1.5">
  <Label htmlFor="coupon-description">
    Description <span className="text-muted-foreground">(optional)</span>
  </Label>
  <Input
    id="coupon-description"
    placeholder="e.g. Dine-in only, valid weekdays"
    value={newCouponDescription}
    onChange={(e) => setNewCouponDescription(e.target.value)}
  />
</div>

        <div className="flex flex-col gap-1.5">
          <Label>Discount</Label>
          <div className="flex gap-2">
            {newCouponDiscountType !== 'custom' && (
              <Input
                type="number"
                placeholder={newCouponDiscountType === 'amount' ? '1' : '10'}
                value={newCouponDiscountValue}
                onChange={(e) => setNewCouponDiscountValue(e.target.value)}
                className="flex-1"
              />
            )}
            <Select value={newCouponDiscountType} onValueChange={setNewCouponDiscountType}>
              <SelectTrigger className={newCouponDiscountType === 'custom' ? 'flex-1' : 'w-[160px]'}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DISCOUNT_TYPES).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
              <div className="flex flex-col gap-4 py-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="coupon-points">Points to redeem</Label>
                  <Input
                    id="coupon-points"
                    type="number"
                    placeholder="e.g. 100"
                    value={newCouponPoints}
                    onChange={(e) => setNewCouponPoints(e.target.value)}
                  />
                </div>
               
                <div className="flex flex-col gap-1.5">
                  <Label>Expiration</Label>
                  <div className="flex gap-2">
                    <Select
                      value={newCouponExpiryMode}
                      onValueChange={setNewCouponExpiryMode}
                    >
                      <SelectTrigger className={newCouponExpiryMode === 'date' ? 'w-[160px]' : 'flex-1'}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Until turned off</SelectItem>
                        <SelectItem value="date">On a date</SelectItem>
                      </SelectContent>
                    </Select>
                    {newCouponExpiryMode === 'date' && (
                      <Input
                        type="date"
                        value={newCouponExpiryDate}
                        onChange={(e) => setNewCouponExpiryDate(e.target.value)}
                        className="flex-1"
                      />
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddCoupon(false)}>
                  Cancel
                </Button>
                <Button onClick={addCoupon}>Create</Button>
              </DialogFooter>
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
        <p className="text-[12px] mt-0.5 text-muted-foreground">
          {c.description}
        </p>
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
             <Button
              variant="outline"
              size="sm"
              onClick={() => toggleCouponActive(c)}
            >
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
<section className="mb-12">{/* Coupon claims */}
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
                    <p>
                      {DISCOUNT_TYPES[coupon.discount_type]?.format(
                        coupon.discount_value
                      ) ?? '—'}
                    </p>
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
                  <span className="text-[13px] text-muted-foreground">
                    Not redeemed
                  </span>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  )}
</section>
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
                    <p>
                      {DISCOUNT_TYPES[coupon.discount_type]?.format(
                        coupon.discount_value
                      ) ?? '—'}
                    </p>
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
                  <span className="text-[13px] text-muted-foreground">
                    Not redeemed
                  </span>
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
        {recentPointTransactions.map((t) => {
          const staffMember = staffs.find((s) => s.staff_id === t.staff_id);
          return (
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
          );
        })}
      </TableBody>
    </Table>
  )}
</section>


     
      </div>
    </div>
  );
}