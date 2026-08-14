'use client'
import React, { useContext, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Wallet, 
  User, 
  Plus, 
  ScanLine, 
  Trophy, 
  HelpCircle, 
  X, 
  UserPlus, 
  ShoppingBag, 
  ExternalLink, 
  Gift,
  CircleDollarSign
} from 'lucide-react'
import { AuthContext } from '@/app/auth/authContext'

// True if the given href is (or is a parent of) the current pathname
const isActivePath = (pathname, href) =>
  pathname === href || pathname?.startsWith(`${href}/`)

// Shared "island" surface
const island =
  'rounded-[32px] border border-black/[0.06] bg-white/85 backdrop-blur-xl shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-4px_rgba(0,0,0,0.08)]'
const label = 'text-[9px] tracking-[0.08em] uppercase font-normal'
const subLabel = 'text-[8px] tracking-[0.06em] uppercase font-normal'

const TABS_LEFT = [
  { label: 'Home', href: '/', icon: Home },
]

const TABS_RIGHT = [
  { label: 'Wallet', href: '/wallet', icon: Wallet },
  { label: 'Profile', href: '/profile', icon: User },
]

const MERCHANT_ROW = [
  { label: 'Points', href: '/merchant/points', icon: Plus },
  { label: 'Verify', href: '/merchant/verify', icon: ScanLine },
  { label: 'Offers', href: '/merchant/offers', icon: Trophy },
]

const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    icon: UserPlus,
    title: 'Create an Account',
    description: 'Sign up or log in to track your activity and earn cashback on every purchase.',
  },
  {
    step: '02',
    icon: ShoppingBag,
    title: 'Browse Brands',
    description: 'Explore our partnered stores and select the items or deals you want to buy.',
  },
  {
    step: '03',
    icon: ExternalLink,
    title: 'Shop on Partner App',
    description: 'Click through to the merchant site/app and complete your purchase as usual.',
  },
  {
    step: '04',
    icon: CircleDollarSign,
    title: 'Get Cashback',
    description: 'Once the brand confirms your purchase, cashback rewards will be added to your wallet.',
  },
]

function TabItem({ tab, active }) {
  const Icon = tab.icon
  return (
    <Link
      href={tab.href}
      className="flex flex-col items-center justify-center gap-1 w-14 py-2 transition-opacity duration-150"
      aria-current={active ? 'page' : undefined}
    >
      <Icon
        className="h-5 w-5"
        strokeWidth={active ? 2 : 1.5}
        color="black"
        style={{ opacity: active ? 1 : 0.4 }}
      />
      <span className={label} style={{ opacity: active ? 1 : 0.4, color: 'black' }}>
        {tab.label}
      </span>
    </Link>
  )
}

function SubTabItem({ tab, active }) {
  const Icon = tab.icon
  return (
    <Link
      href={tab.href}
      className="flex items-center justify-center gap-1.5 px-3 py-3 rounded-full transition-colors duration-150"
      style={{ backgroundColor: active ? 'rgba(0,0,0,0.06)' : 'transparent' }}
      aria-current={active ? 'page' : undefined}
    >
      <Icon
        className="h-3.5 w-3.5"
        strokeWidth={2}
        color="black"
        style={{ opacity: active ? 1 : 0.45 }}
      />
      <span className={subLabel} style={{ opacity: active ? 1 : 0.45, color: 'black' }}>
        {tab.label}
      </span>
    </Link>
  )
}

export default function Navigation() {
  const pathname = usePathname()
  const { currentUser } = useContext(AuthContext) ?? {}
  const [isInfoOpen, setIsInfoOpen] = useState(false)

  const role = currentUser?.role
  const canManageMerchant = role === 'owner' || role === 'staff'

  return (
    <>
      <div className="fixed bottom-8 sm:bottom-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <nav className={`${island} pointer-events-auto flex flex-col items-center px-3 py-2`}>
          {/* Main Navigation Row */}
          <div className="relative flex items-center gap-4 sm:gap-6 h-16">
            {TABS_LEFT.map((tab) => (
              <TabItem key={tab.href} tab={tab} active={isActivePath(pathname, tab.href)} />
            ))}

            {/* Info / How it Works Button */}
            <button
              type="button"
              onClick={() => setIsInfoOpen(true)}
              className="flex flex-col items-center justify-center gap-1 w-14 py-2 transition-opacity duration-150"
              aria-label="How it works"
            >
              <HelpCircle
                className="h-5 w-5 text-black"
                strokeWidth={isInfoOpen ? 2 : 1.5}
                style={{ opacity: isInfoOpen ? 1 : 0.4 }}
              />
              <span className={label} style={{ opacity: isInfoOpen ? 1 : 0.4, color: 'black' }}>
                Info
              </span>
            </button>

            {TABS_RIGHT.map((tab) => (
              <TabItem key={tab.href} tab={tab} active={isActivePath(pathname, tab.href)} />
            ))}
          </div>

          {/* Merchant Sub-row */}
          {canManageMerchant && (
            <div className="flex items-center gap-1 pb-1.5 -mt-1 border-t border-black/[0.06] pt-1.5 w-full justify-center">
              {MERCHANT_ROW.map((tab) => (
                <SubTabItem key={tab.href} tab={tab} active={isActivePath(pathname, tab.href)} />
              ))}
            </div>
          )}
        </nav>
      </div>

      {/* How It Works Modal */}
      {isInfoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsInfoOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative z-10 w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-black/[0.08] animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-black/[0.06]">
              <div>
                <h3 className="text-lg font-semibold text-black">How Cashback Works</h3>
                <p className="text-xs text-black/50">Follow these simple steps to earn rewards</p>
              </div>
              <button
                onClick={() => setIsInfoOpen(false)}
                className="p-1.5 rounded-full hover:bg-black/[0.05] transition-colors text-black/60 hover:text-black"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Steps Flow */}
            <div className="mt-5 space-y-4">
              {HOW_IT_WORKS_STEPS.map((item, idx) => {
                const StepIcon = item.icon
                return (
                  <div key={idx} className="flex items-start gap-3.5">
                    <div className="flex-shrink-0 w-9 h-9 rounded-2xl bg-black/[0.04] border border-black/[0.06] flex items-center justify-center text-black">
                      <StepIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold tracking-wider text-black/40 uppercase">
                          Step {item.step}
                        </span>
                      </div>
                      <h4 className="text-sm font-medium text-black">{item.title}</h4>
                      <p className="text-xs text-black/60 leading-relaxed mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Action */}
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setIsInfoOpen(false)}
                className="w-full py-3 px-4 rounded-2xl bg-black text-white text-xs font-medium tracking-wide hover:bg-black/90 active:scale-[0.99] transition-all"
              >
                Got It, Let&apos;s Shop!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}