"use client";

import authenticatedFetch from "@/app/auth/authenticatedFetch";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";


const OFFERS_ENDPOINT = `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/offers`;

function formatCashback(offer) {
  if (offer.cashback_type === "percentage" && offer.cashback_rate != null) {
    return `${offer.cashback_rate}%`;
  }
  if (offer.cashback_type === "fixed" && offer.fixed_cashback_amount != null) {
    return `${offer.currency || "$"} ${offer.fixed_cashback_amount}`;
  }
  return "—";
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminOffersPage() {
  const router = useRouter();
  const [offers, setOffers] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | idle | error
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadOffers() {
      try {
        const res = await authenticatedFetch(OFFERS_ENDPOINT, { method: "GET" });
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const json = await res.json();
        if (!cancelled) {
          setOffers(json.data || []);
          setStatus("idle");
        }
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          setErrorMessage(err.message || "Failed to load offers.");
        }
      }
    }

    loadOffers();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleEdit(id) {
    router.push(`/merchant/offers/add?edit=true&id=${id}`);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Offers</h1>
          <p className="mt-1 text-sm text-slate-500">
            All affiliate offers across merchants.
          </p>
        </div>
        <Link
          href="/merchant/offers/add"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          + New offer
        </Link>
      </div>

      {status === "loading" && (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      )}

      {status === "error" && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {status === "idle" && offers.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-sm text-slate-500">No offers yet.</p>
        </div>
      )}

      {status === "idle" && offers.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Title
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Category
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Cashback
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Ends
                </th>
                <th className="px-4 py-3 text-right font-semibold text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {offers.map((offer) => (
                <tr key={offer.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">
                      {offer.title}
                    </div>
                    {offer.description && (
                      <div className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                        {offer.description}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {offer.category || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatCashback(offer)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        offer.is_active
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {offer.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatDate(offer.end_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleEdit(offer.id)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}