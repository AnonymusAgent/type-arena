import type { Metadata } from "next";
import PageBanner from "@/components/page-banner";
import ShopClient from "./shop-client";

export const metadata: Metadata = {
  title: "Rewards Shop — Vehicles, Themes & Cosmetics",
  description: "Spend the coins you earn on vehicles, keyboard skins, profile frames, trails, titles and themes. Cosmetic only — never pay-to-win.",
};

export default function ShopPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-6 sm:px-6 sm:py-10">
      <PageBanner label="REWARDS / CUSTOMIZATION" title="Make it your arena." description="Earn coins by playing. Unlock vehicles, trails, frames and themes. All style, no pay-to-win." glyph="🚀" accent="#a78bfa" compact />
      <div className="mt-6"><ShopClient /></div>
    </div>
  );
}
