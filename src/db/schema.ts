import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  real,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    username: text("username").notNull(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    country: text("country").default("US").notNull(),
    avatar: text("avatar").default("🐱").notNull(),
    title: text("title").default("Rookie Typist").notNull(),
    xp: integer("xp").default(0).notNull(),
    coins: integer("coins").default(250).notNull(),
    bestWpm: real("best_wpm").default(0).notNull(),
    avgWpm: real("avg_wpm").default(0).notNull(),
    accuracy: real("accuracy").default(0).notNull(),
    gamesPlayed: integer("games_played").default(0).notNull(),
    gamesWon: integer("games_won").default(0).notNull(),
    streak: integer("streak").default(0).notNull(),
    lastPlayedDate: text("last_played_date"),
    isAdmin: boolean("is_admin").default(false).notNull(),
    isDemo: boolean("is_demo").default(false).notNull(),
    equippedVehicle: text("equipped_vehicle").default("sports-car").notNull(),
    theme: text("theme").default("dark").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    usernameIdx: uniqueIndex("users_username_idx").on(t.username),
    emailIdx: uniqueIndex("users_email_idx").on(t.email),
  }),
);

export const games = pgTable(
  "games",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    difficulty: text("difficulty").notNull(),
    engine: text("engine").notNull(),
    config: jsonb("config").default({}).notNull(),
    accent: text("accent").default("#6366f1").notNull(),
    icon: text("icon").default("⌨️").notNull(),
    players: integer("players").default(0).notNull(),
    rating: real("rating").default(4.5).notNull(),
    featured: boolean("featured").default(false).notNull(),
    published: boolean("published").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({ slugIdx: uniqueIndex("games_slug_idx").on(t.slug) }),
);

export const gameSessions = pgTable("game_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  gameSlug: text("game_slug").notNull(),
  wpm: real("wpm").default(0).notNull(),
  accuracy: real("accuracy").default(0).notNull(),
  score: integer("score").default(0).notNull(),
  errors: integer("errors").default(0).notNull(),
  chars: integer("chars").default(0).notNull(),
  durationSec: integer("duration_sec").default(0).notNull(),
  won: boolean("won").default(false).notNull(),
  xpEarned: integer("xp_earned").default(0).notNull(),
  coinsEarned: integer("coins_earned").default(0).notNull(),
  meta: jsonb("meta").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const achievements = pgTable(
  "achievements",
  {
    id: serial("id").primaryKey(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    icon: text("icon").default("🏆").notNull(),
    tier: text("tier").default("bronze").notNull(),
    goal: integer("goal").default(1).notNull(),
    metric: text("metric").default("games").notNull(),
    xpReward: integer("xp_reward").default(100).notNull(),
    coinReward: integer("coin_reward").default(50).notNull(),
  },
  (t) => ({ codeIdx: uniqueIndex("achievements_code_idx").on(t.code) }),
);

export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  code: text("code").notNull(),
  progress: integer("progress").default(0).notNull(),
  unlockedAt: timestamp("unlocked_at"),
});

export const friends = pgTable("friends", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  friendId: integer("friend_id").notNull(),
  status: text("status").default("accepted").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  period: text("period").default("daily").notNull(),
  metric: text("metric").default("games").notNull(),
  goal: integer("goal").default(3).notNull(),
  xpReward: integer("xp_reward").default(150).notNull(),
  coinReward: integer("coin_reward").default(80).notNull(),
  active: boolean("active").default(true).notNull(),
});

export const challengeProgress = pgTable("challenge_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  challengeId: integer("challenge_id").notNull(),
  progress: integer("progress").default(0).notNull(),
  claimed: boolean("claimed").default(false).notNull(),
  day: text("day").notNull(),
});

export const tournaments = pgTable("tournaments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  period: text("period").default("daily").notNull(),
  gameSlug: text("game_slug").default("type-race").notNull(),
  prize: text("prize").notNull(),
  entrants: integer("entrants").default(0).notNull(),
  startsAt: timestamp("starts_at").defaultNow().notNull(),
  endsAt: timestamp("ends_at").defaultNow().notNull(),
  status: text("status").default("open").notNull(),
});

export const vehicles = pgTable(
  "vehicles",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    icon: text("icon").notNull(),
    rarity: text("rarity").default("common").notNull(),
    price: integer("price").default(0).notNull(),
    unlockLevel: integer("unlock_level").default(1).notNull(),
    kind: text("kind").default("vehicle").notNull(),
  },
  (t) => ({ slugIdx: uniqueIndex("vehicles_slug_idx").on(t.slug) }),
);

export const userInventory = pgTable("user_inventory", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  itemSlug: text("item_slug").notNull(),
  equipped: boolean("equipped").default(false).notNull(),
  acquiredAt: timestamp("acquired_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  kind: text("kind").default("system").notNull(),
  title: text("title").notNull(),
  body: text("body").default("").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessionsTable = pgTable("auth_sessions", {
  id: serial("id").primaryKey(),
  token: text("token").notNull(),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
