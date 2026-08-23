'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, X } from 'lucide-react';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function ForgotPasswordForm() {
  const router = useRouter();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [newPassword, setNewPassword] = useState('');       // local state only, never persisted
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // OTP modal state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const inputRefs = useRef([]);
  const [otpError, setOtpError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(RESEND_COOLDOWN);
  const [attempts, setAttempts] = useState(1);

  useEffect(() => {
    if (!showOtpModal || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [showOtpModal, timeLeft]);

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 12) setPhoneNumber(value);
  };

  const isPhoneNumberValid = () => phoneNumber.length >= 8 && phoneNumber.length <= 11;

  const formattedPhone = () => (phoneNumber.startsWith('0') ? phoneNumber.substring(1) : phoneNumber);

  const formatTime = (seconds) =>
    `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;

  // Step 1: collect phone + new password locally, request an OTP.
  // Only the phone number is sent — the password stays in this component.
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/user/forgot-password/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: formattedPhone() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to send code');

      setOtp(Array(OTP_LENGTH).fill(''));
      setOtpError('');
      setAttempts(1);
      setTimeLeft(RESEND_COOLDOWN);
      setShowOtpModal(true);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  // Step 2: send OTP + the password together — only now does the
  // password leave the browser, and only over this one request.
  const handleVerifyAndReset = async (e) => {
    e.preventDefault();
    setOtpError('');
    const otpCode = otp.join('');
    if (otpCode.length !== OTP_LENGTH) {
      setOtpError(`Please enter the ${OTP_LENGTH}-digit code`);
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/user/forgot-password/otp-confirmation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: formattedPhone(), otpCode, newPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Invalid code, please try again');

      setNewPassword('');
      setConfirmPassword('');
      router.push('/login?reset=success');
    } catch (err) {
      setOtpError(err.message || 'Something went wrong');
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (timeLeft > 0) return;
    setOtpError('');
    setAttempts((a) => a + 1);
    setIsVerifying(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/user/forgot-password/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: formattedPhone() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to resend code');
      setOtp(Array(OTP_LENGTH).fill(''));
      setTimeLeft(RESEND_COOLDOWN);
    } catch (err) {
      setOtpError(err.message || 'Could not resend code');
    } finally {
      setIsVerifying(false);
    }
  };

return (
  <div className="min-h-screen px-5 py-8 text-slate-900 md:px-6 md:py-12">
    <div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-sm flex-col justify-center">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Reset your password
        </h1>

        <p className="mt-2 text-sm leading-5 text-slate-500">
          Enter your phone number and choose a new password.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleRequestOtp} className="space-y-5">

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-50 px-3.5 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

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

        {/* New Password */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="newPassword"
              className="text-sm font-medium"
            >
              New password
            </label>

            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              disabled={isLoading}
              className="text-xs font-medium text-slate-500 transition hover:text-slate-900 disabled:opacity-50"
            >
              {showNewPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <input
            id="newPassword"
            type={showNewPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            placeholder="Enter your new password"
            disabled={isLoading}
            autoComplete="new-password"
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* Confirm Password */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium"
            >
              Confirm password
            </label>

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              disabled={isLoading}
              className="text-xs font-medium text-slate-500 transition hover:text-slate-900 disabled:opacity-50"
            >
              {showConfirmPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Confirm your new password"
            disabled={isLoading}
            autoComplete="new-password"
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={
            isLoading ||
            !isPhoneNumberValid() ||
            !newPassword ||
            !confirmPassword
          }
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Sending code...</span>
            </>
          ) : (
            <span>Send verification code</span>
          )}
        </button>
      </form>

      {/* Login */}
      <div className="mt-8 text-center text-sm">
        <span className="text-slate-500">
          Remember your password?
        </span>{' '}

        <button
          type="button"
          onClick={() => router.push('/login')}
          disabled={isLoading}
          className="font-semibold text-slate-900 hover:underline disabled:opacity-50"
        >
          Back to sign in
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
            className="absolute right-4 top-4 text-slate-400 transition hover:text-slate-900 disabled:opacity-50"
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
              Enter the verification code sent to +855{' '}
              {formattedPhone()}
            </p>
          </div>

          {/* Timer */}
          <div className="mb-5 text-center text-sm text-slate-500">
            Code expires in{' '}
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
          <form
            onSubmit={handleVerifyAndReset}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="otp-0"
                className="mb-1.5 block text-sm font-medium"
              >
                Verification code
              </label>

              <div className="flex gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) =>
                      handleOtpChange(index, e.target.value)
                    }
                    onKeyDown={(e) =>
                      handleOtpKeyDown(index, e)
                    }
                    disabled={isVerifying || timeLeft <= 0}
                    className="h-12 w-full rounded-lg border border-slate-200 bg-white text-center text-lg font-semibold text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifying || timeLeft <= 0}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Resetting password...</span>
                </>
              ) : (
                <span>Reset password</span>
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
                  onClick={handleResendOtp}
                  disabled={isVerifying}
                  className="text-sm font-medium text-slate-900 transition hover:underline disabled:opacity-50"
                >
                  Resend verification code
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