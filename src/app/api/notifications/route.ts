import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ items: [] });
  const items = await db.select().from(notifications).where(eq(notifications.userId, user.id)).limit(25);
  return NextResponse.json({ items: items.reverse() });
}

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  await db.update(notifications).set({ read: true }).where(eq(notifications.userId, user.id));
  return NextResponse.json({ ok: true });
}
