'use client'
import React, { useContext } from 'react'
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Montserrat } from 'next/font/google';
import { Tag, Info, Wallet, User, Flame } from 'lucide-react';

import { AuthContext } from "@/app/auth/authContext";

// Initialize Montserrat Black for the ShopBack-style logo
const shopBackFont = Montserrat({
  subsets: ['latin'],
  weight: ['900'], // Black / Heavy weight
  display: 'swap',
});

const mobileLinks = [
  { href: "/", label: "Cashback", icon: Tag },
  // { href: "/deals", label: "Deals", icon: Flame, isHighlighted: true },
  // { href: "/hotels", label: "Hotels", icon: Tag },
  { href: "/info", label: "Info", icon: Info },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/profile", label: "Profile", icon: User },
];

export default function TopNavigation() {
  const { currentUser, loading } = useContext(AuthContext) ?? {};
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">

        <Link href="/" className="group flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-90">
          <Image
            src="/rielpoint_logo.png"
            alt="RielPoint Logo"
            width={36}
            height={36}
            className="h-8 w-8 transition-transform duration-300 group-hover:scale-105 sm:h-9 sm:w-9"
          />

          <span className={`${shopBackFont.className} text-xl font-black uppercase leading-none tracking-[0.02em] sm:text-2xl`}>
            <span className="text-black">RIEL</span>
            <span className="text-black">POINT</span>
          </span>
        </Link>

        {!loading && (
          currentUser ? (
            <Link
              href="/profile"
              className="shrink-0 whitespace-nowrap rounded-full bg-[var(--ink,#111)] px-3 py-2 text-[11px] font-medium text-[var(--paper,#fff)] hover:opacity-90 sm:px-4 sm:text-xs"
            >
              {currentUser.fullname}
            </Link>
          ) : (
            <Link
              href="/signup"
              className="shrink-0 whitespace-nowrap rounded-full bg-[var(--ink,#111)] px-3 py-2 text-[10px] font-normal tracking-[0.08em] text-[var(--paper,#fff)] hover:opacity-90 sm:px-4 sm:text-[11px] md:text-xs"
            >
              Sign Up
            </Link>
          )
        )}
      </div>

      {/* Navigation bar with hide-scrollbar rules */}
      <nav className="mx-auto flex md:max-w-5xl items-center gap-2 overflow-x-auto px-4 py-2 md:justify-center md:overflow-visible [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {mobileLinks.map(({ href, label, isHighlighted }) => {
          const isActive = pathname === href;

          // High-converting style for Deals
          if (isHighlighted) {
            return (
              <div key={href} className="relative flex shrink-0 snap-start items-center justify-center">
                <Link
                  href={href}
                  className={`relative flex items-center justify-center gap-1.5 rounded-full px-4 py-1.5 md:px-5 md:min-w-[110px] text-[13px] font-bold uppercase transition-all shadow-sm ${
                    isActive
                      ? "bg-red-700 text-white ring-2 ring-red-400 ring-offset-1"
                      : "bg-red-600 text-white hover:bg-red-700 hover:shadow-md hover:scale-[1.02]"
                  }`}
                >
                  <Flame className="h-4 w-4 fill-amber-300 text-amber-300 animate-pulse" />
                  <span>{label}</span>

                  {/* Micro "HOT" badge */}
                  <span className="absolute -top-2 -right-1 flex h-4 items-center rounded-full bg-amber-400 px-1.5 text-[9px] font-extrabold uppercase tracking-tight text-slate-950 shadow-sm">
                    NEW
                  </span>
                </Link>
              </div>
            );
          }

          // Standard links
          return (
            <div key={href} className="flex shrink-0 snap-start justify-center">
              <Link
                href={href}
                className={`flex flex-col items-center justify-center gap-0.5 rounded-2xl px-3 py-1.5 md:px-6 md:min-w-[110px] text-[14px] font-bold transition-colors uppercase whitespace-nowrap ${
                  isActive
                    ? "text-black font-black"
                    : "text-black hover:bg-slate-100 hover:text-black"
                }`}
              >
                {label}
              </Link>
            </div>
          );
        })}
      </nav>
    </header>
  );
}