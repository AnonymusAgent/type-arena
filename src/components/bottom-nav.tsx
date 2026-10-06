"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, House, Keyboard, Trophy, UserRound } from "lucide-react";

const ITEMS = [
  { href: "/", label: "Home", icon: House },
  { href: "/games", label: "Games", icon: Gamepad2 },
  { href: "/typing-test", label: "Test", icon: Keyboard },
  { href: "/leaderboards", label: "Ranks", icon: Trophy },
  { href: "/dashboard", label: "Me", icon: UserRound },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary mobile navigation" className="fixed bottom-0 left-0 z-40 w-full border-t border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_94%,transparent)] backdrop-blur-xl md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <ul className="mx-auto flex max-w-lg">
        {ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return <li key={item.href} className="min-w-0 flex-1"><Link href={item.href} aria-current={active ? "page" : undefined} className={`relative flex min-h-[60px] flex-col items-center justify-center gap-1 text-[10px] font-bold ${active ? "text-[var(--brand)]" : "text-[var(--muted)]"}`}>{active && <span className="absolute left-1/2 top-0 h-[2px] w-7 -translate-x-1/2 bg-[var(--brand)] shadow-[0_0_10px_#c5fb56]" />}<item.icon size={19} strokeWidth={active ? 2.5 : 1.8} aria-hidden="true" />{item.label}</Link></li>;
        })}
      </ul>
    </nav>
  );
}
