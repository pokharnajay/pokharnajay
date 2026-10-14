"use client";
import { useEffect, useRef } from "react";

/* Pointer-driven 3D tilt. Fine pointers only, motion allowed only;
   otherwise a plain wrapper. */
export default function Tilt({ children, className = "", max = 6 }: { children: React.ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let tx = 0, ty = 0, x = 0, y = 0, inside = false;
    const loop = () => {
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      el.style.setProperty("--ry", `${(x * max).toFixed(2)}deg`);
      el.style.setProperty("--rx", `${(-y * max).toFixed(2)}deg`);
      raf = inside || Math.abs(x) + Math.abs(y) > 0.002 ? requestAnimationFrame(loop) : 0;
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width) * 2 - 1;
      ty = ((e.clientY - r.top) / r.height) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const onEnter = () => {
      inside = true;
      el.classList.add("is-tilting");
    };
    const onLeave = () => {
      inside = false;
      tx = ty = 0;
      el.classList.remove("is-tilting");
      if (!raf) raf = requestAnimationFrame(loop);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [max]);
  return (
    <div ref={ref} className={"tilt " + className}>
      {children}
    </div>
  );
}
