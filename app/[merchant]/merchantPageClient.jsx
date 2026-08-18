"use client";
import { useContext } from "react";
import { useRouter } from "next/navigation";

import OfferCard from "../Components/offerCard";
import CashbackExplainer from "../Components/cashbackExplainer";
import SetNavCta from "../Components/setNavCta";
import { AuthContext } from "../auth/authContext";

// Plain (non-async) client component: safe to use hooks like useContext here.
export default function MerchantPageClient({
  merchant,
  activeOffers,
  cashbackLabel,
  infoSections,
  href,
}) {
  const router = useRouter();
  const { currentUser, loading } = useContext(AuthContext) ?? {};

  function handleShopClick(e) {
    if (loading) {
      // Auth state hasn't resolved yet; ignore the click rather than
      // guessing. (Optionally disable the CTA visually while loading.)
      e.preventDefault();
      return;
    }
    if (!currentUser) {
      e.preventDefault();
      router.push(`/signup?callback=${encodeURIComponent(href)}`);
    }
    // else: let the <a> navigate normally to `href`
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <SetNavCta href={href} label={`Shop ${merchant.name}`} onClick={handleShopClick} />
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
      
            <p className="text-sm font-semibold text-emerald-600">
              {merchant.max_cashback}
            </p>
        
          
        </div>
      </div>

      {/* Shop CTA */}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={handleShopClick}
        className="mt-8 inline-block rounded-full bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-black/90"
      >
        Shop {merchant.name}
      </a>

      {/* Description */}
      {merchant.general_description && (
        <p className="mt-6 text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">
          {merchant.general_description}
        </p>
      )}

      <CashbackExplainer />

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
          <h2 className="text-lg font-semibold text-slate-900">Top offers</h2>
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