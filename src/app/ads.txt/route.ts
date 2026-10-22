import { NextResponse } from "next/server";
import { adsTxtBody } from "@/lib/adsense";

/**
 * /ads.txt — authorised digital sellers declaration.
 *
 * The body is derived from the configured publisher ID (or an exact ADSENSE_ADS_TXT override).
 * If no real publisher ID is configured the route returns 404 instead of publishing a file
 * containing placeholder or invented seller information.
 *
 * Deploy on the production domain, then verify over HTTPS:
 *   curl -sI https://<your-domain>/ads.txt
 */
export const dynamic = "force-dynamic";

export function GET() {
  const body = adsTxtBody();

  if (!body) {
    return new NextResponse("ads.txt is not configured for this deployment.\n", {
      status: 404,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  }

  return new NextResponse(body, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600",
    },
  });
}
