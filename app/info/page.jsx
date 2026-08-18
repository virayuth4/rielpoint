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
  HelpCircle
} from 'lucide-react'
import icon512 from '@/public/icon-512.png'

export const metadata = {
  title: 'How Cashback Works | RielPoint',
  description: 'Learn how to earn cashback rewards and track confirmation timelines across partner brands.',
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
    title: 'Create an Account',
    description: 'Sign up or log in to track your purchase activity, balance, and payout history in one place.',
  },
  {
    step: '02',
    icon: ShoppingBag,
    title: 'Browse Partner Brands',
    description: 'Explore our partnered stores and select the qualifying items, vouchers, or deals you want to buy.',
  },
  {
    step: '03',
    icon: ExternalLink,
    title: 'Shop via Partner App / Web',
    description: 'Click through our links to the merchant platform and finish checkout without modifying the tracking link.',
  },
  {
    step: '04',
    icon: CircleDollarSign,
    title: 'Earn & Withdraw Cashback',
    description: 'Once the partner validates that your order was completed and not returned, cashback is credited directly to your wallet.',
  },
]

const TIMELINE_STAGES = [
  {
    status: 'Tracked (Pending)',
    timeframe: '1 – 48 Hours',
    description: 'The merchant registers your transaction. Your cashback shows as "Pending" in your wallet.',
    icon: Clock,
  },
  {
    status: 'Merchant Return Period',
    timeframe: '14 – 30 Days',
    description: 'The brand waits for return, cancellation, and exchange windows to close before releasing funds.',
    icon: AlertCircle,
  },
  {
    status: 'Confirmed & Available',
    timeframe: '30 – 90 Days',
    description: 'The merchant finalizes the commission. The funds become available for withdrawal or point redemption.',
    icon: CheckCircle2,
  },
]

const FAQ_ITEMS = [
  {
    q: 'Why does confirmation take time?',
    a: 'Brands enforce return and cancellation policies (typically 14 to 30 days). Once the window closes and the brand pays the affiliate commission, your balance becomes withdrawable.',
  },
  {
    q: 'Why did my cashback not track?',
    a: 'Using ad-blockers, third-party coupon extensions, or navigating away before completing checkout can interrupt the tracking cookie. Always complete your purchase directly in the opened session.',
  },
  {
    q: 'Do different stores take different amounts of time?',
    a: 'Yes. Fast-food and daily services can verify within 7 days, while travel bookings (hotels, flights) only confirm 30–60 days after the stay or trip is completed.',
  },
]

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-[#fafafa] text-black px-4 pt-12 pb-36 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <span className="text-[10px] font-semibold tracking-[0.1em] text-black/50 uppercase">
          Guide & Overview
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black">
          How Cashback Works
        </h1>
        <p className="text-sm text-black/60 max-w-md mx-auto">
          We partner with merchants to pass affiliate commissions back into your pocket.
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
          Merchants pay us to refer you — we split the commission with you.
        </p>
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
          <h2 className="text-base font-semibold text-black">Cashback Confirmation Timelines</h2>
        </div>
        <p className="text-xs text-black/60 mb-5 leading-relaxed">
          Confirmation speeds depend on individual merchant policies, validation periods, and return windows.
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
          <span>Start Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </main>
  )
}