import { NextRequest, NextResponse } from "next/server";
import { getProject, updateStoryboard } from "@/lib/storage/projects";
import { generateStoryboardLocal } from "@/features/storyboard/generate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST: generate or iterate storyboard */
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const project = getProject(id);
    const body = await req.json().catch(() => ({}));
    const note = (body.note as string) || (body.directorNotes as string) || "";
    // optional full replace scenes from client editor
    if (body.storyboard?.scenes) {
      const sb = {
        ...body.storyboard,
        version: (project.storyboard?.version || 0) + 1,
        iteration: (project.storyboard?.iteration || 0) + 1,
        updatedAt: new Date().toISOString(),
        totalDurationSec: body.storyboard.scenes.reduce(
          (a: number, s: { durationSec: number }) => a + (s.durationSec || 0),
          0
        ),
      };
      const updated = updateStoryboard(id, sb, note || "Manual edit");
      return NextResponse.json({ project: updated });
    }
    const sb = generateStoryboardLocal(
      project.brief,
      project.storyboard,
      note || project.brief.initialPrompt
    );
    const updated = updateStoryboard(
      id,
      sb,
      note || "Generated from brief"
    );
    return NextResponse.json({ project: updated });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 400 }
    );
  }
}
