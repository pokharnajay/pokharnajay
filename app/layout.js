import "./globals.css";
import Script from "next/script";

/* Centralised site URL — change this once if you move domains. */
const SITE_URL = "https://pokharnajay.com";

const TITLE = "Jay Pokharna — AI & Automation Engineer";
const DESCRIPTION =
  "AI & Automation Engineer at Etherwise. I build operational backbones for businesses that have outgrown manual work — half code, half visual platforms (Make.com, n8n, Zapier, GoHighLevel, VAPI), all production-grade.";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s | Jay Pokharna",
  },
  description: DESCRIPTION,
  applicationName: "Jay Pokharna",
  generator: "Next.js",
  keywords: [
    "Jay Pokharna",
    "AI engineer",
    "automation engineer",
    "Make.com",
    "Make.com expert",
    "n8n",
    "Zapier",
    "GoHighLevel",
    "VAPI",
    "voice AI",
    "voice agent",
    "no-code",
    "low-code",
    "workflow automation",
    "business automation",
    "Etherwise",
    "operations engineer",
    "AI consultant",
    "automation consultant",
    "systems engineer",
    "Airtable",
    "API integration",
    "webhook",
    "Stripe automation",
    "ClickSend",
    "Cal.com",
    "Twilio",
    "Slack automation",
    "process automation",
    "RPA",
    "Indian automation engineer",
    "Bangalore automation",
    "freelance automation engineer",
    "hire automation engineer",
  ],
  authors: [{ name: "Jay Pokharna", url: SITE_URL }],
  creator: "Jay Pokharna",
  publisher: "Jay Pokharna",
  category: "Technology",
  classification: "Personal Portfolio",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    siteName: "Jay Pokharna",
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Jay Pokharna — AI & Automation Engineer",
        type: "image/png",
      },
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Jay Pokharna — AI & Automation Engineer",
        type: "image/svg+xml",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    creator: "@pokharnajay",
    site: "@pokharnajay",
    images: ["/twitter-image"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  /* SVG favicon only — the legacy PNG/ICO files in public/ are stale (purple
     gem from the original Next template) and would otherwise win in browsers
     that prefer raster favicons. The SVG works in every modern browser. */
  icons: {
    icon: [{ url: "/favicon.svg?v=6", type: "image/svg+xml" }],
    apple: [{ url: "/favicon.svg?v=6", type: "image/svg+xml" }],
    shortcut: [{ url: "/favicon.svg?v=6", type: "image/svg+xml" }],
  },
  manifest: "/site.webmanifest",
  /* Replace these placeholders with the real verification tokens from each
     console (Google Search Console, Bing Webmaster Tools, etc.). */
  verification: {
    google: "REPLACE_WITH_GOOGLE_SEARCH_CONSOLE_TOKEN",
    yandex: "REPLACE_WITH_YANDEX_TOKEN",
    other: {
      "msvalidate.01": "REPLACE_WITH_BING_WEBMASTER_TOKEN",
    },
  },
  appleWebApp: {
    title: "Jay Pokharna",
    statusBarStyle: "black-translucent",
    capable: true,
  },
  other: {
    "theme-color": "#07080a",
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#07080a" },
    { media: "(prefers-color-scheme: dark)", color: "#07080a" },
  ],
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

/* JSON-LD structured data — Google reads these to build rich-result cards
   (sitelinks, "About this person" panel, knowledge-graph entries). */
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Jay Pokharna",
  alternateName: "Jay",
  url: SITE_URL,
  image: `${SITE_URL}/opengraph-image`,
  jobTitle: "AI & Automation Engineer",
  description: DESCRIPTION,
  worksFor: {
    "@type": "Organization",
    name: "Etherwise",
    url: "https://etherwise.io",
  },
  knowsAbout: [
    "AI Automation",
    "Workflow Automation",
    "Make.com",
    "n8n",
    "Zapier",
    "GoHighLevel",
    "VAPI Voice AI",
    "Airtable",
    "API Integration",
    "Stripe",
    "Webhooks",
    "TypeScript",
    "JavaScript",
    "Process Automation",
  ],
  sameAs: [
    "https://github.com/pokharnajay",
    "https://www.linkedin.com/in/pokharnajay",
    "https://x.com/pokharnajay",
    "https://etherwise.io",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Jay Pokharna",
  alternateName: "Jay Pokharna — AI & Automation Engineer",
  url: SITE_URL,
  description: DESCRIPTION,
  inLanguage: "en-US",
  author: { "@type": "Person", name: "Jay Pokharna" },
  publisher: { "@type": "Person", name: "Jay Pokharna" },
};

const professionalServiceJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Jay Pokharna — AI & Automation Engineering",
  description:
    "Production-grade business automation. Discovery first, fixed-price milestones, async-first IST timezone.",
  url: SITE_URL,
  image: `${SITE_URL}/opengraph-image`,
  provider: { "@type": "Person", name: "Jay Pokharna" },
  areaServed: "Worldwide",
  serviceType: [
    "AI Automation",
    "Voice AI Development",
    "Workflow Automation",
    "API Integration",
    "Custom Code Development",
  ],
  priceRange: "$$$",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg?v=6" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg?v=6" type="image/svg+xml" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="canonical" href={SITE_URL} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter+Tight:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#07080a" />
        <meta name="apple-mobile-web-app-title" content="Jay Pokharna" />
        <meta name="application-name" content="Jay Pokharna" />
        <meta name="format-detection" content="telephone=no" />

        {/* JSON-LD structured data — three blocks let Google build a person
            card, a website search action, and a service listing. */}
        <Script
          id="ld-person"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <Script
          id="ld-website"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <Script
          id="ld-service"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(professionalServiceJsonLd) }}
        />
      </head>
      <body>
        {children}
        <Script src="https://unpkg.com/three@0.160.0/build/three.min.js" strategy="beforeInteractive" />
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" strategy="beforeInteractive" />
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" strategy="beforeInteractive" />
        {/* Lenis — Locomotive-style smooth scroll. Locomotive Scroll itself recommends Lenis since v5; this is the modern equivalent. */}
        <Script src="https://unpkg.com/lenis@1.1.20/dist/lenis.min.js" strategy="beforeInteractive" />

        {/* Google Analytics 4 — replace G-XXXXXXXXXX with your real measurement ID
            from https://analytics.google.com to start tracking visits. */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX', { anonymize_ip: true });
          `}
        </Script>
      </body>
    </html>
  );
}
