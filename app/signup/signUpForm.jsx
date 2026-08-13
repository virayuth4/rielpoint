'use client';

import React, { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSignUpLogic } from '../auth/signUpLogic';

export default function SignUpForm() {
  const router = useRouter();
  const { phoneEmailSignUp } = useSignUpLogic({ isModal: false });

  // Signup fields — all local, never persisted
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // OTP modal state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [attempts, setAttempts] = useState(1);

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 12) setPhoneNumber(value);
  };

  const isPhoneNumberValid = () => phoneNumber.length >= 8 && phoneNumber.length <= 11;

  // Step 1: submit fullName + phoneNumber + password, get OTP sent
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const formattedPhoneNumber = phoneNumber.startsWith('0')
        ? phoneNumber.substring(1)
        : phoneNumber;

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/user/registration/initiate`, {
        method: "POST",
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: formattedPhoneNumber, fullName, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to send OTP');
      }

      setTimeLeft(60);
      setShowOtpModal(true);
    } catch (error) {
      setError(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Countdown for the modal
  React.useEffect(() => {
    if (!showOtpModal || timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [showOtpModal, timeLeft]);

  const formattedPhoneForApi = () =>
    phoneNumber.startsWith('0') ? phoneNumber.substring(1) : phoneNumber;

  // Step 2: confirm OTP, then create the account
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setOtpError('');

    try {
      const verifyResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/user/registration/otp/confirmation/${formattedPhoneForApi()}`,
        {
          method: "POST",
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ otp })
        }
      );

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        throw new Error(errorData.error || errorData.message || 'Invalid code');
      }

      // Backend already created the account using the password from step 1
      // (see backend notes below) — sign the user in client-side now

      const result = await phoneEmailSignUp(formattedPhoneForApi(), password, fullName);

      if (result.success) {
        setPassword(''); // clear from memory, done with it
        router.push('/');
      } else {
        throw new Error(result.error || 'Failed to complete sign in');
      }
    } catch (error) {
      setOtpError(error.message || 'Failed to verify code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    setAttempts(a => a + 1);
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/flutter/user/registration/otp/resend/${formattedPhoneForApi()}`, {
      method: "POST",
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, attempts: attempts + 1 })
    });
    setTimeLeft(60);
  };

  const formatTime = (seconds) =>
    `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;

 return (
  <div className="min-h-screen px-4 py-0 text-black md:px-6 md:py-12">
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">

      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Create your account
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Join RielPoint and start earning rewards.
        </p>
      </div>

      {/* Card */}
      <div className="rounded-sm border border-slate-100 bg-white p-6 md:p-8">

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Full Name */}
          <div>
            <label
              htmlFor="fullName"
              className="mb-2 block text-sm font-semibold text-black"
            >
              Full name
            </label>

            <input
              id="fullName"
              type="text"
              placeholder="Sok Dara"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="name"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phoneNumber"
              className="mb-2 block text-sm font-semibold text-black"
            >
              Phone number
            </label>

            <input
              id="phoneNumber"
              type="tel"
              placeholder="012 xxx 456"
              value={phoneNumber}
              onChange={handlePhoneChange}
              required
              disabled={isLoading}
              autoComplete="tel"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Password */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-black"
              >
                Password
              </label>

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
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
              autoComplete="new-password"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Create Account */}
          <button
            type="submit"
            disabled={
              isLoading ||
              !isPhoneNumberValid() ||
              !fullName ||
              !password
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <span>Create account</span>
            )}
          </button>
        </form>

        {/* Login */}
        <div className="mt-6 border-t border-slate-100 pt-6">
          <p className="mb-3 text-center text-sm text-slate-500">
            Already have an account?
          </p>

          <button
            type="button"
            onClick={() => router.push('/login')}
            disabled={isLoading}
            className="flex w-full items-center justify-center rounded-xl border-2 border-slate-900 px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Sign in
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} RielPoint. All rights reserved.
      </div>
    </div>

    {/* OTP Modal */}
    {showOtpModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="relative w-full max-w-md rounded-sm border border-slate-100 bg-white p-6 text-black md:p-8">

          {/* Close */}
          <button
            type="button"
            onClick={() => setShowOtpModal(false)}
            disabled={isVerifying}
            className="absolute right-5 top-5 text-slate-400 transition hover:text-black disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="mb-6 pr-8">
            <h2 className="text-2xl font-bold tracking-tight">
              Verify your phone
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Enter the verification code sent to +855{' '}
              {formattedPhoneForApi()}
            </p>
          </div>

          {/* Timer */}
          <div className="mb-5 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
            Code expires in{' '}
            <span className="font-semibold text-slate-900">
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* OTP Error */}
          {otpError && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {otpError}
            </div>
          )}

          {/* OTP Form */}
          <form onSubmit={handleVerifyOTP} className="space-y-5">

            <div>
              <label
                htmlFor="otp"
                className="mb-2 block text-sm font-semibold text-black"
              >
                Verification code
              </label>

              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, ''))
                }
                placeholder="Enter 6-digit code"
                required
                disabled={isVerifying || timeLeft <= 0}
                maxLength={6}
                inputMode="numeric"
                autoFocus
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-lg font-semibold tracking-[0.35em] text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={isVerifying || timeLeft <= 0}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Verify phone</span>
              )}
            </button>
          </form>

          {/* Resend */}
          <div className="mt-6 border-t border-slate-100 pt-5">
            {timeLeft <= 0 ? (
              attempts > 3 ? (
                <p className="text-center text-sm text-slate-400">
                  Maximum number of resend attempts reached.
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isVerifying}
                  className="w-full text-center text-sm font-semibold text-slate-900 transition hover:text-slate-600 disabled:opacity-50"
                >
                  Resend verification code
                </button>
              )
            ) : (
              <p className="text-center text-sm text-slate-400">
                Didn&apos;t receive the code? You can request a new one
                after it expires.
              </p>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
);
}