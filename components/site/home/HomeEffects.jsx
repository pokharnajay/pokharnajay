"use client";
import { useEffect } from "react";
import { PENDING_SECTION_KEY, smoothScrollToId, useReveal } from "@/lib/motion";

/* Homepage-only behaviour: Lenis smooth scroll (desktop, motion allowed),
   smooth in-page anchor routing that clears the sticky nav, and scroll
   reveals. */
export default function HomeEffects() {
  useReveal();

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let lenis = null;
    let raf = 0;
    let cancelled = false;

    if (fine && !reduce) {
      import("lenis").then(({ default: Lenis }) => {
        if (cancelled) return;
        lenis = new Lenis({
          duration: 1.1,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
        });
        window.__lenis = lenis;
        const loop = (time) => {
          lenis.raf(time);
          raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
      });
    }

    /* Same-page anchors ("#x" or "/#x") scroll smoothly instead of jumping. */
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = e.target.closest && e.target.closest('a[href^="#"], a[href^="/#"]');
      if (!a) return;
      const id = a.getAttribute("href").split("#")[1];
      const tgt = id ? document.getElementById(id) : null;
      if (!tgt) return;
      e.preventDefault();
      smoothScrollToId(id);
      // Move focus for keyboard and screen-reader users.
      if (!tgt.hasAttribute("tabindex")) tgt.setAttribute("tabindex", "-1");
      tgt.focus({ preventScroll: true });
    };
    document.addEventListener("click", onClick);

    /* Arrived from another page via a nav section link: start at the top,
       then glide down once smooth scrolling is ready. */
    let pendingTimer = 0;
    try {
      const pending = sessionStorage.getItem(PENDING_SECTION_KEY);
      if (pending) {
        window.scrollTo(0, 0);
        // Clear the key only when the scroll fires, so a dev-mode
        // remount (which cancels this timer) still finds it.
        // On desktop wait (briefly) for Lenis so the glide is Lenis-driven.
        const wantsLenis = fine && !reduce;
        let tries = 0;
        const go = () => {
          if (wantsLenis && !window.__lenis && tries++ < 15) {
            pendingTimer = window.setTimeout(go, 100);
            return;
          }
          try {
            sessionStorage.removeItem(PENDING_SECTION_KEY);
          } catch {}
          smoothScrollToId(pending);
        };
        pendingTimer = window.setTimeout(go, 350);
      }
    } catch {}

    return () => {
      cancelled = true;
      clearTimeout(pendingTimer);
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(raf);
      if (lenis) {
        lenis.destroy();
        if (window.__lenis === lenis) delete window.__lenis;
      }
    };
  }, []);

  return null;
}
