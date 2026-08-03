'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import authenticatedFetch from '@/app/auth/authenticatedFetch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const DISCOUNT_TYPES = {
  percent: { format: (v) => `${parseFloat(v)}% off` },
  amount: { format: (v) => `-$${parseFloat(v)} on everything` },
};

export default function VerifyCouponPage() {
  const router = useRouter();

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
    <div className="min-h-screen px-6 py-16 font-sans bg-white">
      <div className="max-w-sm mx-auto">
        <button
          type="button"
          onClick={() => router.push('/merchant')}
          className="text-[13px] text-muted-foreground hover:text-foreground mb-8"
        >
          ← Back to dashboard
        </button>

        <header className="mb-8">
          <p className="text-[11px] tracking-[0.18em] uppercase font-medium mb-1 text-muted-foreground">
            Merchant dashboard
          </p>
          <h1 className="text-[24px] leading-tight tracking-tight font-semibold font-serif">
            {status === 'success' ? 'Coupon redeemed' : 'Verify coupon'}
          </h1>
          <p className="text-[13px] mt-1 text-muted-foreground">
            {status === 'success'
              ? 'This coupon has been marked as used.'
              : "Enter the code the customer shows you at checkout."}
          </p>
        </header>

        {status === 'success' && result ? (
          <div className="py-2 mb-8">
            <p className="text-[14px]">
              {DISCOUNT_TYPES[result.discountType]?.format(result.discountValue) ?? '—'}
            </p>
            <p className="text-[12px] mt-1 text-muted-foreground">
              {result.pointsCost} pts · {result.customerPhone ?? 'Unknown customer'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 mb-8">
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

        <div className="flex gap-2">
          {status === 'success' ? (
            <>
              <Button variant="outline" onClick={reset}>
                Verify another
              </Button>
              <Button onClick={() => router.push('/merchant')}>Done</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => router.push('/merchant')}>
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
        </div>
      </div>
    </div>
  );
}