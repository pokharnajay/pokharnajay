"use client";
import { Fragment, useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";
import { GRAPH_EDGES, GRAPH_NODES, nodePosition, ringIndex } from "./graphModel";

/* Static projection of the agent graph: the server-rendered default and the
   only version on phones, low-power devices and with reduced motion. */
const { counts, index } = ringIndex();
const ROT_Y = 0.55;
const ROT_X = 0.18;
function project([x, y, z]) {
  const cx = x * Math.cos(ROT_Y) + z * Math.sin(ROT_Y);
  const cz = -x * Math.sin(ROT_Y) + z * Math.cos(ROT_Y);
  const cy = y * Math.cos(ROT_X) - cz * Math.sin(ROT_X);
  const zz = y * Math.sin(ROT_X) + cz * Math.cos(ROT_X);
  const s = 14 / (14 - zz);
  return { x: 260 + cx * 46 * s, y: 250 - cy * 46 * s, s, z: zz };
}
const P = Object.fromEntries(GRAPH_NODES.map((n) => [n.id, project(nodePosition(n, index[n.id], counts[n.ring], 0))]));

function GraphStatic() {
  return (
    <svg className="graph-static" viewBox="-30 40 620 430" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="gHalo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#12b76a" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#12b76a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="gCore" cx="38%" cy="32%" r="70%">
          <stop offset="0%" stopColor="#5fe0a1" />
          <stop offset="100%" stopColor="#087443" />
        </radialGradient>
      </defs>
      <ellipse cx="260" cy="250" rx="118" ry="44" fill="none" stroke="#dbe4df" />
      <ellipse cx="260" cy="250" rx="210" ry="74" fill="none" stroke="#e3eae6" />
      {GRAPH_EDGES.map(([a, b]) => {
        const A = P[a], B = P[b];
        const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2 - 22;
        return <path key={a + b} d={`M${A.x} ${A.y} Q${mx} ${my} ${B.x} ${B.y}`} fill="none" stroke="#b4c4ba" strokeWidth="1.2" className="g-edge" />;
      })}
      <circle cx="260" cy="250" r="104" fill="url(#gHalo)" />
      <circle cx="260" cy="250" r="30" fill="url(#gCore)" />
      {GRAPH_NODES.filter((n) => n.ring > 0).map((n) => {
        const p = P[n.id];
        return (
          <g key={n.id}>
            <circle cx={p.x} cy={p.y} r={(n.ring === 1 ? 8 : 6) * p.s} fill={n.ring === 1 ? "#087443" : "#0d1b14"} />
            <text x={p.x + 12} y={p.y + 4} className="g-static-label">{n.label}</text>
          </g>
        );
      })}
      <text x="260" y="306" textAnchor="middle" className="g-static-label is-core">LLM agent</text>
    </svg>
  );
}

export default function Hero() {
  const canvasRef = useRef(null);
  const labelRef = useRef(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 960px) and (hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const conn = navigator.connection;
    const lowPower = (conn && conn.saveData) || (navigator.hardwareConcurrency || 8) <= 2 || (navigator.deviceMemory || 8) <= 2;
    if (!desktop || reduce || lowPower) return;
    let dispose = null;
    let cancelled = false;
    const boot = () =>
      import("./heroGraph")
        .then(({ initHeroGraph }) => initHeroGraph(canvasRef.current, labelRef.current))
        .then((d) => {
          if (cancelled) d();
          else {
            dispose = d;
            setLive(true);
          }
        })
        .catch(() => {});
    const ric = window.requestIdleCallback;
    const handle = ric ? ric(boot, { timeout: 1800 }) : setTimeout(boot, 600);
    return () => {
      cancelled = true;
      if (ric) window.cancelIdleCallback(handle);
      else clearTimeout(handle);
      if (dispose) dispose();
    };
  }, []);

  return (
    <section className="hero" id="top">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <p className="hero-hello">
            <span className="dot-live" aria-hidden="true"></span>
            <span>{site.name} | AI engineer</span>
          </p>
          <h1 className="h-display hero-title">
            {"AI agents and automations that hold up in production.".split(" ").map((w, i) => (
              <Fragment key={i}>
                <span className="w" style={{ "--i": i }}><span>{w}</span></span>{" "}
              </Fragment>
            ))}
          </h1>
          <p className="lead hero-lead">
            I build LLM agents, RAG systems and document pipelines, then wire them into real operations with n8n, Make.com and custom code. I&rsquo;ve contributed to 3,000+ automations for 70+ clients in the US, UK and Europe.
          </p>
          <div className="hero-actions">
            <a href="/work" className="btn btn-primary">See case studies</a>
            <a href={site.resume} className="btn btn-ghost">Download resume</a>
          </div>
          <p className="hero-note">Open to full-time remote AI engineering roles and select projects.</p>
        </div>

        <div className={"hero-visual" + (live ? " is-live" : "")} aria-hidden="true">
          <GraphStatic />
          <div className="hero-canvas" ref={canvasRef}></div>
          <div className="hero-labels" ref={labelRef}></div>
        </div>
      </div>
    </section>
  );
}
