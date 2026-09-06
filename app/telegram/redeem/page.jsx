// app/telegram/redeem/page.js
"use client";

import authenticatedFetch from "@/app/auth/authenticatedFetch";
import LoginForm from "@/app/login/loginForm";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function RedeemPage() {
  const [checking, setChecking] = useState(true);
  const [merchant, setMerchant] = useState(null);
  const [authError, setAuthError] = useState(false);

  const [code, setCode] = useState("");
  const [amount, setAmount] = useState("");
  const [redeemStatus, setRedeemStatus] = useState("idle");
  const [redeemMessage, setRedeemMessage] = useState("");
   const pathname = usePathname();

   console.log("currentPath nae", pathname)

  useEffect(() => {
    let cancelled = false;

    async function loadCurrentUser() {
      setChecking(true);
      setAuthError(false);
      try {
        const res = await authenticatedFetch(
          `${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/profile`
        );
        if (!res.ok) throw new Error("Failed to load user");
        const currentUser = await res.json();
        console.log("currentUser", currentUser);

        if (!cancelled) setMerchant(currentUser.user);
      } catch (err) {
        if (!cancelled) setAuthError(true);
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    loadCurrentUser();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleRedeem() {
    if (!code.trim() || !amount) return;
    setRedeemStatus("loading");
    setRedeemMessage("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/coupon/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initData: window.Telegram?.WebApp?.initData,
          code: code.trim().toUpperCase(),
          amount: parseFloat(amount),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      setRedeemMessage(`✅ Applied — $${data.cashback_amount} cashback`);
      setRedeemStatus("success");
      setCode("");
      setAmount("");
    } catch (err) {
      setRedeemMessage(`❌ ${err.message}`);
      setRedeemStatus("error");
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-slate-500">Checking access…</p>
      </div>
    );
  }

  if (authError || merchant?.role !== "affiliate-merchant") {
    return (
      <>
        <div className="flex items-center justify-center bg-white">
          <p className="text-sm text-slate-500">
            You must be logged in as an active affiliate merchant to redeem coupons.
          </p>
        </div>
        <LoginForm isMerchant={true} callback={pathname} />
      </>
    );
  }

  const affiliateMerchant = merchant.affiliate_merchant;

  return (
    <div className="md:max-w-5xl mx-auto min-h-screen bg-white px-4 py-6">
      {affiliateMerchant && (
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
          {affiliateMerchant.logo_url && (
            <img
              src={affiliateMerchant.logo_url}
              alt={affiliateMerchant.name}
              className="h-12 w-12 rounded-lg object-cover"
            />
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {affiliateMerchant.name}
            </p>
            <p className="text-xs text-slate-500">
              {affiliateMerchant.cashback_rate}% cashback
              {affiliateMerchant.coupon_prefix && ` · ${affiliateMerchant.coupon_prefix}-XXXX`}
            </p>
          </div>
          {!affiliateMerchant.is_active && (
            <span className="ml-auto shrink-0 rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
              Inactive
            </span>
          )}
        </div>
      )}

      <h2 className="mt-6 text-base font-semibold text-slate-900">Redeem coupon</h2>
      <div className="mt-4 space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-600">Coupon code</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="TRP-10234"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Total amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={handleRedeem}
          disabled={redeemStatus === "loading"}
          className="w-full rounded-full bg-violet-600 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {redeemStatus === "loading" ? "Applying…" : "Apply cashback"}
        </button>
        {redeemMessage && (
          <p className={`text-sm ${redeemStatus === "error" ? "text-red-600" : "text-emerald-600"}`}>
            {redeemMessage}
          </p>
        )}
      </div>
    </div>
  );
}