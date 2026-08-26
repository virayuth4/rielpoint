// dealsPage.jsx (or page.js)
import DealsClient from "./dealsClient";

async function getDeals() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND;
  
  if (!backendUrl) {
    console.warn("NEXT_PUBLIC_BACKEND is not defined. Falling back to empty deals.");
    return [];
  }

  try {
    const res = await fetch(`${backendUrl}/api/merchant/promos/v2`, {
      next: { revalidate: 1800 },
    });

    if (!res.ok) {
      console.error(`Failed to fetch deals at build/runtime: Server returned ${res.status}`);
      return [];
    }

    const json = await res.json();
    return Array.isArray(json?.data) ? json.data : json?.data ? [json.data] : [];
  } catch (error) {
    console.error("Error fetching deals:", error.message);
    return [];
  }
}

export default async function DealsPage() {
  const deals = await getDeals();

  return (
    <main className="bg-white">
      <div className="mx-auto max-w-6xl min-h-screen py-12 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-black tracking-tight mb-2">
            Discover Local Promotions
          </h1>
          <p className="text-sm text-slate-500">
            Save in-store at local Restaurants, Cafe & Retailers
          </p>
        </div>

        <DealsClient deals={deals} />
      </div>
    </main>
  );
}