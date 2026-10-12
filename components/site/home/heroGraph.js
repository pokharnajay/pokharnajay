import { GRAPH_EDGES, GRAPH_NODES, RINGS, nodePosition, ringIndex } from "./graphModel";

/* Hero "agent graph" in three.js: a shaded LLM core, capabilities on an
   inner orbit, systems on an outer orbit, curved links with data pulses,
   and crisp HTML labels projected from 3D. Loaded lazily on desktop only;
   pauses when off-screen or the tab is hidden. */
export async function initHeroGraph(canvasHost, labelHost) {
  const {
    Scene, PerspectiveCamera, WebGLRenderer, Group, Vector3, Color,
    AmbientLight, DirectionalLight, MeshStandardMaterial, MeshBasicMaterial,
    SphereGeometry, IcosahedronGeometry, EdgesGeometry, LineSegments,
    LineBasicMaterial, BufferGeometry, BufferAttribute, Line, LineLoop, Mesh,
    Points, PointsMaterial, QuadraticBezierCurve3, Sprite, SpriteMaterial, CanvasTexture,
  } = await import("three");

  const W = () => canvasHost.clientWidth;
  const H = () => canvasHost.clientHeight;

  const renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setSize(W(), H());
  renderer.domElement.setAttribute("aria-hidden", "true");
  canvasHost.appendChild(renderer.domElement);

  const scene = new Scene();
  const camera = new PerspectiveCamera(36, W() / H(), 0.1, 100);
  camera.position.set(0, 1.1, 14);
  camera.lookAt(0, 0, 0);

  scene.add(new AmbientLight(0xffffff, 1.1));
  const key = new DirectionalLight(0xffffff, 1.6);
  key.position.set(4, 6, 8);
  scene.add(key);

  const world = new Group();
  scene.add(world);
  const disposables = [];
  const track = (o) => (disposables.push(o), o);

  /* Core: shaded sphere inside a wireframe icosahedron, with a soft halo. */
  const core = new Group();
  world.add(core);
  const coreBall = new Mesh(
    track(new SphereGeometry(0.62, 48, 48)),
    track(new MeshStandardMaterial({ color: new Color("#12b76a"), roughness: 0.32, metalness: 0.08 }))
  );
  core.add(coreBall);
  const coreWire = new LineSegments(
    track(new EdgesGeometry(track(new IcosahedronGeometry(1.15, 1)))),
    track(new LineBasicMaterial({ color: 0x087443, transparent: true, opacity: 0.75 }))
  );
  core.add(coreWire);
  const haloCanvas = document.createElement("canvas");
  haloCanvas.width = haloCanvas.height = 128;
  const hctx = haloCanvas.getContext("2d");
  const grad = hctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(18,183,106,0.35)");
  grad.addColorStop(1, "rgba(18,183,106,0)");
  hctx.fillStyle = grad;
  hctx.fillRect(0, 0, 128, 128);
  const halo = new Sprite(track(new SpriteMaterial({ map: track(new CanvasTexture(haloCanvas)), depthWrite: false })));
  halo.scale.set(4.6, 4.6, 1);
  core.add(halo);

  /* Orbit guides. */
  for (const ring of [1, 2]) {
    const pts = [];
    const fake = { ring };
    for (let i = 0; i < 160; i++) pts.push(...nodePosition(fake, i, 160, 0));
    const g = track(new BufferGeometry());
    g.setAttribute("position", new BufferAttribute(new Float32Array(pts), 3));
    world.add(new LineLoop(g, track(new LineBasicMaterial({ color: 0xdbe4df, transparent: true, opacity: ring === 1 ? 0.9 : 0.7 }))));
  }

  /* Nodes. */
  const { counts, index } = ringIndex();
  const inner = track(new SphereGeometry(0.19, 32, 32));
  const outer = track(new SphereGeometry(0.13, 24, 24));
  const innerMat = track(new MeshStandardMaterial({ color: new Color("#087443"), roughness: 0.4 }));
  const outerMat = track(new MeshStandardMaterial({ color: new Color("#0d1b14"), roughness: 0.45 }));
  const nodeMesh = {};
  for (const n of GRAPH_NODES) {
    if (n.ring === 0) continue;
    const m = new Mesh(n.ring === 1 ? inner : outer, n.ring === 1 ? innerMat : outerMat);
    world.add(m);
    nodeMesh[n.id] = m;
  }

  /* Links + pulses. */
  const SEG = 36;
  const linkMat = track(new LineBasicMaterial({ color: 0xb4c4ba, transparent: true, opacity: 0.95 }));
  const pulseGeo = track(new SphereGeometry(0.065, 16, 16));
  const pulseMat = track(new MeshBasicMaterial({ color: 0x12b76a }));
  const links = GRAPH_EDGES.map(([a, b], i) => {
    const g = track(new BufferGeometry());
    g.setAttribute("position", new BufferAttribute(new Float32Array((SEG + 1) * 3), 3));
    const line = new Line(g, linkMat);
    world.add(line);
    const pulses = [0, 0.5].map(() => {
      const p = new Mesh(pulseGeo, pulseMat);
      world.add(p);
      return p;
    });
    return { a, b, line, pulses, phase: (i * 0.37) % 1, curve: new QuadraticBezierCurve3(new Vector3(), new Vector3(), new Vector3()) };
  });

  /* Depth dust. */
  const DUST = 340;
  const dust = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i++) {
    const r = 5.2 + Math.random() * 2.6;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    dust[i * 3] = r * Math.sin(ph) * Math.cos(th);
    dust[i * 3 + 1] = r * Math.cos(ph) * 0.6;
    dust[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
  }
  const dustGeo = track(new BufferGeometry());
  dustGeo.setAttribute("position", new BufferAttribute(dust, 3));
  const dustPts = new Points(dustGeo, track(new PointsMaterial({ color: 0x9db3a6, size: 0.045, transparent: true, opacity: 0.7, sizeAttenuation: true })));
  world.add(dustPts);

  /* HTML labels. */
  const labels = {};
  for (const n of GRAPH_NODES) {
    const el = document.createElement("span");
    el.className = "g-label" + (n.ring === 0 ? " is-core" : n.ring === 1 ? " is-inner" : "");
    el.textContent = n.label;
    labelHost.appendChild(el);
    labels[n.id] = el;
  }

  const pos = {};
  const tmp = new Vector3();
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  const onMove = (e) => {
    const r = canvasHost.getBoundingClientRect();
    mouse.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
    mouse.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
  };
  window.addEventListener("pointermove", onMove, { passive: true });

  const resize = () => {
    camera.aspect = W() / H();
    // Pull the camera back on narrow canvases so the outer orbit fits.
    camera.position.z = camera.aspect < 1 ? 14 / Math.max(0.62, camera.aspect) : 14;
    camera.updateProjectionMatrix();
    renderer.setSize(W(), H());
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvasHost);

  const t0 = performance.now();
  let last = t0;
  let raf = 0;
  let running = false;
  let visible = true;

  const frame = (now) => {
    const t = (now - t0) / 1000;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;

    // Entrance: ease the whole graph in over the first 1.4s.
    const intro = Math.min(1, t / 1.4);
    const e = 1 - Math.pow(1 - intro, 3);
    world.scale.setScalar(0.82 + 0.18 * e);
    world.rotation.y = t * 0.05 + mouse.x * 0.32 + (1 - e) * -0.6;
    world.rotation.x = 0.16 + mouse.y * 0.1;

    core.rotation.y += dt * 0.25;
    coreWire.rotation.x += dt * 0.12;

    for (const n of GRAPH_NODES) {
      const p = nodePosition(n, index[n.id], counts[n.ring], t);
      pos[n.id] = p;
      if (nodeMesh[n.id]) nodeMesh[n.id].position.set(p[0], p[1], p[2]);
    }

    for (const l of links) {
      const A = pos[l.a], B = pos[l.b];
      const mid = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2 + 0.45, (A[2] + B[2]) / 2];
      l.curve.v0.set(A[0], A[1], A[2]);
      l.curve.v1.set(mid[0] * 1.08, mid[1], mid[2] * 1.08);
      l.curve.v2.set(B[0], B[1], B[2]);
      const arr = l.line.geometry.attributes.position.array;
      for (let i = 0; i <= SEG; i++) {
        l.curve.getPoint(i / SEG, tmp);
        arr[i * 3] = tmp.x;
        arr[i * 3 + 1] = tmp.y;
        arr[i * 3 + 2] = tmp.z;
      }
      l.line.geometry.attributes.position.needsUpdate = true;
      l.pulses.forEach((p, k) => {
        const u = (t * 0.42 + l.phase + k * 0.5) % 1;
        l.curve.getPoint(u, tmp);
        p.position.copy(tmp);
        const s = Math.sin(u * Math.PI);
        p.scale.setScalar(0.4 + s * 0.8);
      });
    }

    renderer.render(scene, camera);

    // Project labels after render so they match the frame.
    const w = W(), h = H();
    for (const n of GRAPH_NODES) {
      const p = pos[n.id];
      tmp.set(p[0], p[1], p[2]).applyMatrix4(world.matrixWorld);
      const depth = tmp.z; // towards camera is positive
      tmp.project(camera);
      const x = (tmp.x * 0.5 + 0.5) * w;
      const y = (-tmp.y * 0.5 + 0.5) * h;
      const el = labels[n.id];
      const near = Math.max(0, Math.min(1, (depth + 4.5) / 9));
      const fade = Math.min(1, Math.max(0, (t - 0.5 - (n.ring * 0.25)) / 0.6));
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(${n.ring === 0 ? "-50%, 58px" : "14px, -50%"})`;
      el.style.opacity = (fade * (n.ring === 0 ? 1 : 0.42 + near * 0.58)).toFixed(3);
      el.style.zIndex = String(Math.round(near * 100));
    }
  };

  const loop = (now) => {
    frame(now);
    raf = requestAnimationFrame(loop);
  };
  const play = () => {
    if (running || !visible || document.hidden) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(loop);
  };
  const pause = () => {
    running = false;
    cancelAnimationFrame(raf);
  };
  const io = new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    visible ? play() : pause();
  });
  io.observe(canvasHost);
  const onVis = () => (document.hidden ? pause() : play());
  document.addEventListener("visibilitychange", onVis);
  play();

  return () => {
    pause();
    io.disconnect();
    ro.disconnect();
    document.removeEventListener("visibilitychange", onVis);
    window.removeEventListener("pointermove", onMove);
    disposables.forEach((d) => d.dispose && d.dispose());
    renderer.dispose();
    renderer.domElement.remove();
    Object.values(labels).forEach((el) => el.remove());
  };
}

export { RINGS };
