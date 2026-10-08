"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type SessionUser = {
  id: number;
  username: string;
  avatar: string;
  country: string;
  xp: number;
  coins: number;
  bestWpm: number;
  avgWpm: number;
  accuracy: number;
  gamesPlayed: number;
  gamesWon: number;
  streak: number;
  isAdmin: boolean;
  title: string;
  equippedVehicle: string;
};

type Ctx = {
  user: SessionUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  sound: boolean;
  toggleSound: () => void;
  play: (name: SoundName) => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
  toast: (msg: string, kind?: "info" | "success" | "error") => void;
};

const AppCtx = createContext<Ctx | null>(null);

export type SoundName = "key" | "error" | "combo" | "start" | "finish" | "levelup" | "achievement" | "countdown" | "victory" | "kill";

const TONES: Record<SoundName, { f: number; d: number; type: OscillatorType }> = {
  key: { f: 620, d: 0.04, type: "square" },
  error: { f: 150, d: 0.12, type: "sawtooth" },
  combo: { f: 880, d: 0.08, type: "triangle" },
  start: { f: 520, d: 0.2, type: "sine" },
  finish: { f: 760, d: 0.3, type: "sine" },
  levelup: { f: 980, d: 0.35, type: "triangle" },
  achievement: { f: 1180, d: 0.3, type: "triangle" },
  countdown: { f: 440, d: 0.15, type: "sine" },
  victory: { f: 1320, d: 0.4, type: "triangle" },
  kill: { f: 1560, d: 0.35, type: "sawtooth" },
};

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sound, setSound] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [toasts, setToasts] = useState<{ id: number; msg: string; kind: string }[]>([]);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const t = localStorage.getItem("ta_theme") as "dark" | "light" | null;
    if (t) setTheme(t);
    setSound(localStorage.getItem("ta_sound") === "on");
  }, [refresh]);

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    localStorage.setItem("ta_theme", theme);
  }, [theme]);

  const play = useCallback(
    (name: SoundName) => {
      if (!sound || typeof window === "undefined") return;
      try {
        const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AC();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const tone = TONES[name];
        osc.type = tone.type;
        osc.frequency.value = tone.f;
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + tone.d);
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + tone.d);
        osc.onended = () => void ctx.close();
      } catch {
        /* ignore */
      }
    },
    [sound],
  );

  const toast = useCallback((msg: string, kind: "info" | "success" | "error" = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, msg, kind }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3800);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      user,
      loading,
      refresh,
      logout: async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        setUser(null);
      },
      sound,
      toggleSound: () =>
        setSound((s) => {
          localStorage.setItem("ta_sound", !s ? "on" : "off");
          return !s;
        }),
      play,
      theme,
      toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
      toast,
    }),
    [user, loading, refresh, sound, play, theme, toast],
  );

  return (
    <AppCtx.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-24 left-1/2 z-[80] flex w-[min(92vw,380px)] -translate-x-1/2 flex-col gap-2 sm:bottom-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pop panel rounded-xl px-4 py-3 text-sm font-semibold shadow-xl"
            style={{ borderColor: t.kind === "error" ? "#f43f5e" : t.kind === "success" ? "#22c55e" : undefined, background: "var(--panel-solid)" }}
          >
            {t.msg}
          </div>
        ))}
      </div>
    </AppCtx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used inside Providers");
  return ctx;
}
