import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/space-mono/400.css";
import "@fontsource/space-mono/700.css";
import "./globals.css";
import { Providers } from "@/components/providers";
import Navbar from "@/components/navbar";
import BottomNav from "@/components/bottom-nav";
import Footer from "@/components/footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://type-arena.example.com"),
  title: {
    default: "Type Arena — Competitive Typing Games, Races & Speed Tests",
    template: "%s | Type Arena",
  },
  description:
    "Type Arena is a competitive typing game platform with 16 playable games, live multiplayer races, typing tests, practice drills, achievements, XP progression and global leaderboards.",
  keywords: ["typing games", "typing test", "wpm test", "typing race", "multiplayer typing", "learn to type"],
  publisher: "Webloom Inc.",
  creator: "Webloom Inc.",
  other: {
    "copyright-year": String(new Date().getFullYear()),
  },
  openGraph: {
    title: "Type Arena — Type Faster. Play Harder. Become #1.",
    description: "Race opponents, master your keyboard and climb the global leaderboard across 16 typing games.",
    type: "website",
    siteName: "Type Arena",
  },
  twitter: { card: "summary_large_image", title: "Type Arena", description: "Competitive typing games and speed tests." },
};

export const viewport: Viewport = {
  themeColor: "#080b12",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-black">
            Skip to content
          </a>
          <Navbar />
          <main id="main" className="min-h-[60vh] w-full overflow-x-hidden">
            {children}
          </main>
          <Footer />
          <BottomNav />
        </Providers>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Type Arena",
              url: "https://type-arena.example.com",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://type-arena.example.com/games?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
