"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Radio, Zap } from "lucide-react";

const PHRASES = ["speed is a skill", "every key counts", "race to the top", "make every word count"];

export default function HeroTyping() {
  const [phrase, setPhrase] = useState(0);
  const [length, setLength] = useState(0);
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setLength(PHRASES[0].length);
      return;
    }
    const complete = length >= PHRASES[phrase].length;
    const timeout = window.setTimeout(() => {
      if (complete) {
        setPhrase((current) => (current + 1) % PHRASES.length);
        setLength(0);
      } else {
        setLength((current) => current + 1);
      }
    }, complete ? 1250 : 95);
    return () => window.clearTimeout(timeout);
  }, [length, phrase]);

  const onMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    sceneRef.current?.style.setProperty("--pointer-x", `${((event.clientX - rect.left) / rect.width - 0.5) * 2}`);
    sceneRef.current?.style.setProperty("--pointer-y", `${((event.clientY - rect.top) / rect.height - 0.5) * 2}`);
  };

  return (
    <div
      ref={sceneRef}
      className="hero-scene"
      onPointerMove={onMove}
      onPointerLeave={() => {
        sceneRef.current?.style.setProperty("--pointer-x", "0");
        sceneRef.current?.style.setProperty("--pointer-y", "0");
      }}
      aria-label="Futuristic 3D keyboard over a racing arena with an animated typing display"
      role="img"
    >
      <Image
        src="/images/arena-hero.jpg"
        alt=""
        fill
        priority
        quality={86}
        sizes="(max-width: 1023px) 100vw, 54vw"
        className="hero-scene__image"
      />
      <div className="hero-scene__vignette" aria-hidden="true" />
      <div className="hero-scene__scanline" aria-hidden="true" />

      <div className="hero-scene__top" aria-hidden="true">
        <span className="hero-scene__live"><Radio size={12} /> LIVE ARENA / 001</span>
        <span className="hero-scene__topright">THE FUTURE OF TYPING <ArrowUpRight size={12} /></span>
      </div>

      <div className="hero-scene__key hero-scene__key--one" aria-hidden="true"><span>W</span></div>
      <div className="hero-scene__key hero-scene__key--two" aria-hidden="true"><span>P</span></div>
      <div className="hero-scene__key hero-scene__key--three" aria-hidden="true"><span>M</span></div>

      <div className="hero-scene__terminal" aria-hidden="true">
        <div className="hero-scene__terminal-top"><span><span className="hero-scene__dot" /> PLAYER_01 / INPUT ACTIVE</span><span>01:24</span></div>
        <div className="hero-scene__terminal-text">
          <span>{PHRASES[phrase].slice(0, length)}</span><span className="hero-scene__cursor">▌</span><span className="hero-scene__remaining">{PHRASES[phrase].slice(length)}</span>
        </div>
        <div className="hero-scene__terminal-line"><span style={{ width: `${(length / PHRASES[phrase].length) * 100}%` }} /></div>
        <div className="hero-scene__terminal-bottom"><span>PRECISION // 98.4%</span><span>COMBO × 2.5</span></div>
      </div>

      <div className="hero-scene__speed" aria-hidden="true"><Zap size={16} fill="currentColor" /><div><strong>098</strong><span>WPM / LIVE</span></div></div>
      <div className="hero-scene__coord" aria-hidden="true">X: 074.2 · Y: 021.8<br />TYPE ARENA // ENGINE V.01</div>
      <span className="hero-scene__spark hero-scene__spark--one" aria-hidden="true" />
      <span className="hero-scene__spark hero-scene__spark--two" aria-hidden="true" />
    </div>
  );
}
