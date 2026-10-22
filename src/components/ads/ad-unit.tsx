"use client";

import { useEffect, useRef, useState } from "react";
import { ADSENSE_CLIENT, ADSENSE_MODE, isAdUnitConfigured, slotIdFor, type AdSlotName } from "@/lib/adsense";
import { useConsent } from "@/components/consent/consent-provider";

type AdFormat = "auto" | "horizontal" | "rectangle" | "vertical";

type Props = {
  /** Which configured slot to use. Slots are defined in src/lib/adsense.ts. */
  placement: AdSlotName;
  /** Responsive by default; a fixed format can be requested per placement. */
  format?: AdFormat;
  /** Optional AdSense layout key (only for in-article/in-feed units). */
  layoutKey?: string;
  /** Extra classes for the outer wrapper (spacing only — never widths that could overflow). */
  className?: string;
  /** Reserved height. Keep it stable between first paint and ad fill to avoid layout shift. */
  minHeightClass?: string;
  /** Below-the-fold units wait until they are near the viewport before requesting an ad. */
  lazy?: boolean;
};

/**
 * Reusable, consent-aware, responsive AdSense unit.
 *
 * Behaviour contract:
 *  - Renders nothing at all in production until the slot is configured and consent is granted.
 *  - Reserves vertical space up front (no CLS when the ad arrives).
 *  - Pushes exactly one ad request per mounted container (`data-ad-pushed` guard).
 *  - Collapses itself when AdSense reports an unfilled/blocked ad, leaving no empty box.
 *  - Never lazy-loads when `lazy={false}` (use that for units visible on first paint).
 *  - Development/preview builds show an inert, clearly labelled placeholder and never load
 *    the AdSense script, so testing can never generate invalid impressions.
 */
export default function AdUnit({
  placement,
  format = "auto",
  layoutKey,
  className = "",
  minHeightClass = "min-h-[250px] sm:min-h-[220px]",
  lazy = true,
}: Props) {
  const { ready, consent } = useConsent();
  const live = isAdUnitConfigured(placement) && ready && consent?.ads === true;
  const preview = ADSENSE_MODE === "preview";

  const shellRef = useRef<HTMLDivElement>(null);
  const insRef = useRef<HTMLModElement>(null);
  const [visible, setVisible] = useState(() => !lazy || typeof IntersectionObserver === "undefined");
  const [status, setStatus] = useState<"pending" | "filled" | "unfilled">("pending");

  // Lazy loading: start the request only as the unit approaches the viewport.
  useEffect(() => {
    if (!lazy || visible) return;
    const el = shellRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "320px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [lazy, visible]);

  // Single request per container, then watch for AdSense's fill status.
  useEffect(() => {
    if (!live || !visible) return;
    const ins = insRef.current;
    if (!ins || ins.dataset.adPushed === "1") return;
    ins.dataset.adPushed = "1";

    try {
      const w = window as unknown as { adsbygoogle?: unknown[] };
      (w.adsbygoogle = w.adsbygoogle || []).push({});
    } catch {
      // Ad blocker or a malformed request: collapse on the next tick instead of leaving a box.
      window.setTimeout(() => setStatus("unfilled"), 0);
      return;
    }

    let timeout: number | undefined;
    const sync = () => {
      const value = ins.getAttribute("data-ad-status");
      if (value === "filled") setStatus("filled");
      else if (value === "unfilled") setStatus("unfilled");
    };
    sync();

    const observer = new MutationObserver(sync);
    observer.observe(ins, { attributes: true, attributeFilter: ["data-ad-status"] });

    // Ad blockers and empty responses never set data-ad-status. Stop reserving space
    // after a short grace period instead of showing a broken placeholder.
    timeout = window.setTimeout(() => {
      if (!ins.getAttribute("data-ad-status")) setStatus("unfilled");
    }, 10_000);

    return () => {
      observer.disconnect();
      if (timeout) window.clearTimeout(timeout);
    };
  }, [live, visible, placement]);

  // Development / preview placeholder: inert, no network requests, obvious to developers only.
  if (preview) {
    return (
      <div className={`ad-unit ad-unit--preview my-8 w-full max-w-full ${className}`} data-ad-placement={placement}>
        <div className="flex min-h-[90px] flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[var(--border)] px-4 py-5 text-center">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[.16em] text-[var(--muted)]">Ad slot preview · {placement}</span>
          <span className="font-mono text-[10px] text-[var(--muted)] opacity-70">{slotIdFor(placement)}</span>
          <span className="text-[11px] text-[var(--muted)]">AdSense is not loaded in development.</span>
        </div>
      </div>
    );
  }

  // Nothing to render: not configured, or the visitor has not granted advertising consent.
  if (!live) return null;

  if (status === "unfilled") return null;

  return (
    <aside
      ref={shellRef}
      aria-label="Advertisement"
      data-ad-placement={placement}
      className={`ad-unit my-8 w-full max-w-full ${className}`}
    >
      <p aria-hidden="true" className="mb-1.5 text-center font-mono text-[9px] font-bold uppercase tracking-[.22em] text-[var(--muted)] opacity-60">
        Advertisement
      </p>
      <div className={`mx-auto w-full max-w-full overflow-hidden ${status === "pending" ? minHeightClass : ""}`}>
        <ins
          ref={insRef}
          className="adsbygoogle block w-full"
          style={{ display: "block" }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={slotIdFor(placement)}
          data-ad-format={format}
          data-full-width-responsive="true"
          {...(layoutKey ? { "data-ad-layout-key": layoutKey } : {})}
        />
      </div>
    </aside>
  );
}
