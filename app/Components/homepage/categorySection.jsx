"use client";

import { useState } from "react";
import OfferCard from "../offerCard";

const LIMIT = 8;

export default function CategorySection({ categoryName, initialData }) {
  const [extraItems, setExtraItems] = useState([]);
  const [hasMore, setHasMore] = useState(Boolean(initialData?.hasMore));
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const items = [...(initialData?.items || []), ...extraItems];

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/affiliate/homepage-feed?category=${encodeURIComponent(
          categoryName
        )}&page=${nextPage}&limit=${LIMIT}`
      );
      const json = await res.json();
      setExtraItems((prev) => [...prev, ...(json.offers || [])]);
      setPage(nextPage);
      setHasMore(Boolean(json.hasMore));
    } catch (err) {
      console.error(`Failed to load more for ${categoryName}:`, err);
    } finally {
      setLoadingMore(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">{categoryName}</h3>
      </div>

      <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {items.map(({ offer, merchant }, idx) => (
          <OfferCard key={offer?.id || idx} offer={offer} merchant={merchant} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 transition"
          >
            {loadingMore ? "Loading..." : `Load more ${categoryName}`}
          </button>
        </div>
      )}
    </section>
  );
}