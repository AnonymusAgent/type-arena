"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EngineProps } from "./types";
import { HudRow, Stat, TypingInput, ProgressBar } from "./hud";
import { randomWords } from "@/lib/words";
import { useApp } from "../providers";

type Entity = {
  id: number;
  word: string;
  pos: number; // 0 -> 100 approach
  speed: number;
  kind: "normal" | "boss" | "power" | "golden";
  lane: number;
};

let seq = 0;

const THEME_ICONS: Record<string, { normal: string; boss: string; power: string; golden: string; base: string; title: string }> = {
  classic: { normal: "🟣", boss: "🟥", power: "⚡", golden: "⭐", base: "🧱", title: "Floor" },
  zombie: { normal: "🧟", boss: "👹", power: "⚡", golden: "💊", base: "🚧", title: "Barricade" },
  defender: { normal: "🛸", boss: "🛰️", power: "⚡", golden: "🔋", base: "🏰", title: "Reactor core" },
  ninja: { normal: "🍥", boss: "🐉", power: "⚡", golden: "🌟", base: "🥷", title: "Dojo" },
};

export default function FallingEngine({ config, onFinish }: EngineProps) {
  const { play } = useApp();
  const theme = String(config.theme ?? "classic");
  const icons = THEME_ICONS[theme] ?? THEME_ICONS.classic;
  const horizontal = theme === "zombie" || theme === "defender";
  const [entities, setEntities] = useState<Entity[]>([]);
  const [input, setInput] = useState("");
  const [lives, setLives] = useState(Number(config.lives ?? 3));
  const maxLives = Number(config.lives ?? 3);
  const [wave, setWave] = useState(1);
  const [kills, setKills] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [chars, setChars] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [slowUntil, setSlowUntil] = useState(0);
  const [flash, setFlash] = useState("");
  const over = useRef(false);
  const livesRef = useRef(lives);
  livesRef.current = lives;

  const spawn = useCallback(
    (forceBoss = false): Entity => {
      const tier = wave > 8 ? "hard" : wave > 4 ? "medium" : "common";
      const roll = Math.random();
      const kind: Entity["kind"] = forceBoss ? "boss" : roll > 0.94 ? "power" : roll > 0.86 && config.special ? "golden" : "normal";
      const word = kind === "boss" ? randomWords("hard", 1)[0] : kind === "power" ? "power" : randomWords(tier, 1)[0];
      return {
        id: ++seq,
        word,
        pos: 0,
        speed: (kind === "boss" ? 0.22 : 0.3 + Math.random() * 0.25) + wave * 0.035,
        kind,
        lane: Math.floor(Math.random() * 5),
      };
    },
    [config.special, wave],
  );

  const finish = useCallback(() => {
    if (over.current) return;
    over.current = true;
    const secs = Math.max(1, elapsed);
    const accuracy = attempts ? Math.round(((attempts - mistakes) / attempts) * 1000) / 10 : 100;
    play("finish");
    onFinish({
      wpm: Math.round((chars / 5 / secs) * 60),
      accuracy,
      score,
      errors: mistakes,
      chars,
      durationSec: Math.round(secs),
      won: wave >= 5,
      extra: { wave, kills, bestCombo },
    });
  }, [attempts, bestCombo, chars, elapsed, kills, mistakes, onFinish, play, score, wave]);

  useEffect(() => {
    const id = setInterval(() => {
      if (over.current) return;
      setElapsed((e) => e + 0.1);
      const slowed = Date.now() < slowUntil;
      setEntities((prev) => {
        let next = prev
          .map((e) => ({ ...e, pos: e.pos + e.speed * (slowed ? 0.4 : 1) }))
          .filter((e) => {
            if (e.pos < 100) return true;
            if (e.kind !== "power") {
              setLives((l) => {
                const nl = l - (e.kind === "boss" ? 2 : 1);
                if (nl <= 0) setTimeout(finish, 0);
                return nl;
              });
              setCombo(0);
              play("error");
              setFlash("hit");
              setTimeout(() => setFlash(""), 300);
            }
            return false;
          });
        const cap = Math.min(7, 2 + Math.floor(wave / 2));
        while (next.length < cap) next = [...next, spawn()];
        return next;
      });
    }, 100);
    return () => clearInterval(id);
  }, [finish, play, slowUntil, spawn, wave]);

  useEffect(() => {
    if (kills > 0 && kills % 8 === 0) {
      setWave((w) => {
        const nw = w + 1;
        if (nw % 5 === 0) setEntities((e) => [...e, spawn(true)]);
        play("levelup");
        return nw;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kills]);

  const submit = (raw: string) => {
    const value = raw.trim();
    if (!value) return;
    setAttempts((a) => a + 1);
    const hit = entities.find((e) => e.word === value);
    if (!hit) {
      setMistakes((m) => m + 1);
      setCombo(0);
      play("error");
      setInput("");
      return;
    }
    setEntities((e) => e.filter((x) => x.id !== hit.id));
    setChars((c) => c + hit.word.length);
    if (hit.kind === "power") {
      setSlowUntil(Date.now() + 5000);
      setLives((l) => Math.min(maxLives, l + 1));
      setFlash("power");
      setTimeout(() => setFlash(""), 400);
      play("combo");
    } else {
      const mult = 1 + Math.min(2, combo / 8);
      const base = hit.kind === "boss" ? 300 : hit.kind === "golden" ? hit.word.length * 45 : hit.word.length * 15;
      setScore((s) => s + Math.round(base * mult));
      setKills((k) => k + 1);
      setCombo((c) => {
        const n = c + 1;
        setBestCombo((b) => Math.max(b, n));
        if (n % 5 === 0) play("combo");
        return n;
      });
      play("key");
    }
    setInput("");
  };

  return (
    <div className="space-y-4">
      <HudRow>
        <Stat label="Score" value={score} accent="#a855f7" />
        <Stat label="Wave" value={wave} />
        <Stat label={theme === "defender" ? "Destroyed" : "Kills"} value={kills} />
        <Stat label="Combo" value={`x${(1 + Math.min(2, combo / 8)).toFixed(1)}`} accent="#f97316" />
        <Stat label={theme === "defender" ? "Integrity" : "Lives"} value={`${Math.max(0, lives)}/${maxLives}`} />
        <Stat label="Time" value={`${elapsed.toFixed(0)}s`} />
      </HudRow>

      <div className={`arcade-field arcade-field--${theme} relative h-[320px] w-full sm:h-[380px] ${flash === "hit" ? "shake" : ""}`} aria-label={`${icons.title} game field`}>
        <span className="arcade-field__status" aria-hidden="true">{`// ${theme.toUpperCase()} MODE · WAVE ${String(wave).padStart(2, "0")}`}</span>
        {entities.map((e) => {
          const style = horizontal
            ? { right: `${Math.min(96, e.pos)}%`, top: `${9 + e.lane * 17}%` }
            : { left: `${7 + e.lane * 18}%`, top: `${Math.min(91, e.pos)}%` };
          return <div key={e.id} className={`arcade-enemy arcade-enemy--${e.kind}`} style={style}>
            <div className="arcade-enemy__model">
              <span className="arcade-enemy__word">{e.word}</span>
              <span className="arcade-enemy__icon" aria-hidden="true">{icons[e.kind]}</span>
            </div>
          </div>;
        })}
        <div className={`arcade-field__base ${horizontal ? "arcade-field__base--left" : "arcade-field__base--bottom"}`} aria-label={icons.title}>
          <span aria-hidden="true">{icons.base}</span><span>{theme === "defender" ? "CORE" : theme === "zombie" ? "DEFEND" : "BASE"}</span>
        </div>
      </div>

      <ProgressBar value={(Math.max(0, lives) / maxLives) * 100} color={lives / maxLives > 0.4 ? "#22c55e" : "#f43f5e"} label="Health" />

      <TypingInput
        value={input}
        onChange={setInput}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            submit(input);
          }
        }}
        placeholder="Type a word + space to destroy it"
      />
      <div className="flex justify-center">
        <button className="btn btn-ghost" onClick={finish}>
          End run
        </button>
      </div>
    </div>
  );
}
