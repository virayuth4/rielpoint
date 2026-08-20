import React from "react";
import Link from "next/link";

export default function Banner() {
  return (
    <section className="w-full bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="flex flex-col items-center text-center space-y-6">
          
          {/* Cambodia / Regional Focus Badge */}
        

          {/* Title */}
          <h1 className="text-4xl font-black uppercase tracking-tight text-black sm:text-6xl lg:text-7xl leading-tight">
            Earn Up to <span className="underline decoration-2 underline-offset-8">20% Cashback</span>
          </h1>

          {/* Subtext targeting regional travelers & local shoppers */}
          <p className="max-w-2xl text-base font-normal leading-relaxed text-slate-600 sm:text-lg">
            Turn every spend into real savings. Earn cash back on top brands at home in<strong className='text-slate-900 font-semibold'> Cambodia </strong>and when you travel across <strong className="text-slate-900 font-semibold">Singapore, Vietnam, Malaysia, and beyond</strong>.
          </p>

          {/* CTA & Trust Anchor */}
          <div className="flex flex-col items-center gap-3 pt-2">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-full bg-black px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-slate-800 sm:text-sm"
            >
              Sign Up and Start Earning
            </Link>
            <p className="text-xs text-slate-600">
              Direct payout to local Cambodian bank accounts with <br /> Bakong / KHQR 
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}