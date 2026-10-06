"use client";

import { useMemo, useState } from "react";
import { EngineProps } from "./types";
import TextCore from "./text-core";
import { CODE_SNIPPETS, PARAGRAPHS, randomSentence, randomWords } from "@/lib/words";

export default function TextEngine({ config, onFinish }: EngineProps) {
  const source = String(config.source ?? "words");
  const duration = Number(config.duration ?? 0);
  const [category, setCategory] = useState("general");
  const [language, setLanguage] = useState("javascript");
  const [nonce, setNonce] = useState(0);

  const text = useMemo(() => {
    void nonce;
    if (source === "code") return CODE_SNIPPETS[language];
    if (source === "sentences") return randomSentence(category);
    if (source === "paragraph") return `${randomSentence(category)} ${randomSentence(category)}`;
    return randomWords("common", 60).join(" ");
  }, [source, category, language, nonce]);

  return (
    <div className="space-y-4">
      {source === "sentences" && (
        <div className="flex flex-wrap gap-2">
          {Object.keys(PARAGRAPHS).map((c) => (
            <button
              key={c}
              onClick={() => {
                setCategory(c);
                setNonce((n) => n + 1);
              }}
              className={`rounded-lg border px-3 py-2 text-xs font-bold capitalize ${
                category === c ? "border-[#14b8a6] bg-[#14b8a6]/15 text-[#14b8a6]" : "border-[var(--border)] bg-[var(--panel)]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}
      {source === "code" && (
        <div className="flex flex-wrap gap-2">
          {Object.keys(CODE_SNIPPETS).map((l) => (
            <button
              key={l}
              onClick={() => {
                setLanguage(l);
                setNonce((n) => n + 1);
              }}
              className={`rounded-lg border px-3 py-2 text-xs font-bold uppercase ${
                language === l ? "border-[#60a5fa] bg-[#60a5fa]/15 text-[#60a5fa]" : "border-[var(--border)] bg-[var(--panel)]"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      )}
      <TextCore key={`${source}-${category}-${language}-${nonce}`} text={text} durationSec={duration} onFinish={onFinish} />
    </div>
  );
}
