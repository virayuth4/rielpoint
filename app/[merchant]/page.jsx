import { notFound } from "next/navigation";
import { formatCashback, bestOffer, endsInLabel } from "@/lib/offerHelpers";
import OfferCard from "../Components/offerCard";

async function getMerchantBySlug(slug) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/affiliate/merchants`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Failed to load merchants");
  const json = await res.json();
  const merchants = json.data || [];
  return merchants.find((m) => m.slug === slug) || null;
}

async function getOffers(merchantId) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/affiliate/offers/${merchantId}`,
    { cache: "no-store" }
  );
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
}

export default async function MerchantPage({ params }) {
  const { merchant: slug } = await params;
  const merchant = await getMerchantBySlug(slug);

  if (!merchant) notFound();

  const offers = await getOffers(merchant.id);
  const offer = bestOffer(offers);
  const cashbackLabel = formatCashback(offer);
  const endsLabel = offer ? endsInLabel(offer.end_at) : null;
  const href = `/go/${merchant.id}${offer ? `?offer=${offer.id}` : ""}`;
  const activeOffers = offers.filter((o) => o.is_active);

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 overflow-hidden rounded-xl bg-slate-100">
          {merchant.logo_url ? (
            <img
              src={merchant.logo_url}
              alt={merchant.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
              {merchant.name}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {merchant.name}
          </h1>
          {cashbackLabel && (
            <p className="text-sm font-semibold text-emerald-600">
              {cashbackLabel}
            </p>
          )}
          {endsLabel && (
            <p className="text-xs font-medium text-orange-600">{endsLabel}</p>
          )}
        </div>
      </div>

      {merchant.description && (
        <p className="mt-6 text-sm leading-relaxed text-slate-600">
          {merchant.description}
        </p>
      )}

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="mt-8 inline-block rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
      >
        Shop now
      </a>

      {activeOffers.length > 1 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-slate-900">
            All offers
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {activeOffers.map((o) => (
              <OfferCard key={o.id} offer={o} merchant={merchant} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}