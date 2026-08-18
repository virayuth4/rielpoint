"use client";

import { useState } from "react";
const steps = [
  {
    title: "Sign up or log in",
    body: "Create your free account or log in to make sure your purchases and rewards are correctly linked to your profile.",
  },
  {
    title: "Click through partnered brands",
    body: "Browse our partner stores and click any brand link or 'Shop Now' button to activate tracking before you buy.",
  },
  {
    title: "Shop as normal",
    body: "Browse the retailer's site/app and complete your purchase in that same browser session, just like you normally do.",
  },
  {
    title: "Get cashback",
    body: "Once the retailer verifies your order, your cashback will be credited to your account and ready for withdrawal.",
  },
];
const tips = [
  {
    title: "Restart from this platform every time",
    body: "Complete your shopping in one go. Always start from our platform for every new transaction, and restart your visit from here if your shopping trip gets interrupted.",
  },
  {
    title: "Don't use adblockers or click on other links",
    body: "Disable ad blockers, VPNs, and coupon browser extensions before shopping. Avoid clicking external ads or links, as they can override tracking and prevent your cashback from recording.",
  },
  {
    title: "Empty shopping cart first",
    body: "Make sure your cart is completely empty before clicking through our platform. Adding items to your cart only after clicking our link ensures the purchase is properly tracked to your account.",
  },
  {
    title: "Restart from this platform if payment fails",
    body: "If a payment error occurs or you need to switch checkout methods, return to our platform and click through to the store again before attempting the transaction.",
  },
];

function TipItem({ tip, isOpen, onToggle }) {
  return (
    <div className="border-b border-slate-100 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span className="text-sm font-semibold text-slate-900">
          {tip.title}
        </span>
        <span
          className={`shrink-0 text-slate-400 transition-transform ${
            isOpen ? "rotate-45" : ""
          }`}
        >
          +
        </span>
      </button>
      {isOpen && (
        <p className="pb-4 text-sm leading-relaxed text-slate-600">
          {tip.body}
        </p>
      )}
    </div>
  );
}

export function HowCashbackWorks() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h2 className="text-lg font-semibold text-slate-900">
        How RielPoint cashback works
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Four simple steps between clicking through and getting paid.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {steps.map((step, i) => (
          <div key={step.title} className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
              {i + 1}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                {step.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                {step.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CashbackTips() {
  // Initialize state with all tip indexes open by default
  const [openIndexes, setOpenIndexes] = useState(
    () => tips.map((_, i) => i)
  );

  const toggleIndex = (index) => {
    setOpenIndexes((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h2 className="text-lg font-semibold text-slate-900">Cashback tips</h2>
      <p className="mt-1 text-sm text-slate-500">
        Follow these to make sure your cashback tracks correctly.
      </p>

      <div className="mt-6 rounded-xl border border-slate-100 bg-blue-50 px-5">
        {tips.map((tip, i) => (
          <TipItem
            key={tip.title}
            tip={tip}
            isOpen={openIndexes.includes(i)}
            onToggle={() => toggleIndex(i)}
          />
        ))}
      </div>
    </section>
  );
}

export default function CashbackExplainer() {
  return (
    <div>
      <HowCashbackWorks />
      <CashbackTips />
    </div>
  );
}