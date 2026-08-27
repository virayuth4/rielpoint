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
    const ordered = CITIES.filter((c) => set.has(c));
    if (set.has("Other")) ordered.push("Other");
    return ["all", ...ordered];
  }, [hotelsWithCity]);

  const filtered = useMemo(() => {
    if (activeCategory === "all") return hotelsWithCity;
    return hotelsWithCity.filter((h) => h.city === activeCategory);
  }, [hotelsWithCity, activeCategory]);

  const cityGroups = useMemo(() => {
    if (activeCategory !== "all") return [];
    return categories
      .filter((c) => c !== "all")
      .map((city) => ({
        city,
        hotels: filtered.filter((h) => h.city === city),
      }))
      .filter((group) => group.hotels.length > 0);
  }, [categories, filtered, activeCategory]);

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

      {filtered.length === 0 ? (
        <p className="text-sm text-slate-500">No hotels in this category right now.</p>
      ) : activeCategory === "all" ? (
        <div className="space-y-10">
          {cityGroups.map(({ city, hotels: cityHotels }) => (
            <div key={city}>
              <h2 className="mb-4 text-xl font-black text-black ">
                {city}
              </h2>
              <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
                {cityHotels.map((hotel) => (
                  <OfferCard key={hotel.id} offer={hotel} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            {activeCategory}
          </h2>
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((hotel) => (
              <OfferCard key={hotel.id} offer={hotel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}