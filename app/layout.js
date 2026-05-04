import "./globals.css";
import Script from "next/script";

export const metadata = {
  title: "Jay Pokharna — AI & Automation Engineer",
  description:
    "AI & automation engineer. Operational backbones for service businesses — Make.com, Airtable, VAPI, Stripe, and the custom code that holds it all together.",
  icons: {
    icon: ["./favicon.ico?v=4"],
    apple: ["./apple-touch-icon.png?v=4"],
    shortcut: ["./apple-touch-icon.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <link rel="shortcut icon" href="./favicon.ico" type="image/x-icon" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Script src="https://unpkg.com/three@0.160.0/build/three.min.js" strategy="beforeInteractive" />
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" strategy="beforeInteractive" />
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" strategy="beforeInteractive" />
        <Script src="https://unpkg.com/lenis@1.1.13/dist/lenis.min.js" strategy="beforeInteractive" />
        <Script src="https://cdn.jsdelivr.net/gh/balacodeio/Vapi-Web-UMD@2.1.0/dist/2.1.0/vapi-web-bundle-2.1.0.min.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
