"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const NAV_ITEMS = [
  {
    label: "Pack Drop",
    href: "/",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M12 8v8M8 12h8" />
      </svg>
    ),
  },
  {
    label: "Collection",
    href: "/collection",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: "Market",
    href: "/marketplace",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 w-full lg:hidden z-50 flex justify-around items-center px-4 py-3 bg-[#0e0e13]/90 backdrop-blur-2xl border-t border-white/[0.06] shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
      {NAV_ITEMS.map(({ label, href, icon }) => {
        const isActive =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center transition-all duration-200 ${
              isActive
                ? "text-neon-cyan drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]"
                : "text-slate-500 hover:text-white"
            }`}
          >
            {icon}
            <span className="font-[var(--font-headline)] text-[10px] font-bold uppercase mt-1">
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
