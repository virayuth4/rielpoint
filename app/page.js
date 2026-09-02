
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

function pinMerchantsFirst(merchants, pinnedIds) {
  const pinned = pinnedIds
    .map((id) => merchants.find((m) => String(m.id) === String(id)))
    .filter(Boolean);

  const pinnedIdSet = new Set(pinned.map((m) => String(m.id)));

  const rest = merchants.filter((m) => !pinnedIdSet.has(String(m.id)));

  return [...pinned, ...rest];
}

export default async function HomePage() {
  const feed = await getHomepageFeed();

  const merchants = pinMerchantsFirst(feed.merchants || [], [1, 6, 7]);

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

  <div className="-mx-4 sm:mx-0">
    <div
      className="grid grid-flow-col grid-rows-2 gap-0 overflow-x-auto
                 scroll-smooth snap-x snap-mandatory px-4 pb-2
                 md:gap-5 md:px-0
                 [&::-webkit-scrollbar]:hidden
                 [-ms-overflow-style:none]
                 [scrollbar-width:none]"
    >
      {merchants.map((merchant) => (
        <div
          key={`merchant-${merchant.id}`}
          className="w-44 flex-shrink-0 snap-start sm:w-48 md:w-56"
        >
          <MerchantCard merchant={merchant} />
        </div>
      ))}
    </div>
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

