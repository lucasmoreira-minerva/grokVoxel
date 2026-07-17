import { NextRequest, NextResponse } from "next/server";
import { getProject, saveProject } from "@/lib/storage/projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    return NextResponse.json({ project: getProject(id) });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Not found" },
      { status: 404 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const project = getProject(id);
    const body = await req.json();
    if (body.name) project.name = body.name;
    if (body.brief) project.brief = { ...project.brief, ...body.brief };
    if (body.assets) project.assets = { ...project.assets, ...body.assets };
    if (body.storyboard) project.storyboard = body.storyboard;
    if (body.phase) project.phase = body.phase;
    return NextResponse.json({ project: saveProject(project) });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 400 }
    );
  }
}
