import { NextResponse } from "next/server";
import { grokStatus } from "@/lib/grok/runner";
import { STYLE_PACKS } from "@/features/styles/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    engine: grokStatus(),
    styles: STYLE_PACKS.map((s) => s.id),
    mode: process.env.DATABASE_URL ? "neon+local-runner" : "local-file-store",
    portHint: 3030,
  });
}
