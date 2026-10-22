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
import { ConsentProvider } from "@/components/consent/consent-provider";
import ConsentBanner from "@/components/consent/consent-banner";
import AdSenseScript from "@/components/ads/adsense-script";
import GoogleAnalytics from "@/components/analytics/google-analytics";
import { ADSENSE_CLIENT, ADSENSE_LIVE, isValidPublisherId } from "@/lib/adsense";
import { SITE_NAME, SITE_OWNER, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Type Arena — Competitive Typing Games, Races & Speed Tests",
    template: "%s | Type Arena",
  },
  description:
    "Type Arena is a competitive typing game platform with 16 playable games, live multiplayer races, typing tests, practice drills, achievements, XP progression and global leaderboards.",
  keywords: ["typing games", "typing test", "wpm test", "typing race", "multiplayer typing", "learn to type"],
  publisher: SITE_OWNER,
  creator: SITE_OWNER,
  other: {
    "copyright-year": String(new Date().getFullYear()),
    // Public AdSense account verification tag. Only emitted once a well-formed
    // publisher ID is configured — never a placeholder.
    ...(isValidPublisherId(ADSENSE_CLIENT) ? { "google-adsense-account": ADSENSE_CLIENT } : {}),
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
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: "Competitive typing games, races, typing tests and practice drills.",
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: "en",
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_OWNER,
        url: SITE_URL,
        email: "support@typearena.gg",
      },
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          <ConsentProvider>
            {ADSENSE_LIVE && <link rel="preconnect" href="https://pagead2.googlesyndication.com" />}
            <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-black">
              Skip to content
            </a>
            <Navbar />
            <main id="main" className="min-h-[60vh] w-full overflow-x-hidden">
              {children}
            </main>
            <Footer />
            <BottomNav />
            <ConsentBanner />
            <AdSenseScript />
            <GoogleAnalytics />
          </ConsentProvider>
        </Providers>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}
