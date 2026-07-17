import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { projectAssetsDir } from "@/lib/paths";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
};

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string; name: string }> }
) {
  const { id, name } = await ctx.params;
  const safe = path.basename(decodeURIComponent(name));
  const file = path.join(projectAssetsDir(id), safe);
  if (!fs.existsSync(file)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const ext = path.extname(safe).toLowerCase();
  const data = fs.readFileSync(file);
  return new NextResponse(data, {
    headers: {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
