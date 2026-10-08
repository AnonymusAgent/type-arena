import { getCurrentUser, type CurrentUser } from "@/lib/auth";

export type AdminUser = CurrentUser;

/**
 * Admin = a valid database session whose user row has `is_admin = true`.
 * Nothing the browser sends (cookie flags, headers, form fields) can grant admin access.
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  const user = await getCurrentUser();
  return user?.isAdmin ? user : null;
}

/**
 * Where to send an operator after sign-in. Only paths inside the admin area are allowed,
 * which rules out open redirects (`//evil.com`) and redirecting back to the sign-in page.
 */
export function safeAdminRedirect(next: string | null | undefined): string {
  if (typeof next !== "string" || /[\r\n\\]/.test(next)) return "/admin";
  if (!/^\/admin(?:[/?#]|$)/.test(next)) return "/admin";
  if (/^\/admin\/login(?:[/?#]|$)/.test(next)) return "/admin";
  return next;
}

/* ------------------------------ attempt throttling ----------------------------- */

type Bucket = { count: number; resetAt: number };
const store = globalThis as typeof globalThis & { __taAdminAttempts?: Map<string, Bucket> };
const attempts = store.__taAdminAttempts ?? new Map<string, Bucket>();
store.__taAdminAttempts = attempts;

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000;

export function attemptsRemaining(key: string) {
  const bucket = attempts.get(key);
  if (!bucket || bucket.resetAt < Date.now()) return MAX_ATTEMPTS;
  return Math.max(0, MAX_ATTEMPTS - bucket.count);
}

export function registerFailedAttempt(key: string) {
  const bucket = attempts.get(key);
  const expired = !bucket || bucket.resetAt < Date.now();
  const next = expired ? { count: 1, resetAt: Date.now() + WINDOW_MS } : { count: bucket.count + 1, resetAt: bucket.resetAt };
  attempts.set(key, next);
  return { remaining: Math.max(0, MAX_ATTEMPTS - next.count), retryInSeconds: Math.max(0, Math.round((next.resetAt - Date.now()) / 1000)) };
}

export function clearAttempts(key: string) {
  attempts.delete(key);
}
