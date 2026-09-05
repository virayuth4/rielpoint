"use client";
import { useContext, useState } from "react";
import { useRouter } from "next/navigation";

import OfferCard from "../Components/offerCard";
import CashbackExplainer from "../Components/cashbackExplainer";
import SetNavCta from "../Components/setNavCta";
import { AuthContext } from "../auth/authContext";
import ShopSignupModal from "../Components/shopSignUpModal";
import { TELEGRAM_SUPPORT_URL } from "@/lib/constants";
import VerifyCouponModal from "../Components/verifyCouponModal";
import authenticatedFetch from "../auth/authenticatedFetch";
import ShowCouponCodeModal from "../Components/showCouponCodeModal";

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
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [signupIntent, setSignupIntent] = useState("shop");
  const [coupon, setCoupon] = useState({ open: false, loading: false, code: null, error: null });


async function handleCouponClick(e) {
  e.preventDefault();
  if (loading) return;

  if (!currentUser) {
    setSignupIntent("coupon");
    setShowSignupModal(true);
    return;
  }

  // Already have a code — just reopen the modal, don't re-fetch
  if (coupon.code) {
    setCoupon((c) => ({ ...c, open: true }));
    return;
  }

  setCoupon({ open: true, loading: true, code: null, error: null });
  try {
    const res = await authenticatedFetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/coupons/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant_id: merchant.id,
        customer_number: currentUser.customer_number,
      }),
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    setCoupon({ open: true, loading: false, code: data.code, error: null });
  } catch {
    setCoupon({ open: true, loading: false, code: null, error: "Couldn't claim your coupon. Please try again." });
  }
}

  function handleShopClick(e) {
    if (loading) {
      // Auth state hasn't resolved yet; ignore the click rather than
      // guessing. (Optionally disable the CTA visually while loading.)
      e.preventDefault();
      return;
    }
    if (!currentUser) {
      e.preventDefault();
      setShowSignupModal(true);
      return;
    }
    // else: let the <a> navigate normally to `href`
  }

   function handleConfirmSignup() {
    setShowSignupModal(false);
    router.push(`/signup?callback=${encodeURIComponent(href)}`);
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
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
{merchant.chat_commerce === true && (
 <div className="mt-8 space-y-3">
  

  {/* Telegram / social — tracked via coupon code */}
  {merchant.chat_commerce === true && (
    <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-violet-300 bg-violet-50">
      <div className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-white" />
      <div className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-white" />

      <div className="px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-violet-600 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            Coupon
          </span>
          <span className="text-[11px] font-medium text-violet-700">
            Order via chat
          </span>
        </div>

        <p className="mt-2 text-sm font-semibold text-violet-900">
          Prefer to order on Telegram or Instagram?
        </p>
        <p className="mt-1 text-xs leading-relaxed text-violet-700">
          Claim {merchant.name}&apos;s coupon and show the code when you
          check out on Telegram or Instagram — cashback still applies.
        </p>

        <a
          href="#"
     
          onClick={handleCouponClick}
          className="mt-3 inline-flex items-center justify-center gap-2 rounded-full border-2 border-violet-600 bg-white px-6 py-3 text-sm font-semibold text-violet-700 transition hover:bg-violet-600 hover:text-white"
        >
          Claim Coupon
        </a>

        <p className="mt-2 text-[11px] text-violet-600">
          Coupon orders are confirmed manually and may take longer to
          credit than online purchases.
        </p>
      </div>
    </div>
  )}
  </div>
)}

      


        {/* Cashback tracking reminder */}
     <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
  <p className="text-sm font-semibold text-amber-900">
    Important: Click “Shop” before every booking or purchasing
  </p>
  <p className="mt-1 text-xs leading-relaxed text-amber-800">
    To make sure your booking/purchasing is tracked and your cashback is credited
    correctly, please return to RielPoint and click the “Shop” button
    again before making each new booking/purchase.
  </p>
  <p className="mt-2 text-xs leading-relaxed text-amber-800">
    Not sure how it works?{" "}
    <a
      href={TELEGRAM_SUPPORT_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="font-semibold underline underline-offset-2 hover:text-amber-900"
    >
      Contact us on Telegram
    </a>
    .
  </p>
</div>

      {/* Description */}
      {merchant.general_description && (
        <p className="mt-6 text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">
          {(merchant.general_description)}
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

         <ShopSignupModal
        open={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onConfirm={handleConfirmSignup}
        merchantName={merchant.name}
      />
      <ShowCouponCodeModal
        state={coupon}
        onClose={() => setCoupon((c) => ({ ...c, open: false }))}
        merchantName={merchant.name}
      />

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