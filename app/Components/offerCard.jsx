"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatCashback } from "@/lib/offerHelpers";
import { AuthContext } from "../auth/authContext";
import { useContext } from "react";

export default function OfferCard({ offer, merchant }) {
  const cashbackLabel = formatCashback(offer);
  const image = offer.image_paths?.[0] || merchant?.logo_url;
  const href = `/go/${offer.merchant_id}?offer=${offer.id}`;
  const { currentUser, loading } = useContext(AuthContext) ?? {};
  const router = useRouter();

  const handleClick = (e) => {
    e.preventDefault();

    if (loading) return;

    // if (!currentUser) {
    //   router.push(`/signup?redirect=${encodeURIComponent(href)}`);
    //   return;
    // }

    // Explicitly open in a new window/tab across desktop & mobile
    window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={handleClick}
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
      </div>
    </a>
  );
}