'use client'
import React, { useContext, useState, useEffect } from 'react'
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
  ArrowRight,
  DollarSign,
  Gift
} from 'lucide-react'
import { AuthContext } from '@/app/auth/authContext'
import { useNavAction } from '@/app/context/navActionContext'

const isActivePath = (pathname, href) =>
  pathname === href || pathname?.startsWith(`${href}/`)

const island =
  'rounded-[32px] border border-black/[0.06] bg-white/85 backdrop-blur-xl shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-4px_rgba(0,0,0,0.08)]'
const label = 'text-[9px] tracking-[0.08em] uppercase font-normal'
const subLabel = 'text-[8px] tracking-[0.06em] uppercase font-normal'

const TABS_LEFT = [
  { label: 'Home', href: '/', icon: Home },
  // { label: 'Deals', href: '/deals', icon: DollarSign },
]

const TABS_RIGHT = [
  { label: 'Wallet', href: '/wallet', icon: Wallet },
  { label: 'Rewards', href: '/rewards', icon: Gift },
]

const MERCHANT_ROW = [
  { label: 'Promo', href: '/merchant/promo/add', icon: Plus },
  { label: 'Merchant', href: '/merchant', icon: ScanLine },
  { label: 'Offers', href: '/merchant/offers', icon: Trophy },
]

function TabItem({ tab, active }) {
  const Icon = tab.icon
  return (
    <Link
      href={tab.href}
      className={`flex flex-col items-center justify-center gap-1 w-14 py-2 rounded-2xl transition-all duration-150`}
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
  const [isVisible, setIsVisible] = useState(true)

  const role = currentUser?.role
  const canManageMerchant = role === 'owner' || role === 'staff'
  const { cta } = useNavAction()

  useEffect(() => {
    const handleToggleNav = (event) => {
      if (typeof event.detail?.visible === 'boolean') {
        setIsVisible(event.detail.visible)
      }
    }

    window.addEventListener('toggle-bottom-nav', handleToggleNav)
    return () => {
      window.removeEventListener('toggle-bottom-nav', handleToggleNav)
    }
  }, [])

  return (
    <div 
      className={`fixed bottom-8 sm:bottom-6 inset-x-0 z-50 flex justify-center px-8 sm:px-4 pointer-events-none transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'
      }`}
    >
      <nav className={`${island} pointer-events-auto flex flex-col items-center px-3 py-2 w-[110%] sm:w-auto max-w-sm sm:max-w-none`}>
        {/* Top CTA Row (Visible when CTA exists) */}
        {cta && (
          <div className="w-full pb-2 mb-1 border-b border-black/[0.06] flex justify-center">
            <a
              href={cta.href}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={cta.onClick}
              className="flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded-full bg-black text-white text-xs font-semibold hover:bg-black/90 active:scale-[0.98] transition-all"
            >
              <span>{cta.label}</span>
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </a>
          </div>
        )}

        {/* Main Navigation Row */}
        <div className="relative flex items-center justify-between w-full gap-2 sm:gap-6 sm:justify-center sm:w-auto h-16">
          {TABS_LEFT.map((tab) => (
            <TabItem key={tab.href} tab={tab} active={isActivePath(pathname, tab.href)} />
          ))}

          {/* Info / How it Works Link */}
          <TabItem
            tab={{ label: 'Info', href: '/info', icon: HelpCircle }}
            active={isActivePath(pathname, '/info')}
          />

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
  )
}