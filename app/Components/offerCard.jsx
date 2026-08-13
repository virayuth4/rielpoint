"use client";

import Image from "next/image";
import { formatCashback, endsInLabel } from "@/lib/offerHelpers";

export default function OfferCard({ offer, merchant }) {
  const cashbackLabel = formatCashback(offer);
  const endsLabel = endsInLabel(offer.end_at);
  const image = offer.image_paths?.[0] || merchant?.logo_url;
  const href = `/go/${offer.merchant_id}?offer=${offer.id}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="group block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        {image ? (
          <Image
            src={image}
            alt={offer.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-4 text-center text-sm font-medium text-slate-400">
            {offer.title}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900">
          {offer.title}
        </h3>

        {cashbackLabel && (
          <div className="mt-2 inline-flex text-sm font-bold text-slate-900">
            {cashbackLabel}
          </div>
        )}

        <div className="mt-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
          {offer.category && <span>{offer.category}</span>}

          {endsLabel && (
            <>
              {offer.category && <span>•</span>}
              <span className="text-orange-500">{endsLabel}</span>
            </>
          )}
        </div>
      </div>
    </a>
  );
}