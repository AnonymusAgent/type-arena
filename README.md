# ⌨️ TYPE ARENA

**A modern, competitive typing-game platform — games, practice, racing, progression and global leaderboards.**

> © 2026 **Webloom Inc.** All rights reserved. Type Arena is an original product of Webloom Inc.
> All game logic, artwork, branding, UI and written content are original works — nothing here is copied from any other typing site.

---

## 1. What this is

Type Arena is a full-stack web application that turns typing practice into a game platform. The core loop is:

**Pick a game → Play → Improve your typing → Earn XP → Unlock rewards → Compete with others → Climb the leaderboard.**

It is built with **Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + Drizzle ORM + PostgreSQL**, is mobile-first and fully responsive, ships a dark/light theme, 3D-styled animated scenes, and includes a **password-protected operator (admin) control panel**.

| Area | What exists today |
| --- | --- |
| Games | 16 games across 12 categories, 6 genuinely distinct engines |
| Practice | 10 structured drills + custom text + automatic weak-key analysis |
| Typing test | 15s → 5min + custom duration, 6 modes, full analytics |
| Multiplayer | Lobby, matchmaking, countdown, live progress race, results (simulated opponents; realtime-ready architecture) |
| Progression | XP, 100 levels, 8 rank titles, coins, streaks, achievements |
| Economy | Coins → vehicles, themes, keycaps, frames, trails, titles (cosmetic only) |
| Social | Friends, challenges, comparison, notifications, player profiles |
| Competition | Global/country/friends/weekly/monthly/all-time leaderboards + tournaments |
| Admin | Games CRUD, users, scores, achievements, challenges, tournaments, moderation |
| Auth | Email/password signup + login + forgot-password + logout, guest play, Google button |

---

## 2. Feature tour

### 2.1 Navigation
- Sticky top bar: logo, Home, Games, Typing Test, Practice, Multiplayer, Leaderboards, plus a **More** menu (Achievements, Profile, Dashboard, Tournaments, Rewards Shop).
- Right side: global **search** (press `/` to focus), **sound toggle**, **theme toggle**, **notifications** with unread badge, user chip, and a persistent **PLAY NOW** button.
- `< 1280px`: hamburger sheet with every destination (touch-friendly, 44px+ targets).
- `< 768px`: **bottom navigation bar** (Home / Games / Test / Ranks / Me) with `env(safe-area-inset-bottom)` support.

### 2.2 Homepage sections
Hero (headline `TYPE FASTER. PLAY HARDER. BECOME #1.` + animated 3D arena scene + PLAY NOW / TYPING TEST / EXPLORE GAMES) → scrolling ticker → Featured Games → Popular Games → Multiplayer Arena → Daily Challenges → Typing Test → How It Works → Leaderboard preview → Achievements preview → Testimonials → CTA → footer. Every section reveals on scroll with a 3D tilt.

### 2.3 The games (`/games`, `/games/[slug]`)

| # | Game | Slug | Category | Engine |
| --- | --- | --- | --- | --- |
| 1 | Type Race | `type-race` | Racing | `race` |
| 2 | Word Blitz | `word-blitz` | Arcade | `stream` |
| 3 | Zombie Typist | `zombie-typist` | Survival | `falling` |
| 4 | Keyboard Defender | `keyboard-defender` | Arcade | `falling` |
| 5 | Type Ninja | `type-ninja` | Arcade | `falling` |
| 6 | Falling Words | `falling-words` | Arcade | `falling` |
| 7 | Typing Challenge | `typing-challenge` | Challenge | `text` |
| 8 | Speed Sprint | `speed-sprint` | Speed | `text` |
| 9 | Survival Typing | `survival-typing` | Survival | `stream` |
| 10 | Number Master | `number-master` | Numbers | `stream` |
| 11 | Symbol Master | `symbol-master` | Symbols | `stream` |
| 12 | Sentence Sprint | `sentence-sprint` | Practice | `text` |
| 13 | Code Typing | `code-typing` | Programming | `text` |
| 14 | Typing Memory | `typing-memory` | Educational | `memory` |
| 15 | Multiplayer Arena | `multiplayer-arena` | Multiplayer | redirects to `/multiplayer` |
| 16 | Alphabet Adventure (kids) | `kids-typing` | Kids | `stream` |

Fully playable: **Type Race, Word Blitz, Falling Words, Speed Sprint, Zombie Typist, Typing Test** — plus Keyboard Defender, Type Ninja, Survival, Number/Symbol Master, Sentence Sprint, Code Typing, Typing Memory and the kids mode, all on the same reusable engines.

Library features: search, category filter, sort by popularity / newest / difficulty / rating / A→Z, ratings, player counts, difficulty badges, per-game SEO pages with `VideoGame` structured data.

### 2.4 Typing test (`/typing-test`)
Durations 15s / 30s / 60s / 2min / 5min / custom (10–900s). Modes: words, sentences, paragraph, numbers, symbols, code. Live: WPM, accuracy, errors, correct/incorrect characters, CPM, consistency, time remaining. Result dashboard: `WELL DONE!` + full breakdown with **Retry, New test, Share result (Web Share API → clipboard fallback), View statistics, Challenge friend**.

### 2.5 Practice (`/practice`)
Drills: home row, top row, bottom row, numbers, symbols, common words, difficult letters, left hand, right hand, weak keys + custom text. Every mistake is attributed to the *expected* key and persisted in `localStorage["ta_key_errors"]`; the panel then reports **“You frequently miss R, T and Y”** and generates a targeted drill from those characters.

### 2.6 Progression, coins, achievements
- XP: `src/lib/progression.ts#computeRewards` — base from score/WPM/duration, +60 XP bonus at ≥98% accuracy, +75 for a win; coins ≈ ¼ of XP.
- Levels: `xpForLevel(level) = 200 + (level - 1) * 120`, capped at 100.
- Ranks: 1 Beginner · 5 Novice · 10 Typist · 20 Speedster · 30 Expert · 50 Master · 75 Elite · 100 Keyboard Legend. Shown in nav, dashboard, profile, results, leaderboards.
- Achievements (12 live, progress-driven): First Race, Speed Demon (60 WPM), Lightning Fingers (100 WPM), Accuracy King (99%), Marathon (100 games), Dedicated Typist (7-day streak), Perfect Run, Unstoppable (10 wins), Keyboard Legend (Lv 100), Warm Up, Arena Veteran, Sharpshooter. Locked ones show progress bars and reward values; unlocking grants extra XP/coins and writes a notification.
- Streak: increments the first time you play each calendar day, resets if you skip a day, surfaced as `🔥 N DAY STREAK`.

### 2.7 Multiplayer (`/multiplayer`)
Modes: Quick Match (4), 1v1 Duel, Ranked (8), Private Room (editable code + copy invite link), Tournament. Flow: lobby → `Searching for opponents…` → matched roster → 3-2-1 countdown → live race with per-player 3D lanes → podium results with WPM, accuracy, XP. Opponents are simulated locally, but the client already publishes progress at a fixed 100 ms cadence through one place (`multiplayer-client.tsx`), so a WebSocket/WebRTC transport can be dropped in without redesigning the UI.

### 2.8 Dashboard, profile, friends, shop, tournaments
- **Dashboard**: greeting, level + XP bar, streak, coins, best/avg WPM, accuracy, all challenges with live progress computed from today's sessions, continue-playing card, recommended practice (based on your accuracy/WPM), friends online, recent games, recent achievements.
- **Profile**: avatar, title, country, global rank, 7 stat tiles, WPM & accuracy SVG trend charts, recent game table, achievement grid, friends panel (add/challenge/remove), settings (avatar, country, theme, sound, logout).
- **Public player pages** at `/players/[id]`.
- **Shop**: rarity-tiered cosmetics with level gates, coin prices, buy + equip, explicit “cosmetic only, never pay-to-win” notice.
- **Tournaments**: daily / weekend / weekly / monthly with prizes, entrant counts, qualifier links and current point standings.

---

## 3. Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 App Router, React 19, Server Components + selective `"use client"` |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4 + custom CSS layers (`arena-effects.css`) |
| Database | PostgreSQL via Drizzle ORM (`drizzle-orm/node-postgres`) |
| Fonts | `@fontsource/space-grotesk` (UI) + `@fontsource/space-mono` (data) — self-hosted |
| Icons | `lucide-react` (no emoji icons in UI chrome) |
| Animation | CSS transforms/keyframes + `IntersectionObserver` (no animation library) |
| Auth | Custom session tokens + `scrypt` password hashing |

---

## 4. Getting started

```bash
npm install              # install dependencies
cp .env.example .env     # then set DATABASE_URL
npx drizzle-kit push     # apply the schema to PostgreSQL
npm run build && npm run start
```

Development: `npm run dev`. Type safety: `npx next typegen` then `npm exec tsc -- --noEmit`.

### 4.1 Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | PostgreSQL connection string, e.g. `postgresql://postgres:postgres@127.0.0.1:5432/app_db` |
| `ADMIN_ACCESS_CODE` | optional | Second factor for `/admin/login`. If set, an “Operator key” field appears and must match exactly (timing-safe compare). If unset, a valid administrator account is sufficient. |

No client-side secrets are used; nothing sensitive is exposed to the browser bundle.

### 4.2 Demo credentials

| Account | Username | Password | Role |
| --- | --- | --- | --- |
| Operator | `arena_admin` | `admin1234` | Admin → unlocks `/admin` |
| Example player | `NovaKeys` | `demo1234` | Player |

Sign in from `/login` **or** `/admin/login` (the latter requires `isAdmin`).

---

## 5. Project structure

```
src/
├── app/
│   ├── layout.tsx               # root layout, metadata, providers, nav/footer
│   ├── page.tsx                 # homepage (all landing sections)
│   ├── globals.css              # theme tokens, buttons, panels, base animations
│   ├── arena-effects.css        # 3D scenes, scroll effects, game fields, banners
│   ├── icon.svg                 # brand favicon
│   ├── sitemap.ts / robots.ts   # SEO infrastructure
│   ├── games/
│   │   ├── page.tsx             # library + banner
│   │   ├── games-browser.tsx    # search / filter / sort (client)
│   │   └── [slug]/page.tsx      # 16 SEO pages (generateStaticParams)
│   ├── typing-test/  practice/  multiplayer/  leaderboards/
│   ├── achievements/  dashboard/  profile/  players/[id]/
│   ├── shop/  tournaments/  about/  legal/[doc]/
│   ├── login/ signup/ forgot-password/
│   ├── admin/
│   │   ├── page.tsx             # guarded control panel
│   │   ├── admin-bar.tsx        # operator status + refresh + end session
│   │   ├── admin-client.tsx     # 6 admin tabs
│   │   └── login/               # password-protected sign-in gate
│   └── api/                     # see section 7
├── components/
│   ├── providers.tsx            # session, sound, theme, toasts (context)
│   ├── navbar.tsx bottom-nav.tsx footer.tsx
│   ├── game-card.tsx game-artwork.tsx page-banner.tsx
│   ├── hero-typing.tsx scroll-effects.tsx sparkline.tsx xp-bar.tsx
│   └── game/                    # the reusable engine layer
│       ├── game-runner.tsx      # idle → playing → results, saves to API
│       ├── race-engine.tsx      # 3D track, rivals, combo boost
│       ├── stream-engine.tsx    # timed word/token tiles
│       ├── falling-engine.tsx   # wave/boss/power-up arcade field
│       ├── text-engine.tsx      # sentence / paragraph / code wrapper
│       ├── text-core.tsx        # shared character-level typing core
│       ├── memory-engine.tsx    # memorise → recall sequences
│       └── hud.tsx types.ts     # Stat, HudRow, ProgressBar, TypingInput
├── lib/
│   ├── games.ts                 # ⭐ single source of truth for the catalogue
│   ├── words.ts                 # word banks, paragraphs, code snippets, generators
│   ├── progression.ts           # XP, levels, ranks, rewards, WPM, consistency
│   ├── achievements.ts          # achievement definitions + tiers
│   ├── data.ts                  # server data access, seeding guard
│   ├── auth.ts                  # sessions, hashing, getCurrentUser
│   └── admin.ts                 # admin guard, operator key, throttling
├── db/
│   ├── schema.ts                # 13 Drizzle tables
│   └── index.ts                 # pooled drizzle client
└── proxy.ts                     # Next 16 proxy: CSRF guard for API writes + fast 401 on /api/admin
public/images/arena-hero.jpg     # generated hero artwork
```

---

## 6. Adding a new game (3 files, no page rebuilds)

The catalogue is **data-driven**; nothing is hard-coded into individual pages.

1. **Add an entry to `src/lib/games.ts`**:
   ```ts
   {
     slug: "pyramid-sprint", name: "Pyramid Sprint",
     description: "...", longDescription: "...",
     category: "Speed", difficulty: "Hard", engine: "stream",
     icon: "🔺", accent: "#22d3ee", gradient: "from-cyan-500/30 to-blue-700/30",
     players: 0, rating: 4.5, featured: false, createdOrder: 17,
     instructions: ["...", "...", "..."], controls: ["Keyboard"],
     scoring: "...", config: { startLife: 5, ramp: "fast", tokenKind: "numbers" }
   }
   ```
2. **Pick an engine** (`race | stream | falling | text | memory`) and pass tuning values in `config` — lives, difficulty ramp, token kind, boss toggles, theme.
3. **Done.** `/games/pyramid-sprint`, the library card, search, admin CRUD and score saving all pick it up automatically.

To add a **seventh engine**: create `components/game/<name>-engine.tsx` implementing `EngineProps` (`{ config, onFinish(result) }`), call `onFinish` with a `GameResult`, and register it in the `Engine` selector inside `game-runner.tsx`.

---

## 7. API reference

| Method · route | Auth | Purpose |
| --- | --- | --- |
| `POST /api/auth/signup` | public | Create account (≥3-char username, valid email, ≥6-char password), starts session |
| `POST /api/auth/login` | public | Login by username **or** email; rotates the session (same session type for players and operators) |
| `POST /api/auth/admin-login` | public | Admin-only sign-in: role check, optional operator key, throttled, sanitised `next` redirect |
| `GET /api/auth/admin-login` | public | Reports whether an operator key is configured |
| `GET /api/auth/me` | cookie | Current user + level (also used to confirm a sign-in “stuck”) |
| `POST /api/auth/logout` | cookie | Revoke the session row, expire both session cookies and legacy cookies |
| `POST /api/sessions` | optional | Save a run; grants XP/coins, updates streak, evaluates achievements, notifies |
| `PATCH /api/profile` | user | Update avatar, country, theme, title |
| `GET /api/leaderboard?metric&scope&country` | public | Ranked rows (wpm/accuracy/xp/wins/games/points) |
| `GET /api/search?q` | public | Instant games + players + categories |
| `GET/POST /api/notifications` | user | List / mark all read |
| `GET/POST /api/friends` | user | List, add by username, challenge, remove |
| `GET/POST /api/shop` | user / user | List cosmetics, buy, equip |
| `GET/POST/PATCH/DELETE /api/admin/games` | **admin** | Create, edit, feature/publish toggle, delete, list |
| `GET /api/health` | public | Platform + DB health probe |

`POST /api/sessions` works for guests (returns `guest: true`, nothing persisted) so gameplay is never gated behind a signup wall.

---

## 8. Data model (13 tables)

| Table | Purpose |
| --- | --- |
| `users` | identity, hashed password, XP, coins, WPM/accuracy aggregates, streak, admin flag, equipped vehicle, `is_demo` |
| `games` | slug, name, category, difficulty, engine, JSONB `config`, accent, icon, players, rating, featured, published |
| `game_sessions` | immutable run log: wpm, accuracy, score, errors, chars, duration, won, xp/coins earned, JSONB meta |
| `achievements` / `user_achievements` | definitions (goal, metric, tier, rewards) and per-user progress + `unlocked_at` |
| `challenges` / `challenge_progress` | daily/weekly/monthly missions and per-day progress/claims |
| `friends` | directed friendships with `status` (accepted/pending) |
| `tournaments` | name, period, qualifier game, prize, entrants, window, status |
| `vehicles` / `user_inventory` | cosmetics catalogue and ownership/equipment |
| `notifications` | friend requests, challenges, achievement unlocks, tournament results |
| `auth_sessions` | server-side session tokens carried by the `ta_session` / `ta_session_x` cookies (the single source of truth for sign-in) |

`jsonb` on `games.config` and `game_sessions.meta` is what makes new games and new game types additive rather than migrations-heavy.

### 8.1 Demo data vs production data
`seedDatabase()` in `src/lib/seed.ts` is **idempotent** — it returns early if any row exists in `games` — and is invoked from `ensureSeeded()` before the first read. It creates:
- the full 16-game catalogue, 12 achievements, 14 cosmetics, 7 challenges, 4 tournaments;
- 15 realistic **demo players** (`isDemo = true`) with sessions, achievements and friendships;
- one **operator account** `arena_admin` (`isDemo = true`, `isAdmin = true`).

Demo rows are always flagged with `is_demo = true`, shown as `Source: demo` in the admin Users tab, so you can filter or truncate them without touching real users:

```sql
DELETE FROM users WHERE is_demo = true;
```

---

## 9. Security: the protected admin area

The control panel is genuinely locked, not cosmetic.

**One source of truth.** Admin access is always derived from the database: a valid row in `auth_sessions` whose user has `users.is_admin = true`. There is no separate “admin cookie”. `getCurrentUser()` (`src/lib/auth.ts`) is the only identity check in the app; `getAdminUser()` (`src/lib/admin.ts`) is that result plus `isAdmin`.

1. **Dashboard guard** — `/admin/page.tsx` calls `getAdminUser()` *before* it queries a single row and `redirect()`s to `/admin/login?next=/admin` if it fails.
2. **Sign-in page uses the same check** — `/admin/login` is server-rendered and redirects to the dashboard **only when the same check positively finds an admin**. Because both pages ask the identical question, they can never disagree, so a redirect loop is structurally impossible.
3. **Per-route API guards** — every `/api/admin/*` handler re-runs the check (`401` unauthenticated, `403` authenticated-but-not-admin), so direct `curl`/Postman access is blocked.
4. **Request proxy (`src/proxy.ts`, Next 16’s successor to middleware)** — never redirects pages. It (a) refuses state-changing `/api/*` requests the browser marks `Sec-Fetch-Site: cross-site` (falling back to an Origin-vs-Host check on older browsers) → **CSRF protection**, and (b) returns a fast `401` for `/api/admin/*` requests that carry no session cookie at all.
5. **Sign-in hardening** — the account’s stored role must be administrator (`isAdmin` is never read from the client); failures are throttled to **5 per 10 minutes per IP**; the optional operator key uses a timing-safe compare; `next` is sanitised to admin paths only (no `//evil.com` open redirects, no bouncing back to the sign-in page); every sign-in **rotates** the session (old tokens are revoked).
6. **Nothing sensitive leaks** — passwords are `scrypt` + per-user salt with timing-safe verification; `publicUser()` strips `passwordHash`; admin pages are `noindex` with generic titles; `/api` is disallowed in `robots.ts`; logout deletes the session row, so a copied token stops working immediately.

### 9.1 Session cookies

The same random token is carried by two `HttpOnly` cookies so sign-in works in every context:

| Cookie | Attributes | Why |
| --- | --- | --- |
| `ta_session` | `SameSite=Lax`, `Secure` on HTTPS, 30 days | Normal browser tabs — including plain `http://` LAN addresses used to test on phones, where `Secure` cookies are refused. |
| `ta_session_x` | `SameSite=None; Secure; Partitioned`, 30 days | When the site is shown **inside another site’s iframe** (e.g. a builder preview pane). Browsers never send `Lax` cookies there. `Partitioned` (CHIPS) keeps it isolated per embedding site. |

Cookies are only carriers; revoking the database row ends the session everywhere. Cookies from older builds (`ta_admin`) are expired automatically on the next sign-in or sign-out.

### 9.2 Troubleshooting sign-in

| Symptom | Cause | Fix |
| --- | --- | --- |
| Correct password, but you land back on the sign-in form | The browser refused the session cookie (strict tracking protection in an embedded preview, or cookies disabled) | The form now detects this and shows **“Password accepted, but this browser blocked the sign-in cookie”** with an **Open in a new tab** button. Sign in there. |
| “Redirected you too many times” (older builds) | A leftover `ta_admin` hint cookie disagreed with an expired session | Fixed structurally (see 9). Use **“Stuck? Reset sign-in and clear session cookies”** on `/admin/login`, or clear site data once. |
| “You’re signed in as X, which isn’t an administrator account” | You’re logged in as a player | Sign in with an admin account on the same form — it switches accounts. |
| “Too many attempts” | 5 failed attempts in 10 minutes from your IP | Wait 10 minutes (or restart the server in development). |
| “Incorrect operator key” | `ADMIN_ACCESS_CODE` is set on the server | Enter the configured key, or unset the variable. |

To grant admin access to a real user:

```sql
UPDATE users SET is_admin = true WHERE username = 'your_handle';
```

To rotate the operator key: set `ADMIN_ACCESS_CODE` in `.env` and restart — the field appears on the sign-in form automatically.

---

## 10. Design system

- **Palette**: near-black `#080b12` canvas, panels at `rgba(22,28,41,.78)`, brand **electric lime `#c5fb56`**, secondary **ice cyan `#63e5e4`**, tertiary **violet `#977aff`**. Light mode re-maps the same tokens.
- **Type**: Space Grotesk (600/700 display, tight `-0.07em` tracking) + Space Mono for telemetry, labels and HUD numerals.
- **Surfaces**: 1px borders, inner top highlight, deep soft shadows, restrained glassmorphism, 9–26px radii.
- **3D layer** (`arena-effects.css`): real `perspective` + `rotateX/rotateY` on game cards (isometric keycap diorama with travelling grid floor and light rings), a pointer-parallax hero (image, floating keycaps, HUD terminal, speed plate), a perspective race circuit with animated floor and glowing vehicle trails, raised word tiles in the arcade field, and 3D multiplayer lanes.
- **Scroll**: one `IntersectionObserver` + one passive `scroll` listener drives section reveals, a top progress bar and hero parallax. Both are skipped entirely under reduced motion.
- **Micro-interactions**: card lift + glow, button lift, pop/slide/shake keyframes, animated caret, live counters, combo flashes, countdown bursts.

---

## 11. Responsiveness (verified)

No horizontal scrolling was measured at **320, 375, 430, 768, 1024, 1440 and 1920 px** on the homepage, library, five game pages, typing test, practice, multiplayer and leaderboards. `overflow-x: clip` is set on `html/body`, grids collapse `1 → 2 → 4` columns, card grids go single-column below 430 px, filter/sort rows scroll horizontally inside their own container, and typography uses `clamp()`.

During active play the decorative banner is hidden (`main:has(.game-playing)`), the race arena compresses to 210–222 px, and the typing input is placed immediately after the field so the track **and** the input are simultaneously visible on a 320 px viewport above the bottom nav.

---

## 12. Accessibility & sound
Semantic landmarks, one `<h1>` per page, skip link, `aria-current`, `aria-live` for countdowns/results/errors, labelled icon-only buttons, `role="progressbar"` with real values, visible 2px focus rings, `aria-pressed` on every toggle, reduced-motion disabling all animation, and status conveyed by text + icon as well as colour.
Sound is **off by default** and opt-in (`🔊` toggle, persisted to `localStorage`), synthesised with the Web Audio API — no audio downloads.

## 13. Performance & SEO
Engines are `next/dynamic` lazy-loaded so the console logic never blocks first paint; the hero image is `priority` with `sizes`; fonts are self-hosted; animation is CSS-only with one shared observer and passive listeners; game pages are SSG via `generateStaticParams`, authenticated/user pages are `force-dynamic`. SEO: title templates, per-page descriptions, canonicals, Open Graph/Twitter metadata, `VideoGame` + `FAQPage` + `WebSite`/`SearchAction` JSON-LD, `sitemap.xml`, `robots.txt`, real URLs and descriptive alt text.

---

## 14. Known scope boundaries (honest list)
- Multiplayer opponents are **simulated**; the realtime transport, presence and matchmaking service are not deployed (the UI/architecture is ready for one).
- “Continue with Google” explains that OAuth credentials must be configured — it is intentionally not a silent no-op.
- Forgot-password shows a confirmation instead of sending email because no mail provider is configured.
- Reported-username moderation flags entries client-side; there is no moderator workflow or audit table yet.
- Achievements/challenges are evaluated on session save (no nightly cron).

## 15. Next steps
Realtime rooms (Redis + WebSocket), OAuth + email resets, weekly/monthly challenge aggregation, friends-only invites with deep links, keymap heatmap on the profile, keyboard visualiser in practice, admin audit log + CSV export, teams/clans, i18n, PWA offline shell.

---

## 16. License & copyright

**Copyright © 2026 Webloom Inc. All rights reserved.**

Type Arena is proprietary software and content owned by Webloom Inc. The application, its branding, generated artwork, game designs and documentation may not be reproduced, resold or redistributed without written permission from Webloom Inc. Third-party libraries remain under their own licenses.

*Made by Webloom Inc. — every key counts.*
