import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  colorScheme: "dark",
};

// Layout for the /exc Excalidraw app. The marketing site's chrome, scripts
// and globals.css live in the (site) group, so the drawing canvas gets a
// clean, conflict-free document. Private tool: kept out of search results.
export const metadata: Metadata = {
  title: "Excalidraw",
  description: "A self-hosted Excalidraw editor with cloud-saved diagrams.",
  robots: { index: false, follow: false },
};

export default function ExcLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
