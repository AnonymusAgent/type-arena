import type { CSSProperties } from "react";

type Props = { label: string; title: string; description: string; glyph?: string; accent?: string; compact?: boolean };

export default function PageBanner({ label, title, description, glyph = "⌨", accent = "#c5fb56", compact = false }: Props) {
  return (
    <header className={`page-banner ${compact ? "page-banner--compact" : ""}`} style={{ "--banner-accent": accent } as CSSProperties}>
      <div className="page-banner__content">
        <span className="page-banner__label">{`// ${label}`}</span>
        <h1 className="page-banner__title">{title}</h1>
        <p className="page-banner__desc">{description}</p>
      </div>
      <div className="page-banner__visual" aria-hidden="true">
        <div className="page-banner__orbit" />
        <div className="page-banner__orbit page-banner__orbit--outer" />
        <div className="page-banner__key"><span>{glyph}</span></div>
        <div className="page-banner__spark page-banner__spark--one" />
        <div className="page-banner__spark page-banner__spark--two" />
      </div>
      <span className="page-banner__serial" aria-hidden="true">TYPE ARENA · 001</span>
    </header>
  );
}
