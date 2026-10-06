import { NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const metric = url.searchParams.get("metric") ?? "wpm";
  const scope = url.searchParams.get("scope") ?? "global";
  let rows = await getLeaderboard(metric, scope, 100);

  if (scope === "country") {
    // Fall back to the signed-in player's country so the tab is never a copy of Global.
    const country = url.searchParams.get("country") ?? (await getCurrentUser())?.country ?? null;
    rows = country ? rows.filter((r) => r.country === country) : [];
    return NextResponse.json({ rows, country });
  }

  return NextResponse.json({ rows });
}
