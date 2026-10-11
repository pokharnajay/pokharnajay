import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { SITE_URL, IS_INDEXABLE, site } from "@/lib/site";

/* Self-hosted via next/font: no render-blocking Google Fonts request, and
   size-adjusted fallbacks keep layout shift near zero while fonts swap in. */
const display = Space_Grotesk({ subsets: ["latin"], display: "swap", variable: "--font-display" });
const sans = Inter_Tight({ subsets: ["latin"], display: "swap", variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], display: "swap", variable: "--font-mono", preload: false });

/* Search-console verification tags render only when the env var is set. */
const verification: Metadata["verification"] = {};
if (process.env.GOOGLE_SITE_VERIFICATION) verification.google = process.env.GOOGLE_SITE_VERIFICATION;
if (process.env.YANDEX_VERIFICATION) verification.yandex = process.env.YANDEX_VERIFICATION;
if (process.env.BING_SITE_VERIFICATION) verification.other = { "msvalidate.01": process.env.BING_SITE_VERIFICATION };

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: site.title, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: SITE_URL }],
  creator: site.name,
  publisher: site.name,
  keywords: [
    "Jay Pokharna",
    "AI engineer",
    "LLM agent developer",
    "RAG",
    "AI automation engineer",
    "n8n developer",
    "Make.com expert",
  ],
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_US",
    title: site.title,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    ...(site.twitterHandle ? { creator: site.twitterHandle, site: site.twitterHandle } : {}),
  },
  robots: IS_INDEXABLE
    ? {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
      }
    : { index: false, follow: false },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
  verification,
  appleWebApp: { title: site.name, statusBarStyle: "black-translucent", capable: true },
};

export const viewport: Viewport = {
  themeColor: "#07080a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        {children}
        {GA_ID ? (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});`,
              }}
            />
          </>
        ) : null}
      </body>
    </html>
  );
}
