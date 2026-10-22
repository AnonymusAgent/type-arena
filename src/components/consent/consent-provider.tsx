"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from "react";

/**
 * Lightweight first-party consent state.
 *
 * This is not a Google-certified CMP. For EEA/UK/Swiss traffic Google requires a certified
 * CMP (for example the "Privacy & messaging" message inside AdSense) — see docs/adsense.md
 * for the exact manual steps.
 *
 * Rules:
 *  - Nothing non-essential loads before the visitor makes a choice.
 *  - The decision is stored with a version + timestamp and can be withdrawn at /legal/cookies.
 *  - The AdSense and GA scripts are not rendered without consent, so no ad request or
 *    analytics ping is generated for visitors who have not opted in.
 */

const STORAGE_KEY = "ta_consent";
const CONSENT_VERSION = 1;

export type ConsentState = {
  version: number;
  analytics: boolean;
  ads: boolean;
  updatedAt: string;
};

type ConsentContextValue = {
  /** null until the stored value has been read (prevents hydration mismatches). */
  consent: ConsentState | null;
  /** true once the stored decision has been read. */
  ready: boolean;
  decided: boolean;
  save: (next: Pick<ConsentState, "analytics" | "ads">) => void;
  acceptAll: () => void;
  rejectNonEssential: () => void;
  openBanner: () => void;
  closeBanner: () => void;
  bannerOpen: boolean;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

/** In-memory mirror for browsers where localStorage is unavailable (private mode / blocked). */
let memoryValue: string | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function readRaw(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? memoryValue ?? "";
  } catch {
    return memoryValue ?? "";
  }
}

/** null on the server: distinguishes "not read yet" from "read, nothing stored". */
function serverSnapshot(): string | null {
  return null;
}

function parse(raw: string): ConsentState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    if (parsed.version !== CONSENT_VERSION) return null;
    return {
      version: CONSENT_VERSION,
      analytics: parsed.analytics === true,
      ads: parsed.ads === true,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date(0).toISOString(),
    };
  } catch {
    return null;
  }
}

function write(analytics: boolean, ads: boolean) {
  const state: ConsentState = {
    version: CONSENT_VERSION,
    analytics,
    ads,
    updatedAt: new Date().toISOString(),
  };
  const raw = JSON.stringify(state);
  memoryValue = raw;
  try {
    localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    /* the in-memory choice still applies for this tab */
  }
  notify();
}

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const raw = useSyncExternalStore<string | null>(subscribe, readRaw, serverSnapshot);
  const ready = raw !== null;
  const consent = useMemo(() => (raw ? parse(raw) : null), [raw]);

  const [dismissed, setDismissed] = useState(false);
  const [forceOpen, setForceOpen] = useState(false);

  const save = useCallback((next: Pick<ConsentState, "analytics" | "ads">) => {
    write(next.analytics, next.ads);
    setDismissed(false);
    setForceOpen(false);
  }, []);

  const value = useMemo<ConsentContextValue>(
    () => ({
      consent,
      ready,
      decided: consent !== null,
      save,
      acceptAll: () => save({ analytics: true, ads: true }),
      rejectNonEssential: () => save({ analytics: false, ads: false }),
      openBanner: () => {
        setForceOpen(true);
        setDismissed(false);
      },
      closeBanner: () => {
        setForceOpen(false);
        setDismissed(true);
      },
      bannerOpen: ready && !dismissed && (forceOpen || consent === null),
    }),
    [consent, ready, dismissed, forceOpen, save],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent must be used inside ConsentProvider");
  return ctx;
}
