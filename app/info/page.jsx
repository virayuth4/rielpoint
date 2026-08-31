import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  User,
  UserPlus,
  ShoppingBag,
  ExternalLink,
  CircleDollarSign,
  ArrowRight,
  Store,
  Clock,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Plane,
  Laptop,
  Shirt
} from 'lucide-react'
import icon512 from '@/public/icon-512.png'

export const metadata = {
  title: 'How Cashback Works | RielPoint Cambodia',
  description: 'Earn cashback on online shopping, travel, and lifestyle bookings. Direct payouts via Bakong & KHQR in USD and KHR.',
}

const FLOW_NODES = [
  { label: 'Merchant', icon: Store },
  { label: 'RielPoint', image: icon512, highlight: true },
  { label: 'You', icon: User },
]

const FLOW_CONNECTORS = ['Pays Commission', 'Splits With You']

const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    icon: UserPlus,
    title: 'Create Your Account',
    description: 'Sign up in seconds to track earnings, view dual-currency balances (USD & KHR), and manage payouts.',
  },
  {
    step: '02',
    icon: ShoppingBag,
    title: 'Browse Partner Stores',
    description: 'Explore verified partner brands across travel, fashion, electronics, and everyday online services.',
  },
  {
    step: '03',
    icon: ExternalLink,
    title: 'Shop via Partner App or Web',
    description: 'Click out to the merchant store and complete your purchase directly to preserve your tracking session.',
  },
  {
    step: '04',
    icon: CircleDollarSign,
    title: 'Withdraw via Bakong & Local Banks',
    description: 'Once confirmed, transfer your cash directly to your Cambodian bank account using Bakong or KHQR in USD or KHR.',
  },
]

const POPULAR_CATEGORIES = [
  {
    title: 'Travel & Stays',
    type: 'Flights & Hotels',
    focus: 'Flight tickets, hotel reservations, airport transfers, and vacation stays.',
    icon: Plane,
  },
  {
    title: 'Fashion & Beauty',
    type: 'Apparel & Lifestyle',
    focus: 'Clothing, skincare, accessories, and luxury lifestyle brands.',
    icon: Shirt,
  },
  {
    title: 'Electronics & Tech',
    type: 'Gadgets & Software',
    focus: 'Consumer electronics, accessories, subscriptions, and digital tools.',
    icon: Laptop,
  },
]

const TIMELINE_STAGES = [
  {
    status: 'Tracked (Pending)',
    timeframe: '1 – 48 Hours',
    description: 'The merchant logs your purchase. Your estimated cashback displays as "Pending" in your RielPoint wallet.',
    icon: Clock,
  },
  {
    status: 'Merchant Verification Period',
    timeframe: '14 – 45 Days',
    description: 'Brands verify that orders were completed and return/cancellation windows have closed.',
    icon: AlertCircle,
  },
  {
    status: 'Confirmed & Withdrawable',
    timeframe: '30 – 60 Days',
    description: 'Commission is approved. Withdraw your earnings straight to ABA, Wing, or any Bakong-connected wallet.',
    icon: CheckCircle2,
  },
]

const FAQ_ITEMS = [
  {
    q: 'How does RielPoint give me cash back?',
    a: 'Partner merchants pay us a referral commission whenever you shop through our platform. We pass the majority of that commission straight back to you as cash.',
  },
  {
    q: 'How do payouts work for Cambodian bank accounts?',
    a: 'You can withdraw confirmed balances in USD or KHR directly to any local bank via Bakong and KHQR with zero hidden transfer fees.',
  },
  {
    q: 'Why does cashback take time to confirm?',
    a: 'Merchants wait for return policies, cancellation windows, or completed travel dates to pass before releasing the referral commission.',
  },
  {
    q: 'Why did my cashback not track?',
    a: 'Using third-party coupon extensions, enabling strict ad-blockers, or switching browser tabs mid-checkout can break the tracking link. Always complete your order immediately after clicking through RielPoint.',
  },
]

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-white text-black px-4 pt-12 pb-36 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black">
          How Cashback Works
        </h1>
        <p className="text-sm text-black/60 max-w-md mx-auto">
          Earn real cash back every time you shop online and withdraw directly to your Cambodian bank account.
        </p>
      </div>

      {/* Money Flow Visual */}
      <section className="rounded-3xl bg-white border border-black/[0.06] p-6 shadow-sm mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-black/40 text-center mb-4">
          The Commission Flow
        </h2>
        <div className="flex items-start justify-center py-2">
          {FLOW_NODES.map((node, idx) => {
            const Icon = node.icon
            const isLast = idx === FLOW_NODES.length - 1
            return (
              <React.Fragment key={node.label}>
                <div className="flex flex-col items-center gap-2 w-20">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white border border-black/[0.08] shadow-sm">
                    {node.image ? (
                      <Image
                        src={node.image}
                        alt={node.label}
                        width={32}
                        height={32}
                        className="w-7 h-7 object-contain"
                      />
                    ) : (
                      <Icon className="w-6 h-6 text-black/80" strokeWidth={1.75} />
                    )}
                  </div>
                  <span className="text-[10px] font-medium text-black/70 uppercase tracking-wide text-center">
                    {node.label}
                  </span>
                </div>

                {!isLast && (
                  <div className="flex flex-col items-center pt-4 px-1 flex-1 min-w-[50px]">
                    <ArrowRight className="w-4 h-4 text-black/30" strokeWidth={2} />
                    <span className="text-[8px] text-black/45 text-center leading-tight mt-1 whitespace-nowrap font-medium">
                      {FLOW_CONNECTORS[idx]}
                    </span>
                  </div>
                )}
              </React.Fragment>
            )
          })}
        </div>
        <p className="text-center text-xs font-semibold text-black mt-4 tracking-tight">
          Merchants pay us to refer you — we split the commission directly into your Cambodian wallet.
        </p>
      </section>

      {/* Popular Categories */}
      <section className="rounded-3xl bg-white border border-black/[0.06] p-6 shadow-sm mb-6 space-y-4">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-black/70" />
          <h2 className="text-base font-semibold text-black">Popular Cashback Categories</h2>
        </div>
        <p className="text-xs text-black/60 leading-relaxed">
          Earn rewards across multiple online shopping, travel, and tech categories.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {POPULAR_CATEGORIES.map((item) => {
            const CategoryIcon = item.icon
            return (
              <div
                key={item.title}
                className="p-3.5 rounded-2xl bg-black/[0.02] border border-black/[0.04] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-white border border-black/[0.06]">
                      <CategoryIcon className="w-3.5 h-3.5 text-black/80" />
                    </div>
                    <span className="text-xs font-semibold text-black">{item.title}</span>
                  </div>
                  <p className="text-[11px] font-medium text-black/70">{item.type}</p>
                  <p className="text-[10px] text-black/50 leading-normal mt-1">{item.focus}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 4-Step Process */}
      <section className="rounded-3xl bg-white border border-black/[0.06] p-6 shadow-sm mb-6 space-y-6">
        <h2 className="text-base font-semibold text-black">4 Simple Steps</h2>
        <div className="space-y-5">
          {HOW_IT_WORKS_STEPS.map((item) => {
            const StepIcon = item.icon
            return (
              <div key={item.step} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-black/[0.04] border border-black/[0.06] flex items-center justify-center text-black">
                  <StepIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-semibold tracking-wider text-black/40 uppercase">
                    Step {item.step}
                  </span>
                  <h3 className="text-sm font-medium text-black">{item.title}</h3>
                  <p className="text-xs text-black/60 leading-relaxed mt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Confirmation Timelines */}
      <section className="rounded-3xl bg-white border border-black/[0.06] p-6 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-black/70" />
          <h2 className="text-base font-semibold text-black">Confirmation Timelines</h2>
        </div>
        <p className="text-xs text-black/60 mb-5 leading-relaxed">
          Payout schedules depend on merchant verification periods and return policies.
        </p>

        <div className="space-y-4">
          {TIMELINE_STAGES.map((stage, idx) => {
            const StageIcon = stage.icon
            return (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.04] flex items-start gap-3.5"
              >
                <div className="p-2 rounded-xl bg-white border border-black/[0.06] text-black">
                  <StageIcon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-semibold text-black">{stage.status}</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/5 text-black/70 border border-black/[0.05]">
                      {stage.timeframe}
                    </span>
                  </div>
                  <p className="text-[11px] text-black/60 leading-relaxed mt-1">
                    {stage.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="rounded-3xl bg-white border border-black/[0.06] p-6 shadow-sm mb-8 space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-black/70" />
          <h2 className="text-base font-semibold text-black">Frequently Asked Questions</h2>
        </div>
        <div className="divide-y divide-black/[0.06]">
          {FAQ_ITEMS.map((item, idx) => (
            <div key={idx} className="py-3.5 first:pt-1 last:pb-0">
              <h3 className="text-xs font-semibold text-black">{item.q}</h3>
              <p className="text-xs text-black/60 leading-relaxed mt-1">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Button */}
      <div className="text-center">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-black text-white text-xs font-medium hover:bg-black/90 active:scale-[0.98] transition-all shadow-md"
        >
          <span>Explore Partner Stores</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </main>
  )
}