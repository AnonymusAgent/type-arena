import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { games } from "@/db/schema";
import { ensureSeeded } from "@/lib/data";
import { getAdminUser } from "@/lib/admin";

export const dynamic = "force-dynamic";

/** Server-authoritative: middleware alone is never the only line of defence. */
async function requireAdmin() {
  return await getAdminUser();
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Administrator authentication required." }, { status: 401 });
  await ensureSeeded();
  return NextResponse.json({ games: await db.select().from(games) });
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ENGINES = ["race", "stream", "falling", "text", "memory"];

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Admin only." }, { status: 403 });
  const b = await req.json().catch(() => ({}));
  const slug = String(b.slug ?? "").trim().toLowerCase();
  const name = String(b.name ?? "").trim();
  if (!slug || !name) return NextResponse.json({ error: "Slug and name are required." }, { status: 400 });
  if (!SLUG_RE.test(slug)) {
    return NextResponse.json({ error: "Slug must be lowercase words separated by hyphens, e.g. pyramid-sprint." }, { status: 400 });
  }
  const engine = String(b.engine ?? "stream");
  if (!ENGINES.includes(engine)) return NextResponse.json({ error: `Engine must be one of: ${ENGINES.join(", ")}.` }, { status: 400 });

  // Friendly conflict instead of letting the unique index throw a 500.
  const clash = await db.select({ id: games.id }).from(games).where(eq(games.slug, slug)).limit(1);
  if (clash.length) return NextResponse.json({ error: `A game with the slug “${slug}” already exists.` }, { status: 409 });

  try {
    const [row] = await db
      .insert(games)
      .values({
        slug,
        name,
        description: String(b.description ?? ""),
        category: String(b.category ?? "Arcade"),
        difficulty: String(b.difficulty ?? "Medium"),
        engine,
        icon: String(b.icon ?? "🎮"),
        accent: String(b.accent ?? "#7c5cff"),
        featured: Boolean(b.featured),
        config: b.config ?? {},
      })
      .returning();
    return NextResponse.json({ game: row });
  } catch {
    return NextResponse.json({ error: "Could not create that game. Check the slug is unique." }, { status: 409 });
  }
}

export async function PATCH(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Admin only." }, { status: 403 });
  const b = await req.json().catch(() => ({}));
  if (!b.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const patch: Record<string, unknown> = {};
  for (const k of ["name", "description", "category", "difficulty", "featured", "published", "icon"]) {
    if (k in b) patch[k] = b[k];
  }
  const [row] = await db.update(games).set(patch).where(eq(games.id, Number(b.id))).returning();
  return NextResponse.json({ game: row });
}

export async function DELETE(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Admin only." }, { status: 403 });
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.delete(games).where(eq(games.id, id));
  return NextResponse.json({ ok: true });
}
