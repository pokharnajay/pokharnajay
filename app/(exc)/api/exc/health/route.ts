import { NextResponse } from "next/server";
import { cloudConfigured } from "@/lib/exc/store-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ cloud: cloudConfigured() });
}
