import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "fal.media" },
      { protocol: "https", hostname: "*.fal.media" },
      { protocol: "https", hostname: "v3.fal.media" },
      { protocol: "https", hostname: "v2.fal.media" },
      { protocol: "https", hostname: "storage.googleapis.com" },
    ],
  },
  // better-sqlite3 is a native binding and must not be bundled by Turbopack.
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
