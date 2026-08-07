'use client'
import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

import { useLoginLogic } from '../auth/useLoginLogic';



export default function LoginForm({ isMerchant = false }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callback = searchParams.get('callback');

  const { error, isLoading, phoneEmailSignIn, goToSignup } = useLoginLogic({ isModal: false });


  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      setPhone(value);
    }
  };

  const isPhoneNumberValid = () => {
    return phone.length >= 8 && phone.length <= 11;
  };

  const handleSignIn = async (e) => {
    e.preventDefault();

    const formattedPhone = phone.startsWith('0')
      ? phone.substring(1)
      : phone;

    try {
      const result = await phoneEmailSignIn(formattedPhone, password);
      if (result) {
        if (callback) {
          router.push(callback);
        } else {
          router.push('/');
        }
      }
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  return (
    <div className="font-body min-h-screen bg-[var(--paper)] text-[var(--ink)] flex flex-col justify-between p-6 md:p-12">
      <style></style>

      {/* Top spacing */}
      <div className="hidden md:block"></div>

      <div className="w-full max-w-[360px] mx-auto my-auto">
        {/* Header */}
        <div
          className={
            isMerchant
              ? 'border-b-2 border-(--accent,#b5651d)pb-4'
              : 'border-b border-[var(--ink)]/15 pb-4'
          }
        >
          {isMerchant && (
            <span className="inline-block mb-2 font-tape text-[9px] uppercase tracking-[0.22em] bg-green-800 text-white px-2 py-1">
              Merchant Portal
            </span>
          )}
          <p className="font-tape text-[10px] uppercase tracking-[0.22em] text-[var(--ink)]/50">
            {isMerchant ? 'Business sign in' : 'Welcome back'}
          </p>
          <h1 className="mt-1  text-3xl font-semibold tracking-tight">
            {isMerchant ? 'Merchant Login' : 'Login'}
          </h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 border border-[var(--ink)]/20 bg-[var(--paper-dim)] px-3 py-2 text-[var(--ink)]">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSignIn} className="mt-8 space-y-5">
          {/* Phone Number Field */}
          <div>
            <label htmlFor="phone" className="font-tape text-[10px] uppercase tracking-[0.22em] text-[var(--ink)]/50">
              {isMerchant ? 'Phone number' : 'Phone number'}
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="012 xxx 456"
              value={phone}
              onChange={handlePhoneChange}
              required
              className={
                isMerchant
                  ? 'mt-2 w-full border border-[var(--accent,#b5651d)]/40 bg-white px-3 py-2.5 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink)]/30 focus:border-[var(--accent,#b5651d)] disabled:opacity-50 transition-colors duration-200'
                  : 'mt-2 w-full border border-[var(--ink)]/25 bg-white px-3 py-2.5 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink)]/30 focus:border-[var(--ink)] disabled:opacity-50 transition-colors duration-200'
              }
              disabled={isLoading}
              autoComplete="tel"
            />
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-baseline justify-between">
              <label htmlFor="password" className="font-tape text-[10px] uppercase tracking-[0.22em] text-[var(--ink)]/50">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="font-tape text-[10px] uppercase tracking-[0.18em] text-[var(--ink)]/50 hover:text-[var(--ink)] transition-colors duration-200 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className={
                isMerchant
                  ? 'mt-2 w-full border border-[var(--accent,#b5651d)]/40 bg-white px-3 py-2.5 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink)]/30 focus:border-[var(--accent,#b5651d)] disabled:opacity-50 transition-colors duration-200'
                  : 'mt-2 w-full border border-[var(--ink)]/25 bg-white px-3 py-2.5 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink)]/30 focus:border-[var(--ink)] disabled:opacity-50 transition-colors duration-200'
              }
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !isPhoneNumberValid() || !password}
            className={
              isMerchant
                ? 'press flex w-full items-center justify-center gap-2 bg-black px-6 py-3 font-tape text-xs uppercase tracking-[0.2em] text-white hover:opacity-90 disabled:opacity-30 transition-colors duration-200'
                : 'press flex w-full items-center justify-center gap-2 bg-[var(--ink)] px-6 py-3 font-tape text-xs uppercase tracking-[0.2em] text-[var(--paper)] hover:opacity-90 disabled:opacity-30 transition-colors duration-200'
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{isMerchant ? 'Sign in to dashboard' : 'Login'}</span>
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 flex flex-col gap-2 border-t border-dashed border-(--ink)/20 pt-6">
          <button
            onClick={goToSignup}
            disabled={isLoading}
            className="text-left font-tape text-[10px] uppercase tracking-[0.18em] text-(--ink)/55 hover:text-ink transition-colors duration-200 focus:outline-none"
          >
            {isMerchant ? 'Create an account' : 'Create an account'}
          </button>
          <button
            onClick={() => router.push('/forgot-password')}
            disabled={isLoading}
            className="text-left font-tape text-[10px] uppercase tracking-[0.18em] text-[var(--ink)]/55 hover:text-[var(--ink)] transition-colors duration-200 focus:outline-none"
          >
            Forgot password?
          </button>
        </div>
      </div>

      {/* Branding footer */}
      <div className="text-center md:text-left font-tape text-[9px] uppercase tracking-[0.22em] text-[var(--ink)]/40 mt-auto pt-12">
        © {new Date().getFullYear()} RielPoint. All rights reserved.
      </div>
    </div>
  );
}