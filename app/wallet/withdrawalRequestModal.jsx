'use client';

import { useState } from 'react';
import authenticatedFetch from '../auth/authenticatedFetch';

export default function WithdrawalRequestModal({ availableBalance, onClose, onSuccess }) {
  const [abaAccountNumber, setAbaAccountNumber] = useState('');
  const [abaAccountName, setAbaAccountName] = useState('');
  const [telegramPhone, setTelegramPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit() {
    if (typeof availableBalance !== 'number' || availableBalance <= 0) {
      setError('You have no available balance to withdraw.');
      return;
    }
    if (!abaAccountNumber.trim()) {
      setError('ABA account number is required.');
      return;
    }
    if (!abaAccountName.trim()) {
      setError('ABA account name is required.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/wallet/withdrawals`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: availableBalance,
            currency: 'USD',
            payoutMethod: 'aba',
            abaAccountNumber: abaAccountNumber.trim(),
            abaAccountName: abaAccountName.trim(),
            telegramPhone: telegramPhone.trim() || undefined,
          }),
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || 'Failed to submit withdrawal request.');
      }

      const data = await res.json();
      onSuccess(data.withdrawal);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
        <h2 className="text-base font-semibold" style={{ color: '#0F0F0E' }}>
          Withdraw cashback
        </h2>
        <p className="mt-1 text-xs" style={{ color: '#9A9A9A' }}>
          Withdrawals automatically process your full available balance.
        </p>

        {/* Read-only Amount Display */}
        <div
          className="mt-4 rounded-xl p-3 flex items-center justify-between"
          style={{ background: '#F8F8F7', border: '1px solid #EFEFED' }}
        >
          <span className="text-xs font-medium" style={{ color: '#9A9A9A' }}>
            Amount to withdraw
          </span>
          <span className="text-sm font-semibold" style={{ color: '#0F0F0E' }}>
            {availableBalance.toFixed(2)} USD
          </span>
        </div>

        <div className="mt-5 space-y-3">
          <p className="text-xs font-medium" style={{ color: '#0F0F0E' }}>
            Payout details
          </p>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#0F0F0E' }}>
              ABA account number
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={abaAccountNumber}
              onChange={(e) => setAbaAccountNumber(e.target.value)}
              placeholder="e.g. 000123456"
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
              style={{ borderColor: '#EFEFED' }}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#0F0F0E' }}>
              ABA account name
            </label>
            <input
              type="text"
              value={abaAccountName}
              onChange={(e) => setAbaAccountName(e.target.value)}
              placeholder="Name on the ABA account"
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
              style={{ borderColor: '#EFEFED' }}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#0F0F0E' }}>
              Telegram phone number <span className="font-normal" style={{ color: '#9A9A9A' }}>(optional)</span>
            </label>
            <input
              type="tel"
              value={telegramPhone}
              onChange={(e) => setTelegramPhone(e.target.value)}
              placeholder="For easier contact if there's an issue"
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
              style={{ borderColor: '#EFEFED' }}
            />
          </div>
        </div>

        {error && (
          <p className="mt-3 text-xs" style={{ color: '#B3453D' }}>
            {error}
          </p>
        )}

        <p className="mt-4 text-[11px] leading-relaxed" style={{ color: '#9A9A9A' }}>
          Once submitted, this amount is locked and removed from your available
          balance while it&apos;s processed. Payout is sent manually to your
          registered bank details.
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-full px-4 py-2 text-sm font-medium disabled:opacity-50"
            style={{ color: '#0F0F0E' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || availableBalance <= 0}
            className="rounded-full px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            style={{ background: '#0F0F0E' }}
          >
            {submitting ? 'Submitting…' : `Withdraw ${availableBalance.toFixed(2)} USD`}
          </button>
        </div>
      </div>
    </div>
  );
}