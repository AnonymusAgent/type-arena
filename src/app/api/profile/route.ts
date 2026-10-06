import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser, publicUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const patch: Record<string, string> = {};
  if (typeof body.avatar === "string") patch.avatar = body.avatar.slice(0, 4);
  if (typeof body.country === "string") patch.country = body.country.slice(0, 2).toUpperCase();
  if (typeof body.theme === "string") patch.theme = body.theme;
  if (typeof body.title === "string") patch.title = body.title.slice(0, 40);
  const [row] = await db.update(users).set(patch).where(eq(users.id, user.id)).returning();
  return NextResponse.json({ user: publicUser(row) });
}
