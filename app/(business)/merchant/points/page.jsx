'use client';

import { useMemo, useRef, useState } from 'react';
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

const RATE_OPTIONS = [10, 25, 50];
const KHR_PER_USD = 4001; // Fixed conversion rate: 4,001 KHR = $1 USD

export default function CreditPointsPage() {
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [rate, setRate] = useState(10);
  const [result, setResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Idempotency key for the CURRENT in-progress submission attempt.
  // Generated once per new attempt, then reused on every retry of that
  // same attempt (e.g. after a network timeout) so the backend can tell
  // "same submission, resend" apart from "new submission". Cleared once
  // the attempt succeeds or the form is reset.
  function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback UUID v4 generator for insecure contexts / older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

  const idempotencyKeyRef = useRef(null);
  

  const numericAmount = Number(amount);
  const isValid = phone.trim().length >= 8 && numericAmount > 0;

  // Calculate the USD equivalent value (Points are always based on USD)
  const usdAmount = useMemo(() => {
    if (!numericAmount || numericAmount <= 0) return 0;
    return currency === 'USD' ? numericAmount : numericAmount / KHR_PER_USD;
  }, [numericAmount, currency]);

  // Live conversion feedback for the user
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

  // Points: 10% rate = 100 pts/$1, 25% rate = 250 pts/$1, 50% rate = 500 pts/$1
  // (Preview only — the server recomputes this independently and is authoritative.)
  const pointsToCredit = useMemo(() => {
    if (!usdAmount || usdAmount <= 0) return 0;
    return Math.round(usdAmount * rate * 10);
  }, [usdAmount, rate]);

  const handleCredit = async () => {
    if (!isValid || isSubmitting) return;

    // First attempt for this submission: mint a new idempotency key.
    // If this function is called again before a successful result (i.e. the
    // person clicks "retry" after a failure), the same key is reused below.
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = generateId();
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/points/add`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: phone.trim(),
            amount: numericAmount,
            currency,
            rate,
            idempotencyKey: idempotencyKeyRef.current,
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.message || 'Failed to credit points');
      }

      const data = await response.json();
      // console.log('API response:', data);

      setResult({
        phone: data.phone,
        name: data.name ?? 'Customer',
        amount: data.amount,
        currency: data.currency,
        usdAmount: data.usdAmount,
        rate: data.rate,
        points: data.points,
        previousBalance: data.previousBalance,
        newBalance: data.newBalance,
      });

      // Success: this idempotency key is now spent. A future submission
      // (even for the same phone/amount) should get a fresh one.
      idempotencyKeyRef.current = null;
    } catch (err) {
      // Failure: deliberately do NOT clear idempotencyKeyRef here. If the
      // person hits "Credit points" again, it retries with the SAME key,
      // so the backend can recognize a duplicate rather than crediting twice.
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
    <main className={`${inter.variable} ${mono.variable} min-h-screen bg-white font-sans`}>
      <div className="mx-auto max-w-md px-6 pt-10 pb-20">
        <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700/70">
          Merchant
        </p>

        <h1 className="mb-2 text-2xl font-semibold text-stone-900">Credit points</h1>
        <p className="mb-8 text-sm text-stone-400">
          Enter the customer&apos;s phone number and purchase amount, then choose
          how many points to award.
        </p>

        {!result ? (
          <div className="rounded-2xl border border-stone-100 bg-white px-5 py-6 shadow-sm">
            {/* Phone Number Input */}
            <label className="mb-1 block text-xs font-medium text-stone-500">
              Phone number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value.replace(/[^0-9]/g, ''));
                idempotencyKeyRef.current = null; // form content changed → new attempt
              }}
              placeholder="0977 123 456"
              className="mb-5 w-full rounded-xl border border-stone-200 px-4 py-3 font-mono text-base md:text-sm text-stone-900 outline-none focus:border-amber-400"
            />

            {/* Currency Selector & Label */}
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-medium text-stone-500">
                Total amount ({currency})
              </label>
              <div className="flex gap-1 rounded-lg bg-stone-100 p-0.5 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => {
                    setCurrency('USD');
                    idempotencyKeyRef.current = null;
                  }}
                  className={`rounded-md px-2.5 py-1 transition-colors ${
                    currency === 'USD'
                      ? 'bg-white font-semibold text-stone-900 shadow-sm'
                      : 'text-stone-500 hover:text-stone-900'
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
                  className={`rounded-md px-2.5 py-1 transition-colors ${
                    currency === 'KHR'
                      ? 'bg-white font-semibold text-stone-900 shadow-sm'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  ៛ KHR
                </button>
              </div>
            </div>

            {/* Amount Input */}
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
                className="w-full rounded-xl border border-stone-200 px-4 py-3 font-mono text-base md:text-sm text-stone-900 outline-none focus:border-amber-400"
              />
              {convertedDisplay && (
                <span className="mt-1 block text-right font-mono text-xs font-medium text-amber-700">
                  {convertedDisplay}
                </span>
              )}
            </div>

            {/* Conversion Rate Banner */}
            <div className="mb-5 flex items-center justify-between rounded-xl border border-stone-100 bg-stone-50/80 px-3.5 py-2 text-xs text-stone-500">
              <span>Exchange rate</span>
              <span className="font-mono font-medium text-stone-700">
                $1 = {KHR_PER_USD.toLocaleString()} KHR
              </span>
            </div>

            {/* Points Rate Options */}
            <label className="mb-2 block text-xs font-medium text-stone-500">
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
                  className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
                    rate === option
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-50 text-stone-500'
                  }`}
                >
                  {option}%
                </button>
              ))}
            </div>

            {/* Points Preview */}
            <div className="mb-6 flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3">
              <span className="text-xs text-stone-500">Points to credit</span>
              <span className="font-mono text-lg font-semibold text-amber-700">
                {pointsToCredit.toLocaleString()} pts
              </span>
            </div>

            {error && (
              <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
                {error}
              </div>
            )}

            <button
              onClick={handleCredit}
              disabled={!isValid || isSubmitting}
              className={`w-full rounded-xl bg-black py-3 text-sm font-semibold text-white transition-opacity ${
                isValid && !isSubmitting ? 'opacity-100' : 'opacity-40'
              }`}
            >
              {isSubmitting ? 'Crediting...' : error ? 'Retry' : 'Credit points'}
            </button>
          </div>
        ) : (
          /* Result View */
          <div className="rounded-2xl border border-stone-100 bg-white px-5 py-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
                Credited
              </span>
              <button onClick={handleReset} className="text-xs text-stone-400">
                Credit another
              </button>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-stone-400">Customer</span>
              <span className="text-sm font-medium text-stone-900">{result.name}</span>
            </div>
            <div className="flex items-center justify-between border-t border-stone-100 py-2">
              <span className="text-xs text-stone-400">Phone</span>
              <span className="font-mono text-sm text-stone-900">{result.phone}</span>
            </div>
            <div className="flex items-center justify-between border-t border-stone-100 py-2">
              <span className="text-xs text-stone-400">Amount entered</span>
              <span className="font-mono text-sm text-stone-900">
                {result.amount.toLocaleString()}{' '}
                {result.currency === 'USD' ? 'USD ($)' : 'KHR (៛)'}
              </span>
            </div>
            {result.currency === 'KHR' && (
              <div className="flex items-center justify-between border-t border-stone-100 py-2">
                <span className="text-xs text-stone-400">USD value ($1 = 4,001 ៛)</span>
                <span className="font-mono text-sm text-stone-900">
                  ${result.usdAmount.toFixed(2)} USD
                </span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-stone-100 py-2">
              <span className="text-xs text-stone-400">Rate applied</span>
              <span className="text-sm text-stone-900">{result.rate}%</span>
            </div>
            <div className="flex items-center justify-between border-t border-stone-100 py-2">
              <span className="text-xs text-stone-400">Points credited</span>
              <span className="font-mono text-sm font-semibold text-green-700">
                +{result.points.toLocaleString()} pts
              </span>
            </div>

            {/* <div className="mt-4 flex items-center justify-between rounded-xl bg-stone-900 px-4 py-3">
              <span className="text-xs text-stone-400">New balance</span>
              <span className="font-mono text-lg font-semibold text-white">
                {result.newBalance.toLocaleString()} pts
              </span>
            </div> */}
            <button
          onClick={handleReset}
          className="mt-4 w-full rounded-xl bg-stone-100 py-3 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-200"
        >
          ← Credit another customer
        </button>
                  </div>
        )}
      </div>
    </main>
  );
}