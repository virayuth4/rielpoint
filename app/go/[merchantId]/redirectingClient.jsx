"use client";

import { useEffect } from "react";

export default function RedirectClient({ to, name, logo }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.replace(to);
    }, 400); // just enough for the logo to flash, not a full countdown
    return () => clearTimeout(timer);
  }, [to]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      {logo && (
        <img
          src={logo}
          alt={name}
          className="h-16 w-16 object-contain mb-6 rounded-xl shadow-sm"
        />
      )}
      <div className="h-10 w-10 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin mb-6" />
      <h1 className="text-lg font-semibold text-gray-800">
        Redirecting you to {name}
      </h1>
      <a href={to} className="mt-6 text-sm text-indigo-600 hover:underline">
        Click here if you&apos;re not redirected
      </a>
    </div>
  );
}