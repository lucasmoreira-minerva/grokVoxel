import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createProject, listProjects } from "@/lib/storage/projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CreateSchema = z.object({
  name: z.string().optional(),
  brief: z.object({
    topic: z.string().min(3),
    audience: z.string().optional(),
    language: z.enum(["en", "pt-BR"]).default("pt-BR"),
    aspect: z.enum(["16:9", "9:16", "1:1"]).default("16:9"),
    durationSec: z.number().min(15).max(180).default(90),
    styleId: z.string().default("grok-voxel"),
    musicId: z.string().default("carefree"),
    voiceId: z.string().default("eve"),
    narrationStyle: z.string().default("teacher"),
    initialPrompt: z.string().min(3),
  }),
});

export async function GET() {
  return NextResponse.json({ projects: listProjects() });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateSchema.parse(body);
    const project = createProject(parsed);
    return NextResponse.json({ project }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Bad request";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
