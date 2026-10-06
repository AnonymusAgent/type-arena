export type AchievementDef = {
  code: string;
  name: string;
  description: string;
  icon: string;
  tier: "bronze" | "silver" | "gold" | "legend";
  goal: number;
  metric: "games" | "bestWpm" | "accuracy" | "wins" | "streak" | "perfect" | "level";
  xpReward: number;
  coinReward: number;
};

export const ACHIEVEMENTS: AchievementDef[] = [
  { code: "first-race", name: "First Race", description: "Complete your first race.", icon: "🏁", tier: "bronze", goal: 1, metric: "games", xpReward: 100, coinReward: 50 },
  { code: "speed-demon", name: "Speed Demon", description: "Reach 60 WPM in any mode.", icon: "🔥", tier: "silver", goal: 60, metric: "bestWpm", xpReward: 250, coinReward: 120 },
  { code: "lightning-fingers", name: "Lightning Fingers", description: "Reach 100 WPM.", icon: "⚡", tier: "gold", goal: 100, metric: "bestWpm", xpReward: 600, coinReward: 350 },
  { code: "accuracy-king", name: "Accuracy King", description: "Achieve 99% accuracy in a run.", icon: "🎯", tier: "gold", goal: 99, metric: "accuracy", xpReward: 500, coinReward: 300 },
  { code: "marathon", name: "Marathon", description: "Complete 100 games.", icon: "🏃", tier: "gold", goal: 100, metric: "games", xpReward: 800, coinReward: 400 },
  { code: "dedicated-typist", name: "Dedicated Typist", description: "Play 7 consecutive days.", icon: "📅", tier: "silver", goal: 7, metric: "streak", xpReward: 350, coinReward: 200 },
  { code: "perfect-run", name: "Perfect Run", description: "Finish a game with 100% accuracy.", icon: "💎", tier: "gold", goal: 1, metric: "perfect", xpReward: 450, coinReward: 250 },
  { code: "unstoppable", name: "Unstoppable", description: "Win 10 multiplayer races.", icon: "👑", tier: "gold", goal: 10, metric: "wins", xpReward: 700, coinReward: 400 },
  { code: "keyboard-legend", name: "Keyboard Legend", description: "Reach Level 100.", icon: "🌟", tier: "legend", goal: 100, metric: "level", xpReward: 5000, coinReward: 2500 },
  { code: "warm-up", name: "Warm Up", description: "Play 10 games.", icon: "🤘", tier: "bronze", goal: 10, metric: "games", xpReward: 150, coinReward: 80 },
  { code: "veteran", name: "Arena Veteran", description: "Win 50 games.", icon: "🛡️", tier: "legend", goal: 50, metric: "wins", xpReward: 1500, coinReward: 900 },
  { code: "sharpshooter", name: "Sharpshooter", description: "Hold 95% accuracy overall.", icon: "🏹", tier: "silver", goal: 95, metric: "accuracy", xpReward: 300, coinReward: 150 },
];

export const TIER_COLORS: Record<string, string> = {
  bronze: "#d97706",
  silver: "#94a3b8",
  gold: "#facc15",
  legend: "#a855f7",
};
