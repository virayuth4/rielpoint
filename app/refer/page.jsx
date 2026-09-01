
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
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

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
          title: "Earn $3 with RielPoint",
          text:
            "Join RielPoint using my link. I'll earn $3 when you complete your first booking.",
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
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-500">
            RielPoint x Trip.com Rewards
          </p>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">
            Refer a friend, earn $3
          </h1>

          <p className="mt-1 text-sm text-neutral-500">
            Invite friends and earn real cash.
          </p>
        </div>

        {/* Loading */}
        {status === "loading" && (
          <div className="py-16 text-center">
            <p className="text-sm text-neutral-400">
              Loading...
            </p>
          </div>
        )}

        {/* Unauthenticated */}
        {status === "unauthenticated" && (
          <div className="py-16 text-center">
            <p className="text-sm text-neutral-400">
              Redirecting to sign in...
            </p>
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="py-16 text-center">
            <p className="text-sm text-red-600">
              {errorMessage}
            </p>
          </div>
        )}

        {status === "ready" && (
          <>
            {/* Reward Card */}
            <section className="overflow-hidden rounded-2xl bg-black text-white">
              <div className="px-6 pb-7 pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                      Refer a friend
                    </p>

                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-5xl font-bold tracking-tight text-white">
                        $3
                      </span>

                      <span className="text-sm font-medium text-neutral-500">
                        for you
                      </span>
                    </div>

                    <p className="mt-3 max-w-xs text-sm leading-relaxed text-neutral-400">
                      Invite a friend to RielPoint and earn $3 when
                      they complete their first booking.
                    </p>
                  </div>

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-black">
                    <span className="text-lg font-bold">$</span>
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
                    {count}
                  </p>
                </div>

                <div className="border-l border-neutral-800 px-6 py-4">
                  <p className="text-xs text-neutral-500">
                    You've earned
                  </p>

                  <p className="mt-1 text-xl font-semibold text-white">
                    ${earned.toFixed(2)}
                  </p>
                </div>
              </div>
            </section>

            {/* Invite Section */}
            <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5">
              <div className="mb-4">
                <p className="text-base font-semibold text-neutral-950">
                  Invite a friend
                </p>

                <p className="mt-1 text-sm text-neutral-500">
                  Share your link and earn $3 when they complete their first booking.
                </p>
              </div>

              {/* Referral Link */}
              <div className="mb-3 flex items-center rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                <span className="min-w-0 flex-1 truncate text-sm text-neutral-700">
                  {referralLink || "No referral link available"}
                </span>
              </div>

              {/* Actions */}
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
                    <p className="text-sm font-medium text-neutral-950">
                      You earn $3
                    </p>

                    <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                      Once their stay is completed and confirmed, $3 is added to your RielPoint balance.
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

                {count > 0 && (
                  <p className="text-xs text-neutral-400">
                    {count} referral{count === 1 ? "" : "s"}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white px-5 py-5">
                {count === 0 ? (
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
              Rewards are limited to one referral reward per new
              customer. Your friend's booking must be completed and
              confirmed before the reward is credited. Rewards may
              take up to 24 hours to appear in your balance.
            </p>
          </>
        )}
      </div>
    </main>
  )
}

