'use client';

import { useState } from 'react';
import authenticatedFetch from '@/app/auth/authenticatedFetch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

const DISCOUNT_TYPES = {
  percent: { format: (v) => `${parseFloat(v)}% off` },
  amount: { format: (v) => `-$${parseFloat(v)} on everything` },
};

// Controlled from the parent (open / onOpenChange) so the dashboard can
// trigger it from a header button, same pattern as the existing dialogs.
export default function VerifyCouponModal({ open, onOpenChange }) {
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState('');
  const [result, setResult] = useState(null);

  function reset() {
    setOtp('');
    setStatus('idle');
    setErrorMessage('');
    setResult(null);
  }

  function handleOpenChange(next) {
    if (!next) reset();
    onOpenChange(next);
  }

  async function verifyCoupon() {
    if (!otp.trim()) return;
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/coupon/verify`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ otp: otp.trim() }),
        }
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      setResult(data);
      setStatus('success');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to verify coupon');
      setStatus('error');
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle>
            {status === 'success' ? 'Coupon redeemed' : 'Verify coupon'}
          </DialogTitle>
          <DialogDescription>
            {status === 'success'
              ? 'This coupon has been marked as used.'
              : "Enter the code the customer shows you at checkout."}
          </DialogDescription>
        </DialogHeader>

        {status === 'success' && result ? (
          <div className="py-2">
            <p className="text-[14px]">
              {DISCOUNT_TYPES[result.discountType]?.format(result.discountValue) ?? '—'}
            </p>
            <p className="text-[12px] mt-1 text-muted-foreground">
              {result.pointsCost} pts · {result.customerPhone ?? 'Unknown customer'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 py-2">
            <Label htmlFor="verify-otp">Code</Label>
            <Input
              id="verify-otp"
              inputMode="numeric"
              autoFocus
              placeholder="6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && verifyCoupon()}
              className="font-mono tracking-widest text-center text-[18px]"
              maxLength={6}
            />
            {status === 'error' && (
              <p className="text-[12px] text-destructive mt-1">{errorMessage}</p>
            )}
          </div>
        )}

        <DialogFooter>
          {status === 'success' ? (
            <Button onClick={() => handleOpenChange(false)}>Done</Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={verifyCoupon}
                disabled={status === 'loading' || !otp.trim()}
              >
                {status === 'loading' ? 'Verifying…' : 'Verify'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}