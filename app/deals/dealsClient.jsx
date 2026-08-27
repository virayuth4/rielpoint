"use client";

import { useMemo, useState } from "react";
import DealCard from "../Components/dealCard";

const ENDING_SOON_HOURS = 48; // tweak threshold as needed

function getHoursUntil(end_at) {
  if (!end_at) return Infinity;
  return (new Date(end_at).getTime() - Date.now()) / (1000 * 60 * 60);
}

function matchesSearch(deal, query) {
  if (!query) return true;
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const haystack = [deal.merchant_name, deal.title, deal.promo]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(q);
}

export default function DealsClient({ deals }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = useMemo(() => {
    const set = new Set((deals || []).map((d) => d.category).filter(Boolean));
    return ["all", "ending-soon", ...Array.from(set)];
  }, [deals]);

  const filtered = useMemo(() => {
    let list = deals || [];

    if (activeCategory === "ending-soon") {
      list = list.filter((d) => {
        const hrs = getHoursUntil(d.end_at);
        return hrs > 0 && hrs <= ENDING_SOON_HOURS;
      });
      list = [...list].sort((a, b) => new Date(a.end_at) - new Date(b.end_at));
    } else if (activeCategory !== "all") {
      list = list.filter((d) => d.category === activeCategory);
    }

    if (searchQuery.trim()) {
      list = list.filter((d) => matchesSearch(d, searchQuery));
    }

    return list;
  }, [deals, activeCategory, searchQuery]);

  return (
    <div>
      {/* Search */}
      <div className="mb-4 relative">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35m1.35-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search deals, merchants, or promos..."
          className="w-full rounded-full border border-slate-200 bg-white py-2 pl-9 pr-9 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category pills */}
      <div className="mb-8 flex flex-nowrap gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-none rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${
              activeCategory === cat
                ? "bg-black text-white"
                : cat === "ending-soon"
                ? "bg-red-50 text-red-600 hover:bg-red-100"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {cat === "ending-soon" ? "⏰ Ending Soon" : cat}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((deal) => (
            <DealCard key={deal.id || deal.slug} deal={deal} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          {searchQuery.trim()
            ? `No deals matching "${searchQuery}".`
            : activeCategory === "ending-soon"
            ? "No deals ending soon."
            : "No deals in this category right now."}
        </p>
      )}
    </div>
  );
}