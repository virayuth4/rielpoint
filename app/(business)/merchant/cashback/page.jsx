"use client";

import { useEffect, useState } from "react";
import authenticatedFetch from "@/app/auth/authenticatedFetch";
import StatusUpdateModal from "./statusUpdateModal";
import WithdrawalStatusModal from "./withdrawalStatusModal";

function formatCurrency(amount, currency) {
  const value = Number(amount);
  if (currency === "KHR") {
    return `${value.toLocaleString("en-US")} ៛`;
  }
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const ACTIONABLE_STATUSES = ["pending", "merchant_confirmed"];

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700 ring-1 ring-amber-600/20",
  merchant_confirmed: "bg-amber-100 text-amber-700 ring-1 ring-amber-600/20",
  rielpoint_confirmed: "bg-green-100 text-green-700 ring-1 ring-green-600/20",
  confirmed: "bg-green-100 text-green-700 ring-1 ring-green-600/20",
  rejected: "bg-red-100 text-red-700 ring-1 ring-red-600/20",
  cancelled: "bg-red-100 text-red-700 ring-1 ring-red-600/20",
  refunded: "bg-red-100 text-red-700 ring-1 ring-red-600/20",
};

const STATUS_LABELS = {
  pending: "Pending",
  merchant_confirmed: "Merchant confirmed",
  rielpoint_confirmed: "Withdrawable",
  confirmed: "Paid out",
  rejected: "Rejected",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

const WITHDRAWAL_STATUS_STYLES = {
  requested: "bg-amber-100 text-amber-700 ring-1 ring-amber-600/20",
  processing: "bg-amber-100 text-amber-700 ring-1 ring-amber-600/20",
  paid: "bg-green-100 text-green-700 ring-1 ring-green-600/20",
  failed: "bg-red-100 text-red-700 ring-1 ring-red-600/20",
};

const WITHDRAWAL_STATUS_LABELS = {
  requested: "Requested",
  processing: "Processing",
  paid: "Paid",
  failed: "Failed",
};

const WITHDRAWAL_ACTIONABLE_STATUSES = ["requested", "processing"];

function StatusBadge({ status, styles, labels }) {
  const style =
    styles[status] ?? "bg-gray-100 text-gray-700 ring-1 ring-gray-600/20";
  const label = labels[status] ?? status;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {label}
    </span>
  );
}

export default function CashbackTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTx, setEditingTx] = useState(null);

  const [withdrawals, setWithdrawals] = useState([]);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(true);
  const [withdrawalsError, setWithdrawalsError] = useState(null);
  const [editingWithdrawal, setEditingWithdrawal] = useState(null);

  // Standalone fetch functions for button retries
  async function loadTransactions() {
    setLoading(true);
    setError(null);
    try {
      const res = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/cashback/transactions/all`
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || "Failed to load transactions.");
      }

      const data = await res.json();
      setTransactions(data.transactions);
      setBalance(data.balance);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function loadWithdrawals() {
    setWithdrawalsLoading(true);
    setWithdrawalsError(null);
    try {
      const res = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/admin/wallet/withdrawals`
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || "Failed to load withdrawal requests.");
      }

      const data = await res.json();
      setWithdrawals(data.withdrawals);
    } catch (err) {
      setWithdrawalsError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setWithdrawalsLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      // 1. Fetch transactions
      try {
        const res = await authenticatedFetch(
          `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/cashback/transactions/all`
        );
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.message || "Failed to load transactions.");
        }
        const data = await res.json();
        if (!ignore) {
          setTransactions(data.transactions);
          setBalance(data.balance);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Something went wrong.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }

      // 2. Fetch withdrawals
      try {
        const res = await authenticatedFetch(
          `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/admin/wallet/withdrawals`
        );
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.message || "Failed to load withdrawal requests.");
        }
        const data = await res.json();
        if (!ignore) {
          setWithdrawals(data.withdrawals);
        }
      } catch (err) {
        if (!ignore) {
          setWithdrawalsError(
            err instanceof Error ? err.message : "Something went wrong."
          );
        }
      } finally {
        if (!ignore) {
          setWithdrawalsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      ignore = true;
    };
  }, []);

  function handleStatusUpdated(updatedTx) {
    setTransactions((prev) =>
      prev.map((t) => (t.id === updatedTx.id ? { ...t, ...updatedTx } : t))
    );
  }

  function handleWithdrawalUpdated(updatedWithdrawal) {
    setWithdrawals((prev) =>
      prev.map((w) =>
        w.id === updatedWithdrawal.id ? { ...w, ...updatedWithdrawal } : w
      )
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Cashback Transactions
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            A history of cashback earned from your purchases.
          </p>
        </div>

        <div className="rounded-xl bg-gray-900 px-5 py-4 text-white shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-300">
            Withdrawable balance
          </p>
          <p className="mt-1 text-xl font-semibold">
            {loading ? "—" : formatCurrency(balance, "USD")}
          </p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-gray-500">
            Loading transactions…
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={loadTransactions}
              className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              Try again
            </button>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-1 py-16 text-center">
            <p className="text-sm font-medium text-gray-900">
              No cashback transactions yet
            </p>
            <p className="text-sm text-gray-500">
              Your cashback history will show up here once you start earning.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">
                    Merchant
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">
                    Order ID
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">
                    Order Amount
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">
                    Commission
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">
                    Rate
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">
                    Cashback
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                      {tx.merchant_name ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                      {tx.external_transaction_id}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-gray-700">
                      {formatCurrency(tx.order_amount, tx.currency)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-gray-700">
                      {formatCurrency(tx.commission_amount, tx.currency)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-gray-700">
                      {Number(tx.cashback_rate)}%
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-gray-900">
                      {formatCurrency(tx.cashback_amount, tx.currency)}
                      {tx.status === "pending" && (
                        <span className="ml-1 text-xs font-normal text-gray-400">
                          (est.)
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <StatusBadge
                        status={tx.status}
                        styles={STATUS_STYLES}
                        labels={STATUS_LABELS}
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                      {formatDate(tx.transaction_at)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {ACTIONABLE_STATUSES.includes(tx.status) && (
                        <button
                          onClick={() => setEditingTx(tx)}
                          className="rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white hover:bg-gray-800"
                        >
                          Review
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Withdrawal requests */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold text-gray-900">
          Withdrawal Requests
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Requests waiting to be paid out or already processed.
        </p>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {withdrawalsLoading ? (
          <div className="flex items-center justify-center py-16 text-sm text-gray-500">
            Loading withdrawal requests…
          </div>
        ) : withdrawalsError ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <p className="text-sm text-red-600">{withdrawalsError}</p>
            <button
              onClick={loadWithdrawals}
              className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              Try again
            </button>
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-1 py-16 text-center">
            <p className="text-sm font-medium text-gray-900">
              No withdrawal requests yet
            </p>
            <p className="text-sm text-gray-500">
              Requests will show up here once users start withdrawing.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">
                    User
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">
                    ABA account
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">
                    Telegram
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">
                    Requested
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {w.user_fullname ?? "—"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {w.user_phone ?? ""}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-gray-900">
                      {formatCurrency(w.amount, w.currency)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="text-gray-900">
                        {w.aba_account_number ?? "—"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {w.aba_account_name ?? ""}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                      {w.telegram_phone ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <StatusBadge
                        status={w.status}
                        styles={WITHDRAWAL_STATUS_STYLES}
                        labels={WITHDRAWAL_STATUS_LABELS}
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                      {formatDate(w.requested_at)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {WITHDRAWAL_ACTIONABLE_STATUSES.includes(w.status) && (
                        <button
                          onClick={() => setEditingWithdrawal(w)}
                          className="rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white hover:bg-gray-800"
                        >
                          Process
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingTx && (
        <StatusUpdateModal
          transaction={editingTx}
          onClose={() => setEditingTx(null)}
          onSuccess={handleStatusUpdated}
        />
      )}

      {editingWithdrawal && (
        <WithdrawalStatusModal
          withdrawal={editingWithdrawal}
          onClose={() => setEditingWithdrawal(null)}
          onSuccess={handleWithdrawalUpdated}
        />
      )}
    </div>
  );
}