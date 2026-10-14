/** @type {import('next').NextConfig} */
const nextConfig = {
  // Excalidraw (used by the /exc app) ships untranspiled ESM in places; let
  // Next transpile it so the marketing site + /exc build together.
  transpilePackages: ["@excalidraw/excalidraw"],
  // NEXT_DIST_DIR lets a verification build run alongside `next dev`
  // without overwriting the dev server's .next folder.
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
  // Old resume URLs keep working.
  async redirects() {
    return [
      { source: "/resume.pdf", destination: "/Jay_Pokharna_Resume.pdf", permanent: false },
      { source: "/data/:file*", destination: "/Jay_Pokharna_Resume.pdf", permanent: false },
    ];
  },
};

export default nextConfig;
