/* Three.js node-graph globe for the hero. Loaded with a dynamic import after
   first paint (desktop only), so it never blocks the headline. The globe is
   placed in the empty space to the right of the headline's shortest line
   ("that runs") and re-anchored on resize, so it stays clear of the copy at
   any desktop width. Rendering pauses whenever the hero is off-screen or the
   tab is hidden. */
export async function initHeroCanvas(container, anchorEl) {
  const {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    BufferGeometry,
    BufferAttribute,
    PointsMaterial,
    Points,
    LineBasicMaterial,
    LineSegments,
    IcosahedronGeometry,
    MeshBasicMaterial,
    Mesh,
    Group,
  } = await import("three");

  const SCALE = 0.85; // globe size relative to the original scene
  const w = () => container.clientWidth;
  const h = () => container.clientHeight;
  const FOV = 60;
  const CAM_Z = 22;

  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, w() / h(), 0.1, 1000);
  camera.position.z = CAM_Z;

  const renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio || 1));
  renderer.setSize(w(), h());
  renderer.domElement.setAttribute("aria-hidden", "true");
  container.appendChild(renderer.domElement);

  const group = new Group();
  group.scale.setScalar(SCALE);
  scene.add(group);

  const N = 200;
  const positions = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const r = 11 + Math.random() * 8;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  const geom = new BufferGeometry();
  geom.setAttribute("position", new BufferAttribute(positions, 3));
  const points = new Points(
    geom,
    new PointsMaterial({ color: 0xa3ff12, size: 0.08, transparent: true, opacity: 0.75, sizeAttenuation: true })
  );
  group.add(points);

  const edgePos = [];
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      const dx = positions[i * 3] - positions[j * 3];
      const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
      const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
      if (dx * dx + dy * dy + dz * dz < 16) {
        edgePos.push(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
        edgePos.push(positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]);
      }
    }
  }
  const edgeGeom = new BufferGeometry();
  edgeGeom.setAttribute("position", new BufferAttribute(new Float32Array(edgePos), 3));
  const lines = new LineSegments(edgeGeom, new LineBasicMaterial({ color: 0xa3ff12, transparent: true, opacity: 0.1 }));
  group.add(lines);

  const coreGeom = new IcosahedronGeometry(3.4, 1);
  const core = new Mesh(coreGeom, new MeshBasicMaterial({ color: 0xa3ff12, wireframe: true, transparent: true, opacity: 0.3 }));
  group.add(core);
  const innerGeom = new IcosahedronGeometry(2.2, 0);
  const inner = new Mesh(innerGeom, new MeshBasicMaterial({ color: 0x00ffd0, wireframe: true, transparent: true, opacity: 0.22 }));
  group.add(inner);

  /* Anchor: screen point → world point on the z=0 plane. */
  const anchor = () => {
    const box = container.getBoundingClientRect();
    const halfH = Math.tan((FOV / 2) * (Math.PI / 180)) * CAM_Z;
    const halfW = halfH * (w() / h());
    let sx = w() * 0.78;
    let sy = h() * 0.48;
    const headline = anchorEl && anchorEl.closest(".hero-headline");
    if (headline) {
      /* Measure the row wrappers and the spans' layout widths, not their
         painted boxes: the rows are mid-entrance-animation (translated)
         when this first runs. */
      const coreR = (3.4 * SCALE / halfH) * (h() / 2);
      const rows = Array.from(headline.querySelectorAll(".row"));
      const longest = Math.max(...rows.map((row) => row.getBoundingClientRect().left - box.left + row.firstElementChild.offsetWidth));
      const anchorRow = anchorEl.parentElement.getBoundingClientRect();
      // Clear of the longest line, centred on "that runs", kept on-screen.
      sx = Math.min(w() - coreR * 0.9, longest + coreR * 1.1);
      sy = anchorRow.top - box.top + anchorRow.height / 2;
    }
    group.position.x = (sx / w()) * 2 * halfW - halfW;
    group.position.y = halfH - (sy / h()) * 2 * halfH;
  };
  anchor();

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  const onMove = (e) => {
    mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
  };
  window.addEventListener("mousemove", onMove, { passive: true });

  const onResize = () => {
    camera.aspect = w() / h();
    camera.updateProjectionMatrix();
    renderer.setSize(w(), h());
    anchor();
  };
  const ro = new ResizeObserver(onResize);
  ro.observe(container);
  // Fonts swapping in can change the headline width.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(anchor);

  let raf = 0;
  let running = false;
  let visible = true;
  const start = performance.now();
  const render = () => {
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
    camera.position.x = mouse.x * 1.2;
    camera.position.y = -mouse.y * 1.2;
    camera.lookAt(group.position.x * 0.15, group.position.y * 0.15, 0);
    renderer.render(scene, camera);
  };
  const tick = () => {
    render();
    raf = requestAnimationFrame(tick);
  };
  const play = () => {
    if (running || !visible || document.hidden) return;
    running = true;
    raf = requestAnimationFrame(tick);
  };
  const pause = () => {
    running = false;
    cancelAnimationFrame(raf);
  };
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    visible ? play() : pause();
  });
  io.observe(container);
  const onVis = () => (document.hidden ? pause() : play());
  document.addEventListener("visibilitychange", onVis);
  render();
  play();

  return () => {
    pause();
    io.disconnect();
    ro.disconnect();
    document.removeEventListener("visibilitychange", onVis);
    window.removeEventListener("mousemove", onMove);
    [geom, edgeGeom, coreGeom, innerGeom].forEach((g) => g.dispose());
    [points, lines, core, inner].forEach((o) => o.material.dispose());
    renderer.dispose();
    if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
  };
}
