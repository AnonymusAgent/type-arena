import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { friends, notifications, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { getFriends } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ friends: [] });
  return NextResponse.json({ friends: await getFriends(user.id) });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to manage friends." }, { status: 401 });
  const { username, action, friendId } = await req.json().catch(() => ({}));

  if (action === "remove" && friendId) {
    await db.delete(friends).where(and(eq(friends.userId, user.id), eq(friends.friendId, Number(friendId))));
    return NextResponse.json({ ok: true });
  }

  if (action === "challenge" && friendId) {
    await db.insert(notifications).values({
      userId: Number(friendId),
      kind: "challenge",
      title: `${user.username} challenged you!`,
      body: "Head to the Multiplayer Arena to accept the duel.",
    });
    return NextResponse.json({ ok: true, message: "Challenge sent!" });
  }

  const [target] = await db.select().from(users).where(eq(users.username, String(username ?? ""))).limit(1);
  if (!target) return NextResponse.json({ error: "Player not found." }, { status: 404 });
  if (target.id === user.id) return NextResponse.json({ error: "You cannot add yourself." }, { status: 400 });
  const existing = await db
    .select()
    .from(friends)
    .where(and(eq(friends.userId, user.id), eq(friends.friendId, target.id)));
  if (existing.length) return NextResponse.json({ error: "Already friends." }, { status: 400 });
  await db.insert(friends).values({ userId: user.id, friendId: target.id });
  await db.insert(notifications).values({
    userId: target.id,
    kind: "friend",
    title: `${user.username} added you as a friend`,
    body: "Compare stats or start a race together.",
  });
  return NextResponse.json({ ok: true });
}
