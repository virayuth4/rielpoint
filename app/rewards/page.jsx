"use client";

import { useEffect, useState } from "react";

export default function RewardPage() {
  const [merchants, setMerchants] = useState([]);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadMerchants() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/rewards`,
          { method: "GET" }
        );

        if (!res.ok) {
          throw new Error("Failed to load rewards.");
        }

        const json = await res.json();

        if (!cancelled) {
          setMerchants(json.data || []);
          setStatus("idle");
        }
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          setErrorMessage(err.message || "Failed to load rewards.");
        }
      }
    }

    loadMerchants();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Earn cashback
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Book through RielPoint and earn rewards from our affiliate partners.
          </p>
        </div>

        {status === "loading" && (
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[16/10] rounded-xl bg-slate-200" />
                <div className="mt-3 h-4 w-4/5 rounded bg-slate-200" />
                <div className="mt-2 h-3 w-3/5 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        )}

        {status === "error" && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {status === "idle" && merchants.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-sm text-slate-500">
              No rewards available yet.
            </p>
          </div>
        )}

        {status === "idle" && merchants.length > 0 && (
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
            {merchants.map((merchant) => {
              const image = merchant.image_paths?.[0];
              const cashback = Number(merchant.cashback_reward || 0);

              return (
                <a
                  key={merchant.id}
                  href={merchant.affiliate_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-slate-100">
                    {image ? (
                      <img
                        src={image}
                        alt={merchant.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center px-4 text-center text-sm font-medium text-slate-400">
                        {merchant.title}
                      </div>
                    )}

                    {cashback > 0 && (
                      <div className="absolute bottom-2 left-2 rounded-md bg-white/95 px-2.5 py-1 text-xs font-bold text-slate-900 shadow-sm">
                        Up to {cashback.toFixed(2)}% cashback
                      </div>
                    )}
                  </div>

                  <div className="mt-3">
                    <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900">
                      {merchant.title}
                    </h2>

                    {merchant.description && (
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                        {merchant.description}
                      </p>
                    )}

                    <div className="mt-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      <span>{merchant.category}</span>

                      {merchant.affiliator && (
                        <>
                          <span>•</span>
                          <span>{merchant.affiliator}</span>
                        </>
                      )}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}