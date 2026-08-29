import Banner from "./Components/banner";
import CategorySection from "./Components/homepage/categorySection";
import MerchantCard from "./Components/merchantCard";

async function getHomepageFeed() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/affiliate/homepage-feed`,
    { next: { revalidate: 86400 } } // ISR: cache 60s, then revalidate in background
  );

  if (!res.ok) throw new Error(`Server returned ${res.status}`);
  const json = await res.json();

  return json.data || { categories: {}, merchants: [] };
}

function pinMerchantFirst(merchants, pinnedId) {
  const pinned = merchants.find((m) => String(m.id) === String(pinnedId));
  if (!pinned) return merchants;
  return [pinned, ...merchants.filter((m) => String(m.id) !== String(pinnedId))];
}

export default async function HomePage() {
  const feed = await getHomepageFeed();
  const merchants = pinMerchantFirst(feed.merchants || [], 1);
  const categoryNames = Object.keys(feed.categories || {});

  return (
    <main className="bg-white">
      <Banner />

      <div id="offers" className="mx-auto max-w-6xl min-h-screen py-12 px-4">
        <div className="mb-8">
          <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight mb-8">
            Most Popular Stores
          </h2>

          {merchants.length > 0 && (
            <div className="grid grid-cols-2 gap-2 md:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-8">
              {merchants.map((merchant) => (
                <MerchantCard key={`merchant-${merchant.id}`} merchant={merchant} />
              ))}
            </div>
          )}

          <h2 className="text-3xl sm:text-4xl font-black text-black  tracking-tight">
            Most Popular
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Discover top cashback deals and active merchant promotions.
          </p>
        </div>

        <div className="space-y-12">
          {categoryNames.map((category) => (
            <CategorySection
              key={category}
              categoryName={category}
              initialData={feed.categories[category]}
            />
          ))}
        </div>
      </div>
    </main>
  );
}