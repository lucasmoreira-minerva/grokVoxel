import { NextRequest, NextResponse } from "next/server";
import { approveStoryboard, writeStoryboardArtifact } from "@/lib/storage/projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const project = approveStoryboard(id);
    const beatsPath = writeStoryboardArtifact(project);
    return NextResponse.json({ project, beatsPath });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 400 }
    );
  }
}
