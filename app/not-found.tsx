import type { Metadata } from "next";
import Link from "next/link";
import "./(site)/globals.css";
import "./(site)/article.css";
import Nav from "@/components/site/Nav";
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
      <Nav />
      <main id="main" className="wrap nf-page">
        <p className="nf-code">404</p>
        <h1 className="h-display nf-h1">This page doesn&rsquo;t exist.</h1>
        <p className="lead">The link may be old, or the page moved. The case studies and the homepage are a good place to pick up.</p>
        <div className="nf-actions">
          <Link href="/work" className="btn btn-primary">See case studies</Link>
          <Link href="/" className="btn btn-ghost">Go to the homepage</Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
