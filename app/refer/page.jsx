"use client"

import React, { useState, useEffect } from 'react'
import authenticatedFetch from '../auth/authenticatedFetch'
import { getCachedProfile, setCachedProfile, fetchProfileDeduped } from '../auth/profileCache'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function ReferralPage() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [status, setStatus] = useState('loading') // 'loading' | 'error' | 'ready' | 'unauthenticated'
  const [errorMessage, setErrorMessage] = useState('')
  const [copied, setCopied] = useState(false)
  const [referralStats, setReferralStats] = useState(null) // { count, earned }

  useEffect(() => {
    async function loadProfile() {
      const cached = getCachedProfile();
      if (cached) {
        setProfile(cached.user);
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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Optional: fetch referral stats (how many friends referred, how much earned)
  useEffect(() => {
    async function loadStats() {
      try {
        const res = await authenticatedFetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/referrals/stats`)
        if (res.ok) {
          const data = await res.json();
          setReferralStats(data); // expects { count, earned }
        }
      } catch (error) {
        console.error('Error fetching referral stats:', error);
      }
    }
    if (status === 'ready') loadStats();
  }, [status]);

  // Adjust this to whatever field your API actually returns as the unique id
  const referralId = profile?.id || profile?.user_id || profile?.customer_number
  const referralLink = referralId
    ? `${typeof window !== 'undefined' ? 'https://www.rielpoint.com' : ''}/signup?ref=${referralId}`
    : ''

  const handleCopy = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  const handleShare = async () => {
    if (!referralLink) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Book with me',
          text: `Use my link to sign up — we both get $1 when you complete your first booking.`,
          url: referralLink,
        });
      } catch (error) {
        if (error?.name !== 'AbortError') {
          console.error('Error sharing link:', error);
        }
      }
    } else {
      handleCopy();
    }
  };

  return (
    <main className="min-h-screen" style={{ background: '#FFFFFF', fontFamily: 'var(--font-body)' }}>
      <div className="mx-auto max-w-md px-6 pt-10 pb-20">
        <p className="text-[11px] uppercase tracking-[0.18em] mb-6" style={{ color: '#9A9A9A' }}>
          Referral
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
            {/* Headline */}
            <h1 className="text-xl font-semibold mb-2" style={{ color: '#0F0F0E' }}>
              Give $1, get $1
            </h1>
            <p className="text-sm mb-8" style={{ color: '#6B6B6B' }}>
              Invite a friend. When they complete their first booking, you both get $1 credit — automatically, no forms to fill out.
            </p>

            {/* Link box */}
            <div
              className="rounded-lg px-4 py-3.5 mb-4 text-sm truncate"
              style={{ background: '#F3F3EF', color: '#0F0F0E', border: '1px solid #EFEFED' }}
            >
              {referralLink || 'No referral link available'}
            </div>

            <div className="flex gap-3 mb-10">
              <Button
                onClick={handleCopy}
                className="flex-1 text-center text-sm font-medium py-4 transition-colors duration-150"
              >
                {copied ? 'Copied!' : 'Copy link'}
              </Button>

              <Button
                onClick={handleShare}
                className="flex-1 text-center text-sm font-medium py-4 transition-colors duration-150"
              >
                Share
              </Button>
            </div>

            {/* How it works — builds trust by explaining the mechanism plainly */}
            <div className="mb-10">
              <p className="text-[11px] uppercase tracking-[0.18em] mb-4" style={{ color: '#9A9A9A' }}>
                How it works
              </p>
              {[
                { step: '1', text: 'Share your link with a friend.' },
                { step: '2', text: 'They sign up and make a booking.' },
                { step: '3', text: 'Once the booking is confirmed, $1 lands in both your accounts.' },
              ].map((row) => (
                <div key={row.step} className="flex gap-3 py-2.5">
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-medium"
                    style={{ background: '#F3F3EF', color: '#0F0F0E' }}
                  >
                    {row.step}
                  </span>
                  <p className="text-sm" style={{ color: '#0F0F0E' }}>{row.text}</p>
                </div>
              ))}
            </div>

            {/* Your referral activity — real numbers make it feel less like a gimmick */}
            {referralStats && (
              <div className="mb-10">
                <p className="text-[11px] uppercase tracking-[0.18em] mb-4" style={{ color: '#9A9A9A' }}>
                  Your referrals
                </p>
                <div className="flex items-center justify-between py-2.5" style={{ borderTop: '1px solid #EFEFED' }}>
                  <p className="text-sm" style={{ color: '#9A9A9A' }}>Friends referred</p>
                  <p className="text-sm" style={{ color: '#0F0F0E' }}>{referralStats.count ?? 0}</p>
                </div>
                <div className="flex items-center justify-between py-2.5" style={{ borderTop: '1px solid #EFEFED' }}>
                  <p className="text-sm" style={{ color: '#9A9A9A' }}>Earned so far</p>
                  <p className="text-sm" style={{ color: '#0F0F0E' }}>${(referralStats.earned ?? 0).toFixed(2)}</p>
                </div>
              </div>
            )}

            {/* Fine print — reduces "is this a scam" hesitation */}
            <p className="text-xs leading-relaxed" style={{ color: '#9A9A9A' }}>
              Credit is applied automatically after your friend's booking is confirmed — no code needed on your end,
              nothing to redeem. Rewards are capped at one per new customer and may take up to 24 hours to appear
              in your balance after the booking is completed.
            </p>
          </>
        )}
      </div>
    </main>
  )
}