"use client";
import { useEffect, useRef } from "react";

const GROUPS = [
  { name: "Models and AI", items: ["OpenAI API", "Anthropic Claude", "Gemini", "OpenRouter", "Embeddings", "AssemblyAI"] },
  { name: "Automation", items: ["n8n", "Make.com", "Zapier", "GoHighLevel"] },
  { name: "Data", items: ["Airtable", "PostgreSQL", "Google Sheets"] },
  { name: "Code and infrastructure", items: ["Python", "TypeScript", "Node.js", "Next.js", "Cloudflare Workers", "Docker"] },
];
const ALL = GROUPS.flatMap((g) => g.items.map((i) => ({ label: i, ai: g.name === "Models and AI" })));
const N = ALL.length;
/* Fibonacci sphere: evenly spread points. */
const BASE = ALL.map((_, i) => {
  const y = 1 - ((i + 0.5) / N) * 2;
  const r = Math.sqrt(1 - y * y);
  const th = i * Math.PI * (3 - Math.sqrt(5));
  return [Math.cos(th) * r, y, Math.sin(th) * r];
});

/* A 3D word sphere in plain CSS transforms: drifts on its own, follows a
   drag with inertia, and only animates while on screen. */
export default function StackSphere() {
  const stageRef = useRef(null);
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const els = Array.from(stage.querySelectorAll(".sphere-item"));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let ax = -0.35, ay = 0.4, vx = 0, vy = 0.0035;
    let dragging = false, lx = 0, ly = 0, raf = 0, on = false;

    const render = () => {
      const R = Math.min(stage.clientWidth, stage.clientHeight) * 0.4;
      const cx = Math.cos(ax), sx = Math.sin(ax), cy = Math.cos(ay), sy = Math.sin(ay);
      for (let i = 0; i < N; i++) {
        const [x, y, z] = BASE[i];
        const x1 = x * cy + z * sy;
        const z1 = -x * sy + z * cy;
        const y2 = y * cx - z1 * sx;
        const z2 = y * sx + z1 * cx;
        const depth = (z2 + 1) / 2; // 0 back → 1 front
        const s = 0.72 + depth * 0.38;
        const el = els[i];
        el.style.transform = `translate3d(${(x1 * R).toFixed(1)}px, ${(y2 * R).toFixed(1)}px, 0) translate(-50%, -50%) scale(${s.toFixed(3)})`;
        // Depth reads through scale and a quieter colour, not opacity, so
        // every label keeps AA contrast.
        el.style.zIndex = String(Math.round(depth * 100));
        el.classList.toggle("is-front", depth > 0.78);
        el.classList.toggle("is-back", depth < 0.42);
      }
    };
    const loop = () => {
      if (!dragging) {
        ay += vy;
        ax += vx;
        vx *= 0.94;
        vy += (0.0035 - vy) * 0.03;
        ax += (-0.35 - ax) * 0.01;
      }
      render();
      raf = on ? requestAnimationFrame(loop) : 0;
    };
    render();
    if (reduce) return;

    const io = new IntersectionObserver(([e]) => {
      on = e.isIntersecting;
      if (on && !raf) raf = requestAnimationFrame(loop);
    });
    io.observe(stage);
    const down = (e) => {
      dragging = true;
      lx = e.clientX;
      ly = e.clientY;
      stage.setPointerCapture(e.pointerId);
      stage.classList.add("is-dragging");
    };
    const move = (e) => {
      if (!dragging) return;
      const dx = e.clientX - lx, dy = e.clientY - ly;
      lx = e.clientX;
      ly = e.clientY;
      ay += dx * 0.006;
      ax -= dy * 0.006;
      vy = dx * 0.0012;
      vx = -dy * 0.0012;
    };
    const up = () => {
      dragging = false;
      stage.classList.remove("is-dragging");
    };
    stage.addEventListener("pointerdown", down);
    stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerup", up);
    stage.addEventListener("pointercancel", up);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      stage.removeEventListener("pointerdown", down);
      stage.removeEventListener("pointermove", move);
      stage.removeEventListener("pointerup", up);
      stage.removeEventListener("pointercancel", up);
    };
  }, []);

  return (
    <section className="stack" id="stack" aria-labelledby="stack-title">
      <div className="wrap stack-grid">
        <div>
          <h2 className="h-section" id="stack-title">The stack.</h2>
          <p className="lead">What I reach for, grouped by job. New tools take a few days to pick up; the patterns transfer.</p>
          <div className="stack-groups">
            {GROUPS.map((g) => (
              <div key={g.name} className="stack-group">
                <h3 className="stack-group-name">{g.name}</h3>
                <ul>
                  {g.items.map((i) => <li key={i} className={"tag" + (g.name === "Models and AI" ? " is-green" : "")}>{i}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="sphere" ref={stageRef} aria-hidden="true" title="Drag to rotate">
          <div className="sphere-core"></div>
          {ALL.map((t) => (
            <span key={t.label} className={"sphere-item" + (t.ai ? " is-ai" : "")}>{t.label}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
