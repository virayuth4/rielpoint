"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, Instagram, Facebook, Globe, ExternalLink } from "lucide-react";

function formatDateRange(startAt, endAt) {
  const opts = { month: "short", day: "numeric" };
  const start = startAt ? new Date(startAt).toLocaleDateString("en-US", opts) : null;
  const end = endAt ? new Date(endAt).toLocaleDateString("en-US", opts) : null;

  if (start && end) return `${start} – ${end}`;
  if (start && !end) return `From ${start} (End date not specified)`;
  if (!start && end) return `Until ${end}`;
  return "Date not specified";
}

function isExpired(endAt) {
  if (!endAt) return false;
  return new Date(endAt).getTime() < Date.now();
}

function formatPostedDate(createdAt) {
  const date = new Date(createdAt);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Posted today";
  if (diffDays === 1) return "Posted yesterday";
  if (diffDays < 7) return `Posted ${diffDays} days ago`;

  return `Posted ${date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })}`;
}

// Lucide doesn't ship a TikTok glyph, so a tiny inline SVG covers it.
function TiktokIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M16.6 5.82a4.3 4.3 0 0 1-.32-.32A4.85 4.85 0 0 1 15.15 3H12.2v13.19a2.86 2.86 0 1 1-2.02-2.74v-3a5.86 5.86 0 1 0 5.02 5.8V9.4a8.16 8.16 0 0 0 4.4 1.28V7.6a4.85 4.85 0 0 1-2.99-1.78Z" />
    </svg>
  );
}

// Maps a redirect_source value to display label + icon + brand color.
function getSourceMeta(source) {
  const key = (source || "").toLowerCase();

  switch (key) {
    case "instagram":
      return { label: "Instagram", Icon: Instagram, className: "text-pink-600" };
    case "tiktok":
      return { label: "TikTok", Icon: TiktokIcon, className: "text-black" };
    case "facebook":
      return { label: "Facebook", Icon: Facebook, className: "text-blue-600" };
    case "website":
      return { label: "Website", Icon: Globe, className: "text-slate-600" };
    case "foodpanda":
      return { label: "Foodpanda", Icon: null, image: "/foodpanda-icon.png" };
    case "grab":
    case "grabfood":
      return { label: "GrabFood", Icon: null, image: "/grabfood-icon.png" };
    default:
      return { label: "View deal", Icon: ExternalLink, className: "text-slate-600" };
  }
}

function RedirectButton({ redirectUrl, redirectSource, variant = "full" }) {
  if (!redirectUrl) return null;
  const { label, Icon, image, className } = getSourceMeta(redirectSource);

  if (variant === "icon") {
    // Compact circular icon button, used on the card thumbnail.
    return (
      <a
        href={redirectUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        aria-label={label}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow backdrop-blur hover:bg-white"
      >
        {image ? (
          <Image src={image} alt={label} width={20} height={20} className="h-5 w-5 object-contain rounded" />
        ) : (
          <Icon className={`h-4 w-4 ${className}`} />
        )}
      </a>
    );
  }

  // Full-width button, used in the modal.
  return (
    <a
      href={redirectUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-black/90"
    >
      {image ? (
        <Image src={image} alt={label} width={16} height={16} className="h-4 w-4 object-contain rounded" />
      ) : (
        <Icon className="h-4 w-4" />
      )}
      {label}
    </a>
  );
}

function DealModal({ deal, onClose }) {
  const {
    merchant_name,
    title,
    description,
    promo,
    category,
    image_paths,
    start_at,
    end_at,
    map,
    created_at,
    terms,
    foodpanda,
    grabfood,
    redirect_url,
    redirect_source,
  } = deal;

  const expired = isExpired(end_at);
  const images = image_paths?.length ? image_paths : [];

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("toggle-bottom-nav", { detail: { visible: false } }));
    return () => {
      window.dispatchEvent(new CustomEvent("toggle-bottom-nav", { detail: { visible: true } }));
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
        >
          <X />
        </button>

        <div className="overflow-y-auto">
          {images[0] && (
            <div className="relative aspect-[9/5] w-full overflow-hidden rounded-xl bg-white">
              <Image
                src={images[0]}
                alt={title}
                fill
                sizes="(max-width: 640px) 50vw, 500px"
                className="object-contain"
              />

              {/* Promo badge and delivery icons stacked in normal flow */}
              <div className="absolute left-3 top-3 flex flex-col items-start gap-2">
                {promo && (
                  <span className="rounded-full bg-black px-3 py-1 text-xs font-bold text-white shadow">
                    {promo}
                  </span>
                )}

                {(foodpanda || grabfood) && (
                  <div className="flex items-center gap-1.5 rounded-full ">
                    {foodpanda && (
                    <Image
                      src="/foodpanda-icon.png"
                      alt="foodpanda"
                      width={72}
                      height={72}
                      className="h-6 w-6 object-contain rounded"
                    />
                    )}
                    {grabfood && (
                      <Image
                        src="/grabfood-icon.png"
                        alt="GrabFood"
                        width={72}
                        height={72}
                       className="h-6 w-6 object-contain rounded"
                      />
                    )}
                  </div>
                )}
              </div>

              {expired && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-900">
                    Expired or Paused
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3 p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">
                {merchant_name}
                {category && (
                  <span className="ml-2 text-slate-400">· {category}</span>
                )}
              </p>
              <span className="text-xs text-slate-400">
                {formatPostedDate(created_at)}
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900">{title}</h2>

            <p className="text-sm font-medium text-slate-600">
              Valid: {formatDateRange(start_at, end_at)}
            </p>

            {description && (
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
                {description}
              </p>
            )}

            {terms && (
              <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
                <p className="mb-1 font-semibold text-slate-600">Terms</p>
                <p className="whitespace-pre-line">{terms}</p>
              </div>
            )}

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pt-1">
                {images.slice(1).map((src, i) => (
                  <div
                    key={i}
                    className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100"
                  >
                    <Image
                      src={src}
                      alt={`${title} ${i + 2}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              {map && (
                <a
                  href={map}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-black/90"
                >
                  Open in Maps
                </a>
              )}

              <RedirectButton redirectUrl={redirect_url} redirectSource={redirect_source} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DealCard({ deal }) {
  const [showModal, setShowModal] = useState(false);
  const {
    merchant_name,
    title,
    promo,
    image_paths,
    start_at,
    end_at,
    created_at,
    foodpanda,
    grabfood,
    redirect_url,
    redirect_source,
  } = deal;

  const expired = isExpired(end_at);
  const image = image_paths?.[0];

  return (
    <>
      <div className="group relative flex flex-col overflow-hidden rounded-2xl">
        <div className="relative aspect-[5/5] w-full overflow-hidden rounded-xl bg-slate-100">
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
              No image
            </div>
          )}

          {/* Promo badge and delivery icons stacked in normal flow */}
          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {promo && (
              <span className="rounded-full bg-black px-3 py-1 text-xs font-bold text-white shadow">
                {promo}
              </span>
            )}

            {(foodpanda || grabfood) && (
              <div className="flex items-center gap-1.5 rounded-full ">
                {foodpanda && (
                  <Image
                    src="/foodpanda-icon.png"
                    alt="foodpanda"
                    width={72}
                    height={72}
                    className="h-6 w-6 object-contain rounded"
                  />
                )}
                {grabfood && (
                  <Image
                    src="/grabfood-icon.png"
                    alt="GrabFood"
                    width={72}
                    height={72}
                    className="h-6 w-6 object-contain rounded"
                  />
                )}
              </div>
            )}
          </div>

          {/* Redirect shortcut, top-right of the thumbnail */}
          <div className="absolute right-3 top-3">
            <RedirectButton redirectUrl={redirect_url} redirectSource={redirect_source} variant="icon" />
          </div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="absolute bottom-3 left-3 rounded-full bg-white px-3 py-1 text-xs font-bold text-black shadow-sm">
              {formatPostedDate(created_at)}
            </span>
          </div>

          {expired && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">
                Expired or Paused
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-xs font-semibold uppercase tracking-wide text-rose-600">
              {merchant_name}
            </p>
          </div>

          <h3 className="line-clamp-2 text-base font-medium text-black">
            {title}
          </h3>

          <div className="mt-auto flex items-center justify-between text-xs font-black text-black">
            <span>Valid: {formatDateRange(start_at, end_at)}</span>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="mt-2 w-full rounded-full border border-black py-2 text-xs font-semibold text-black transition hover:bg-black hover:text-white"
          >
            View more
          </button>
        </div>
      </div>

      {showModal && (
        <DealModal deal={deal} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}