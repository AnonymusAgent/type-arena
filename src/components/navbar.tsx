"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Bell, ChevronDown, Menu, Moon, Play, Search, Sun, Volume2, VolumeX, X } from "lucide-react";
import { useApp } from "./providers";
import { levelFromXp } from "@/lib/progression";

const PRIMARY = [
  { href: "/", label: "Home" },
  { href: "/games", label: "Games" },
  { href: "/typing-test", label: "Typing Test" },
  { href: "/practice", label: "Practice" },
  { href: "/multiplayer", label: "Multiplayer" },
  { href: "/leaderboards", label: "Leaderboards" },
];
const MORE = [
  { href: "/achievements", label: "Achievements" },
  { href: "/profile", label: "Profile" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/tournaments", label: "Tournaments" },
  { href: "/shop", label: "Rewards Shop" },
];

type SearchResults = {
  games: { slug: string; name: string; icon: string; category: string }[];
  players: { id: number; username: string; avatar: string; bestWpm: number }[];
  categories: string[];
};

export default function Navbar() {
  const { user, logout, sound, toggleSound, theme, toggleTheme } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState<{ id: number; title: string; body: string; read: boolean }[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setOpen(false); setMoreOpen(false); setSearchOpen(false); }, [pathname]);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!q.trim()) { setResults(null); return; }
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        setResults(await res.json());
      } catch { setResults(null); }
    }, 220);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [q]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => setNotifs(d.items ?? []))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setSearchOpen(false); setNotifOpen(false); setMoreOpen(false); setOpen(false); }
      if (event.key === "/" && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) {
        event.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchRef.current?.focus(), 0);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const unread = notifs.filter((n) => !n.read).length;
  const lvl = user ? levelFromXp(user.xp) : null;
  const active = (href: string) => href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
  const doLogout = async () => { await logout(); router.push("/"); router.refresh(); };
  const toggleSearch = () => { setSearchOpen((s) => !s); setTimeout(() => searchRef.current?.focus(), 0); };

  const suggestionList = results && (
    <div className="max-h-[55vh] overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--panel-solid)] p-1.5 shadow-2xl scrollbar-thin">
      {results.games.length === 0 && results.players.length === 0 && results.categories.length === 0 && <p className="px-3 py-3 text-sm text-[var(--muted)]">No results for “{q}”.</p>}
      {results.games.length > 0 && <p className="px-3 pb-1 pt-2 font-mono text-[10px] font-bold text-[var(--brand)]">GAMES</p>}
      {results.games.map((g) => <Link key={g.slug} href={`/games/${g.slug}`} onClick={() => { setQ(""); setSearchOpen(false); setOpen(false); }} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-[var(--panel)]"><span>{g.icon}</span><span className="min-w-0 flex-1 truncate">{g.name}</span><span className="text-xs text-[var(--muted)]">{g.category}</span></Link>)}
      {results.players.length > 0 && <p className="px-3 pb-1 pt-3 font-mono text-[10px] font-bold text-[var(--brand)]">PLAYERS</p>}
      {results.players.map((p) => <Link key={p.id} href={`/players/${p.id}`} onClick={() => { setQ(""); setSearchOpen(false); setOpen(false); }} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-[var(--panel)]"><span>{p.avatar}</span><span className="min-w-0 flex-1 truncate">{p.username}</span><span className="text-xs text-[var(--muted)]">{Math.round(p.bestWpm)} WPM</span></Link>)}
      {results.categories.map((c) => <Link key={c} href="/games" onClick={() => { setQ(""); setSearchOpen(false); setOpen(false); }} className="block rounded-lg px-3 py-2 text-sm hover:bg-[var(--panel)]">⌁ {c} games</Link>)}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_90%,transparent)] backdrop-blur-xl">
      <nav className="mx-auto flex h-16 w-full max-w-[1440px] items-center gap-2 px-3 sm:px-6 xl:gap-3" aria-label="Main navigation">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Type Arena home">
          <span className="grid h-9 w-9 place-items-center rounded-[9px] border border-[#e0ffa0]/50 bg-[#c5fb56] text-sm font-black tracking-tighter text-[#101813] shadow-[0_0_20px_-9px_#c5fb56]">TA</span>
          <span className="hidden text-base font-bold tracking-[-.06em] sm:block">TYPE<span className="text-[var(--brand)]">ARENA</span><span className="ml-1 align-top font-mono text-[8px] text-[var(--brand)]">®</span></span>
        </Link>

        <ul className="ml-4 hidden min-w-0 flex-1 items-center gap-0 xl:flex">
          {PRIMARY.map((n) => <li key={n.href}><Link href={n.href} aria-current={active(n.href) ? "page" : undefined} className={`rounded-lg px-2.5 py-2 text-[13px] font-semibold whitespace-nowrap transition-colors hover:text-[var(--brand)] ${active(n.href) ? "text-[var(--brand)]" : "text-[var(--muted)]"}`}>{n.label}</Link></li>)}
          <li className="relative">
            <button onClick={() => setMoreOpen((v) => !v)} aria-expanded={moreOpen} className="flex min-h-10 items-center gap-1 rounded-lg px-2.5 text-[13px] font-semibold text-[var(--muted)] hover:text-[var(--brand)]">More <ChevronDown size={13} /></button>
            {moreOpen && <div className="absolute left-0 top-11 w-48 rounded-xl border border-[var(--border)] bg-[var(--panel-solid)] p-1.5 shadow-2xl">{MORE.map((n) => <Link key={n.href} href={n.href} className="block rounded-lg px-3 py-2 text-sm hover:bg-[var(--panel)]">{n.label}</Link>)}</div>}
          </li>
        </ul>

        <div className="ml-auto flex items-center gap-1.5 xl:ml-0">
          <div className="relative">
            <button onClick={toggleSearch} aria-expanded={searchOpen} aria-label="Search games and players (shortcut /)" className="grid h-10 w-10 place-items-center rounded-lg border border-transparent text-[var(--muted)] transition hover:border-[var(--border)] hover:text-[var(--brand)]"><Search size={18} /></button>
            {searchOpen && <div className="absolute right-0 top-12 w-[min(90vw,360px)] rounded-xl border border-[var(--border)] bg-[var(--panel-solid)] p-2 shadow-2xl"><div className="flex items-center gap-2 px-2"><Search size={16} className="text-[var(--muted)]" /><input ref={searchRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search games or players..." aria-label="Search games and players" className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none" /><span className="font-mono text-[10px] text-[var(--muted)]">ESC</span></div>{suggestionList}</div>}
          </div>
          <button onClick={toggleSound} aria-pressed={sound} aria-label={sound ? "Mute sound effects" : "Enable sound effects"} className="hidden h-10 w-10 place-items-center rounded-lg text-[var(--muted)] hover:text-[var(--brand)] sm:grid">{sound ? <Volume2 size={18} /> : <VolumeX size={18} />}</button>
          <button onClick={toggleTheme} aria-label="Toggle colour theme" className="hidden h-10 w-10 place-items-center rounded-lg text-[var(--muted)] hover:text-[var(--brand)] lg:grid">{theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}</button>
          {user && <div className="relative"><button onClick={() => setNotifOpen((v) => !v)} aria-expanded={notifOpen} aria-label={`Notifications, ${unread} unread`} className="relative grid h-10 w-10 place-items-center rounded-lg text-[var(--muted)] hover:text-[var(--brand)]"><Bell size={18} />{unread > 0 && <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#f47f91] px-0.5 text-[9px] font-bold text-[#170d13]">{unread}</span>}</button>
            {notifOpen && <div className="absolute right-0 top-12 w-[min(90vw,340px)] rounded-xl border border-[var(--border)] bg-[var(--panel-solid)] p-2 shadow-2xl"><div className="flex items-center justify-between px-2 py-2"><span className="font-mono text-xs font-bold text-[var(--brand)]">NOTIFICATIONS</span><button className="text-xs text-[var(--muted)] hover:text-[var(--brand)]" onClick={async () => { await fetch("/api/notifications", { method: "POST" }); setNotifs((n) => n.map((x) => ({ ...x, read: true }))); }}>Mark read</button></div><div className="max-h-80 overflow-y-auto scrollbar-thin">{notifs.length === 0 && <p className="px-3 py-3 text-sm text-[var(--muted)]">All caught up.</p>}{notifs.map((n) => <div key={n.id} className={`border-t border-[var(--border)] px-3 py-2.5 ${n.read ? "opacity-60" : ""}`}><p className="text-sm font-semibold">{n.title}</p><p className="text-xs text-[var(--muted)]">{n.body}</p></div>)}</div></div>}
          </div>}
          {user ? <Link href="/dashboard" className="hidden items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--panel)] px-2 py-1.5 2xl:flex"><span className="text-xl">{user.avatar}</span><span className="text-[11px]"><span className="block font-bold leading-tight">{user.username}</span><span className="text-[var(--muted)]">LV {lvl?.level} · 🪙 {user.coins}</span></span></Link> : <Link href="/login" className="hidden text-xs font-bold text-[var(--muted)] hover:text-[var(--brand)] 2xl:block">LOG IN</Link>}
          <Link href="/games/type-race" className="btn btn-primary !min-h-10 whitespace-nowrap !px-2.5 !text-[11px] sm:!px-4"><Play size={13} fill="currentColor" /><span className="hidden min-[355px]:inline">PLAY NOW</span><span className="min-[355px]:hidden">PLAY</span></Link>
          <button onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"} className="grid h-10 w-10 place-items-center rounded-lg border border-[var(--border)] text-[var(--text)] xl:hidden">{open ? <X size={19} /> : <Menu size={19} />}</button>
        </div>
      </nav>

      {open && <div className="absolute left-0 right-0 top-16 max-h-[calc(100dvh-64px)] overflow-y-auto border-b border-[var(--border)] bg-[var(--bg-soft)] px-3 pb-5 shadow-2xl scrollbar-thin sm:px-6 xl:hidden">
        <div className="mx-auto max-w-xl py-4"><p className="mb-3 font-mono text-[10px] font-bold tracking-wider text-[var(--brand)]">{"// EXPLORE TYPE ARENA"}</p><ul className="grid grid-cols-2 gap-2">{[...PRIMARY, ...MORE].map((n) => <li key={n.href}><Link href={n.href} aria-current={active(n.href) ? "page" : undefined} className={`flex min-h-11 items-center justify-between gap-1 rounded-lg border px-3 text-[13px] font-semibold ${active(n.href) ? "border-[#c5fb56]/40 bg-[#c5fb56]/10 text-[var(--brand)]" : "border-[var(--border)] bg-[var(--panel)]"}`}>{n.label}<ArrowUpRight size={13} /></Link></li>)}</ul>
          <div className="mt-4 flex flex-wrap gap-2"><button className="btn btn-ghost text-xs" onClick={toggleSound}>{sound ? <Volume2 size={15} /> : <VolumeX size={15} />} SOUND {sound ? "ON" : "OFF"}</button><button className="btn btn-ghost text-xs" onClick={toggleTheme}>{theme === "dark" ? <Moon size={15} /> : <Sun size={15} />} {theme.toUpperCase()} MODE</button></div>
          <div className="mt-4 flex gap-2">{user ? <button className="btn btn-ghost flex-1" onClick={() => void doLogout()}>Log out</button> : <><Link href="/login" className="btn btn-ghost flex-1">Log in</Link><Link href="/signup" className="btn btn-primary flex-1">Sign up</Link></>}</div>
        </div>
      </div>}
    </header>
  );
}
