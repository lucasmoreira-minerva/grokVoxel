import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { MUSIC_TRACKS } from "@/features/music/catalog";
import { repoRoot } from "@/lib/paths";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Stream local preview audio for a catalog track. */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const track = MUSIC_TRACKS.find((t) => t.id === id);
  if (!track) {
    return NextResponse.json({ error: "Track not found" }, { status: 404 });
  }
  if (track.previewUrl) {
    return NextResponse.redirect(track.previewUrl);
  }
  if (!track.file) {
    return NextResponse.json(
      { error: "No local file for this track yet — import to music/" },
      { status: 404 }
    );
  }
  const file = path.join(repoRoot(), track.file);
  if (!fs.existsSync(file)) {
    // try skills/grok-voxel/music
    const alt = path.join(repoRoot(), "skills/grok-voxel", track.file);
    if (fs.existsSync(alt)) {
      const data = fs.readFileSync(alt);
      return new NextResponse(data, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }
    return NextResponse.json({ error: "File missing on disk" }, { status: 404 });
  }
  const data = fs.readFileSync(file);
  return new NextResponse(data, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
