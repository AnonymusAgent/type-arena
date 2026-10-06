import crypto from "crypto";
import { cookies, headers } from "next/headers";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { sessionsTable, users } from "@/db/schema";

/**
 * Session cookies
 * ---------------
 * One random token, stored server-side in `auth_sessions`, is carried by two cookies so
 * sign-in works in every context a player might open the site in:
 *
 *  - `ta_session`   SameSite=Lax (Secure on HTTPS). Normal browser tabs, including plain
 *                   http:// LAN addresses used when testing on phones.
 *  - `ta_session_x` SameSite=None; Secure; Partitioned. Used when the site is displayed
 *                   inside another site's iframe (e.g. a builder preview pane). Browsers
 *                   never send Lax cookies there, which previously caused a login loop.
 *
 * The database row is the single source of truth — cookies are only carriers. There is no
 * separate "admin" cookie: admin access is always derived from `users.is_admin`.
 */
export const SESSION_COOKIE = "ta_session";
export const EMBEDDED_SESSION_COOKIE = "ta_session_x";
export const SESSION_COOKIE_NAMES = [SESSION_COOKIE, EMBEDDED_SESSION_COOKIE] as const;
/** Cookies from older builds that must be cleaned up when they are encountered. */
const LEGACY_COOKIES = ["ta_admin"] as const;
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export function hashPassword(password: string, salt?: string) {
  const s = salt ?? crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, s, 32).toString("hex");
  return `${s}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = Buffer.from(crypto.scryptSync(password, salt, 32).toString("hex"));
  const expected = Buffer.from(hash);
  return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
}

/** True when the browser reached us over HTTPS (directly or through a TLS-terminating proxy). */
async function isHttpsRequest() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase();
  if (proto) return proto === "https";
  if (/proto=https/i.test(h.get("forwarded") ?? "")) return true;
  return (h.get("origin") ?? h.get("referer") ?? "").startsWith("https://");
}

/** Every distinct session token the browser sent, in priority order. */
export async function readSessionTokens(): Promise<string[]> {
  const jar = await cookies();
  const tokens = SESSION_COOKIE_NAMES.map((name) => jar.get(name)?.value).filter((v): v is string => Boolean(v));
  return [...new Set(tokens)];
}

async function writeSessionCookies(token: string, maxAge: number) {
  const jar = await cookies();
  const https = await isHttpsRequest();
  const expires = maxAge > 0 ? new Date(Date.now() + maxAge * 1000) : new Date(0);
  jar.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: https, path: "/", maxAge, expires });
  // Browsers silently ignore this one on plain-http origins (it must be Secure) — that's fine,
  // the Lax cookie above covers those. It is what keeps embedded previews signed in.
  jar.set(EMBEDDED_SESSION_COOKIE, token, { httpOnly: true, sameSite: "none", secure: true, partitioned: true, path: "/", maxAge, expires });
  for (const legacy of LEGACY_COOKIES) jar.set(legacy, "", { path: "/", maxAge: 0, expires: new Date(0) });
}

export async function createSession(userId: number) {
  // Rotate: revoke whatever session this browser carried before issuing a fresh token.
  const previous = await readSessionTokens();
  if (previous.length) await db.delete(sessionsTable).where(inArray(sessionsTable.token, previous));
  const token = crypto.randomBytes(32).toString("hex");
  await db.insert(sessionsTable).values({ token, userId });
  await writeSessionCookies(token, SESSION_MAX_AGE);
  return token;
}

export async function destroySession() {
  const tokens = await readSessionTokens();
  if (tokens.length) await db.delete(sessionsTable).where(inArray(sessionsTable.token, tokens));
  await writeSessionCookies("", 0);
}

export type CurrentUser = typeof users.$inferSelect;

/**
 * The one and only "who is signed in?" check, shared by pages, layouts and API routes.
 * Admin access is this result plus `isAdmin`, so the sign-in page and the dashboard can
 * never disagree and bounce a visitor between each other.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    for (const token of await readSessionTokens()) {
      const rows = await db
        .select({ account: users })
        .from(sessionsTable)
        .innerJoin(users, eq(users.id, sessionsTable.userId))
        .where(eq(sessionsTable.token, token))
        .limit(1);
      if (rows[0]) return rows[0].account;
    }
    return null;
  } catch {
    return null;
  }
}

export function publicUser(u: CurrentUser) {
  const { passwordHash: _ignored, ...rest } = u;
  void _ignored;
  return rest;
}
