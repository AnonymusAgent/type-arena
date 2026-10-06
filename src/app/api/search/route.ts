import { NextResponse } from "next/server";
import { ilike } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { CATEGORIES } from "@/lib/games";
import { ensureSeeded, getCatalogue } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim();
  if (!q) return NextResponse.json({ games: [], players: [], categories: [] });
  await ensureSeeded();
  const lower = q.toLowerCase();
  const gameHits = (await getCatalogue()).filter(
    (g) => g.name.toLowerCase().includes(lower) || g.description.toLowerCase().includes(lower) || g.category.toLowerCase().includes(lower),
  )
    .slice(0, 6)
    .map((g) => ({ slug: g.slug, name: g.name, icon: g.icon, category: g.category }));
  const players = await db
    .select({ id: users.id, username: users.username, avatar: users.avatar, bestWpm: users.bestWpm, country: users.country })
    .from(users)
    .where(ilike(users.username, `%${q}%`))
    .limit(6);
  const categories = CATEGORIES.filter((c) => c.toLowerCase().includes(lower)).slice(0, 4);
  return NextResponse.json({ games: gameHits, players, categories });
}
