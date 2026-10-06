export const RANKS: { level: number; title: string; color: string }[] = [
  { level: 1, title: "Beginner", color: "#94a3b8" },
  { level: 5, title: "Novice", color: "#38bdf8" },
  { level: 10, title: "Typist", color: "#22d3ee" },
  { level: 20, title: "Speedster", color: "#34d399" },
  { level: 30, title: "Expert", color: "#facc15" },
  { level: 50, title: "Master", color: "#fb923c" },
  { level: 75, title: "Elite", color: "#f43f5e" },
  { level: 100, title: "Keyboard Legend", color: "#a855f7" },
];

/** XP needed to go from level n to n+1 */
export function xpForLevel(level: number): number {
  return 200 + (level - 1) * 120;
}

export function levelFromXp(xp: number): { level: number; current: number; needed: number; title: string; color: string; progress: number } {
  let level = 1;
  let remaining = Math.max(0, xp);
  while (level < 100 && remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level += 1;
  }
  const needed = level >= 100 ? 0 : xpForLevel(level);
  const rank = [...RANKS].reverse().find((r) => level >= r.level) ?? RANKS[0];
  return {
    level,
    current: remaining,
    needed,
    title: rank.title,
    color: rank.color,
    progress: needed ? Math.min(100, (remaining / needed) * 100) : 100,
  };
}

export function computeRewards(input: { wpm: number; accuracy: number; score: number; won: boolean; durationSec: number }) {
  const base = Math.round(input.score / 20) + Math.round(input.wpm) + Math.round(input.durationSec / 3);
  const accBonus = input.accuracy >= 98 ? 60 : input.accuracy >= 95 ? 35 : input.accuracy >= 90 ? 15 : 0;
  const winBonus = input.won ? 75 : 0;
  const xp = Math.max(10, base + accBonus + winBonus);
  const coins = Math.max(5, Math.round(xp / 4));
  return { xp, coins };
}

export function calcWpm(chars: number, seconds: number) {
  if (seconds <= 0) return 0;
  return Math.max(0, (chars / 5) / (seconds / 60));
}

export function consistency(samples: number[]): number {
  if (samples.length < 2) return 100;
  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  if (mean === 0) return 0;
  const variance = samples.reduce((a, b) => a + (b - mean) ** 2, 0) / samples.length;
  const cv = Math.sqrt(variance) / mean;
  return Math.max(0, Math.min(100, (1 - cv) * 100));
}
