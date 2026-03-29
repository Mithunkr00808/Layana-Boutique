import type { NextConfig } from "next";

const config: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "contribution.usercontent.google.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default config;
