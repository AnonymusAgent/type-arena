"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EngineProps } from "./types";
import { HudRow, ProgressBar, Stat, TypingInput } from "./hud";
import { makeNumberToken, makeSymbolToken, randomWords } from "@/lib/words";
import { useApp } from "../providers";

type Token = { id: number; text: string; life: number; max: number };

let seq = 0;

export default function StreamEngine({ config, onFinish }: EngineProps) {
  const { play } = useApp();
  const tokenKind = String(config.tokenKind ?? "words");
  const bank = String(config.bank ?? "common");
  const slow = Boolean(config.slow);
  const ramp = String(config.ramp ?? "normal");
  const [numberMode, setNumberMode] = useState("random");
  const [tokens, setTokens] = useState<Token[]>([]);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [cleared, setCleared] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [lives, setLives] = useState(Number(config.startLife ?? 5));
  const [elapsed, setElapsed] = useState(0);
  const [chars, setChars] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [keystrokes, setKeystrokes] = useState(0);
  const over = useRef(false);

  const makeToken = useCallback((): Token => {
    let text: string;
    if (tokenKind === "numbers") text = makeNumberToken(numberMode);
    else if (tokenKind === "symbols") text = makeSymbolToken(2 + Math.min(4, Math.floor(level / 2)));
    else {
      const tier = ramp === "fast" ? (level > 6 ? "hard" : level > 3 ? "medium" : bank) : level > 8 ? "hard" : level > 4 ? "medium" : bank;
      text = randomWords(tier, 1)[0];
    }
    const base = (slow ? 11000 : 7000) - level * (ramp === "fast" ? 500 : 280);
    const max = Math.max(1800, base);
    return { id: ++seq, text, life: max, max };
  }, [bank, level, numberMode, ramp, slow, tokenKind]);

  const finish = useCallback(() => {
    if (over.current) return;
    over.current = true;
    const secs = Math.max(1, elapsed);
    const accuracy = keystrokes ? Math.round(((keystrokes - mistakes) / keystrokes) * 1000) / 10 : 100;
    const wpm = Math.round((chars / 5 / secs) * 60);
    play("finish");
    onFinish({
      wpm,
      accuracy,
      score,
      errors: mistakes,
      chars,
      durationSec: Math.round(secs),
      won: level >= 5,
      extra: { level, cleared, bestCombo },
    });
  }, [bestCombo, chars, cleared, elapsed, keystrokes, level, mistakes, onFinish, play, score]);

  useEffect(() => {
    const id = setInterval(() => {
      if (over.current) return;
      setElapsed((e) => e + 0.1);
      setTokens((prev) => {
        const next = prev
          .map((t) => ({ ...t, life: t.life - 100 }))
          .filter((t) => {
            if (t.life > 0) return true;
            setLives((l) => {
              const nl = l - 1;
              if (nl <= 0) setTimeout(finish, 0);
              return nl;
            });
            setCombo(0);
            play("error");
            return false;
          });
        const cap = Math.min(6, 2 + Math.floor(level / 2));
        while (next.length < cap) next.push(makeToken());
        return next;
      });
    }, 100);
    return () => clearInterval(id);
  }, [finish, level, makeToken, play]);

  // Some tokens legitimately contain spaces (phone numbers, "12 + 7 = 19"). When any are on
  // screen, space must type a character instead of submitting, or they can never be cleared.
  const spaceIsTyped = tokens.some((t) => t.text.includes(" "));

  const submit = (raw: string) => {
    const value = raw.trim();
    if (!value) return;
    const hit = tokens.find((t) => t.text === value);
    if (hit) {
      const gained = Math.round((hit.text.length * 10 + 20) * (1 + Math.min(2, combo / 10)));
      setScore((s) => s + gained);
      setChars((c) => c + hit.text.length);
      setTokens((t) => t.filter((x) => x.id !== hit.id));
      setCleared((c) => {
        const n = c + 1;
        if (n % 10 === 0) {
          setLevel((l) => l + 1);
          play("levelup");
        }
        return n;
      });
      setCombo((c) => {
        const n = c + 1;
        setBestCombo((b) => Math.max(b, n));
        if (n % 5 === 0) play("combo");
        return n;
      });
      play("key");
    } else {
      setMistakes((m) => m + 1);
      setCombo(0);
      play("error");
    }
    setInput("");
  };

  return (
    <div className="space-y-4">
      <HudRow>
        <Stat label="Score" value={score} accent="#22d3ee" />
        <Stat label="Level" value={level} />
        <Stat label="Cleared" value={cleared} />
        <Stat label="Combo" value={`x${(1 + Math.min(2, combo / 10)).toFixed(1)}`} accent="#f97316" />
        <Stat label="Lives" value={"❤️".repeat(Math.max(0, Math.min(lives, 5)))} />
        <Stat label="Time" value={`${elapsed.toFixed(0)}s`} />
      </HudRow>

      {tokenKind === "numbers" && (
        <div className="flex flex-wrap gap-2">
          {["random", "phone", "currency", "dates", "math"].map((m) => (
            <button
              key={m}
              // Clear the board too, otherwise tokens from the previous mode linger
              // and the switch looks like it did nothing.
              onClick={() => {
                setNumberMode(m);
                setTokens([]);
                setInput("");
              }}
              className={`rounded-lg border px-3 py-2 text-xs font-bold capitalize ${
                numberMode === m ? "border-[#22d3ee] bg-[#22d3ee]/15 text-[#22d3ee]" : "border-[var(--border)] bg-[var(--panel)]"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      )}

      <div className="blitz-field grid grid-cols-1 content-start gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="3D word arena">
        {tokens.map((t) => (
          <div key={t.id} className="blitz-tile">
            <div className="mb-1 flex items-center justify-between font-mono text-[9px] font-bold tracking-wider text-[#8db4c0]"><span>WORD / {String(t.id).padStart(3, "0")}</span><span>{Math.ceil(t.life / 1000)}s</span></div>
            <p className="blitz-tile__word break-all text-center font-mono text-xl font-bold sm:text-2xl">{t.text}</p>
            <div className="mt-3"><ProgressBar value={(t.life / t.max) * 100} color={t.life / t.max < 0.3 ? "#f47f91" : "#63e5e4"} label={`Time left for ${t.text}`} /></div>
          </div>
        ))}
      </div>

      <TypingInput
        value={input}
        onChange={setInput}
        onKeyDown={(e) => {
          if (e.key === "Enter" || (e.key === " " && !spaceIsTyped)) {
            e.preventDefault();
            submit(input);
          } else if (e.key.length === 1) {
            setKeystrokes((k) => k + 1);
          }
        }}
        placeholder={spaceIsTyped ? "Type the full value then press enter" : "Type a word then press space or enter"}
      />
      <div className="flex justify-center">
        <button className="btn btn-ghost" onClick={finish}>
          End run
        </button>
      </div>
    </div>
  );
}
