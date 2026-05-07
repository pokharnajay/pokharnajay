"use client";
import { useEffect, useRef } from "react";

/* ============== Topbar ============== */

function Topbar() {
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
        <span className="dot"></span>
        <span>Available · Q2</span>
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

      <div className="hero-scroll-hint">
        <span>Scroll to engage</span>
        <span className="arrow"></span>
      </div>
    </section>
  );
}

/* ============== Scenes Section ============== */

function SceneNoCode() {
  const nodes = [
    { id: "trigger", label: "Webhook In", x: 8, y: 22, hot: false, badge: "TRG" },
    { id: "router", label: "Router", x: 32, y: 50, hot: true, badge: "MK" },
    { id: "airtable", label: "Airtable Find", x: 60, y: 18, hot: false, badge: "DB" },
    { id: "filter", label: "Filter", x: 60, y: 50, hot: false, badge: "FX" },
    { id: "slack", label: "Slack Notify", x: 60, y: 82, hot: false, badge: "SL" },
    { id: "stripe", label: "Stripe Charge", x: 88, y: 30, hot: true, badge: "$" },
    { id: "sms", label: "ClickSend SMS", x: 88, y: 70, hot: false, badge: "SMS" },
  ];
  const edges = [
    ["trigger", "router"],
    ["router", "airtable"],
    ["router", "filter"],
    ["router", "slack"],
    ["airtable", "stripe"],
    ["filter", "stripe"],
    ["filter", "sms"],
  ];
  const map = Object.fromEntries(nodes.map((n) => [n.id, n]));

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
        <div className="nodegraph">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none">
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
          </svg>
          {nodes.map((n) => (
            <div
              key={n.id}
              className={"node " + (n.hot ? "hot" : "")}
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

function SceneCode() {
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
            <div className="file">~/automations/payment-reconcile.ts</div>
          </div>
          <div className="body">
            <div className="gutter">
              {Array.from({ length: 14 }, (_, i) => <span key={i}>{i + 1}</span>)}
            </div>
            <div className="code">
              <span className="line"><span className="com">// reconcile Stripe + Whop charges → Airtable</span></span>
              <span className="line"><span className="kw">import</span> {"{ table }"} <span className="kw">from</span> <span className="str">&quot;@airtable/scripts&quot;</span>;</span>
              <span className="line"><span className="kw">const</span> <span className="var">charges</span> = <span className="kw">await</span> <span className="fn">fetchCharges</span>({"{ since: lastRun }"});</span>
              <span className="line"></span>
              <span className="line"><span className="kw">for</span> (<span className="kw">const</span> <span className="var">c</span> <span className="kw">of</span> <span className="var">charges</span>) {"{"}</span>
              <span className="line">  <span className="kw">const</span> <span className="var">existing</span> = <span className="kw">await</span> <span className="fn">findByExternalId</span>(<span className="var">c</span>.id);</span>
              <span className="line">  <span className="kw">if</span> (<span className="var">existing</span>) <span className="kw">continue</span>;</span>
              <span className="line"></span>
              <span className="line">  <span className="kw">await</span> <span className="var">table</span>.<span className="fn">createRecord</span>({"{"}</span>
              <span className="line">    <span className="var">amount</span>: <span className="var">c</span>.amount / <span className="num">100</span>,</span>
              <span className="line">    <span className="var">customer</span>: <span className="kw">await</span> <span className="fn">resolveCustomer</span>(<span className="var">c</span>),</span>
              <span className="line">    <span className="var">commission</span>: <span className="fn">splitCommission</span>(<span className="var">c</span>),</span>
              <span className="line">  {"}"});</span>
              <span className="line">{"}"} <span className="caret"></span></span>
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
            <div className="line ai"><span className="who">AI ▸</span> Hi! I&rsquo;m calling to confirm your service window for Tuesday.</div>
            <div className="line"><span className="who">User ▸</span> Tuesday afternoon works.</div>
            <div className="line ai"><span className="who">AI ▸</span> Got it — booking 2 to 4 PM. You&rsquo;ll get a text shortly.</div>
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
      ["Monday.com", "ops"],
      ["ClickUp", "tasks"],
      ["Notion", "docs"],
      ["Google Sheets", "+ apps script"],
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
      ["React", "internal tools"],
      ["Apps Script", "google"],
    ],
    [
      ["Stripe", "payments", true],
      ["Whop", "payments"],
      ["Plug & Pay", "payments"],
      ["Paddle", "payments"],
      ["eSignatures.io", "contracts", true],
      ["PandaDoc", "contracts"],
      ["DocuSign", "contracts"],
      ["GoCanvas", "pdf api"],
      ["ClickSend", "sms", true],
      ["Twilio", "sms + voice"],
      ["Postmark", "email"],
      ["Mailgun", "email"],
    ],
    [
      ["HubSpot", "crm"],
      ["Pipedrive", "crm"],
      ["Close.com", "crm"],
      ["Salesforce", "crm"],
      ["Cal.com", "scheduling", true],
      ["Calendly", "scheduling"],
      ["Google Calendar", "api"],
      ["Slack", "messaging + apps"],
      ["Ubuntu", "self-hosted", true],
      ["Cloudflare", "tunnels"],
      ["Docker", "containers"],
      ["GitHub", "git"],
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
    const enter = () => document.body.classList.add("hovering");
    const leave = () => document.body.classList.remove("hovering");
    const interactive = document.querySelectorAll("a, button, .btn, [data-cursor]");
    interactive.forEach((el) => {
      el.addEventListener("mouseenter", enter);
      el.addEventListener("mouseleave", leave);
    });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      interactive.forEach((el) => {
        el.removeEventListener("mouseenter", enter);
        el.removeEventListener("mouseleave", leave);
      });
    };
  }, []);

  /* Effect 2: smooth-scroll for anchor links — idempotent. */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href").slice(1);
      const tgt = document.getElementById(id);
      if (tgt) {
        e.preventDefault();
        window.scrollTo({ top: tgt.offsetTop, behavior: "smooth" });
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  /* Effect 3: GSAP entrance + ScrollTriggers — run-once via ref guard. */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.gsap) return;
    if (ranRef.current) return;
    ranRef.current = true;
    const gsap = window.gsap;
    if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

    // Hero entrance — fromTo with clearProps so post-animation state is natural CSS.
    const heroAnims = document.querySelectorAll("[data-hero-anim]");
    if (heroAnims.length) {
      gsap.fromTo(
        heroAnims,
        { yPercent: 110, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.1, ease: "expo.out", stagger: 0.08, delay: 0.2, clearProps: "all" }
      );
      gsap.fromTo(
        ".hero-bottom > *",
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, delay: 0.9, ease: "power2.out", clearProps: "all" }
      );
      gsap.fromTo(
        ".hero-tag",
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.5, ease: "power2.out", clearProps: "all" }
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
            for (let i = 0; i < N; i++) {
              const center = i / (N - 1);
              const dist = Math.abs(p - center) * (N - 1);
              const op = Math.max(0, 1 - dist * 1.4);
              const scale = 0.92 + (1 - Math.min(1, dist)) * 0.08;
              const y = (p < center ? 40 : -40) * Math.min(1, dist);
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
