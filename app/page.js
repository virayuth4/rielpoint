"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { bestOffer } from "@/lib/offerHelpers";
import OfferCard from "./Components/offerCard";

// Preferred display order for known categories.
// Any category not listed here will still render, just after these.
const CATEGORY_ORDER = ["Flights", "Hotels - Phnom Penh", "Hotels - Siem Reap"];

// Capitalizes just the first letter, leaves the rest as-is.
function capitalize(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
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
        console.log("data", json.data)
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

const { categorizedOffers, merchantsWithoutOffers } = useMemo(() => {
    const map = {};
    const noOfferMerchants = [];

    activeMerchants.forEach((merchant) => {
      const activeOffers = (merchant.offers || []).filter((o) => o.is_active);

      if (activeOffers.length === 0) {
        noOfferMerchants.push(merchant);
        return;
      }

      activeOffers.forEach((offer) => {
        const rawCategory = capitalize(offer.category?.trim()) || "Other";
        let category = rawCategory;

        if (rawCategory === "Travel") {
          // "Travel" offers are displayed as "Flights"
          category = "Flights";
        } else if (rawCategory === "Hotels") {
          // Split hotels by location, based on keywords in the description
          const description = (offer.description || "").toLowerCase();

          if (description.includes("siem reap")) {
            category = "Hotels - Siem Reap";
          } else if (description.includes("phnom penh")) {
            category = "Hotels - Phnom Penh";
          } else {
            category = "Hotels - Other";
          }
        }

        if (!map[category]) map[category] = [];
        map[category].push({ offer, merchant });
      });
    });

    // Within each category, offers whose description mentions "main"
    // are pinned to the front of the row (order otherwise preserved).
    Object.keys(map).forEach((category) => {
      map[category].sort((a, b) => {
        const aIsMain = (a.offer.description || "")
          .toLowerCase()
          .includes("main");
        const bIsMain = (b.offer.description || "")
          .toLowerCase()
          .includes("main");

        if (aIsMain === bIsMain) return 0;
        return aIsMain ? -1 : 1;
      });
    });

    return { categorizedOffers: map, merchantsWithoutOffers: noOfferMerchants };
  }, [activeMerchants]);

  // Final category order: known categories first (in CATEGORY_ORDER),
  // then any remaining categories alphabetically.
  const orderedCategories = useMemo(() => {
    const allCategories = Object.keys(categorizedOffers);
    const known = CATEGORY_ORDER.filter((c) => allCategories.includes(c));
    const rest = allCategories
      .filter((c) => !CATEGORY_ORDER.includes(c))
      .sort((a, b) => a.localeCompare(b));
    return [...known, ...rest];
  }, [categorizedOffers]);

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
                  Earn Up to <span className=" block sm:inline">50% Cashback</span>
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
          <h1 className="text-4xl font-black text-black">
            Most Popular 
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Shop your favorite local and international brands and get money back automatically.

          </p>
        </div>

        {status === "loading" && (
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
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

        {status === "idle" && activeMerchants.length > 0 && (
          <div className="space-y-12">
            {orderedCategories.map((category) => (
              <section key={category}>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {category}
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
                  {categorizedOffers[category].map(({ offer, merchant }) => (
                    <OfferCard key={offer.id} offer={offer} merchant={merchant} />
                  ))}
                </div>
              </section>
            ))}

            {merchantsWithoutOffers.length > 0 && (
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">
                    More merchants
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
                  {merchantsWithoutOffers.map((merchant) => {
                    const href = `/${merchant.slug}`;
                    return (
                      <a
                        key={`merchant-${merchant.id}`}
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
                      </a>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}