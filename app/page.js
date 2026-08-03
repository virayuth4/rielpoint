"use client";

import React, { useId, useState } from "react";
import { ArrowRight, Check, MapPin, Phone } from "lucide-react";

import { useRouter } from "next/navigation";


const LOCAL_STYLES = `
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.animate-marquee {
  animation: marquee 28s linear infinite;
}

.stamp-press {
  transition: transform 120ms ease, box-shadow 120ms ease;
}
.stamp-press:active {
  transform: translateY(2px);
}
`;

const SHOPS = [
  "Sam's Cafe & Restaurant",
  "Emart24",
  "Number 21",
  "Slomo",
  "1464studio",
  "Toto by Chichi"

];

/* Circular ink-stamp mark, reused as logo / badge / signature.
   It's the brand's seal of approval, not a literal "collect stamps" card. */
function StampMark({ size = 220, label = "RIELPOINT", sub = "PHNOM PENH · CAMBODIA", className = "" }) {
  const uid = useId().replace(/[:]/g, "");
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className={className}>
      <defs>
        <filter id={`rough-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" />
        </filter>
        <path id={`circleTop-${uid}`} d="M 100,100 m -80,0 a 80,80 0 1,1 160,0" />
        <path id={`circleBottom-${uid}`} d="M 100,100 m 80,0 a 80,80 0 1,1 -160,0" />
      </defs>
      <g filter={`url(#rough-${uid})`} fill="none" stroke="currentColor">
        <circle cx="100" cy="100" r="94" strokeWidth="3" />
        <circle cx="100" cy="100" r="72" strokeWidth="1.25" />
        <text fontSize="11.5" letterSpacing="3.5" className="font-mono" fill="currentColor" stroke="none">
          <textPath href={`#circleTop-${uid}`} startOffset="50%" textAnchor="middle">
            {label}
          </textPath>
        </text>
        <text fontSize="9" letterSpacing="2.5" className="font-mono" fill="currentColor" stroke="none">
          <textPath href={`#circleBottom-${uid}`} startOffset="50%" textAnchor="middle">
            {sub}
          </textPath>
        </text>
        <circle cx="100" cy="46" r="1.6" fill="currentColor" stroke="none" />
        <circle cx="100" cy="154" r="1.6" fill="currentColor" stroke="none" />
        <path d="M 88,102 l 8,8 l 16,-18" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

function PaperGrain() {
  const uid = useId().replace(/[:]/g, "");
  return (
    <svg className="absolute inset-0 h-full w-full opacity-[0.035]" preserveAspectRatio="none">
      <filter id={`grain-${uid}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#grain-${uid})`} />
    </svg>
  );
}

/* The shop's view at checkout — a phone number and a purchase amount,
   points are calculated and added automatically. */
function CheckoutMockup() {
  return (
    <div className="w-full max-w-sm rounded-none border-2 border-black bg-white p-6 font-mono">
      <div className="flex items-start justify-between border-b border-zinc-300 pb-4">
        <div>
          <p className="text-xs tracking-widest text-zinc-500">AT THE COUNTER</p>
          <p className="mt-1 font-heading text-lg font-semibold tracking-tight">Riel Point</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
            <MapPin className="h-3 w-3" /> Phnom Penh
          </p>
        </div>
        <StampMark size={56} label="RIELPOINT" sub="STAFF VIEW" className="text-black" />
      </div>

      <div className="mt-5">
        <p className="text-xs tracking-widest text-zinc-500">CUSTOMER PHONE</p>
        <div className="mt-2 flex items-center gap-2 border-2 border-black px-3 py-2.5">
          <Phone className="h-4 w-4 shrink-0 text-zinc-500" />
          <span className="text-sm tracking-wide">012 xxx 456</span>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs tracking-widest text-zinc-500">PURCHASE AMOUNT</p>
        <div className="mt-2 flex items-center gap-2 border-2 border-black px-3 py-2.5">
          <span className="text-sm tracking-wide text-zinc-500">៛</span>
          <span className="text-sm tracking-wide">18,000</span>
        </div>
        <p className="mt-1.5 text-[11px] tracking-wide text-zinc-500">= 18 pts, added automatically</p>
      </div>

      <button className="stamp-press mt-4 w-full border-2 border-black bg-black py-2.5 text-xs uppercase tracking-widest text-white">
        Add points
      </button>

      <div className="mt-5 flex items-center justify-between border-t border-zinc-300 pt-4 text-xs">
        <span className="tracking-wide text-zinc-500">NO CARD OR APP NEEDED TO EARN</span>
        <span className="font-semibold text-black">482 pts</span>
      </div>
    </div>
  );
}

const BUSINESS_TYPES = [
  "Cafe & restaurant",
  "Retail & shop",
  "Salon & spa",
  "Convenience store",
  "Bar & bakery",
  "Other",
];


function MerchantSignUpForm() {
  const router = useRouter();
  const [form, setForm] = useState({ businessName: "", businessType: "", phone: "" });
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [needsAuth, setNeedsAuth] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.businessName || !form.businessType || !form.phone) return;

    setStatus("loading");
    setErrorMsg("");
    setNeedsAuth(false);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/merchant/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.businessName,
            contact_phone: form.phone,
            business_type: form.businessType,
          }),
        }
      );

      if (res.status === 201) {
        setStatus("success");
        return;
      }

      const data = await res.json().catch(() => ({}));

      if (res.status === 409) {
        setErrorMsg("A shop with this name already exists. Try a different name.");
      } else if (res.status === 400) {
        setErrorMsg("Please fill in your business name and phone number.");
      } else if (res.status === 401) {
        setErrorMsg("You need to be signed in to list a shop.");
        setNeedsAuth(true);
      } else {
        setErrorMsg(data.error || "Something went wrong. Please try again.");
      }
      setStatus("error");
    } catch (err) {
      setErrorMsg("Couldn't reach the server. Check your connection and try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="w-full max-w-md border-2 border-black bg-white p-8 text-center text-black">
        <Check className="mx-auto h-8 w-8" />
        <p className="mt-4 font-heading text-xl font-semibold tracking-tight">
          Got it, {form.businessName}.
        </p>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          We&apos;ll reach out to {form.phone} shortly to get your shop set up.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md border-2 border-black bg-white p-8 text-left text-black"
    >
      <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">List your shop</p>
      <h3 className="mt-2 font-heading text-2xl font-semibold tracking-tight">
        Tell us about your business.
      </h3>

      <div className="mt-6">
        <label htmlFor="businessName" className="font-mono text-xs uppercase tracking-widest text-zinc-500">
          Business name
        </label>
        <input
          id="businessName"
          type="text"
          required
          placeholder="Riel Point "
          value={form.businessName}
          onChange={update("businessName")}
          disabled={status === "loading"}
          className="mt-2 w-full border-2 border-black bg-white px-3 py-2.5 text-sm outline-none placeholder:text-zinc-400 focus:bg-zinc-50 disabled:opacity-50"
        />
      </div>

      <div className="mt-4">
        <label htmlFor="businessType" className="font-mono text-xs uppercase tracking-widest text-zinc-500">
          Business type
        </label>
        <select
          id="businessType"
          required
          value={form.businessType}
          onChange={update("businessType")}
          disabled={status === "loading"}
          className="mt-2 w-full border-2 border-black bg-white px-3 py-2.5 text-sm text-black outline-none focus:bg-zinc-50 disabled:opacity-50"
        >
          <option value="" disabled>
            Select a type
          </option>
          {BUSINESS_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <label htmlFor="phone" className="font-mono text-xs uppercase tracking-widest text-zinc-500">
          Phone number
        </label>
        <div className="mt-2 flex items-center gap-2 border-2 border-black px-3 py-2.5 focus-within:bg-zinc-50">
          <Phone className="h-4 w-4 shrink-0 text-zinc-500" />
          <input
            id="phone"
            type="tel"
            required
            placeholder="012 xxx 456"
            value={form.phone}
            onChange={update("phone")}
            disabled={status === "loading"}
            className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400 disabled:opacity-50"
          />
        </div>
      </div>

      {status === "error" && (
        <div className="mt-4 border-2 border-black bg-zinc-100 px-3 py-2 text-black">
          <p className="text-xs">{errorMsg}</p>
          {needsAuth && (
            <button
              type="button"
              onClick={() => router.push("/signup")}
              className="mt-2 flex items-center gap-2 border-2 border-black bg-black px-4 py-2 font-mono text-xs uppercase tracking-widest text-white hover:bg-zinc-800"
            >
              Sign up
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="stamp-press mt-6 flex w-full items-center justify-center gap-2 border-2 border-black bg-black px-6 py-3 font-mono text-xs uppercase tracking-widest text-white hover:bg-zinc-800 disabled:opacity-60"
      >
        {status === "loading" ? "Submitting..." : "Submit"}
        {status !== "loading" && <ArrowRight className="h-4 w-4" />}
      </button>
    </form>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-black">
      <style>{LOCAL_STYLES}</style>

      {/* NAV */}
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-zinc-50/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <StampMark size={34} className="text-black" />
            <span className="font-heading text-lg font-semibold tracking-tight">RielPoint</span>
          </div>
          <nav className="hidden items-center gap-8 font-mono text-xs uppercase tracking-wider text-zinc-600 md:flex">
            <a href="#how" className="hover:text-black">How it works</a>
            <a href="#why" className="hover:text-black">Why RielPoint</a>
            <a href="#pricing" className="hover:text-black">Pricing</a>
          </nav>
          <a
            href="#get-started"
            className="stamp-press rounded-none border-2 border-black bg-black px-4 py-2 font-mono text-xs uppercase tracking-wider text-white hover:bg-zinc-800"
          >
            List your shop
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-zinc-200 bg-zinc-50">
        <PaperGrain />
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
          <div className="relative">
            <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">
              Loyalty for Cambodian shops
            </p>
            <h1 className="mt-4 font-heading text-6xl font-semibold leading-[0.95] tracking-tight md:text-7xl">
              Ask for a number.
              <br />
              Give them points.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-8 text-zinc-600">
              RielPoint is loyalty software, not a punch card. Ask for your
              customer&apos;s phone number at checkout, enter the amount they
              spent, and points are added automatically — no card to find,
              no app to install first.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href="#get-started"
                className="stamp-press flex items-center justify-center gap-2 rounded-none border-2 border-black bg-black px-6 py-3 font-mono text-sm uppercase tracking-wider text-white hover:bg-zinc-800"
              >
                List your shop <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#how"
                className="stamp-press flex items-center justify-center gap-2 rounded-none border-2 border-black px-6 py-3 font-mono text-sm uppercase tracking-wider hover:bg-zinc-100"
              >
                See how it works
              </a>
            </div>

            <div className="mt-12 grid max-w-md grid-cols-3 gap-4 border-t border-zinc-300 pt-6 font-mono">
              <div>
                <p className="text-2xl font-semibold">10+</p>
                <p className="text-xs uppercase tracking-wider text-zinc-500">Shops</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">50K+</p>
                <p className="text-xs uppercase tracking-wider text-zinc-500">Points awarded</p>
              </div>
              {/* <div>
                <p className="text-2xl font-semibold">6</p>
                <p className="text-xs uppercase tracking-wider text-zinc-500">Cities</p>
              </div> */}
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <StampMark
              size={300}
              className="pointer-events-none rotate-[-9deg] text-black opacity-90 md:absolute md:-right-6 md:top-2"
            />
            <StampMark
              size={300}
              className="pointer-events-none absolute rotate-[-9deg] text-zinc-300 opacity-60 md:right-[15px] md:top-[26px]"
            />
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="overflow-hidden border-b border-zinc-800 bg-black py-4">
        <div className="flex whitespace-nowrap">
          <div className="animate-marquee flex shrink-0 items-center gap-10 pr-10 font-mono text-sm uppercase tracking-widest text-zinc-400">
            {[...SHOPS, ...SHOPS].map((s, i) => (
              <span key={i} className="flex items-center gap-10">
                {s}
                <span className="text-zinc-700">•</span>
              </span>
            ))}
          </div>
          <div
            aria-hidden
            className="animate-marquee flex shrink-0 items-center gap-10 pr-10 font-mono text-sm uppercase tracking-widest text-zinc-400"
          >
            {[...SHOPS, ...SHOPS].map((s, i) => (
              <span key={i} className="flex items-center gap-10">
                {s}
                <span className="text-zinc-700">•</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="border-b border-zinc-200 bg-zinc-50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">How it works</p>
          <h2 className="mt-3 max-w-lg font-heading text-4xl font-semibold tracking-tight md:text-5xl">
            You run the counter. We run the points.
          </h2>

          <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3">
            {[
              {
                n: "01",
                t: "Ask",
                d: "At checkout, ask for your customer's phone number. No app, signup, or card is needed to start earning.",
              },
              {
                n: "02",
                t: "Enter the amount",
                d: "Type in what they spent. Points are calculated and added to their balance automatically, based on your rate.",
              },
              {
                n: "03",
                t: "Bring them back",
                d: "When they're ready, customers create an account to check their balance and redeem points — and keep coming back.",
              },
            ].map((step) => (
              <div key={step.n} className="border-t-2 border-black pt-6">
                <span className="font-mono text-sm text-zinc-400">{step.n}</span>
                <h3 className="mt-3 font-heading text-2xl font-semibold">{step.t}</h3>
                <p className="mt-3 leading-7 text-zinc-600">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SPLIT PANEL */}
      <section id="why" className="grid grid-cols-1 border-b border-zinc-200 md:grid-cols-2">
        <div className="bg-black px-6 py-20 text-white md:px-12">
          <p className="font-mono text-xs uppercase tracking-widest text-zinc-400">For your shop</p>
          <h3 className="mt-3 font-heading text-3xl font-semibold tracking-tight">
            Loyalty without the overhead.
          </h3>
          <ul className="mt-8 space-y-4">
            {[
              "No cards to print, laminate, or restock — and no punches to fake",
              "Set your own points rate, so rewards scale with what customers actually spend",
              "No POS integration — works from any phone or tablet you already have",
              "See who's coming back, how often, and who's about to churn",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-zinc-300">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-white" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white px-6 py-20 text-black md:px-12">
          <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">For your customers</p>
          <h3 className="mt-3 font-heading text-3xl font-semibold tracking-tight">
            Zero friction to earn, one login to claim.
          </h3>
          <ul className="mt-8 space-y-4">
            {[
              "Nothing to install just to start earning points",
              "Their number is their account — points build up automatically",
              "They create a free account only when they're ready to check their balance or redeem",
              "One wallet for every shop they visit, once they're in",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-zinc-700">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-black" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CHECKOUT SHOWCASE */}
      <section className="border-b border-zinc-200 bg-zinc-50 py-24">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-6 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">What it looks like behind the counter</p>
          <h2 className="mt-3 max-w-lg font-heading text-4xl font-semibold tracking-tight md:text-5xl">
            One number, one amount, done.
          </h2>
          <div className="mt-12">
            <CheckoutMockup />
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="border-b border-zinc-200 bg-zinc-50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">Pricing</p>
          <h2 className="mt-3 max-w-lg font-heading text-4xl font-semibold tracking-tight md:text-5xl">
            One rate. No hidden fees.
          </h2>

          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Basic */}
            <div className="flex flex-col border-2 border-black bg-white p-8">
              <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">Basic</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-heading text-5xl font-semibold tracking-tight">$5</span>
                <span className="font-mono text-sm text-zinc-500">/ month</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                Everything one shop needs to start rewarding regulars.
              </p>
              <ul className="mt-8 flex-1 space-y-3">
                {[
                  "1 store",
                  "Unlimited customers",
                  "Points on every purchase",
                  "Customer lookup by phone number",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-zinc-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-black" />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="#get-started"
                className="stamp-press mt-8 flex items-center justify-center border-2 border-black px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-zinc-100"
              >
                List your shop
              </a>
            </div>

            {/* Multiple stores */}
            <div className="flex flex-col border-2 border-black bg-black p-8 text-white">
              <p className="font-mono text-xs uppercase tracking-widest text-zinc-400">Multiple stores</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-heading text-5xl font-semibold tracking-tight">$50</span>
                <span className="font-mono text-sm text-zinc-400">/ month</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                For chains and franchises tracking loyalty across locations.
              </p>
              <ul className="mt-8 flex-1 space-y-3">
                {[
                  "Up to 10 stores",
                  "Shared points balance across all locations",
                  "Per-store and combined reporting",
                  "Staff accounts with store-level access",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-zinc-300">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-white" />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="#get-started"
                className="stamp-press mt-8 flex items-center justify-center border-2 border-white bg-white px-6 py-3 font-mono text-xs uppercase tracking-widest text-black hover:bg-zinc-200"
              >
                List your shops
              </a>
            </div>

            {/* Enterprise */}
            <div className="flex flex-col border-2 border-black bg-white p-8">
              <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">Enterprise</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-heading text-5xl font-semibold tracking-tight">Contact</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                For large networks with custom needs and volume.
              </p>
              <ul className="mt-8 flex-1 space-y-3">
                {[
                  "White label loyalty program",
                  "Unlimited stores",
                  "Custom points rules and integrations",
                  "Dedicated support",
                  "Custom contract and invoicing",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-zinc-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-black" />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="#"
                className="stamp-press mt-8 flex items-center justify-center border-2 border-black px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-zinc-100"
              >
                Talk to our team
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section id="get-started" className="relative overflow-hidden bg-black py-24 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-6 text-center">
          <StampMark size={120} className="text-white opacity-80" />
          <h2 className="mt-8 font-heading text-4xl font-semibold tracking-tight md:text-5xl">
            Stop printing cards.
            <br />
            Start rewarding every riel.
          </h2>
          <p className="mt-4 max-w-md text-zinc-400">
            Free to start. No hardware, no contract, no POS integration.
          </p>
          <div className="mt-10 flex justify-center">
            <MerchantSignUpForm />
          </div>
          <a
            href="#"
            className="mt-6 font-mono text-xs uppercase tracking-widest text-zinc-400 hover:text-white"
          >
            Prefer to talk first? Contact our team →
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-zinc-50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
            <div className="col-span-2">
              <div className="flex items-center gap-2">
                <StampMark size={30} className="text-black" />
                <span className="font-heading text-base font-semibold">RielPoint</span>
              </div>
              <p className="mt-4 max-w-xs text-sm text-zinc-500">
                Points-based loyalty software for shops across Cambodia.
              </p>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">Product</p>
              <ul className="mt-4 space-y-2 text-sm text-zinc-600">
                <li><a href="#how" className="hover:text-black">How it works</a></li>
                <li><a href="#why" className="hover:text-black">Why RielPoint</a></li>
                <li><a href="#pricing" className="hover:text-black">Pricing</a></li>
              </ul>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">Company</p>
              <ul className="mt-4 space-y-2 text-sm text-zinc-600">
                <li><a href="#" className="hover:text-black">About</a></li>
                <li><a href="#" className="hover:text-black">Contact</a></li>
                <li><a href="#" className="hover:text-black">Careers</a></li>
              </ul>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">Legal</p>
              <ul className="mt-4 space-y-2 text-sm text-zinc-600">
                <li><a href="#" className="hover:text-black">Privacy</a></li>
                <li><a href="#" className="hover:text-black">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-zinc-200 pt-8 font-mono text-xs text-zinc-500 md:flex-row">
            <span>© 2026 RielPoint. Made in Phnom Penh.</span>
            <span>Telegram · Instagram</span>
          </div>
        </div>
      </footer>
    </div>
  );
}