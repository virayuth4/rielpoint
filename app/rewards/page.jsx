"use client"

import React, { useState, useEffect } from "react"
import authenticatedFetch from "../auth/authenticatedFetch"
import {
  getCachedProfile,
  setCachedProfile,
  fetchProfileDeduped,
} from "../auth/profileCache"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function ReferralPage() {
  const router = useRouter()

  const [profile, setProfile] = useState(null)
  const [status, setStatus] = useState("loading")
  const [errorMessage, setErrorMessage] = useState("")
  const [copied, setCopied] = useState(false)
  const [referralStats, setReferralStats] = useState(null)

  useEffect(() => {
    async function loadProfile() {
      const cached = getCachedProfile()

      if (cached) {
        setProfile(cached.user)
        setStatus("ready")
        return
      }

      try {
        const data = await fetchProfileDeduped(async () => {
          const res = await authenticatedFetch(
            `${process.env.NEXT_PUBLIC_BACKEND}/api/user/profile`
          )

          if (res.status === 401) throw { code: 401 }
          if (res.status === 404) throw { code: 404 }
          if (!res.ok) throw { code: "other" }

          return res.json()
        })

        setCachedProfile(data)
        setProfile(data.user)
        setStatus("ready")
      } catch (err) {
        if (err.code === 401) {
          setStatus("unauthenticated")
        } else if (err.code === 404) {
          setStatus("error")
          setErrorMessage(
            "We couldn't find a profile for this account."
          )
        } else {
          console.error("Error fetching profile:", err)
          setStatus("error")
          setErrorMessage(
            "Something went wrong loading your profile."
          )
        }
      }
    }

    loadProfile()
  }, [])

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await authenticatedFetch(
          `${process.env.NEXT_PUBLIC_BACKEND}/api/referrals/stats`
        )

        if (res.ok) {
          const data = await res.json()
          setReferralStats(data)
        }
      } catch (error) {
        console.error("Error fetching referral stats:", error)
      }
    }

    if (status === "ready") {
      loadStats()
    }
  }, [status])

  const referralId =
    profile?.id ||
    profile?.user_id ||
    profile?.customer_number

  const referralLink = referralId
    ? `https://www.rielpoint.com/signup?ref=${referralId}`
    : ""

  const isAuthenticated = status === "ready" && Boolean(profile)
  const earned = Number(referralStats?.earned ?? 0)
  const count = Number(referralStats?.count ?? 0)

  const handleCopy = async () => {
    if (!referralLink) return

    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)

      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (error) {
      console.error("Error copying link:", error)
    }
  }

  const handleShare = async () => {
    if (!referralLink) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Earn $3 with RielPoint (Limited Time)",
          text:
            "Join RielPoint using my link! Get started today and earn rewards on your first booking.",
          url: referralLink,
        })
      } catch (error) {
        if (error?.name !== "AbortError") {
          console.error("Error sharing link:", error)
        }
      }
    } else {
      handleCopy()
    }
  }

  return (
    <main className="min-h-screen bg-white font-sans">
      <div className="mx-auto max-w-lg px-5 pb-20 pt-8">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-500">
              RielPoint x Trip.com Rewards
            </p>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
              Limited Time
            </span>
          </div>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">
            Refer a friend, get a boosted $3
          </h1>

          <p className="mt-1 text-sm text-neutral-500">
            Earn $3 (normally $2) for every friend who completes their first booking.
          </p>
        </div>

        {/* Loading State */}
        {status === "loading" && (
          <div className="py-16 text-center">
            <p className="text-sm text-neutral-400">Loading...</p>
          </div>
        )}

        {/* Error State */}
        {status === "error" && (
          <div className="py-16 text-center">
            <p className="text-sm text-red-600">{errorMessage}</p>
          </div>
        )}

        {/* Ready / Unauthenticated View */}
        {(status === "ready" || status === "unauthenticated") && (
          <>
            {/* Reward Card */}
            <section className="relative overflow-hidden rounded-2xl bg-black text-white">
              {/* Subtle top promotional banner strip */}
              <div className="bg-amber-400/15 border-b border-amber-400/20 px-6 py-1.5 text-center">
                <p className="text-[11px] font-medium tracking-wide text-amber-300">
                   Special Bonus: +$1 extra per referral for a limited time
                </p>
              </div>

              <div className="px-6 pb-7 pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                      Limited-Time Referral Bonus
                    </p>

                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-5xl font-bold tracking-tight text-white">
                        $3
                      </span>

                      <span className="text-xl font-medium text-neutral-500 line-through">
                        $2
                      </span>

                      <span className="text-sm font-medium text-neutral-400">
                        for you
                      </span>
                    </div>

                    <p className="mt-3 max-w-xs text-sm leading-relaxed text-neutral-400">
                      Invite friends to RielPoint and earn an upgraded $3 when they complete their first booking.
                    </p>
                  </div>

                 
                </div>
              </div>

              {/* Reward Stats */}
              <div className="grid grid-cols-2 border-t border-neutral-800 bg-neutral-950">
                <div className="px-6 py-4">
                  <p className="text-xs text-neutral-500">
                    Friends referred
                  </p>

                  <p className="mt-1 text-xl font-semibold text-white">
                    {isAuthenticated ? count : 0}
                  </p>
                </div>

                <div className="border-l border-neutral-800 px-6 py-4">
                  <p className="text-xs text-neutral-500">
                    You've earned
                  </p>

                  <p className="mt-1 text-xl font-semibold text-white">
                    ${(isAuthenticated ? earned : 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </section>

            {/* Invite Section */}
            <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5">
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold text-neutral-950">
                    Invite a friend
                  </p>
                  <span className="text-[11px] font-medium text-amber-600">
                    Earn $3 instead of $2
                  </span>
                </div>

                <p className="mt-1 text-sm text-neutral-500">
                  Share your link before the promo ends to lock in your $3 reward.
                </p>
              </div>

              {isAuthenticated ? (
                <>
                  <div className="mb-3 flex items-center rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                    <span className="min-w-0 flex-1 truncate text-sm text-neutral-700">
                      {referralLink || "No referral link available"}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleCopy}
                      className="h-11 flex-1 rounded-xl bg-black text-sm font-medium text-white hover:bg-neutral-800"
                    >
                      {copied ? "Copied" : "Copy link"}
                    </Button>

                    <Button
                      onClick={handleShare}
                      variant="outline"
                      className="h-11 flex-1 rounded-xl border-neutral-300 bg-white text-sm font-medium text-neutral-950 hover:bg-neutral-50"
                    >
                      Share
                    </Button>
                  </div>
                </>
              ) : (
                <Button
                  onClick={() => router.push("/login")}
                  className="h-11 w-full rounded-xl bg-black text-sm font-medium text-white hover:bg-neutral-800"
                >
                  Log in / Sign up to get referral link
                </Button>
              )}
            </section>

            {/* How It Works */}
            <section className="mt-8">
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.16em] text-neutral-500">
                How it works
              </p>

              <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                <div className="flex gap-4 px-5 py-5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
                    1
                  </div>

                  <div>
                    <p className="text-sm font-medium text-neutral-950">
                      Share your link
                    </p>

                    <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                      Invite a friend to join RielPoint.
                    </p>
                  </div>
                </div>

                <div className="border-t border-neutral-100" />

                <div className="flex gap-4 px-5 py-5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-sm font-semibold text-neutral-950">
                    2
                  </div>

                  <div>
                    <p className="text-sm font-medium text-neutral-950">
                      They make their first booking
                    </p>

                    <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                      Your friend completes and confirms their first booking.
                    </p>
                  </div>
                </div>

                <div className="border-t border-neutral-100" />

                <div className="flex gap-4 px-5 py-5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-sm font-semibold text-neutral-950">
                    3
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-neutral-950">
                        You earn $3
                      </p>
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                        Boosted
                      </span>
                    </div>

                    <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                      Once their stay is confirmed, $3 (normally $2) is added straight to your RielPoint balance.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Referral Activity */}
            <section className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-500">
                  Referral activity
                </p>

                {isAuthenticated && count > 0 && (
                  <p className="text-xs text-neutral-400">
                    {count} referral{count === 1 ? "" : "s"}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white px-5 py-5">
                {!isAuthenticated || count === 0 ? (
                  <div className="py-4 text-center">
                    <p className="text-sm font-medium text-neutral-800">
                      No referrals yet
                    </p>

                    <p className="mt-1 text-xs text-neutral-400">
                      Share your link to start earning rewards.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-950">
                        Referral rewards
                      </p>

                      <p className="mt-1 text-xs text-neutral-400">
                        Total rewards earned
                      </p>
                    </div>

                    <p className="text-base font-semibold text-neutral-950">
                      ${earned.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Terms */}
            <p className="mt-8 px-1 text-[11px] leading-relaxed text-neutral-400">
              The $3 promotional reward is a limited-time bonus (standard reward is $2). Rewards are limited to one referral reward per new customer. Your friend's booking must be completed and confirmed before the reward is credited. Rewards may take up to 24 hours to appear in your balance.
            </p>
          </>
        )}
      </div>
    </main>
  )
}