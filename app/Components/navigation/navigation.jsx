'use client'
import React, { useContext } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Trophy, Store, Wallet, User } from 'lucide-react'
import { AuthContext } from '@/app/auth/authContext'

// True if the given href is (or is a parent of) the current pathname
const isActivePath = (pathname, href) =>
  pathname === href || pathname?.startsWith(`${href}/`)

// Shared "island" surface — one floating capsule of frosted glass, matching
// the material established for the rest of the chrome.
const island =
  'rounded-full border border-black/[0.06] bg-white/85 backdrop-blur-xl shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-4px_rgba(0,0,0,0.08)]'
const label = 'text-[9px] tracking-[0.08em] uppercase font-normal'

// Tabs either side of the center Merchant action. Update hrefs to match your
// actual route names — these are best guesses from the labels you gave.
const TABS_LEFT = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Coupons', href: '/coupons', icon: Trophy },
]
const TABS_RIGHT = [
  { label: 'Wallet', href: '/wallet', icon: Wallet },
  { label: 'Profile', href: '/profile', icon: User },
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

export default function Navigation() {
  const pathname = usePathname()
  // Kept for future use (e.g. gating Wallet/Settings behind auth)
  const { currentUser, loading } = useContext(AuthContext) ?? {}
  const isMerchantActive = isActivePath(pathname, '/merchant')

  const merchantHref =
    currentUser?.role === 'staff' ? '/merchant/points' : '/merchant'


  return (
    <div className="fixed bottom-8 sm:bottom-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav className={`${island} pointer-events-auto relative flex items-center gap-1 h-16 px-3`}>
        {TABS_LEFT.map((tab) => (
          <TabItem key={tab.href} tab={tab} active={isActivePath(pathname, tab.href)} />
        ))}

        {/* Merchant — raised center action, breaks out of the pill */}
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
      </nav>
    </div>
  )
}