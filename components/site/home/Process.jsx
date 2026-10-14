"use client";
import { useEffect, useRef } from "react";

const STEPS = [
  { title: "Map the work", text: "We walk through the process as it runs today: who does what, how often, and what breaks. You get a short list of what's worth automating first." },
  { title: "Design the system", text: "Where an LLM earns its place, where plain code or a visual platform is better, and what happens when a step fails." },
  { title: "Build and test", text: "Milestone-based, fixed price. Real data from day one, and an eval set for anything with a model in it." },
  { title: "Run and monitor", text: "Error routes, alerts and logs that explain failures, plus documentation for whoever inherits it." },
];

/* The connecting line fills as the section scrolls through the viewport;
   each step turns green as the line reaches it. */
export default function Process() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.setProperty("--p", "1");
      el.querySelectorAll(".step").forEach((s) => s.classList.add("is-on"));
      return;
    }
    const steps = Array.from(el.querySelectorAll(".step"));
    let raf = 0;
    let on = false;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      el.style.setProperty("--p", p.toFixed(3));
      steps.forEach((s, i) => s.classList.toggle("is-on", p >= i / steps.length + 0.02));
    };
    const onScroll = () => on && !raf && (raf = requestAnimationFrame(update));
    const io = new IntersectionObserver(([e]) => {
      on = e.isIntersecting;
      if (on) update();
    });
    io.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="process" id="process" aria-labelledby="process-title">
      <div className="wrap" data-scroll-focus>
        <div className="section-head">
          <h2 className="h-section" id="process-title">How a project runs.</h2>
          <p className="lead">Discovery first, quoting second. Built for the person who inherits it.</p>
        </div>
        <div className="steps-wrap" ref={ref}>
          <span className="steps-line" aria-hidden="true"><span></span></span>
          <ol className="steps">
          {STEPS.map((s, i) => (
            <li key={s.title} className="step">
              <span className="step-n">{i + 1}</span>
              <h3 className="h-3">{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
