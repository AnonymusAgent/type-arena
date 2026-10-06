import Link from "next/link";
import { ArrowUpRight, Users } from "lucide-react";
import type { GameDef } from "@/lib/games";
import GameArtwork from "./game-artwork";

export default function GameCard({ game, compact }: { game: GameDef; compact?: boolean }) {
  return (
    <article className="game-card card-hover group flex min-w-0 flex-col overflow-hidden">
      <Link href={`/games/${game.slug}`} className="game-card__visual" aria-label={`Play ${game.name}`}>
        <GameArtwork game={game} />
        <span className="game-card__visual-cta" aria-hidden="true">EXPLORE GAME <ArrowUpRight size={15} /></span>
      </Link>
      <div className="game-card__body flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex min-w-0 items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-[.14em]">
          <span className="truncate text-[var(--brand)]">{game.category} / {game.difficulty}</span>
          <span className="shrink-0 text-amber-300">★ {game.rating.toFixed(1)}</span>
        </div>
        <h3 className="mt-2 truncate text-lg font-bold leading-tight tracking-tight sm:text-xl">{game.name}</h3>
        {!compact && <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[var(--muted)] sm:text-sm">{game.description}</p>}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--muted)]"><Users size={12} aria-hidden="true" /> {game.players.toLocaleString()}</span>
          <Link href={`/games/${game.slug}`} className="game-card__play" aria-label={`Play ${game.name} now`}>
            PLAY <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
