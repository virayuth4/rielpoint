"use client";

import Image from "next/image";
import { formatCashback, bestOffer, endsInLabel } from "@/lib/offerHelpers";
import Link from "next/link";

export default function MerchantCard({ merchant }) {
  const offer = bestOffer(merchant.offers);
  const cashbackLabel = formatCashback(offer);
  const endsLabel = offer ? endsInLabel(offer.end_at) : null;

  return (
 <Link 
  href={`/${merchant.slug}`} 
  className="group block w-full rounded-2xl p-2.5 transition-all duration-150 ease-out active:scale-[0.98] active:opacity-80 active:bg-blue-100"
>
      {/* Image container */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-slate-100">
        {merchant.logo_url ? (
          <Image
            src={merchant.logo_url}
            alt={merchant.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover "
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-4 text-center text-sm font-medium text-slate-400">
            {merchant.name}
          </div>
        )}

        {cashbackLabel && (
          <div className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)] truncate whitespace-nowrap rounded-md bg-white/95 px-3 py-1 text-xs font-bold text-slate-900 shadow-sm backdrop-blur-sm">
            {cashbackLabel}
          </div>
        )}
      </div>

      {/* Details stacked in separate lines */}
      <div className="mt-3 px-0.5">
        {/* Line 1: Merchant Name */}
        <h2 className="line-clamp-1 text-sm font-semibold leading-snug text-slate-400">
          {merchant.name}
        </h2>

        {/* Line 2: Cashback Label */}
        {merchant.max_cashback && (
          <div className="mt-1">
            <span className="inline-block text-md font-medium tracking-wide text-black">
              {merchant.max_cashback}
            </span>
          </div>
        )}

        <div className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-2xl bg-black py-2.5 text-xs font-semibold text-white transition-all duration-150 group-hover:bg-black/90"> 
        Earn cashback
        <span className="text-sm">→</span> </div>

        {merchant.description && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
            {merchant.description}
          </p>
        )}

        {endsLabel && (
          <p className="mt-2 text-[11px] font-medium text-amber-600">
            {endsLabel}
          </p>
        )}
      </div>
    </Link>
  );
}