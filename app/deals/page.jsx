import DealsClient from "./dealsClient";

async function getDeals() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/promos`, {
    next: { revalidate: 60 }, // ISR: cache 60s, then revalidate in background
  });

  if (!res.ok) throw new Error(`Server returned ${res.status}`);
  const json = await res.json();
  console.log("data", json)

  // backend currently returns a single row (result.rows[0]) — should be result.rows
  return Array.isArray(json.data) ? json.data : json.data ? [json.data] : [];
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