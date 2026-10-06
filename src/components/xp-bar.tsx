import { levelFromXp } from "@/lib/progression";

export default function XpBar({ xp, showTitle = true }: { xp: number; showTitle?: boolean }) {
  const lvl = levelFromXp(xp);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs font-bold">
        <span style={{ color: lvl.color }}>
          Lv {lvl.level} {showTitle && `· ${lvl.title}`}
        </span>
        <span className="text-[var(--muted)]">
          {lvl.current} / {lvl.needed || "MAX"} XP
        </span>
      </div>
      <div
        className="h-3 overflow-hidden rounded-full bg-[var(--panel-solid)] border border-[var(--border)]"
        role="progressbar"
        aria-valuenow={Math.round(lvl.progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Experience progress to next level"
      >
        <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${lvl.progress}%`, background: `linear-gradient(90deg, ${lvl.color}, #c026d3)` }} />
      </div>
    </div>
  );
}
