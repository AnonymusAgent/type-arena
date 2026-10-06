import { NextResponse } from "next/server";
import { getCurrentUser, publicUser } from "@/lib/auth";
import { levelFromXp } from "@/lib/progression";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({ user: publicUser(user), level: levelFromXp(user.xp) });
}
