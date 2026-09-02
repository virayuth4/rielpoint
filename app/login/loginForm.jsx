'use client'
import React, { useState } from 'react';
import { Loader2, ArrowRight } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation';

import { useLoginLogic } from '../auth/useLoginLogic';

function GoogleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...props}>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.27v3.11A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.6H1.27a12 12 0 0 0 0 10.8l4-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.6l4 3.11C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

export default function LoginForm({ isMerchant = false }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callback = searchParams.get('callback');

  const { error, isLoading, phoneEmailSignIn, googleSignIn, goToSignup } = useLoginLogic({ isModal: false });


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

  // googleSignIn already redirects on success via handleGoogleSuccessfulLogin,
  // both for returning users and for people who've never signed up before.
  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();
    } catch (err) {
      console.error('Google sign-in failed:', err);
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

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-lg bg-red-50 px-3.5 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Google */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <GoogleIcon />
        )}
        <span>Continue with Google</span>
      </button>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-medium text-slate-400">OR</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      {/* Form */}
      <form onSubmit={handleSignIn} className="space-y-5">

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