'use client'
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

import { useLoginLogic } from '../auth/useLoginLogic';

export default function LoginForm() {
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
    <div className="min-h-screen bg-white flex flex-col justify-between p-6 md:p-12 font-mono text-xs uppercase tracking-wider text-black">
      {/* Top spacing to replicate luxury e-commerce grid flow */}
      <div className="hidden md:block"></div>

      <div className="w-full max-w-[320px] mx-auto my-auto space-y-8">
        {/* Header */}
        <div className="text-left border-b border-black pb-2">
          <h1 className="text-sm font-normal tracking-widest">
            {("Login")}
          </h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 border border-black bg-neutral-50 text-stone-600 normal-case tracking-normal">
            <p>{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSignIn} className="space-y-4">
          {/* Phone Number Field */}
          <div className="space-y-1">
            <Input
              id="phone"
              type="tel"
              placeholder={("Phone Number")}
              value={phone}
              onChange={handlePhoneChange}
              required
              className="w-full h-10 px-0 bg-transparent border-0 border-b border-stone-300 rounded-none text-black placeholder:text-stone-400 focus-visible:border-black focus-visible:ring-0 focus-visible:outline-none transition-colors duration-200"
              disabled={isLoading}
              autoComplete="tel"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-1 relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder={("Password")}
              className="w-full h-10 px-0 pr-12 bg-transparent border-0 border-b border-stone-300 rounded-none text-black placeholder:text-stone-400 focus-visible:border-black focus-visible:ring-0 focus-visible:outline-none transition-colors duration-200"
              disabled={isLoading}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-stone-400 hover:text-black transition-colors duration-200 text-[10px] tracking-widest focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "HIDE" : "SHOW"}
            </button>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button 
              className="w-full h-11 bg-black hover:bg-neutral-800 text-white font-normal tracking-widest rounded-none border-0 shadow-none transition-colors duration-200 disabled:opacity-30 disabled:bg-black"
              type="submit" 
              disabled={isLoading || !isPhoneNumberValid() || !password}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>PROCESSING...</span>
                </div>
              ) : (
                <span>LOGIN</span>
              )}
            </Button>
          </div>
        </form>

        {/* Footer Links */}
        <div className="flex flex-col space-y-2 text-[10px] text-stone-500 tracking-widest pt-2">
          <button 
            onClick={goToSignup}
            disabled={isLoading}
            className="text-left hover:text-black transition-colors duration-200 focus:outline-none"
          >
            {("Create an account")}
          </button>
          <button
            onClick={() => router.push('/forgot-password')}
            disabled={isLoading}
            className="text-left hover:text-black transition-colors duration-200 focus:outline-none"
          >
            {("Forgot password?")}
          </button>
        </div>
      </div>

      {/* Subtle branding or copyright alignment at the bottom */}
      <div className="text-center md:text-left text-[9px] text-stone-400 tracking-widest mt-auto pt-12">
        © {new Date().getFullYear()} ALL RIGHTS RESERVED
      </div>
    </div>
  );
}