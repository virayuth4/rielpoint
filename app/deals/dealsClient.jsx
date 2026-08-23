"use client";

import { useMemo, useState } from "react";
import DealCard from "../Components/dealCard";

export default function DealsClient({ deals }) {
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = useMemo(() => {
    const set = new Set(deals.map((d) => d.category).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [deals]);

  const filtered = useMemo(() => {
    if (activeCategory === "all") return deals;
    return deals.filter((d) => d.category === activeCategory);
  }, [deals, activeCategory]);

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${
              activeCategory === cat
                ? "bg-black text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {cat}
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
        <p className="text-sm text-slate-500">No deals in this category right now.</p>
      )}
    </div>
  );
}