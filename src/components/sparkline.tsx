export default function Sparkline({ data, color = "#7c5cff", label }: { data: number[]; color?: string; label: string }) {
  if (data.length < 2) return <p className="text-sm text-[var(--muted)]">Not enough data yet — play a few games.</p>;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * 100},${40 - ((v - min) / span) * 34 - 3}`)
    .join(" ");
  return (
    <figure>
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-24 w-full" role="img" aria-label={`${label}: from ${data[0]} to ${data[data.length - 1]}`}>
        <polyline points={points} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <polyline points={`0,40 ${points} 100,40`} fill={`${color}22`} stroke="none" />
      </svg>
      <figcaption className="mt-1 flex justify-between text-[11px] text-[var(--muted)]">
        <span>{label}</span>
        <span>
          min {Math.round(min)} · max {Math.round(max)}
        </span>
      </figcaption>
    </figure>
  );
}
