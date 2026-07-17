import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { getProject, saveProject } from "@/lib/storage/projects";
import { projectAssetsDir } from "@/lib/paths";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const project = getProject(id);
    const form = await req.formData();
    const files = form.getAll("files");
    const kind = String(form.get("kind") || "images") as
      | "logos"
      | "images"
      | "references";
    const dir = projectAssetsDir(id);
    const saved: string[] = [];

    for (const f of files) {
      if (!(f instanceof File)) continue;
      const buf = Buffer.from(await f.arrayBuffer());
      const safe = f.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const name = `${Date.now()}_${safe}`;
      const dest = path.join(dir, name);
      fs.writeFileSync(dest, buf);
      saved.push(name);
      if (kind === "logos") project.assets.logos.push(name);
      else if (kind === "references") project.assets.references.push(name);
      else project.assets.images.push(name);
    }
    saveProject(project);
    return NextResponse.json({
      project: getProject(id),
      saved,
      urls: saved.map((n) => `/api/projects/${id}/assets/${encodeURIComponent(n)}`),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upload failed" },
      { status: 400 }
    );
  }
}
