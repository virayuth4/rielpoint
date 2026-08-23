'use client'
import React, { useContext } from 'react'
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Montserrat } from 'next/font/google';
import { Tag, Info, Wallet, User } from 'lucide-react';

import { AuthContext } from "@/app/auth/authContext";

// Initialize Montserrat Black for the ShopBack-style logo
const shopBackFont = Montserrat({
  subsets: ['latin'],
  weight: ['900'], // Black / Heavy weight
  display: 'swap',
});

const mobileLinks = [
  { href: "/deals", label: "Deals", icon: Tag },
  { href: "/info", label: "Info", icon: Info },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/profile", label: "Profile", icon: User },
];

export default function TopNavigation() {
  const { currentUser, loading } = useContext(AuthContext) ?? {};
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">

        <Link href="/" className="group flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-90">
          <Image
            src="/rielpoint_logo.png"
            alt="RielPoint Logo"
            width={36}
            height={36}
            className="h-8 w-8 transition-transform duration-300 group-hover:scale-105 sm:h-9 sm:w-9"
          />

          {/* ShopBack style typography: All-caps, Montserrat 900, tight line height, distinct color split */}
          <span className={`${shopBackFont.className} text-xl font-black uppercase leading-none tracking-[0.02em] sm:text-2xl`}>
            <span className="text-black">RIEL</span>
            <span className="text-black">POINT</span>
          </span>
        </Link>

        {!loading && (
          currentUser ? (
            <Link
              href="/profile"
              className="shrink-0 whitespace-nowrap rounded-full bg-[var(--ink)] px-3 py-2 text-[11px] font-medium text-[var(--paper)] hover:opacity-90 sm:px-4 sm:text-xs"
            >
              {currentUser.fullname}
            </Link>
          ) : (
            <Link
              href="/signup"
              className="shrink-0 whitespace-nowrap rounded-full bg-[var(--ink)] px-3 py-2 text-[10px] font-normal  tracking-[0.08em] text-[var(--paper)] hover:opacity-90 sm:px-4 sm:text-[11px] md:text-xs"
            >
              Sign Up
            </Link>
          )
        )}
      </div>


     <nav className="mx-auto flex md:max-w-4xl items-center justify-between px-2 py-1.5">
  {mobileLinks.map(({ href, label, icon: Icon }) => {
    const isActive = pathname === href;
    return (
      <div key={href} className="flex flex-1 justify-center">
        <Link
          href={href}
          className={`flex flex-col items-center gap-0.5 rounded-2xl px-3 py-1.5 text-[14px] font-bold transition-colors uppercase ${
            isActive
              ? "text-[var(--ink)] underline"
              : "text-black hover:bg-gray-300 hover:text-black/90"
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