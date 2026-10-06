import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { challengeProgress, notifications, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { challengePeriodKey, getChallengeStates } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ challenges: [] });
  return NextResponse.json({ challenges: await getChallengeStates(user.id) }, { headers: { "Cache-Control": "no-store" } });
}

/** Claim one completed challenge. Progress is recomputed server-side — never trusted from the client. */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to claim challenge rewards." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const id = Number(body.challengeId);
  if (!Number.isFinite(id)) return NextResponse.json({ error: "challengeId is required." }, { status: 400 });

  const state = (await getChallengeStates(user.id)).find((c) => c.id === id);
  if (!state) return NextResponse.json({ error: "Challenge not found." }, { status: 404 });
  if (!state.complete) return NextResponse.json({ error: "That challenge is not complete yet." }, { status: 400 });
  if (state.claimed) return NextResponse.json({ error: "Already claimed." }, { status: 409 });

  const day = challengePeriodKey(state.period);

  // Guard against double-claiming from two tabs: re-check inside the write path.
  const existing = await db
    .select()
    .from(challengeProgress)
    .where(and(eq(challengeProgress.userId, user.id), eq(challengeProgress.challengeId, id), eq(challengeProgress.day, day)));
  if (existing.some((row) => row.claimed)) return NextResponse.json({ error: "Already claimed." }, { status: 409 });

  if (existing.length) {
    await db.update(challengeProgress).set({ claimed: true, progress: state.progress }).where(eq(challengeProgress.id, existing[0].id));
  } else {
    await db.insert(challengeProgress).values({ userId: user.id, challengeId: id, progress: state.progress, claimed: true, day });
  }

  const [updated] = await db
    .update(users)
    .set({ xp: user.xp + state.xpReward, coins: user.coins + state.coinReward })
    .where(eq(users.id, user.id))
    .returning({ xp: users.xp, coins: users.coins });

  await db.insert(notifications).values({
    userId: user.id,
    kind: "challenge",
    title: `Challenge complete: ${state.title}`,
    body: `+${state.xpReward} XP · +${state.coinReward} coins`,
  });

  return NextResponse.json({ ok: true, xp: updated?.xp, coins: updated?.coins, reward: { xp: state.xpReward, coins: state.coinReward } });
}
