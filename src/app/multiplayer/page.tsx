import type { Metadata } from "next";
import PageBanner from "@/components/page-banner";
import MultiplayerClient from "./multiplayer-client";

export const metadata: Metadata = {
  title: "Multiplayer Arena — Real-Time Typing Races",
  description: "Quick match, ranked ladder, 1v1 duels, 4 and 8 player rooms, private rooms with invite links and tournament brackets.",
  alternates: { canonical: "/multiplayer" },
};

export default function MultiplayerPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-3 py-6 sm:px-6 sm:py-10">
      <PageBanner label="MULTIPLAYER / THE SHOWDOWN" title="The race is on." description="Pick your mode, find your rivals and leave them in the dust. Every keystroke moves you forward." glyph="⚔" accent="#fb7185" compact />
      <div className="mt-6"><MultiplayerClient /></div>
    </div>
  );
}
