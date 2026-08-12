"use client";

import authenticatedFetch from "@/app/auth/authenticatedFetch";
import Image from "next/image";
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

export default function HomePage() {
  const [merchants, setMerchants] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | idle | error
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadMerchants() {
      try {
        const res = await fetch(
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
    <main className="">
      <section className="relative w-full bg-slate-900 overflow-hidden">
        {/* Banner container with fixed height on mobile & dynamic aspect ratio on desktop */}
        <div className="relative h-[320px] sm:h-[400px] lg:h-auto lg:aspect-[2400/1256] lg:max-h-[800px] w-full">
          {/* Background Image */}
          <Image
            src="https://rielpoint-bucket.s3.ap-southeast-1.amazonaws.com/rielpoint/banner_image.avif"
            alt="Affiliate Merchants Promotion"
            fill
            priority
            className="object-cover object-center lg:object-top "
          />

          {/* ShopBack style overlay: Full darkening gradient on mobile, side-fade on desktop */}
          <div className="absolute inset-0  " />

          {/* Centered Content Container */}
          <div className="absolute inset-0 z-10 flex items-center justify-center lg:justify-start">
            <div className="container mx-auto px-4 sm:px-10 lg:px-20">
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-xl mx-auto lg:mx-0 space-y-2.5 sm:space-y-4">
                
                {/* Main Heading */}
                <h1 className="text-2xl sm:text-4xl lg:text-6xl font-extrabold tracking-tight text-white drop-shadow-md leading-tight">
                  Earn Up to{" "}
                  <span className=" block sm:inline">
                    50% Cashback
                  </span>
                </h1>

                {/* Subtext */}
                <p className="text-xs sm:text-base lg:text-lg font-light text-slate-200 lg:text-slate-300 leading-relaxed max-w-sm sm:max-w-md lg:max-w-lg">
                  Shop your favorite local and international brands and get money back automatically.
                </p>

              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl min-h-screen py-12 px-4">
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
            const offer = bestOffer(merchant.offers);
              const cashbackLabel = formatCashback(offer);
              const endsLabel = offer ? endsInLabel(offer.end_at) : null;
              const href = `/go/${merchant.id}${offer ? `?offer=${offer.id}` : ""}`;


              return (
                <a
                  key={merchant.id}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
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