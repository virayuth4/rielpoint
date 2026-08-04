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
    <div className="font-body min-h-screen bg-[var(--paper)] text-[var(--ink)] flex flex-col justify-between p-6 md:p-12">
      {/* Top spacing */}
      <div className="hidden md:block"></div>

      <div className="w-full max-w-[360px] mx-auto my-auto">
        {/* Header */}
        <div className="border-b border-[var(--ink)]/15 pb-4">
          <p className="font-tape text-[10px] uppercase tracking-[0.22em] text-[var(--ink)]/50">
            Get started
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Register
          </h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 border border-[var(--ink)]/20 bg-[var(--paper-dim)] px-3 py-2 text-[var(--ink)]">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {/* Full Name Field */}
          <div>
            <label htmlFor="fullName" className="font-tape text-[10px] uppercase tracking-[0.22em] text-[var(--ink)]/50">
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="Sok Dara"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="mt-2 w-full border border-[var(--ink)]/25 bg-white px-3 py-2.5 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink)]/30 focus:border-[var(--ink)] disabled:opacity-50 transition-colors duration-200"
              disabled={isLoading}
              autoComplete="name"
            />
          </div>

          {/* Phone Number Field */}
          <div>
            <label htmlFor="phoneNumber" className="font-tape text-[10px] uppercase tracking-[0.22em] text-[var(--ink)]/50">
              Phone number
            </label>
            <input
              id="phoneNumber"
              type="tel"
              placeholder="012 xxx 456"
              value={phoneNumber}
              onChange={handlePhoneChange}
              required
              className="mt-2 w-full border border-[var(--ink)]/25 bg-white px-3 py-2.5 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink)]/30 focus:border-[var(--ink)] disabled:opacity-50 transition-colors duration-200"
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
              className="mt-2 w-full border border-[var(--ink)]/25 bg-white px-3 py-2.5 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink)]/30 focus:border-[var(--ink)] disabled:opacity-50 transition-colors duration-200"
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !isPhoneNumberValid() || !fullName || !password}
            className="press flex w-full items-center justify-center gap-2 bg-[var(--ink)] px-6 py-3 font-tape text-xs uppercase tracking-[0.2em] text-[var(--paper)] hover:opacity-90 disabled:opacity-30 transition-colors duration-200"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>Create account</span>
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 flex flex-col gap-2 border-t border-dashed border-(--ink)/20 pt-6">
          <button
            onClick={() => router.push('/login')}
            disabled={isLoading}
            className="text-left font-tape text-[10px] uppercase tracking-[0.18em] text-(--ink)/55 hover:text-ink transition-colors duration-200 focus:outline-none"
          >
            Already have an account? Sign in
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

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[var(--ink)]/40"
            onClick={() => !isVerifying && setShowOtpModal(false)}
          />

          {/* Modal panel */}
          <div className="font-body relative w-full max-w-[360px] bg-[var(--paper)] text-[var(--ink)] p-6 space-y-6 border border-[var(--ink)]/25">
            <button
              type="button"
              onClick={() => setShowOtpModal(false)}
              disabled={isVerifying}
              className="absolute top-4 right-4 text-[var(--ink)]/40 hover:text-[var(--ink)] transition-colors duration-200"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="border-b border-[var(--ink)]/15 pb-4 pr-6">
              <p className="font-tape text-[10px] uppercase tracking-[0.22em] text-[var(--ink)]/50">
                One more step
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                Verification
              </h2>
              <p className="mt-2 text-sm text-[var(--ink)]/60 leading-relaxed">
                A code has been sent to +855 {formattedPhoneForApi()}
              </p>
            </div>

            <div className="font-tape text-[10px] uppercase tracking-[0.18em] text-[var(--ink)]/50">
              Expires in <span className="text-[var(--ink)]">{formatTime(timeLeft)}</span>
            </div>

            {otpError && (
              <div className="border border-[var(--ink)]/20 bg-[var(--paper-dim)] px-3 py-2 text-[var(--ink)]">
                <p className="text-sm">{otpError}</p>
              </div>
            )}

            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div>
                <label htmlFor="otp" className="font-tape text-[10px] uppercase tracking-[0.22em] text-[var(--ink)]/50">
                  Verification code
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="••••••"
                  className="mt-2 w-full border border-[var(--ink)]/25 bg-white px-3 py-2.5 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink)]/30 focus:border-[var(--ink)] disabled:opacity-50 transition-colors duration-200 tracking-[0.3em]"
                  required
                  disabled={isVerifying || timeLeft <= 0}
                  maxLength={6}
                  inputMode="numeric"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isVerifying || timeLeft <= 0}
                className="press flex w-full items-center justify-center gap-2 bg-[var(--ink)] px-6 py-3 font-tape text-xs uppercase tracking-[0.2em] text-[var(--paper)] hover:opacity-90 disabled:opacity-30 transition-colors duration-200"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Confirm code</span>
                )}
              </button>
            </form>

            <div className="border-t border-dashed border-[var(--ink)]/20 pt-4">
              {timeLeft <= 0 ? (
                attempts > 3 ? (
                  <p className="text-sm text-[var(--ink)]/50">
                    Maximum number of resend attempts reached.
                  </p>
                ) : (
                  <button
                    onClick={handleResendOTP}
                    disabled={isVerifying}
                    className="text-left font-tape text-[10px] uppercase tracking-[0.18em] text-[var(--ink)]/55 hover:text-[var(--ink)] transition-colors duration-200 focus:outline-none"
                  >
                    Resend code
                  </button>
                )
              ) : (
                <p className="text-sm text-[var(--ink)]/50 leading-relaxed">
                  Didn&apos;t get it? You can request a new code once this one expires.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}