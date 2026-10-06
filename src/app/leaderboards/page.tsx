import type { Metadata } from "next";
import { getLeaderboard } from "@/lib/data";
import PageBanner from "@/components/page-banner";
import LeaderboardClient from "./leaderboard-client";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Leaderboards — Global Typing Rankings",
  description: "Global, country, friends, weekly, monthly and all-time typing leaderboards ranked by WPM, accuracy, XP, wins, games played and points.",
  alternates: { canonical: "/leaderboards" },
};

export default async function LeaderboardsPage() {
  const rows = await getLeaderboard("wpm", "global", 100);
  return (
    <div className="mx-auto w-full max-w-4xl px-3 py-6 sm:px-6 sm:py-10">
      <PageBanner label="THE RANKINGS / GLOBAL" title="Earn your place." description="Six ways to rank. One way to get there: keep typing." glyph="🏆" accent="#facc15" compact />
      <div className="mt-6"><LeaderboardClient initial={rows} /></div>
    </div>
  );
}
