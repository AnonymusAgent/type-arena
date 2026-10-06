import { sql } from "drizzle-orm";
import { db } from "@/db";
import {
  achievements,
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
import { GAMES } from "./games";
import { ACHIEVEMENTS } from "./achievements";
import { hashPassword } from "./auth";

export const VEHICLES = [
  { slug: "sports-car", name: "Sports Car", icon: "🏎️", rarity: "common", price: 0, unlockLevel: 1, kind: "vehicle" },
  { slug: "formula-car", name: "Formula Car", icon: "🏁", rarity: "rare", price: 900, unlockLevel: 5, kind: "vehicle" },
  { slug: "rally-car", name: "Rally Car", icon: "🚙", rarity: "common", price: 400, unlockLevel: 3, kind: "vehicle" },
  { slug: "cyber-car", name: "Cyber Car", icon: "🚘", rarity: "epic", price: 2200, unlockLevel: 20, kind: "vehicle" },
  { slug: "hover-car", name: "Hover Car", icon: "🛸", rarity: "epic", price: 2600, unlockLevel: 25, kind: "vehicle" },
  { slug: "motorcycle", name: "Motorcycle", icon: "🏍️", rarity: "rare", price: 700, unlockLevel: 8, kind: "vehicle" },
  { slug: "speed-boat", name: "Speed Boat", icon: "🚤", rarity: "rare", price: 1100, unlockLevel: 12, kind: "vehicle" },
  { slug: "spaceship", name: "Spaceship", icon: "🚀", rarity: "legendary", price: 5000, unlockLevel: 50, kind: "vehicle" },
  { slug: "theme-neon", name: "Neon Nights Theme", icon: "🌃", rarity: "rare", price: 600, unlockLevel: 4, kind: "theme" },
  { slug: "theme-sunset", name: "Sunset Circuit Theme", icon: "🌇", rarity: "rare", price: 600, unlockLevel: 6, kind: "theme" },
  { slug: "keys-carbon", name: "Carbon Keycaps", icon: "⌨️", rarity: "epic", price: 1400, unlockLevel: 15, kind: "keyboard" },
  { slug: "frame-gold", name: "Golden Frame", icon: "🖼️", rarity: "legendary", price: 3000, unlockLevel: 40, kind: "frame" },
  { slug: "trail-flame", name: "Flame Trail", icon: "🔥", rarity: "epic", price: 1800, unlockLevel: 18, kind: "effect" },
  { slug: "title-legend", name: "Title: Keyboard Legend", icon: "🏅", rarity: "legendary", price: 4000, unlockLevel: 60, kind: "title" },
];

const DEMO_PLAYERS = [
  { username: "NovaKeys", country: "US", avatar: "🦊", xp: 48200, bestWpm: 148, accuracy: 98.4, gamesPlayed: 912, gamesWon: 401, streak: 34 },
  { username: "ShiftStorm", country: "DE", avatar: "🐺", xp: 41100, bestWpm: 141, accuracy: 97.1, gamesPlayed: 804, gamesWon: 352, streak: 12 },
  { username: "MochiTypes", country: "JP", avatar: "🐼", xp: 38750, bestWpm: 137, accuracy: 98.9, gamesPlayed: 760, gamesWon: 333, streak: 21 },
  { username: "QuickQuokka", country: "AU", avatar: "🐨", xp: 33400, bestWpm: 129, accuracy: 96.2, gamesPlayed: 688, gamesWon: 280, streak: 7 },
  { username: "Teclado", country: "ES", avatar: "🐂", xp: 30100, bestWpm: 126, accuracy: 95.8, gamesPlayed: 640, gamesWon: 251, streak: 4 },
  { username: "ByteBrawler", country: "BR", avatar: "🦜", xp: 27650, bestWpm: 122, accuracy: 94.9, gamesPlayed: 601, gamesWon: 230, streak: 9 },
  { username: "KeyKnight", country: "GB", avatar: "🦁", xp: 24300, bestWpm: 118, accuracy: 96.7, gamesPlayed: 555, gamesWon: 212, streak: 15 },
  { username: "PixelPanda", country: "CN", avatar: "🐧", xp: 21980, bestWpm: 115, accuracy: 93.8, gamesPlayed: 512, gamesWon: 190, streak: 3 },
  { username: "AuroraWrites", country: "CA", avatar: "🦌", xp: 19400, bestWpm: 111, accuracy: 97.6, gamesPlayed: 470, gamesWon: 171, streak: 18 },
  { username: "DeltaDash", country: "IN", avatar: "🐅", xp: 17250, bestWpm: 108, accuracy: 92.4, gamesPlayed: 430, gamesWon: 150, streak: 2 },
  { username: "SilentSprint", country: "FR", avatar: "🐇", xp: 15100, bestWpm: 104, accuracy: 95.1, gamesPlayed: 388, gamesWon: 131, streak: 6 },
  { username: "GlyphGoblin", country: "SE", avatar: "👾", xp: 12900, bestWpm: 99, accuracy: 91.3, gamesPlayed: 340, gamesWon: 110, streak: 1 },
  { username: "TurboTomo", country: "KR", avatar: "🐲", xp: 10800, bestWpm: 95, accuracy: 94.4, gamesPlayed: 300, gamesWon: 95, streak: 11 },
  { username: "CtrlAltElite", country: "NL", avatar: "🦉", xp: 8600, bestWpm: 90, accuracy: 93.1, gamesPlayed: 265, gamesWon: 80, streak: 5 },
  { username: "LunaLoops", country: "MX", avatar: "🐸", xp: 6400, bestWpm: 84, accuracy: 90.8, gamesPlayed: 210, gamesWon: 61, streak: 8 },
];

export async function seedDatabase() {
  const existing = await db.select({ c: sql<number>`count(*)::int` }).from(games);
  if ((existing[0]?.c ?? 0) > 0) return { seeded: false };

  await db.insert(games).values(
    GAMES.map((g) => ({
      slug: g.slug,
      name: g.name,
      description: g.description,
      category: g.category,
      difficulty: g.difficulty,
      engine: g.engine,
      config: g.config,
      accent: g.accent,
      icon: g.icon,
      players: g.players,
      rating: g.rating,
      featured: g.featured,
    })),
  );

  await db.insert(achievements).values(ACHIEVEMENTS);
  await db.insert(vehicles).values(VEHICLES);

  await db.insert(challenges).values([
    { title: "Reach 50 WPM", description: "Hit at least 50 WPM in any mode today.", period: "daily", metric: "wpm", goal: 50, xpReward: 150, coinReward: 80 },
    { title: "Complete 3 Races", description: "Finish three Type Race rounds.", period: "daily", metric: "games", goal: 3, xpReward: 200, coinReward: 100 },
    { title: "95% Accuracy", description: "Finish a run with 95% accuracy or better.", period: "daily", metric: "accuracy", goal: 95, xpReward: 180, coinReward: 90 },
    { title: "60-Second Test", description: "Complete a 60 second typing test.", period: "daily", metric: "test60", goal: 1, xpReward: 120, coinReward: 60 },
    { title: "Weekly Grinder", description: "Play 25 games this week.", period: "weekly", metric: "games", goal: 25, xpReward: 900, coinReward: 450 },
    { title: "Weekly Precision", description: "Average 96% accuracy over 10 games.", period: "weekly", metric: "accuracy", goal: 96, xpReward: 1000, coinReward: 500 },
    { title: "Monthly Legend", description: "Earn 10,000 XP this month.", period: "monthly", metric: "xp", goal: 10000, xpReward: 3000, coinReward: 1500 },
  ]);

  const now = Date.now();
  await db.insert(tournaments).values([
    { name: "Daily Dash", period: "daily", gameSlug: "speed-sprint", prize: "500 coins + Flame Trail", entrants: 1284, startsAt: new Date(now), endsAt: new Date(now + 864e5), status: "open" },
    { name: "Weekend Grand Prix", period: "weekend", gameSlug: "type-race", prize: "Cyber Car skin", entrants: 3920, startsAt: new Date(now), endsAt: new Date(now + 3 * 864e5), status: "open" },
    { name: "Weekly Championship", period: "weekly", gameSlug: "typing-challenge", prize: "Golden Frame + 2,000 coins", entrants: 7410, startsAt: new Date(now), endsAt: new Date(now + 7 * 864e5), status: "open" },
    { name: "Monthly Championship", period: "monthly", gameSlug: "multiplayer-arena", prize: "Spaceship + Legend title", entrants: 18220, startsAt: new Date(now), endsAt: new Date(now + 30 * 864e5), status: "open" },
  ]);

  const demoRows = DEMO_PLAYERS.map((p) => ({
    username: p.username,
    email: `${p.username.toLowerCase()}@demo.typearena.gg`,
    passwordHash: hashPassword("demo1234"),
    country: p.country,
    avatar: p.avatar,
    xp: p.xp,
    coins: 500 + Math.round(p.xp / 20),
    bestWpm: p.bestWpm,
    avgWpm: Math.round(p.bestWpm * 0.82),
    accuracy: p.accuracy,
    gamesPlayed: p.gamesPlayed,
    gamesWon: p.gamesWon,
    streak: p.streak,
    isDemo: true,
    title: "Arena Regular",
  }));

  const inserted = await db.insert(users).values(demoRows).returning({ id: users.id });

  // demo admin account
  const admin = await db
    .insert(users)
    .values({
      username: "arena_admin",
      email: "admin@typearena.gg",
      passwordHash: hashPassword("admin1234"),
      country: "US",
      avatar: "🛠️",
      isAdmin: true,
      isDemo: true,
      xp: 12000,
      coins: 9999,
      bestWpm: 112,
      avgWpm: 94,
      accuracy: 96.5,
      gamesPlayed: 300,
      gamesWon: 120,
      streak: 9,
      title: "Arena Operator",
    })
    .returning({ id: users.id });

  const sessionsRows: (typeof gameSessions.$inferInsert)[] = [];
  inserted.forEach((u, idx) => {
    for (let i = 0; i < 8; i++) {
      const wpm = Math.max(30, DEMO_PLAYERS[idx].bestWpm - Math.random() * 35);
      sessionsRows.push({
        userId: u.id,
        gameSlug: GAMES[(idx + i) % GAMES.length].slug,
        wpm: Math.round(wpm),
        accuracy: Math.round(88 + Math.random() * 11),
        score: Math.round(wpm * 40 + Math.random() * 800),
        errors: Math.round(Math.random() * 12),
        chars: Math.round(300 + Math.random() * 900),
        durationSec: 60,
        won: Math.random() > 0.5,
        xpEarned: Math.round(80 + Math.random() * 260),
        coinsEarned: Math.round(20 + Math.random() * 90),
        createdAt: new Date(now - i * 864e5 - Math.random() * 36e5),
      });
    }
  });
  await db.insert(gameSessions).values(sessionsRows);

  await db.insert(userAchievements).values(
    inserted.slice(0, 8).flatMap((u, i) =>
      ACHIEVEMENTS.slice(0, 3 + (i % 4)).map((a) => ({
        userId: u.id,
        code: a.code,
        progress: a.goal,
        unlockedAt: new Date(now - i * 36e5),
      })),
    ),
  );

  const adminId = admin[0]?.id;
  if (adminId) {
    await db.insert(friends).values(
      inserted.slice(0, 6).map((u) => ({ userId: adminId, friendId: u.id, status: "accepted" })),
    );
    await db.insert(notifications).values([
      { userId: adminId, kind: "friend", title: "NovaKeys sent a friend request", body: "Accept to compare stats and race together." },
      { userId: adminId, kind: "achievement", title: "Achievement unlocked: Speed Demon", body: "You reached 60 WPM. +250 XP" },
      { userId: adminId, kind: "tournament", title: "Weekend Grand Prix results", body: "You placed 14th out of 3,920 players." },
    ]);
  }

  return { seeded: true };
}
