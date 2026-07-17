import type { MusicTrack } from "@/lib/types/project";

export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: "carefree",
    title: "Carefree (Kevin MacLeod)",
    moods: ["documentary", "warm", "optimistic", "corporate"],
    source: "incompetech",
    file: "music/carefree.mp3",
    credit:
      "Music by Kevin MacLeod (incompetech.com) — CC BY 4.0",
  },
  {
    id: "documentary-warm",
    title: "Documentary Warm (placeholder mood)",
    moods: ["documentary", "calm"],
    source: "local",
  },
  {
    id: "upbeat-tech",
    title: "Upbeat Tech (placeholder mood)",
    moods: ["tech", "upbeat"],
    source: "local",
  },
  {
    id: "tense-minimal",
    title: "Tense Minimal (placeholder mood)",
    moods: ["tense", "minimal"],
    source: "local",
  },
  {
    id: "none",
    title: "No music bed",
    moods: ["silent"],
    source: "local",
  },
];
