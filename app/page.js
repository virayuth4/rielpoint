
import Banner from "./Components/banner";
import CategorySection from "./Components/homepage/categorySection";
import MerchantCard from "./Components/merchantCard";

async function getHomepageFeed() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/affiliate/homepage-feed`,
    { next: { revalidate: 86400 } }
  );

  if (!res.ok) {
    throw new Error(`Server returned ${res.status}`);
  }

  const json = await res.json();

  return json.data || {
    categories: {},
    merchants: [],
  };
}

function pinMerchantFirst(merchants, pinnedId) {
  const pinned = merchants.find(
    (m) => String(m.id) === String(pinnedId)
  );

  if (!pinned) return merchants;

  return [
    pinned,
    ...merchants.filter(
      (m) => String(m.id) !== String(pinnedId)
    ),
  ];
}

export default async function HomePage() {
  const feed = await getHomepageFeed();

  const merchants = pinMerchantFirst(
    feed.merchants || [],
    1
  );

  const categoryNames = Object.keys(
    feed.categories || {}
  );

  return (
    <main className="bg-white">
      <Banner />

      <div
        id="offers"
        className="mx-auto min-h-screen max-w-6xl px-4  sm:px-6 sm:py-14"
      >
        {/* Popular Stores */}
        {merchants.length > 0 && (
          <section>
            <div className="mb-5">
              <h2 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">
                Popular Stores
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Earn cashback when you shop.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
              {merchants.map((merchant) => (
                <MerchantCard
                  key={`merchant-${merchant.id}`}
                  merchant={merchant}
                />
              ))}
            </div>
          </section>
        )}

        {/* Popular Deals */}
        <section className="mt-14 sm:mt-20">
          <div className="mb-7">
            <h2 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">
              Popular Deals
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Discover the latest cashback offers and promotions.
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
        </section>
      </div>
    </main>
  );
}

