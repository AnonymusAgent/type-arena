"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Stat, HudRow, ProgressBar } from "@/components/game/hud";
import { WORD_BANKS, makeNumberToken, makeSymbolToken, randomWords } from "@/lib/words";
import { calcWpm } from "@/lib/progression";
import { useApp } from "@/components/providers";

type Drill = { id: string; name: string; desc: string; icon: string; gen: (weak: string[]) => string };

const DRILLS: Drill[] = [
  { id: "home", name: "Home Row", desc: "asdf jkl; anchor drill", icon: "🏠", gen: () => randomWords("homeRow", 40).join(" ") },
  { id: "top", name: "Top Row", desc: "qwerty uiop reach", icon: "⬆️", gen: () => randomWords("topRow", 40).join(" ") },
  { id: "bottom", name: "Bottom Row", desc: "zxcv bnm control", icon: "⬇️", gen: () => randomWords("bottomRow", 40).join(" ") },
  { id: "numbers", name: "Numbers", desc: "Number row precision", icon: "🔢", gen: () => Array.from({ length: 24 }, () => makeNumberToken("random")).join(" ") },
  { id: "symbols", name: "Symbols", desc: "Shift-row symbols", icon: "#️⃣", gen: () => Array.from({ length: 26 }, () => makeSymbolToken(3)).join(" ") },
  { id: "common", name: "Common Words", desc: "The 200 most used words", icon: "💬", gen: () => randomWords("common", 60).join(" ") },
  { id: "hard", name: "Difficult Letters", desc: "q z x j v b rare letters", icon: "🧩", gen: () => randomWords("hard", 20).join(" ") },
  { id: "left", name: "Left Hand", desc: "Left-hand isolation", icon: "🫲", gen: () => randomWords("leftHand", 40).join(" ") },
  { id: "right", name: "Right Hand", desc: "Right-hand isolation", icon: "🫱", gen: () => randomWords("rightHand", 40).join(" ") },
  {
    id: "weak",
    name: "Weak Keys",
    desc: "Auto-generated from your mistakes",
    icon: "🎯",
    gen: (weak) =>
      weak.length
        ? Array.from({ length: 40 }, () => {
            const k = weak[Math.floor(Math.random() * weak.length)];
            return `${k}${k}${WORD_BANKS.common.find((w) => w.includes(k)) ?? k}`;
          }).join(" ")
        : randomWords("common", 40).join(" "),
  },
];

export default function PracticeClient() {
  const { play, toast, refresh } = useApp();
  const [drill, setDrill] = useState<Drill>(DRILLS[0]);
  const [customText, setCustomText] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [nonce, setNonce] = useState(0);
  const [typed, setTyped] = useState("");
  const [started, setStarted] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [keystrokes, setKeystrokes] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [keyErrors, setKeyErrors] = useState<Record<string, number>>({});
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("ta_key_errors");
      if (raw) setKeyErrors(JSON.parse(raw));
    } catch {}
  }, []);

  const weakKeys = useMemo(
    () =>
      Object.entries(keyErrors)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([k]) => k),
    [keyErrors],
  );

  const weakKeysRef = useRef<string[]>([]);
  weakKeysRef.current = weakKeys;
  const customTextRef = useRef("");
  customTextRef.current = customText;

  // Drill text is random, so it must be produced on the client only. Generating it during
  // render made the server and client HTML differ (React hydration error #418).
  const [text, setText] = useState("");
  useEffect(() => {
    setText(useCustom && customTextRef.current.trim().length > 4 ? customTextRef.current.trim() : drill.gen(weakKeysRef.current));
    // Regenerating on every weak-key or textarea keystroke would reset the drill mid-run,
    // so those are read from refs instead of being dependencies.
  }, [drill, nonce, useCustom]);

  useEffect(() => {
    setTyped("");
    setStarted(null);
    setElapsed(0);
    setKeystrokes(0);
    setMistakes(0);
    setDone(false);
  }, [text]);

  useEffect(() => {
    if (!started || done) return;
    const id = setInterval(() => setElapsed((Date.now() - started) / 1000), 200);
    return () => clearInterval(id);
  }, [started, done]);

  const correct = useMemo(() => {
    let c = 0;
    for (let i = 0; i < typed.length; i++) if (typed[i] === text[i]) c++;
    return c;
  }, [typed, text]);

  const accuracy = keystrokes ? ((keystrokes - mistakes) / keystrokes) * 100 : 100;
  const wpm = calcWpm(correct, Math.max(elapsed, 0.5));

  const finish = useCallback(async () => {
    if (done) return;
    setDone(true);
    localStorage.setItem("ta_key_errors", JSON.stringify(keyErrors));
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameSlug: "practice",
        wpm: Math.round(wpm),
        accuracy: Math.round(accuracy * 10) / 10,
        score: Math.round(wpm * accuracy),
        errors: mistakes,
        chars: typed.length,
        durationSec: Math.round(elapsed),
        won: accuracy > 95,
      }),
    });
    const data = await res.json();
    if (data.saved) {
      await refresh();
      toast(`Practice saved · +${data.rewards.xp} XP`, "success");
    }
  }, [accuracy, done, elapsed, keyErrors, mistakes, refresh, toast, typed.length, wpm]);

  const handle = (value: string) => {
    if (done) return;
    if (!started) setStarted(Date.now());
    if (value.length > typed.length) {
      const i = value.length - 1;
      setKeystrokes((k) => k + 1);
      if (value[i] !== text[i]) {
        setMistakes((m) => m + 1);
        const expected = text[i];
        if (expected && expected !== " ") setKeyErrors((prev) => ({ ...prev, [expected]: (prev[expected] ?? 0) + 1 }));
        play("error");
      } else play("key");
    }
    const next = value.slice(0, text.length);
    setTyped(next);
    if (next.length >= text.length) setTimeout(() => void finish(), 50);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-3">
        <div className="panel rounded-2xl p-4">
          <h2 className="mb-2 text-sm font-black uppercase tracking-wider text-[var(--muted)]">Drills</h2>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
            {DRILLS.map((d) => (
              <button
                key={d.id}
                onClick={() => {
                  setDrill(d);
                  setUseCustom(false);
                  setNonce((n) => n + 1);
                }}
                aria-pressed={!useCustom && drill.id === d.id}
                className={`rounded-xl border px-3 py-2.5 text-left text-xs font-bold ${
                  !useCustom && drill.id === d.id ? "border-[#7c5cff] bg-[#7c5cff]/15" : "border-[var(--border)] bg-[var(--panel)]"
                }`}
              >
                <span className="mr-1">{d.icon}</span>
                {d.name}
                <span className="block text-[10px] font-normal text-[var(--muted)]">{d.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="panel rounded-2xl p-4">
          <h2 className="mb-2 text-sm font-black uppercase tracking-wider text-[var(--muted)]">Custom text</h2>
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            rows={3}
            placeholder="Paste any text to practise…"
            aria-label="Custom practice text"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] p-2 text-sm outline-none"
          />
          <button
            className="btn btn-ghost mt-2 w-full text-sm"
            onClick={() => {
              if (customText.trim().length < 5) return toast("Add at least 5 characters of custom text.", "error");
              setUseCustom(true);
              setNonce((n) => n + 1);
            }}
          >
            Practise custom text
          </button>
        </div>

        <div className="panel rounded-2xl p-4">
          <h2 className="mb-2 text-sm font-black uppercase tracking-wider text-[var(--muted)]">Mistake analysis</h2>
          {weakKeys.length ? (
            <>
              <p className="text-sm">
                You frequently miss{" "}
                <strong className="text-rose-400">
                  {weakKeys.map((k) => k.toUpperCase()).join(", ")}
                </strong>
                .
              </p>
              <button
                className="btn btn-primary mt-3 w-full text-sm"
                onClick={() => {
                  setDrill(DRILLS[DRILLS.length - 1]);
                  setUseCustom(false);
                  setNonce((n) => n + 1);
                }}
              >
                Generate weak-key drill
              </button>
            </>
          ) : (
            <p className="text-sm text-[var(--muted)]">Complete a drill and we&apos;ll analyse which keys slow you down.</p>
          )}
        </div>
      </aside>

      <section className="space-y-4">
        <HudRow>
          <Stat label="WPM" value={Math.round(wpm)} accent="#7c5cff" />
          <Stat label="Accuracy" value={`${accuracy.toFixed(1)}%`} />
          <Stat label="Errors" value={mistakes} />
          <Stat label="Correct" value={correct} />
          <Stat label="Time" value={`${elapsed.toFixed(0)}s`} />
          <Stat label="Drill" value={useCustom ? "Custom" : drill.name} />
        </HudRow>
        <ProgressBar value={(typed.length / text.length) * 100} label="Drill progress" />
        <div className="panel cursor-text rounded-2xl p-4 text-lg leading-relaxed sm:p-6 sm:text-xl" onClick={() => inputRef.current?.focus()}>
          <p className="break-words font-mono">
            {text.split("").map((ch, i) => (
              <span
                key={i}
                className={
                  i < typed.length
                    ? typed[i] === ch
                      ? "text-emerald-400"
                      : "bg-rose-500/30 text-rose-300"
                    : i === typed.length
                      ? "caret bg-[#7c5cff]/40"
                      : "text-[var(--muted)]"
                }
              >
                {ch}
              </span>
            ))}
          </p>
        </div>
        <input
          ref={inputRef}
          value={typed}
          onChange={(e) => handle(e.target.value)}
          aria-label="Practice typing input"
          autoComplete="off"
          spellCheck={false}
          placeholder="Type the drill text here…"
          className="h-14 w-full rounded-2xl border-2 border-[var(--border)] bg-[var(--panel-solid)] px-4 text-lg outline-none focus:border-[#7c5cff]"
        />
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-ghost" onClick={() => setNonce((n) => n + 1)}>
            🔄 New drill text
          </button>
          <button className="btn btn-primary" onClick={() => void finish()} disabled={!started || done}>
            ✅ Finish & save
          </button>
        </div>
        {done && <p className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm">Drill complete — {Math.round(wpm)} WPM at {accuracy.toFixed(1)}% accuracy.</p>}
      </section>
    </div>
  );
}
