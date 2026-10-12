"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";

/* Auto-scroll: glides from the current position to the bottom of the page at
   a constant reading pace (~250px/s, clamped to 10–40s). It only ever starts
   from an explicit click and stops on any wheel, touch, key or pointer input. */
function useAutoScroll() {
  const [running, setRunning] = useState(false);
  const stopRef = useRef(null);

  const stop = () => {
    if (stopRef.current) stopRef.current();
    stopRef.current = null;
    setRunning(false);
  };

  const start = () => {
    const target = document.documentElement.scrollHeight - window.innerHeight;
    const distance = Math.max(0, target - window.scrollY);
    if (distance < 4) return;
    const duration = Math.min(40, Math.max(10, distance / 250));
    let raf = 0;
    let cancelled = false;

    const lenis = window.__lenis;
    if (lenis) {
      lenis.scrollTo(target, { duration, easing: (t) => t, onComplete: () => stop() });
    } else {
      const from = window.scrollY;
      const t0 = performance.now();
      const tick = (now) => {
        if (cancelled) return;
        const p = Math.min(1, (now - t0) / (duration * 1000));
        window.scrollTo(0, from + (target - from) * p);
        if (p < 1) raf = requestAnimationFrame(tick);
        else stop();
      };
      raf = requestAnimationFrame(tick);
    }

    const interrupt = (e) => {
      if (e.target && e.target.closest && e.target.closest("[data-autoscroll-btn]")) return;
      stop();
    };
    const events = ["wheel", "touchstart", "keydown", "pointerdown"];
    // Registered on the next frame so the click that started it can't stop it.
    const reg = requestAnimationFrame(() => events.forEach((ev) => window.addEventListener(ev, interrupt, { passive: true })));

    stopRef.current = () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      cancelAnimationFrame(reg);
      events.forEach((ev) => window.removeEventListener(ev, interrupt));
      if (lenis) lenis.scrollTo(lenis.scroll ?? window.scrollY, { immediate: true });
    };
    setRunning(true);
  };

  useEffect(() => () => stopRef.current && stopRef.current(), []);
  return { running, toggle: () => (running ? stop() : start()) };
}

export default function Topbar() {
  const pathname = usePathname();
  const { running, toggle } = useAutoScroll();
  const isWork = pathname === "/work" || pathname?.startsWith("/work/");

  return (
    <header className="topbar">
      <a href="/#top" className="brand">
        <span className="brand-mark" aria-hidden="true">JP</span>
        <span className="brand-name">{site.name}</span>
      </a>
      <nav aria-label="Primary">
        <Link href="/work" aria-current={isWork ? "page" : undefined}>Case studies</Link>
        <a href="/#scenes" className="nav-how">How I work</a>
        <a href="/#tools" className="nav-stack">Stack</a>
        <a href="/#contact">Contact</a>
      </nav>
      <div className="status">
        <div className="status-row">
          <span className="dot" aria-hidden="true"></span>
          <span>{site.availability.status}</span>
        </div>
        <button
          type="button"
          className={"auto-scroll-btn" + (running ? " is-running" : "")}
          data-autoscroll-btn
          onClick={toggle}
          aria-pressed={running}
          aria-label={running ? "Stop auto-scroll" : "Auto-scroll to bottom"}
          title={running ? "Stop auto-scroll" : "Auto-scroll to bottom"}
        >
          <span className="auto-scroll-arrow" aria-hidden="true">{running ? "■" : "↓"}</span>
          <span className="auto-scroll-label">{running ? "Stop" : "Auto-scroll"}</span>
        </button>
      </div>
    </header>
  );
}
