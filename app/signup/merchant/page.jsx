'use client';

import MerchantSignUpForm from "@/app/Components/merchantSignUpForm";
import Link from "next/link";




// ---- Static content -------------------------------------------------

const STATS = [
  { value: '50+', label: 'Merchants onboarded' },
  { value: '10k+', label: 'Points earned by customers' },
  { value: '4,001', label: 'KHR per USD, always synced' },
];

const STEPS = [
  {
    number: '01',
    title: 'Create your account',
    description: 'Sign up with your phone number and business name. No paperwork, no waiting period — you can start crediting points in minutes.',
  },
  {
    number: '02',
    title: 'Set your rewards',
    description: 'Choose your points rate and create coupons — percent off, fixed amount, or custom perks. Change them anytime.',
  },
  {
    number: '03',
    title: 'Customers earn & redeem',
    description: 'Credit points at checkout by phone number. Customers redeem coupons with a one-time code — no app download required on their end.',
  },
];

const FEATURES = [
  {
    title: 'No hardware',
    description: 'Works on the phone or tablet you already have. Nothing to plug in, nothing to install.',
  },
  {
    title: 'No POS integration',
    description: 'Runs alongside your existing checkout process. Add it without touching your current systems.',
  },
  {
    title: 'USD & KHR support',
    description: 'Accept purchases in either currency — conversion happens automatically at a fixed rate.',
  },
  {
    title: 'Flexible rewards',
    description: 'Set your own points rate and build coupons that match how you actually want to reward customers.',
  },
  {
    title: 'Instant redemption',
    description: 'Customers show a 6-digit code at checkout. You verify it in seconds — no scanning, no app friction.',
  },
  {
    title: 'Easy to start',
    description: 'Simple onboaarding process. You can train your staff in less than 10 minutes',
  },
];

const FAQS = [
 
  {
    q: 'Do I need to integrate with my POS system?',
    a: 'No. It runs independently of your point-of-sale — you credit points and verify coupons using a phone number or code, alongside whatever checkout process you already use.',
  },
  {
    q: 'Can I charge in both USD and KHR?',
    a: 'Yes. Enter a purchase in either currency and it converts automatically at a fixed rate, so your points rate stays consistent either way.',
  },
  {
    q: 'How do customers redeem a coupon?',
    a: 'They open their coupon, get a one-time 6-digit code, and show it to your staff at checkout. You verify it in the merchant dashboard and it\u2019s marked used immediately.',
  },
];

// ---- Small presentational bits ---------------------------------------

function SectionLabel({ children }) {
  return (
    <p className="font-tape text-xs uppercase tracking-[0.22em] text-[var(--ink)]/50">
      {children}
    </p>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5 shrink-0" aria-hidden="true">
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 10.5l2.5 2.5L14 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FaqItem({ q, a }) {
  return (
    <details className="group border-b border-[var(--ink)]/10 py-6">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
        <span className="font-display text-lg font-medium text-[var(--ink)]">{q}</span>
        <span className="shrink-0 font-tape text-xl text-[var(--ink)]/40 transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--ink)]/65">{a}</p>
    </details>
  );
}

// ---- Page --------------------------------------------------------------

export default function MerchantSignupPage() {
  return (
    <main className="bg-[var(--paper)] text-[var(--ink)]">
      {/* HERO */}
      <section className="relative overflow-hidden py-28">
    
        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 text-center">
          <SectionLabel>For merchants</SectionLabel>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold tracking-tight md:text-6xl">
            Turn every purchase into a reason to come back.
          </h1>
          <p className="mt-5 max-w-xl text-base text-[var(--ink)]/65 md:text-lg">
            Credit points, create coupons, and reward loyal customers &mdash; no hardware,
            no contract, no POS integration required.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <a
              href="#signup"
              className="bg-[var(--ink)] px-8 py-3.5 text-sm font-semibold text-[var(--paper)] transition-opacity hover:opacity-90"
            >
              Start for free
            </a>
            <a
              href="#how-it-works"
              className="font-tape text-xs uppercase tracking-widest text-[var(--ink)]/60 hover:text-[var(--ink)]"
            >
              See how it works ↓
            </a>
          </div>

          <div className="mt-20 grid w-full grid-cols-1 gap-8 border-t border-[var(--ink)]/10 pt-10 sm:grid-cols-3">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-3xl font-semibold">{stat.value}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-[var(--ink)]/50">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="border-t border-[var(--ink)]/10 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-xl">
            <SectionLabel>How it works</SectionLabel>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight md:text-4xl">
              Three steps to your first reward.
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
            {STEPS.map((step) => (
              <div key={step.number} className="border-t border-[var(--ink)]/15 pt-6">
                <span className="font-tape text-xs text-[var(--ink)]/40">{step.number}</span>
                <h3 className="mt-3 font-display text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ink)]/65">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
         <div className="mt-10 flex justify-center">
            <Link
                href="/demo"
                className="bg-[var(--ink)] px-8 py-3.5 text-sm font-semibold text-[var(--paper)] transition-opacity hover:opacity-90"
            >
                Try Demo
            </Link>
            </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="border-t border-[var(--ink)]/10 bg-[var(--ink)]/[0.03] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-xl">
            <SectionLabel>Built for merchants</SectionLabel>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight md:text-4xl">
              Everything you need, nothing you don&apos;t.
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="flex gap-3">
              
                <div>
                  <h3 className="font-display text-base font-semibold">{feature.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--ink)]/65">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING CALLOUT */}
      <section className="border-t border-[var(--ink)]/10 py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <SectionLabel>Pricing</SectionLabel>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Free to start. Simple after that.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[var(--ink)]/65">
            Create your account, credit points, and issue coupons at no cost. No setup
            fees, no monthly minimums, no surprise charges.
          </p>
          <a
            href="#signup"
            className="mt-8 inline-block border border-[var(--ink)] px-8 py-3.5 text-sm font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)]"
          >
            Get started
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-[var(--ink)]/10 py-24">
        <div className="mx-auto max-w-3xl px-6">
          <SectionLabel>Questions</SectionLabel>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Frequently asked.
          </h2>
          <div className="mt-10">
            {FAQS.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section id="signup" className="relative overflow-hidden bg-[var(--ink)] py-24 text-[var(--paper)]">
     
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
          <a href="#" className="mt-6 font-tape text-xs uppercase tracking-widest text-[var(--paper)]/60 hover:text-[var(--paper)]">
            Prefer to talk first? Contact our team →
          </a>
        </div>
      </section>
    </main>
  );
}