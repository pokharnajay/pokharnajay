import { NextResponse } from "next/server";
import { cloudConfigured, deleteDiagram, getDiagram, putDiagram } from "@/lib/exc/store-server";
import { emptyScene, type Diagram } from "@/lib/exc/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } };

export async function GET(_req: Request, { params }: Ctx) {
  if (!cloudConfigured())
    return NextResponse.json({ error: "cloud storage not configured" }, { status: 501 });
  const d = await getDiagram(params.id);
  if (!d) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(d);
}

export async function PUT(req: Request, { params }: Ctx) {
  if (!cloudConfigured())
    return NextResponse.json({ error: "cloud storage not configured" }, { status: 501 });
  const body = await req.json().catch(() => ({}));
  const existing = await getDiagram(params.id);
  const now = Date.now();
  const d: Diagram = {
    id: params.id,
    name: body.name ?? existing?.name ?? "Untitled",
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    scene: body.scene ?? existing?.scene ?? emptyScene(),
  };
  await putDiagram(d);
  return NextResponse.json(d);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!cloudConfigured())
    return NextResponse.json({ error: "cloud storage not configured" }, { status: 501 });
  await deleteDiagram(params.id);
  return NextResponse.json({ ok: true });
}
