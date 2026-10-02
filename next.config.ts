import type { NextConfig } from "next";

const isStatic = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  // `STATIC_EXPORT=1 npm run build` produces a self-contained static site in /out
  ...(isStatic ? { output: "export", assetPrefix: ".", images: { unoptimized: true } } : {}),
};

export default nextConfig;
