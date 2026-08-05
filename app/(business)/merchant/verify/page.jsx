'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Inter, Space_Mono } from 'next/font/google';
import authenticatedFetch from '@/app/auth/authenticatedFetch';

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

const DISCOUNT_TYPES = {
  percent: { format: (v) => `${parseFloat(v)}% off` },
  amount: { format: (v) => `-$${parseFloat(v)} on everything` },
};

export default function VerifyCouponPage() {
  const router = useRouter();
  const inputRef = useRef(null);

  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState('');
  const [result, setResult] = useState(null);

  function reset() {
    setOtp('');
    setStatus('idle');
    setErrorMessage('');
    setResult(null);
    requestAnimationFrame(() => inputRef.current?.focus());
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

  const isValid = otp.trim().length > 0;

  return (
    <main className={`${inter.variable} ${mono.variable} min-h-screen bg-white font-sans`}>
      <div className="mx-auto max-w-md px-6 pt-10 pb-20">
        <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
          Merchant
        </p>

        <h1 className="mb-2 text-2xl font-semibold text-black">
          {status === 'success' ? 'Coupon redeemed' : 'Verify coupon'}
        </h1>
        <p className="mb-8 text-sm text-neutral-500">
          {status === 'success'
            ? 'This coupon has been marked as used.'
            : "Enter the code the customer shows you at checkout."}
        </p>

        {status !== 'success' ? (
          <div className="border border-neutral-200 bg-white px-5 py-6">
            <label
              htmlFor="verify-otp"
              className="mb-1.5 block text-xs font-medium text-neutral-500"
            >
              Code
            </label>
            <input
              id="verify-otp"
              ref={inputRef}
              inputMode="numeric"
              autoFocus
              placeholder="6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && verifyCoupon()}
              maxLength={6}
              className="mb-5 w-full border border-neutral-200 px-4 py-3 text-center font-mono text-[18px] tracking-widest text-black outline-none focus:border-black"
            />

            {status === 'error' && (
              <div className="mb-4 flex items-start gap-2 border border-black px-4 py-3 text-xs font-medium text-black">
                <span aria-hidden="true">⚠</span>
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex gap-2">
              {/* <button
                type="button"
                onClick={() => router.push('/merchant')}
                className="flex-1 border border-neutral-200 bg-white py-3 text-sm font-semibold text-black transition-colors hover:bg-neutral-50"
              >
                Cancel
              </button> */}
              <button
                type="button"
                onClick={verifyCoupon}
                disabled={status === 'loading' || !isValid}
                className={`flex-1 bg-black py-3 text-sm font-semibold text-white transition-opacity ${
                  isValid && status !== 'loading' ? 'opacity-100' : 'opacity-40'
                }`}
              >
                {status === 'loading' ? 'Verifying…' : status === 'error' ? 'Retry' : 'Verify'}
              </button>
            </div>
          </div>
        ) : (
          <div className="border border-neutral-200 bg-white px-5 py-6">
            <div className="mb-5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 border border-black px-2.5 py-1 text-xs font-bold text-black">
                <span aria-hidden="true">✓</span> Redeemed
              </span>
              <button onClick={reset} className="text-xs text-neutral-500 hover:text-black">
                Verify another
              </button>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-neutral-500">Discount</span>
              <span className="text-sm font-medium text-black">
                {DISCOUNT_TYPES[result.discountType]?.format(result.discountValue) ?? '—'}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-neutral-200 py-2">
              <span className="text-xs text-neutral-500">Customer</span>
              <span className="font-mono text-sm text-black">
                {result.customerPhone ?? 'Unknown'}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-neutral-200 py-2">
              <span className="text-xs text-neutral-500">Points cost</span>
              <span className="font-mono text-sm font-semibold text-black">
                {result.pointsCost.toLocaleString()} pts
              </span>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={reset}
                className="flex-1 border border-neutral-200 bg-white py-3 text-sm font-semibold text-black transition-colors hover:bg-neutral-50"
              >
                Verify another
              </button>
              <button
                type="button"
                onClick={() => router.push('/merchant')}
                className="flex-1 bg-black py-3 text-sm font-semibold text-white"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}