// app/telegram/redeem/page.js
"use client";
import { useEffect, useState } from "react";

export default function RedeemPage() {
  const [code, setCode] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    window.Telegram?.WebApp?.ready();
    window.Telegram?.WebApp?.expand();
  }, []);

  async function handleSubmit() {
    if (!code.trim() || !amount) return;
    setStatus("loading");
    setMessage("");

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

      setMessage(`✅ Applied — ${data.merchant_name}: $${data.cashback_amount} cashback`);
      setStatus("success");
      setCode("");
      setAmount("");
    } catch (err) {
      setMessage(`❌ ${err.message}`);
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-white px-4 py-6">
      <h1 className="text-lg font-semibold text-slate-900">Redeem coupon</h1>
      <p className="mt-1 text-sm text-slate-500">Enter the customer&apos;s code and the total checkout amount.</p>

      <div className="mt-6 space-y-4">
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
          onClick={handleSubmit}
          disabled={status === "loading"}
          className="w-full rounded-full bg-violet-600 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {status === "loading" ? "Applying…" : "Apply cashback"}
        </button>
        {message && (
          <p className={`text-sm ${status === "error" ? "text-red-600" : "text-emerald-600"}`}>{message}</p>
        )}
      </div>
    </div>
  );
}