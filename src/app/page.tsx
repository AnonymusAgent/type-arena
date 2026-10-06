import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight, Activity, Flame, Gamepad2, Keyboard, Play, Sparkles, Target, Timer, Trophy, Users, Zap } from "lucide-react";
import { GAMES } from "@/lib/games";
import GameCard from "@/components/game-card";
import GameArtwork from "@/components/game-artwork";
import HeroTyping from "@/components/hero-typing";
import ScrollEffects from "@/components/scroll-effects";
import { ACHIEVEMENTS, TIER_COLORS } from "@/lib/achievements";
import { getCatalogue, getChallenges, getLeaderboard, getPlatformStats } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Type Arena — Type Faster. Play Harder. Become #1.",
  description: "Play 16 competitive typing games, race opponents, take professional WPM tests, earn XP and coins, unlock achievements and climb the global leaderboard.",
};

const TESTIMONIALS = [
  { name: "Priya S.", role: "Software engineer", text: "I went from 58 to 94 WPM in six weeks. The weak-key drills are scary accurate.", avatar: "👩‍💻" },
  { name: "Mr. Dalton", role: "Grade 6 teacher", text: "My whole class begs for Alphabet Adventure. Progress tracking makes reporting trivial.", avatar: "🧑‍🏫" },
  { name: "Kenji T.", role: "Ranked #12 global", text: "Multiplayer Arena is the closest thing to esports for keyboards. The ladder is addictive.", avatar: "🐲" },
];

const STEPS = [
  { title: "Pick your arena", text: "Choose from 16 games. From precision practice to full-send arcade chaos.", icon: Gamepad2 },
  { title: "Find your flow", text: "Watch your speed, accuracy and combos respond to every keystroke.", icon: Keyboard },
  { title: "Level up", text: "Every session earns XP and coins to unlock a whole new look.", icon: Zap },
  { title: "Take the crown", text: "Challenge friends and climb the global ranks, one race at a time.", icon: Trophy },
];

export default async function HomePage() {
  const [stats, board, challenges, catalogue] = await Promise.all([
    getPlatformStats(),
    getLeaderboard("wpm", "global", 5),
    getChallenges(),
    getCatalogue(),
  ]);
  const featured = catalogue.filter((g) => g.featured).slice(0, 8);
  const popular = [...catalogue].sort((a, b) => b.players - a.players).slice(0, 4);
  const daily = challenges.filter((c) => c.period === "daily").slice(0, 4);
  const multiplayer = catalogue.find((g) => g.slug === "multiplayer-arena") ?? catalogue[0] ?? GAMES[0];

  return (
    <div className="w-full">
      <ScrollEffects />
      <section className="landing-hero border-b border-[var(--border)]">
        <div className="mx-auto grid w-full max-w-[1440px] items-center gap-8 px-4 pb-10 pt-12 sm:px-7 lg:grid-cols-[minmax(0,.95fr)_minmax(0,1.05fr)] lg:gap-6 lg:pb-16 lg:pt-20 xl:gap-10">
          <div className="relative z-10 min-w-0 slide-up">
            <span className="hero-eyebrow"><span className="hero-eyebrow__pulse" /> SEASON 01 / THE ARENA IS OPEN</span>
            <h1 className="hero-headline mt-7 text-white">
              <span>TYPE FASTER.</span>
              <span className="hero-headline__outline">PLAY HARDER.</span>
              <span className="hero-headline__accent">BECOME #1.</span>
            </h1>
            <p className="hero-summary mt-6 text-base sm:text-lg">Challenge yourself, race opponents, master your keyboard, and climb the global leaderboard.</p>
            <div className="mt-7 flex flex-wrap gap-2.5 sm:gap-3">
              <Link href="/games/type-race" className="btn btn-primary gap-2 px-5 sm:px-6"><Play size={16} fill="currentColor" /> PLAY NOW <ArrowUpRight size={16} /></Link>
              <Link href="/typing-test" className="btn btn-ghost px-5 sm:px-6"><Keyboard size={17} /> TYPING TEST</Link>
              <Link href="/games" className="btn btn-ghost px-5 sm:px-6">EXPLORE GAMES <ArrowRight size={16} /></Link>
            </div>
            <div className="hero-people mt-9">
              <span className="hero-people__avatars" aria-hidden="true"><span>🦊</span><span>🐼</span><span>🐺</span><span>🐲</span></span>
              <span><strong>{Math.round(stats.players / 1000)}k+</strong> players are already in the arena</span>
            </div>
          </div>
          <div className="relative min-w-0 slide-up" style={{ animationDelay: ".12s" }}><HeroTyping /></div>
        </div>
        <dl className="hero-metrics mx-auto grid max-w-[1440px] grid-cols-2 gap-x-4 gap-y-5 px-4 py-6 sm:grid-cols-4 sm:px-7 lg:py-8">
          {[
            { label: "ACTIVE PLAYERS", value: `${Math.round(stats.players / 1000)}K+`, icon: Users },
            { label: "RACES COMPLETED", value: `${(stats.races / 1e6).toFixed(1)}M+`, icon: Activity },
            { label: "AVG. SPEED", value: `${stats.avgWpm} WPM`, icon: Zap },
            { label: "ORIGINAL GAMES", value: `${catalogue.length}`, icon: Gamepad2 },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 sm:gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[#c5fb56]/20 bg-[#c5fb56]/7 text-[#c5fb56]"><item.icon size={17} /></span>
              <div><dt>{item.label}</dt><dd>{item.value}</dd></div>
            </div>
          ))}
        </dl>
      </section>

      <div className="arena-ticker" aria-hidden="true"><div className="arena-ticker__track">
        {[0, 1].map((n) => <div key={n} className="arena-ticker__group"><span>TYPE FASTER</span><b>✳</b><span>PLAY HARDER</span><b>✳</b><span>OWN THE LEADERBOARD</span><b>✳</b><span>EVERY KEY COUNTS</span><b>✳</b><span>TYPE FASTER</span><b>✳</b><span>PLAY HARDER</span><b>✳</b><span>OWN THE LEADERBOARD</span><b>✳</b><span>EVERY KEY COUNTS</span><b>✳</b></div>)}
      </div></div>

      <HomeSection number="01 / THE COLLECTION" title="Pick a game. Find your edge." subtitle="Many worlds. One keyboard. Where will you start?" href="/games" cta="VIEW ALL GAMES">
        <div className="grid grid-cols-1 gap-3 min-[430px]:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {featured.map((game) => <GameCard key={game.slug} game={game} />)}
        </div>
      </HomeSection>

      <div className="home-band">
        <HomeSection number="02 / CROWD FAVORITES" title="The games everyone's playing." subtitle="The most active arenas this week." href="/games?sort=popular" cta="DISCOVER MORE">
          <div className="grid grid-cols-1 gap-3 min-[430px]:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {popular.map((game) => <GameCard key={game.slug} game={game} compact />)}
          </div>
        </HomeSection>
      </div>

      <HomeSection number="03 / THE SHOWDOWN" title="Typing is better together." subtitle="Go head-to-head or take on the whole room.">
        <div className="grid gap-4 lg:grid-cols-[1.35fr_.85fr]">
          <div className="home-spotlight min-h-[355px] p-6 sm:p-8">
            <div className="home-spotlight__art" aria-hidden="true"><GameArtwork game={multiplayer} large /></div>
            <div className="home-spotlight__content max-w-sm">
              <span className="section-index">● MULTIPLAYER / ONLINE</span>
              <h3 className="mt-5 text-3xl font-bold leading-[1.05] sm:text-4xl">Your next rival<br />is waiting.</h3>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#aeb9cd]">Fast 1v1 duels, packed 8-player rooms, private matches and tournament brackets. The race is on.</p>
              <div className="mt-5 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider text-[#d5e3ed]">
                {["1v1 DUELS", "RANKED", "PRIVATE ROOMS"].map((x) => <span key={x} className="rounded-md border border-white/15 bg-white/5 px-2.5 py-1.5">{x}</span>)}
              </div>
              <Link href="/multiplayer" className="btn btn-primary mt-7">ENTER THE ARENA <ArrowUpRight size={17} /></Link>
            </div>
          </div>
          <div className="home-challenge p-5 sm:p-6">
            <div className="flex items-center justify-between"><div><span className="section-index">YOUR DAILY MISSIONS</span><h3 className="mt-2 text-xl font-bold">Small wins. Big upgrades.</h3></div><Target className="text-[var(--brand)]" size={30} /></div>
            <ul className="mt-5 space-y-2">
              {daily.map((c, i) => (
                <li key={c.id} className="flex items-center gap-3 rounded-lg border border-white/8 bg-white/4 px-3 py-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[#c5fb56]/10 font-mono text-[11px] font-bold text-[#c5fb56]">0{i + 1}</span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{c.title}</span><span className="block truncate text-[11px] text-[var(--muted)]">{c.description}</span></span>
                  <span className="shrink-0 font-mono text-[10px] font-bold text-[#c5fb56]">+{c.xpReward} XP</span>
                </li>
              ))}
            </ul>
            <Link href="/dashboard" className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[var(--brand)] hover:underline">VIEW YOUR DASHBOARD <ArrowUpRight size={14} /></Link>
          </div>
        </div>
      </HomeSection>

      <HomeSection number="04 / THE BENCHMARK" title="Know your numbers." subtitle="A professional typing test wrapped in a much more exciting experience.">
        <div className="grid gap-5 rounded-[26px] border border-[var(--border)] bg-[var(--panel)] p-5 sm:p-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl border border-[#c5fb56]/30 bg-[#c5fb56]/10 text-[var(--brand)]"><Timer size={24} /></div>
            <h3 className="text-3xl font-bold leading-[1.1]">Every millisecond<br />is progress.</h3>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--muted)]">WPM, accuracy, consistency, CPM and an error breakdown that actually helps you improve. Choose your duration, choose your mode, and go.</p>
            <div className="mt-5 flex flex-wrap gap-2">{["15 SEC", "30 SEC", "60 SEC", "2 MIN", "5 MIN", "CUSTOM"].map((d) => <span key={d} className="rounded-md border border-[var(--border)] px-2.5 py-1.5 font-mono text-[10px] font-bold text-[var(--muted)]">{d}</span>)}</div>
            <Link href="/typing-test" className="btn btn-primary mt-6">TAKE THE TEST <ArrowUpRight size={17} /></Link>
          </div>
          <div className="typing-field rounded-xl p-5 sm:p-6" aria-label="Sample typing test result chart">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3"><span className="font-mono text-[10px] font-bold text-[var(--brand)]">{"// PERFORMANCE ANALYSIS"}</span><span className="font-mono text-[10px] text-[var(--muted)]">60 SECOND TEST</span></div>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{[{ l: "SPEED", v: "72", s: "WPM" }, { l: "ACCURACY", v: "96.4", s: "%" }, { l: "KEYSTROKES", v: "1,245", s: "CHARS" }, { l: "CONSISTENCY", v: "91", s: "%" }].map((s) => <div key={s.l} className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-3"><div className="font-mono text-[9px] text-[var(--muted)]">{s.l}</div><div className="mt-1 text-2xl font-bold tracking-tighter text-[var(--brand)]">{s.v}<span className="ml-1 text-[9px] font-normal text-[var(--muted)]">{s.s}</span></div></div>)}</div>
            <svg className="mt-4 h-24 w-full" viewBox="0 0 500 100" preserveAspectRatio="none" role="img" aria-label="Speed improves steadily across the test"><defs><linearGradient id="perfFade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c5fb56" stopOpacity=".32"/><stop offset="1" stopColor="#c5fb56" stopOpacity="0"/></linearGradient></defs><path d="M0 91 L48 83 L95 74 L139 80 L184 59 L230 64 L275 47 L321 53 L366 32 L410 38 L455 18 L500 11 L500 100 L0 100Z" fill="url(#perfFade)"/><path d="M0 91 L48 83 L95 74 L139 80 L184 59 L230 64 L275 47 L321 53 L366 32 L410 38 L455 18 L500 11" fill="none" stroke="#c5fb56" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/></svg>
            <div className="flex justify-between font-mono text-[10px] text-[var(--muted)]"><span>00:00</span><span>00:30</span><span>01:00</span></div>
          </div>
        </div>
      </HomeSection>

      <HomeSection number="05 / YOUR JOURNEY" title="From first key to first place." subtitle="The loop that makes every session matter.">
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => <li key={step.title} className="how-step card-hover p-5 sm:p-6"><span className="font-mono text-xs font-bold text-[var(--brand)]">0{i + 1} / 04</span><div className="mt-7 grid h-12 w-12 place-items-center rounded-xl border border-[#c5fb56]/25 bg-[#c5fb56]/10 text-[var(--brand)]"><step.icon size={23} /></div><h3 className="mt-4 text-xl font-bold">{step.title}</h3><p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{step.text}</p></li>)}
        </ol>
      </HomeSection>

      <HomeSection number="06 / THE RANKINGS" title="The top is earned." subtitle="Your leaderboard position is only a game away." href="/leaderboards" cta="FULL LEADERBOARD">
        <div className="grid gap-4 lg:grid-cols-[1.25fr_.75fr]">
          <div className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-[var(--panel)]">
            <div className="flex justify-between border-b border-[var(--border)] px-5 py-3 font-mono text-[10px] font-bold tracking-wider text-[var(--muted)]"><span>RANK / PLAYER</span><span>BEST SPEED</span></div>
            {board.map((r, i) => <Link href={`/players/${r.id}`} key={r.id} className="group flex items-center gap-3 border-b border-[var(--border)] px-4 py-3.5 transition-colors last:border-0 hover:bg-white/5 sm:px-5"><span className={`w-7 text-center font-mono text-sm font-bold ${i === 0 ? "text-[var(--brand)]" : "text-[var(--muted)]"}`}>{String(i + 1).padStart(2, "0")}</span><span className="grid h-10 w-10 place-items-center rounded-lg border border-[var(--border)] bg-[var(--panel-solid)] text-xl">{r.avatar}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold group-hover:text-[var(--brand)]">{r.username}</span><span className="block truncate text-[11px] text-[var(--muted)]">{r.country} / LVL {r.level} · {r.title}</span></span><span className="text-right"><strong className="block text-base text-[var(--brand)]">{Math.round(r.bestWpm)} <small className="text-[10px] font-normal">WPM</small></strong><small className="text-[var(--muted)]">{r.accuracy.toFixed(1)}% accuracy</small></span></Link>)}
          </div>
          <div className="flex flex-col justify-between rounded-[20px] border border-[#c5fb56]/25 bg-[linear-gradient(150deg,#182620,#111821)] p-6 sm:p-8">
            <div><Trophy size={33} className="text-[var(--brand)]" /><h3 className="mt-5 text-3xl font-bold leading-tight">There&apos;s room for<br /><span className="text-[var(--brand)]">one more name.</span></h3><p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">Beat your personal best, climb a global ladder and see how you stack up against friends.</p></div>
            <Link href="/games/speed-sprint" className="btn btn-primary mt-6 w-full">CHASE A RECORD <ArrowUpRight size={16} /></Link>
          </div>
        </div>
      </HomeSection>

      <HomeSection number="07 / THE TROPHY ROOM" title="Skill looks good on you." subtitle="Achievements for the quick, the consistent and the unstoppable." href="/achievements" cta="SEE ALL ACHIEVEMENTS">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {ACHIEVEMENTS.slice(0, 6).map((a) => <div key={a.code} className="card-hover rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 text-center"><div className="text-3xl" aria-hidden="true">{a.icon}</div><h3 className="mt-2 text-sm font-bold">{a.name}</h3><p className="mt-1 text-[11px] leading-relaxed text-[var(--muted)]">{a.description}</p><span className="mt-3 inline-block rounded px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-wider" style={{ background: `${TIER_COLORS[a.tier]}22`, color: TIER_COLORS[a.tier] }}>{a.tier}</span></div>)}
        </div>
      </HomeSection>

      <HomeSection number="08 / THE COMMUNITY" title="Made for the makers of momentum." subtitle="Students, gamers and professionals are finding their rhythm here.">
        <div className="grid gap-3 md:grid-cols-3">{TESTIMONIALS.map((t) => <figure key={t.name} className="card-hover flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 sm:p-6"><div className="mb-6 flex gap-1 text-[var(--brand)]" aria-label="5 out of 5 stars">★★★★★</div><blockquote className="flex-1 text-sm leading-relaxed">“{t.text}”</blockquote><figcaption className="mt-5 flex items-center gap-3 border-t border-[var(--border)] pt-4"><span className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--panel-solid)] text-xl">{t.avatar}</span><span><strong className="block text-sm">{t.name}</strong><small className="text-[var(--muted)]">{t.role}</small></span></figcaption></figure>)}</div>
      </HomeSection>

      <section data-reveal className="mx-auto w-full max-w-7xl px-4 pb-6 pt-16 sm:px-6 sm:pt-24">
        <div className="home-cta px-6 py-12 text-center sm:px-12 sm:py-16">
          <span className="section-index">{"// YOUR ARENA AWAITS"}</span>
          <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-bold leading-[1.03] tracking-tighter sm:text-5xl">The next Keyboard Legend<br /><span className="text-[var(--brand)]">could be you.</span></h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-[var(--muted)]">Create a free account. Save your progress. Earn your place among the best.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3"><Link href="/signup" className="btn btn-primary px-7">CREATE FREE ACCOUNT <ArrowUpRight size={17} /></Link><Link href="/games/speed-sprint" className="btn btn-ghost px-7">TRY A 15S SPRINT <Flame size={16} /></Link></div>
          <p className="mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-mono text-[10px] text-[var(--muted)]"><Sparkles size={12} aria-hidden="true" /> FREE TO PLAY. BUILT TO IMPROVE. <span className="opacity-60">· A PRODUCT OF WEBLOOM INC.</span></p>
        </div>
      </section>
    </div>
  );
}

function HomeSection({ number, title, subtitle, href, cta, children }: { number: string; title: string; subtitle: string; href?: string; cta?: string; children: React.ReactNode }) {
  return (
    <section data-reveal className="home-section mx-auto w-full max-w-7xl px-4 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-8">
        <div className="min-w-0"><span className="section-index">{`// ${number}`}</span><h2 className="section-heading mt-3">{title}</h2><p className="section-kicker mt-2 text-sm sm:text-base">{subtitle}</p></div>
        {href && cta && <Link href={href} className="inline-flex min-h-11 items-center gap-2 border-b border-[var(--brand)] font-mono text-[10px] font-bold tracking-wider text-[var(--brand)] hover:gap-3">{cta} <ArrowUpRight size={16} /></Link>}
      </div>
      {children}
    </section>
  );
}
