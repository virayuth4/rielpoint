"use client";

import authenticatedFetch from "@/app/auth/authenticatedFetch";
import { useEffect, useMemo, useState } from "react";

function formatCashback(offer) {
  if (!offer) return null;
  if (offer.cashback_type === "percentage" && offer.cashback_rate != null) {
    return `Up to ${offer.cashback_rate}% Cashback`;
  }
  if (offer.cashback_type === "fixed" && offer.fixed_cashback_amount != null) {
    return `Up to ${offer.currency || "$"} ${offer.fixed_cashback_amount} Cashback`;
  }
  return null;
}

function bestOffer(offers) {
  const active = (offers || []).filter((o) => o.is_active);
  if (active.length === 0) return null;
  return active.reduce((best, o) => {
    const bestValue = best.cashback_rate ?? best.fixed_cashback_amount ?? 0;
    const value = o.cashback_rate ?? o.fixed_cashback_amount ?? 0;
    return value > bestValue ? o : best;
  }, active[0]);
}

function endsInLabel(endAt) {
  if (!endAt) return null;
  const diffMs = new Date(endAt).getTime() - Date.now();
  if (diffMs <= 0) return null;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `Ends in ${hours}:${String(minutes).padStart(2, "0")}`;
}

export default function AffiliateMerchantsPage() {
  const [merchants, setMerchants] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | idle | error
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadMerchants() {
      try {
        const res = await authenticatedFetch(
          `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/affiliate/merchants`,
          { method: "GET" }
        );
        const json = await res.json();
        if (!cancelled) {
          setMerchants(json.data || []);
          setStatus("idle");
        }
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          setErrorMessage(err.message || "Failed to load merchants.");
        }
      }
    }

    loadMerchants();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeMerchants = useMemo(
    () => merchants.filter((m) => m.is_active),
    [merchants]
  );

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">
            Affiliate merchants
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Merchants connected through your affiliate networks.
          </p>
        </div>

        {status === "loading" && (
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[16/10] rounded-xl bg-slate-100" />
                <div className="mt-2.5 h-3 w-3/4 rounded bg-slate-100" />
                <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        )}

        {status === "error" && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {status === "idle" && activeMerchants.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-sm text-slate-500">No affiliate merchants yet.</p>
          </div>
        )}

        {status === "idle" && activeMerchants.length > 0 && (
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
            {activeMerchants.map((merchant) => {
              const href = merchant.website_url || merchant.tracking_url || "#";
              const offer = bestOffer(merchant.offers);
              const cashbackLabel = formatCashback(offer);
              const endsLabel = offer ? endsInLabel(offer.end_at) : null;

              return (
                <a
                  key={merchant.id}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <div className="aspect-[16/10] overflow-hidden rounded-xl bg-slate-100">
                    {merchant.logo_url ? (
                      <img
                        src={merchant.logo_url}
                        alt={merchant.name}
                        className="h-full w-full object-cover transition group-hover:opacity-90"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-medium text-slate-400">
                        {merchant.name}
                      </div>
                    )}
                  </div>

                  <p className="mt-2.5 truncate text-sm text-slate-500">
                    {merchant.name}
                  </p>

                  {cashbackLabel && (
                    <p className="text-sm font-semibold text-slate-900">
                      {cashbackLabel}
                    </p>
                  )}

                  {endsLabel && (
                    <p className="text-xs font-medium text-orange-600">
                      {endsLabel}
                    </p>
                  )}
                </a>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}