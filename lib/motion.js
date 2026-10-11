"use client";
import { useEffect, useState } from "react";

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(REDUCED_MOTION_QUERY);
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reduced;
}

/* True while a scene's visual should animate: it must be on screen and, when
   the scenes are pinned (desktop), also be the scene currently shown. Keeps
   off-screen typewriters and rAF loops from burning CPU. */
export function useSceneActive(ref) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const scene = el.closest(".scene") || el;
    const wrap = scene.closest(".scenes-wrap");
    let inView = false;
    const update = () => {
      const pinned = wrap && wrap.classList.contains("is-pinned");
      setActive(inView && (!pinned || scene.classList.contains("is-active")));
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        update();
      },
      { threshold: 0.15 }
    );
    io.observe(scene);
    const mo = new MutationObserver(update);
    mo.observe(scene, { attributes: true, attributeFilter: ["class"] });
    if (wrap) mo.observe(wrap, { attributes: true, attributeFilter: ["class"] });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [ref]);
  return active;
}

/* Adds .is-in to [data-reveal] elements once they scroll into view; CSS does
   the fade/slide. Elements are visible by default (no-JS, reduced motion). */
export function useReveal(rootSelector = "[data-reveal]", key = "") {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(rootSelector));
    if (!els.length) return;
    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    document.documentElement.classList.add("reveal-ready");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
    );
    els.forEach((el) => {
      if (el.classList.contains("is-in")) return;
      // Anything already above the fold reveals immediately.
      if (el.getBoundingClientRect().top < window.innerHeight * 0.9) el.classList.add("is-in");
      else io.observe(el);
    });
    return () => io.disconnect();
  }, [rootSelector, key]);
}
