# Google AdSense integration — implementation report

Site: `https://type-arena-silk.vercel.app` · Hosting: Vercel · Stack: Next.js 16 App Router, React 19, Tailwind 4.

This document is the single source of truth for the integration: what was built, where every value lives, what still has to be done **inside the Google AdSense account**, and how the result was tested.

> **Status: not approved, not monetised.** The code ships inert. No ad script is loaded, no ad request is made and no `ads.txt` is served until a real publisher ID is configured and the master switch is turned on in Vercel's Production environment. Approval can only be confirmed by Google.

---

## 1. What was implemented

### New files

| File | Purpose |
| --- | --- |
| `src/lib/adsense.ts` | Public AdSense config, placeholder validation, live/disabled/preview mode, slot lookup, `ads.txt` body builder. |
| `src/lib/site.ts` | Canonical site URL (`NEXT_PUBLIC_SITE_URL` with a safe fallback), site name/owner/support email. |
| `src/lib/analytics.ts` | Optional GA4 helpers (`trackEvent`, `trackPageView`) — no-ops unless a real `G-` ID is configured. |
| `src/components/ads/ad-unit.tsx` | The reusable responsive ad component (`AdUnit`). |
| `src/components/ads/adsense-script.tsx` | Single, consent-gated, `afterInteractive` loader for the official AdSense tag. |
| `src/components/analytics/google-analytics.tsx` | Consent-gated GA4 loader + App Router `page_view` tracking. |
| `src/components/consent/consent-provider.tsx` | Consent state stored via `useSyncExternalStore` (hydration-safe, no setState-in-effect). |
| `src/components/consent/consent-banner.tsx` | Non-modal consent prompt. |
| `src/app/ads.txt/route.ts` | `/ads.txt` served as `text/plain` from the configured publisher ID. |
| `.env.example` | Documented environment template, including the AdSense placeholders. |
| `docs/adsense.md` | This report. |

### Modified files

| File | Change |
| --- | --- |
| `src/app/layout.tsx` | Real canonical origin (`metadataBase`), consent provider/banner, single AdSense + GA loaders, public `google-adsense-account` verification tag, accurate `WebSite`/`Organization` JSON-LD (removed the unsupported `SearchAction`). |
| `src/app/page.tsx` | Two homepage ad placements, fabricated testimonials removed, real platform numbers, original "Field Guide" content with internal links, ad-free hero/CTAs. |
| `src/app/games/page.tsx`, `src/app/games/[slug]/page.tsx` | Content ads; unverified rating/player counts and fabricated `aggregateRating` structured data removed. |
| `src/app/games/games-browser.tsx`, `src/components/game-card.tsx` | No more displayed ratings/player counts; honest sort label. |
| `src/app/typing-test/typing-test-client.tsx` | Results-only ad (below the analysis), GA4 completion event. No ad during a test. |
| `src/app/practice/page.tsx` | One ad below the training surface. |
| `src/app/leaderboards/page.tsx` | One conservative ad well below the rankings. |
| `src/app/legal/[doc]/page.tsx` | Full Privacy Policy (advertising, cookies, rights), Terms, Cookie Settings. |
| `src/app/legal/[doc]/cookie-settings.tsx` | Real consent controls (wired to the consent provider). |
| `src/app/robots.ts`, `src/app/sitemap.ts` | Use the canonical origin; private/auth routes disallowed; sitemap uses real priorities. |
| `src/lib/data.ts` | `getPlatformStats()` returns real database counts (removed multipliers and invented baselines). |
| `src/lib/seed.ts` | Empty demo lists are no longer inserted (Drizzle throws on `values([])`), so a database without `SEED_DEMO=1` now seeds completely instead of aborting mid-run. |
| `next.config.ts`, `public/images/arena-hero.jpg` | Declared the hero image's `quality: 86` and added the missing hero asset referenced by `hero-typing.tsx`. |
| `README.md` | AdSense/environment documentation. |
| `src/components/game/game-runner.tsx` | GA4 `game_start` / `game_complete` events (no PII). |

Existing gameplay, authentication, database schema, styling, animations, multiplayer and routing were left intact. No schema migrations are required.

---

## 2. Ad placements

| Page | Slot env var | Format | Loading | Why |
| --- | --- | --- | --- | --- |
| Homepage — after "The Showdown" | `NEXT_PUBLIC_ADSENSE_SLOT_HOME` | horizontal | lazy (320 px pre-load margin) | Between major content sections; below the hero and its CTAs. |
| Homepage — after "The Rankings" | `NEXT_PUBLIC_ADSENSE_SLOT_HOME` | horizontal | lazy | Lower-page second placement; still between sections. |
| Game library (`/games`) | `NEXT_PUBLIC_ADSENSE_SLOT_CONTENT` | auto | lazy | After the full catalogue grid, never between cards. |
| Game detail (`/games/[slug]`) | `NEXT_PUBLIC_ADSENSE_SLOT_CONTENT` | auto | lazy | Below the game interface, above the written "How to play" guide. |
| Typing test (results only) | `NEXT_PUBLIC_ADSENSE_SLOT_RESULTS` | auto | eager | Visible immediately after a test; never mounted during a test. |
| Practice (`/practice`) | `NEXT_PUBLIC_ADSENSE_SLOT_CONTENT` | auto | lazy | Below the drill surface. |
| Leaderboards (`/leaderboards`) | `NEXT_PUBLIC_ADSENSE_SLOT_CONTENT` | auto | lazy | Well below the rankings table. |

**Deliberately no ads** on: the hero, primary CTAs, game start/finish screens, timers, HUDs, scoreboards, typing input/results analysis, multiplayer matchmaking and rooms, tournaments, player profiles, dashboards, auth pages and legal pages. See §10 for how to add placements later.

All units are labelled `Advertisement`, are `<aside aria-label="Advertisement">`, never sticky/overlaid, use `w-full` + `overflow-hidden` (no horizontal scrolling at 320 px), and reserve layout height (`min-h-*`) so the ad arriving does not shift content.

---

## 3. Where to put the real values

All AdSense values are **public identifiers** — do not try to hide them, and do not put them in server-only variables if the browser must read them. Set them in **Vercel → Project → Settings → Environment Variables → Production** (and optionally Preview with test values), or in `.env` locally.

| Variable | Placeholder | Where to find it |
| --- | --- | --- |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | `ca-pub-REPLACE_WITH_MY_PUBLISHER_ID` | AdSense → **Account** → Account information → Publisher ID. Format `ca-pub-` + 16 digits. |
| `NEXT_PUBLIC_ADSENSE_SLOT_HOME` | `REPLACE_WITH_HOME_AD_SLOT_ID` | AdSense → **Ads** → By ad unit → create a **Display** unit → copy the numeric `data-ad-slot`. |
| `NEXT_PUBLIC_ADSENSE_SLOT_CONTENT` | `REPLACE_WITH_CONTENT_AD_SLOT_ID` | Same, second display unit (used on games/practice/leaderboards). |
| `NEXT_PUBLIC_ADSENSE_SLOT_RESULTS` | `REPLACE_WITH_RESULTS_AD_SLOT_ID` | Same, third display unit for the typing-test results page. |
| `NEXT_PUBLIC_ADSENSE_ENABLED` | `false` | Set to `true` **only after** the IDs above are real and the site is approved. This is the master switch. |
| `NEXT_PUBLIC_ADSENSE_TEST_MODE` | `false` | Optional: forces the inert placeholder in a production build (preview deployments). Never on the public site. |
| `ADSENSE_ADS_TXT` | *(empty)* | Optional override for `/ads.txt`, verbatim from AdSense → Ads → By site → `ads.txt`. Server-only. |
| `NEXT_PUBLIC_SITE_URL` | `https://type-arena-silk.vercel.app` | Canonical origin used for metadata, sitemap, robots. Change only when a custom domain is attached. |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | *(empty)* | Optional GA4 measurement ID (`G-XXXXXXXXXX`). Leave empty for no analytics. |

The code defaults to the placeholders, so a deployment without these variables is safe: `isValidPublisherId()` rejects anything matching `REPLACE_WITH…`, and `resolveAdMode()` returns `disabled`.

**How the switch works**

```
NODE_ENV === "production"
  AND NEXT_PUBLIC_ADSENSE_ENABLED === "true"
  AND publisher ID matches /^ca-pub-\d{16}$/
  AND visitor granted advertising consent
  AND the specific slot is numeric
    → AdSense script loads, <ins> tags request ads
otherwise
    → nothing is rendered / requested (development shows an inert labelled placeholder)
```

---

## 4. Manual AdSense steps still required (owner actions)

These happen in Google's UI — they cannot be done from the codebase.

1. **Create / open the AdSense account** for the site owner and complete payee/tax details.
2. **Add the site**: AdSense → Sites → **Add site** → `type-arena-silk.vercel.app` (or the custom domain). Choose **HTTPS**.
3. **Verify ownership** — either method works:
   - The site emits `<meta name="google-adsense-account" content="ca-pub-…">` once `NEXT_PUBLIC_ADSENSE_CLIENT` is real and redeployed.
   - Or place Google's verification snippet/tag as instructed; the meta tag is already implemented.
   - `ads.txt` is generated automatically at `/ads.txt` when the publisher ID is valid (see §5).
4. **Request review** (AdSense → Sites → Request review) once the site is fully deployed with real, working content. Do **not** set `NEXT_PUBLIC_ADSENSE_ENABLED=true` before approval.
5. **Create three Display ad units** (Home, Content, Results) and put their numeric slot IDs in Vercel.
6. **Consent for EEA/UK/CH:** Google requires a **Google-certified CMP** for ads in those regions. The first-party banner in this repo is a baseline, not a certified CMP. In AdSense go to **Privacy & messaging → GDPR** (and **CPRA** for California if applicable), publish a message, and select the certified CMP option that applies to the account. Google will serve the certified message to affected visitors. Our banner must stay enabled for the rest of the world; do not remove it.
7. **Enable ads** only after approval + ad units + CMP: set `NEXT_PUBLIC_ADSENSE_ENABLED=true` in the **Production** environment and redeploy.
8. **Link AdSense ↔ Analytics** (optional): AdSense → Account → Access & authorization → link Google Analytics, and in GA4 enable the AdSense link. Revenue and ad-performance reports then appear in GA4 (Reports → Monetization).
9. **Monitor** Policy centre, Site health and Page-view RPM for the first weeks. Expand placements only when CLS/engagement stay healthy.

Google's current guidance: <https://support.google.com/adsense/answer/7584263> (setup), <https://support.google.com/adsense/answer/10502938> (ads.txt), <https://support.google.com/adsense/answer/13554116> (consent management).

---

## 5. `/ads.txt`

- Implemented as a route handler: `src/app/ads.txt/route.ts` → `https://<domain>/ads.txt`, `Content-Type: text/plain; charset=utf-8`.
- Generated from the publisher ID:
  `google.com, pub-<16 digits>, DIRECT, f08c47fec0942fa0`
  (`f08c47fec0942fa0` is Google's fixed, public certification-authority ID — never invent or change it.)
- If `ADSENSE_ADS_TXT` is set, its exact contents are served instead (use this if Google supplies a different/expanded seller file).
- With a missing or placeholder publisher ID the route returns **404** — no fake seller entries are ever published.
- There was no pre-existing `ads.txt` in the repository or `public/` folder, so nothing was overwritten.

Verify after deploying with the real ID:

```bash
curl -sI https://type-arena-silk.vercel.app/ads.txt   # expect 200 + content-type: text/plain
curl -s  https://type-arena-silk.vercel.app/ads.txt   # expect the single google.com line
```

Then re-check AdSense → Sites → `ads.txt` status (it can take 24–48 h to update).

---

## 6. Consent and privacy

- **No ad request, no GA ping** happens before an explicit choice. Both scripts are conditionally rendered only after consent.
- Decision model: `{ analytics: boolean, ads: boolean }`, stored under `ta_consent` (v1, timestamped). Survives navigation; multi-tab syncs through the `storage` event.
- Visitors can grant/withdraw at **/legal/cookies** (`CookieSettings`) or from the banner. Withdrawing ads stops new ad requests immediately (a script already loaded in that page view cannot be unloaded without a reload — stated in the policy).
- The banner is suppressed on `/games/[slug]`, `/typing-test` and `/practice` so it cannot interrupt input, and the bottom sheet sits above the mobile nav rather than over controls.
- Privacy Policy now covers: data stored, essential cookies (`ta_session`, `ta_session_x`), localStorage keys, Google AdSense + third-party ad cookies, personalised-ads opt-outs (Google Ads Settings, aboutads.info, youronlinechoices.eu), optional GA4, retention, rights, children, contact.
- Terms of Service now cover fair play, advertising (no artificial clicks/impressions), IP, availability and liability.
- **EEA/UK/CH note:** a first-party banner alone is not sufficient for Google ad serving there. Configure a Google-certified CMP as described in §4.6. This is a manual account action.
- No personal data is sent to analytics: only page paths and aggregate gameplay values (`game_start`, `game_complete`, `typing_test_complete` with game slug, WPM, accuracy, duration, signed-in boolean).

---

## 7. Adsense readiness checklist (site-side)

| Item | Status |
| --- | --- |
| Original, developed content | ✅ 16 game pages with instructions/scoring, typing test, practice drills, Field Guide articles, About/FAQ. |
| Clear navigation, working internal links | ✅ Navbar, footer, breadcrumbs, in-page links, sitemap. |
| About, Contact, Privacy, Terms | ✅ `/about` (contact + FAQ + `FAQPage` JSON-LD), `/legal/privacy`, `/legal/terms`, `/legal/cookies`. |
| Advertising disclosures | ✅ Privacy §3, Terms §4, Cookie Settings. |
| Cookie/consent experience | ✅ Banner + settings page (see CMP note for EEA). |
| Fabricated testimonials / unverified counts | ✅ Removed: homepage testimonials deleted, platform stats now real DB counts, game ratings/player counts removed, fake `aggregateRating` schema removed, seeded tournament "entrants" numbers no longer displayed. |
| Misleading claims | ✅ Removed fabricated "42k+ players"/"1.3M races" multipliers. Games catalogue seed data lives in the DB and remains editable from `/admin`. |
| Accessibility / mobile | ✅ Ads use semantic `aside`, labels, responsive widths; banner is non-modal; no sticky/overlay ads. Existing keyboard/touch behaviour untouched. |
| Screens/ad density | ✅ 7 placements across 6 page types, none above the fold, none in interactive surfaces. |
| Thin/auto-generated pages for ads | ✅ None created. Ads only on pages with substantial original content. |
| Policy compliance | ⚠️ Google's review is external; approval cannot be claimed from code. |

---

## 8. SEO changes

- `metadataBase` and all absolute URLs now use `NEXT_PUBLIC_SITE_URL` (defaults to the production domain); previously `type-arena.example.com`.
- Canonical tags: root (`/`), game pages, typing test, practice, multiplayer, leaderboards, achievements, legal docs.
- `robots.txt`: keeps `/admin`, `/api/`, dashboard/profile/auth routes out of the index; explicitly allows `AdsBot-Google` (needed for ad crawling).
- `sitemap.xml`: canonical origin, real priorities, all 13 static routes + game pages.
- Structured data: accurate `WebSite` + `Organization` + `VideoGame` (with `isAccessibleForFree`). Removed the unsupported `SearchAction` (the games page has no `q` parameter) and the fabricated `aggregateRating`.
- Internal linking: homepage Field Guide links to practice, typing test, games, legal pages; game pages link to related games; footer links to all major sections and cookie settings.

---

## 9. Performance & testing

**Performance design**

- One AdSense script for the app, `async` + `afterInteractive`, injected only after consent; no duplicate `<script>` on client navigation (stable `next/script` id).
- Ad containers reserve height before fill and collapse when unfilled (10 s grace) — no empty bordered boxes, no ad-blocker artifacts.
- Below-the-fold units wait for a 320 px `IntersectionObserver` margin; the results unit loads eagerly because it is immediately visible.
- Game engines are still `next/dynamic` with `ssr:false`; ads never block game initialisation, keystroke handling or timers.
- No layout shift is introduced for consenting visitors; ad-free visitors get zero ad markup.

**Verification performed in this workspace**

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | ✅ passes |
| `npm run build` (Next.js 16.2.6, production, Turbopack) | ✅ compiles, all routes generated incl. `/ads.txt` |
| `npm run lint` | ⚠️ 22 errors — all pre-existing (`react-hooks/set-state-in-effect` in older game/provider code). The new AdSense/consent files add **0** lint errors (26 → 22 after fixes). |
| `/ads.txt` with the placeholder publisher ID | ✅ `404`, `text/plain` (no fabricated sellers) — checked with `curl` against `next dev` and `next start` |
| `/ads.txt` with a well-formed test publisher ID | ✅ `200`, `text/plain; charset=utf-8`, body `google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0` — local test ID only, never deployed |
| Ads in development | ✅ only the inert "Ad slot preview" box; AdSense script never loaded (checked in rendered HTML with `curl`) |
| Production build with placeholders | ✅ no `ins.adsbygoogle`, no AdSense script, no placeholder markup on `/practice`, `/games`, `/games/type-race` (`next start` + `curl`) |
| Consent granted → ad request | ✅ exactly one `adsbygoogle` push, correct `data-ad-client` / `data-ad-slot`, label rendered — jsdom client-render harness mounting the real `ConsentProvider` + `AdUnit` |
| Ads consent denied / undecided | ✅ no `<ins>`, no queued request (`0` pushes) — same harness |
| Re-render does not double-push | ✅ still one request — same harness |
| Unfilled / blocked ad | ✅ unit removes itself, no empty box (`data-ad-status="unfilled"`) — same harness |
| Consent banner + persistence | ✅ banner appears when undecided, "Accept all" stores `{analytics:true, ads:true}` in `ta_consent`, banner hides — same harness |
| Canonical tags | ✅ self-referencing on `/about`, `/games`, `/tournaments`, `/shop`, `/legal/*`, `/typing-test` (a layout-level canonical that would have pointed every page at `/` was removed) |
| `robots.txt` / `sitemap.xml` | ✅ canonical origin, AdsBot allowed, private routes disallowed |

Client-side navigation was **not** exercised in a real browser here; the design keeps one layout-scoped `next/script` with a stable id (never re-injected) while each page mounts its own container, which is the documented AdSense SPA pattern. Confirm it in the browser checklist below.

**Not possible in this sandbox:** no PostgreSQL instance and no browser binary, so the homepage/leaderboards/tournaments (DB-backed) and a real Lighthouse run were not executed here. The component harness used jsdom and a synthetic publisher ID; it never contacted Google and generated no impressions. Run the following on a Vercel preview with the real database before/after enabling ads:

- Lighthouse (mobile + desktop) on `/`, `/games/type-race`, `/typing-test`; compare LCP/CLS before and after `NEXT_PUBLIC_ADSENSE_ENABLED=true`.
- Chrome DevTools → Network: exactly one `adsbygoogle.js`, one `googleads.g.doubleclick.net` pagead request per unit.
- Console: no hydration warnings on first load, hard refresh and client navigation.
- Mobile 320/390/768/1280 px: no horizontal scroll, ads inside the viewport, banner clear of the bottom nav.

---

## 10. Adding or changing placements later

```tsx
import AdUnit from "@/components/ads/ad-unit";

<AdUnit
  placement="content"           // "home" | "content" | "results"
  format="auto"                 // or "horizontal" | "rectangle" | "vertical"
  minHeightClass="min-h-[250px]"
  lazy                          // omit / lazy={false} for units visible at first paint
  className="mt-10"
/>
```

Rules that must stay true: never inside an active game/test/controls; never sticky or overlaid; never between rapid gameplay actions; always below or between content; keep the ad count per page small.

To add a fourth slot: add `NEXT_PUBLIC_ADSENSE_SLOT_*` to `src/lib/adsense.ts` (`ADSENSE_SLOTS`), `.env.example` and Vercel, then use `placement="newName"`. `isAdUnitConfigured()` automatically keeps it dormant until the ID is valid.

---

## 11. Remaining manual actions / open items

1. Provide the real publisher ID and three slot IDs; set them in Vercel (Production). Until then the site shows **no ads**.
2. Complete AdSense site verification and request review (owner action).
3. Configure a Google-certified CMP under AdSense → Privacy & messaging for EEA/UK/CH traffic.
4. Set `NEXT_PUBLIC_SITE_URL` to the final domain if a custom domain is attached.
5. Optionally link AdSense to GA4 and set `NEXT_PUBLIC_GA_MEASUREMENT_ID`.
6. Review DB-seeded catalogue metadata (players/rating values in the `games` table, entrants in the `tournaments` table) from `/admin`; the public UI no longer displays the unverified numbers, but the catalogue values still drive default ordering.
7. Run Lighthouse and the manual browser checklist from §9 against a deployed preview with the production database.
8. Do not click your own ads, and do not ask anyone else to. Validate integration with the AdSense "test" identifiers or the inert placeholder mode only.

---

## 12. Rollback

Set `NEXT_PUBLIC_ADSENSE_ENABLED=false` in Vercel and redeploy — every unit disappears and no ad request is made. Removing the variables entirely has the same effect (the config falls back to placeholders). No database or schema changes were made, so rollback is configuration-only.
