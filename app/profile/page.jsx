"use client"

import React, { useState, useEffect } from 'react'
import authenticatedFetch from '../auth/authenticatedFetch'
import { getCachedProfile, setCachedProfile, fetchProfileDeduped } from '../auth/profileCache'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '@/app/firebase/config'
import { checkUserSession, clearUserData } from '../auth/authContext';
import { useRouter } from 'next/navigation'
import SignUpForm from '../signup/signUpForm'





export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [session, setSession] = useState(null)
  const [status, setStatus] = useState('loading') // 'loading' | 'error' | 'ready' | 'unauthenticated'
  const [errorMessage, setErrorMessage] = useState('')


 useEffect(() => {
  async function loadProfile() {
    const cached = getCachedProfile();
    if (cached) {
      setProfile(cached.user);
      setSession(cached.session);
      setStatus('ready');
      return;
    }

    try {
      const data = await fetchProfileDeduped(async () => {
        const res = await authenticatedFetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/user/profile`)
        if (res.status === 401) throw { code: 401 };
        if (res.status === 404) throw { code: 404 };
        if (!res.ok) throw { code: 'other' };
        return res.json();
      });

      setCachedProfile(data);
      setProfile(data.user);
      setSession(data.session);
      setStatus('ready');
    } catch (err) {
      if (err.code === 401) {
        setStatus('unauthenticated');
      } else if (err.code === 404) {
        setStatus('error');
        setErrorMessage("We couldn't find a profile for this account.");
      } else {
        console.error('Error fetching profile:', err);
        setStatus('error');
        setErrorMessage('Something went wrong loading your profile.');
      }
    }
  }

  loadProfile();
}, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      clearUserData(); // clears session cache, anonId, and tracked history
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (status === 'loading') {
    return (
      <div className="max-w-lg mx-auto py-12 px-6">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-neutral-200" />
            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-neutral-200" />
              <div className="h-3 w-44 rounded bg-neutral-200" />
            </div>
          </div>
          <div className="h-24 rounded-xl bg-neutral-200" />
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="max-w-lg mx-auto py-12 px-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-900">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
        <h1 className="mt-4 text-lg font-semibold text-neutral-900">
          Sign up and claim your reward
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Create an account to unlock your profile and start earning rewards.
        </p>
        <SignUpForm/>
     
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="max-w-lg mx-auto py-12 px-6 text-center">
        <h1 className="text-lg font-medium text-neutral-900">Couldn&apos;t load your profile</h1>
        <p className="mt-2 text-sm text-neutral-500">{errorMessage}</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto py-12 px-6">
      <div className="flex items-center gap-4">
        {session?.picture ? (
          <img
            src={session.picture}
            alt=""
            className="h-16 w-16 rounded-full object-cover ring-1 ring-neutral-200"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-900 text-lg font-medium text-white">
            {(session?.name || session?.email || '?').charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-lg font-semibold text-neutral-900">
            {session?.name || 'Your Profile'}
          </h1>
          <div className="flex items-center gap-1.5 text-sm text-neutral-500">
            <span>{session?.email}</span>
            {session?.emailVerified && (
              <span className="text-xs font-medium text-emerald-600">· Verified</span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-neutral-200 bg-white">
        <dl className="divide-y divide-neutral-100">
          {Object.entries(profile || {})
            .filter(([key]) => key !== 'firebase_uid')
            .map(([key, value]) => (
              <div key={key} className="flex items-center justify-between gap-4 px-5 py-3">
                <dt className="text-sm text-neutral-500 capitalize">
                  {key.replace(/_/g, ' ')}
                </dt>
                <dd className="text-sm font-medium text-neutral-900 truncate">
                  {value === null || value === '' ? '—' : String(value)}
                </dd>
              </div>
            ))}
        </dl>
      </div>

      <button
        onClick={handleSignOut}
        className="mt-6 w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
      >
        Sign out
      </button>
    </div>
  )
}