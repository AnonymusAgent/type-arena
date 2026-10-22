import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/dashboard", "/profile", "/login", "/signup", "/forgot-password"] },
      // Google's crawler must be able to fetch ads.txt to verify sellers.
      { userAgent: "AdsBot-Google", allow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
