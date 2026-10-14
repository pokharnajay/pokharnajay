"use client";
import { useEffect, useRef, useState } from "react";

/* A tiny terminal on the photo that types out what "Jay's agent" is up to.
   Playful status lines, not claims. Pauses off-screen; with reduced
   motion it shows one line, fully typed. */
const LINES = [
  "agent.plan() → 3 steps",
  "retrieving context…",
  "evals passing ✓",
  "n8n workflow: all green",
  "refilling coffee ☕",
  "shipping to production",
];

export default function AboutStatus() {
  const ref = useRef(null);
  const [line, setLine] = useState(0);
  const [chars, setChars] = useState(LINES[0].length);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || !visible) return;
    const text = LINES[line];
    if (chars < text.length) {
      const id = setTimeout(() => setChars((c) => c + 1), 38 + Math.random() * 40);
      return () => clearTimeout(id);
    }
    // Hold the finished line, then move on to the next one.
    const id = setTimeout(() => {
      setLine((l) => (l + 1) % LINES.length);
      setChars(0);
    }, 2200);
    return () => clearTimeout(id);
  }, [line, chars, visible, reduced]);

  const text = LINES[line];
  const typing = chars < text.length;
  return (
    <span className="about-status" ref={ref} aria-hidden="true">
      <span className={"about-status-dot" + (typing ? " is-busy" : "")}></span>
      <span className="about-status-prompt">jay@agent</span>
      <span className="about-status-text">
        {text.slice(0, chars)}
        <span className="about-status-caret"></span>
      </span>
    </span>
  );
}
