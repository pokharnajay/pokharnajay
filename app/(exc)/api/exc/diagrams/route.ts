import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { cloudConfigured, listDiagrams, putDiagram } from "@/lib/exc/store-server";
import { emptyScene, type Diagram } from "@/lib/exc/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!cloudConfigured()) return NextResponse.json({ cloud: false, diagrams: [] });
  return NextResponse.json({ cloud: true, diagrams: await listDiagrams() });
}

export async function POST(req: Request) {
  if (!cloudConfigured())
    return NextResponse.json({ error: "cloud storage not configured" }, { status: 501 });
  const body = await req.json().catch(() => ({}));
  const now = Date.now();
  const d: Diagram = {
    id: body.id || randomUUID(),
    name: body.name || "Untitled",
    createdAt: body.createdAt || now,
    updatedAt: now,
    scene: body.scene ?? emptyScene(),
  };
  await putDiagram(d);
  return NextResponse.json(d);
}
