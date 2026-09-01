"use client";

import { useEffect, useState } from "react";
import { RedirectLogos } from "./redirectLogos";

const SEARCH_MESSAGES = [
  "Connecting you to our partner...",
  "Setting up your link...",
  "Almost there...",
];

const DISPLAY_MS = 1800;

export default function RedirectClient({ to, name, logo }) {
  const [hasReturned, setHasReturned] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      window.location.replace(to);
    }, DISPLAY_MS);

    const messageDuration = DISPLAY_MS / SEARCH_MESSAGES.length;
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % SEARCH_MESSAGES.length);
    }, messageDuration);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        setHasReturned(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      clearTimeout(redirectTimer);
      clearInterval(messageInterval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [to]);

  useEffect(() => {
    if (!hasReturned) return;
    const timer = setTimeout(() => {
      window.location.replace("/");
    }, 1500);
    return () => clearTimeout(timer);
  }, [hasReturned]);

  if (hasReturned) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-start pt-24 md:pt-32 bg-white px-4 text-center">
        <RedirectLogos brandLogo={logo} brandName={name} />
        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
          <svg
            className="h-6 w-6 text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-lg font-semibold text-gray-800">You&apos;re all set!</h1>
        <p className="mt-1 text-sm text-gray-500">Taking you back to your homepage...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-24 md:pt-32 bg-white px-4 text-center">
      <RedirectLogos brandLogo={logo} brandName={name} />
      <div className="h-10 w-10 border-4 border-gray-200 border-t-black rounded-full motion-safe:animate-spin mb-6" />
      <h1 className="text-lg font-semibold text-gray-800">
        Redirecting to {name}
      </h1>
      <p className="mt-2 text-sm text-gray-500 transition-opacity duration-300">
        {SEARCH_MESSAGES[messageIndex]}
      </p>
      <a href={to} className="mt-6 text-sm text-black hover:underline">
        Click here if you&apos;re not redirected
      </a>
    </div>
  );
}