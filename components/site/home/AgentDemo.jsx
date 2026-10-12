"use client";
import Link from "next/link";
import { createRef, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useReducedMotion, useSceneActive } from "@/lib/motion";

/* The agent-run demo: query → plan → retrieve → tool calls → grounded
   answer, in a terminal-style panel. Everything on screen is a pure function
   of one clock (t, in ms), so pausing off-screen, looping and the
   reduced-motion final state are trivial. The phase list beside it follows
   the same clock. */

const QUERY = "Which leads from last week haven't been followed up?";
const ANSWER =
  "4 leads from last week have had no follow-up since first contact. I drafted a personal follow-up for each (waiting in your review queue) and flagged the highest-intent one to #sales.";
const ANSWER_WORDS = ANSWER.split(" ");

const TRACE = [
  { label: "plan", note: "3 steps", at: [1900, 2600] },
  { label: "retrieve", note: "top-k 3", at: [2600, 3900], wide: true },
  { label: "tool: crm.search", note: "4 rows", at: [4100, 5100] },
  { label: "tool: email.draft", note: "4 drafts", at: [5300, 6300] },
  { label: "respond", note: "grounded", at: [6500, 9700] },
];
const CHUNKS = [
  { score: 0.92, src: "playbooks/follow-up-sla.md", text: "Every inbound lead gets a personal follow-up within 48h of first contact.", at: 2900 },
  { score: 0.87, src: "crm/lead-stages.md", text: "“Contacted” with no activity for 5+ days counts as stale.", at: 3150 },
  { score: 0.81, src: "sops/sales-handoff.md", text: "High-intent leads go to a rep the same day.", at: 3400 },
];
const TOOLS = [
  { name: "crm.search", args: '{ stage: "contacted", idle: ">5d" }', result: "4 leads", at: [4100, 5100] },
  { name: "email.draft", args: '{ leads: 4, tone: "personal" }', result: "4 drafts → review", at: [5300, 6300] },
];
const T = { typeStart: 200, typeEnd: 1700, agentOn: 1700, topChunk: 3800, answer: [6700, 9500], done: 9700, cycle: 13500 };
const END = T.cycle - 1;

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const stateOf = (t, [a, b]) => (t < a ? "idle" : t < b ? "run" : "done");

function useClock(active, reduced) {
  const [t, setT] = useState(reduced ? END : 0);
  const tRef = useRef(0);
  useEffect(() => {
    if (reduced) {
      setT(T.done + 1);
      return;
    }
    if (!active) return;
    let raf = 0;
    let last = performance.now();
    let lastPaint = 0;
    const loop = (now) => {
      tRef.current = (tRef.current + Math.min(64, now - last)) % T.cycle;
      last = now;
      // ~30fps is plenty for typing/streaming and halves React work.
      if (now - lastPaint > 33) {
        lastPaint = now;
        setT(tRef.current);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, reduced]);
  return t;
}

/* Connector paths between panels, measured from the DOM (desktop only). */
function useConnectors(bodyRef, refs) {
  const [paths, setPaths] = useState(null);
  const measure = useCallback(() => {
    const body = bodyRef.current;
    if (!body || window.innerWidth < 900) return setPaths(null);
    /* Layout offsets, not getBoundingClientRect: panels slide in with
       transforms and the pinned scene scales, neither of which should bend
       the wires. Every panel's offsetParent is .ar-body. */
    const r = (k) => {
      const el = refs[k].current;
      if (!el) return null;
      let x = 0, y = 0, n = el;
      while (n && n !== body) {
        x += n.offsetLeft;
        y += n.offsetTop;
        n = n.offsetParent;
      }
      const w = el.offsetWidth, h = el.offsetHeight;
      return { l: x, r: x + w, t: y, b: y + h, cx: Math.round(x + w / 2), cy: Math.round(y + h / 2) };
    };
    const q = r("query"), a = r("agent"), tr = r("trace"), rt = r("retrieval"), t1 = r("tool0"), t2 = r("tool1"), an = r("answer");
    if (!q || !a || !tr || !rt || !t1 || !t2 || !an) return setPaths(null);
    const v = (x1, y1, x2, y2) => `M ${x1} ${y1} C ${x1} ${(y1 + y2) / 2}, ${x2} ${(y1 + y2) / 2}, ${x2} ${y2}`;
    const hz = (x1, y1, x2, y2) => `M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`;
    const next = {
      w: body.offsetWidth,
      h: body.offsetHeight,
      qa: v(a.cx, q.b, a.cx, a.t),
      ar: hz(a.r, a.cy - 6, rt.l, rt.cy),
      at: hz(a.r, a.cy + 6, t1.l, t1.cy),
      tt: hz(t1.r, t1.cy, t2.l, t2.cy),
      // From below the trace (not through it) down to the answer.
      an: v(tr.l + 14, tr.b + 2, tr.l + 14, an.t),
    };
    setPaths((prev) => (prev && JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
  }, [bodyRef, refs]);
  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (bodyRef.current) ro.observe(bodyRef.current);
    return () => ro.disconnect();
  }, [measure, bodyRef]);
  return paths;
}


const PHASES = [
  { name: "Plan", text: "Breaks the request into steps before it touches anything.", at: TRACE[0].at },
  { name: "Retrieve", text: "Pulls the policies and records that matter, with sources it can cite.", at: TRACE[1].at },
  { name: "Act", text: "Calls your CRM, email and Slack through typed, validated functions.", at: [TOOLS[0].at[0], TOOLS[1].at[1]] },
  { name: "Answer", text: "Says what it did and why, and hands off to a person when unsure.", at: TRACE[4].at },
];

export default function AgentDemo() {
  const rootRef = useRef(null);
  const bodyRef = useRef(null);
  const refs = useRef(null);
  if (!refs.current) {
    refs.current = Object.fromEntries(["query", "agent", "trace", "retrieval", "tool0", "tool1", "answer"].map((k) => [k, createRef()]));
  }
  const reduced = useReducedMotion();
  const active = useSceneActive(rootRef);
  const t = useClock(active, reduced);
  const paths = useConnectors(bodyRef, refs.current);

  const typed = Math.round(clamp01((t - T.typeStart) / (T.typeEnd - T.typeStart)) * QUERY.length);
  const words = Math.round(clamp01((t - T.answer[0]) / (T.answer[1] - T.answer[0])) * ANSWER_WORDS.length);
  const running = t >= T.agentOn && t < T.done;
  const done = t >= T.done;
  const elapsed = Math.max(0, Math.min(t, T.done) - T.agentOn) / 1000;

  const edge = (from) => (t < from ? "" : " on");
  const flow = (range) => (stateOf(t, range) === "run" ? " flow" : "");


  return (
    <section className="band-dark agents" id="agents" aria-labelledby="agents-title">
      <div className="wrap agents-grid">
        <div className="agents-copy">
          <h2 className="h-section" id="agents-title">Agents that read, decide and act.</h2>
          <p className="lead">
            An agent is only useful when it&rsquo;s grounded in your data and can safely touch your systems. This is the shape of the ones I ship: retrieval for context, tool calls with guardrails, and evals that keep behaviour predictable.
          </p>
          <ol className="phases">
            {PHASES.map((p, i) => {
              const st = reduced ? "done" : stateOf(t, p.at);
              return (
                <li key={p.name} className={"phase st-" + st}>
                  <span className="phase-n">{i + 1}</span>
                  <div>
                    <div className="phase-name">{p.name}</div>
                    <div className="phase-text">{p.text}</div>
                  </div>
                </li>
              );
            })}
          </ol>
          <Link href="/work/ai-lead-scoring-airtable" className="text-link text-link-light">Read how I built AI lead scoring</Link>
        </div>

        <div
          className="agent-run"
          ref={rootRef}
          role="img"
          aria-label="Animated example of an AI agent run: a question about stale leads is planned, three policy documents are retrieved with similarity scores, the agent calls crm.search and email.draft, then streams a grounded answer."
        >
<div className="ar-window" aria-hidden="true">
            <div className="ar-head">
              <div className="dots"><span></span><span></span><span></span></div>
              <div className="ar-file">agent.run — lead-followup</div>
              <div className={"ar-status" + (done ? " is-done" : running ? " is-running" : "")}>
                {done ? `✓ done · ${elapsed.toFixed(1)}s` : running ? `● running · ${elapsed.toFixed(1)}s` : "○ idle"}
              </div>
            </div>

            <div className="ar-body" ref={bodyRef}>
              {paths ? (
                <svg className="ar-wires" viewBox={`0 0 ${paths.w} ${paths.h}`} width={paths.w} height={paths.h}>
                  {[
                    ["qa", T.agentOn, [T.typeEnd, T.agentOn + 400]],
                    ["ar", TRACE[1].at[0], TRACE[1].at],
                    ["at", TOOLS[0].at[0], TOOLS[0].at],
                    ["tt", TOOLS[1].at[0], TOOLS[1].at],
                    ["an", T.answer[0], T.answer],
                  ].map(([k, from, range]) => (
                    <g key={k} className={"ar-wire" + edge(from) + flow(range)}>
                      <path d={paths[k]} className="base" />
                      <path d={paths[k]} className="pulse" />
                    </g>
                  ))}
                </svg>
              ) : null}

              <div className="ar-query" ref={refs.current.query}>
                <span className="ar-label">▸ user</span>
                <span className="ar-query-text">
                  {QUERY.slice(0, typed)}
                  {typed < QUERY.length && t > 0 ? <span className="caret"></span> : null}
                </span>
              </div>

              <div className="ar-core">
                <div className={"ar-agent" + (t >= T.agentOn ? " hot" : "")} ref={refs.current.agent}>
                  <span className="icon">A</span>
                  <span className="lbl">Agent</span>
                  <span className="sub">planner · tool-use</span>
                </div>
                <ol className="ar-trace" ref={refs.current.trace}>
                  {TRACE.map((s) => {
                    const st = stateOf(t, s.at);
                    return (
                      <li key={s.label} className={"st-" + st + (s.wide ? " is-wide" : "")}>
                        <span className="tick">{st === "done" ? "✓" : st === "run" ? "›" : "·"}</span>
                        <span className="name">▸ {s.label}</span>
                        <span className="note">{st === "idle" ? "" : s.note}</span>
                      </li>
                    );
                  })}
                </ol>
              </div>

              <div className="ar-side">
                <div className={"ar-retrieval" + (t >= TRACE[1].at[0] ? " is-in" : "")} ref={refs.current.retrieval}>
                  <div className="ar-panel-head"><span>retrieval</span><span>top-k 3 · cosine</span></div>
                  {CHUNKS.map((c, i) => (
                    <div key={c.src} className={"ar-chunk" + (t >= c.at ? " is-in" : "") + (i === 0 && t >= T.topChunk ? " is-top" : "")}>
                      <span className="score">
                        <span className="bar" style={{ "--s": t >= c.at ? c.score : 0 }}></span>
                        {c.score.toFixed(2)}
                      </span>
                      <span className="src">{c.src}</span>
                      <span className="txt">{c.text}</span>
                    </div>
                  ))}
                </div>

                <div className="ar-tools">
                  {TOOLS.map((tool, i) => {
                    const st = stateOf(t, tool.at);
                    return (
                      <div key={tool.name} ref={refs.current["tool" + i]} className={"ar-tool st-" + st}>
                        <div className="ar-tool-head">
                          <span className="fn">{tool.name}</span>
                          <span className="ok">{st === "done" ? "✓" : st === "run" ? <span className="spin"></span> : ""}</span>
                        </div>
                        <div className="args">{tool.args}</div>
                        <div className="res">{st === "done" ? `→ ${tool.result}` : " "}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={"ar-answer" + (words > 0 ? " is-in" : "")} ref={refs.current.answer}>
                <span className="ar-label">▸ answer</span>
                <p>
                  {ANSWER_WORDS.slice(0, words).join(" ")}
                  {words > 0 && words < ANSWER_WORDS.length ? <span className="caret"></span> : null}
                </p>
                <div className="ar-cite">{done ? "3 sources · 2 tool calls · 0 guardrail flags" : " "}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
