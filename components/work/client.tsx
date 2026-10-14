"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useReveal } from "@/lib/motion";

/* Small client islands for /work and /writing pages. Everything here is an
   enhancement: the server HTML is complete and readable without JS. */

export function RevealInit() {
  // Re-scan on client-side navigation: the layout stays mounted.
  useReveal("[data-reveal]", usePathname() ?? "");
  return null;
}

export function CopyButton() {
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const onClick = async () => {
    const pre = ref.current?.closest(".code-wrap")?.querySelector("pre");
    if (!pre) return;
    try {
      await navigator.clipboard.writeText(pre.innerText.replace(/\n$/, ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };
  return (
    <button ref={ref} type="button" className="copy-btn" onClick={onClick} aria-label={copied ? "Copied" : "Copy code"}>
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
}

export function ReadingProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const bar = ref.current;
    const article = document.querySelector("[data-article]");
    if (!bar || !article) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = article.getBoundingClientRect();
      const total = r.height - window.innerHeight * 0.6;
      const p = Math.max(0, Math.min(1, -r.top / Math.max(1, total)));
      bar.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return (
    <div className="read-progress" aria-hidden="true">
      <div ref={ref} className="read-progress-bar" />
    </div>
  );
}

/* Highlights the TOC entry for the section currently being read. */
export function TocSpy() {
  useEffect(() => {
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>(".toc a[href^='#']"));
    const heads = links
      .map((a) => document.getElementById(decodeURIComponent(a.hash.slice(1))))
      .filter((h): h is HTMLElement => !!h);
    if (!heads.length) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.3;
      let current = heads[0].id;
      for (const h of heads) if (h.getBoundingClientRect().top <= line) current = h.id;
      links.forEach((a) => {
        const on = decodeURIComponent(a.hash.slice(1)) === current;
        a.classList.toggle("is-current", on);
        if (on) a.setAttribute("aria-current", "location");
        else a.removeAttribute("aria-current");
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
  return null;
}

/* Counts the leading number of a metric up once when it scrolls into view
   ("3,684" → 0…3,684). Non-numeric values render as-is. */
export function CountUp({ value }: { value: string }) {
  const m = /^([^0-9]*)([0-9][0-9,]*(?:\.[0-9]+)?)(.*)$/.exec(value);
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    if (!m || !ref.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const [, pre, num, post] = m;
    const target = parseFloat(num.replace(/,/g, ""));
    if (!isFinite(target) || target < 2) return;
    const decimals = (num.split(".")[1] || "").length;
    const fmt = (v: number) =>
      pre + v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: num.includes(",") }) + post;
    const el = ref.current;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return; // already visible: no jump
    setDisplay(fmt(0));
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / 1100);
        const eased = 1 - Math.pow(1 - p, 3);
        setDisplay(p < 1 ? fmt(target * eased) : value);
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <span ref={ref}>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true">{display}</span>
    </span>
  );
}

/* Client-side category filter for /work. Links work without JS (all cards
   are rendered); with JS the ?category= param filters in place. */
export function WorkFilters({ categories }: { categories: { key: string; label: string; count: number }[] }) {
  const [active, setActive] = useState("all");
  useEffect(() => {
    const read = () => {
      const c = new URLSearchParams(location.search).get("category");
      setActive(c && categories.some((x) => x.key === c) ? c : "all");
    };
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, [categories]);
  useEffect(() => {
    document.querySelectorAll<HTMLElement>("[data-category]").forEach((el) => {
      el.hidden = active !== "all" && el.dataset.category !== active;
    });
    const empty = document.querySelector<HTMLElement>("[data-grid-empty]");
    if (empty) {
      const anyVisible = Array.from(document.querySelectorAll<HTMLElement>(".case-list [data-category]")).some((el) => !el.hidden);
      empty.hidden = anyVisible;
    }
  }, [active]);
  const pick = (key: string) => (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    setActive(key);
    const url = key === "all" ? location.pathname : `${location.pathname}?category=${key}`;
    history.pushState(null, "", url);
  };
  const all = categories.reduce((n, c) => n + c.count, 0);
  return (
    <nav className="work-filters" aria-label="Filter case studies">
      <a href="/work" className={"filter-chip" + (active === "all" ? " is-active" : "")} aria-current={active === "all" ? "true" : undefined} onClick={pick("all")}>
        All <span className="count">{all}</span>
      </a>
      {categories.map((c) => (
        <a
          key={c.key}
          href={`/work?category=${c.key}`}
          className={"filter-chip" + (active === c.key ? " is-active" : "")}
          aria-current={active === c.key ? "true" : undefined}
          onClick={pick(c.key)}
        >
          {c.label} <span className="count">{c.count}</span>
        </a>
      ))}
    </nav>
  );
}

/* Case studies always open at the very top, whether reached by a link,
   prev/next, related cards or back/forward. A #section deep link is left
   alone. Runs again on the next frame because Next.js applies its own
   scroll after commit (to the segment, below the sticky nav). */
export function ScrollToTop() {
  const pathname = usePathname();
  useEffect(() => {
    // Stop the browser restoring an old position on back/forward.
    const prev = history.scrollRestoration;
    history.scrollRestoration = "manual";
    const restore = () => {
      history.scrollRestoration = prev;
    };
    if (window.location.hash) return restore;
    const toTop = () => {
      const lenis = (window as unknown as { __lenis?: { scrollTo: (y: number, o: object) => void } }).__lenis;
      if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    };
    toTop();
    const raf = requestAnimationFrame(toTop);
    const t = setTimeout(toTop, 60);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
      restore();
    };
  }, [pathname]);
  return null;
}

/* Floating "back to top" button for long reads. Appears once the reader
   has scrolled past the header; a ring around it fills with progress. */
export function BackToTop() {
  const [show, setShow] = useState(false);
  const ringRef = useRef<SVGCircleElement>(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setShow(y > 480);
      const p = max > 0 ? Math.min(1, y / max) : 0;
      if (ringRef.current) ringRef.current.style.strokeDashoffset = String(113.1 * (1 - p));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  const toTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenis = (window as unknown as { __lenis?: { scrollTo: (y: number, o: object) => void } }).__lenis;
    if (lenis && !reduce) lenis.scrollTo(0, { duration: 1.1 });
    else window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    (document.getElementById("main") as HTMLElement | null)?.focus({ preventScroll: true });
  };
  return (
    <button
      type="button"
      className={"to-top" + (show ? " is-shown" : "")}
      onClick={toTop}
      aria-label="Back to top"
      tabIndex={show ? 0 : -1}
    >
      <svg className="to-top-ring" viewBox="0 0 40 40" aria-hidden="true">
        <circle cx="20" cy="20" r="18" className="track" />
        <circle cx="20" cy="20" r="18" className="fill" ref={ringRef} />
      </svg>
      <svg className="to-top-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M8 13V3M4 7l4-4 4 4" />
      </svg>
    </button>
  );
}
