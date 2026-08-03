"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/app/auth/authContext";

const STAMPS_FOR_FREE_DRINK = 10;

// TODO: replace with real data fetched from your backend, keyed by phone number
const MOCK_CUSTOMERS = {
  "5551234567": { name: "Alex Rivera", stamps: 7, freeDrinks: 0 },
  "5559876543": { name: "Jordan Lee", stamps: 10, freeDrinks: 1 },
};

export default function LoyaltyCheckInPage() {
  // Whoever is actually logged in on this device right now — this is what
  // stamps the "who did this" field, not the 4-digit PIN below (that just
  // confirms someone is standing at the register, not which account it is).
  const { currentUser } = useAuth();

  const [phone, setPhone] = useState("");
  const [showVerify, setShowVerify] = useState(false);
  const [code, setCode] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [customer, setCustomer] = useState(null);
  const [toast, setToast] = useState(null); // { message, undo?: fn }
  const [confirmAction, setConfirmAction] = useState(false); // true while add-stamp confirm is open
  const [undoSnapshot, setUndoSnapshot] = useState(null); // customer state before the last stamp add
  const inputsRef = useRef([]);
  console.log("currentUser", currentUser)

  // TODO: replace with your real staff PIN, e.g. fetched per logged-in staff user
  const STAFF_PIN = "1234";

  const normalizedPhone = (p) => p.replace(/\D/g, "");

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setError("");
    setCode(["", "", "", ""]);
    setShowVerify(true);
  };

  const handleCodeChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // only allow a single digit
    const next = [...code];
    next[index] = value;
    setCode(next);

    if (value && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const entered = code.join("");
    if (entered.length < 4) {
      setError("Please enter all 4 digits.");
      return;
    }
    if (entered === STAFF_PIN) {
      setError("");
      setShowVerify(false);

      // TODO: replace with a real lookup call to your backend
      const key = normalizedPhone(phone);
      const found = MOCK_CUSTOMERS[key];
      setCustomer(
        found
          ? { ...found, phone: key }
          : { name: null, stamps: 0, freeDrinks: 0, phone: key }
      );
    } else {
      setError("Incorrect code, try again.");
      setCode(["", "", "", ""]);
      inputsRef.current[0]?.focus();
    }
  };

  const closeModal = () => {
    setShowVerify(false);
    setError("");
  };

  const resetAll = () => {
    setPhone("");
    setCustomer(null);
    setError("");
    setToast(null);
    setUndoSnapshot(null);
  };

  const showToast = (message, undo) => {
    setToast({ message, undo });
  };

  const dismissToast = () => setToast(null);

  const requestAddStamp = () => setConfirmAction(true);
  const cancelConfirm = () => setConfirmAction(false);

  const confirmStampAction = () => {
    setUndoSnapshot(customer); // remember state before this add, for undo

    setCustomer((c) => {
      const stamps = c.stamps + 1;
      if (stamps >= STAMPS_FOR_FREE_DRINK) {
        showToast("Stamp added — free drink earned!", undoLastStamp);
        return { ...c, stamps: 0, freeDrinks: c.freeDrinks + 1 };
      }
      showToast("Stamp added", undoLastStamp);
      return { ...c, stamps };
    });
    // TODO: persist to your backend here — include performedBy: currentUser.id
    // so the record shows which staff account added this stamp, e.g.:
    // authenticatedFetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/stamps`, {
    //   method: "POST",
    //   body: JSON.stringify({ customerPhone: customer.phone, performedBy: currentUser.id }),
    // });
    setConfirmAction(false);
  };

  const undoLastStamp = () => {
    if (!undoSnapshot) return;
    setCustomer(undoSnapshot);
    setUndoSnapshot(null);
    setToast(null);
    // TODO: reflect this correction in your backend as well
  };

  const claimDrink = () => {
    setCustomer((c) => ({ ...c, freeDrinks: c.freeDrinks - 1 }));
    setUndoSnapshot(null);
    showToast("Free drink claimed");
    // TODO: persist the redemption to your backend here — include performedBy: currentUser.id
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-6 py-6">
      {/* Who's logged in — always visible so staff can't lose track of whose
          account is stamping. Not a security control, just a clarity one. */}
   

      <div className="w-full max-w-xs flex-1 flex flex-col justify-center">
        {!customer ? (
          <>
            <div className="mb-10 text-center">
              <p className="text-xs tracking-widest text-stone-400 uppercase mb-2">
                Rewards
              </p>
              <h1 className="text-2xl font-medium text-stone-900">
                Loyalty Check-In
              </h1>
            </div>

            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="phone"
                  className="block text-xs text-stone-500 mb-2"
                >
                  Customer phone number
                </label>
                <input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border-0 border-b border-stone-300 bg-transparent px-0 py-2 text-stone-900 placeholder-stone-300 focus:outline-none focus:border-stone-900 transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-stone-900 text-white text-sm font-medium py-3 hover:bg-stone-800 transition-colors"
              >
                Continue
              </button>
            </form>
          </>
        ) : (
          <div>
            <div className="text-center mb-8">
              <p className="text-xs tracking-widest text-stone-400 uppercase mb-2">
                {customer.name ? customer.name : "New customer"}
              </p>
              <h1 className="text-lg text-stone-900">{customer.phone}</h1>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-stone-500">Stamps</span>
                <span className="text-xs text-stone-500">
                  {customer.stamps} / {STAMPS_FOR_FREE_DRINK}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: STAMPS_FOR_FREE_DRINK }).map((_, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-full border ${
                      i < customer.stamps
                        ? "bg-stone-900 border-stone-900"
                        : "border-stone-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            {customer.freeDrinks > 0 && (
              <div className="mb-6 text-center rounded-2xl bg-stone-50 py-3">
                <p className="text-sm text-stone-900">
                  {customer.freeDrinks} free{" "}
                  {customer.freeDrinks === 1 ? "drink" : "drinks"} available
                </p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={requestAddStamp}
                className="w-full rounded-full bg-stone-900 text-white text-sm font-medium py-3 hover:bg-stone-800 transition-colors"
              >
                Add Stamp
              </button>

              {customer.freeDrinks > 0 && (
                <button
                  onClick={claimDrink}
                  className="w-full rounded-full border border-stone-900 text-stone-900 text-sm font-medium py-3 hover:bg-stone-50 transition-colors"
                >
                  Claim Free Drink
                </button>
              )}

              <button
                onClick={resetAll}
                className="w-full text-xs text-stone-400 hover:text-stone-700 transition-colors pt-2"
              >
                Start next customer
              </button>
            </div>
          </div>
        )}

        {toast && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-stone-900 text-white text-xs rounded-full pl-4 pr-2 py-2">
            <span>{toast.message}</span>
            {toast.undo && (
              <button
                onClick={toast.undo}
                className="text-white underline underline-offset-2 font-medium px-2 py-1 hover:opacity-80"
              >
                Undo
              </button>
            )}
            <button
              onClick={dismissToast}
              aria-label="Dismiss"
              className="text-white/50 hover:text-white px-1"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Add Stamp Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-stone-900/30 flex items-center justify-center px-6 z-50">
          <div className="w-full max-w-xs bg-white rounded-3xl p-8 text-center">
            <h2 className="text-base font-medium text-stone-900 mb-2">
              Add a stamp?
            </h2>
            <p className="text-xs text-stone-400 mb-6">
              {customer?.phone} will have{" "}
              {customer && customer.stamps + 1 >= STAMPS_FOR_FREE_DRINK
                ? "a free drink earned"
                : `${customer?.stamps + 1} / ${STAMPS_FOR_FREE_DRINK} stamps`}
              .
            </p>

            <div className="flex gap-3">
              <button
                onClick={cancelConfirm}
                className="flex-1 rounded-full text-stone-500 text-sm font-medium py-2.5 hover:text-stone-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmStampAction}
                className="flex-1 rounded-full bg-stone-900 text-white text-sm font-medium py-2.5 hover:bg-stone-800 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verification Modal */}
      {showVerify && (
        <div className="fixed inset-0 bg-stone-900/30 flex items-center justify-center px-6 z-50">
          <div className="w-full max-w-xs bg-white rounded-3xl p-8">
            <h2 className="text-base font-medium text-stone-900 mb-1 text-center">
              Staff Verification
            </h2>
            <p className="text-xs text-stone-400 mb-6 text-center">
              Enter your 4-digit code to continue
            </p>

            <div className="flex justify-center gap-3 mb-4">
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputsRef.current[i] = el)}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-11 h-11 text-center text-lg text-stone-900 border-0 border-b-2 border-stone-300 bg-transparent focus:outline-none focus:border-stone-900 transition-colors"
                  autoFocus={i === 0}
                />
              ))}
            </div>

            {error && (
              <p className="text-xs text-red-500 mb-4 text-center">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 rounded-full text-stone-500 text-sm font-medium py-2.5 hover:text-stone-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleVerify}
                className="flex-1 rounded-full bg-stone-900 text-white text-sm font-medium py-2.5 hover:bg-stone-800 transition-colors"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}