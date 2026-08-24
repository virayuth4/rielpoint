"use client";

import { useMemo, useState } from "react";
import OfferCard from "../Components/offerCard";

const CITIES = ["Phnom Penh", "Siem Reap"];

function getCity(hotel) {
  const text = `${hotel.description || ""} ${hotel.title || ""}`;
  const match = CITIES.find((city) =>
    text.toLowerCase().includes(city.toLowerCase())
  );
  return match || "Other";
}

export default function HotelsClient({ hotels }) {
  const [activeCategory, setActiveCategory] = useState("all");

  const hotelsWithCity = useMemo(
    () => (hotels || []).map((h) => ({ ...h, city: getCity(h) })),
    [hotels]
  );

  const categories = useMemo(() => {
    const set = new Set(hotelsWithCity.map((h) => h.city));
    // Keep a stable, sensible order: known cities first, then "Other" if present
    const ordered = CITIES.filter((c) => set.has(c));
    if (set.has("Other")) ordered.push("Other");
    return ["all", ...ordered];
  }, [hotelsWithCity]);

  const filtered = useMemo(() => {
    if (activeCategory === "all") return hotelsWithCity;
    return hotelsWithCity.filter((h) => h.city === activeCategory);
  }, [hotelsWithCity, activeCategory]);

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
          {filtered.map((hotel) => (
            <OfferCard key={hotel.id} offer={hotel} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">No hotels in this category right now.</p>
      )}
    </div>
  );
}