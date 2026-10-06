import { NextResponse } from "next/server";
import { eq, or } from "drizzle-orm";
import { db } from "@/db";
import { users, notifications } from "@/db/schema";
import { createSession, hashPassword, publicUser } from "@/lib/auth";
import { ensureSeeded } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  await ensureSeeded();
  const body = await req.json().catch(() => ({}));
  const username = String(body.username ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const country = String(body.country ?? "US");
  const avatar = String(body.avatar ?? "🐱");

  if (username.length < 3) return NextResponse.json({ error: "Username must be at least 3 characters." }, { status: 400 });
  if (!email.includes("@")) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(or(eq(users.username, username), eq(users.email, email)))
    .limit(1);
  if (existing.length) return NextResponse.json({ error: "Username or email already in use." }, { status: 409 });

  const [created] = await db
    .insert(users)
    .values({ username, email, passwordHash: hashPassword(password), country, avatar, streak: 1, lastPlayedDate: new Date().toISOString().slice(0, 10) })
    .returning();

  await db.insert(notifications).values({
    userId: created.id,
    kind: "system",
    title: "Welcome to Type Arena!",
    body: "Claim your daily challenge and play your first race to earn 250 bonus XP.",
  });

  // createSession() rotates any previous session and clears legacy cookies.
  await createSession(created.id);
  return NextResponse.json({ user: publicUser(created) }, { headers: { "Cache-Control": "no-store" } });
}
