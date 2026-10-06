"use client";

export function Stat({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="hud-stat min-w-0 rounded-xl border border-[var(--border)] px-2 py-2.5 text-center">
      <div className="truncate font-mono text-[9px] font-bold uppercase tracking-[.08em] text-[var(--muted)] sm:text-[10px]">{label}</div>
      <div className="mt-1 truncate text-base font-bold tabular-nums sm:text-xl" style={accent ? { color: accent } : undefined} title={String(value)}>{value}</div>
    </div>
  );
}

export function HudRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">{children}</div>;
}

export function ProgressBar({ value, color = "#c5fb56", label }: { value: number; color?: string; label?: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--panel-solid)]" role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100} aria-label={label ?? "progress"}>
      <div className="h-full rounded-full transition-[width] duration-200" style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color, boxShadow: `0 0 12px ${color}` }} />
    </div>
  );
}

export function TypingInput({ value, onChange, onKeyDown, placeholder = "Start typing…", disabled }: { value: string; onChange: (v: string) => void; onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void; placeholder?: string; disabled?: boolean }) {
  return (
    <input
      autoFocus
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      aria-label="Typing input"
      autoComplete="off"
      autoCapitalize="off"
      autoCorrect="off"
      spellCheck={false}
      className="h-14 w-full rounded-xl border border-[var(--border)] bg-[var(--panel-solid)] px-4 font-mono text-base font-semibold outline-none transition focus:border-[var(--brand)] sm:text-lg"
    />
  );
}
