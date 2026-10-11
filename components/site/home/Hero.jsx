"use client";
import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";

/* Static wireframe globe (SVG) — the server-rendered default, and the only
   visual on phones, low-power devices and with reduced motion. Desktop swaps
   in the live three.js scene once the page is idle. */
const PHI = (1 + Math.sqrt(5)) / 2;
const ICO = [
  [0, 1, PHI], [0, -1, PHI], [0, 1, -PHI], [0, -1, -PHI],
  [1, PHI, 0], [-1, PHI, 0], [1, -PHI, 0], [-1, -PHI, 0],
  [PHI, 0, 1], [-PHI, 0, 1], [PHI, 0, -1], [-PHI, 0, -1],
];
const rot = ([x, y, z]) => {
  const a = 0.5, b = 0.35;
  const x1 = x * Math.cos(a) + z * Math.sin(a);
  const z1 = -x * Math.sin(a) + z * Math.cos(a);
  const y2 = y * Math.cos(b) - z1 * Math.sin(b);
  return [x1, y2];
};
const P = ICO.map(rot).map(([x, y]) => [100 + x * 38, 100 + y * 38]);
const EDGES = [];
for (let i = 0; i < ICO.length; i++)
  for (let j = i + 1; j < ICO.length; j++) {
    const d = Math.hypot(ICO[i][0] - ICO[j][0], ICO[i][1] - ICO[j][1], ICO[i][2] - ICO[j][2]);
    if (Math.abs(d - 2) < 0.01) EDGES.push([i, j]);
  }
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const DOTS = Array.from({ length: 70 }, () => {
  const ang = rnd() * Math.PI * 2;
  const r = 60 + rnd() * 38;
  return [100 + Math.cos(ang) * r * 1.0, 100 + Math.sin(ang) * r * 0.62, 0.3 + rnd() * 0.7];
});

function HeroStatic() {
  return (
    <svg className="hero-static" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="heroGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a3ff12" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#a3ff12" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="96" fill="url(#heroGlow)" />
      {DOTS.map(([x, y, o], i) => (
        <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r="0.7" fill="#a3ff12" opacity={(o * 0.7).toFixed(2)} />
      ))}
      {EDGES.map(([a, b], i) => (
        <line
          key={i}
          x1={P[a][0].toFixed(1)}
          y1={P[a][1].toFixed(1)}
          x2={P[b][0].toFixed(1)}
          y2={P[b][1].toFixed(1)}
          stroke="#a3ff12"
          strokeWidth="0.35"
          opacity="0.45"
        />
      ))}
    </svg>
  );
}

export default function Hero() {
  const canvasRef = useRef(null);
  const anchorRef = useRef(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 900px) and (hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const conn = navigator.connection;
    const lowPower =
      (conn && conn.saveData) || (navigator.hardwareConcurrency || 8) <= 2 || (navigator.deviceMemory || 8) <= 2;
    if (!desktop || reduce || lowPower) return;

    let dispose = null;
    let cancelled = false;
    const boot = () => {
      import("./heroCanvas")
        .then(({ initHeroCanvas }) => initHeroCanvas(canvasRef.current, anchorRef.current))
        .then((d) => {
          if (cancelled) d();
          else {
            dispose = d;
            setLive(true);
          }
        })
        .catch(() => {});
    };
    const ric = window.requestIdleCallback;
    const handle = ric ? ric(boot, { timeout: 2500 }) : setTimeout(boot, 800);
    return () => {
      cancelled = true;
      if (ric) window.cancelIdleCallback(handle);
      else clearTimeout(handle);
      if (dispose) dispose();
    };
  }, []);

  return (
    <section className="hero" id="top">
      <div className={"hero-canvas" + (live ? " is-live" : "")} ref={canvasRef} aria-hidden="true">
        <HeroStatic />
      </div>
      <div className="hero-vignette" aria-hidden="true"></div>
      <div className="hero-inner">
        <p className="hero-tag">{site.jobTitle} / LLM agents · RAG · automation</p>

        <div className="hero-mid">
          <h1 className="hero-headline">
            <span className="row"><span style={{ "--i": 0 }}>AI &amp; Automation</span></span>
            <span className="row"><span style={{ "--i": 1 }} className="outline" ref={anchorRef}>that runs</span></span>
            <span className="row"><span style={{ "--i": 2 }}>in <span className="accent">production.</span></span></span>
          </h1>
        </div>

        <div className="hero-bottom">
          <p className="hero-bio">
            <strong>Jay Pokharna.</strong> {site.jobTitle} at <strong>{site.employer.name}</strong>. I build AI agents and the automation systems around them — half code, half visual platforms, all production-grade.
          </p>
          <dl className="hero-stats">
            <div className="stat"><dt>Automations contributed to</dt><dd className="v accent">3,000+</dd></div>
            <div className="stat"><dt>Clients served</dt><dd className="v">70+</dd></div>
            <div className="stat"><dt>Focus</dt><dd className="v">Agents · RAG</dd></div>
            <div className="stat"><dt>Based</dt><dd className="v">{site.location.label}</dd></div>
          </dl>
          <div className="hero-cta-wrap">
            <a href="#contact" className="btn primary">Start a project <span className="arrow" aria-hidden="true">↗</span></a>
            <a href="#scenes" className="btn">See how I work</a>
            <a href={site.resume} className="hero-resume">Hiring? View my resume <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </div>
    </section>
  );
}
