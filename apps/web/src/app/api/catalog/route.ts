import { NextResponse } from "next/server";
import { STYLE_PACKS } from "@/features/styles/catalog";
import { MUSIC_TRACKS } from "@/features/music/catalog";
import { VOICES, NARRATION_STYLES } from "@/features/voices/catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    styles: STYLE_PACKS,
    music: MUSIC_TRACKS,
    voices: VOICES,
    narrationStyles: NARRATION_STYLES,
  });
}
