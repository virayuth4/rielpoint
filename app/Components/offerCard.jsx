"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatCashback } from "@/lib/offerHelpers";
import { AuthContext } from "../auth/authContext";
import { useContext, useState, useEffect } from "react";

export default function OfferCard({ offer, merchant }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const cashbackLabel = formatCashback(offer);
  const image = offer.image_paths?.[0] || merchant?.logo_url;
  const merchantName = merchant?.name || "Partner Store";
  const href = `/go/${offer.merchant_id}?offer=${offer.id}`;
  const { currentUser, loading } = useContext(AuthContext) ?? {};
  const router = useRouter();

  // Close modal handler
  const handleCloseModal = () => {
    setIsRedirecting(false);
    setIsOpen(false);
  };

  // 1. Automatically toggle navbar visibility whenever `isOpen` changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("toggle-bottom-nav", {
          detail: { visible: !isOpen },
        })
      );
    }

    return () => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("toggle-bottom-nav", {
            detail: { visible: true },
          })
        );
      }
    };
  }, [isOpen]);

  // 2. Handle ESC key press to close modal
useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === "Escape" && !isRedirecting) {
      // Unfocus the card element so focus-visible outline does not persist
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      handleCloseModal();
    }
  };

  if (isOpen) {
    window.addEventListener("keydown", handleKeyDown);
  }

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [isOpen, isRedirecting]);

  const handleOpenModal = () => {
    if (loading) return;

    // if (!currentUser) {
    //   router.push(`/signup?callback=${encodeURIComponent(href)}`);
    //   return;
    // }

    setIsRedirecting(false);
    setIsOpen(true);
  };

  const handleRedirect = () => {
     if (!currentUser) {
      router.push(`/signup?callback=${encodeURIComponent(href)}`);
      return;
    }
    setIsRedirecting(true);

    // Open affiliate link in new tab
    window.open(href, "_blank", "noopener,noreferrer");

    // Close modal after brief delay
    setTimeout(() => {
      handleCloseModal();
    }, 1200);
  };

  return (
    <>
      {/* Card Trigger */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleOpenModal}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleOpenModal()}
        className="group block cursor-pointer overflow-hidden rounded-xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
      >
        <div className="relative aspect-square overflow-hidden rounded-xl bg-white">
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
            <div className="mt-2 inline-flex text-sm font-black text-black">
              {cashbackLabel}
            </div>
          )}
        </div>
      </div>

      {/* Modal Dialog */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => !isRedirecting && handleCloseModal()}
          />

          {/* Modal Content */}
          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all">
            {/* Close Button */}
            {!isRedirecting && (
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none"
                aria-label="Close modal"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            {/* Offer Preview */}
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-50 border border-slate-100">
                {image ? (
                  <Image
                    src={image}
                    alt={offer.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                    No image
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="line-clamp-2 text-sm font-bold text-slate-900">
                  {offer.title}
                </h4>
                {cashbackLabel && (
                  <span className="mt-1 inline-block text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {cashbackLabel}
                  </span>
                )}
              </div>
            </div>

          {/* How to Earn Cashback Instructions */}
<div className="my-5">
  <h5 className="mb-3 text-xs font-bold tracking-wider text-black uppercase">
    How to earn cashback
  </h5>
  <ol className="space-y-3 text-sm text-black">
    <li className="flex items-start gap-2.5">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-black">
        1
      </span>
      <span>
        Make sure you have a <strong>RielPoint</strong> account and are logged in before proceeding.
      </span>
    </li>
    <li className="flex items-start gap-2.5">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-black">
        2
      </span>
      <span>
        Click below to be redirected directly to our partner website (<strong>{merchantName}</strong>).
      </span>
    </li>
    <li className="flex items-start gap-2.5">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-black">
        3
      </span>
      <span>Complete your purchase in the newly opened partner window in the same session.</span>
    </li>
    <li className="flex items-start gap-2.5">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-black">
        4
      </span>
      <span>We&apos;ll track your order automatically and credit cashback to your account.</span>
    </li>
  </ol>
</div>

            {/* Redirection Notice & Action Buttons */}
            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={handleRedirect}
                disabled={isRedirecting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-black py-3 text-center text-sm font-bold text-white transition hover:bg-black/90 active:scale-[0.99] disabled:opacity-80 focus:outline-none"
              >
                {isRedirecting ? (
                  <>
                    <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Redirecting to Partner...</span>
                  </>
                ) : (
                  <span>Continue to Partner Site &rarr;</span>
                )}
              </button>

              <p className="text-center text-xs text-slate-400 pt-1">
                You will be securely redirected to {merchantName} to complete your order.
              </p>

              {!isRedirecting && (
                <button
                  onClick={handleCloseModal}
                  className="w-full py-2 text-center text-xs font-medium text-slate-500 hover:text-slate-800 focus:outline-none"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}