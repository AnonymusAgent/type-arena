import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { userInventory, users, vehicles } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { levelFromXp } from "@/lib/progression";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  const items = await db.select().from(vehicles);
  const inv = user ? await db.select().from(userInventory).where(eq(userInventory.userId, user.id)) : [];
  return NextResponse.json({ items, owned: inv.map((i) => i.itemSlug), coins: user?.coins ?? 0 });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to purchase items." }, { status: 401 });
  const { slug, action } = await req.json().catch(() => ({ slug: "", action: "buy" }));
  const [item] = await db.select().from(vehicles).where(eq(vehicles.slug, String(slug))).limit(1);
  if (!item) return NextResponse.json({ error: "Item not found." }, { status: 404 });

  const owned = await db
    .select()
    .from(userInventory)
    .where(and(eq(userInventory.userId, user.id), eq(userInventory.itemSlug, item.slug)));

  if (action === "equip") {
    if (!owned.length && item.price > 0) return NextResponse.json({ error: "You do not own this item." }, { status: 400 });
    if (item.kind === "vehicle") await db.update(users).set({ equippedVehicle: item.slug }).where(eq(users.id, user.id));
    return NextResponse.json({ ok: true, equipped: item.slug });
  }

  if (owned.length) return NextResponse.json({ error: "Already owned." }, { status: 400 });
  const level = levelFromXp(user.xp).level;
  if (level < item.unlockLevel) return NextResponse.json({ error: `Requires level ${item.unlockLevel}.` }, { status: 400 });
  if (user.coins < item.price) return NextResponse.json({ error: "Not enough coins." }, { status: 400 });

  await db.update(users).set({ coins: user.coins - item.price }).where(eq(users.id, user.id));
  await db.insert(userInventory).values({ userId: user.id, itemSlug: item.slug });
  return NextResponse.json({ ok: true, coins: user.coins - item.price });
}
