"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";

const LINKS = [
  { href: "/work", label: "Case studies", match: (p) => p === "/work" || p.startsWith("/work/") },
  { href: "/#services", label: "Services" },
  { href: "/#process", label: "Process" },
  { href: "/#about", label: "About" },
];

export default function Nav() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  /* The sheet is a sibling of the header: the header's backdrop-filter
     would otherwise become the containing block for its fixed position. */
  return (
    <>
    <header className={"nav" + (scrolled ? " is-scrolled" : "")}>
      <div className="wrap nav-inner">
        <a href="/" className="brand">
          <span className="brand-mark" aria-hidden="true">JP</span>
          <span>{site.name}</span>
        </a>
        <nav className="nav-links" aria-label="Primary">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} aria-current={l.match && l.match(pathname) ? "page" : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>
        <span className="nav-status">
          <span className="dot-live" aria-hidden="true"></span>
          {site.status}
        </span>
        <a href="/#contact" className="btn btn-primary btn-sm nav-cta">Get in touch</a>
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="nav-sheet"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
      <div id="nav-sheet" className={"nav-sheet" + (open ? " is-open" : "")} aria-hidden={!open} onClick={(e) => e.target.closest("a") && setOpen(false)}>
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href}>{l.label}</Link>
        ))}
        <a href="/#contact">Contact</a>
        <a href="/#contact" className="btn btn-primary">Get in touch</a>
      </div>
    </>
  );
}
