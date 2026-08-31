"use client";

import { useState } from "react";
import authenticatedFetch from "@/app/auth/authenticatedFetch";

export default function WithdrawalStatusModal({ withdrawal, onClose, onSuccess }) {
  const [status, setStatus] = useState("paid");
  const [payoutReference, setPayoutReference] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/admin/wallet/withdrawals/${withdrawal.id}/status`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status,
            payoutMethod: withdrawal.payout_method,
            payoutReference: payoutReference || undefined,
            adminNotes: adminNotes || undefined,
          }),
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || "Failed to update withdrawal.");
      }

      const data = await res.json();
      onSuccess(data.withdrawal);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
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
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900">
          Process Withdrawal
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {withdrawal.user_fullname ?? "Unknown user"} &middot;{" "}
          {Number(withdrawal.amount).toFixed(2)} {withdrawal.currency}
        </p>

        <div className="mt-4 space-y-3 rounded-lg bg-gray-50 p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">ABA account number</span>
            <span className="font-medium text-gray-900">
              {withdrawal.aba_account_number ?? "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">ABA account name</span>
            <span className="font-medium text-gray-900">
              {withdrawal.aba_account_name ?? "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Telegram</span>
            <span className="font-medium text-gray-900">
              {withdrawal.telegram_phone ?? "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">User phone</span>
            <span className="font-medium text-gray-900">
              {withdrawal.user_phone ?? "—"}
            </span>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Outcome
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
            >
              <option value="paid">Mark as paid</option>
              <option value="failed">Mark as failed (refunds user)</option>
            </select>
          </div>

          {status === "paid" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Payout reference <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                value={payoutReference}
                onChange={(e) => setPayoutReference(e.target.value)}
                placeholder="e.g. ABA transfer confirmation #"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notes <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
              placeholder="e.g. reason for failure"
            />
          </div>

          {status === "failed" && (
            <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Marking as failed will refund this amount back to the user&apos;s
              withdrawable balance.
            </p>
          )}

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