import { notFound } from "next/navigation";
import MerchantPageClient from "./merchantPageClient";

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

// This stays a Server Component: it's async (data fetching) and has no hooks.
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
    <MerchantPageClient
      merchant={merchant}
      activeOffers={activeOffers}
      cashbackLabel={cashbackLabel}
      infoSections={infoSections}
      href={href}
    />
  );
}