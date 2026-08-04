'use client'
import React, { useContext } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Trophy, Store, Wallet, User, ListChecks, ShieldCheck } from 'lucide-react'
import { AuthContext } from '@/app/auth/authContext'

// True if the given href is (or is a parent of) the current pathname
const isActivePath = (pathname, href) =>
  pathname === href || pathname?.startsWith(`${href}/`)

// Shared "island" surface — one floating capsule of frosted glass, matching
// the material established for the rest of the chrome.
const island =
  'rounded-[32px] border border-black/[0.06] bg-white/85 backdrop-blur-xl shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-4px_rgba(0,0,0,0.08)]'
const label = 'text-[9px] tracking-[0.08em] uppercase font-normal'
const subLabel = 'text-[8px] tracking-[0.06em] uppercase font-normal'

// Tabs either side of the center Merchant action. Update hrefs to match your
// actual route names — these are best guesses from the labels you gave.
const TABS_LEFT = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Rewards', href: '/rewards', icon: Trophy },
]
const TABS_RIGHT = [
  { label: 'Wallet', href: '/wallet', icon: Wallet },
  { label: 'Profile', href: '/profile', icon: User },
]

// Second row — merchant-only actions, shown to owner/staff.
const MERCHANT_ROW = [
  { label: 'Points', href: '/merchant/points', icon: ListChecks },
  { label: 'Verify', href: '/merchant/verify', icon: ShieldCheck },
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
        strokeWidth={active ? 2 : 1.5}
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
  const { currentUser, loading } = useContext(AuthContext) ?? {}
  const isMerchantActive = isActivePath(pathname, '/merchant')

  const role = currentUser?.role
  const canManageMerchant = role === 'owner' || role === 'staff'

  const merchantHref = role === 'staff' ? '/merchant/points' : '/merchant'

  return (
    <div className="fixed bottom-8 sm:bottom-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav className={`${island} pointer-events-auto flex flex-col items-center px-3 py-2`}>
        {/* Row 1 — primary tabs, Merchant raised in the center */}
        <div className="relative flex items-center gap-1 h-16">
          {TABS_LEFT.map((tab) => (
            <TabItem key={tab.href} tab={tab} active={isActivePath(pathname, tab.href)} />
          ))}

          <Link
            href={merchantHref}
            aria-label="Merchant"
            className="flex flex-col items-center justify-center -mt-8 mx-1"
          >
            <span
              className={`
                flex items-center justify-center w-14 h-14 rounded-full
                bg-black border-[3px] border-white
                shadow-[0_4px_16px_rgba(0,0,0,0.25)]
                transition-transform duration-150 active:scale-95
                ${isMerchantActive ? 'scale-105' : ''}
              `}
            >
              <Store className="h-6 w-6 text-white" strokeWidth={1.75} />
            </span>
            <span
              className={`${label} mt-1`}
              style={{
                color: 'black',
                opacity: isMerchantActive ? 1 : 0.4,
              }}
            >
              Merchant
            </span>
          </Link>

          {TABS_RIGHT.map((tab) => (
            <TabItem key={tab.href} tab={tab} active={isActivePath(pathname, tab.href)} />
          ))}
        </div>

        {/* Row 2 — merchant-only sub-actions, owner/staff only */}
        {canManageMerchant && (
          <div className="flex items-center gap-1 pb-1.5 -mt-1 border-t border-black/[0.06] pt-1.5 w-full justify-center">
            {MERCHANT_ROW.map((tab) => (
              <SubTabItem key={tab.href} tab={tab} active={isActivePath(pathname, tab.href)} />
            ))}
          </div>
        )}
      </nav>
    </div>
  )
}