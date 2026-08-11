import type { Metadata, Viewport } from "next";
import "./globals.css";

// Isolated root layout for the /exc Excalidraw app. It deliberately does NOT
// include the marketing site's global scripts (Three.js / GSAP / Lenis) or its
// globals.css, so the drawing canvas gets a clean, conflict-free document.
export const metadata: Metadata = {
  title: "Excalidraw — Jay Pokharna",
  description: "A self-hosted Excalidraw editor with cloud-saved diagrams.",
  icons: { icon: [{ url: "/favicon.svg?v=6", type: "image/svg+xml" }] },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  colorScheme: "dark",
};

export default function ExcRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
