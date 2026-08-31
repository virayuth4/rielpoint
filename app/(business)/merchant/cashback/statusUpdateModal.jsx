"use client";

import { useMemo, useState } from "react";
import authenticatedFetch from "@/app/auth/authenticatedFetch";

// Mirrors the server's VALID_TRANSITIONS map — keep these in sync.
const NEXT_STATUS_OPTIONS = {
  pending: [
    { value: "merchant_confirmed", label: "Merchant Confirm" },
    { value: "rejected", label: "Reject" },
  ],
  merchant_confirmed: [
    { value: "rielpoint_confirmed", label: "RielPoint Confirm (make withdrawable)" },
    { value: "rejected", label: "Reject" },
  ],
};

export default function StatusUpdateModal({ transaction, onClose, onSuccess }) {
  const options = useMemo(
    () => NEXT_STATUS_OPTIONS[transaction.status] ?? [],
    [transaction.status]
  );

  const [status, setStatus] = useState(options[0]?.value ?? "");
  const [amount, setAmount] = useState(transaction.cashback_amount);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // The amount is only entered at merchant_confirmed — every later stage
  // (rielpoint_confirmed, confirmed) carries the already-set amount forward.
  const showAmountField = status === "merchant_confirmed";

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/cashback/transactions/${transaction.id}/status`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status,
            cashbackAmount: showAmountField ? Number(amount) : undefined,
            reason: reason || undefined,
          }),
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || "Failed to update status.");
      }

      const data = await res.json();
      onSuccess(data.transaction);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  // Defensive: if a row somehow has no valid next status (shouldn't happen
  // since the table only shows Review for actionable statuses), don't
  // render a broken form.
  if (options.length === 0) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
        role="dialog"
        aria-modal="true"
      >
        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
          <p className="text-sm text-gray-700">
            This transaction has no further actions available in its current
            status (&quot;{transaction.status}&quot;).
          </p>
          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900">
          Update Transaction Status
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Order {transaction.external_transaction_id}
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              New status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
            >
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {showAmountField && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cashback amount
              </label>
              <p className="text-xs text-gray-400">
                Estimated: {transaction.cashback_amount} {transaction.currency}
              </p>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
              />
            </div>
          )}

          {status === "rielpoint_confirmed" && (
            <p className="rounded-md bg-green-50 px-3 py-2 text-xs text-green-800">
              This will move {transaction.cashback_amount} {transaction.currency} into the
              user&apos;s withdrawable balance.
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Reason <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
              placeholder="e.g. amount adjusted per merchant report"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={submitting}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}