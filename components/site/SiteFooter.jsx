import Link from "next/link";
import { site } from "@/lib/site";

/* Footer row shared by the homepage contact section and inner pages. */
export function FooterLinks() {
  return (
    <nav className="foot-links" aria-label="Footer">
      <Link href="/work">Case studies</Link>
      <a href="/#scenes">How I work</a>
      <a href="/#contact">Contact</a>
      <a href={site.resume}>Resume</a>
      <a href={site.links.github} target="_blank" rel="noreferrer">GitHub</a>
      <a href={site.links.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
    </nav>
  );
}

export function FooterMeta() {
  return (
    <>
      <span>© {new Date().getFullYear()} {site.name} · {site.location.long}</span>
      <span>{site.version} / production</span>
    </>
  );
}

export default function SiteFooter() {
  return (
    <footer className="site-foot">
      <div className="site-foot-inner">
        <FooterLinks />
        <div className="foot-meta">
          <FooterMeta />
        </div>
      </div>
    </footer>
  );
}
