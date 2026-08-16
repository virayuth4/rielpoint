'use client'
import React, { useState } from 'react';
import { Loader2, ArrowRight } from 'lucide-react'
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
    <div className="min-h-screen  px-4 py-0 text-black md:px-6 md:py-12">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">

        {/* Header */}
        <div className="mb-6 text-center">
         

          {isMerchant && (
            <span className="mb-3 inline-flex rounded-full bg-green-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-green-700">
              Merchant Portal
            </span>
          )}

          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {isMerchant ? 'Welcome back' : 'Welcome back'}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {isMerchant
              ? 'Sign in to manage your business and rewards.'
              : 'Sign in to receive cashback on your shopping.'}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-slate-100 bg-white p-6  md:p-8">

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-5">

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-semibold text-black"
              >
                Phone number
              </label>

              <input
                id="phone"
                type="tel"
                placeholder="012 xxx 456"
                value={phone}
                onChange={handlePhoneChange}
                required
                disabled={isLoading}
                autoComplete="tel"
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition ${
                  isMerchant
                    ? 'border-green-200 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100'
                    : 'border-slate-200 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100'
                } disabled:cursor-not-allowed disabled:opacity-50`}
              />
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold black"
                >
                  Password
                </label>

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs font-semibold text-black transition hover:text-slate-900"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                disabled={isLoading}
                autoComplete="current-password"
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-black outline-none transition ${
                  isMerchant
                    ? 'border-green-200 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100'
                    : 'border-slate-200 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100'
                } disabled:cursor-not-allowed disabled:opacity-50`}
              />
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => router.push('/forgot-password')}
                disabled={isLoading}
                className="text-sm font-medium text-black transition hover:text-slate-900"
              >
                Forgot password?
              </button>
            </div>

            {/* Login */}
            <button
              type="submit"
              disabled={isLoading || !isPhoneNumberValid() || !password}
              className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold text-white shadow-sm transition ${
                isMerchant
                  ? 'bg-green-700 hover:bg-green-800'
                  : 'bg-slate-900 hover:bg-slate-800'
              } disabled:cursor-not-allowed disabled:opacity-40`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing in...</span>
                </> 
              ) : (
                <span>
                  {isMerchant ? 'Sign in to dashboard' : 'Sign in'}
                </span>
              )}
            </button>
          </form>

          {/* Signup */}
          <div className="mt-6 border-t border-slate-100 pt-6">
            <p className="mb-3 text-center text-sm text-slate-500">
              Don&apos;t have an account?
            </p>

            <button
              type="button"
              onClick={goToSignup}
              disabled={isLoading}
              className={`group flex w-full items-center justify-center gap-2 rounded-xl border-2 px-5 py-3 text-sm font-bold transition ${
                isMerchant
                  ? 'border-green-600 text-green-700 hover:bg-green-50'
                  : 'border-slate-900 text-slate-900 hover:bg-slate-50'
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <span>
                {isMerchant ? 'Create merchant account' : 'Create an account'}
              </span>

              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} RielPoint. All rights reserved.
        </div>
      </div>
    </div>
  )
}