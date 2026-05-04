"use client";
import { useEffect, useRef, useState } from "react";

const VAPI_PUBLIC_KEY = "2297c7cd-40fb-455b-aeb9-f6476a010ed1";
const VAPI_ASSISTANT_ID = "51b17d14-55f2-4ab5-9ecd-a26497277b42";

/* Module-level cross-component bridge for the VAPI → Hero audio reactivity.
   VapiDemo writes here on volume-level / speech events; Hero animate loop reads. */
const audioState = { active: false, level: 0, speaking: false };

/* ============== Hooks ============== */

function useCursor() {
  useEffect(() => {
    const dot = document.getElementById("cursorDot");
    const ring = document.getElementById("cursorRing");
    if (!dot || !ring) return;

    let mx = window.innerWidth / 2,
      my = window.innerHeight / 2;
    let rx = mx,
      ry = my;

    const move = (e) => {
      mx = e.clientX;
      my = e.clientY;
    };
    document.addEventListener("mousemove", move);

    let rafId;
    const tick = () => {
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      rafId = requestAnimationFrame(tick);
    };
    tick();

    const attach = () => {
      const hovers = document.querySelectorAll('a, button, [data-cursor="hover"]');
      hovers.forEach((el) => {
        if (el.__cursorAttached) return;
        el.__cursorAttached = true;
        el.addEventListener("mouseenter", () => ring.classList.add("is-hover"));
        el.addEventListener("mouseleave", () => ring.classList.remove("is-hover"));
      });
    };
    attach();
    const mo = new MutationObserver(attach);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      document.removeEventListener("mousemove", move);
      mo.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, []);
}

function useSmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined" || !window.Lenis) return;
    const lenis = new window.Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
    });
    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);
    window.__lenis = lenis;

    window.smoothScrollTo = (id) => {
      const el = document.getElementById(id);
      if (el) lenis.scrollTo(el, { offset: 0, duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
    };

    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href").slice(1);
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      window.smoothScrollTo(id);
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      lenis.destroy();
      cancelAnimationFrame(rafId);
    };
  }, []);
}

function useReveal() {
  useEffect(() => {
    const observe = () => {
      const els = document.querySelectorAll(".reveal:not(.in)");
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("in");
              io.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
      );
      els.forEach((el) => io.observe(el));
      return io;
    };
    const io = observe();
    const t = setTimeout(observe, 1500);
    return () => {
      io.disconnect();
      clearTimeout(t);
    };
  });
}

function useActiveSection() {
  const [active, setActive] = useState("hero");
  useEffect(() => {
    const sections = ["hero", "philosophy", "build", "demos", "stack", "wins", "contact"];
    const handler = () => {
      let cur = "hero";
      for (const id of sections) {
        const el = document.getElementById(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= window.innerHeight * 0.4) cur = id;
      }
      setActive(cur);
    };
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
  return active;
}

/* ============== Chrome ============== */

function IntroVeil() {
  return (
    <div className="intro-veil">
      <div className="intro-veil-inner">
        <span className="intro-mark">JP</span>
        <span className="intro-line"></span>
        <span className="intro-text">Jay Pokharna · Portfolio v2</span>
      </div>
    </div>
  );
}

function TopNav({ time }) {
  return (
    <nav className="topnav">
      <div className="brand">
        <span className="dot"></span>Jay Pokharna
      </div>
      <div className="meta">
        <span className="hide-sm">Pune, IN · {time}</span>
        <span>Available — May 2026</span>
      </div>
    </nav>
  );
}

function SideRail({ active }) {
  const railRef = useRef(null);
  // Auto-hide. Show when actively scrolling (1.5s linger) OR when cursor near left edge.
  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    let hideTimer = null;
    let scrolling = false;
    let nearLeft = false;
    const sync = () => {
      if (scrolling || nearLeft) el.classList.add("is-visible");
      else el.classList.remove("is-visible");
    };
    const onScroll = () => {
      scrolling = true;
      sync();
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        scrolling = false;
        sync();
      }, 50);
    };
    const onMove = (e) => {
      const want = e.clientX < 120;
      if (want !== nearLeft) {
        nearLeft = want;
        sync();
      }
    };
    // Show briefly on mount so user knows it's there
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMove);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [active]);

  if (active === "hero") return null;
  const items = [
    { id: "hero", label: "Index" },
    { id: "philosophy", label: "50/50" },
    { id: "build", label: "What I Build" },
    { id: "demos", label: "Live Demos" },
    { id: "stack", label: "Stack" },
    { id: "wins", label: "Wins" },
    { id: "contact", label: "Contact" },
  ];
  return (
    <div ref={railRef} className="siderail">
      {items.map((it, i) => (
        <a key={it.id} href={`#${it.id}`} className={active === it.id ? "active" : ""}>
          <span className="num">{String(i + 1).padStart(2, "0")}</span>
          <span className="tick"></span>
          <span className="label">{it.label}</span>
        </a>
      ))}
    </div>
  );
}

function ThemeToggle({ theme, setTheme }) {
  return (
    <button
      className="theme-toggle"
      data-cursor="hover"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
        </svg>
      )}
    </button>
  );
}

/* ============== Hero ============== */

function Word({ children, italic, color }) {
  return (
    <span className={`hero-word-wrap${italic ? " is-italic" : ""}`}>
      <span className="hero-word" style={{ fontStyle: italic ? "italic" : "normal", color: color || "inherit" }}>
        {children}
      </span>
    </span>
  );
}

function Hero() {
  const canvasRef = useRef(null);
  const headlineRef = useRef(null);
  const ctaRef = useRef(null);
  // Shared cross-layer refs:
  //   velocityRef → Layer 2 (Lenis velocity) writes here, Layer 1 (composite shader) reads
  //   audioRef    → Layer 3 (VAPI analyser) writes here, animate loop reads
  const velocityRef = useRef(0);
  const audioRef = useRef({ active: false, low: 0, mid: 0, high: 0 });
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const opts = { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false };
      setTime(new Intl.DateTimeFormat("en-GB", opts).format(new Date()) + " IST");
    };
    update();
    const i = setInterval(update, 60000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const THREE = typeof window !== "undefined" ? window.THREE : null;
    if (!canvas || !THREE) return;
    const scene = new THREE.Scene();
    const w = canvas.clientWidth,
      h = canvas.clientHeight;
    const camera = new THREE.PerspectiveCamera(28, w / h, 0.1, 100);
    camera.position.z = 13.2;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h, false);

    const SPHERE_X = 2.0;
    const inner = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.4, 1),
      new THREE.MeshBasicMaterial({ color: 0xff2d2d, transparent: true, opacity: 0.04 })
    );
    inner.position.x = SPHERE_X;
    scene.add(inner);
    const outer = new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1.6, 2)),
      new THREE.LineBasicMaterial({ color: 0xff2d2d, transparent: true, opacity: 0.85 })
    );
    outer.position.x = SPHERE_X;
    scene.add(outer);
    const ring = new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(2.1, 1)),
      new THREE.LineBasicMaterial({ color: 0x4a7dff, transparent: true, opacity: 0.55 })
    );
    ring.position.x = SPHERE_X;
    scene.add(ring);

    const pCount = 500;
    const positions = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      const r = 3 + Math.random() * 4;
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(p) * Math.cos(t);
      positions[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
      positions[i * 3 + 2] = r * Math.cos(p);
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({ color: 0xf5f3ee, size: 0.025, transparent: true, opacity: 0.6 })
    );
    scene.add(particles);

    /* ===== Layer 4 — scroll-driven shatter setup =====
       Capture original wireframe vertex positions; we displace radially based on scroll progress. */
    const outerOriginalPos = new Float32Array(outer.geometry.attributes.position.array);
    const ringOriginalPos = new Float32Array(ring.geometry.attributes.position.array);
    const morphRef = { value: 0 };
    if (typeof window !== "undefined" && window.gsap && window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);
      window.ScrollTrigger.create({
        trigger: "#hero",
        start: "top top",
        end: "bottom top",
        scrub: 0.6,
        onUpdate: (self) => {
          morphRef.value = self.progress; // 0..1
        },
      });
    }

    /* ===== Layer 1: post-processing pipeline =====
       scene → brightPass → blurH → blurV → composite (with chromatic aberration + grain) → canvas */
    const rtParams = { format: THREE.RGBAFormat, type: THREE.UnsignedByteType, depthBuffer: true, stencilBuffer: false };
    const sceneRT = new THREE.WebGLRenderTarget(w, h, rtParams);
    const brightRT = new THREE.WebGLRenderTarget(Math.max(2, Math.floor(w / 2)), Math.max(2, Math.floor(h / 2)), { ...rtParams, depthBuffer: false });
    const blurHRT = new THREE.WebGLRenderTarget(brightRT.width, brightRT.height, { ...rtParams, depthBuffer: false });
    const blurVRT = new THREE.WebGLRenderTarget(brightRT.width, brightRT.height, { ...rtParams, depthBuffer: false });

    const fxScene = new THREE.Scene();
    const fxCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const fxQuadGeo = new THREE.PlaneGeometry(2, 2);
    const vsQuad = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position, 1.0); }";

    const matBright = new THREE.ShaderMaterial({
      vertexShader: vsQuad,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float threshold;
        varying vec2 vUv;
        void main() {
          vec4 c = texture2D(tDiffuse, vUv);
          float l = dot(c.rgb, vec3(0.2126, 0.7152, 0.0722));
          float w = max(0.0, l - threshold) / max(0.001, 1.0 - threshold);
          gl_FragColor = vec4(c.rgb * w, c.a);
        }
      `,
      uniforms: { tDiffuse: { value: null }, threshold: { value: 0.55 } },
      depthTest: false, depthWrite: false,
    });
    const matBlurH = new THREE.ShaderMaterial({
      vertexShader: vsQuad,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec2 resolution;
        varying vec2 vUv;
        void main() {
          vec2 step = vec2(1.0 / resolution.x, 0.0);
          vec3 c = vec3(0.0);
          c += texture2D(tDiffuse, vUv - 4.0 * step).rgb * 0.05;
          c += texture2D(tDiffuse, vUv - 3.0 * step).rgb * 0.09;
          c += texture2D(tDiffuse, vUv - 2.0 * step).rgb * 0.12;
          c += texture2D(tDiffuse, vUv - 1.0 * step).rgb * 0.15;
          c += texture2D(tDiffuse, vUv               ).rgb * 0.18;
          c += texture2D(tDiffuse, vUv + 1.0 * step).rgb * 0.15;
          c += texture2D(tDiffuse, vUv + 2.0 * step).rgb * 0.12;
          c += texture2D(tDiffuse, vUv + 3.0 * step).rgb * 0.09;
          c += texture2D(tDiffuse, vUv + 4.0 * step).rgb * 0.05;
          gl_FragColor = vec4(c, 1.0);
        }
      `,
      uniforms: { tDiffuse: { value: null }, resolution: { value: new THREE.Vector2(brightRT.width, brightRT.height) } },
      depthTest: false, depthWrite: false,
    });
    const matBlurV = new THREE.ShaderMaterial({
      vertexShader: vsQuad,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec2 resolution;
        varying vec2 vUv;
        void main() {
          vec2 step = vec2(0.0, 1.0 / resolution.y);
          vec3 c = vec3(0.0);
          c += texture2D(tDiffuse, vUv - 4.0 * step).rgb * 0.05;
          c += texture2D(tDiffuse, vUv - 3.0 * step).rgb * 0.09;
          c += texture2D(tDiffuse, vUv - 2.0 * step).rgb * 0.12;
          c += texture2D(tDiffuse, vUv - 1.0 * step).rgb * 0.15;
          c += texture2D(tDiffuse, vUv               ).rgb * 0.18;
          c += texture2D(tDiffuse, vUv + 1.0 * step).rgb * 0.15;
          c += texture2D(tDiffuse, vUv + 2.0 * step).rgb * 0.12;
          c += texture2D(tDiffuse, vUv + 3.0 * step).rgb * 0.09;
          c += texture2D(tDiffuse, vUv + 4.0 * step).rgb * 0.05;
          gl_FragColor = vec4(c, 1.0);
        }
      `,
      uniforms: { tDiffuse: { value: null }, resolution: { value: new THREE.Vector2(brightRT.width, brightRT.height) } },
      depthTest: false, depthWrite: false,
    });
    const matComposite = new THREE.ShaderMaterial({
      vertexShader: vsQuad,
      fragmentShader: `
        uniform sampler2D tScene;
        uniform sampler2D tBloom;
        uniform float uBloom;
        uniform float uVelocity;
        uniform float uTime;
        varying vec2 vUv;
        void main() {
          vec2 uv = vUv;
          vec2 dir = uv - 0.5;
          float aber = clamp(uVelocity, 0.0, 4.0) * 0.005;
          vec4 sScene = texture2D(tScene, uv);
          float r = texture2D(tScene, uv + dir * aber).r;
          float g = sScene.g;
          float b = texture2D(tScene, uv - dir * aber).b;
          vec3 sceneCol = vec3(r, g, b);
          vec3 bloom = texture2D(tBloom, uv).rgb;
          vec3 col = sceneCol + bloom * uBloom;
          float grain = (fract(sin(dot(uv * (1.0 + uTime * 0.0001), vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.025;
          col += grain;
          gl_FragColor = vec4(col, sScene.a);
        }
      `,
      uniforms: {
        tScene: { value: null },
        tBloom: { value: null },
        uBloom: { value: 0.85 },
        uVelocity: { value: 0 },
        uTime: { value: 0 },
      },
      transparent: true,
      depthTest: false, depthWrite: false,
    });

    const fxQuad = new THREE.Mesh(fxQuadGeo, matBright);
    fxScene.add(fxQuad);

    const renderPass = (mat, target) => {
      fxQuad.material = mat;
      renderer.setRenderTarget(target || null);
      renderer.render(fxScene, fxCam);
    };

    let mx = 0,
      my = 0,
      scrollY = 0;
    const onMove = (e) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 0.6;
      my = (e.clientY / window.innerHeight - 0.5) * 0.6;
    };
    const onScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("scroll", onScroll, { passive: true });

    // Layer 3 — smoothed audio reactivity state, lerped each frame from module-level audioState
    const audioFade = { amp: 0, speak: 0, active: 0 };
    // Cache base material values so we can restore them
    const innerBaseOpacity = inner.material.opacity;
    const outerBaseOpacity = outer.material.opacity;
    const ringBaseOpacity = ring.material.opacity;
    const colorRed = new THREE.Color(0xff2d2d);
    const colorRedSoft = new THREE.Color(0xff6363);
    const tmpColor = new THREE.Color();

    let rafId;
    const start = performance.now();
    let lastT = start;
    const animate = () => {
      const now = performance.now();
      const t = (now - start) / 1000;
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;
      const sf = Math.min(scrollY / 800, 1);

      // Layer 2 — pull Lenis velocity into smoothed velocityRef.
      const rawVel = window.__lenis ? Math.abs(window.__lenis.velocity || 0) : 0;
      const velTarget = Math.min(rawVel / 30, 4);
      velocityRef.current += (velTarget - velocityRef.current) * Math.min(1, dt * 6);

      // Layer 3 — smooth the raw audioState into audioFade
      const ampTarget = audioState.active ? Math.min(1, audioState.level * 1.4) : 0;
      const speakTarget = audioState.active && audioState.speaking ? 1 : 0;
      const activeTarget = audioState.active ? 1 : 0;
      audioFade.amp += (ampTarget - audioFade.amp) * Math.min(1, dt * 12);
      audioFade.speak += (speakTarget - audioFade.speak) * Math.min(1, dt * 4);
      audioFade.active += (activeTarget - audioFade.active) * Math.min(1, dt * 2.5);

      outer.rotation.x = t * 0.2 + my * 0.5 + sf * 0.5;
      outer.rotation.y = t * 0.3 + mx * 0.5;
      inner.rotation.x = -t * 0.15;
      inner.rotation.y = -t * 0.25;
      ring.rotation.x = t * 0.1 - my * 0.3;
      ring.rotation.y = -t * 0.15 - mx * 0.3;
      particles.rotation.y = t * 0.04;
      const pulse = 1 + Math.sin(t * 1.5) * 0.04;
      // Layer 3 — audio-driven beat on top of base pulse
      const audioBeat = audioFade.amp * 0.18; // up to +18% scale on loud audio
      const baseScale = pulse * (1 - sf * 0.2) * (1 + audioBeat);
      const vStretch = 1 + velocityRef.current * 0.06;
      const vSquash = 1 - velocityRef.current * 0.025;
      outer.scale.set(baseScale * vSquash, baseScale * vStretch, baseScale * vSquash);
      ring.scale.set(vSquash * (1 + audioBeat * 0.4), vStretch * (1 + audioBeat * 0.4), vSquash * (1 + audioBeat * 0.4));
      inner.scale.set(vSquash * (1 + audioBeat), vStretch * (1 + audioBeat), vSquash * (1 + audioBeat));

      // Layer 3 — opacity & color shifts when call is live
      inner.material.opacity = innerBaseOpacity + audioFade.active * (0.18 + audioFade.amp * 0.45);
      outer.material.opacity = outerBaseOpacity + audioFade.amp * 0.12;
      ring.material.opacity = ringBaseOpacity + audioFade.amp * 0.35;
      // Color shift: agent speaking → softer red (cream-leaning); silent → deep red
      tmpColor.copy(colorRed).lerp(colorRedSoft, audioFade.speak);
      outer.material.color.copy(tmpColor);
      inner.material.color.copy(tmpColor);

      particles.material.size = 0.025 + velocityRef.current * 0.012 + audioFade.amp * 0.02;
      particles.material.opacity = 0.6 + Math.min(0.3, velocityRef.current * 0.08) + audioFade.amp * 0.15;

      // Layer 4 — scroll shatter: radially displace wireframe vertices.
      // morph 0 = compact, 1 = exploded (vertices drift outward + extra rotation)
      const m = morphRef.value;
      if (m > 0.001) {
        const factor = 1 + m * 1.6; // up to 2.6x outward
        const jitter = m * 0.4;     // adds chaos
        const op = outer.geometry.attributes.position.array;
        for (let i = 0; i < op.length; i += 3) {
          const ox = outerOriginalPos[i], oy = outerOriginalPos[i + 1], oz = outerOriginalPos[i + 2];
          // Stable per-vertex pseudo-random direction nudge
          const seed = i * 0.137;
          const jx = Math.sin(seed) * jitter;
          const jy = Math.cos(seed * 1.3) * jitter;
          const jz = Math.sin(seed * 2.1) * jitter;
          op[i] = ox * factor + jx;
          op[i + 1] = oy * factor + jy;
          op[i + 2] = oz * factor + jz;
        }
        outer.geometry.attributes.position.needsUpdate = true;
        const rp = ring.geometry.attributes.position.array;
        for (let i = 0; i < rp.length; i += 3) {
          rp[i] = ringOriginalPos[i] * (1 + m * 1.2);
          rp[i + 1] = ringOriginalPos[i + 1] * (1 + m * 1.2);
          rp[i + 2] = ringOriginalPos[i + 2] * (1 + m * 1.2);
        }
        ring.geometry.attributes.position.needsUpdate = true;
        // Fade out as it shatters; boost rotation for the chaos feel
        outer.material.opacity = (outerBaseOpacity + audioFade.amp * 0.12) * (1 - m * 0.85);
        ring.material.opacity = (ringBaseOpacity + audioFade.amp * 0.35) * (1 - m * 0.9);
        inner.material.opacity = (innerBaseOpacity + audioFade.active * (0.18 + audioFade.amp * 0.45)) * (1 - m);
        outer.rotation.y += m * 0.04;
        ring.rotation.y -= m * 0.05;
      } else if (outer.geometry.attributes.position.array[0] !== outerOriginalPos[0]) {
        // Restore exact original on the way back to morph=0 (avoids drift)
        outer.geometry.attributes.position.array.set(outerOriginalPos);
        outer.geometry.attributes.position.needsUpdate = true;
        ring.geometry.attributes.position.array.set(ringOriginalPos);
        ring.geometry.attributes.position.needsUpdate = true;
      }

      camera.position.z = 13.2 + sf * 2;

      // 1. scene → sceneRT
      renderer.setRenderTarget(sceneRT);
      renderer.clear();
      renderer.render(scene, camera);
      // 2. brightpass → brightRT
      matBright.uniforms.tDiffuse.value = sceneRT.texture;
      renderPass(matBright, brightRT);
      // 3. blurH → blurHRT
      matBlurH.uniforms.tDiffuse.value = brightRT.texture;
      renderPass(matBlurH, blurHRT);
      // 4. blurV → blurVRT
      matBlurV.uniforms.tDiffuse.value = blurHRT.texture;
      renderPass(matBlurV, blurVRT);
      // 5. composite → canvas
      matComposite.uniforms.tScene.value = sceneRT.texture;
      matComposite.uniforms.tBloom.value = blurVRT.texture;
      matComposite.uniforms.uVelocity.value = velocityRef.current;
      matComposite.uniforms.uTime.value = t;
      renderPass(matComposite, null);

      rafId = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      const w2 = canvas.clientWidth,
        h2 = canvas.clientHeight;
      camera.aspect = w2 / h2;
      camera.updateProjectionMatrix();
      renderer.setSize(w2, h2, false);
      sceneRT.setSize(w2, h2);
      const bw = Math.max(2, Math.floor(w2 / 2)),
        bh = Math.max(2, Math.floor(h2 / 2));
      brightRT.setSize(bw, bh);
      blurHRT.setSize(bw, bh);
      blurVRT.setSize(bw, bh);
      matBlurH.uniforms.resolution.value.set(bw, bh);
      matBlurV.uniforms.resolution.value.set(bw, bh);
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      // Layer 4 — kill ScrollTriggers we created (Fast Refresh safety)
      if (typeof window !== "undefined" && window.ScrollTrigger) {
        window.ScrollTrigger.getAll().forEach((st) => {
          if (st.trigger && st.trigger.id === "hero") st.kill();
        });
      }
      sceneRT.dispose();
      brightRT.dispose();
      blurHRT.dispose();
      blurVRT.dispose();
      matBright.dispose();
      matBlurH.dispose();
      matBlurV.dispose();
      matComposite.dispose();
      fxQuadGeo.dispose();
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.gsap) return;
    const gsap = window.gsap;
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

    tl.fromTo(".intro-veil", { yPercent: 0 }, { yPercent: -100, duration: 1.4, ease: "power4.inOut" }, 0);
    tl.fromTo(".topnav", { y: -40, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, 0.6);
    tl.fromTo(".siderail", { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 1 }, 0.7);
    tl.fromTo(".theme-toggle", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, 0.7);
    tl.fromTo(".hero-meta > *", { y: -16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.08 }, 0.7);

    const words = headlineRef.current?.querySelectorAll(".hero-word");
    if (words) {
      tl.fromTo(words, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.2, stagger: 0.07 }, 0.85);
    }

    tl.fromTo(".hero-pitch", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, 1.5);
    tl.fromTo(".hero-cta-row", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, 1.65);
    tl.fromTo(".hero-scroll", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, 1.9);
    tl.add(() => {
      document.body.classList.add("intro-done");
      headlineRef.current?.classList.add("is-revealed");
    }, 2.2);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const el = document.querySelector(".hero-scroll");
      if (!el) return;
      if (window.scrollY > 100) el.classList.add("hide");
      else el.classList.remove("hide");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const cta = ctaRef.current;
    if (!cta) return;
    const onMove = (e) => {
      const r = cta.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const dist = Math.hypot(dx, dy);
      if (dist < 120) {
        cta.style.transform = `translate(${dx * 0.18}px, ${dy * 0.18}px)`;
      } else {
        cta.style.transform = "";
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const handleCtaClick = (e) => {
    e.preventDefault();
    window.smoothScrollTo?.("contact");
  };

  return (
    <section id="hero" className="hero" data-screen-label="01 Hero">
      <canvas ref={canvasRef} className="hero-canvas"></canvas>

      <div className="hero-content">
        <div className="hero-meta">
          <span>(01) — Index · Jay Pokharna</span>
          <span className="hero-time">{time}</span>
        </div>

        <h1 ref={headlineRef} className="hero-headline">
          <span className="hero-line">
            <Word>Systems</Word> <Word>that</Word>{" "}
            <Word italic color="var(--red)">
              actually
            </Word>
          </span>
          <span className="hero-line">
            <Word>hold</Word> <Word>up.</Word>
          </span>
        </h1>

        <div className="hero-bottom">
          <div className="hero-pitch">
            <p>
              <strong>I&rsquo;m Jay Pokharna</strong> — AI &amp; automation engineer. I build operational backbones for
              service businesses that have outgrown manual work.
            </p>
            <p className="hero-meta-2">Etherwise · 3,000+ automations · 70+ clients</p>
          </div>
          <div className="hero-cta-row">
            <a
              ref={ctaRef}
              className="hero-cta cta-pulse"
              href="#contact"
              data-cursor="hover"
              data-nav-target="contact"
              onClick={handleCtaClick}
            >
              <span className="hero-cta-inner">
                <span>Start a project with Jay</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </a>
          </div>
        </div>
      </div>

      <div className="hero-scroll">
        <span>Scroll</span>
        <span className="hero-scroll-line"></span>
      </div>
    </section>
  );
}

/* ============== Philosophy ============== */

function Philosophy() {
  return (
    <section id="philosophy" className="section philosophy" data-screen-label="02 Philosophy">
      <div className="inner">
        <div className="section-header reveal">
          <span className="section-num">(02) The Split</span>
        </div>
        <h2 className="section-title reveal" style={{ marginBottom: 0 }}>
          Half code,
          <br />
          half no-code.
          <br />
          <em style={{ color: "var(--ink-faint)", fontStyle: "italic", fontFamily: "Instrument Serif, serif" }}>
            Always.
          </em>
        </h2>

        <div className="philosophy-split reveal">
          <div className="philosophy-col nocode">
            <div className="col-tag">(A) No-Code</div>
            <h3>
              When <em>visual</em> wins.
            </h3>
            <ul>
              <li>Logic is sequential, integrations are well-supported.</li>
              <li>The team owning the workflow needs to read &amp; edit it without engineering help.</li>
              <li>Business rules will keep changing as the team learns.</li>
              <li>Value is in shipping fast and iterating in front of users.</li>
            </ul>
          </div>
          <div className="philosophy-col code">
            <div className="col-tag">(B) Code</div>
            <h3>
              When <em>precision</em> wins.
            </h3>
            <ul>
              <li>Loops or conditional branching that visual tools start to ugly-fy.</li>
              <li>Operating on hundreds+ of records without timing out.</li>
              <li>Precise control over error handling and retries.</li>
              <li>API has no polished connector, or operation must be auditable.</li>
            </ul>
          </div>
        </div>

        <div className="philosophy-blend reveal">
          In practice, almost every real client project ends up being a blend. A <strong>Make.com</strong> scenario
          triggers an <strong>Airtable</strong> script that calls a custom webhook that talks to a CRM. The visual
          layer holds the orchestration; the code holds the precision. That hybrid is where I&rsquo;m most useful — and
          it&rsquo;s the part most engineers either don&rsquo;t know how to do, or don&rsquo;t enjoy doing.
        </div>
      </div>
    </section>
  );
}

/* ============== Build ============== */

function Build() {
  const cards = [
    {
      num: "01",
      title: "Operational Backbones",
      desc: "CRM + Airtable/Monday + scheduling + docs + payments + messaging — designed to run as one system, not six disconnected ones.",
      tags: ["Make.com", "Airtable", "Monday", "Cal.com"],
    },
    {
      num: "02",
      title: "Payment & Contract Infra",
      desc: "Whop, Stripe, Plug & Pay end-to-end. Dynamic checkout links, commission splits, eSignatures.io with multi-language templates and audit trails.",
      tags: ["Stripe", "Whop", "eSignatures", "PandaDoc"],
    },
    {
      num: "03",
      title: "Voice AI Agents",
      desc: "VAPI agents for trades, concierge, outbound qualification. Humanized prompts, dynamic context via LiquidJS, calendar + CRM integrations.",
      tags: ["VAPI", "LiquidJS", "Bland"],
    },
    {
      num: "04",
      title: "Custom Integrations",
      desc: "Webhook receivers, Airtable scripts, scheduled jobs, retry logic, error queues — for every API that doesn’t fit a no-code box.",
      tags: ["Node.js", "TypeScript", "Webhooks"],
    },
    {
      num: "05",
      title: "SMS & Multi-Channel",
      desc: "ClickSend, Twilio. Inbound STOP detection, opt-out propagation, conversation threading, deduplication across automations.",
      tags: ["ClickSend", "Twilio", "Postmark"],
    },
    {
      num: "06",
      title: "Scheduling & Calendar Logic",
      desc: "Conflict detection across team members, time zone math that survives DST, hold-and-release patterns, graceful Cal.com / Calendly fallbacks.",
      tags: ["Cal.com", "Calendly", "Google Cal"],
    },
  ];

  return (
    <section id="build" className="section build" data-screen-label="03 Build">
      <div className="inner">
        <div className="section-header reveal">
          <span className="section-num">(03) What I Build</span>
        </div>
        <h2 className="section-title reveal" style={{ marginBottom: 80 }}>
          Six lanes.
          <br />
          <span style={{ color: "var(--ink-faint)", fontFamily: "Instrument Serif, serif", fontStyle: "italic" }}>
            One thread:
          </span>
          <br />
          ship → document → handoff.
        </h2>

        <div className="build-grid reveal">
          {cards.map((c) => (
            <div key={c.num} className="build-card" data-cursor="hover">
              <div className="build-card-num">({c.num})</div>
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
              <div className="build-card-tags">
                {c.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============== Demos ============== */

function VapiDemo() {
  const [calling, setCalling] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");
  const vapiRef = useRef(null);
  const transcriptRef = useRef(null);

  useEffect(() => {
    try {
      const C =
        (typeof window !== "undefined" &&
          (window.Vapi?.default || window.Vapi || window.vapiSDK?.default || window.VapiAI)) ||
        null;
      if (!C) return;
      const v = new C(VAPI_PUBLIC_KEY);
      vapiRef.current = v;

      v.on("call-start", () => {
        setConnecting(false);
        setCalling(true);
        audioState.active = true;
        audioState.level = 0;
        audioState.speaking = false;
      });
      v.on("call-end", () => {
        setCalling(false);
        setConnecting(false);
        audioState.active = false;
        audioState.level = 0;
        audioState.speaking = false;
      });
      v.on("error", (e) => {
        setError(e?.message || "Call error");
        setCalling(false);
        setConnecting(false);
        audioState.active = false;
      });
      v.on("message", (m) => {
        if (m.type === "transcript" && m.transcriptType === "final") {
          setMessages((prev) => [...prev, { role: m.role === "assistant" ? "agent" : "user", text: m.transcript }]);
        }
      });
      // Layer 3 — audio reactivity. VAPI emits 'volume-level' (0..1) for agent audio.
      v.on("volume-level", (level) => {
        audioState.level = typeof level === "number" ? level : 0;
      });
      v.on("speech-start", () => {
        audioState.speaking = true;
      });
      v.on("speech-end", () => {
        audioState.speaking = false;
      });
    } catch (e) {
      // SDK not loaded
    }
  }, []);

  useEffect(() => {
    if (transcriptRef.current) transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
  }, [messages]);

  const startCall = async () => {
    setError("");
    setMessages([]);
    if (!vapiRef.current) {
      setError("VAPI SDK failed to load — try refreshing.");
      return;
    }
    setConnecting(true);
    try {
      await vapiRef.current.start(VAPI_ASSISTANT_ID);
    } catch (e) {
      setError(e?.message || "Could not start call. Mic permission required.");
      setConnecting(false);
    }
  };

  const endCall = () => {
    if (vapiRef.current) try { vapiRef.current.stop(); } catch (e) {}
    setCalling(false);
    setConnecting(false);
  };

  const status = connecting ? "Connecting…" : calling ? "Live · Sarah is on the line" : "Idle · ready to dial";

  return (
    <div className="vapi-demo">
      <div className="vapi-left">
        <div>
          <div className="vapi-status">
            <span className={`live-dot ${calling ? "calling" : ""}`}></span>
            <span>{status}</span>
          </div>
          <div
            style={{
              fontFamily: "Instrument Serif, serif",
              fontSize: 30,
              fontStyle: "italic",
              letterSpacing: "-0.02em",
              marginBottom: 8,
            }}
          >
            Sarah
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-soft)", maxWidth: 320, lineHeight: 1.55 }}>
            A real VAPI voice agent built by Jay. Click <strong>Start Call</strong>, allow your microphone, and talk to
            her live. Sarah books appointments, handles objections, and confirms by SMS — same shape Jay ships for
            service businesses.
          </div>
          {error ? (
            <div style={{ marginTop: 16, fontSize: 12, color: "var(--red)", fontFamily: "JetBrains Mono, monospace" }}>
              {error}
            </div>
          ) : null}
        </div>
        <div className="vapi-orb-wrap">
          <div className={`vapi-orb ${calling ? "calling" : ""}`}></div>
        </div>
        <div className="vapi-controls">
          {!calling && !connecting ? (
            <button className="vapi-btn start" data-cursor="hover" onClick={startCall}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.05-.24c1.16.39 2.42.6 3.71.6a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.29.21 2.55.6 3.72a1 1 0 0 1-.25 1.05z" />
              </svg>
              Start Call
            </button>
          ) : (
            <button className="vapi-btn end" data-cursor="hover" onClick={endCall}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M6 18L18 6" />
              </svg>
              End
            </button>
          )}
        </div>
      </div>
      <div className="vapi-right" ref={transcriptRef}>
        <div className="vapi-transcript-head">Live Transcript · Sarah · Jay&rsquo;s VAPI agent</div>
        {messages.length === 0 && (
          <div
            style={{
              color: "var(--ink-faint)",
              fontStyle: "italic",
              fontFamily: "Instrument Serif, serif",
              fontSize: 18,
            }}
          >
            Press start, allow mic — talk to Sarah live. Transcript will stream in here.
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`vapi-msg ${m.role}`}>
            <span className="role">{m.role === "agent" ? "⏵ Sarah · Agent" : "⏵ You"}</span>
            <span className="text">{m.text}</span>
          </div>
        ))}
        {connecting && (
          <div className="vapi-msg" style={{ opacity: 0.6 }}>
            <span className="typing"></span>
            <span className="typing"></span>
            <span className="typing"></span>
          </div>
        )}
      </div>
    </div>
  );
}

function FlowDemo() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setStep((s) => (s + 1) % 7), 1400);
    return () => clearInterval(i);
  }, []);
  const nodes = [
    { id: 0, x: 12, y: 22, label: "Form Submit", sub: "Webflow", color: "#ff2d2d" },
    { id: 1, x: 32, y: 22, label: "Make Scenario", sub: "route + enrich", color: "#9333ea" },
    { id: 2, x: 32, y: 70, label: "Airtable Script", sub: "native JS", color: "#2962ff" },
    { id: 3, x: 56, y: 35, label: "Stripe API", sub: "checkout link", color: "#22c55e" },
    { id: 4, x: 56, y: 78, label: "eSignatures", sub: "NL/EN template", color: "#f59e0b" },
    { id: 5, x: 80, y: 56, label: "ClickSend SMS", sub: "STOP-aware", color: "#ec4899" },
    { id: 6, x: 80, y: 22, label: "Slack", sub: "ops channel", color: "#22d3ee" },
  ];
  const edges = [
    [0, 1],
    [1, 2],
    [2, 3],
    [2, 4],
    [3, 5],
    [4, 5],
    [5, 6],
  ];
  return (
    <div className="flow-stage">
      <svg className="flow-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        {edges.map(([a, b], i) => {
          const na = nodes[a],
            nb = nodes[b];
          const active = step === b;
          const midX = (na.x + nb.x) / 2;
          return (
            <path
              key={i}
              className={`flow-path ${active ? "active" : ""}`}
              d={`M ${na.x} ${na.y} C ${midX} ${na.y}, ${midX} ${nb.y}, ${nb.x} ${nb.y}`}
            />
          );
        })}
      </svg>
      {nodes.map((n) => (
        <div
          key={n.id}
          className={`flow-node ${step === n.id ? "active" : ""}`}
          style={{ left: `${n.x}%`, top: `${n.y}%` }}
        >
          <div className="ico" style={{ background: n.color }}>
            {n.label[0]}
          </div>
          <div>
            <div className="label">{n.label}</div>
            <span className="sub">{n.sub}</span>
          </div>
        </div>
      ))}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: 24,
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "var(--ink-faint)",
        }}
      >
        Live trace · payment-onboarding flow built by Jay · 7 hops · ~3.2s end-to-end
      </div>
    </div>
  );
}

function SplitDemo() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 80);
    return () => clearInterval(i);
  }, []);

  const nodes = [
    { id: 0, col: 0, row: 1, label: "Trigger", sub: "Webflow form", color: "#22c55e" },
    { id: 1, col: 1, row: 1, label: "Iterate", sub: "rows in batch", color: "#2962ff" },
    { id: 2, col: 2, row: 0, label: "HTTP", sub: "enrich · CRM", color: "#f59e0b" },
    { id: 3, col: 2, row: 2, label: "Validate", sub: "rules engine", color: "#a855f7" },
    { id: 4, col: 3, row: 1, label: "Update DB", sub: "Airtable", color: "#ec4899" },
  ];
  const edges = [
    { from: 0, to: 1 },
    { from: 1, to: 2 },
    { from: 1, to: 3 },
    { from: 2, to: 4 },
    { from: 3, to: 4 },
  ];
  const cycleStep = Math.floor(tick / 14) % 5;

  const COL_X = [12, 38, 64, 88];
  const ROW_Y = [22, 50, 78];
  const pos = (n) => ({ x: COL_X[n.col], y: ROW_Y[n.row] });

  const codeLines = [
    [{ c: "com", t: "// payment plan generator · airtable script" }],
    [
      { c: "kw", t: "const" },
      { c: "", t: " deals = " },
      { c: "kw", t: "await" },
      { c: "", t: " base." },
      { c: "fn", t: "getTable" },
      { c: "", t: "(" },
      { c: "str", t: '"Deals"' },
      { c: "", t: ")." },
      { c: "fn", t: "select" },
      { c: "", t: "()." },
      { c: "fn", t: "all" },
      { c: "", t: "();" },
    ],
    [],
    [
      { c: "kw", t: "for" },
      { c: "", t: " (" },
      { c: "kw", t: "const" },
      { c: "", t: " d " },
      { c: "kw", t: "of" },
      { c: "", t: " deals) {" },
    ],
    [
      { c: "", t: "  " },
      { c: "kw", t: "const" },
      { c: "", t: " total = d." },
      { c: "fn", t: "getCellValue" },
      { c: "", t: "(" },
      { c: "str", t: '"Amount"' },
      { c: "", t: ");" },
    ],
    [
      { c: "", t: "  " },
      { c: "kw", t: "const" },
      { c: "", t: " plan  = " },
      { c: "fn", t: "splitPlan" },
      { c: "", t: "(total, " },
      { c: "num", t: "6" },
      { c: "", t: ");" },
    ],
    [
      { c: "", t: "  " },
      { c: "kw", t: "const" },
      { c: "", t: " link  = " },
      { c: "kw", t: "await" },
      { c: "", t: " " },
      { c: "fn", t: "createCheckout" },
      { c: "", t: "(d.id, plan);" },
    ],
    [
      { c: "", t: "  " },
      { c: "kw", t: "await" },
      { c: "", t: " " },
      { c: "fn", t: "sendSMS" },
      { c: "", t: "(d.phone, link);" },
    ],
    [
      { c: "", t: "  " },
      { c: "kw", t: "await" },
      { c: "", t: " base." },
      { c: "fn", t: "updateRecord" },
      { c: "", t: "(d.id, { status: " },
      { c: "str", t: '"sent"' },
      { c: "", t: " });" },
    ],
    [{ c: "", t: "}" }],
    [],
    [{ c: "com", t: "// Airtable runs this. Make.com calls it. Both win." }],
  ];
  const totalChars = codeLines.reduce((s, l) => s + l.reduce((s2, t) => s2 + t.t.length, 0), 0);
  const cycleLen = totalChars + 60;
  const charsToShow = Math.min(totalChars, (tick * 5) % cycleLen);
  let chars = 0;
  const renderedLines = codeLines.map((tokens, li) => {
    const out = [];
    for (const t of tokens) {
      const remaining = charsToShow - chars;
      if (remaining <= 0) break;
      const shown = t.t.slice(0, Math.max(0, remaining));
      out.push(
        <span key={out.length} className={t.c}>
          {shown}
        </span>
      );
      chars += t.t.length;
      if (chars >= charsToShow) break;
    }
    let lastLineWithContent = -1;
    for (let i = codeLines.length - 1; i >= 0; i--) {
      let cs = 0;
      for (let j = 0; j <= i; j++) for (const t of codeLines[j]) cs += t.t.length;
      if (cs <= charsToShow) {
        lastLineWithContent = i;
        break;
      }
    }
    const showCursor = li === Math.min(lastLineWithContent + 1, codeLines.length - 1) && out.length === 0 && chars >= charsToShow;
    const showInlineCursor =
      li === lastLineWithContent && chars >= charsToShow && out.length > 0 && li === codeLines.length - 1;
    return (
      <div key={li} className="cl">
        {out.length ? out : <span>&nbsp;</span>}
        {showInlineCursor || showCursor ? <span className="cursor-bar"></span> : null}
      </div>
    );
  });

  return (
    <div className="split-stage">
      <div className="split-side nocode">
        <div className="split-label">No-code · Make.com</div>
        <h3>Drag, connect, ship.</h3>
        <p className="split-sub">
          Visual flows the team can read and edit. Best for orchestration and rules that change weekly.
        </p>
        <div className="nc-stage">
          <svg className="nc-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <marker
                id="ncArrow"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
              </marker>
            </defs>
            {edges.map((e, i) => {
              const a = pos(nodes[e.from]);
              const b = pos(nodes[e.to]);
              const active = cycleStep === e.to;
              const dx = b.x - a.x;
              const c1x = a.x + dx * 0.5;
              const c2x = b.x - dx * 0.5;
              const d = `M ${a.x} ${a.y} C ${c1x} ${a.y}, ${c2x} ${b.y}, ${b.x} ${b.y}`;
              return <path key={i} className={`nc-line ${active ? "lit" : ""}`} d={d} markerEnd="url(#ncArrow)" />;
            })}
          </svg>
          {nodes.map((n) => {
            const p = pos(n);
            return (
              <div
                key={n.id}
                className={`nc-node ${cycleStep === n.id ? "lit" : ""}`}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
              >
                <span className="swatch" style={{ background: n.color }}></span>
                <span className="nc-text">
                  <span className="nc-label">{n.label}</span>
                  <span className="nc-sub">{n.sub}</span>
                </span>
              </div>
            );
          })}
          <div className="nc-foot">▸ live trace · {cycleStep + 1}/5</div>
        </div>
      </div>
      <div className="split-side code">
        <div className="split-label">Code · Airtable scripting</div>
        <h3>When precision wins.</h3>
        <p className="split-sub">
          Native JS for loops, retries, math, audit trails. Best for the parts that have to be exactly right.
        </p>
        <div className="code-panel-wrap">
          <div className="code-panel">{renderedLines}</div>
        </div>
      </div>
    </div>
  );
}

function Demos() {
  const [tab, setTab] = useState("vapi");
  return (
    <section id="demos" className="section demos" data-screen-label="04 Demos">
      <div className="inner">
        <div className="section-header reveal">
          <span className="section-num">(04) Live Demos · Built by Jay</span>
        </div>
        <h2 className="section-title reveal" style={{ marginBottom: 24 }}>
          Press play.
          <br />
          <em style={{ color: "var(--ink-faint)", fontFamily: "Instrument Serif, serif", fontStyle: "italic" }}>
            See it run.
          </em>
        </h2>
        <p className="reveal" style={{ maxWidth: 540, color: "var(--ink-soft)", fontSize: 16, marginBottom: 56 }}>
          Three of the most common shapes a Jay-built system takes — running here in your browser.
        </p>
        <div className="demos-tabs reveal">
          <button
            className={`demos-tab ${tab === "vapi" ? "active" : ""}`}
            onClick={() => setTab("vapi")}
            data-cursor="hover"
          >
            ▸ Voice Agent
          </button>
          <button
            className={`demos-tab ${tab === "flow" ? "active" : ""}`}
            onClick={() => setTab("flow")}
            data-cursor="hover"
          >
            ▸ Automation Flow
          </button>
          <button
            className={`demos-tab ${tab === "split" ? "active" : ""}`}
            onClick={() => setTab("split")}
            data-cursor="hover"
          >
            ▸ Code vs No-Code
          </button>
        </div>
        <div className="demos-stage reveal">
          {tab === "vapi" && <VapiDemo />}
          {tab === "flow" && <FlowDemo />}
          {tab === "split" && <SplitDemo />}
        </div>
      </div>
    </section>
  );
}

/* ============== Stack ============== */

function Stack() {
  const railRef1 = useRef(null);
  const railRef2 = useRef(null);

  const row1 = [
    { cat: "Automation", name: "Make.com", color: "#9333ea" },
    { cat: "Automation", name: "n8n", color: "#ff2d2d" },
    { cat: "Database", name: "Airtable", color: "#facc15" },
    { cat: "Voice AI", name: "VAPI", color: "#22c55e" },
    { cat: "Voice AI", name: "Bland.ai", color: "#a855f7" },
    { cat: "Payments", name: "Stripe", color: "#635bff" },
    { cat: "Payments", name: "Whop", color: "#ff6b35" },
    { cat: "Docs", name: "eSignatures", color: "#06b6d4" },
    { cat: "Comms", name: "ClickSend", color: "#ec4899" },
  ];
  const row2 = [
    { cat: "Comms", name: "Twilio", color: "#f43f5e" },
    { cat: "Schedule", name: "Cal.com", color: "#2962ff" },
    { cat: "CRM", name: "GoHighLevel", color: "#84cc16" },
    { cat: "CRM", name: "HubSpot", color: "#ff7a59" },
    { cat: "Code", name: "TypeScript", color: "#3178c6" },
    { cat: "Code", name: "Python", color: "#ffd43b" },
    { cat: "Code", name: "Node.js", color: "#22c55e" },
    { cat: "Infra", name: "Cloudflare", color: "#f59e0b" },
    { cat: "Infra", name: "Docker", color: "#0db7ed" },
  ];

  const categories = [
    { title: "Automation", tools: ["Make.com", "n8n", "Zapier", "GoHighLevel", "Pipedream"] },
    { title: "Voice & AI", tools: ["VAPI", "Bland.ai", "Claude", "GPT", "LiquidJS"] },
    { title: "Code", tools: ["TypeScript", "Node.js", "Python", "React", "Bash"] },
    { title: "Data & Ops", tools: ["Airtable", "Monday", "ClickUp", "Notion", "Sheets"] },
    { title: "Payments", tools: ["Stripe", "Whop", "Plug & Pay", "Paddle"] },
    { title: "Docs", tools: ["eSignatures.io", "PandaDoc", "DocuSign", "GoCanvas"] },
    { title: "Comms", tools: ["ClickSend", "Twilio", "Postmark", "Mailgun", "Slack"] },
    { title: "Infra", tools: ["Ubuntu", "Cloudflare", "Docker", "GitHub"] },
  ];

  useEffect(() => {
    let raf;
    let x1 = 0,
      x2 = 0;
    const speed1 = 0.4,
      speed2 = 0.4;
    const tick = () => {
      const r1 = railRef1.current,
        r2 = railRef2.current;
      if (r1 && r2) {
        const half1 = r1.scrollWidth / 2;
        const half2 = r2.scrollWidth / 2;
        x1 -= speed1;
        if (x1 <= -half1) x1 = 0;
        x2 += speed2;
        if (x2 >= 0) x2 = -half2;
        r1.style.transform = `translateX(${x1}px)`;
        r2.style.transform = `translateX(${x2}px)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const Pill = ({ p }) => (
    <div className="stack-pill" data-cursor="hover">
      <span className="swatch" style={{ background: p.color }}></span>
      <span className="cat">{p.cat}</span>
      <span className="name">{p.name}</span>
    </div>
  );

  return (
    <section id="stack" className="section stack-section" data-screen-label="05 Stack">
      <div className="inner">
        <div className="section-header reveal">
          <span className="section-num">(05) Stack</span>
        </div>
        <h2 className="section-title reveal" style={{ marginBottom: 24 }}>
          Forty-plus tools.
          <br />
          <em style={{ color: "var(--ink-faint)", fontFamily: "Instrument Serif, serif", fontStyle: "italic" }}>
            One mental model.
          </em>
        </h2>
        <p style={{ maxWidth: 540, color: "var(--ink-soft)", fontSize: 16, marginBottom: 0 }} className="reveal">
          The platforms Jay ships in regularly. If yours isn&rsquo;t here, ask — automation work transfers across tools
          more than people think.
        </p>
      </div>

      <div className="stack-rails">
        <div className="stack-rail" style={{ marginBottom: 24 }}>
          <div ref={railRef1} className="stack-rail-track">
            {[...row1, ...row1, ...row1].map((p, i) => (
              <Pill key={i} p={p} />
            ))}
          </div>
        </div>
        <div className="stack-rail">
          <div ref={railRef2} className="stack-rail-track">
            {[...row2, ...row2, ...row2].map((p, i) => (
              <Pill key={i} p={p} />
            ))}
          </div>
        </div>
      </div>

      <div className="inner">
        <div className="stack-categories reveal" style={{ marginTop: 80, marginBottom: 0 }}>
          {categories.map((c) => (
            <div key={c.title} className="stack-cat-card">
              <h4>{c.title}</h4>
              <ul>
                {c.tools.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============== Wins ============== */

function Wins() {
  const wins = [
    {
      num: "01",
      title: "A 200-scenario operations platform.",
      em: "platform.",
      meta: "Healthcare therapy provider",
      detail:
        "Make.com environment covering hiring, onboarding, HR, clinical encounter follow-ups, family communications, ClickUp time tracking. Replaced ~3 FTE of manual ops work.",
    },
    {
      num: "02",
      title: "End-to-end recurring-revenue infrastructure.",
      em: "infrastructure.",
      meta: "Dutch coaching business",
      detail:
        "Whop + Stripe + Plug & Pay through Airtable. Dynamic checkout link generation, payment plans, NL/EN eSignatures.io contracts, salary/commission calculation. Zero manual reconciliation.",
    },
    {
      num: "03",
      title: "Voice agents that callers don’t hang up on.",
      em: "hang up on.",
      meta: "Home services contractors",
      detail:
        "VAPI agents for plumbing/HVAC. Humanized prompts, dynamic context via LiquidJS, calendar + CRM integration. Booking conversion at parity with trained human dispatchers.",
    },
    {
      num: "04",
      title: "A native SMS stack inside Airtable.",
      em: "inside Airtable.",
      meta: "Multiple agencies",
      detail:
        "ClickSend send scripts, inbound webhook handling for delivery receipts, automatic STOP/opt-out propagation, full conversation logging against contact records.",
    },
    {
      num: "05",
      title: "Self-hosted n8n on a Cloudflare tunnel.",
      em: "Cloudflare tunnel.",
      meta: "Personal infra",
      detail:
        "n8n on Ubuntu, exposed via Cloudflare tunnels for persistent webhooks. Cheaper at scale, and forces you to learn what managed platforms hide.",
    },
  ];

  return (
    <section id="wins" className="section wins" data-screen-label="06 Wins">
      <div className="inner">
        <div className="section-header reveal">
          <span className="section-num">(06) Recent Wins by Jay · Anonymized</span>
        </div>
        <h2 className="section-title reveal" style={{ marginBottom: 80 }}>
          Things that{" "}
          <em style={{ color: "var(--red)", fontFamily: "Instrument Serif, serif", fontStyle: "italic" }}>shipped.</em>
        </h2>

        <div className="wins-list reveal">
          {wins.map((w, i) => (
            <div key={i} className="win-row" data-cursor="hover">
              <div className="win-num">/{w.num}</div>
              <div className="win-title">
                {w.title.replace(w.em, "")}
                <em>{w.em}</em>
              </div>
              <div className="win-meta">
                <strong>{w.meta}</strong>
                {w.detail}
              </div>
              <div className="win-arrow">↗</div>
            </div>
          ))}
        </div>

        <div
          className="reveal"
          style={{
            marginTop: 80,
            padding: "48px",
            border: "1px solid var(--line)",
            background: "var(--bg)",
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: 48,
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--red)",
                marginBottom: 16,
              }}
            >
              How I work
            </div>
            <div
              style={{
                fontFamily: "Instrument Serif, serif",
                fontSize: 36,
                fontStyle: "italic",
                letterSpacing: "-0.02em",
                lineHeight: 1.05,
                marginBottom: 24,
              }}
            >
              Discovery first.
              <br />
              Quoting second.
              <br />
              Documentation throughout.
            </div>
            <p style={{ color: "var(--ink-soft)", fontSize: 15, maxWidth: 460 }}>
              I prefer fixed-price milestones to hourly work. I build for the person who inherits the system, not the
              person who ships it. Async-first, IST, reachable when it matters.
            </p>
          </div>
          <div style={{ display: "grid", gap: 16 }}>
            {[
              {
                wk: "Wk 1",
                label: "Discovery & architecture",
                desc:
                  "Real conversation about the actual problem. Written architecture proposal. No code yet.",
              },
              {
                wk: "Wk 2+",
                label: "Vertical slices",
                desc: "Each milestone delivers something that works end-to-end, even if narrow.",
              },
              {
                wk: "Always",
                label: "Docs alongside code",
                desc: "Every scenario named, every script commented, every webhook described.",
              },
              {
                wk: "Hand-off",
                label: "A real one",
                desc: "Working session, not a Loom. Your team can run the system without me.",
              },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "70px 1fr",
                  gap: 16,
                  paddingBottom: 16,
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <div
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: 11,
                    textTransform: "uppercase",
                    color: "var(--red)",
                    letterSpacing: "0.06em",
                  }}
                >
                  {s.wk}
                </div>
                <div>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============== Contact ============== */

function Contact() {
  const channels = [
    { label: "Email", value: "jay@etherwise.io", href: "mailto:jay@etherwise.io" },
    { label: "LinkedIn", value: "/in/jay-pokharna", href: "https://www.linkedin.com/in/jay-pokharna-940a42207" },
    { label: "Instagram", value: "@jay_pokharna", href: "https://www.instagram.com/jay_pokharna/" },
    { label: "Etherwise", value: "etherwise.io", href: "https://etherwise.io" },
  ];

  return (
    <section id="contact" className="section contact" data-screen-label="07 Contact">
      <div className="inner">
        <div className="section-header reveal">
          <span className="section-num">(07) Let&rsquo;s Talk · Jay Pokharna</span>
        </div>
        <h2 className="contact-headline reveal">
          <span className="row">Tell Jay</span>
          <span className="row">
            <em>the problem.</em>
          </span>
        </h2>

        <div className="contact-mailto reveal">
          <div className="pitch">
            One paragraph in your own words — the actual problem, not a brief.
            <strong>
              I&rsquo;ll respond within a business day with a real answer, clarifying questions, or an honest pass.
            </strong>
          </div>
          <a href="mailto:jay@etherwise.io?subject=Project%20enquiry" className="send-btn cta-pulse" data-cursor="hover">
            jay@etherwise.io
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
        </div>

        <div className="contact-grid reveal">
          {channels.map((c) => (
            <a key={c.label} className="contact-card" href={c.href} target="_blank" rel="noreferrer" data-cursor="hover">
              <div className="label">{c.label}</div>
              <div className="value">{c.value}</div>
            </a>
          ))}
        </div>
      </div>

      <footer className="footer">
        <span>© 2026 Jay Pokharna</span>
        <span>Pune, IN · IST</span>
        <span>v2 · May 2026</span>
      </footer>
    </section>
  );
}

/* ============== App ============== */

export default function Page() {
  const [theme, setTheme] = useState("dark");
  const [time, setTime] = useState("");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const update = () => {
      const opts = { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false };
      setTime(new Intl.DateTimeFormat("en-GB", opts).format(new Date()) + " IST");
    };
    update();
    const i = setInterval(update, 60000);
    return () => clearInterval(i);
  }, []);

  useCursor();
  useReveal();
  useSmoothScroll();
  const active = useActiveSection();

  return (
    <>
      <div className="grain"></div>
      <div className="cursor-ring" id="cursorRing"></div>
      <div className="cursor-dot" id="cursorDot"></div>

      <IntroVeil />
      <TopNav time={time} />
      <SideRail active={active} />
      <ThemeToggle theme={theme} setTheme={setTheme} />

      <main>
        <Hero />
        <Philosophy />
        <Build />
        <Demos />
        <Stack />
        <Wins />
        <Contact />
      </main>
    </>
  );
}
