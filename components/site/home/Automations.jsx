"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useReducedMotion, useSceneActive } from "@/lib/motion";

/* A Make/n8n-style canvas on a 3D plane. The plane straightens as it
   scrolls into view; data pulses travel the edges stage by stage and light
   each node as they arrive. Loops only while visible; reduced motion shows
   every node lit on a fixed tilt. */

const NODES = [
  { id: "trigger", label: "Form submitted", app: "Webhook", x: 9, y: 50 },
  { id: "router", label: "Route by source", app: "Router", x: 30, y: 50 },
  { id: "ai", label: "Classify intent", app: "OpenAI", x: 54, y: 20, ai: true },
  { id: "db", label: "Upsert lead", app: "Airtable", x: 54, y: 50 },
  { id: "filter", label: "High intent only", app: "Filter", x: 54, y: 80 },
  { id: "slack", label: "Alert sales", app: "Slack", x: 82, y: 28 },
  { id: "crm", label: "Create deal", app: "CRM", x: 82, y: 70 },
];
const EDGES = [
  ["trigger", "router"],
  ["router", "ai"],
  ["router", "db"],
  ["router", "filter"],
  ["ai", "slack"],
  ["db", "crm"],
  ["filter", "crm"],
];
const MAP = Object.fromEntries(NODES.map((n) => [n.id, n]));
const STAGES = [[0], [1, 2, 3], [4, 5, 6]];
const STAGE_DUR = 1.3;
const STAGE_GAP = 0.35;
const PAUSE = 1.8;

const bez = (a, b, t) => {
  const c1x = (a.x + b.x) / 2, c2x = c1x;
  const u = 1 - t;
  return {
    x: u * u * u * a.x + 3 * u * u * t * c1x + 3 * u * t * t * c2x + t * t * t * b.x,
    y: u * u * u * a.y + 3 * u * u * t * a.y + 3 * u * t * t * b.y + t * t * t * b.y,
  };
};

export default function Automations() {
  const sectionRef = useRef(null);
  const planeRef = useRef(null);
  const svgRef = useRef(null);
  const reduced = useReducedMotion();
  const active = useSceneActive(planeRef);

  /* Scroll-linked tilt. */
  useEffect(() => {
    const sec = sectionRef.current;
    const plane = planeRef.current;
    if (!sec || !plane) return;
    if (reduced) {
      plane.style.setProperty("--rx", "14deg");
      plane.style.setProperty("--rz", "-3deg");
      return;
    }
    let raf = 0;
    let on = false;
    const update = () => {
      raf = 0;
      const r = sec.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.max(0, Math.min(1, (vh - r.top) / (vh + r.height * 0.6)));
      const e = 1 - Math.pow(1 - p, 2);
      plane.style.setProperty("--rx", `${(34 - e * 22).toFixed(2)}deg`);
      plane.style.setProperty("--rz", `${(-9 + e * 6).toFixed(2)}deg`);
      plane.style.setProperty("--lift", `${(60 - e * 60).toFixed(1)}px`);
    };
    const onScroll = () => on && !raf && (raf = requestAnimationFrame(update));
    const io = new IntersectionObserver(([en]) => {
      on = en.isIntersecting;
      if (on) update();
    });
    io.observe(sec);
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  /* Data pulses + node lighting. */
  useEffect(() => {
    const plane = planeRef.current;
    const svg = svgRef.current;
    if (!plane || !svg) return;
    const nodeEls = {};
    plane.querySelectorAll("[data-node]").forEach((el) => (nodeEls[el.dataset.node] = el));
    const pulses = svg.querySelectorAll(".wf-pulse");
    const setHot = (id, on) => nodeEls[id] && nodeEls[id].classList.toggle("is-hot", on);
    if (reduced) {
      NODES.forEach((n) => setHot(n.id, true));
      return;
    }
    if (!active) return;
    const stageOf = [];
    STAGES.forEach((s, i) => s.forEach((e) => (stageOf[e] = i)));
    const total = STAGES.length * STAGE_DUR + (STAGES.length - 1) * STAGE_GAP + PAUSE;
    const arrive = EDGES.map((_, i) => stageOf[i] * (STAGE_DUR + STAGE_GAP) + STAGE_DUR * 0.92);
    let raf = 0;
    let start = performance.now();
    NODES.forEach((n) => setHot(n.id, false));
    const tick = (now) => {
      let ph = (now - start) / 1000;
      if (ph >= total) {
        start = now;
        ph = 0;
        NODES.forEach((n) => setHot(n.id, false));
      }
      for (let i = 0; i < EDGES.length; i++) {
        const s0 = stageOf[i] * (STAGE_DUR + STAGE_GAP);
        const el = pulses[i];
        if (ph < s0 || ph > s0 + STAGE_DUR) {
          el.style.opacity = "0";
          continue;
        }
        const t = (ph - s0) / STAGE_DUR;
        el.style.opacity = String(t < 0.08 ? t / 0.08 : t > 0.92 ? (1 - t) / 0.08 : 1);
        const p = bez(MAP[EDGES[i][0]], MAP[EDGES[i][1]], t);
        el.setAttribute("cx", p.x.toFixed(2));
        el.setAttribute("cy", p.y.toFixed(2));
      }
      setHot("trigger", true);
      for (let i = 0; i < EDGES.length; i++) if (ph >= arrive[i]) setHot(EDGES[i][1], true);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, reduced]);

  return (
    <section className="automations" id="automations" ref={sectionRef} aria-labelledby="auto-title">
      <div className="wrap">
        <div className="auto-head">
          <h2 className="h-section" id="auto-title">Workflows your team can read and run.</h2>
          <div className="auto-copy">
            <p className="lead">
              Visual platforms when the people who own a process need to see and change it. Custom code when the logic outgrows the canvas. Either way, every production flow gets error routes and alerts.
            </p>
            <ul className="auto-facts">
              <li><strong>200+</strong> Make.com scenarios built and maintained</li>
              <li><strong>Self-hosted n8n</strong> with Postgres and Cloudflare Tunnel</li>
              <li><strong>Zapier, GoHighLevel, Airtable</strong> where the client already lives</li>
            </ul>
            <Link href="/work/make-com-airtable-automation-system" className="text-link">Read the Make.com + Airtable case study</Link>
          </div>
        </div>

        <div className="wf-stage">
          <div
            className="wf-plane"
            ref={planeRef}
            role="img"
            aria-label="Workflow: a form submission is routed to an OpenAI intent classifier, an Airtable upsert and a high-intent filter; results alert sales in Slack and create a CRM deal."
          >
            <svg ref={svgRef} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {EDGES.map(([a, b], i) => {
                const A = MAP[a], B = MAP[b];
                return (
                  <path
                    key={i}
                    d={`M ${A.x} ${A.y} C ${(A.x + B.x) / 2} ${A.y}, ${(A.x + B.x) / 2} ${B.y}, ${B.x} ${B.y}`}
                    className="wf-edge"
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}
              {EDGES.map((_, i) => (
                <ellipse key={i} className="wf-pulse" rx="0.7" ry="1.25" opacity="0" />
              ))}
            </svg>
            {NODES.map((n) => (
              <div key={n.id} data-node={n.id} className={"wf-node" + (n.ai ? " is-ai" : "")} style={{ left: n.x + "%", top: n.y + "%" }} aria-hidden="true">
                <span className="wf-icon">{n.app[0]}</span>
                <span className="wf-text">
                  <span className="wf-app">{n.app}</span>
                  <span className="wf-label">{n.label}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
