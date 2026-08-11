// Server-side storage: Upstash Redis (free, private). If no credentials are
// configured the API reports cloud:false and the client falls back to
// browser localStorage — so the app still works with zero setup.
import { Redis } from "@upstash/redis";
import type { Diagram, DiagramMeta } from "./types";

let client: Redis | null | undefined;

function redis(): Redis | null {
  if (client !== undefined) return client;
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  client = url && token ? new Redis({ url, token }) : null;
  return client;
}

export const cloudConfigured = (): boolean => redis() !== null;

const KEY = (id: string) => `diagram:${id}`;
const INDEX = "diagrams:index"; // hash: id -> DiagramMeta

export async function listDiagrams(): Promise<DiagramMeta[]> {
  const r = redis();
  if (!r) return [];
  const vals = ((await r.hvals(INDEX)) as DiagramMeta[]) || [];
  return vals.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getDiagram(id: string): Promise<Diagram | null> {
  const r = redis();
  if (!r) return null;
  return (await r.get<Diagram>(KEY(id))) ?? null;
}

export async function putDiagram(d: Diagram): Promise<Diagram> {
  const r = redis();
  if (!r) throw new Error("cloud storage not configured");
  const meta: DiagramMeta = { id: d.id, name: d.name, createdAt: d.createdAt, updatedAt: d.updatedAt };
  await Promise.all([r.set(KEY(d.id), d), r.hset(INDEX, { [d.id]: meta })]);
  return d;
}

export async function deleteDiagram(id: string): Promise<void> {
  const r = redis();
  if (!r) return;
  await Promise.all([r.del(KEY(id)), r.hdel(INDEX, id)]);
}
