"use client";
import { useEffect, useRef } from "react";

/* Custom cursor: only for fine pointers with motion allowed. Until this runs
   (or when it doesn't), the OS cursor is untouched — CSS hides it only while
   <html> has the .has-cursor class. The ring's rAF loop sleeps once it has
   caught up with the pointer, so an idle page does no per-frame work. */
export default function CustomCursor() {
  const ringRef = useRef(null);
  const dotRef = useRef(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;

    let enabled = false;
    let x = -100, y = -100, rx = -100, ry = -100;
    let raf = 0;
    const html = document.documentElement;

    const loop = () => {
      rx += (x - rx) * 0.28;
      ry += (y - ry) * 0.28;
      ring.style.transform = `translate3d(${rx}px,${ry}px,0) translate(-50%,-50%)`;
      raf = Math.abs(x - rx) + Math.abs(y - ry) > 0.3 ? requestAnimationFrame(loop) : 0;
    };
    const onMove = (e) => {
      x = e.clientX;
      y = e.clientY;
      dot.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;
      html.classList.add("cursor-visible");
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const SELECTOR = "a, button, summary, label, [role='button'], [data-cursor]";
    const onOver = (e) => {
      if (e.target.closest && e.target.closest(SELECTOR)) html.classList.add("cursor-hover");
    };
    const onOut = (e) => {
      const from = e.target.closest && e.target.closest(SELECTOR);
      if (!from) return;
      const to = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(SELECTOR);
      if (!to) html.classList.remove("cursor-hover");
    };
    const onLeave = () => html.classList.remove("cursor-visible", "cursor-hover");

    const enable = () => {
      if (enabled) return;
      enabled = true;
      html.classList.add("has-cursor");
      window.addEventListener("mousemove", onMove, { passive: true });
      document.addEventListener("mouseover", onOver);
      document.addEventListener("mouseout", onOut);
      document.documentElement.addEventListener("mouseleave", onLeave);
      window.addEventListener("blur", onLeave);
    };
    const disable = () => {
      if (!enabled) return;
      enabled = false;
      html.classList.remove("has-cursor", "cursor-visible", "cursor-hover");
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("blur", onLeave);
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const sync = () => (fine.matches && !reduce.matches ? enable() : disable());
    sync();
    fine.addEventListener("change", sync);
    reduce.addEventListener("change", sync);
    return () => {
      fine.removeEventListener("change", sync);
      reduce.removeEventListener("change", sync);
      disable();
    };
  }, []);

  return (
    <>
      <div className="cursor-ring" ref={ringRef} aria-hidden="true"></div>
      <div className="cursor-dot" ref={dotRef} aria-hidden="true"></div>
    </>
  );
}
