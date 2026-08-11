/** @type {import('next').NextConfig} */
const nextConfig = {
  // Excalidraw (used by the /exc app) ships untranspiled ESM in places; let
  // Next transpile it so the marketing site + /exc build together.
  transpilePackages: ["@excalidraw/excalidraw"],
};

export default nextConfig;
