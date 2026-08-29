'use client';

import { useEffect, useMemo, useState } from 'react';
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

export default function CreditCashbackPage() {
  const [phone, setPhone] = useState('');
  const [externalTransactionId, setExternalTransactionId] = useState('');
  const [orderAmount, setOrderAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [commission, setCommission] = useState('');
  const [cashbackRate, setCashbackRate] = useState('');
  const [clickId, setClickId] = useState('');
  const [result, setResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [merchants, setMerchants] = useState([]);
  const [merchantId, setMerchantId] = useState('');

  const numericOrderAmount = Number(orderAmount);
  const numericCommission = Number(commission);
  const numericCashbackRate = Number(cashbackRate);

  useEffect(() => {
    async function loadMerchants() {
      try {
        const res = await authenticatedFetch(
          `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/affiliate/merchants`,
          { method: 'GET' }
        );
        const json = await res.json();
        setMerchants(json.data || []);
      } catch (err) {
        console.error('Failed to load merchants:', err);
      }
    }
    loadMerchants();
  }, []);

  const isValid =
    merchantId.trim().length > 0 &&
    phone.trim().length >= 8 &&
    externalTransactionId.trim().length > 0 &&
    numericOrderAmount > 0 &&
    numericCommission >= 0 &&
    cashbackRate.trim().length > 0 &&
    numericCashbackRate >= 0 &&
    numericCashbackRate <= 100;

  // Live preview only — server recomputes this independently and is authoritative.
  const cashbackPreview = useMemo(() => {
    if (!numericCommission || numericCommission <= 0 || !numericCashbackRate || numericCashbackRate < 0) return 0;
    return Math.round(numericCommission * (numericCashbackRate / 100) * 100) / 100;
  }, [numericCommission, numericCashbackRate]);

  const handleCredit = async () => {
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/cashback/add`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            merchantId,
            phone: phone.trim(),
            externalTransactionId: externalTransactionId.trim(),
            orderAmount: numericOrderAmount,
            currency,
            commission: numericCommission,
            cashbackRate: numericCashbackRate,
            clickId: clickId.trim() || undefined,
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.message || 'Failed to credit cashback');
      }

      const data = await response.json();

      setResult({
        merchantId,
        userName: data.userName ?? 'Customer',
        phone,
        externalTransactionId: data.transactionId ? externalTransactionId : externalTransactionId,
        orderAmount: data.orderAmount,
        currency: data.currency,
        commission: data.commission,
        cashbackRate: data.cashbackRate,
        cashbackAmount: data.cashbackAmount,
        status: data.status,
        idempotent: data.idempotent ?? false,
      });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setPhone('');
    setExternalTransactionId('');
    setOrderAmount('');
    setCurrency('USD');
    setCommission('');
    setCashbackRate('');
    setClickId('');
    setResult(null);
    setError(null);
  };

  return (
    <main className={`${inter.variable} ${mono.variable} min-h-screen bg-white font-sans`}>
      <div className="mx-auto max-w-md px-6 pt-10 pb-20">
        <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
          Merchant
        </p>

        <h1 className="mb-2 text-2xl font-semibold text-black">Credit cashback</h1>
        <p className="mb-8 text-sm text-neutral-500">
          Enter the order details to credit cashback to a customer. Cashback
          starts as <span className="font-medium text-black">pending</span> and is
          confirmed separately.
        </p>

        {!result ? (
          <div className="border border-neutral-200 bg-white px-5 py-6">
            {/* Merchant */}
            <label htmlFor="merchant_id" className="mb-1 block text-sm font-medium text-slate-700">
              Merchant
            </label>
            <select
              id="merchant_id"
              required
              value={merchantId}
              onChange={(e) => setMerchantId(e.target.value)}
              className="mb-5 mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="" disabled>Select a merchant</option>
              {merchants.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>

            {/* Phone Number */}
            <label className="mb-1 block text-xs font-medium text-neutral-500">
              Customer phone number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="0977 123 456"
              className="mb-5 w-full border border-neutral-200 px-4 py-3 font-mono text-base md:text-sm text-black outline-none focus:border-black"
            />

            {/* External Transaction ID */}
            <label className="mb-1 block text-xs font-medium text-neutral-500">
              Order / transaction ID
            </label>
            <input
              type="text"
              value={externalTransactionId}
              onChange={(e) => setExternalTransactionId(e.target.value)}
              placeholder="e.g. invoice or POS reference"
              className="mb-5 w-full border border-neutral-200 px-4 py-3 font-mono text-base md:text-sm text-black outline-none focus:border-black"
            />
            <p className="-mt-4 mb-5 text-[11px] text-neutral-400">
              Re-submitting the same ID won&apos;t double-credit — it returns the original entry.
            </p>

              {/* Click ID (optional) */}
            <label className="mb-1 block text-xs font-medium text-neutral-500">
              Click ID <span className="text-neutral-400">(optional)</span>
            </label>
            <input
              type="text"
              value={clickId}
              onChange={(e) => setClickId(e.target.value)}
              placeholder="Only if this order came from a tracked link"
              className="mb-5 w-full border border-neutral-200 px-4 py-3 font-mono text-base md:text-sm text-black outline-none focus:border-black"
            />

            {/* Currency Selector */}
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-medium text-neutral-500">
                Order amount ({currency})
              </label>
              <div className="flex gap-1 bg-neutral-100 p-0.5 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
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
                  onClick={() => setCurrency('KHR')}
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

            {/* Order Amount */}
            <input
              type="number"
              value={orderAmount}
              onChange={(e) => setOrderAmount(e.target.value)}
              placeholder={currency === 'USD' ? '50.00' : '200050'}
              min="0"
              step={currency === 'USD' ? '0.01' : '100'}
              className="mb-5 w-full border border-neutral-200 px-4 py-3 font-mono text-base md:text-sm text-black outline-none focus:border-black"
            />

            {/* Commission */}
            <label className="mb-1 block text-xs font-medium text-neutral-500">
              Commission earned ({currency})
            </label>
            <input
              type="number"
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
              placeholder={currency === 'USD' ? '5.00' : '20005'}
              min="0"
              step={currency === 'USD' ? '0.01' : '100'}
              className="mb-5 w-full border border-neutral-200 px-4 py-3 font-mono text-base md:text-sm text-black outline-none focus:border-black"
            />

          

            {/* Cashback Rate Input */}
            <label className="mb-1 block text-xs font-medium text-neutral-500">
              Cashback rate (% of commission)
            </label>
            <div className="relative mb-6">
              <input
                type="number"
                value={cashbackRate}
                onChange={(e) => setCashbackRate(e.target.value)}
                placeholder="e.g. 15"
                min="0"
                max="100"
                step="0.1"
                className="w-full border border-neutral-200 px-4 py-3 pr-8 font-mono text-base md:text-sm text-black outline-none focus:border-black"
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-mono text-sm text-neutral-400">
                %
              </span>
            </div>

            {/* Cashback Preview */}
            <div className="mb-6 flex items-center justify-between border border-neutral-200 bg-neutral-50 px-4 py-3">
              <span className="text-xs text-neutral-500">Cashback to credit</span>
              <span className="font-mono text-lg font-semibold text-black">
                {currency === 'USD' ? '$' : '៛'}
                {cashbackPreview.toLocaleString()}
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
              {isSubmitting ? 'Crediting...' : error ? 'Retry' : 'Credit cashback'}
            </button>
          </div>
        ) : (
          /* Result View */
          <div className="border border-neutral-200 bg-white px-5 py-6">
            <div className="mb-5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 border border-black px-2.5 py-1 text-xs font-bold text-black">
                <span aria-hidden="true">✓</span>{' '}
                {result.status === 'pending' ? 'Pending' : 'Credited'}
                {result.idempotent ? ' (existing)' : ''}
              </span>
              <button onClick={handleReset} className="text-xs text-neutral-500 hover:text-black">
                Credit another
              </button>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-neutral-500">Customer</span>
              <span className="text-sm font-medium text-black">{result.userName}</span>
            </div>
            <div className="flex items-center justify-between border-t border-neutral-200 py-2">
              <span className="text-xs text-neutral-500">Phone</span>
              <span className="font-mono text-sm text-black">{result.phone}</span>
            </div>
            <div className="flex items-center justify-between border-t border-neutral-200 py-2">
              <span className="text-xs text-neutral-500">Transaction ID</span>
              <span className="font-mono text-sm text-black">{result.externalTransactionId}</span>
            </div>
            <div className="flex items-center justify-between border-t border-neutral-200 py-2">
              <span className="text-xs text-neutral-500">Order amount</span>
              <span className="font-mono text-sm text-black">
                {result.orderAmount.toLocaleString()}{' '}
                {result.currency === 'USD' ? 'USD ($)' : 'KHR (៛)'}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-neutral-200 py-2">
              <span className="text-xs text-neutral-500">Commission</span>
              <span className="font-mono text-sm text-black">
                {result.commission.toLocaleString()}{' '}
                {result.currency === 'USD' ? 'USD ($)' : 'KHR (៛)'}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-neutral-200 py-2">
              <span className="text-xs text-neutral-500">Cashback rate</span>
              <span className="text-sm text-black">{result.cashbackRate}%</span>
            </div>
            <div className="flex items-center justify-between border-t border-neutral-200 py-2">
              <span className="text-xs text-neutral-500">Cashback amount</span>
              <span className="font-mono text-sm font-semibold text-black">
                +{result.cashbackAmount.toLocaleString()}{' '}
                {result.currency === 'USD' ? 'USD ($)' : 'KHR (៛)'}
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
    </main>
  );
}