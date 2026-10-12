import Link from "next/link";
import { site } from "@/lib/site";

export function FooterLinks() {
  return (
    <nav className="foot-links" aria-label="Footer">
      <Link href="/work">Case studies</Link>
      <a href="/#services">Services</a>
      <a href="/#about">About</a>
      <a href={site.resume}>Resume</a>
      <a href={site.links.github} target="_blank" rel="noreferrer">GitHub</a>
      <a href={site.links.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
    </nav>
  );
}

export default function SiteFooter() {
  return (
    <footer className="site-foot">
      <div className="wrap site-foot-inner">
        <span>© {new Date().getFullYear()} {site.name}. {site.location.long}</span>
        <FooterLinks />
      </div>
    </footer>
  );
}
