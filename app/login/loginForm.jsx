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
  <div className="min-h-screen px-5 py-8 text-slate-900 md:px-6 md:py-12">
    <div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-sm flex-col md:justify-center ">

      {/* Header */}
      <div className="mb-8">
        {isMerchant && (
          <div className="mb-3">
            <span className="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-green-700">
              Merchant Portal
            </span>
          </div>
        )}

        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back
        </h1>

        <p className="mt-2 text-sm leading-5 text-slate-500">
          {isMerchant
            ? 'Sign in to manage your business and rewards.'
            : 'Sign in to receive cashback on your shopping.'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSignIn} className="space-y-5">

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-50 px-3.5 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Phone */}
        <div>
          <label
            htmlFor="phone"
            className="mb-1.5 block text-sm font-medium"
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
            className={`w-full rounded-lg border bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 ${
              isMerchant
                ? 'border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-50'
                : 'border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100'
            } disabled:cursor-not-allowed disabled:opacity-50`}
          />
        </div>

        {/* Password */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-medium"
            >
              Password
            </label>

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              className="text-xs font-medium text-slate-500 transition hover:text-slate-900 disabled:opacity-50"
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
            className={`w-full rounded-lg border bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 ${
              isMerchant
                ? 'border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-50'
                : 'border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100'
            } disabled:cursor-not-allowed disabled:opacity-50`}
          />
        </div>

        {/* Forgot password */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => router.push('/forgot-password')}
            disabled={isLoading}
            className="text-sm font-medium text-slate-500 transition hover:text-black disabled:opacity-50"
          >
            Forgot password?
          </button>
        </div>

        {/* Login */}
        <button
          type="submit"
          disabled={isLoading || !isPhoneNumberValid() || !password}
          className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white transition ${
            isMerchant
              ? 'bg-green-700 hover:bg-green-800'
              : 'bg-black hover:bg-black/90'
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
      <div className="mt-8 text-center text-sm">
        <span className="text-slate-500">
          Don&apos;t have an account?
        </span>{' '}

        <button
          type="button"
          onClick={goToSignup}
          disabled={isLoading}
          className={`font-semibold hover:underline disabled:opacity-50 ${
            isMerchant
              ? 'text-green-700'
              : 'text-slate-900'
          }`}
        >
          {isMerchant
            ? 'Create merchant account'
            : 'Create an account'}
        </button>
      </div>

      {/* Footer */}
      <div className="mt-10 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} RielPoint
      </div>
    </div>
  </div>
)
}