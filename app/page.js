"use client";

import React, { useId, useState } from "react";
import {
  ArrowRight,
  Check,
  Coffee,
  UtensilsCrossed,
  BedDouble,
  Scissors,
  ShoppingBag,
  Phone,
} from "lucide-react";

import Image from "next/image";
import MerchantSignUpForm from "./Components/merchantSignUpForm";
import Link from "next/link";
import NavHeader from "./Components/header";



const LOCAL_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

:root {
  --ink: #121212;
  --paper: #FFFFFF;
  --paper-dim: #ECECEA;
}

.font-display { font-family: 'Fraunces', ui-serif, Georgia, serif; font-optical-sizing: auto; }
.font-body { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
.font-tape { font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace; }

@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.animate-marquee { animation: marquee 30s linear infinite; }

.press { transition: transform 120ms ease, box-shadow 120ms ease; }
.press:active { transform: translateY(2px); }
`;

const VENUES = [
  "Sam's Cafe & Restaurant",
  "Anise Hotel & Suites",
  "Emart24",
  "Kravanh Spa",
  "Number 21",
  "Toto by Chichi",
];

const VENUE_TYPES = [
  { icon: Coffee, label: "Coffee shops", note: "Points on every cup" },
  { icon: UtensilsCrossed, label: "Restaurants & bars", note: "Points on every table" },
  { icon: BedDouble, label: "Hotels & guesthouses", note: "Points on every stay" },
  { icon: Scissors, label: "Salons & spas", note: "Points on every visit" },
  { icon: ShoppingBag, label: "Retail & shops", note: "Points on every sale" },
];

/* Zigzag "torn paper" bottom edge, generated once. */
function tornEdgeClipPath(teeth = 22, depth = 7) {
  const pts = ["0% 0%", "100% 0%", "100% 100%"];
  const step = 100 / teeth;
  for (let i = 1; i <= teeth; i++) {
    const x = 100 - i * step;
    const y = i % 2 === 1 ? 100 - depth : 100;
    pts.push(`${x.toFixed(2)}% ${y}%`);
  }
  return `polygon(${pts.join(", ")})`;
}
const TORN_BOTTOM = tornEdgeClipPath();

function Perforation({ count = 18, className = "" }) {
  return (
    <div className={`flex justify-between ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="h-2 w-2 shrink-0 rounded-full ring-1 ring-inset ring-[var(--ink)]/25" />
      ))}
    </div>
  );
}

/* A dot-leader row, the way a menu or receipt lines up a label and a value. */
function LedgerRow({ label, value, strong = false }) {
  return (
    <div className="flex items-baseline gap-2 py-1.5">
      <span
        className={`whitespace-nowrap text-[10px] uppercase tracking-[0.14em] ${
          strong ? "font-semibold text-[var(--ink)]" : "text-[var(--ink)]/55"
        }`}
      >
        {label}
      </span>
      <span className="mb-[3px] flex-1 border-b border-dotted border-[var(--ink)]/30" />
      <span
        className={`whitespace-nowrap font-tape text-[13px] ${
          strong ? "font-semibold text-[var(--ink)]" : "text-[var(--ink)]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function PaperGrain({ className = "" }) {
  const uid = useId().replace(/[:]/g, "");
  return (
    <svg className={`pointer-events-none absolute inset-0 h-full w-full opacity-[0.04] ${className}`} preserveAspectRatio="none">
      <filter id={`grain-${uid}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#grain-${uid})`} />
    </svg>
  );
}

/* Small wordmark tile — a hole-punch dot stands in for the old ink stamp. */
function Mark({ size = 34, dark = false }) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative flex shrink-0 items-center justify-center rounded-[7px] font-tape text-[11px] tracking-tight ${
        dark ? "bg-[var(--paper)] text-[var(--ink)]" : "bg-[var(--ink)] text-[var(--paper)]"
      }`}
    >
      RP
      <span
        className={`absolute -right-1 -top-1 h-2 w-2 rounded-full ring-2 ring-[var(--paper)] ${
          dark ? "bg-[var(--ink)]" : "bg-[var(--paper)]"
        }`}
      />
    </div>
  );
}


const MOCKUP_DISCOUNTS = [
  { type: "percent", value: 15, points: 500 },
  { type: "amount", value: 5, points: 500 },
];

function formatMockupDiscount(discount) {
  return discount.type === "percent" ? `${discount.value}% off` : `-$${discount.value} on everything`;
}

function VerifyCouponMockup() {
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [result, setResult] = useState(null);

  const handleVerify = () => {
    if (!otp.trim() || status === "loading") return;
    setStatus("loading");
    // Demo only — simulated delay, no request is ever sent.
    setTimeout(() => {
      const discount = MOCKUP_DISCOUNTS[Math.floor(Math.random() * MOCKUP_DISCOUNTS.length)];
      setResult({ ...discount, customerPhone: "012 xxx 456" });
      setStatus("success");
    }, 600);
  };

  const handleReset = () => {
    setOtp("");
    setStatus("idle");
    setResult(null);
  };

  return (
    <div className="w-full max-w-sm overflow-hidden border border-[var(--ink)]/15 bg-[var(--paper)] shadow-[0_25px_60px_-25px_rgba(33,29,26,0.5)]">
      {/* Fake browser chrome so it reads as "a screen", not a live form */}
      <div className="flex items-center gap-1.5 border-b border-[var(--ink)]/10 bg-[var(--paper-dim)] px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--ink)]/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--ink)]/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--ink)]/20" />
        <span className="ml-3 flex-1 truncate rounded-full bg-[var(--paper)] px-3 py-1 font-tape text-[10px] text-[var(--ink)]/40">
          app.rielpoint.com/merchant/verify
        </span>
      </div>

      <div className="px-5 py-6 font-body text-[var(--ink)]">
        <p className="mb-4 font-tape text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink)]/40">
          Try it — demo only
        </p>

        {status !== "success" ? (
          <>
            <label className="mb-1 block text-[11px] font-medium text-[var(--ink)]/55">
              Code from guest&apos;s phone
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              placeholder="6-digit code"
              className="mb-5 w-full border border-[var(--ink)]/20 bg-white px-3 py-2.5 text-center font-tape text-lg tracking-[0.3em] text-[var(--ink)] outline-none focus:border-[var(--ink)]"
            />

            <button
              type="button"
              onClick={handleVerify}
              disabled={status === "loading" || !otp.trim()}
              className="press w-full bg-[var(--ink)] py-2.5 font-tape text-xs uppercase tracking-[0.18em] text-[var(--paper)] hover:opacity-90 disabled:opacity-60"
            >
              {status === "loading" ? "Verifying..." : "Verify coupon"}
            </button>
          </>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <span className="flex items-center gap-1.5 border border-[var(--ink)] px-2.5 py-1 font-tape text-[10px] font-bold uppercase tracking-wide">
                <Check className="h-3 w-3" /> Redeemed
              </span>
              <button type="button" onClick={handleReset} className="text-[11px] text-[var(--ink)]/55 hover:text-[var(--ink)]">
                Try again
              </button>
            </div>
            <LedgerRow label="Discount" value={formatMockupDiscount(result)} strong />
            <LedgerRow label="Guest" value={result.customerPhone} />
            <div className="my-2 border-t border-dashed border-[var(--ink)]/25" />
            <LedgerRow label="Points cost" value={`${result.points.toLocaleString()} pts`} strong />
          </>
        )}

        <p className="mt-5 text-center font-tape text-[9px] uppercase tracking-wide text-[var(--ink)]/30">
          Demo only — no coupon is actually redeemed
        </p>
      </div>
    </div>
  );
}


const MOCKUP_RATE_OPTIONS = [10, 25, 50];
const MOCKUP_KHR_PER_USD = 4001;

function AddPointsMockup() {
  const [phone, setPhone] = useState("012 xxx 456");
  const [amount, setAmount] = useState("18");
  const [currency, setCurrency] = useState("USD");
  const [rate, setRate] = useState(10);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const numericAmount = Number(amount) || 0;
  const usdAmount = currency === "USD" ? numericAmount : numericAmount / MOCKUP_KHR_PER_USD;
  const points = Math.max(0, Math.round(usdAmount * rate * 10));

  const handleCredit = () => {
    if (loading || submitted) return;
    setLoading(true);
    // Demo only — simulated delay, no request is ever sent.
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  const handleReset = () => {
    setSubmitted(false);
    setLoading(false);
  };

  return (
    <div className="w-full max-w-sm overflow-hidden border border-[var(--ink)]/15 bg-[var(--paper)] shadow-[0_25px_60px_-25px_rgba(33,29,26,0.5)]">
      {/* Fake browser chrome so it reads as "a screen", not a live form */}
      <div className="flex items-center gap-1.5 border-b border-[var(--ink)]/10 bg-[var(--paper-dim)] px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--ink)]/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--ink)]/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--ink)]/20" />
        <span className="ml-3 flex-1 truncate rounded-full bg-[var(--paper)] px-3 py-1 font-tape text-[10px] text-[var(--ink)]/40">
          app.rielpoint.com/merchant/points
        </span>
      </div>

      <div className="px-5 py-6 font-body text-[var(--ink)]">
        <p className="mb-4 font-tape text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink)]/40">
          Try it — demo only
        </p>

        {!submitted ? (
          <>
            <label className="mb-1 block text-[11px] font-medium text-[var(--ink)]/55">Phone number</label>
         <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mb-4 w-full border border-[var(--ink)]/20 bg-white px-3 py-2 font-tape text-base text-[var(--ink)] outline-none focus:border-[var(--ink)]"
            />
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-[11px] font-medium text-[var(--ink)]/55">Total amount ({currency})</label>
              <div className="flex gap-1 rounded-md bg-[var(--paper-dim)] p-0.5 text-[10px] font-medium">
                {["USD", "KHR"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCurrency(c)}
                    className={`rounded px-2 py-1 transition-colors ${
                      currency === c ? "bg-[var(--ink)] font-semibold text-[var(--paper)]" : "text-[var(--ink)]/55"
                    }`}
                  >
                    {c === "USD" ? "$ USD" : "៛ KHR"}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              className="mb-4 w-full border border-[var(--ink)]/20 bg-white px-3 py-2 font-tape text-sm text-[var(--ink)] outline-none focus:border-[var(--ink)]"
            />

            <label className="mb-1.5 block text-[11px] font-medium text-[var(--ink)]/55">Points rate</label>
            <div className="mb-4 flex gap-1.5">
              {MOCKUP_RATE_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setRate(option)}
                  className={`flex-1 border py-1.5 text-xs font-semibold transition-colors ${
                    rate === option
                      ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]"
                      : "border-[var(--ink)]/20 text-[var(--ink)]/55"
                  }`}
                >
                  {option}%
                </button>
              ))}
            </div>

            <div className="mb-4 flex items-center justify-between border border-[var(--ink)]/15 bg-[var(--paper-dim)] px-3 py-2.5">
              <span className="text-[11px] text-[var(--ink)]/55">Points to credit</span>
              <span className="font-tape text-sm font-semibold">{points.toLocaleString()} pts</span>
            </div>

            <button
              type="button"
              onClick={handleCredit}
              disabled={loading}
              className="press w-full bg-[var(--ink)] py-2.5 font-tape text-xs uppercase tracking-[0.18em] text-[var(--paper)] hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Crediting..." : "Credit points"}
            </button>
          </>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <span className="flex items-center gap-1.5 border border-[var(--ink)] px-2.5 py-1 font-tape text-[10px] font-bold uppercase tracking-wide">
                <Check className="h-3 w-3" /> Credited
              </span>
              <button type="button" onClick={handleReset} className="text-[11px] text-[var(--ink)]/55 hover:text-[var(--ink)]">
                Try again
              </button>
            </div>
            <LedgerRow label="Phone" value={phone || "—"} />
            <LedgerRow label="Amount" value={`${currency === "USD" ? "$" : "៛"}${amount || 0}`} />
            <LedgerRow label="Rate" value={`${rate}%`} />
            <div className="my-2 border-t border-dashed border-[var(--ink)]/25" />
            <LedgerRow label="Earned" value={`+${points.toLocaleString()} pts`} strong />
          </>
        )}

        <p className="mt-5 text-center font-tape text-[9px] uppercase tracking-wide text-[var(--ink)]/30">
          Demo only — no points are actually added
        </p>
      </div>
    </div>
  );
}




const MOCKUP_DISCOUNT_TYPES = {
  percent: { label: "% off", format: (v) => `${v}% off` },
  amount: { label: "$ off", format: (v) => `-$${v} on everything` },
  custom: {
    label: "Custom",
    format: (perk) => (perk && perk.trim() ? perk.trim() : "Custom perk"),
  },
};

function mockupExpiryDate(days = 30) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function AddCouponMockup() {
  const [title, setTitle] = useState("15% off your order");
  const [discountType, setDiscountType] = useState("percent");
  const [discountValue, setDiscountValue] = useState("15");
  const [customPerk, setCustomPerk] = useState("");
  const [expiresAt, setExpiresAt] = useState(mockupExpiryDate());
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const needsValue = discountType !== "custom";
  const previewLabel = needsValue
    ? MOCKUP_DISCOUNT_TYPES[discountType].format(discountValue || "—")
    : MOCKUP_DISCOUNT_TYPES.custom.format(customPerk);

  const handleCreate = () => {
    if (loading || submitted) return;
    setLoading(true);
    // Demo only — simulated delay, no request is ever sent.
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  const handleReset = () => {
    setSubmitted(false);
    setLoading(false);
  };

  return (
    <div className="w-full max-w-sm overflow-hidden border border-[var(--ink)]/15 bg-[var(--paper)] shadow-[0_25px_60px_-25px_rgba(33,29,26,0.5)]">
      {/* Fake browser chrome so it reads as "a screen", not a live form */}
      <div className="flex items-center gap-1.5 border-b border-[var(--ink)]/10 bg-[var(--paper-dim)] px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--ink)]/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--ink)]/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--ink)]/20" />
        <span className="ml-3 flex-1 truncate rounded-full bg-[var(--paper)] px-3 py-1 font-tape text-[10px] text-[var(--ink)]/40">
          app.rielpoint.com/merchant/coupons/new
        </span>
      </div>

      <div className="px-5 py-6 font-body text-[var(--ink)]">
        <p className="mb-4 font-tape text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink)]/40">
          Try it — demo only
        </p>

        {!submitted ? (
          <>
            <label className="mb-1 block text-[11px] font-medium text-[var(--ink)]/55">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="15% off your order"
              className="mb-4 w-full border border-[var(--ink)]/20 bg-white px-3 py-2 font-tape text-sm text-[var(--ink)] outline-none focus:border-[var(--ink)]"
            />

            <label className="mb-1.5 block text-[11px] font-medium text-[var(--ink)]/55">Discount type</label>
            <div className="mb-4 flex gap-1.5">
              {Object.entries(MOCKUP_DISCOUNT_TYPES).map(([key, { label }]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setDiscountType(key);
                    if (key === "custom") setDiscountValue("");
                  }}
                  className={`flex-1 border py-1.5 text-[11px] font-semibold transition-colors ${
                    discountType === key
                      ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]"
                      : "border-[var(--ink)]/20 text-[var(--ink)]/55"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {needsValue ? (
              <>
                <label className="mb-1 block text-[11px] font-medium text-[var(--ink)]/55">
                  {discountType === "percent" ? "Percent off" : "Amount off ($)"}
                </label>
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  min="0"
                  className="mb-4 w-full border border-[var(--ink)]/20 bg-white px-3 py-2 font-tape text-sm text-[var(--ink)] outline-none focus:border-[var(--ink)]"
                />
              </>
            ) : (
              <>
                <label className="mb-1 block text-[11px] font-medium text-[var(--ink)]/55">Perk</label>
                <input
                  type="text"
                  value={customPerk}
                  onChange={(e) => setCustomPerk(e.target.value)}
                  placeholder="1 Free Lucky Draw"
                  className="mb-4 w-full border border-[var(--ink)]/20 bg-white px-3 py-2 font-tape text-sm text-[var(--ink)] outline-none focus:border-[var(--ink)]"
                />
              </>
            )}

            <label className="mb-1 block text-[11px] font-medium text-[var(--ink)]/55">Expires</label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="mb-4 w-full border border-[var(--ink)]/20 bg-white px-3 py-2 font-tape text-sm text-[var(--ink)] outline-none focus:border-[var(--ink)]"
            />

            <div className="mb-4 border border-[var(--ink)]/15 bg-[var(--paper-dim)] px-3 py-2.5">
              <p className="font-tape text-[10px] uppercase tracking-wide text-[var(--ink)]/45">Preview</p>
              <p className="mt-1 text-sm font-semibold">{title || "Untitled coupon"}</p>
              <p className="mt-0.5 font-tape text-[11px] text-[var(--ink)]/55">{previewLabel}</p>
            </div>

            <button
              type="button"
              onClick={handleCreate}
              disabled={loading || !title.trim()}
              className="press w-full bg-[var(--ink)] py-2.5 font-tape text-xs uppercase tracking-[0.18em] text-[var(--paper)] hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create coupon"}
            </button>
          </>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <span className="flex items-center gap-1.5 border border-[var(--ink)] px-2.5 py-1 font-tape text-[10px] font-bold uppercase tracking-wide">
                <Check className="h-3 w-3" /> Created
              </span>
              <button type="button" onClick={handleReset} className="text-[11px] text-[var(--ink)]/55 hover:text-[var(--ink)]">
                Try again
              </button>
            </div>
            <LedgerRow label="Title" value={title} strong />
            <LedgerRow label="Discount" value={previewLabel} />
            <div className="my-2 border-t border-dashed border-[var(--ink)]/25" />
            <LedgerRow label="Expires" value={expiresAt} strong />
          </>
        )}

        <p className="mt-5 text-center font-tape text-[9px] uppercase tracking-wide text-[var(--ink)]/30">
          Demo only — no coupon is actually created
        </p>
      </div>
    </div>
  );
}

/* Updated CheckoutTabs with three tabs instead of two */
function CheckoutTabs({defaultTab='coupon'}) {
  const [tab, setTab] = useState(defaultTab); // "points" | "coupon" | "add-coupon"

  const TABS = [
    { key: "points", label: "Add points" },
    { key: "coupon", label: "Verify coupon" },
    { key: "add-coupon", label: "Add coupon" },
  ];

  return (
    <div className="mt-12 flex flex-col items-center ">
     <div className="mb-6 flex gap-1 overflow-x-auto bg-[var(--paper)] p-0.5 font-tape text-[9px] uppercase tracking-[0.1em] shadow-[0_2px_10px_-4px_rgba(33,29,26,0.3)] sm:text-[10px] sm:tracking-[0.18em]">
  {TABS.map(({ key, label }) => (
    <button
      key={key}
      type="button"
      onClick={() => setTab(key)}
      className={`shrink-0 whitespace-nowrap px-2.5 py-2 transition-colors sm:px-4 ${
        tab === key ? "bg-[var(--ink)] font-semibold text-[var(--paper)]" : "text-[var(--ink)]/55"
      }`}
    >
      {label}
    </button>
  ))}
</div>


      <div className="grid w-full max-w-sm place-items-start justify-items-center">
        <div
          className={`col-start-1 row-start-1 w-full ${tab === "points" ? "visible opacity-100" : "invisible opacity-0"}`}
          aria-hidden={tab !== "points"}
        >
          <AddPointsMockup />
        </div>
        <div
          className={`col-start-1 row-start-1 w-full ${tab === "coupon" ? "visible opacity-100" : "invisible opacity-0"}`}
          aria-hidden={tab !== "coupon"}
        >
          <VerifyCouponMockup />
        </div>
        <div
          className={`col-start-1 row-start-1 w-full ${tab === "add-coupon" ? "visible opacity-100" : "invisible opacity-0"}`}
          aria-hidden={tab !== "add-coupon"}
        >
          <AddCouponMockup />
        </div>
      </div>
    </div>
  );
}

const TESTIMONIALS = [
  { quote: "Guests just give their number now — no more reprinting stamp cards.", venue: "Café owner, Phnom Penh" },
  { quote: "Front desk adds points in seconds, no extra hardware.", venue: "Hotel manager, Phnom Penh" },
  { quote: "Regulars come back for the discount, we come back to the reports.", venue: "Spa owner, Phnom Penh" },
  { quote: "Set up in an afternoon, no POS integration needed.", venue: "Restaurant owner, Phnom Penh" },
  { quote: "One phone number, one wallet — customers love how simple it is.", venue: "Retail owner, Phnom Penh" },
];
export default function Home() {
  return (
    <div className="font-body flex min-h-screen w-full flex-col overflow-x-hidden bg-[var(--paper)] text-[var(--ink)]">
      <style>{LOCAL_STYLES}</style>

      {/* NAV */}
  <NavHeader/>

      {/* HERO */}
      <section className="relative overflow-hidden border-b pb-12">
        <PaperGrain />
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
          <div>
            <p className="font-tape text-xs uppercase tracking-[0.22em] text-[var(--ink)]/55">
              Loyalty Software for Cambodian hospitality & retail
            </p>
            <h1 className="mt-4 font-display text-5xl font-semibold leading-[0.98] tracking-tight md:text-7xl">
              Reward your customers.
              <br />
              Keep them loyal.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-8 text-[var(--ink)]/70">
              RielPoint turns any checkout, any front desk, into a loyalty
              program. Take a phone number, enter what was spent, and points
              are added automatically — whether it&apos;s a coffee, a room, or a
              haircut.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href="#get-started"
                className="rounded-md press flex items-center justify-center gap-2 bg-[var(--ink)] px-6 py-3 font-tape text-sm uppercase tracking-wider text-[var(--paper)] hover:opacity-90"
              >
                List your business <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#how"
                className="rounded-md press flex items-center justify-center gap-2 border border-[var(--ink)]/25 px-6 py-3 font-tape text-sm uppercase tracking-wider hover:border-[var(--ink)]"
              >
                See how it works
              </a>
            </div>

            <div className="mt-12 grid max-w-md grid-cols-3 gap-4 border-t border-[var(--ink)]/15 pt-6 font-tape">
              <div>
                <p className="text-2xl font-semibold">30+</p>
                <p className="text-xs uppercase tracking-wider text-[var(--ink)]/50">Businesses</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">50K+</p>
                <p className="text-xs uppercase tracking-wider text-[var(--ink)]/50">Points awarded</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">5</p>
                <p className="text-xs uppercase tracking-wider text-[var(--ink)]/50">Venue types</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-end">
        
            <CheckoutTabs defaultTab="points"/>
            {/* <LedgerReceipt /> */}
          </div>
        </div>
      </section>
      {/* MARQUEE */}
      {/* <section className="overflow-hidden border-b border-[var(--ink)]/10 bg-[var(--ink)] py-6">
        <div className="flex whitespace-nowrap">
          {[0, 1].map((pass) => (
            <div
              key={pass}
              aria-hidden={pass === 1}
              className="animate-marquee flex shrink-0 items-stretch gap-6 pr-6"
            >
              {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                <div
                  key={i}
                  className="flex w-[340px] shrink-0 flex-col justify-between whitespace-normal border border-[var(--paper)]/15 bg-[var(--paper)]/[0.04] px-5 py-4"
                >
                  <p className="font-display text-[15px] leading-6 text-[var(--paper)]/90">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <p className="mt-3 font-tape text-[10px] uppercase tracking-[0.18em] text-[var(--paper)]/45">
                    {t.venue}
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section> */}
    

      {/* HOW IT WORKS */}
<section id="how" className="border-b border-[var(--ink)]/10 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <p className="font-tape text-xs uppercase tracking-[0.22em] text-[var(--ink)]/55">How it works</p>
          <h2 className="mt-3 max-w-lg font-display text-4xl font-semibold tracking-tight md:text-5xl">
            You run the counter. We run the ledger.
          </h2>

          <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-2 md:items-center md:gap-16">
            {/* Steps container: Default (mobile) order is 1, desktop order remains md:order-1 */}
            <div className="order-1 divide-y divide-dashed divide-[var(--ink)]/25 border-y border-dashed border-[var(--ink)]/25 md:order-1">
              {[
                {
                  t: "Ask for a number",
                  d: "At checkout, at the front desk, or table-side — ask for your guest's phone number. No app or card needed to start earning.",
                },
                {
                  t: "Enter what they spent",
                  d: "Type in the amount. Points are calculated and added to their balance automatically, based on the rate you set.",
                },
                {
                  t: "Watch them come back",
                  d: "When they're ready, guests create a free account to check their balance and redeem — and to keep choosing you.",
                },
              ].map((step) => (
                <div key={step.t} className="flex flex-col gap-2 py-6 sm:flex-row sm:items-baseline sm:gap-8">
                  <h3 className="w-48 shrink-0 font-display text-xl font-semibold">{step.t}</h3>
                  <p className="leading-7 text-[var(--ink)]/70">{step.d}</p>
                </div>
              ))}
            </div>

            {/* CheckoutTabs container: Default (mobile) order is 2, desktop order remains md:order-2 */}
            <div className="order-2 flex justify-center md:order-2 md:justify-end">
              <CheckoutTabs defaultTab="points"/>
            </div>
          </div>
        </div>
      </section>

      {/* SPLIT PANEL */}
      <section className="grid grid-cols-1 border-b border-[var(--ink)]/10 md:grid-cols-2">
        <div className="bg-[var(--ink)] px-6 py-20 text-[var(--paper)] md:px-12">
          <p className="font-tape text-xs uppercase tracking-[0.22em] text-[var(--paper)]/55">For your business</p>
          <h3 className="mt-3 font-display text-3xl font-semibold tracking-tight">Loyalty without the overhead.</h3>
          <ul className="mt-8 space-y-4">
            {[
              "No cards to print, laminate, or restock — nothing to fake or lose",
              "Set your own points rate, so rewards scale with what guests actually spend",
              "No POS integration — works from any phone or tablet you already have",
              "See who's coming back, how often, and who's about to churn",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-[var(--paper)]/75">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-[var(--paper)]" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-[var(--paper-dim)] px-6 py-20 text-[var(--ink)] md:px-12">
          <p className="font-tape text-xs uppercase tracking-[0.22em] text-[var(--ink)]/55">For your guests</p>
          <h3 className="mt-3 font-display text-3xl font-semibold tracking-tight">
            Zero friction to earn, one login to claim.
          </h3>
          <ul className="mt-8 space-y-4">
            {[
              "Nothing to install just to start earning points",
              "Their number is their account — points build up automatically",
              "They create a free account only when they're ready to check their balance or redeem",
              "One wallet for every business they visit, once they're in",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-[var(--ink)]/75">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-[var(--ink)]" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* VENUE TYPES */}
      <section id="venues" className="border-b border-[var(--ink)]/10 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <p className="font-tape text-xs uppercase tracking-[0.22em] text-[var(--ink)]/55">Who it&apos;s for</p>
          <h2 className="mt-3 max-w-lg font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Built for every kind of counter.
          </h2>
          <p className="mt-4 max-w-lg text-[var(--ink)]/65">
            One ledger, however guests pay you — by the cup, the table, the
            night, or the visit.
          </p>

          <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {VENUE_TYPES.map(({ icon: Icon, label, note }) => (
              <div key={label} className="flex flex-col gap-3 border border-[var(--ink)]/15 bg-[var(--paper)] p-5">
                <Icon className="h-6 w-6 text-[var(--ink)]" strokeWidth={1.75} />
                <div>
                  <p className="font-display text-base font-semibold leading-tight">{label}</p>
                  <p className="mt-1 font-tape text-[10px] uppercase tracking-wide text-[var(--ink)]/45">{note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CHECKOUT SHOWCASE */}
      <section className="border-b border-[var(--ink)]/10 bg-[var(--paper-dim)] py-24">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-6 text-center">
          <p className="font-tape text-xs uppercase tracking-[0.22em] text-[var(--ink)]/55">Keep your customer loyal</p>
          <h2 className="mt-3 max-w-lg font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Customize your rewards.
          </h2>
          <div className="mt-12">
              <CheckoutTabs defaultTab="add-coupon" />
          </div>
        </div>
      </section>

      {/* PRICING */}
    <section id="pricing" className="border-b border-[var(--ink)]/10 py-24">
  <div className="mx-auto max-w-6xl px-6">
    <p className="font-tape text-xs uppercase tracking-[0.22em] text-[var(--ink)]/55">Pricing</p>
    <h2 className="mt-3 max-w-lg font-display text-4xl font-semibold tracking-tight md:text-5xl">
      One rate. No hidden fees.
    </h2>

    <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
      {/* Basic */}
      <div className="flex flex-col border border-[var(--ink)]/15 bg-[var(--paper)] p-8">
        <p className="font-tape text-[10px] uppercase tracking-[0.22em] text-[var(--ink)]/50">Basic</p>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="font-tape text-lg text-[var(--ink)]/40 line-through">$15</span>
          <span className="font-display text-5xl font-semibold tracking-tight">$10</span>
          <span className="font-tape text-sm text-[var(--ink)]/50">/ month</span>
        </div>
        <p className="mt-1 font-tape text-[10px] uppercase tracking-[0.18em] text-emerald-700">
          Save 33% — limited time
        </p>

        <p className="mt-3 text-sm leading-6 text-[var(--ink)]/65">
          Everything one location needs to start rewarding regulars.
        </p>
        <ul className="mt-8 flex-1 divide-y divide-dashed divide-[var(--ink)]/20 border-y border-dashed border-[var(--ink)]/20">
          {["1 location", "Unlimited guests", "Points on every visit", "Lookup by phone number"].map((item) => (
            <li key={item} className="flex items-center gap-3 py-2.5 text-sm text-[var(--ink)]/75">
              <Check className="h-4 w-4 shrink-0 text-[var(--ink)]" />
              {item}
            </li>
          ))}
        </ul>
        <a
          href="#get-started"
          className="rounded-md press mt-8 flex items-center justify-center border border-[var(--ink)]/25 px-6 py-3 font-tape text-xs uppercase tracking-widest hover:border-[var(--ink)]"
        >
          List your business
        </a>
      </div>

      {/* Multiple locations */}
      <div className="flex flex-col border border-[var(--ink)] bg-[var(--ink)] p-8 text-[var(--paper)]">
        <p className="font-tape text-[10px] uppercase tracking-[0.22em] text-[var(--paper)]/55">Multiple locations</p>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="font-tape text-lg text-[var(--paper)]/40 line-through">$100</span>
          <span className="font-display text-5xl font-semibold tracking-tight">$50</span>
          <span className="font-tape text-sm text-[var(--paper)]/50">/ month</span>
        </div>
        <p className="mt-1 font-tape text-[10px] uppercase tracking-[0.18em] text-emerald-400">
          Save 50% — limited time
        </p>

        <p className="mt-3 text-sm leading-6 text-[var(--paper)]/65">
          For chains, hotel groups, and franchises tracking loyalty across sites.
        </p>
        <ul className="mt-8 flex-1 divide-y divide-dashed divide-[var(--paper)]/20 border-y border-dashed border-[var(--paper)]/20">
          {[
            "Up to 5 locations",
            "Shared points balance across sites",
            "Per-location and combined reporting",
            "Staff accounts with location-level access",
          ].map((item) => (
            <li key={item} className="flex items-center gap-3 py-2.5 text-sm text-[var(--paper)]/80">
              <Check className="h-4 w-4 shrink-0 text-[var(--paper)]" />
              {item}
            </li>
          ))}
        </ul>
        <a
          href="#get-started"
          className="rounded-md press mt-8 flex items-center justify-center bg-[var(--paper)] px-6 py-3 font-tape text-xs uppercase tracking-widest text-[var(--ink)] hover:opacity-90"
        >
          List your locations
        </a>
      </div>

      {/* Enterprise */}
      <div className="flex flex-col border border-[var(--ink)]/15 bg-[var(--paper)] p-8">
        <p className="font-tape text-[10px] uppercase tracking-[0.22em] text-[var(--ink)]/50">Enterprise</p>
        <div className="mt-4 flex items-baseline gap-1">
          <span className="font-display text-5xl font-semibold tracking-tight">Contact</span>
        </div>
        <p className="mt-3 text-sm leading-6 text-[var(--ink)]/65">
          For large networks with custom needs and volume.
        </p>
        <ul className="mt-8 flex-1 divide-y divide-dashed divide-[var(--ink)]/20 border-y border-dashed border-[var(--ink)]/20">
          {[
            "White-label loyalty program",
            "Unlimited locations",
            "Custom points rules and integrations",
            "Dedicated support",
            "Custom contract and invoicing",
          ].map((item) => (
            <li key={item} className="flex items-center gap-3 py-2.5 text-sm text-[var(--ink)]/75">
              <Check className="h-4 w-4 shrink-0 text-[var(--ink)]" />
              {item}
            </li>
          ))}
        </ul>
        <Link
          href="https://t.me/rielpoint"
          className="rounded-md press mt-8 flex items-center justify-center border border-[var(--ink)]/25 px-6 py-3 font-tape text-xs uppercase tracking-widest hover:border-[var(--ink)]"
        >
          Talk to our team
        </Link>
      </div>
    </div>
  </div>
</section>

      {/* CTA BAND */}
      <section id="get-started" className="relative overflow-hidden bg-[var(--ink)] py-24 text-[var(--paper)]">
        <PaperGrain />
        <div className="mx-auto flex max-w-6xl flex-col items-center px-6 text-center">
          <p className="font-tape text-xs uppercase tracking-[0.22em] text-[var(--paper)]/50">Start today</p>
          <h2 className="mt-4 max-w-xl font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Start rewarding every riel.
          </h2>
          <p className="mt-4 max-w-md text-[var(--paper)]/65">
            Free to start. No hardware, no contract, no POS integration.
          </p>
          <div className="mt-10 flex justify-center">
            <MerchantSignUpForm />
          </div>
         
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
            <div className="col-span-2">
              <div className="flex items-center gap-2.5">
                <Image
        src="/rielpoint_logo.png"
        alt="RielPoint"
        width={36}
        height={36}
        className="h-8 w-8 sm:h-[50px] sm:w-[50px]"
      />
                <span className="font-display text-base font-semibold">RielPoint</span>
              </div>
              <p className="mt-4 max-w-xs text-sm text-[var(--ink)]/55">
                Loyalty software for cafés, restaurants, hotels, and shops across Cambodia.
              </p>
            </div>
            <div>
              <p className="font-tape text-[10px] uppercase tracking-[0.22em] text-[var(--ink)]/50">Product</p>
              <ul className="mt-4 space-y-2 text-sm text-[var(--ink)]/65">
                <li><a href="#how" className="hover:text-[var(--ink)]">How it works</a></li>
                <li><a href="#venues" className="hover:text-[var(--ink)]">Who it&apos;s for</a></li>
                <li><a href="#pricing" className="hover:text-[var(--ink)]">Pricing</a></li>
              </ul>
            </div>
            <div>
              <p className="font-tape text-[10px] uppercase tracking-[0.22em] text-[var(--ink)]/50">Company</p>
              <ul className="mt-4 space-y-2 text-sm text-[var(--ink)]/65">
                <li><Link href="/about" className="hover:text-[var(--ink)]">About</Link></li>
                <li><Link href="https://www.instagram.com/rielpoint.kh" className="hover:text-[var(--ink)]">Contact</Link></li>
           
              </ul>
            </div>
            <div>
              <p className="font-tape text-[10px] uppercase tracking-[0.22em] text-[var(--ink)]/50">Legal</p>
              <ul className="mt-4 space-y-2 text-sm text-[var(--ink)]/65">
                <li><Link href="/terms" className="hover:text-[var(--ink)]">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[var(--ink)]/10 pt-8 font-tape text-xs text-[var(--ink)]/50 md:flex-row">
            <span>© 2026 RielPoint. Made in Phnom Penh.</span>
            {/* <span>Telegram · Instagram</span> */}
          </div>
        </div>
      </footer>
    </div>
  );
}