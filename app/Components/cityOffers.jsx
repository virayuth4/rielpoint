"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import OfferCard from "./offerCard";

const LIMIT = 30;

export default function CityOffers({ city }) {
  const [merchants, setMerchants] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/affiliate/merchants?city=${encodeURIComponent(city)}&limit=${LIMIT}&offset=${offset}`
    );
    const json = await res.json();
    const rows = json.data || [];

    setMerchants((prev) => [...prev, ...rows]);
    setHasMore(rows.length === LIMIT);
    setOffset((prev) => prev + rows.length);
    setLoading(false);
  }, [city, offset, loading, hasMore]);

  // Reset when city changes
  useEffect(() => {
    setMerchants([]);
    setOffset(0);
    setHasMore(true);
  }, [city]);

  useEffect(() => {
    if (offset === 0 && hasMore) loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "400px" } // start fetching before user hits the bottom
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div>
      <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {merchants.map((m) =>
          (m.offers || []).map((offer) => (
            <OfferCard key={offer.id} offer={offer} merchant={m} />
          ))
        )}
      </div>

      {loading && (
        <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[16/10] rounded-xl bg-slate-100" />
            </div>
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="h-1" />
    </div>
  );
}