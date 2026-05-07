import "./globals.css";
import Script from "next/script";

export const metadata = {
  title: "Jay Pokharna — AI & Automation Engineer",
  description:
    "AI & Automation Engineer at Etherwise. I build the systems your ops team wishes existed — half code, half visual platforms, all production-grade.",
  icons: {
    icon: ["./favicon.ico?v=4"],
    apple: ["./apple-touch-icon.png?v=4"],
    shortcut: ["./apple-touch-icon.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="shortcut icon" href="./favicon.ico" type="image/x-icon" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter+Tight:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Script src="https://unpkg.com/three@0.160.0/build/three.min.js" strategy="beforeInteractive" />
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" strategy="beforeInteractive" />
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
