import { NextResponse } from "next/server";
import { eq, or } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, verifyPassword } from "@/lib/auth";
import { attemptsRemaining, clearAttempts, registerFailedAttempt, safeAdminRedirect } from "@/lib/admin";
import { ensureSeeded } from "@/lib/data";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET() {
  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}

export async function POST(req: Request) {
  await ensureSeeded();

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
  const key = `${ip}|admin`;
  if (attemptsRemaining(key) === 0) {
    return NextResponse.json({ error: "Too many attempts. Try again in a few minutes." }, { status: 429, headers: NO_STORE });
  }

  const body = await req.json().catch(() => ({}));
  const identifier = String(body.identifier ?? "").trim();
  const password = String(body.password ?? "");
  const redirect = safeAdminRedirect(typeof body.next === "string" ? body.next : null);

  const fail = (message: string) => {
    const { remaining } = registerFailedAttempt(key);
    return NextResponse.json(
      { error: remaining > 0 ? `${message} ${remaining} attempt${remaining === 1 ? "" : "s"} left.` : message, locked: remaining === 0 },
      { status: 401, headers: NO_STORE },
    );
  };

  if (!identifier || !password) return fail("Enter both your admin username and password.");

  const [account] = await db
    .select()
    .from(users)
    .where(or(eq(users.username, identifier), eq(users.email, identifier.toLowerCase())))
    .limit(1);

  if (!account || !verifyPassword(password, account.passwordHash)) return fail("Invalid admin credentials.");
  if (!account.isAdmin) return fail("This account does not have administrator access.");

  clearAttempts(key);
  // A normal database session — admin rights are re-derived from users.is_admin on every request.
  await createSession(account.id);
  return NextResponse.json({ ok: true, redirect, username: account.username }, { headers: NO_STORE });
}
