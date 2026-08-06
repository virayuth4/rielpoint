import Image from "next/image";
import Link from "next/link";

export default function NavHeader  () {
    return (
            <header className="sticky top-0 z-20 border-b border-[var(--ink)]/10 bg-white backdrop-blur">
  <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
    <div className="flex shrink-0 items-center gap-2">
      <Image
        src="/rielpoint_logo.png"
        alt="RielPoint"
        width={36}
        height={36}
        className="h-8 w-8 sm:h-[50px] sm:w-[50px]"
      />
      <span className="font-display text-base font-semibold tracking-tight sm:text-lg">
        RielPoint
      </span>
    </div>

    <nav className="hidden items-center gap-8 font-tape text-xs uppercase tracking-wider text-[var(--ink)]/60 md:flex">
      <a href="#how" className="hover:text-[var(--ink)]">How it works</a>
      <a href="#venues" className="hover:text-[var(--ink)]">Who it&apos;s for</a>
      <a href="#pricing" className="hover:text-[var(--ink)]">Pricing</a>
    </nav>

    <Link
      href="https://www.instagram.com/rielpoint.kh/?__d=1%2F%3Fhidemenu%3Dtrue%3Cbr%3E%EB%AF%B8%EC%84%B8%EC%8A%A4"
      className="press shrink-0 whitespace-nowrap bg-[var(--ink)] px-3 py-2 text-[10px] font-tape uppercase tracking-wider text-[var(--paper)] hover:opacity-90 sm:px-4 sm:text-xs"
    >
      Contact Us
    </Link>
  </div>
</header>
    )
}