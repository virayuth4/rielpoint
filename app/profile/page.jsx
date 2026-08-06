"use client"

import React, { useState, useEffect } from 'react'
import authenticatedFetch from '../auth/authenticatedFetch'
import { getCachedProfile, setCachedProfile, fetchProfileDeduped } from '../auth/profileCache'
import { signOut } from 'firebase/auth'
import { auth } from '@/app/firebase/config'
import { clearUserData } from '../auth/authContext';
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/formatDate'
import { Button } from '@/components/ui/button'

function initialFor(name) {
  return (name || '?').trim().charAt(0).toUpperCase();
}

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
          console.log('data', data)
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
      clearUserData();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  return (
    <main className="min-h-screen" style={{ background: '#FFFFFF', fontFamily: 'var(--font-body)' }}>
      <div className="mx-auto max-w-md px-6 pt-10 pb-20">
        <p className="text-[11px] uppercase tracking-[0.18em] mb-6" style={{ color: '#9A9A9A' }}>
          Profile
        </p>

        {status === 'loading' && (
          <p className="text-sm text-center py-10" style={{ color: '#9A9A9A' }}>
            Loading…
          </p>
        )}

        {status === 'unauthenticated' && (
          <p className="text-sm text-center py-10" style={{ color: '#9A9A9A' }}>
            Redirecting to sign in…
          </p>
        )}

        {status === 'error' && (
          <p className="text-sm text-center py-10" style={{ color: '#B3453D' }}>
            {errorMessage}
          </p>
        )}

        {status === 'ready' && (
          <>
            {/* Identity — flat, no card */}
            <div className="flex items-center gap-3 mb-10">
              {session?.picture ? (
                <img
                  src={session.picture}
                  alt=""
                  className="h-11 w-11 rounded-full object-cover shrink-0"
                />
              ) : (
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                  style={{ background: '#F3F3EF', color: '#0F0F0E' }}
                >
                  {initialFor(session?.name || session?.email)}
                </span>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: '#0F0F0E' }}>
                  {session?.fullname || 'Your Profile'}
                </p>
              
              </div>
            </div>

         {/* Account details */}
<div className="mb-10">
  {[
    { label: 'Role', value: profile?.role },
    { label: 'Full name', value: profile?.fullname },
    { label: 'Customer number', value: profile?.customer_number },
    { label: 'Role', value: profile?.role },
    { label: 'Balance', value: profile?.balance },
    { label: 'Joined', value: formatDate(profile?.created_at) },
  ].map((row, i) => (
    <div
      key={`${row.label}-${i}`}
      className="flex items-center justify-between gap-4 py-3.5"
      style={{ borderTop: i === 0 ? 'none' : '1px solid #EFEFED' }}
    >
      <p className="text-sm capitalize" style={{ color: '#9A9A9A' }}>
        {row.label}
      </p>
      <p className="text-sm truncate text-right" style={{ color: '#0F0F0E' }}>
        {row.value === null || row.value === undefined || row.value === ''
          ? '—'
          : String(row.value)}
      </p>
    </div>
  ))}

    <Button
              onClick={handleSignOut}
              className="w-full text-center text-sm font-medium py-4 rounded-full transition-colors duration-150 mt-8"
              style={{
                color: '#B3453D',
                border: '1px solid #EFEFED',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#FBEFEE'
                e.currentTarget.style.borderColor = '#F0D8D6'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = '#EFEFED'
              }}
            >
              Sign out
            </Button>

  {!profile && (
    <p className="text-sm text-center py-10" style={{ color: '#9A9A9A' }}>
      No profile details available.
    </p>
  )}
</div>

       
          </>
        )}
      </div>
    </main>
  )
}