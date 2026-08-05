'use client'

import { ArrowRight, Check, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";


export default function MerchantSignUpForm() {
  const router = useRouter();
  const [form, setForm] = useState({ businessName: "", businessType: "", phone: "" });
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [needsAuth, setNeedsAuth] = useState(false);
  const BUSINESS_TYPES = [
    "Coffee shop & café",
    "Restaurant & bar",
    "Hotel & guesthouse",
    "Retail & shop",
    "Salon & spa",
    "Other",
  ];

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.businessName || !form.businessType || !form.phone) return;

    setStatus("loading");
    setErrorMsg("");
    setNeedsAuth(false);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/merchant/merchant/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.businessName,
          contact_phone: form.phone,
          business_type: form.businessType,
        }),
      });

      if (res.status === 201) {
        setStatus("success");
        return;
      }

      const data = await res.json().catch(() => ({}));

      if (res.status === 409) {
        setErrorMsg("A business with this name already exists. Try a different name.");
      } else if (res.status === 400) {
        setErrorMsg("Please fill in your business name and phone number.");
      } else if (res.status === 401) {
        setErrorMsg("You need to be signed in to list a business.");
        setNeedsAuth(true);
      } else {
        setErrorMsg(data.error || "Something went wrong. Please try again.");
      }
      setStatus("error");
    } catch (err) {
      setErrorMsg("Couldn't reach the server. Check your connection and try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="w-full max-w-md border border-[var(--ink)]/15 bg-[var(--paper)] p-8 text-center text-[var(--ink)] shadow-[0_20px_50px_-25px_rgba(33,29,26,0.5)]">
        <Check className="mx-auto h-8 w-8" />
        <p className="mt-4 font-display text-xl font-semibold tracking-tight">Got it, {form.businessName}.</p>
        <p className="mt-2 text-sm leading-6 text-[var(--ink)]/65">
          We&apos;ll reach out to {form.phone} shortly to get your loyalty program set up.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md border border-[var(--ink)]/15 bg-[var(--paper)] p-8 text-left text-[var(--ink)] shadow-[0_20px_50px_-25px_rgba(33,29,26,0.5)]"
    >
      <p className="font-tape text-[10px] uppercase tracking-[0.22em] text-[var(--ink)]/50">Join us</p>
      <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight">List your business today</h3>

      <div className="mt-6">
        <label htmlFor="businessName" className="font-tape text-[10px] uppercase tracking-[0.22em] text-[var(--ink)]/50">
          Business name
        </label>
        <input
          id="businessName"
          type="text"
          required
          placeholder="Baitong Café"
          value={form.businessName}
          onChange={update("businessName")}
          disabled={status === "loading"}
          className="mt-2 w-full border border-[var(--ink)]/25 bg-white px-3 py-2.5 text-sm outline-none placeholder:text-[var(--ink)]/30 focus:border-[var(--ink)] disabled:opacity-50"
        />
      </div>

      <div className="mt-4">
        <label htmlFor="businessType" className="font-tape text-[10px] uppercase tracking-[0.22em] text-[var(--ink)]/50">
          Business type
        </label>
        <select
          id="businessType"
          required
          value={form.businessType}
          onChange={update("businessType")}
          disabled={status === "loading"}
          className="mt-2 w-full border border-[var(--ink)]/25 bg-white px-3 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--ink)] disabled:opacity-50"
        >
          <option value="" disabled>
            Select a type
          </option>
          {BUSINESS_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <label htmlFor="phone" className="font-tape text-[10px] uppercase tracking-[0.22em] text-[var(--ink)]/50">
          Phone number
        </label>
        <div className="mt-2 flex items-center gap-2 border border-[var(--ink)]/25 bg-white px-3 py-2.5 focus-within:border-[var(--ink)]">
          <Phone className="h-4 w-4 shrink-0 text-[var(--ink)]/40" />
          <input
            id="phone"
            type="tel"
            required
            placeholder="012 xxx 456"
            value={form.phone}
            onChange={update("phone")}
            disabled={status === "loading"}
            className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--ink)]/30 disabled:opacity-50"
          />
        </div>
      </div>

      {status === "error" && (
        <div className="mt-4 border border-[var(--ink)]/20 bg-[var(--paper-dim)] px-3 py-2 text-[var(--ink)]">
          <p className="text-xs">{errorMsg}</p>
          {needsAuth && (
            <button
              type="button"
              onClick={() => router.push("/signup?callback=/signup/merchant")}
              className="press mt-2 flex items-center gap-2 bg-[var(--ink)] px-4 py-2 font-tape text-xs uppercase tracking-[0.2em] text-[var(--paper)] hover:opacity-90"
            >
              Sign up
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="press mt-6 flex w-full items-center justify-center gap-2 bg-[var(--ink)] px-6 py-3 font-tape text-xs uppercase tracking-[0.2em] text-[var(--paper)] hover:opacity-90 disabled:opacity-60"
      >
        {status === "loading" ? "Submitting..." : "Submit"}
        {status !== "loading" && <ArrowRight className="h-4 w-4" />}
      </button>
    </form>
  );
}