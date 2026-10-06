import type { Metadata } from "next";
import PageBanner from "@/components/page-banner";
import { getCatalogue } from "@/lib/data";
import GamesBrowser from "./games-browser";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Game Library — Every Typing Game",
  description: "Browse the full Type Arena library: typing races, arcade word games, survival modes, programming drills, number and symbol practice, kids games and multiplayer battles.",
  openGraph: { title: "Type Arena Game Library", description: "Original typing games across twelve categories." },
};

export default async function GamesPage({ searchParams }: { searchParams: Promise<{ sort?: string }> }) {
  const [sp, catalogue] = await Promise.all([searchParams, getCatalogue()]);
  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-6 sm:py-10">
      <PageBanner
        label="ALL MODES / THE COLLECTION"
        title="Find your next obsession."
        description={`${catalogue.length} original typing games. Twelve categories. One perfect reason to play another round.`}
        glyph="🎮"
      />
      <div className="mt-7">
        <GamesBrowser games={catalogue} initialSort={sp.sort ?? "popular"} />
      </div>
    </div>
  );
}
