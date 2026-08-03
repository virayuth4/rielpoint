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
    <div className="min-h-screen bg-white flex flex-col justify-between p-6 md:p-12 font-mono text-xs uppercase tracking-wider text-black">
      <div className="hidden md:block"></div>

      <div className="w-full max-w-[320px] mx-auto my-auto space-y-8">
        <div className="text-left border-b border-black pb-2">
          <h1 className="text-sm font-normal tracking-widest">Reset Password</h1>
        </div>

        {error && (
          <div className="p-3 border border-black bg-neutral-50 text-stone-600 normal-case tracking-normal">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleRequestOtp} className="space-y-4">
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="Phone Number"
            value={phoneNumber}
            onChange={handlePhoneChange}
            required
            className="w-full h-10 px-0 bg-transparent border-0 border-b border-stone-300 rounded-none text-black placeholder:text-stone-400 focus-visible:border-black focus-visible:ring-0 focus-visible:outline-none transition-colors duration-200"
            disabled={isLoading}
            autoComplete="tel"
          />

          <div className="space-y-1 relative">
            <Input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="New Password"
              className="w-full h-10 px-0 pr-12 bg-transparent border-0 border-b border-stone-300 rounded-none text-black placeholder:text-stone-400 focus-visible:border-black focus-visible:ring-0 focus-visible:outline-none transition-colors duration-200"
              disabled={isLoading}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-stone-400 hover:text-black transition-colors duration-200 text-[10px] tracking-widest focus:outline-none"
            >
              {showNewPassword ? "HIDE" : "SHOW"}
            </button>
          </div>

          <div className="space-y-1 relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm New Password"
              className="w-full h-10 px-0 pr-12 bg-transparent border-0 border-b border-stone-300 rounded-none text-black placeholder:text-stone-400 focus-visible:border-black focus-visible:ring-0 focus-visible:outline-none transition-colors duration-200"
              disabled={isLoading}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-stone-400 hover:text-black transition-colors duration-200 text-[10px] tracking-widest focus:outline-none"
            >
              {showConfirmPassword ? "HIDE" : "SHOW"}
            </button>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              className="w-full h-11 bg-black hover:bg-neutral-800 text-white font-normal tracking-widest rounded-none border-0 shadow-none transition-colors duration-200 disabled:opacity-30 disabled:bg-black"
              disabled={isLoading || !isPhoneNumberValid() || !newPassword || !confirmPassword}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>PROCESSING...</span>
                </div>
              ) : <span>Send Code</span>}
            </Button>
          </div>
        </form>

        <div className="flex flex-col space-y-2 text-[10px] text-stone-500 tracking-widest pt-2">
          <button
            onClick={() => router.push('/login')}
            disabled={isLoading}
            className="text-left hover:text-black transition-colors duration-200 focus:outline-none"
          >
            Back to Sign In
          </button>
        </div>
      </div>

      <div className="text-center md:text-left text-[9px] text-stone-400 tracking-widest mt-auto pt-12">
        © {new Date().getFullYear()} ALL RIGHTS RESERVED
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !isVerifying && setShowOtpModal(false)}
          />

          {/* Modal panel */}
          <div className="relative w-full max-w-[320px] bg-white p-6 space-y-6 font-mono text-xs uppercase tracking-wider text-black border border-black">
            <button
              type="button"
              onClick={() => setShowOtpModal(false)}
              disabled={isVerifying}
              className="absolute top-4 right-4 text-stone-400 hover:text-black transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="border-b border-black pb-3 space-y-2 pr-6">
              <h2 className="text-sm font-normal tracking-widest">Verification</h2>
              <p className="text-[10px] text-stone-500 normal-case tracking-normal leading-relaxed">
                A validation code has been transmitted to +855 {formattedPhone()}
              </p>
            </div>

            <div className="text-left text-[10px] text-stone-500 tracking-widest">
              EXPIRES IN: <span className="text-black font-normal">{formatTime(timeLeft)}</span>
            </div>

            {otpError && (
              <div className="p-3 border border-black bg-neutral-50 text-stone-600 normal-case tracking-normal">
                <p>{otpError}</p>
              </div>
            )}

            <form onSubmit={handleVerifyAndReset} className="space-y-6">
              <div className="flex justify-between gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    disabled={isVerifying || timeLeft <= 0}
                    className="w-9 h-10 text-center text-sm font-normal bg-transparent border-0 border-b border-stone-300 rounded-none text-black focus:outline-none focus:border-black transition-colors duration-200"
                  />
                ))}
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-black hover:bg-neutral-800 text-white font-normal tracking-widest rounded-none border-0 shadow-none transition-colors duration-200 disabled:opacity-30 disabled:bg-black"
                disabled={isVerifying || timeLeft <= 0}
              >
                {isVerifying ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>VERIFYING...</span>
                  </div>
                ) : 'CONFIRM CODE'}
              </Button>
            </form>

            <div className="pt-2 border-t border-stone-100">
              {timeLeft <= 0 ? (
                attempts > 3 ? (
                  <p className="text-stone-400 normal-case tracking-normal text-[10px]">
                    Maximum allocation of code retransmissions exceeded.
                  </p>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    disabled={isVerifying}
                    className="text-left text-black hover:underline underline-offset-4 focus:outline-none text-[10px] tracking-widest"
                  >
                    Resend Code
                  </button>
                )
              ) : (
                <p className="normal-case tracking-normal text-stone-400 leading-relaxed text-[10px]">
                  If the message was not received, a new request will become available once the active sequence expires.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}