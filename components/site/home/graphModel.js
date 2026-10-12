/* Shared model for the hero "agent graph": an LLM agent at the centre, its
   capabilities on an inner orbit, and the systems it touches on an outer
   orbit. Used by the three.js scene and by the static SVG fallback. */

export const GRAPH_NODES = [
  { id: "agent", label: "LLM agent", ring: 0 },
  { id: "rag", label: "Retrieval (RAG)", ring: 1 },
  { id: "tools", label: "Tool calling", ring: 1 },
  { id: "evals", label: "Guardrails + evals", ring: 1 },
  { id: "vector", label: "Vector DB", ring: 2 },
  { id: "docs", label: "Docs + SOPs", ring: 2 },
  { id: "n8n", label: "n8n", ring: 2 },
  { id: "make", label: "Make.com", ring: 2 },
  { id: "crm", label: "CRM", ring: 2 },
  { id: "slack", label: "Slack", ring: 2 },
];

export const GRAPH_EDGES = [
  ["agent", "rag"],
  ["agent", "tools"],
  ["agent", "evals"],
  ["rag", "vector"],
  ["rag", "docs"],
  ["tools", "n8n"],
  ["tools", "make"],
  ["tools", "crm"],
  ["evals", "slack"],
];

export const RINGS = {
  1: { radius: 2.35, tilt: 0.42, speed: 0.11, yScale: 0.55 },
  2: { radius: 4.25, tilt: -0.28, speed: -0.055, yScale: 0.62 },
};

/* Position of a node at time t (seconds), before the group's rotation. */
export function nodePosition(node, indexInRing, countInRing, t) {
  if (node.ring === 0) return [0, 0, 0];
  const r = RINGS[node.ring];
  const a = (indexInRing / countInRing) * Math.PI * 2 + t * r.speed + (node.ring === 2 ? 0.35 : 0);
  const x = Math.cos(a) * r.radius;
  const z = Math.sin(a) * r.radius;
  // Tilt the orbit plane around the x axis.
  const y = Math.sin(a) * r.radius * Math.sin(r.tilt) * r.yScale + (node.ring === 2 ? Math.cos(a * 2) * 0.35 : 0);
  return [x, y, z * Math.cos(r.tilt)];
}

export function ringIndex() {
  const counts = {};
  const index = {};
  for (const n of GRAPH_NODES) {
    counts[n.ring] = counts[n.ring] || 0;
    index[n.id] = counts[n.ring]++;
  }
  return { counts, index };
}
