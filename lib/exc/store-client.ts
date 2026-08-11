"use client";
// Unified client storage. Uses the cloud API when the server reports storage is
// configured (Upstash), otherwise falls back to browser localStorage so the app
// works with zero setup. Components only ever call these functions.
import { emptyScene, type Diagram, type DiagramMeta, type Scene } from "./types";

const LS_KEY = "excalidraw-web:diagrams"; // { [id]: Diagram }
const API = "/api/exc"; // namespaced under the personal site

let cloudPromise: Promise<boolean> | null = null;
function isCloud(): Promise<boolean> {
  if (!cloudPromise) {
    cloudPromise = fetch(`${API}/health`)
      .then((r) => r.json())
      .then((j) => !!j.cloud)
      .catch(() => false);
  }
  return cloudPromise;
}

export async function storageMode(): Promise<"cloud" | "local"> {
  return (await isCloud()) ? "cloud" : "local";
}

function lsAll(): Record<string, Diagram> {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  } catch {
    return {};
  }
}
function lsWrite(all: Record<string, Diagram>) {
  localStorage.setItem(LS_KEY, JSON.stringify(all));
}
function uuid(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function list(): Promise<DiagramMeta[]> {
  if (await isCloud()) {
    const j = await fetch(`${API}/diagrams`).then((r) => r.json());
    return (j.diagrams as DiagramMeta[]) || [];
  }
  return Object.values(lsAll())
    .map(({ scene, ...meta }) => meta)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function create(name = "Untitled"): Promise<Diagram> {
  if (await isCloud()) {
    return fetch(`${API}/diagrams`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, scene: emptyScene() }),
    }).then((r) => r.json());
  }
  const now = Date.now();
  const d: Diagram = { id: uuid(), name, createdAt: now, updatedAt: now, scene: emptyScene() };
  const all = lsAll();
  all[d.id] = d;
  lsWrite(all);
  return d;
}

export async function get(id: string): Promise<Diagram | null> {
  if (await isCloud()) {
    const r = await fetch(`${API}/diagrams/${id}`);
    return r.ok ? r.json() : null;
  }
  return lsAll()[id] ?? null;
}

export async function save(
  id: string,
  patch: { name?: string; scene?: Scene }
): Promise<Diagram | null> {
  if (await isCloud()) {
    const r = await fetch(`${API}/diagrams/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    });
    return r.ok ? r.json() : null;
  }
  const all = lsAll();
  const existing = all[id];
  if (!existing) return null;
  const d: Diagram = { ...existing, ...patch, updatedAt: Date.now() };
  all[id] = d;
  lsWrite(all);
  return d;
}

export async function remove(id: string): Promise<void> {
  if (await isCloud()) {
    await fetch(`${API}/diagrams/${id}`, { method: "DELETE" });
    return;
  }
  const all = lsAll();
  delete all[id];
  lsWrite(all);
}
