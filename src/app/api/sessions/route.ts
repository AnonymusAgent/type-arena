import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { gameSessions, notifications, userAchievements, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { computeRewards, levelFromXp } from "@/lib/progression";
import { ACHIEVEMENTS } from "@/lib/achievements";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const payload = {
    gameSlug: String(body.gameSlug ?? "unknown"),
    wpm: Number(body.wpm ?? 0),
    accuracy: Number(body.accuracy ?? 0),
    score: Number(body.score ?? 0),
    errors: Number(body.errors ?? 0),
    chars: Number(body.chars ?? 0),
    durationSec: Number(body.durationSec ?? 0),
    won: Boolean(body.won),
  };
  const rewards = computeRewards(payload);
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ saved: false, guest: true, rewards, unlocked: [] });
  }

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  const streak = user.lastPlayedDate === today ? user.streak : user.lastPlayedDate === yesterday ? user.streak + 1 : 1;

  const gamesPlayed = user.gamesPlayed + 1;
  const avgWpm = (user.avgWpm * user.gamesPlayed + payload.wpm) / gamesPlayed;
  const accuracy = (user.accuracy * user.gamesPlayed + payload.accuracy) / gamesPlayed;
  const bestWpm = Math.max(user.bestWpm, payload.wpm);
  const xp = user.xp + rewards.xp;

  await db.insert(gameSessions).values({
    ...payload,
    userId: user.id,
    xpEarned: rewards.xp,
    coinsEarned: rewards.coins,
  });

  await db
    .update(users)
    .set({
      xp,
      coins: user.coins + rewards.coins,
      gamesPlayed,
      gamesWon: user.gamesWon + (payload.won ? 1 : 0),
      avgWpm: Math.round(avgWpm * 10) / 10,
      accuracy: Math.round(accuracy * 10) / 10,
      bestWpm,
      streak,
      lastPlayedDate: today,
    })
    .where(eq(users.id, user.id));

  // Achievements
  const owned = await db.select().from(userAchievements).where(eq(userAchievements.userId, user.id));
  const level = levelFromXp(xp).level;
  const stats = {
    games: gamesPlayed,
    bestWpm,
    accuracy: Math.max(accuracy, payload.accuracy),
    wins: user.gamesWon + (payload.won ? 1 : 0),
    streak,
    perfect: payload.accuracy >= 100 ? 1 : 0,
    level,
  } as Record<string, number>;

  const unlocked: string[] = [];
  for (const def of ACHIEVEMENTS) {
    const progress = Math.min(def.goal, Math.round(stats[def.metric] ?? 0));
    const row = owned.find((o) => o.code === def.code);
    const complete = progress >= def.goal;
    if (!row) {
      await db.insert(userAchievements).values({
        userId: user.id,
        code: def.code,
        progress,
        unlockedAt: complete ? new Date() : null,
      });
      if (complete) unlocked.push(def.code);
    } else if (!row.unlockedAt) {
      await db
        .update(userAchievements)
        .set({ progress, unlockedAt: complete ? new Date() : null })
        .where(and(eq(userAchievements.id, row.id), isNull(userAchievements.unlockedAt)));
      if (complete) unlocked.push(def.code);
    }
  }

  if (unlocked.length) {
    const bonusXp = unlocked.reduce((s, c) => s + (ACHIEVEMENTS.find((a) => a.code === c)?.xpReward ?? 0), 0);
    const bonusCoins = unlocked.reduce((s, c) => s + (ACHIEVEMENTS.find((a) => a.code === c)?.coinReward ?? 0), 0);
    await db
      .update(users)
      .set({ xp: xp + bonusXp, coins: user.coins + rewards.coins + bonusCoins })
      .where(eq(users.id, user.id));
    await db.insert(notifications).values(
      unlocked.map((c) => ({
        userId: user.id,
        kind: "achievement",
        title: `Achievement unlocked: ${ACHIEVEMENTS.find((a) => a.code === c)?.name}`,
        body: `+${ACHIEVEMENTS.find((a) => a.code === c)?.xpReward} XP`,
      })),
    );
  }

  return NextResponse.json({
    saved: true,
    rewards,
    unlocked: unlocked.map((c) => ACHIEVEMENTS.find((a) => a.code === c)),
    level: levelFromXp(xp),
    streak,
  });
}
