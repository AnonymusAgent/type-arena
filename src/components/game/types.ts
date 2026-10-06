export type GameResult = {
  wpm: number;
  accuracy: number;
  score: number;
  errors: number;
  chars: number;
  durationSec: number;
  won: boolean;
  extra?: Record<string, string | number>;
};

export type EngineProps = {
  config: Record<string, unknown>;
  onFinish: (r: GameResult) => void;
};
