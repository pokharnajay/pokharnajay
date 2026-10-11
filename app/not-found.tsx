import type { Metadata } from "next";
import Link from "next/link";
import "./(site)/globals.css";
import "./(site)/article.css";
import Topbar from "@/components/site/Topbar";
import CustomCursor from "@/components/site/CustomCursor";
import SiteFooter from "@/components/site/SiteFooter";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

/* Global 404 in the site's style. Rendered inside the root layout only, so
   it brings its own chrome. */
export default function NotFound() {
  return (
    <>
      <div className="grain" aria-hidden="true"></div>
      <div className="scanlines" aria-hidden="true"></div>
      <CustomCursor />
      <Topbar />
      <main id="main" className="nf-page">
        <div className="eyebrow">
          <span className="dot" aria-hidden="true"></span> Error 404 / route not found
        </div>
        <h1 className="nf-h1">
          Nothing runs <em>here</em>.
        </h1>
        <p className="nf-copy">
          The page you asked for doesn&rsquo;t exist, or it moved. The automations are fine — this link isn&rsquo;t.
        </p>
        <pre className="nf-trace" aria-hidden="true">{`▸ GET  <requested path>
▸ 404  no matching route
▸ hint try /work or the homepage`}</pre>
        <div className="nf-actions">
          <Link href="/" className="btn primary">Back to home <span className="arrow" aria-hidden="true">↗</span></Link>
          <Link href="/work" className="btn">See the work</Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
