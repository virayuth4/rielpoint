'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <div className="min-h-screen bg-white flex flex-col justify-between p-6 md:p-12 font-mono text-xs uppercase tracking-wider text-black">
      <div className="hidden md:block"></div>

      <div className="w-full max-w-[320px] mx-auto my-auto space-y-8">
        <div className="text-left border-b border-black pb-2">
          <h1 className="text-sm font-normal tracking-widest">Register</h1>
        </div>

        {error && (
          <div className="p-3 border border-black bg-neutral-50 text-stone-600 normal-case tracking-normal">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="fullName"
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full h-10 px-0 bg-transparent border-0 border-b border-stone-300 rounded-none text-black placeholder:text-stone-400 focus-visible:border-black focus-visible:ring-0 focus-visible:outline-none transition-colors duration-200"
            disabled={isLoading}
            autoComplete="name"
          />

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
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Password"
              className="w-full h-10 px-0 pr-12 bg-transparent border-0 border-b border-stone-300 rounded-none text-black placeholder:text-stone-400 focus-visible:border-black focus-visible:ring-0 focus-visible:outline-none transition-colors duration-200"
              disabled={isLoading}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-stone-400 hover:text-black transition-colors duration-200 text-[10px] tracking-widest focus:outline-none"
            >
              {showPassword ? "HIDE" : "SHOW"}
            </button>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              className="w-full h-11 bg-black hover:bg-neutral-800 text-white font-normal tracking-widest rounded-none border-0 shadow-none transition-colors duration-200 disabled:opacity-30 disabled:bg-black"
              disabled={isLoading || !isPhoneNumberValid() || !fullName || !password}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>PROCESSING...</span>
                </div>
              ) : <span>Create Account</span>}
            </Button>
          </div>
        </form>

        <div className="flex flex-col space-y-2 text-[10px] text-stone-500 tracking-widest pt-2">
          <button
            onClick={() => router.push('/login')}
            disabled={isLoading}
            className="text-left hover:text-black transition-colors duration-200 focus:outline-none"
          >
            Already have an account? Sign in
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
                A validation code has been transmitted to +855 {formattedPhoneForApi()}
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

            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <Input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="ENTER CODE"
                className="w-full h-10 px-0 bg-transparent border-0 border-b border-stone-300 rounded-none text-black placeholder:text-stone-400 focus-visible:border-black focus-visible:ring-0 focus-visible:outline-none transition-colors duration-200 text-left tracking-widest"
                required
                disabled={isVerifying || timeLeft <= 0}
                maxLength={6}
                inputMode="numeric"
                autoFocus
              />

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
                    onClick={handleResendOTP}
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