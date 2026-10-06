import type { MetadataRoute } from "next";
import { GAMES } from "@/lib/games";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://type-arena.example.com";
  const routes = ["", "/games", "/typing-test", "/practice", "/multiplayer", "/leaderboards", "/achievements", "/tournaments", "/shop", "/about", "/legal/privacy", "/legal/terms", "/legal/cookies"];
  return [
    ...routes.map((r) => ({ url: `${base}${r}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: r === "" ? 1 : 0.7 })),
    ...GAMES.map((g) => ({ url: `${base}/games/${g.slug}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
