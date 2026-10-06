/**
 * Browser-side helpers for confirming that a sign-in actually "stuck".
 * A login API can succeed while the browser still refuses to store the cookie
 * (embedded previews in strict browsers, cookies disabled). Checking before we
 * navigate turns a silent redirect loop into a clear, actionable message.
 */
export type SessionCheck = { active: boolean; isAdmin: boolean; username?: string };

export async function checkSession(): Promise<SessionCheck> {
  try {
    const res = await fetch("/api/auth/me", { cache: "no-store", credentials: "same-origin" });
    const data = await res.json();
    return { active: Boolean(data.user), isAdmin: Boolean(data.user?.isAdmin), username: data.user?.username };
  } catch {
    return { active: false, isAdmin: false };
  }
}

/** True when the page is rendered inside another page's iframe (e.g. a builder preview pane). */
export function isEmbeddedFrame(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}
