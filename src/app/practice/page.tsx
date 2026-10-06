import type { Metadata } from "next";
import PageBanner from "@/components/page-banner";
import PracticeClient from "./practice-client";

export const metadata: Metadata = {
  title: "Practice Mode — Targeted Typing Drills",
  description: "Train the home row, top row, bottom row, numbers, symbols, difficult letters, single-hand drills and custom text. Type Arena analyses your mistakes and builds weak-key exercises automatically.",
  alternates: { canonical: "/practice" },
};

export default function PracticePage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-6 sm:py-10">
      <PageBanner label="TRAINING LAB / DAILY DRILLS" title="Build your muscle memory." description="Focused drills, live mistake analysis and custom exercises that target your weakest keys." glyph="🎯" accent="#b8f23e" compact />
      <div className="mt-6"><PracticeClient /></div>
    </div>
  );
}
