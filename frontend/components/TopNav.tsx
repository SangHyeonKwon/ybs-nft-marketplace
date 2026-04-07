"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const NAV_ITEMS = [
  { label: "Pack Drop", href: "/" },
  { label: "Collection", href: "/collection" },
  { label: "Marketplace", href: "/marketplace" },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 w-full flex justify-between items-center px-8 py-4 bg-[#0e0e13]/80 backdrop-blur-xl z-50 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <Link
        href="/"
        className="text-2xl font-black tracking-tighter text-neon-cyan font-[var(--font-headline)]"
      >
        NEON RELIC
      </Link>

      <div className="hidden md:flex items-center gap-8">
        {NAV_ITEMS.map(({ label, href }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`font-[var(--font-headline)] uppercase tracking-[0.1rem] text-[12px] transition-colors ${
                isActive
                  ? "text-neon-cyan border-b-2 border-neon-cyan pb-1"
                  : "text-slate-400 hover:text-white pb-1"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      <ConnectButton />

      <div className="bg-gradient-to-r from-transparent via-neon-cyan/20 to-transparent h-[1px] w-full absolute bottom-0" />
    </nav>
  );
}
