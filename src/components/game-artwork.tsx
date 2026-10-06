import type { CSSProperties } from "react";
import type { GameDef } from "@/lib/games";

const ENGINE_LABELS: Record<GameDef["engine"], string> = {
  race: "RACE / 01",
  stream: "ARCADE / 02",
  falling: "SURVIVE / 03",
  text: "PRECISION / 04",
  memory: "RECALL / 05",
  multiplayer: "ONLINE / 06",
};

const ENGINE_STATUS: Record<GameDef["engine"], string> = {
  race: "FULL THROTTLE",
  stream: "COMBO × 04",
  falling: "WAVE 04",
  text: "98.4% ACC",
  memory: "SEQUENCE 07",
  multiplayer: "08 PLAYERS LIVE",
};

export default function GameArtwork({ game, large = false }: { game: GameDef; large?: boolean }) {
  return (
    <div
      className={`game-art game-art--${game.engine} ${large ? "game-art--large" : ""}`}
      style={{ "--art-accent": game.accent } as CSSProperties}
      role="img"
      aria-label={`3D artwork for ${game.name}`}
    >
      <div className="game-art__glow" aria-hidden="true" />
      <div className="game-art__grid" aria-hidden="true" />
      <div className="game-art__ring game-art__ring--one" aria-hidden="true" />
      <div className="game-art__ring game-art__ring--two" aria-hidden="true" />
      <div className="game-art__light game-art__light--one" aria-hidden="true" />
      <div className="game-art__light game-art__light--two" aria-hidden="true" />
      <div className="game-art__pedestal" aria-hidden="true" />
      <div className="game-art__model" aria-hidden="true">
        <div className="game-art__key">
          <span className="game-art__key-glyph">{game.icon}</span>
          <span className="game-art__key-code">{game.slug.slice(0, 3).toUpperCase()}</span>
        </div>
      </div>
      <span className="game-art__label" aria-hidden="true">{ENGINE_LABELS[game.engine]}</span>
      <span className="game-art__status" aria-hidden="true">{ENGINE_STATUS[game.engine]}</span>
    </div>
  );
}
