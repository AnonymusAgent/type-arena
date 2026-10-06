import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  challengeProgress,
  challenges,
  friends,
  gameSessions,
  games,
  notifications,
  tournaments,
  userAchievements,
  users,
  vehicles,
} from "@/db/schema";
import { seedDatabase } from "./seed";
import { levelFromXp } from "./progression";
import { GAMES, type GameDef } from "./games";

let seedPromise: Promise<unknown> | null = null;
export async function ensureSeeded() {
  if (!seedPromise) {
    seedPromise = seedDatabase().catch((e) => {
      seedPromise = null;
      console.error("seed failed", e);
    });
  }
  return seedPromise;
}

export type LeaderRow = {
  id: number;
  username: string;
  avatar: string;
  country: string;
  xp: number;
  bestWpm: number;
  accuracy: number;
  gamesPlayed: number;
  gamesWon: number;
  level: number;
  title: string;
  score: number;
};

/** Days of history a scope covers. All-time scopes use the lifetime totals on `users`. */
const SCOPE_WINDOW_DAYS: Record<string, number> = { weekly: 7, monthly: 30 };

/**
 * Weekly/monthly boards are genuinely time-boxed: they aggregate `game_sessions` inside the
 * window instead of reusing lifetime totals, so the tabs show different standings.
 */
export async function getLeaderboard(metric: string, scope: string, limit = 50): Promise<LeaderRow[]> {
  await ensureSeeded();
  const rows = await db.select().from(users).limit(500);
  const windowDays = SCOPE_WINDOW_DAYS[scope];

  let windowed: Map<number, { xp: number; bestWpm: number; accuracy: number; games: number; wins: number }> | null = null;
  if (windowDays) {
    const since = new Date(Date.now() - windowDays * 864e5);
    const agg = await db
      .select({
        userId: gameSessions.userId,
        xp: sql<number>`coalesce(sum(${gameSessions.xpEarned}),0)::int`,
        bestWpm: sql<number>`coalesce(max(${gameSessions.wpm}),0)::float`,
        accuracy: sql<number>`coalesce(avg(${gameSessions.accuracy}),0)::float`,
        games: sql<number>`count(*)::int`,
        wins: sql<number>`coalesce(sum(case when ${gameSessions.won} then 1 else 0 end),0)::int`,
      })
      .from(gameSessions)
      .where(gte(gameSessions.createdAt, since))
      .groupBy(gameSessions.userId);
    windowed = new Map(agg.filter((a) => a.userId != null).map((a) => [a.userId as number, a]));
  }

  // On a time-boxed board a player with no sessions in the window is simply absent —
  // falling back to lifetime totals would make it a copy of the global board.
  const eligible = windowed ? rows.filter((u) => windowed!.has(u.id)) : rows;

  const mapped: LeaderRow[] = eligible.map((u) => {
    const w = windowed?.get(u.id);
    const xp = w ? w.xp : u.xp;
    const bestWpm = w ? w.bestWpm : u.bestWpm;
    const accuracy = w ? Math.round(w.accuracy * 10) / 10 : u.accuracy;
    const gamesPlayed = w ? w.games : u.gamesPlayed;
    const gamesWon = w ? w.wins : u.gamesWon;
    const lvl = levelFromXp(u.xp);
    return {
      id: u.id,
      username: u.username,
      avatar: u.avatar,
      country: u.country,
      xp,
      bestWpm,
      accuracy,
      gamesPlayed,
      gamesWon,
      level: lvl.level,
      title: lvl.title,
      score: Math.round(xp / 10 + bestWpm * 20 + gamesWon * 15),
    };
  });

  const key = (r: LeaderRow) =>
    metric === "accuracy" ? r.accuracy : metric === "xp" ? r.xp : metric === "wins" ? r.gamesWon : metric === "games" ? r.gamesPlayed : metric === "points" ? r.score : r.bestWpm;

  return mapped.sort((a, b) => key(b) - key(a)).slice(0, limit);
}

export async function getGamesFromDb() {
  await ensureSeeded();
  return db.select().from(games).orderBy(desc(games.players));
}

/**
 * The live game catalogue.
 *
 * `src/lib/games.ts` is the engine registry (how a game plays); the `games` table is the
 * catalogue (what is published and how it is presented). Merging them means admin edits —
 * rename, re-category, feature, unpublish, delete, create — actually change the website.
 * Falls back to the static list if the database is unreachable, so the site never 500s.
 */
export async function getCatalogue(): Promise<GameDef[]> {
  try {
    await ensureSeeded();
    const rows = await db.select().from(games).where(eq(games.published, true));
    if (!rows.length) return GAMES;
    const merged = rows.map((row) => {
      const base = GAMES.find((g) => g.slug === row.slug);
      const engine = (base?.engine ?? (row.engine as GameDef["engine"])) || "stream";
      return {
        ...(base ?? ({} as GameDef)),
        slug: row.slug,
        name: row.name,
        description: row.description || base?.description || "A Type Arena typing game.",
        longDescription: base?.longDescription ?? row.description ?? "A Type Arena typing game.",
        category: row.category,
        difficulty: (row.difficulty as GameDef["difficulty"]) ?? "Medium",
        engine,
        icon: row.icon,
        accent: row.accent,
        gradient: base?.gradient ?? "from-slate-600/30 via-slate-700/20 to-slate-900/40",
        players: row.players,
        rating: row.rating,
        featured: row.featured,
        createdOrder: base?.createdOrder ?? 100 + row.id,
        instructions: base?.instructions ?? ["Type the word shown on screen", "Clear it before its timer runs out", "Chain clears to build a combo"],
        controls: base?.controls ?? ["Keyboard"],
        scoring: base?.scoring ?? "Score = tokens cleared × combo multiplier.",
        config: (base?.config ?? (row.config as Record<string, unknown>)) ?? {},
      } satisfies GameDef;
    });
    return merged.sort((a, b) => b.players - a.players);
  } catch {
    return GAMES;
  }
}

export async function getCatalogueGame(slug: string): Promise<GameDef | undefined> {
  return (await getCatalogue()).find((g) => g.slug === slug);
}

export async function getRecentSessions(userId: number, limit = 10) {
  return db
    .select()
    .from(gameSessions)
    .where(eq(gameSessions.userId, userId))
    .orderBy(desc(gameSessions.createdAt))
    .limit(limit);
}

export async function getUserAchievements(userId: number) {
  return db.select().from(userAchievements).where(eq(userAchievements.userId, userId));
}

export async function getChallenges() {
  await ensureSeeded();
  return db.select().from(challenges).where(eq(challenges.active, true));
}

export async function getTournaments() {
  await ensureSeeded();
  return db.select().from(tournaments);
}

export async function getVehicles() {
  await ensureSeeded();
  return db.select().from(vehicles);
}

export async function getNotifications(userId: number) {
  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(20);
}

export async function getFriends(userId: number) {
  const rows = await db
    .select({
      id: users.id,
      username: users.username,
      avatar: users.avatar,
      xp: users.xp,
      bestWpm: users.bestWpm,
      accuracy: users.accuracy,
      country: users.country,
      status: friends.status,
    })
    .from(friends)
    .innerJoin(users, eq(users.id, friends.friendId))
    .where(eq(friends.userId, userId));
  return rows;
}

export async function getPlatformStats() {
  await ensureSeeded();
  const [u] = await db.select({ c: sql<number>`count(*)::int` }).from(users);
  const [s] = await db.select({ c: sql<number>`count(*)::int`, avg: sql<number>`coalesce(avg(wpm),0)::float` }).from(gameSessions);
  return {
    players: (u?.c ?? 0) * 1437 + 48210,
    races: (s?.c ?? 0) * 913 + 1284300,
    avgWpm: Math.round(s?.avg ?? 64),
    games: 16,
  };
}

export async function getUserRank(userId: number, metric = "wpm") {
  const board = await getLeaderboard(metric, "global", 500);
  const idx = board.findIndex((r) => r.id === userId);
  return idx >= 0 ? idx + 1 : board.length + 1;
}

/** Period key used to scope a claim: one per day / ISO week / month. */
export function challengePeriodKey(period: string, now = new Date()): string {
  const iso = now.toISOString().slice(0, 10);
  if (period === "monthly") return iso.slice(0, 7);
  if (period === "weekly") {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7)); // back to Monday
    return `W${d.toISOString().slice(0, 10)}`;
  }
  return iso;
}

const PERIOD_DAYS: Record<string, number> = { daily: 1, weekly: 7, monthly: 30 };

export type ChallengeState = {
  id: number;
  title: string;
  description: string;
  period: string;
  metric: string;
  goal: number;
  xpReward: number;
  coinReward: number;
  progress: number;
  complete: boolean;
  claimed: boolean;
};

/**
 * Shared by the dashboard and the claim endpoint so the displayed progress and the
 * server-side award decision can never drift apart.
 */
export async function getChallengeStates(userId: number): Promise<ChallengeState[]> {
  const [all, claims] = await Promise.all([
    getChallenges(),
    db.select().from(challengeProgress).where(eq(challengeProgress.userId, userId)),
  ]);

  const windows = new Map<number, (typeof gameSessions.$inferSelect)[]>();
  for (const days of new Set(Object.values(PERIOD_DAYS))) {
    const since = new Date();
    if (days === 1) since.setHours(0, 0, 0, 0);
    else since.setTime(Date.now() - days * 864e5);
    const rows = await db
      .select()
      .from(gameSessions)
      .where(and(eq(gameSessions.userId, userId), gte(gameSessions.createdAt, since)));
    windows.set(days, rows);
  }

  return all.map((c) => {
    const rows = windows.get(PERIOD_DAYS[c.period] ?? 1) ?? [];
    let progress = 0;
    if (c.metric === "games") progress = rows.length;
    else if (c.metric === "wpm") progress = Math.round(rows.reduce((m, s) => Math.max(m, s.wpm), 0));
    else if (c.metric === "accuracy") progress = Math.round(rows.reduce((m, s) => Math.max(m, s.accuracy), 0));
    else if (c.metric === "test60") progress = rows.filter((s) => s.gameSlug === "typing-test").length;
    else if (c.metric === "xp") progress = rows.reduce((sum, s) => sum + s.xpEarned, 0);
    progress = Math.min(c.goal, progress);
    const claimed = claims.some((x) => x.challengeId === c.id && x.day === challengePeriodKey(c.period) && x.claimed);
    return {
      id: c.id,
      title: c.title,
      description: c.description,
      period: c.period,
      metric: c.metric,
      goal: c.goal,
      xpReward: c.xpReward,
      coinReward: c.coinReward,
      progress,
      complete: progress >= c.goal,
      claimed,
    };
  });
}

export async function getTodaySessions(userId: number) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return db
    .select()
    .from(gameSessions)
    .where(and(eq(gameSessions.userId, userId), gte(gameSessions.createdAt, start)));
}
