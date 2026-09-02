import Image from "next/image";

const SITE_LOGO = "/icon-512.png";
const SITE_NAME = "RielPoint"; 

export function RedirectLogos({ brandLogo, brandName }) {
  return (
    <div className="flex items-center justify-center gap-4 mb-6">
      {/* Your logo */}
      <div className="h-16 w-16 shrink-0 rounded-2xl overflow-hidden bg-white ring-1 ring-gray-200 shadow-sm flex items-center justify-center">
        <Image
          src={SITE_LOGO}
          alt={SITE_NAME}
          width={64}
          height={64}
          className="h-full w-full object-contain"
        />
      </div>

      {/* Connector */}
      <svg
        className="h-4 w-4 text-gray-300 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>

      {/* Brand logo (or skeleton while unknown) */}
      <div className="h-16 w-16 shrink-0 rounded-2xl overflow-hidden  ring-1 ring-gray-200 shadow-sm flex items-center justify-center">
        {brandLogo ? (
          <Image
            src={brandLogo}
            alt={brandName}
            width={64}
            height={64}
            priority
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="h-full w-full motion-safe:animate-pulse bg-slate-200" />
        )}
      </div>
    </div>
  );
}