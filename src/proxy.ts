import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIES = ["ta_session", "ta_session_x"];
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function hasSessionCookie(req: NextRequest) {
  return SESSION_COOKIES.some((name) => Boolean(req.cookies.get(name)?.value));
}

/**
 * CSRF guard for every state-changing API call. Modern browsers label each request with
 * Sec-Fetch-Site; anything "cross-site" is refused. Older browsers fall back to an Origin
 * vs Host comparison. Non-browser clients (no Origin) still have to authenticate normally.
 */
function isCrossSiteWrite(req: NextRequest) {
  if (SAFE_METHODS.has(req.method)) return false;
  const fetchSite = req.headers.get("sec-fetch-site");
  if (fetchSite) return fetchSite === "cross-site";
  const origin = req.headers.get("origin");
  if (!origin) return false;
  if (origin === "null") return true;
  try {
    const originHost = new URL(origin).host.toLowerCase();
    const hosts = [req.headers.get("x-forwarded-host"), req.headers.get("host"), req.nextUrl.host]
      .filter((value): value is string => Boolean(value))
      .flatMap((value) => value.split(","))
      .map((value) => value.trim().toLowerCase());
    return !hosts.includes(originHost);
  } catch {
    return true;
  }
}

/**
 * Next.js 16 request proxy (formerly "middleware").
 *
 * /admin pages are deliberately NOT redirected here. The dashboard and its sign-in page
 * both run the same database-backed check (src/lib/admin.ts), so they can never disagree
 * and bounce a visitor back and forth.
 */
export function proxy(req: NextRequest) {
  if (isCrossSiteWrite(req)) {
    return NextResponse.json({ error: "Cross-site request blocked." }, { status: 403 });
  }
  if (req.nextUrl.pathname.startsWith("/api/admin/") && !hasSessionCookie(req)) {
    return NextResponse.json({ error: "Administrator authentication required." }, { status: 401 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
