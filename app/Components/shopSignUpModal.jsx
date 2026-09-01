"use client";

export default function ShopSignupModal({ open, onClose, onConfirm, merchantName }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="shop-signup-title"
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="shop-signup-title" className="text-lg font-semibold text-slate-900">
          Sign up to earn cashback
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          You need a RielPoint account before we can track your purchase{merchantName ? ` at ${merchantName}` : ""}.
          Without signing up first, your cashback won&apos;t be credited.
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-black/90"
          >
            Sign up now
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}