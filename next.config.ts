import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // The hero artwork is requested at quality 86; anything not listed here warns at runtime.
    qualities: [75, 86],
  },
};

export default nextConfig;
