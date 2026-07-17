import type { MusicTrack } from "@/lib/types/project";

/**
 * Local royalty-free catalog. Drop files under repo `music/` and list them here.
 * Allowed sources: Pixabay, YouTube Audio Library, Incompetech (CC-BY).
 */
export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: "carefree",
    title: "Carefree",
    moods: ["documentary", "warm", "optimistic", "corporate"],
    source: "incompetech",
    file: "music/carefree.mp3",
    credit: "Kevin MacLeod (incompetech.com) — CC BY 4.0",
  },
  {
    id: "documentary-warm",
    title: "Documentary Warm",
    moods: ["documentary", "calm"],
    source: "local",
    // placeholder until file is imported — preview 404 until then
  },
  {
    id: "upbeat-tech",
    title: "Upbeat Tech",
    moods: ["tech", "upbeat"],
    source: "local",
  },
  {
    id: "tense-minimal",
    title: "Tense Minimal",
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

export const MUSIC_IMPORT_HINT = {
  sources: [
    {
      id: "pixabay",
      label: "Pixabay Music",
      url: "https://pixabay.com/music/",
      note: "Free commercial use",
    },
    {
      id: "youtube_audio_library",
      label: "YouTube Audio Library",
      url: "https://studio.youtube.com",
      note: "Studio → Audio Library",
    },
    {
      id: "incompetech",
      label: "Incompetech",
      url: "https://incompetech.com",
      note: "CC-BY — keep credit",
    },
  ],
  dropPath: "music/<slug>.mp3 + entry in apps/web catalog or music/manifest.json",
};
