// hotelsPage.jsx (or page.js)

import HotelsClient from "./hotelsClient";

async function getHotels() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND;
  
  if (!backendUrl) {
    console.warn("NEXT_PUBLIC_BACKEND is not defined. Falling back to empty deals.");
    return [];
  }

  try {
    const res = await fetch(`${backendUrl}/api/merchant/hotels`, {
      next: { revalidate: 60 },
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

export default async function HotelsPage() {
  const hotels = await getHotels();

  return (
    <main className="bg-white">
      <div className="mx-auto max-w-6xl min-h-screen py-12 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-black tracking-tight mb-2">
            Discover Local Hotels
          </h1>
          <p className="text-sm text-slate-500">
            Receive cashback when booking through our partnered apps.
          </p>
        </div>

        <HotelsClient hotels={hotels} />
      </div>
    </main>
  );
}