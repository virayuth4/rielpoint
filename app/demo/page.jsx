'use client';

import { useMemo, useRef, useState } from 'react';
import { Inter, Space_Mono } from 'next/font/google';

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

const RATE_OPTIONS = [10, 25, 50];
const KHR_PER_USD = 4001; // Fixed conversion rate: 4,001 KHR = $1 USD

const DISCOUNT_TYPES = {
  percent: { format: (v) => `${parseFloat(v)}% off` },
  amount: { format: (v) => `-$${parseFloat(v)} on everything` },
};

// ---- Fake network helper (no real requests) --------------------------

function fakeRequest(resolveValue, { delay = 700, failRate = 0 } = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (failRate > 0 && Math.random() < failRate) {
        reject(new Error('Demo error: something went wrong. Please try again.'));
      } else {
        resolve(resolveValue);
      }
    }, delay);
  });
}

// ---- Add points (demo) -------------------------------------------------

function AddPointsDemo() {
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [rate, setRate] = useState(10);
  const [result, setResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const idempotencyKeyRef = useRef(null);

  function generateId() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  const numericAmount = Number(amount);
  const isValid = phone.trim().length >= 8 && numericAmount > 0;

  const usdAmount = useMemo(() => {
    if (!numericAmount || numericAmount <= 0) return 0;
    return currency === 'USD' ? numericAmount : numericAmount / KHR_PER_USD;
  }, [numericAmount, currency]);

  const convertedDisplay = useMemo(() => {
    if (!numericAmount || numericAmount <= 0) return null;
    if (currency === 'USD') {
      const khr = Math.round(numericAmount * KHR_PER_USD);
      return `≈ ${khr.toLocaleString()} KHR`;
    } else {
      const usd = (numericAmount / KHR_PER_USD).toFixed(2);
      return `≈ $${Number(usd).toLocaleString()} USD`;
    }
  }, [numericAmount, currency]);

  const pointsToCredit = useMemo(() => {
    if (!usdAmount || usdAmount <= 0) return 0;
    return Math.round(usdAmount * rate * 10);
  }, [usdAmount, rate]);

  const handleCredit = async () => {
    if (!isValid || isSubmitting) return;

    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = generateId();
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Demo only — no real API call. Simulates the shape of a real response.
      const data = await fakeRequest(
        {
          phone: phone.trim(),
          name: 'Demo Customer',
          amount: numericAmount,
          currency,
          usdAmount,
          rate,
          points: pointsToCredit,
          previousBalance: 1200,
          newBalance: 1200 + pointsToCredit,
        },
        { delay: 700, failRate: 0.15 }
      );

      setResult(data);
      idempotencyKeyRef.current = null;
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setPhone('');
    setAmount('');
    setCurrency('USD');
    setRate(10);
    setResult(null);
    setError(null);
    idempotencyKeyRef.current = null;
  };

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold text-black">Credit points</h1>
      <p className="mb-8 text-sm text-neutral-500">
        Enter the customer&apos;s phone number and purchase amount, then choose
        how many points to award.{' '}
        <span className="text-neutral-400">(Demo — no real request is sent.)</span>
      </p>

      {!result ? (
        <div className="border border-neutral-200 bg-white px-5 py-6">
          <label className="mb-1 block text-xs font-medium text-neutral-500">
            Phone number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value.replace(/[^0-9]/g, ''));
              idempotencyKeyRef.current = null;
            }}
            placeholder="0977 123 456"
            className="mb-5 w-full border border-neutral-200 px-4 py-3 font-mono text-base md:text-sm text-black outline-none focus:border-black"
          />

          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-medium text-neutral-500">
              Total amount ({currency})
            </label>
            <div className="flex gap-1 bg-neutral-100 p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => {
                  setCurrency('USD');
                  idempotencyKeyRef.current = null;
                }}
                className={`px-2.5 py-1 transition-colors ${
                  currency === 'USD'
                    ? 'bg-black font-semibold text-white'
                    : 'text-neutral-500 hover:text-black'
                }`}
              >
                $ USD
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrency('KHR');
                  idempotencyKeyRef.current = null;
                }}
                className={`px-2.5 py-1 transition-colors ${
                  currency === 'KHR'
                    ? 'bg-black font-semibold text-white'
                    : 'text-neutral-500 hover:text-black'
                }`}
              >
                ៛ KHR
              </button>
            </div>
          </div>

          <div className="mb-3">
            <input
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                idempotencyKeyRef.current = null;
              }}
              placeholder={currency === 'USD' ? '10.00' : '40010'}
              min="0"
              step={currency === 'USD' ? '0.01' : '100'}
              className="w-full border border-neutral-200 px-4 py-3 font-mono text-base md:text-sm text-black outline-none focus:border-black"
            />
            {convertedDisplay && (
              <span className="mt-1 block text-right font-mono text-xs font-medium text-neutral-500">
                {convertedDisplay}
              </span>
            )}
          </div>

          <div className="mb-5 flex items-center justify-between border border-neutral-200 bg-neutral-50 px-3.5 py-2 text-xs text-neutral-500">
            <span>Exchange rate</span>
            <span className="font-mono font-medium text-black">
              $1 = {KHR_PER_USD.toLocaleString()} KHR
            </span>
          </div>

          <label className="mb-2 block text-xs font-medium text-neutral-500">
            Points rate
          </label>
          <div className="mb-6 flex gap-2">
            {RATE_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() => {
                  setRate(option);
                  idempotencyKeyRef.current = null;
                }}
                className={`flex-1 border py-2.5 text-sm font-semibold transition-colors ${
                  rate === option
                    ? 'border-black bg-black text-white'
                    : 'border-neutral-200 bg-white text-neutral-500'
                }`}
              >
                {option}%
              </button>
            ))}
          </div>

          <div className="mb-6 flex items-center justify-between border border-neutral-200 bg-neutral-50 px-4 py-3">
            <span className="text-xs text-neutral-500">Points to credit</span>
            <span className="font-mono text-lg font-semibold text-black">
              {pointsToCredit.toLocaleString()} pts
            </span>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 border border-black px-4 py-3 text-xs font-medium text-black">
              <span aria-hidden="true">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleCredit}
            disabled={!isValid || isSubmitting}
            className={`w-full bg-black py-3 text-sm font-semibold text-white transition-opacity ${
              isValid && !isSubmitting ? 'opacity-100' : 'opacity-40'
            }`}
          >
            {isSubmitting ? 'Crediting...' : error ? 'Retry' : 'Credit points'}
          </button>
        </div>
      ) : (
        <div className="border border-neutral-200 bg-white px-5 py-6">
          <div className="mb-5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 border border-black px-2.5 py-1 text-xs font-bold text-black">
              <span aria-hidden="true">✓</span> Credited
            </span>
            <button onClick={handleReset} className="text-xs text-neutral-500 hover:text-black">
              Credit another
            </button>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-xs text-neutral-500">Customer</span>
            <span className="text-sm font-medium text-black">{result.name}</span>
          </div>
          <div className="flex items-center justify-between border-t border-neutral-200 py-2">
            <span className="text-xs text-neutral-500">Phone</span>
            <span className="font-mono text-sm text-black">{result.phone}</span>
          </div>
          <div className="flex items-center justify-between border-t border-neutral-200 py-2">
            <span className="text-xs text-neutral-500">Amount entered</span>
            <span className="font-mono text-sm text-black">
              {result.amount.toLocaleString()}{' '}
              {result.currency === 'USD' ? 'USD ($)' : 'KHR (៛)'}
            </span>
          </div>
          {result.currency === 'KHR' && (
            <div className="flex items-center justify-between border-t border-neutral-200 py-2">
              <span className="text-xs text-neutral-500">USD value ($1 = 4,001 ៛)</span>
              <span className="font-mono text-sm text-black">
                ${result.usdAmount.toFixed(2)} USD
              </span>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-neutral-200 py-2">
            <span className="text-xs text-neutral-500">Rate applied</span>
            <span className="text-sm text-black">{result.rate}%</span>
          </div>
          <div className="flex items-center justify-between border-t border-neutral-200 py-2">
            <span className="text-xs text-neutral-500">Points credited</span>
            <span className="font-mono text-sm font-semibold text-black">
              +{result.points.toLocaleString()} pts
            </span>
          </div>

          <button
            onClick={handleReset}
            className="mt-4 w-full border border-neutral-200 bg-white py-3 text-sm font-semibold text-black transition-colors hover:bg-neutral-50"
          >
            ← Credit another customer
          </button>
        </div>
      )}
    </div>
  );
}

// ---- Verify coupon (demo) ----------------------------------------------

function VerifyCouponDemo() {
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
      // Demo only — no real API call. Simulates the shape of a real response.
      const data = await fakeRequest(
        {
          discountType: Math.random() > 0.5 ? 'percent' : 'amount',
          discountValue: Math.random() > 0.5 ? 15 : 5,
          pointsCost: 500,
          customerPhone: '0977 123 456',
        },
        { delay: 600, failRate: 0.2 }
      );

      setResult(data);
      setStatus('success');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to verify coupon');
      setStatus('error');
    }
  }

  const isValid = otp.trim().length > 0;

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold text-black">
        {status === 'success' ? 'Coupon redeemed' : 'Verify coupon'}
      </h1>
      <p className="mb-8 text-sm text-neutral-500">
        {status === 'success'
          ? 'This coupon has been marked as used.'
          : "Enter the code the customer shows you at checkout."}{' '}
        <span className="text-neutral-400">
          {status === 'success' ? '' : '(Demo — any code works.)'}
        </span>
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
            <button
              type="button"
              onClick={reset}
              className="flex-1 border border-neutral-200 bg-white py-3 text-sm font-semibold text-black transition-colors hover:bg-neutral-50"
            >
              Cancel
            </button>
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
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Customer coupon (demo) ---------------------------------------------

const CUSTOMER_COUPONS = [
  { id: 1, label: '15% off your order', sub: 'Valid at checkout · 500 pts' },
  { id: 2, label: '$5 off everything', sub: 'Valid at checkout · 500 pts' },
  { id: 3, label: '25% off your order', sub: 'Valid at checkout · 800 pts' },
];

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function CustomerCouponDemo() {
  const [revealedId, setRevealedId] = useState(null);
  const [otp, setOtp] = useState('');

  const handleReveal = (id) => {
    setOtp(generateOtp());
    setRevealedId(id);
  };

  const handleClose = () => {
    setRevealedId(null);
    setOtp('');
  };

  const revealedCoupon = CUSTOMER_COUPONS.find((c) => c.id === revealedId);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold text-black">Your coupons</h1>
      <p className="mb-8 text-sm text-neutral-500">
        Tap a coupon to get a code, then show it to staff at checkout.{' '}
        <span className="text-neutral-400">(Demo — code is generated locally.)</span>
      </p>

      {!revealedCoupon ? (
        <div className="flex flex-col gap-3">
          {CUSTOMER_COUPONS.map((coupon) => (
            <button
              key={coupon.id}
              type="button"
              onClick={() => handleReveal(coupon.id)}
              className="flex items-center justify-between border border-neutral-200 bg-white px-5 py-4 text-left transition-colors hover:border-black"
            >
              <div>
                <p className="text-sm font-semibold text-black">{coupon.label}</p>
                <p className="mt-0.5 text-xs text-neutral-500">{coupon.sub}</p>
              </div>
              <span className="text-xs font-medium text-neutral-400">Tap →</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="border border-neutral-200 bg-white px-5 py-8 text-center">
          <p className="mb-1 text-sm font-medium text-black">{revealedCoupon.label}</p>
          <p className="mb-6 text-xs text-neutral-500">Show this code to staff</p>

          <p className="mb-6 font-mono text-[40px] font-bold tracking-[0.2em] text-black">
            {otp}
          </p>

          <p className="mb-6 text-xs text-neutral-400">
            This code is single-use and expires after redemption.
          </p>

          <button
            type="button"
            onClick={handleClose}
            className="w-full border border-neutral-200 bg-white py-3 text-sm font-semibold text-black transition-colors hover:bg-neutral-50"
          >
            ← Back to coupons
          </button>
        </div>
      )}
    </div>
  );
}

// ---- Demo page shell -----------------------------------------------------

export default function DemoPage() {
  const [tab, setTab] = useState('points'); // 'points' | 'coupon' | 'customer'

  return (
    <main className={`${inter.variable} ${mono.variable} min-h-screen bg-white font-sans`}>
      <div className="mx-auto max-w-md px-6 pt-10 pb-20">
        <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
          Merchant · Demo
        </p>

        <div className="mb-8 flex gap-1 bg-neutral-100 p-0.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => setTab('points')}
            className={`flex-1 px-3 py-2 transition-colors ${
              tab === 'points'
                ? 'bg-black font-semibold text-white'
                : 'text-neutral-500 hover:text-black'
            }`}
          >
            Add points
          </button>
          <button
            type="button"
            onClick={() => setTab('coupon')}
            className={`flex-1 px-3 py-2 transition-colors ${
              tab === 'coupon'
                ? 'bg-black font-semibold text-white'
                : 'text-neutral-500 hover:text-black'
            }`}
          >
            Verify coupon
          </button>
          <button
            type="button"
            onClick={() => setTab('customer')}
            className={`flex-1 px-3 py-2 transition-colors ${
              tab === 'customer'
                ? 'bg-black font-semibold text-white'
                : 'text-neutral-500 hover:text-black'
            }`}
          >
            Customer
          </button>
        </div>

        {tab === 'points' && <AddPointsDemo />}
        {tab === 'coupon' && <VerifyCouponDemo />}
        {tab === 'customer' && <CustomerCouponDemo />}
      </div>
    </main>
  );
}