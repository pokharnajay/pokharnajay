"use client";
import { useEffect, useRef, useState } from "react";

/* ============== Intro Veil ============== */

function IntroVeil() {
  return (
    <div className="intro-veil" id="introVeil">
      <div className="intro-veil-inner">
        <span className="intro-mark">JP</span>
        <span className="intro-line"></span>
        <span className="intro-text">Jay Pokharna · v3.0 / booting</span>
      </div>
    </div>
  );
}

/* ============== Topbar ============== */

function Topbar() {
  /* Auto-scroll: glides the viewport from current position to the bottom of
     the page. Linear easing + slow distance-scaled duration → constant
     reading-pace travel rather than a fast initial coast that decelerates.
     Roughly: ~250 pixels of scroll per second, clamped to 10–40s. */
  const onAutoScroll = () => {
    if (typeof window === "undefined") return;
    const target = document.documentElement.scrollHeight - window.innerHeight;
    const distance = Math.max(0, target - window.scrollY);
    const duration = Math.min(40, Math.max(10, distance / 250));
    if (window.__lenis) {
      window.__lenis.scrollTo(target, {
        duration,
        easing: (t) => t, // linear — constant speed feels deliberate, not coasting
      });
    } else {
      // Native fallback can't do linear smooth scroll, so we hand-roll a RAF.
      const start = window.scrollY;
      const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / (duration * 1000));
        window.scrollTo(0, start + (target - start) * p);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  };
  return (
    <header className="topbar">
      <a href="#top" className="brand">
        <span className="brand-mark">JP</span>
        <span>Jay Pokharna</span>
      </a>
      <nav>
        <a href="#scenes">Work</a>
        <a href="#tools">Stack</a>
        <a href="#contact">Contact</a>
      </nav>
      <div className="status">
        <div className="status-row">
          <span className="dot"></span>
          <span>Available · Q2</span>
        </div>
        <button
          type="button"
          className="auto-scroll-btn"
          onClick={onAutoScroll}
          aria-label="Auto-scroll to bottom"
          title="Auto-scroll to bottom"
        >
          <span className="auto-scroll-arrow">↓</span>
          <span className="auto-scroll-label">Auto-scroll</span>
        </button>
      </div>
    </header>
  );
}

/* ============== Hero (with Three.js node-graph canvas) ============== */

function initHeroCanvas(container) {
  if (!container || typeof window === "undefined" || !window.THREE) return () => {};
  const THREE = window.THREE;
  const w = () => container.clientWidth;
  const h = () => container.clientHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, w() / h(), 0.1, 1000);
  camera.position.z = 22;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
  renderer.setSize(w(), h());
  container.appendChild(renderer.domElement);

  const N = 220;
  const geom = new THREE.BufferGeometry();
  const positions = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const r = 12 + Math.random() * 8;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const dotMat = new THREE.PointsMaterial({
    color: 0xa3ff12,
    size: 0.08,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(geom, dotMat);
  scene.add(points);

  const edgePos = [];
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      const dx = positions[i * 3] - positions[j * 3];
      const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
      const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (d < 4.0) {
        edgePos.push(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
        edgePos.push(positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]);
      }
    }
  }
  const edgeGeom = new THREE.BufferGeometry();
  edgeGeom.setAttribute("position", new THREE.BufferAttribute(new Float32Array(edgePos), 3));
  const edgeMat = new THREE.LineBasicMaterial({ color: 0xa3ff12, transparent: true, opacity: 0.12 });
  const lines = new THREE.LineSegments(edgeGeom, edgeMat);
  scene.add(lines);

  const coreGeom = new THREE.IcosahedronGeometry(3.4, 1);
  const coreMat = new THREE.MeshBasicMaterial({ color: 0xa3ff12, wireframe: true, transparent: true, opacity: 0.35 });
  const core = new THREE.Mesh(coreGeom, coreMat);
  scene.add(core);

  const innerGeom = new THREE.IcosahedronGeometry(2.2, 0);
  const innerMat = new THREE.MeshBasicMaterial({ color: 0x00ffd0, wireframe: true, transparent: true, opacity: 0.25 });
  const inner = new THREE.Mesh(innerGeom, innerMat);
  scene.add(inner);

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  const onMove = (e) => {
    mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
  };
  window.addEventListener("mousemove", onMove);

  const onResize = () => {
    camera.aspect = w() / h();
    camera.updateProjectionMatrix();
    renderer.setSize(w(), h());
  };
  window.addEventListener("resize", onResize);

  let raf;
  const start = performance.now();
  const tick = () => {
    const t = (performance.now() - start) * 0.001;
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;

    points.rotation.y = t * 0.05 + mouse.x * 0.4;
    points.rotation.x = mouse.y * 0.25;
    lines.rotation.copy(points.rotation);
    core.rotation.x = t * 0.2 + mouse.y * 0.3;
    core.rotation.y = t * 0.25 + mouse.x * 0.3;
    inner.rotation.x = -t * 0.3;
    inner.rotation.y = -t * 0.4 + mouse.x * 0.2;

    camera.position.x = mouse.x * 1.5;
    camera.position.y = -mouse.y * 1.5;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  };
  tick();

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("resize", onResize);
    renderer.dispose();
    if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
  };
}

function Hero() {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    return initHeroCanvas(canvasRef.current);
  }, []);

  return (
    <section className="hero" id="top">
      <div className="hero-canvas" ref={canvasRef}></div>
      <div className="hero-vignette"></div>
      <div className="hero-inner">
        <div className="hero-tag">v3.0 / Engineered &amp; deployed</div>

        <div className="hero-mid">
          <h1 className="hero-headline">
            <span className="row"><span data-hero-anim>AI &amp; Automation</span></span>
            <span className="row"><span data-hero-anim className="outline">that runs</span></span>
            <span className="row"><span data-hero-anim>in <span className="accent">production.</span></span></span>
          </h1>
        </div>

        <div className="hero-bottom">
          <p className="hero-bio">
            <strong>Jay Pokharna.</strong> AI &amp; Automation Engineer at <strong>Etherwise</strong>. I build the systems your ops team wishes existed — half code, half visual platforms, all production-grade.
          </p>
          <div className="hero-stats">
            <div className="stat"><span>Automations shipped</span><span className="v accent">3,000+</span></div>
            <div className="stat"><span>Global clients</span><span className="v">70+</span></div>
            <div className="stat"><span>Voice agents live</span><span className="v">∞</span></div>
            <div className="stat"><span>Based</span><span className="v">Pune · IST</span></div>
          </div>
          <div className="hero-cta-wrap">
            <a href="#contact" className="btn primary">Start a project <span className="arrow">↗</span></a>
            <a href="#scenes" className="btn">See how I work</a>
          </div>
        </div>
      </div>

    </section>
  );
}

/* ============== Scenes Section ============== */

function SceneNoCode() {
  const svgRef = useRef(null);
  const graphRef = useRef(null);
  const nodes = [
    { id: "trigger",  label: "Webhook In",   x: 8,  y: 30, badge: "TRG" },
    { id: "router",   label: "Router",       x: 32, y: 50, badge: "MK"  },
    { id: "airtable", label: "Airtable Find", x: 60, y: 22, badge: "DB"  },
    { id: "filter",   label: "Filter",       x: 60, y: 50, badge: "FX"  },
    { id: "slack",    label: "Slack Notify", x: 60, y: 78, badge: "SL"  },
    { id: "stripe",   label: "Stripe Charge", x: 88, y: 32, badge: "$"   },
    { id: "sms",      label: "ClickSend SMS", x: 88, y: 68, badge: "SMS" },
  ];
  const edges = [
    ["trigger", "router"],   // 0  stage 0
    ["router", "airtable"],  // 1  stage 1
    ["router", "filter"],    // 2  stage 1
    ["router", "slack"],     // 3  stage 1
    ["airtable", "stripe"],  // 4  stage 2
    ["filter", "stripe"],    // 5  stage 2
    ["filter", "sms"],       // 6  stage 2
  ];
  const map = Object.fromEntries(nodes.map((n) => [n.id, n]));

  // BFS propagation: data starts at trigger, lights up nodes in order of arrival.
  useEffect(() => {
    if (!svgRef.current || !graphRef.current || typeof window === "undefined") return;
    const pulseEls = svgRef.current.querySelectorAll(".ng-pulse");
    if (pulseEls.length !== edges.length) return;
    const nodeEls = graphRef.current.querySelectorAll("[data-node]");
    const nodeMap = {};
    nodeEls.forEach((el) => { nodeMap[el.dataset.node] = el; });

    // Cubic bezier interpolator matching the path d="M A C C1 C2 B"
    const at = (a, b, t) => {
      const c1x = (a.x + b.x) / 2, c1y = a.y;
      const c2x = (a.x + b.x) / 2, c2y = b.y;
      const u = 1 - t;
      return {
        x: u * u * u * a.x + 3 * u * u * t * c1x + 3 * u * t * t * c2x + t * t * t * b.x,
        y: u * u * u * a.y + 3 * u * u * t * c1y + 3 * u * t * t * c2y + t * t * t * b.y,
      };
    };

    const stages = [[0], [1, 2, 3], [4, 5, 6]];
    // Slower cadence per request — feels deliberate, like data actually flowing.
    const STAGE_DUR = 1.5;
    const STAGE_GAP = 0.45;
    const PAUSE = 1.6;
    const stageOf = new Array(edges.length);
    stages.forEach((s, i) => s.forEach((e) => (stageOf[e] = i)));
    const totalDur = stages.length * STAGE_DUR + (stages.length - 1) * STAGE_GAP + PAUSE;

    // Light up the trigger (start) node only when the cycle is in flight.
    const triggerArrival = 0;
    // For each edge, the moment the pulse "arrives" at its destination node.
    const arrivalsByEdge = edges.map((_, i) => {
      const sIdx = stageOf[i];
      return sIdx * (STAGE_DUR + STAGE_GAP) + STAGE_DUR * 0.92;
    });

    let rafId;
    let cycleStart = performance.now();
    let lastReset = -1;

    const setHot = (id, on) => {
      const el = nodeMap[id];
      if (!el) return;
      el.classList.toggle("hot", on);
    };

    const tick = (now) => {
      const elapsed = (now - cycleStart) / 1000;
      if (elapsed >= totalDur) {
        cycleStart = now;
        // Reset: extinguish all nodes at start of new cycle.
        nodes.forEach((n) => setHot(n.id, false));
        lastReset = now;
      }
      const phase = elapsed >= totalDur ? 0 : elapsed;

      // Pulse positions
      for (let i = 0; i < edges.length; i++) {
        const sIdx = stageOf[i];
        const stageStart = sIdx * (STAGE_DUR + STAGE_GAP);
        const stageEnd = stageStart + STAGE_DUR;
        const el = pulseEls[i];
        if (phase < stageStart || phase > stageEnd) {
          el.style.opacity = "0";
          continue;
        }
        const t = (phase - stageStart) / STAGE_DUR;
        const op = t < 0.06 ? t / 0.06 : t > 0.92 ? (1 - t) / 0.08 : 1;
        el.style.opacity = String(Math.max(0, Math.min(1, op)));
        const A = map[edges[i][0]], B = map[edges[i][1]];
        const p = at(A, B, t);
        el.setAttribute("cx", p.x.toFixed(2));
        el.setAttribute("cy", p.y.toFixed(2));
      }

      // Node lighting based on phase
      // Trigger lights as soon as the cycle starts (data is "in").
      setHot("trigger", phase >= triggerArrival);
      // Each destination node lights when its incoming pulse arrives.
      for (let i = 0; i < edges.length; i++) {
        const dst = edges[i][1];
        if (phase >= arrivalsByEdge[i]) setHot(dst, true);
      }

      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className="scene" data-scene="0">
      <div className="scene-text">
        <div className="eyebrow"><span className="dot"></span> Scene 01 / Visual Platforms</div>
        <h3 className="scene-h">No-code, <em>orchestrated</em>.</h3>
        <p className="scene-body">
          When the team owning the workflow needs to read &amp; edit it, when business rules will keep changing, when integrations are well-supported — that&rsquo;s where <strong style={{ color: "var(--fg)" }}>Make.com, n8n, Zapier, GoHighLevel</strong> earn their keep. Sequential logic, fast iteration, visible to everyone.
        </p>
        <div className="scene-meta">
          <span className="chip hot">Make.com · 200+ scenarios</span>
          <span className="chip">n8n self-hosted</span>
          <span className="chip">Airtable</span>
          <span className="chip">GHL</span>
          <span className="chip">Cal.com</span>
        </div>
      </div>

      <div className="scene-visual">
        <div className="nodegraph" ref={graphRef}>
          <svg ref={svgRef} viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M0,0 L10,5 L0,10 z" fill="#a3ff12" />
              </marker>
            </defs>
            {edges.map(([a, b], i) => {
              const A = map[a], B = map[b];
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
            {/* Pulse particles travel along each edge in BFS stages.
                Ellipse rx/ry compensates for the SVG's preserveAspectRatio="none"
                stretch (16:9 container × 1:1 viewBox) so the pulse renders as a
                perfect circle on screen. ry / rx = 16 / 9. */}
            {edges.map((_, i) => (
              <ellipse
                key={`pulse-${i}`}
                className="ng-pulse"
                rx="0.9"
                ry="1.6"
                fill="#a3ff12"
                opacity="0"
                style={{ filter: "drop-shadow(0 0 1.5px #a3ff12)" }}
              />
            ))}
          </svg>
          {nodes.map((n) => (
            <div
              key={n.id}
              data-node={n.id}
              className="node"
              style={{ left: n.x + "%", top: n.y + "%" }}
            >
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

/* 10-snippet rotation for the SceneCode typewriter. Each snippet types out
   character-by-character then waits 5s before the next one is picked at random. */
const CODE_SNIPPETS = [
  {
    file: "~/automations/payment-reconcile.ts",
    code: `// reconcile Stripe + Whop charges → Airtable
import { table } from "@airtable/scripts";
const charges = await fetchCharges({ since: lastRun });

for (const c of charges) {
  if (await findByExternalId(c.id)) continue;
  await table.createRecord({
    amount: c.amount / 100,
    customer: await resolveCustomer(c),
    commission: splitCommission(c),
  });
}`,
  },
  {
    file: "~/lib/webhook-retry.ts",
    code: `// exponential backoff for transient webhook failures
async function deliver(url, body, attempt = 1) {
  const res = await fetch(url, { method: "POST", body });
  if (res.ok) return res;
  if (attempt >= 5) throw new Error("max retries");

  const wait = 2 ** attempt * 250;
  await sleep(wait);
  return deliver(url, body, attempt + 1);
}`,
  },
  {
    file: "~/sms/inbound-stop.ts",
    code: `// inbound SMS: detect STOP, propagate opt-out
const STOP = new Set(["STOP", "UNSUBSCRIBE", "QUIT"]);

export async function onInbound(msg) {
  const text = msg.body.trim().toUpperCase();
  if (!STOP.has(text)) return;
  const contact = await findContact(msg.from);
  if (!contact) return;
  await markOptOut(contact.id, { source: "sms" });
  await replyAck(msg.from);
}`,
  },
  {
    file: "~/vapi/dynamic-context.ts",
    code: `// inject runtime context into VAPI assistant
const ctx = {
  caller: caller.firstName ?? "there",
  now: new Date().toLocaleString("en-US", { timeZone: tz }),
  nextOpen: slots[0]?.start ?? null,
  history: lastCalls.slice(0, 3),
};

const prompt = renderLiquid(template, ctx);
await vapi.start(assistantId, { context: prompt });`,
  },
  {
    file: "~/cal/conflict-check.ts",
    code: `// team-wide conflict check before booking
async function canBook(slot) {
  const team = await listTeam();
  const events = (await Promise.all(
    team.map(u => listEvents(u.email, slot.start, slot.end))
  )).flat();

  return events.every(e =>
    e.end <= slot.start || e.start >= slot.end
  );
}`,
  },
  {
    file: "~/lead/route.ts",
    code: `// route inbound lead to the right pod
function pickPod(lead) {
  if (lead.budget > 50000) return "enterprise";
  if (lead.region === "EU") return "eu-team";
  if (lead.source === "referral") return "warm";
  return "smb";
}

const pod = pickPod(lead);
await assignTo(pod, lead);
await slackPing(\`#\${pod}\`, lead);`,
  },
  {
    file: "~/esign/callback.ts",
    code: `// eSignatures.io status webhook handler
if (req.body.status !== "signed") return ok();

const deal = await findDeal(req.body.contract_id);
await markSigned(deal.id, req.body.signed_at);
await triggerScenario("payment_link", deal);
await notify(deal.owner, "contract signed");
return ok();`,
  },
  {
    file: "~/ops/digest.ts",
    code: `// nightly ops digest → Slack #ops
const since = startOfDay(new Date());
const wins = await listWins({ since });
const blockers = await listBlockers({ since });

const blocks = composeDigest({ wins, blockers });
await postSlack("#ops-digest", blocks);
await markRunComplete("digest");`,
  },
  {
    file: "~/lib/rate-limit.ts",
    code: `// token-bucket rate limit per workspace
const buckets = new Map();

function take(workspace, cost = 1) {
  const b = buckets.get(workspace) ?? { tokens: 100, refilledAt: now() };
  refill(b);
  if (b.tokens < cost) throw new TooManyRequests();
  b.tokens -= cost;
  buckets.set(workspace, b);
}`,
  },
  {
    file: "~/airtable/upsert.ts",
    code: `// upsert by external key, batched 10/req
const chunks = chunk(records, 10);

for (const batch of chunks) {
  await base(table).update(batch, {
    typecast: true,
    performUpsert: { fieldsToMergeOn: ["external_id"] },
  });
  await sleep(220); // stay under 5 req/s per base
}`,
  },
];

// Tokenize a code line into syntax-highlighted spans (light JS/TS lexer).
function tokenizeCodeLine(line) {
  if (line.trim().startsWith("//")) return [{ c: "com", t: line }];
  const KW = /^(import|from|const|let|var|await|async|function|for|if|else|return|of|in|new|throw|continue|export|default|try|catch|class|extends|null|undefined|true|false|this|break)\b/;
  const out = [];
  let rest = line;
  while (rest.length > 0) {
    let m;
    if ((m = rest.match(/^"(?:[^"\\]|\\.)*"/)) || (m = rest.match(/^'(?:[^'\\]|\\.)*'/)) || (m = rest.match(/^`(?:[^`\\]|\\.)*`/))) {
      out.push({ c: "str", t: m[0] });
      rest = rest.slice(m[0].length);
      continue;
    }
    if ((m = rest.match(KW))) {
      out.push({ c: "kw", t: m[0] });
      rest = rest.slice(m[0].length);
      continue;
    }
    if ((m = rest.match(/^[0-9]+(\.[0-9]+)?/))) {
      out.push({ c: "num", t: m[0] });
      rest = rest.slice(m[0].length);
      continue;
    }
    if ((m = rest.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\s*\()/))) {
      out.push({ c: "fn", t: m[0] });
      rest = rest.slice(m[0].length);
      continue;
    }
    if ((m = rest.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*/))) {
      out.push({ c: "var", t: m[0] });
      rest = rest.slice(m[0].length);
      continue;
    }
    out.push({ c: "", t: rest[0] });
    rest = rest.slice(1);
  }
  return out;
}

// Pre-tokenize once at module load so every keystroke is a cheap render.
const SNIPPETS_TOKENIZED = CODE_SNIPPETS.map((s) => {
  const lines = s.code.split("\n").map((line) => ({
    tokens: tokenizeCodeLine(line),
    raw: line,
  }));
  // total chars including newlines
  let total = 0;
  for (const l of lines) total += l.raw.length + 1;
  total -= 1; // last line has no trailing newline
  return { file: s.file, lines, totalChars: total };
});
const MAX_LINES = SNIPPETS_TOKENIZED.reduce((m, s) => Math.max(m, s.lines.length), 0);

function SceneCode() {
  const [snippetIdx, setSnippetIdx] = useState(0);
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    const snippet = SNIPPETS_TOKENIZED[snippetIdx];
    if (typed < snippet.totalChars) {
      // mild jitter so it feels like a person typing, not a constant tick
      const speed = 18 + Math.floor(Math.random() * 18);
      const id = setTimeout(() => setTyped(typed + 1), speed);
      return () => clearTimeout(id);
    }
    // Snippet done — wait 5s, then pick a different snippet at random.
    const id = setTimeout(() => {
      let next;
      do {
        next = Math.floor(Math.random() * SNIPPETS_TOKENIZED.length);
      } while (next === snippetIdx && SNIPPETS_TOKENIZED.length > 1);
      setSnippetIdx(next);
      setTyped(0);
    }, 5000);
    return () => clearTimeout(id);
  }, [snippetIdx, typed]);

  const snippet = SNIPPETS_TOKENIZED[snippetIdx];
  let charsLeft = typed;
  const lineNodes = [];
  for (let li = 0; li < snippet.lines.length; li++) {
    const line = snippet.lines[li];
    const lineCharLen = line.raw.length;
    if (charsLeft <= 0) {
      lineNodes.push(<span key={li} className="line"><span>&nbsp;</span></span>);
      continue;
    }
    const cut = Math.min(charsLeft, lineCharLen);
    let used = 0;
    const spans = [];
    for (const tok of line.tokens) {
      if (used >= cut) break;
      const take = Math.min(tok.t.length, cut - used);
      spans.push(<span key={spans.length} className={tok.c}>{tok.t.slice(0, take)}</span>);
      used += tok.t.length;
    }
    const isCurrentLine = cut < lineCharLen || (charsLeft <= lineCharLen + 1 && li === snippet.lines.length - 1);
    lineNodes.push(
      <span key={li} className="line">
        {spans.length > 0 ? spans : <span>&nbsp;</span>}
        {isCurrentLine && typed < snippet.totalChars ? <span className="caret"></span> : null}
      </span>
    );
    charsLeft -= lineCharLen + 1; // +1 for the newline between lines
  }

  return (
    <div className="scene" data-scene="1">
      <div className="scene-text">
        <div className="eyebrow"><span className="dot"></span> Scene 02 / Custom Code</div>
        <h3 className="scene-h">Code, <em>where it counts</em>.</h3>
        <p className="scene-body">
          Loops, conditional branching, hundreds of records, audit-traceable retries, APIs without polished connectors. <strong style={{ color: "var(--fg)" }}>JavaScript, TypeScript, Node.js, Python</strong> — Airtable scripts, custom webhooks, scheduled jobs that don&rsquo;t time out and explain their own failures.
        </p>
        <div className="scene-meta">
          <span className="chip hot">Airtable JS</span>
          <span className="chip">Node.js</span>
          <span className="chip">TypeScript</span>
          <span className="chip">Python</span>
          <span className="chip">Cloudflare</span>
        </div>
      </div>

      <div className="scene-visual">
        <div className="codeblock">
          <div className="head">
            <div className="dots"><span></span><span></span><span></span></div>
            <div className="file">{snippet.file}</div>
          </div>
          <div className="body">
            <div className="gutter">
              {Array.from({ length: MAX_LINES }, (_, i) => (
                <span key={i}>{i < snippet.lines.length ? i + 1 : ""}</span>
              ))}
            </div>
            <div className="code">
              {lineNodes}
              {/* fill remaining lines with empty so codeblock height stays stable */}
              {Array.from({ length: Math.max(0, MAX_LINES - snippet.lines.length) }, (_, i) => (
                <span key={`pad-${i}`} className="line"><span>&nbsp;</span></span>
              ))}
            </div>
          </div>
        </div>

        <div className="codeblock-orbit" style={{ inset: 0, width: "100%", height: "100%" }}>
          <span className="chip" style={{ top: "8%", right: "4%" }}>Stripe API ✓</span>
          <span className="chip" style={{ top: "20%", left: "-2%" }}>Webhook recv</span>
          <span className="chip" style={{ bottom: "16%", right: "-2%" }}>Idempotent</span>
          <span className="chip" style={{ bottom: "4%", left: "8%" }}>0 dupes / 30d</span>
        </div>
      </div>
    </div>
  );
}

function SceneVoice() {
  const bars = Array.from({ length: 36 });
  // Sequential transcript reveal: AI → User → AI, hold, restart, loop.
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (shown < 3) {
      const id = setTimeout(() => setShown(shown + 1), 1600);
      return () => clearTimeout(id);
    }
    // All 3 lines visible — hold for 4s, then restart the conversation.
    const id = setTimeout(() => setShown(0), 4000);
    return () => clearTimeout(id);
  }, [shown]);

  const messages = [
    { ai: true,  who: "AI ▸",   text: "Hi! I’m calling to confirm your service window for Tuesday." },
    { ai: false, who: "User ▸", text: "Tuesday afternoon works." },
    { ai: true,  who: "AI ▸",   text: "Got it — booking 2 to 4 PM. You’ll get a text shortly." },
  ];

  return (
    <div className="scene" data-scene="2">
      <div className="scene-text">
        <div className="eyebrow"><span className="dot"></span> Scene 03 / Voice AI</div>
        <h3 className="scene-h">Voice agents that <em>book</em>.</h3>
        <p className="scene-body">
          VAPI agents that handle real customer conversations — answering questions, booking appointments, qualifying leads — at quality that, a year ago, required a trained human. The craft is in <strong style={{ color: "var(--fg)" }}>prompt humanization</strong>, silence handling, dynamic context injection, and warm persona design.
        </p>
        <div className="scene-meta">
          <span className="chip hot">VAPI</span>
          <span className="chip">LiquidJS</span>
          <span className="chip">Cal.com</span>
          <span className="chip">Function calling</span>
          <span className="chip">Sub-300ms latency</span>
        </div>
      </div>

      <div className="scene-visual">
        <div className="phone">
          <div className="notch"></div>
          <div className="status"><span>9:41</span><span>5G ●●●</span></div>
          <div className="caller">
            <div className="who">Etherwise · AI</div>
            <div className="num">+1 (415) 555-0142</div>
            <div className="live">● live · 00:42</div>
          </div>
          <div className="wave">
            {bars.map((_, i) => (
              <span
                key={i}
                style={{
                  height: 12 + Math.sin(i * 0.6) * 30 + ((i * 17) % 20) + "px",
                  animation: `wavePulse ${0.6 + (i % 5) * 0.1}s ${i * 0.04}s ease-in-out infinite alternate`,
                }}
              ></span>
            ))}
          </div>
          <div className="transcript">
            {messages.map((m, i) => (
              <div
                key={i}
                className={"line" + (m.ai ? " ai" : "") + (i < shown ? " is-visible" : "")}
              >
                <span className="who">{m.who}</span> {m.text}
              </div>
            ))}
          </div>
        </div>

        <div className="phone-orbit">
          <span className="chip hot" style={{ top: "12%", right: "8%" }}>Booking → Cal.com</span>
          <span className="chip" style={{ top: "32%", right: "-2%" }}>Tone: warm</span>
          <span className="chip" style={{ bottom: "30%", left: "0%" }}>Interrupt-safe</span>
          <span className="chip" style={{ bottom: "10%", right: "12%" }}>SMS confirm</span>
        </div>
      </div>
    </div>
  );
}

function ScenesSection() {
  return (
    <section className="scenes-wrap" id="scenes">
      <div className="scenes-pin" data-scenes-pin>
        <div className="scenes-bg"></div>

        <div className="scenes-progress" data-scenes-progress>
          <div className="step" data-step="0"><span className="num">01</span><span>No-code</span></div>
          <div className="step" data-step="1"><span className="num">02</span><span>Code</span></div>
          <div className="step" data-step="2"><span className="num">03</span><span>Voice AI</span></div>
        </div>

        <div className="scenes-stage-section">
          <SceneNoCode />
          <SceneCode />
          <SceneVoice />
        </div>
      </div>
    </section>
  );
}

/* ============== Tools ============== */

function Tools() {
  const rails = [
    [
      ["Make.com", "automation", true],
      ["n8n", "self-hosted", true],
      ["Zapier", "automation"],
      ["GoHighLevel", "crm + workflows", true],
      ["Pipedream", "code-first"],
      ["Airtable", "db + scripts", true],
      ["Stripe", "payments", true],
      ["Whop", "payments"],
      ["eSignatures.io", "contracts", true],
      ["ClickSend", "sms", true],
      ["Twilio", "sms + voice"],
      ["Cal.com", "scheduling", true],
    ],
    [
      ["VAPI", "voice ai", true],
      ["Bland.ai", "voice ai"],
      ["LiquidJS", "templating"],
      ["Function calling", "tooling"],
      ["JavaScript", "primary", true],
      ["TypeScript", "primary"],
      ["Node.js", "runtime"],
      ["Python", "scripts + ml"],
      ["Cloudflare", "tunnels"],
      ["Docker", "containers"],
      ["GitHub", "git"],
      ["Slack", "messaging"],
    ],
  ];

  return (
    <section className="tools" id="tools">
      <div className="tools-inner">
        <div className="tools-head">
          <h2 className="display">
            The <em>actual</em><br />toolbox.
          </h2>
          <div className="lede">
            Real list, grouped by what each does. If your stack isn&rsquo;t here, ask. Automation work transfers across tools more than people think — the honest answer is usually a few days to come up to speed.
          </div>
        </div>

        <div className="tools-rails" data-tools-rails>
          {rails.map((rail, idx) => {
            const items = [...rail, ...rail];
            return (
              <div
                key={idx}
                className={"tools-rail " + (idx % 2 ? "reverse" : "")}
                style={{ "--speed": 60 + idx * 8 + "s" }}
              >
                <div className="rail-track">
                  {items.map(([name, kind, featured], i) => (
                    <span key={i} className={"tool-chip " + (featured ? "featured" : "")}>
                      <span>{name}</span>
                      <span className="kind">{kind}</span>
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="tools-foot">
          <div className="cell">
            <div className="k">/ shipped</div>
            <div className="v"><span className="accent">3,000</span>+</div>
            <div className="sub">automations across 70+ clients</div>
          </div>
          <div className="cell">
            <div className="k">/ stack ratio</div>
            <div className="v">50<span style={{ color: "var(--fg-3)" }}>/</span><span className="accent">50</span></div>
            <div className="sub">code · visual platforms</div>
          </div>
          <div className="cell">
            <div className="k">/ availability</div>
            <div className="v"><span className="accent">Q2</span></div>
            <div className="sub">select engagements only</div>
          </div>
          <div className="cell">
            <div className="k">/ response</div>
            <div className="v">&lt;<span className="accent">24</span>h</div>
            <div className="sub">on first contact</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============== Contact ============== */

function Contact() {
  const channels = [
    { k: "Email", v: "hello@jaypokharna.dev", href: "mailto:hello@jaypokharna.dev" },
    { k: "LinkedIn", v: "/in/jay-pokharna-940a42207", href: "https://www.linkedin.com/in/jay-pokharna-940a42207/" },
    { k: "Etherwise", v: "etherwise.io", href: "https://etherwise.io/" },
    { k: "GitHub", v: "/jaypokharna", href: "https://github.com/" },
  ];
  return (
    <section className="contact" id="contact">
      <div className="contact-inner">
        <div className="eyebrow" style={{ marginBottom: "32px" }}>
          <span className="dot"></span><span>04 / Let&rsquo;s build</span><span className="line"></span>
        </div>

        <h2 className="contact-headline">
          <span className="out">Send one</span><br />
          <em>paragraph.</em>
        </h2>

        <div className="contact-grid">
          <p className="contact-pitch">
            Not a job description. Not a perfectly scoped brief. Just the <strong>actual problem</strong> in your own words — and I&rsquo;ll respond within a business day with either a real answer, a few clarifying questions, or an honest <em>&ldquo;this isn&rsquo;t a fit, here&rsquo;s who might be.&rdquo;</em>
            <br /><br />
            Discovery first, quoting second. Milestone-based fixed pricing. Built for the person who inherits it. That&rsquo;s the whole pitch.
          </p>

          <div className="contact-channels">
            {channels.map((c) => (
              <a
                key={c.k}
                className="contact-channel"
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
              >
                <div>
                  <div className="k">{c.k}</div>
                  <div className="v">{c.v}</div>
                </div>
                <span className="arrow">↗</span>
              </a>
            ))}
          </div>
        </div>

        <footer className="contact-foot">
          <span>© 2026 Jay Pokharna · Pune, IST (UTC+5:30)</span>
          <span>Built with three.js · gsap</span>
          <span>v3.0 / production</span>
        </footer>
      </div>
    </section>
  );
}

/* ============== App ============== */

export default function Page() {
  const ranRef = useRef(false);

  /* Effect 1: cursor — idempotent, runs every effect mount, cleans up correctly. */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const ring = document.getElementById("cursorRing");
    const dot = document.getElementById("cursorDot");
    if (!ring || !dot) return;
    let x = window.innerWidth / 2, y = window.innerHeight / 2, rx = x, ry = y;
    let raf;
    const onMove = (e) => {
      x = e.clientX; y = e.clientY;
      dot.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`;
    };
    const tick = () => {
      rx += (x - rx) * 0.18; ry += (y - ry) * 0.18;
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", onMove);
    tick();
    /* Delegated hover detection — survives React re-renders and missed
       mouseleave events. Using mouseover/mouseout (which bubble) on document
       means we always know the live target, not a stale snapshot from page
       load. The relatedTarget check prevents flicker when moving between
       two interactive elements. */
    const SELECTOR = "a, button, .btn, [data-cursor]";
    const onOver = (e) => {
      if (e.target.closest && e.target.closest(SELECTOR)) {
        document.body.classList.add("hovering");
      }
    };
    const onOut = (e) => {
      const from = e.target.closest && e.target.closest(SELECTOR);
      if (!from) return;
      const to = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(SELECTOR);
      if (!to) document.body.classList.remove("hovering");
    };
    /* Belt-and-suspenders: when the pointer leaves the window entirely
       (into the browser chrome or another monitor), clear hover state. */
    const onWindowOut = () => document.body.classList.remove("hovering");

    /* When the pointer re-enters the page or the window regains focus,
       force a cursor repaint by briefly toggling the documentElement style.
       Chromium/Brave can otherwise leave a stale OS cursor visible until
       a repaint is triggered. */
    const repaintCursor = () => {
      const html = document.documentElement;
      html.style.cursor = "auto";
      // Next frame, restore — the toggle forces the browser to re-resolve
      // the cursor against our `cursor: none` rule.
      requestAnimationFrame(() => {
        html.style.cursor = "";
      });
    };
    document.addEventListener("mouseenter", repaintCursor);
    window.addEventListener("focus", repaintCursor);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    document.addEventListener("mouseleave", onWindowOut);
    window.addEventListener("blur", onWindowOut);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      document.removeEventListener("mouseleave", onWindowOut);
      window.removeEventListener("blur", onWindowOut);
      document.removeEventListener("mouseenter", repaintCursor);
      window.removeEventListener("focus", repaintCursor);
    };
  }, []);

  /* Effect 2: Lenis smooth-scroll + anchor link routing — idempotent.
     Lenis is the modern Locomotive-style smooth-scroll lib. We expose the
     instance on window.__lenis so the auto-scroll button (and anything else)
     can call into it. ScrollTrigger is told to refresh on Lenis scroll so
     pinned scenes stay in sync. */
  useEffect(() => {
    if (typeof window === "undefined") return;
    let lenis;
    let rafId;
    if (window.Lenis) {
      lenis = new window.Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        smoothTouch: false,
      });
      window.__lenis = lenis;
      const raf = (time) => {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
      if (window.ScrollTrigger) {
        lenis.on("scroll", window.ScrollTrigger.update);
      }
    }
    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href").slice(1);
      const tgt = document.getElementById(id);
      if (tgt) {
        e.preventDefault();
        if (lenis) lenis.scrollTo(tgt, { offset: 0 });
        else window.scrollTo({ top: tgt.offsetTop, behavior: "smooth" });
      }
    };
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      if (rafId) cancelAnimationFrame(rafId);
      if (lenis) {
        lenis.destroy();
        if (window.__lenis === lenis) delete window.__lenis;
      }
    };
  }, []);

  /* Effect 3: GSAP entrance + ScrollTriggers — run-once via ref guard. */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.gsap) return;
    if (ranRef.current) return;
    ranRef.current = true;
    const gsap = window.gsap;
    if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

    // Intro veil: hold for ~0.5s showing the JP mark, then slide up to reveal.
    // After the slide completes, mark body so the veil is removed from the
    // paint tree (display:none) and stops eating events.
    const veil = document.getElementById("introVeil");
    if (veil) {
      gsap.fromTo(
        veil,
        { yPercent: 0 },
        {
          yPercent: -101,
          duration: 1.1,
          ease: "power4.inOut",
          delay: 0.55,
          onComplete: () => document.body.classList.add("intro-done"),
        }
      );
      gsap.fromTo(
        ".intro-veil-inner",
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", delay: 0.05 }
      );
      gsap.to(".intro-veil-inner", { opacity: 0, duration: 0.35, ease: "power2.in", delay: 1.4 });
    }

    // Hero entrance — fromTo with clearProps so post-animation state is natural CSS.
    // Delays here line up with the veil sliding up so the hero is "behind" it.
    const heroAnims = document.querySelectorAll("[data-hero-anim]");
    if (heroAnims.length) {
      gsap.fromTo(
        heroAnims,
        { yPercent: 110, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.1, ease: "expo.out", stagger: 0.08, delay: 1.4, clearProps: "all" }
      );
      gsap.fromTo(
        ".hero-bottom > *",
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, delay: 2.1, ease: "power2.out", clearProps: "all" }
      );
      gsap.fromTo(
        ".hero-tag",
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.6, delay: 1.7, ease: "power2.out", clearProps: "all" }
      );
    }

    // Pinned scenes ScrollTrigger
    if (window.ScrollTrigger) {
      const ScrollTrigger = window.ScrollTrigger;
      const wrap = document.querySelector(".scenes-wrap");
      const scenes = document.querySelectorAll(".scene");
      const steps = document.querySelectorAll(".scenes-progress .step");
      if (wrap && scenes.length === 3) {
        gsap.set(scenes, { opacity: 0, scale: 0.92, y: 40 });
        gsap.set(scenes[0], { opacity: 1, scale: 1, y: 0 });
        steps[0]?.classList.add("active");

        ScrollTrigger.create({
          trigger: wrap,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          onUpdate: (self) => {
            const p = self.progress;
            const N = 3;
            // PLATEAU = scene stays at full opacity (op=1, no slide, no scale-down)
            // for this much "dist" from its center. With the dist multiplier (N-1)=2,
            // a plateau of 0.4 means the scene is locked-on across ±0.20 of overall
            // scroll progress. On a 560vh wrap that's ~112vh of full visibility per
            // scene — well above the 50vh requested.
            const PLATEAU = 0.4;
            const FADE = 0.45;
            for (let i = 0; i < N; i++) {
              const center = i / (N - 1);
              const dist = Math.abs(p - center) * (N - 1);
              const fadeProg = Math.max(0, Math.min(1, (dist - PLATEAU) / FADE));
              const op = 1 - fadeProg;
              const scale = 1 - fadeProg * 0.08;
              const y = (p < center ? 40 : -40) * fadeProg;
              gsap.set(scenes[i], { opacity: op, scale, y });
            }
            const idx = Math.round(p * (N - 1));
            steps.forEach((s, i) => {
              s.classList.toggle("active", i === idx);
              s.classList.toggle("done", i < idx);
            });
          },
        });

        gsap.to(".ng-edge", { strokeDashoffset: -10, duration: 2.5, repeat: -1, ease: "none" });
      }

      gsap.utils.toArray(".tools-foot .cell").forEach((cell, i) => {
        gsap.from(cell, {
          opacity: 0,
          y: 30,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: { trigger: cell, start: "top 90%" },
          delay: i * 0.05,
        });
      });
      gsap.from(".tools-head h2", {
        opacity: 0, y: 30, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: ".tools-head", start: "top 80%" },
      });
      gsap.from(".tools-head .lede", {
        opacity: 0, y: 20, duration: 0.8, delay: 0.1, ease: "power2.out",
        scrollTrigger: { trigger: ".tools-head", start: "top 80%" },
      });

      gsap.from(".contact-headline", {
        opacity: 0, y: 60, duration: 1.1, ease: "expo.out",
        scrollTrigger: { trigger: ".contact-headline", start: "top 85%" },
      });
      gsap.from(".contact-channel", {
        opacity: 0, x: -30, duration: 0.6, stagger: 0.08, ease: "power2.out",
        scrollTrigger: { trigger: ".contact-channels", start: "top 85%" },
      });
      gsap.from(".contact-pitch", {
        opacity: 0, y: 20, duration: 0.8, ease: "power2.out",
        scrollTrigger: { trigger: ".contact-pitch", start: "top 85%" },
      });
    }

    // ScrollTriggers are intentionally NOT cleaned up here — the ref guard
    // ensures this effect runs once per real mount, and ScrollTriggers are
    // scoped to the page lifetime.
  }, []);

  return (
    <>
      <div className="grain"></div>
      <div className="scanlines"></div>
      <div className="cursor-ring" id="cursorRing"></div>
      <div className="cursor-dot" id="cursorDot"></div>

      <IntroVeil />
      <Topbar />
      <main>
        <Hero />
        <ScenesSection />
        <Tools />
        <Contact />
      </main>
    </>
  );
}
