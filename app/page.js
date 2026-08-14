"use client";

import { useEffect, useState } from "react";
import OfferCard from "./Components/offerCard";
import Banner from "./Components/banner";

/**
 * Sub-component for individual category sections to handle "Load More" independently
 */
function CategorySection({ categoryName, initialData }) {
  // Only track extra items fetched via "Load More"
  const [extraItems, setExtraItems] = useState([]);
  const [hasMore, setHasMore] = useState(Boolean(initialData?.hasMore));
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const LIMIT = 8;

  // Combine initial items from props + appended items from state
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
      const newOffers = json.offers || [];

      setExtraItems((prev) => [...prev, ...newOffers]);
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

export default function HomePage() {
  const [feed, setFeed] = useState({ categories: {}, merchantsWithoutOffers: [] });
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadHomepageFeed() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/affiliate/homepage-feed`,
          { method: "GET" }
        );

        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const json = await res.json();

        if (!cancelled) {
          setFeed(json.data || { categories: {}, merchantsWithoutOffers: [] });
          setStatus("idle");
        }
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          setErrorMessage(err.message || "Failed to load homepage feed.");
        }
      }
    }

    loadHomepageFeed();
    return () => {
      cancelled = true;
    };
  }, []);

  const categoryNames = Object.keys(feed.categories || {});

  return (
    <main className="bg-white">
      <Banner />

      <div id="offers" className="mx-auto max-w-6xl min-h-screen py-12 px-4">
        <div className="mb-8">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Most Popular
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Discover top cashback deals and active merchant promotions.
          </p>
        </div>

        {status === "loading" && (
          <div className="space-y-12">
            {Array.from({ length: 2 }).map((_, sectionIdx) => (
              <div key={sectionIdx} className="space-y-4">
                <div className="h-6 w-48 rounded bg-slate-200 animate-pulse" />
                <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, cardIdx) => (
                    <div key={cardIdx} className="animate-pulse">
                      <div className="aspect-[16/10] rounded-xl bg-slate-100" />
                      <div className="mt-2.5 h-3 w-3/4 rounded bg-slate-100" />
                      <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {status === "error" && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {status === "idle" && (
          <div className="space-y-12">
            {categoryNames.map((category) => (
              <CategorySection
                key={category}
                categoryName={category}
                initialData={feed.categories[category]}
              />
            ))}

            {feed.merchantsWithoutOffers.length > 0 && (
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">
                    More merchants
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
                  {feed.merchantsWithoutOffers.map((merchant) => {
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