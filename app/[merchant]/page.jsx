import { notFound } from "next/navigation";
import OfferCard from "../Components/offerCard";
import CashbackExplainer from "../Components/cashbackExplainer";
import SetNavCta from "../Components/setNavCta";

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

// tracked_cashback / confirmed_cashback are plain percentages on the merchant.
// Lead with whichever is higher, and label it so users understand the split.
function cashbackHeadline(merchant) {
  const tracked = merchant.tracked_cashback ?? 0;
  const confirmed = merchant.confirmed_cashback ?? 0;
  const max = Math.max(tracked, confirmed);
  if (!max) return null;
  return `Up to ${max}% Cashback`;
}

export default async function MerchantPage({ params }) {
  const { merchant: slug } = await params;
  const merchant = await getMerchantBySlug(slug);

  if (!merchant) notFound();

  const offers = await getOffers(merchant.id);
  const activeOffers = offers.filter((o) => o.is_active);

  const cashbackLabel = cashbackHeadline(merchant);
  const href = `/go/${merchant.id}`;

  const infoSections = [
    { title: "Exclusions", body: merchant.exclusions },
    { title: "Refunds", body: merchant.refunds },
    { title: "Terms", body: merchant.terms },
  ].filter(
    (s) => s.body && !/no (refund policy|terms or conditions yet)/i.test(s.body)
  );

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <SetNavCta href={href} label={`Shop ${merchant.name}`} />
      {/* Header */}
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
          {merchant.affiliate_network && (
            <p className="text-xs text-slate-400">
              via {merchant.affiliate_network}
            </p>
          )}
        </div>
        
      </div>

       {/* Shop CTA */}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="mt-8 inline-block rounded-full bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-black/90"
      >
        Shop {merchant.name} 
      </a>

      {/* Description */}
      {merchant.general_description && (
        <p className="mt-6 text-sm leading-relaxed text-slate-600">
          {merchant.general_description}
        </p>
      )}

      <CashbackExplainer/>

     

      {/* Policy details */}
      {infoSections.length > 0 && (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {infoSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-slate-900">
                {section.title}
              </h3>
              <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-slate-500">
                {section.body}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Offers, pushed to the bottom */}
      {activeOffers.length > 0 && (
        <div className="mt-12 border-t border-slate-100 pt-10">
          <h2 className="text-lg font-semibold text-slate-900">
            Top offers
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-2">
            {activeOffers.map((o) => (
              <OfferCard key={o.id} offer={o} merchant={merchant} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}