"use client";
import { useEffect, useRef } from "react";
import SceneAgents from "./SceneAgents";
import SceneCode from "./SceneCode";
import SceneNoCode from "./SceneNoCode";

const STEPS = [
  { id: "scene-agents", label: "AI agents" },
  { id: "scene-code", label: "Code" },
  { id: "scene-nocode", label: "No-code" },
];

/* Desktop (≥1101px, motion allowed): the section becomes a 560vh scroll
   track with a sticky stage; scenes cross-fade by scroll progress. Everywhere
   else (and before JS) the scenes simply stack — readable, no pinning. */
const PIN_QUERY = "(min-width: 1101px) and (min-height: 620px) and (prefers-reduced-motion: no-preference)";

export default function Scenes() {
  const wrapRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const scenes = Array.from(wrap.querySelectorAll(".scene"));
    const steps = Array.from(wrap.querySelectorAll(".scenes-progress .step"));
    const N = scenes.length;
    const mq = window.matchMedia(PIN_QUERY);
    let cleanup = () => {};

    const range = () => wrap.offsetHeight - window.innerHeight;
    const scrollToScene = (i) => {
      const top = wrap.getBoundingClientRect().top + window.scrollY + (range() * i) / (N - 1);
      if (window.__lenis) window.__lenis.scrollTo(top, { duration: 1.2 });
      else window.scrollTo({ top, behavior: "smooth" });
    };

    const pin = () => {
      wrap.classList.add("is-pinned");
      let raf = 0;
      let current = -1;
      const PLATEAU = 0.4; // scene stays fully visible for ±0.2 of progress
      const FADE = 0.45;
      const update = () => {
        raf = 0;
        const rect = wrap.getBoundingClientRect();
        const p = Math.max(0, Math.min(1, -rect.top / Math.max(1, range())));
        let best = 0, bestOp = -1;
        for (let i = 0; i < N; i++) {
          const center = i / (N - 1);
          const dist = Math.abs(p - center) * (N - 1);
          const f = Math.max(0, Math.min(1, (dist - PLATEAU) / FADE));
          const op = 1 - f;
          const y = (p < center ? 40 : -40) * f;
          scenes[i].style.opacity = op.toFixed(3);
          scenes[i].style.transform = `translate3d(0,${y.toFixed(1)}px,0) scale(${(1 - f * 0.08).toFixed(4)})`;
          if (op > bestOp) (bestOp = op), (best = i);
        }
        if (best !== current) {
          current = best;
          scenes.forEach((s, i) => s.classList.toggle("is-active", i === best));
          steps.forEach((s, i) => {
            s.classList.toggle("active", i === best);
            s.classList.toggle("done", i < best);
            if (i === best) s.setAttribute("aria-current", "step");
            else s.removeAttribute("aria-current");
          });
        }
      };
      const onScroll = () => {
        if (!raf) raf = requestAnimationFrame(update);
      };
      update();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);

      /* Keyboard users: focusing a link inside a hidden scene scrolls to it. */
      const onFocus = (e) => {
        const i = scenes.findIndex((s) => s.contains(e.target));
        if (i >= 0 && i !== current) scrollToScene(i);
      };
      wrap.addEventListener("focusin", onFocus);

      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
        wrap.removeEventListener("focusin", onFocus);
        wrap.classList.remove("is-pinned");
        scenes.forEach((s) => {
          s.classList.remove("is-active");
          s.style.opacity = s.style.transform = "";
        });
      };
    };

    const sync = () => {
      cleanup();
      cleanup = mq.matches ? pin() : () => {};
      // Page height changed: keep a #hash deep link on its target.
      if (location.hash && location.hash.length > 1) {
        const tgt = document.getElementById(location.hash.slice(1));
        if (tgt && !wrap.contains(tgt)) tgt.scrollIntoView();
      }
    };
    sync();
    mq.addEventListener("change", sync);

    const onStep = (e) => {
      const a = e.target.closest("[data-step]");
      if (!a || !wrap.classList.contains("is-pinned")) return;
      e.preventDefault();
      scrollToScene(Number(a.dataset.step));
    };
    wrap.addEventListener("click", onStep);

    return () => {
      mq.removeEventListener("change", sync);
      wrap.removeEventListener("click", onStep);
      cleanup();
    };
  }, []);

  return (
    <section className="scenes-wrap" id="scenes" ref={wrapRef} aria-label="How I work">
      <div className="scenes-pin">
        <div className="scenes-bg" aria-hidden="true"></div>

        <nav className="scenes-progress" aria-label="Scenes">
          {STEPS.map((s, i) => (
            <a key={s.id} href={`#${s.id}`} className={"step" + (i === 0 ? " active" : "")} data-step={i}>
              <span className="num">{String(i + 1).padStart(2, "0")}</span>
              <span>{s.label}</span>
            </a>
          ))}
        </nav>

        <div className="scenes-stage-section">
          <SceneAgents />
          <SceneCode />
          <SceneNoCode />
        </div>
      </div>
    </section>
  );
}
