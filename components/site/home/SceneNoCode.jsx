"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useReducedMotion, useSceneActive } from "@/lib/motion";

/* Scene 03 — a Make/n8n-style workflow. Data pulses travel the edges stage by
   stage (BFS from the trigger) and light up nodes as they arrive. The loop
   only runs while the scene is visible; reduced motion shows every node lit. */

const NODES = [
  { id: "trigger", label: "Webhook In", x: 8, y: 30, badge: "TRG" },
  { id: "router", label: "Router", x: 32, y: 50, badge: "MK" },
  { id: "airtable", label: "Airtable Find", x: 60, y: 22, badge: "DB" },
  { id: "filter", label: "Filter", x: 60, y: 50, badge: "FX" },
  { id: "slack", label: "Slack Notify", x: 60, y: 78, badge: "SL" },
  { id: "stripe", label: "Stripe Charge", x: 88, y: 32, badge: "$" },
  { id: "sms", label: "ClickSend SMS", x: 88, y: 68, badge: "SMS" },
];
const EDGES = [
  ["trigger", "router"], // stage 0
  ["router", "airtable"], // stage 1
  ["router", "filter"],
  ["router", "slack"],
  ["airtable", "stripe"], // stage 2
  ["filter", "stripe"],
  ["filter", "sms"],
];
const MAP = Object.fromEntries(NODES.map((n) => [n.id, n]));
const STAGES = [[0], [1, 2, 3], [4, 5, 6]];
const STAGE_DUR = 1.5;
const STAGE_GAP = 0.45;
const PAUSE = 1.6;

// Cubic bezier matching the path d="M A C C1 C2 B"
const at = (a, b, t) => {
  const c1x = (a.x + b.x) / 2, c1y = a.y;
  const c2x = (a.x + b.x) / 2, c2y = b.y;
  const u = 1 - t;
  return {
    x: u * u * u * a.x + 3 * u * u * t * c1x + 3 * u * t * t * c2x + t * t * t * b.x,
    y: u * u * u * a.y + 3 * u * u * t * c1y + 3 * u * t * t * c2y + t * t * t * b.y,
  };
};

export default function SceneNoCode() {
  const svgRef = useRef(null);
  const graphRef = useRef(null);
  const reduced = useReducedMotion();
  const active = useSceneActive(graphRef);

  useEffect(() => {
    const graph = graphRef.current;
    const svg = svgRef.current;
    if (!graph || !svg) return;
    const nodeEls = {};
    graph.querySelectorAll("[data-node]").forEach((el) => (nodeEls[el.dataset.node] = el));
    const pulses = svg.querySelectorAll(".ng-pulse");
    const setHot = (id, on) => nodeEls[id] && nodeEls[id].classList.toggle("hot", on);

    if (reduced) {
      NODES.forEach((n) => setHot(n.id, true));
      pulses.forEach((p) => (p.style.opacity = "0"));
      return;
    }
    if (!active) return;

    const stageOf = [];
    STAGES.forEach((s, i) => s.forEach((e) => (stageOf[e] = i)));
    const totalDur = STAGES.length * STAGE_DUR + (STAGES.length - 1) * STAGE_GAP + PAUSE;
    const arrivals = EDGES.map((_, i) => stageOf[i] * (STAGE_DUR + STAGE_GAP) + STAGE_DUR * 0.92);

    let raf = 0;
    let cycleStart = performance.now();
    NODES.forEach((n) => setHot(n.id, false));
    const tick = (now) => {
      let phase = (now - cycleStart) / 1000;
      if (phase >= totalDur) {
        cycleStart = now;
        phase = 0;
        NODES.forEach((n) => setHot(n.id, false));
      }
      for (let i = 0; i < EDGES.length; i++) {
        const start = stageOf[i] * (STAGE_DUR + STAGE_GAP);
        const el = pulses[i];
        if (phase < start || phase > start + STAGE_DUR) {
          el.style.opacity = "0";
          continue;
        }
        const t = (phase - start) / STAGE_DUR;
        el.style.opacity = String(Math.max(0, Math.min(1, t < 0.06 ? t / 0.06 : t > 0.92 ? (1 - t) / 0.08 : 1)));
        const p = at(MAP[EDGES[i][0]], MAP[EDGES[i][1]], t);
        el.setAttribute("cx", p.x.toFixed(2));
        el.setAttribute("cy", p.y.toFixed(2));
      }
      setHot("trigger", true);
      for (let i = 0; i < EDGES.length; i++) if (phase >= arrivals[i]) setHot(EDGES[i][1], true);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, reduced]);

  return (
    <div className="scene" data-scene="2" id="scene-nocode">
      <div className="scene-text">
        <div className="eyebrow"><span className="dot" aria-hidden="true"></span> Scene 03 / No-code automations</div>
        <h2 className="scene-h">No-code, <em>orchestrated</em>.</h2>
        <p className="scene-body">
          When the team owning the workflow needs to read &amp; edit it, when business rules will keep changing, when integrations are well-supported — that&rsquo;s where <strong>Make.com, n8n, Zapier, GoHighLevel</strong> earn their keep. Sequential logic, fast iteration, visible to everyone.
        </p>
        <div className="scene-meta">
          <span className="chip hot">Make.com · 200+ scenarios</span>
          <span className="chip">n8n self-hosted</span>
          <span className="chip">Airtable</span>
          <span className="chip">GHL</span>
          <span className="chip">Cal.com</span>
        </div>
        <Link href="/work/make-com-airtable-automation-system" className="scene-link">
          See a real example <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="scene-visual">
        <div
          className="nodegraph"
          ref={graphRef}
          role="img"
          aria-label="Workflow diagram: a webhook trigger feeds a router, which branches to an Airtable lookup, a filter and a Slack notification; results flow on to a Stripe charge and a ClickSend SMS."
        >
          <svg ref={svgRef} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M0,0 L10,5 L0,10 z" fill="#a3ff12" />
              </marker>
            </defs>
            {EDGES.map(([a, b], i) => {
              const A = MAP[a], B = MAP[b];
              return (
                <path
                  key={i}
                  d={`M ${A.x} ${A.y} C ${(A.x + B.x) / 2} ${A.y}, ${(A.x + B.x) / 2} ${B.y}, ${B.x} ${B.y}`}
                  stroke="#a3ff12"
                  strokeWidth="0.18"
                  fill="none"
                  opacity="0.5"
                  strokeDasharray="0.5 0.5"
                  markerEnd="url(#arr)"
                  className="ng-edge"
                />
              );
            })}
            {/* Ellipse rx/ry compensates for preserveAspectRatio="none" on a
                16:9 box so pulses render as circles. ry / rx = 16 / 9. */}
            {EDGES.map((_, i) => (
              <ellipse key={`pulse-${i}`} className="ng-pulse" rx="0.9" ry="1.6" fill="#a3ff12" opacity="0" />
            ))}
          </svg>
          {NODES.map((n) => (
            <div key={n.id} data-node={n.id} className="node" style={{ left: n.x + "%", top: n.y + "%" }} aria-hidden="true">
              <span className="icon">{n.badge[0]}</span>
              <span className="lbl">{n.label}</span>
              <span className="badge">{n.badge}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
