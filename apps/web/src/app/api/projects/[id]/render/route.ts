import { NextRequest, NextResponse } from "next/server";
import { getProject, setRenderStatus } from "@/lib/storage/projects";
import { buildRenderPrompt, runGrokRender } from "@/lib/grok/runner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  try {
    const project = getProject(id);
    const prompt =
      project.phase === "approved" || project.phase === "rendering" || project.phase === "done"
        ? buildRenderPrompt(id)
        : null;
    return NextResponse.json({ render: project.render, prompt, phase: project.phase });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 404 }
    );
  }
}

export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const project = getProject(id);
    if (project.phase !== "approved" && project.phase !== "error" && project.phase !== "done") {
      return NextResponse.json(
        { error: "Approve the storyboard before releasing the CLI render." },
        { status: 400 }
      );
    }
    setRenderStatus(id, {
      status: "queued",
      startedAt: new Date().toISOString(),
      logTail: "Queued…",
    });
    // Fire and await (local studio — OK for pilot)
    const result = await runGrokRender(id);
    const updated = getProject(id);
    return NextResponse.json({
      project: updated,
      dryRun: result.dryRun,
      ok: result.ok,
      prompt: buildRenderPrompt(id),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 400 }
    );
  }
}
