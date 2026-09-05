// app/telegram/redeem/page.js
"use client";
import { useEffect, useState } from "react";
import { TELEGRAM_SUPPORT_URL } from "@/lib/constants";

export default function RedeemPage() {
  const [checking, setChecking] = useState(true);
  const [merchant, setMerchant] = useState(null);

  const [code, setCode] = useState("");
  const [amount, setAmount] = useState("");
  const [redeemStatus, setRedeemStatus] = useState("idle");
  const [redeemMessage, setRedeemMessage] = useState("");

  useEffect(() => {
    window.Telegram?.WebApp?.ready();
    window.Telegram?.WebApp?.expand();
    checkStatus();
  }, []);

  async function checkStatus() {
    setChecking(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/merchant-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData: window.Telegram?.WebApp?.initData }),
      });
      const data = await res.json();
      if (data.linked) setMerchant(data.merchant);
    } catch {
      // treat as not linked
    } finally {
      setChecking(false);
    }
  }

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
    return <div className="p-6 text-sm text-slate-500">Checking your account…</div>;
  }

  // NOT LINKED — simple contact-support message, no self-serve form
  if (!merchant) {
    return (
      <div className="min-h-screen bg-white px-4 py-6">
        <h1 className="text-lg font-semibold text-slate-900">Account not set up yet</h1>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
          Your Telegram account isn't linked to a merchant yet. Contact us and
          we'll get you connected.
        </p>
        <a
          href={TELEGRAM_SUPPORT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block rounded-full bg-violet-600 px-6 py-3 text-sm font-semibold text-white"
        >
          Contact support
        </a>
      </div>
    );
  }

  // LINKED — merchant info + redeem form
  return (
    <div className="min-h-screen bg-white px-4 py-6">
      <div className="flex items-center gap-3">
        {merchant.logo_url && (
          <img src={merchant.logo_url} alt={merchant.name} className="h-10 w-10 rounded-lg object-cover" />
        )}
        <div>
          <p className="text-sm font-semibold text-slate-900">{merchant.name}</p>
          <p className="text-xs text-slate-500">{merchant.cashback_rate}% cashback</p>
        </div>
      </div>

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