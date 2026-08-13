"use client";

import { formatCashback, bestOffer, endsInLabel } from "@/lib/offerHelpers";

export default function MerchantCard({ merchant }) {
  const offer = bestOffer(merchant.offers);
  const cashbackLabel = formatCashback(offer);
  const endsLabel = offer ? endsInLabel(offer.end_at) : null;

  return (
    <a
      href={`/${merchant.slug}`}
      className="group block"
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-slate-100">
        {merchant.logo_url ? (
          <img
            src={merchant.logo_url}
            alt={merchant.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-4 text-center text-sm font-medium text-slate-400">
            {merchant.name}
          </div>
        )}

        {cashbackLabel && (
          <div className="absolute bottom-2 left-2 rounded-md bg-white/95 px-2.5 py-1 text-xs font-bold text-slate-900 shadow-sm">
            {cashbackLabel}
          </div>
        )}
      </div>

      <div className="mt-3">
        <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900">
          {merchant.name}
        </h2>

        {merchant.description && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
            {merchant.description}
          </p>
        )}

        <div className="mt-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
          {merchant.affiliate_network && <span>{merchant.affiliate_network}</span>}
          {endsLabel && (
            <>
              {merchant.affiliate_network && <span>•</span>}
              <span className="text-orange-500">{endsLabel}</span>
            </>
          )}
        </div>
      </div>
    </a>
  );
}