'use client'
import React, { useContext } from 'react'
import Image from "next/image";
import Link from "next/link";
import { Montserrat } from 'next/font/google';

import { AuthContext } from "@/app/auth/authContext";

// Initialize Montserrat Black for the ShopBack-style logo
const shopBackFont = Montserrat({
  subsets: ['latin'],
  weight: ['900'], // Black / Heavy weight
  display: 'swap',
});

export default function TopNavigation() {
  const { currentUser, loading } = useContext(AuthContext) ?? {};

  return (
    <header className="sticky top-0 z-20  bg-white ">
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
    </header>
  );
}