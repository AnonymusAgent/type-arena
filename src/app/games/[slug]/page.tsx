import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import GameRunner from "@/components/game/game-runner";
import GameCard from "@/components/game-card";
import PageBanner from "@/components/page-banner";
import { getCatalogue, getCatalogueGame } from "@/lib/data";

// Rendered on demand so that games added, renamed or unpublished in the control panel
// are reflected immediately instead of being frozen into the build.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const game = await getCatalogueGame(slug);
  if (!game) return { title: "Game not found" };
  return {
    title: `${game.name} — Free Online Typing Game`,
    description: game.longDescription,
    alternates: { canonical: `/games/${game.slug}` },
    openGraph: { title: `${game.name} | Type Arena`, description: game.description, type: "article" },
  };
}

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const catalogue = await getCatalogue();
  const game = catalogue.find((g) => g.slug === slug);
  if (!game) notFound();
  if (game.engine === "multiplayer") redirect("/multiplayer");

  const related = catalogue.filter((g) => g.slug !== game.slug && g.category === game.category).slice(0, 4);
  const fallback = catalogue.filter((g) => g.slug !== game.slug).slice(0, 4);

  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-6 sm:px-6 sm:py-10">
      <nav aria-label="Breadcrumb" className="mb-4 text-xs text-[var(--muted)]">
        <Link href="/">Home</Link> / <Link href="/games">Games</Link> / <span className="text-[var(--text)]">{game.name}</span>
      </nav>

      <PageBanner label={`${game.category} / ${game.difficulty}`} title={game.name} description={game.description} glyph={game.icon} accent={game.accent} compact />
      <div className="game-meta mb-5 mt-3 flex flex-wrap gap-2 font-mono text-[10px] font-bold text-[var(--muted)]">
        <span className="rounded-md border border-[var(--border)] px-2.5 py-1.5">★ {game.rating} RATING</span>
        <span className="rounded-md border border-[var(--border)] px-2.5 py-1.5">{game.players.toLocaleString()} PLAYERS</span>
        <span className="rounded-md border border-[var(--border)] px-2.5 py-1.5">{game.difficulty.toUpperCase()} MODE</span>
      </div>

      <GameRunner game={game} />

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <section className="panel rounded-2xl p-5">
          <h2 className="mb-2 font-black">How to play</h2>
          <ul className="space-y-1.5 text-sm text-[var(--muted)]">
            {game.instructions.map((i) => (
              <li key={i}>• {i}</li>
            ))}
          </ul>
        </section>
        <section className="panel rounded-2xl p-5">
          <h2 className="mb-2 font-black">Controls</h2>
          <ul className="space-y-1.5 text-sm text-[var(--muted)]">
            {game.controls.map((c) => (
              <li key={c}>⌨️ {c}</li>
            ))}
          </ul>
        </section>
        <section className="panel rounded-2xl p-5">
          <h2 className="mb-2 font-black">Scoring</h2>
          <p className="text-sm text-[var(--muted)]">{game.scoring}</p>
        </section>
      </div>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-black">More {game.category} games</h2>
        <div className="grid grid-cols-1 gap-3 min-[430px]:grid-cols-2 lg:grid-cols-4">
          {(related.length ? related : fallback).map((g) => (
            <GameCard key={g.slug} game={g} compact />
          ))}
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "VideoGame",
            name: game.name,
            description: game.longDescription,
            genre: game.category,
            applicationCategory: "Game",
            operatingSystem: "Web browser",
            aggregateRating: { "@type": "AggregateRating", ratingValue: game.rating, ratingCount: game.players },
            offers: { "@type": "Offer", price: 0, priceCurrency: "USD" },
          }),
        }}
      />
    </div>
  );
}
