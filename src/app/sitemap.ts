import type { MetadataRoute } from "next";
import { GAMES } from "@/lib/games";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL;
  const routes: { path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" }[] = [
    { path: "", priority: 1, changeFrequency: "daily" },
    { path: "/games", priority: 0.9, changeFrequency: "weekly" },
    { path: "/typing-test", priority: 0.9, changeFrequency: "weekly" },
    { path: "/practice", priority: 0.8, changeFrequency: "weekly" },
    { path: "/multiplayer", priority: 0.8, changeFrequency: "weekly" },
    { path: "/leaderboards", priority: 0.7, changeFrequency: "daily" },
    { path: "/achievements", priority: 0.6, changeFrequency: "weekly" },
    { path: "/tournaments", priority: 0.7, changeFrequency: "daily" },
    { path: "/shop", priority: 0.5, changeFrequency: "monthly" },
    { path: "/about", priority: 0.6, changeFrequency: "monthly" },
    { path: "/legal/privacy", priority: 0.4, changeFrequency: "monthly" },
    { path: "/legal/terms", priority: 0.4, changeFrequency: "monthly" },
    { path: "/legal/cookies", priority: 0.4, changeFrequency: "monthly" },
  ];

  return [
    ...routes.map((r) => ({
      url: `${base}${r.path}`,
      lastModified: new Date(),
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })),
    ...GAMES.map((g) => ({
      url: `${base}/games/${g.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
