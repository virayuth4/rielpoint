'use client';

import React, { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSignUpLogic } from '../auth/signUpLogic';

export default function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { phoneEmailSignUp } = useSignUpLogic({ isModal: false });

  // Signup fields — all local, never persisted
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);


  // OTP modal state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [attempts, setAttempts] = useState(1);

   const [referredBy] = useState(() => {
    const ref = searchParams.get('ref');
    return ref && /^\d+$/.test(ref) ? ref : null; // must be a plain integer id
  });

  // console.log("Refered By", referredBy)

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

      const result = await phoneEmailSignUp(formattedPhoneForApi(), password, fullName, referredBy);

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
  setIsResending(true);
  setOtpError('');

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND}/api/user/registration/otp/resend/${formattedPhoneForApi()}`,
      {
        method: "POST",
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to resend code');
    }

    setAttempts(data.resendCount);
    setTimeLeft(60);
  } catch (err) {
    setOtpError(err.message || 'Failed to resend code. Please try again.');
  } finally {
    setIsResending(false);
  }
};

  const formatTime = (seconds) =>
    `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;

return (
  <div className="min-h-screen px-5 py-8 text-slate-900 md:px-6 md:py-12">
    <div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-sm flex-col md:justify-center">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create your account
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Start earning cashback with RielPoint.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-50 px-3.5 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Full Name */}
        <div>
          <label
            htmlFor="fullName"
            className="mb-1.5 block text-sm font-medium"
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
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* Phone */}
        <div>
          <label
            htmlFor="phoneNumber"
            className="mb-1.5 block text-sm font-medium"
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
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
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
              className="text-xs font-medium text-slate-500 hover:text-slate-900 disabled:opacity-50"
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
            placeholder="Enter your password"
            disabled={isLoading}
            autoComplete="new-password"
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
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
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-40"
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
      <div className="mt-8 text-center text-sm">
        <span className="text-slate-500">
          Already have an account?
        </span>{" "}
        <button
          type="button"
          onClick={() => router.push("/login")}
          disabled={isLoading}
          className="font-semibold text-slate-900 hover:underline disabled:opacity-50"
        >
          Sign in
        </button>
      </div>

      {/* Footer */}
      <div className="mt-10 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} RielPoint
      </div>
    </div>

    {/* OTP Modal */}
    {showOtpModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-5">
        <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">

          {/* Close */}
          <button
            type="button"
            onClick={() => setShowOtpModal(false)}
            disabled={isVerifying}
            className="absolute right-4 top-4 text-slate-400 hover:text-slate-900 disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="mb-6 pr-8">
            <h2 className="text-xl font-semibold tracking-tight">
              Verify your phone
            </h2>

            <p className="mt-2 text-sm leading-5 text-slate-500">
              Enter the code sent to +855{" "}
              {formattedPhoneForApi()}
            </p>
          </div>

          {/* Timer */}
          <div className="mb-5 text-center text-sm text-slate-500">
            Code expires in{" "}
            <span className="font-medium text-slate-900">
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* OTP Error */}
          {otpError && (
            <div className="mb-5 rounded-lg bg-red-50 px-3.5 py-3 text-sm text-red-600">
              {otpError}
            </div>
          )}

          {/* OTP Form */}
          <form onSubmit={handleVerifyOTP} className="space-y-5">

            <div>
              <label
                htmlFor="otp"
                className="mb-1.5 block text-sm font-medium"
              >
                Verification code
              </label>

              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, ""))
                }
                placeholder="000000"
                required
                disabled={isVerifying || timeLeft <= 0}
                maxLength={6}
                inputMode="numeric"
                autoFocus
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-center text-lg font-semibold tracking-[0.3em] outline-none transition placeholder:text-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={isVerifying || timeLeft <= 0}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-40"
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
          <div className="mt-6 text-center">
            {timeLeft <= 0 ? (
              attempts > 3 ? (
                <p className="text-sm text-slate-400">
                  Maximum resend attempts reached.
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isVerifying || isResending}
                  className="text-sm font-medium text-slate-900 hover:underline disabled:opacity-50"
                >
                  {isResending ? "Resending..." : "Resend verification code"}
                </button>
              )
            ) : (
              <p className="text-sm text-slate-400">
                You can request a new code after it expires.
              </p>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
);
}