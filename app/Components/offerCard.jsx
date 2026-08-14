"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatCashback, endsInLabel } from "@/lib/offerHelpers";
import { AuthContext } from "../auth/authContext";
import { useContext } from "react";

export default function OfferCard({ offer, merchant }) {
  const cashbackLabel = formatCashback(offer);
  const endsLabel = endsInLabel(offer.end_at);
  const image = offer.image_paths?.[0] || merchant?.logo_url;
  const href = `/go/${offer.merchant_id}?offer=${offer.id}`;
  const { currentUser, loading } = useContext(AuthContext) ?? {};
  const router = useRouter();

  const handleClick = (e) => {
    if (loading) {
      e.preventDefault();
      return;
    }
    if (!currentUser) {
      e.preventDefault();
      router.push(`/signup?redirect=${encodeURIComponent(href)}`);
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      target={currentUser ? "_blank" : undefined}
      rel="noopener noreferrer sponsored"
      className="group block overflow-hidden rounded-xl"
    >
      <div className="relative aspect-10/10 overflow-hidden rounded-xl bg-white">
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

      <div className="py-4">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-black">
          {offer.title}
        </h3>

        {cashbackLabel && (
          <div className="mt-4 inline-flex text-sm font-black text-black">
            {cashbackLabel}
          </div>
        )}

        {/* <div className="mt-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
          {offer.category && <span>{offer.category}</span>}

          {endsLabel && (
            <>
              {offer.category && <span>•</span>}
              <span className="text-orange-500">{endsLabel}</span>
            </>
          )}
        </div> */}
      </div>
    </a>
  );
}