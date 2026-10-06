import Link from "next/link";
import { ArrowUpRight, Code2, Mail, MessageCircle, Play } from "lucide-react";

const COLS = [
  { title: "PLAY", links: [{ href: "/games", label: "All games" }, { href: "/typing-test", label: "Typing test" }, { href: "/practice", label: "Practice" }, { href: "/multiplayer", label: "Multiplayer" }, { href: "/tournaments", label: "Tournaments" }] },
  { title: "COMPETE", links: [{ href: "/leaderboards", label: "Leaderboards" }, { href: "/achievements", label: "Achievements" }, { href: "/shop", label: "Rewards shop" }, { href: "/dashboard", label: "Dashboard" }] },
  { title: "COMPANY", links: [{ href: "/about", label: "About" }, { href: "/about#contact", label: "Contact" }, { href: "/about#faq", label: "FAQ" }] },
  { title: "LEGAL", links: [{ href: "/legal/privacy", label: "Privacy" }, { href: "/legal/terms", label: "Terms" }, { href: "/legal/cookies", label: "Cookie settings" }] },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-[var(--border)] bg-[#0b101a] px-4 pb-28 pt-12 text-[#f5f8fc] md:pb-10 sm:px-6">
      <div className="mx-auto grid w-full max-w-7xl gap-10 md:grid-cols-[1.5fr_repeat(4,1fr)]">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Type Arena home"><span className="grid h-9 w-9 place-items-center rounded-[9px] bg-[#c5fb56] text-sm font-black text-[#101813]">TA</span><strong className="text-lg tracking-[-.06em]">TYPE<span className="text-[#c5fb56]">ARENA</span></strong></Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#9aa6b7]">A different kind of typing platform. Train your fingers. Find your people. Earn your place.</p>
          <div className="mt-5 flex items-center gap-2 font-mono text-[10px] font-bold text-[#c5fb56]"><span className="h-1.5 w-1.5 rounded-full bg-[#c5fb56] shadow-[0_0_8px_#c5fb56]" /> ALL SYSTEMS READY</div>
          <div className="mt-5 flex gap-2">
            {[
              { href: "https://discord.com", label: "Discord", icon: MessageCircle },
              { href: "https://youtube.com", label: "YouTube", icon: Play },
              { href: "https://github.com", label: "GitHub", icon: Code2 },
              { href: "mailto:support@typearena.gg", label: "Email us", icon: Mail },
            ].map((item) => <a key={item.label} href={item.href} aria-label={item.label} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined} className="grid h-10 w-10 place-items-center rounded-lg border border-white/12 text-[#9aa6b7] transition hover:border-[#c5fb56]/50 hover:text-[#c5fb56]"><item.icon size={17} /></a>)}
          </div>
        </div>
        {COLS.map((col) => <div key={col.title}><h3 className="mb-4 font-mono text-[10px] font-bold tracking-[.14em] text-[#c5fb56]">{`// ${col.title}`}</h3><ul className="space-y-2.5 text-sm">{col.links.map((link) => <li key={link.href}><Link href={link.href} className="inline-flex items-center gap-1 text-[#9aa6b7] transition hover:text-white">{link.label}</Link></li>)}</ul></div>)}
      </div>
      <div className="mx-auto mt-12 flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 font-mono text-[10px] text-[#8997aa]">
        <p>
          © {new Date().getFullYear()} <strong className="text-[#dfe7f2]">WEBLOOM INC.</strong> ALL RIGHTS RESERVED.
        </p>
        <p className="w-full text-[#8997aa] sm:w-auto">TYPE ARENA™ IS A WEBLOOM INC. PRODUCT · EVERY KEY COUNTS</p>
        <Link href="/games" className="inline-flex items-center gap-1 text-[#c5fb56]">BACK TO THE GAMES <ArrowUpRight size={12} /></Link>
      </div>
    </footer>
  );
}
