"use client";
import { useEffect } from "react";

/* Animated tab icon: the JP mark with its green "live" dot breathing and
   sending out a soft halo, like an agent that's running. Drawn on a canvas
   and swapped into the page's icon links (GIF favicons only animate in
   Firefox; this works in Chrome, Edge and Firefox). Static with reduced
   motion. Tuned to read at 16px, so the pulse is deliberately bold. */
export default function AnimatedFavicon() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const SELECTOR = 'link[rel="icon"], link[rel="shortcut icon"]';
    const original = Array.from(document.querySelectorAll(SELECTOR)).map((l) => [l, l.getAttribute("href"), l.getAttribute("type")]);
    if (!original.length) return;

    const S = 64;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = S;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const family = getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";
    const PERIOD = 2200;
    const cx = 48, cy = 48;

    const draw = (t) => {
      const p = (t % PERIOD) / PERIOD;
      // One continuous sine drives everything: no resets, so no jumps.
      const breathe = 0.5 - 0.5 * Math.cos(p * Math.PI * 2);
      ctx.clearRect(0, 0, S, S);
      // Mark: dark rounded square.
      ctx.fillStyle = "#0d1b14";
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(0, 0, S, S, 14);
      else ctx.rect(0, 0, S, S);
      ctx.fill();
      // Halo under the letters so "JP" stays crisp.
      ctx.save();
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(0, 0, S, S, 14);
      else ctx.rect(0, 0, S, S);
      ctx.clip();
      ctx.fillStyle = `rgba(46,229,157,${0.45 * breathe})`;
      ctx.beginPath();
      ctx.arc(cx, cy, 10 + breathe * 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = "#ffffff";
      ctx.font = `700 28px ${family}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("JP", S / 2 - 4, S / 2 - 3);
      // Live dot: breathes in size and brightness (deep green → bright mint).
      const mix = (a, b) => Math.round(a + (b - a) * breathe);
      ctx.fillStyle = `rgb(${mix(10, 70)},${mix(120, 255)},${mix(70, 170)})`;
      ctx.beginPath();
      ctx.arc(cx, cy, 9 + breathe * 2, 0, Math.PI * 2);
      ctx.fill();
      const url = canvas.toDataURL("image/png");
      // Re-query each frame: Next can swap head tags on navigation.
      for (const l of document.querySelectorAll(SELECTOR)) {
        if (l.getAttribute("type") !== "image/png") l.setAttribute("type", "image/png");
        l.setAttribute("href", url);
      }
    };

    const t0 = performance.now();
    // ~25 fps; background tabs get throttled anyway.
    const id = window.setInterval(() => draw(performance.now() - t0), 40);
    draw(0);
    return () => {
      clearInterval(id);
      for (const [l, href, type] of original) {
        if (href) l.setAttribute("href", href);
        if (type) l.setAttribute("type", type);
      }
    };
  }, []);
  return null;
}
