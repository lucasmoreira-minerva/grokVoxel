/** Shared domain types for Grok Studio (video director). */

export type ProjectPhase =
  | "brief"
  | "storyboard"
  | "approved"
  | "rendering"
  | "done"
  | "error";

export type AspectRatio = "16:9" | "9:16" | "1:1";

export type TransitionType =
  | "cut"
  | "fade"
  | "dissolve"
  | "whip"
  | "match_cut";

export interface StoryboardScene {
  id: string;
  index: number;
  /** Short scene title shown on the board */
  title: string;
  /** Visual description for keyframe generation */
  visual: string;
  /** Narration / VO line for this scene */
  narration: string;
  /** Estimated duration in seconds */
  durationSec: number;
  /** Path or URL to representative still (optional until generated) */
  imagePath?: string | null;
  /** Public URL for card preview (e.g. /api/projects/.../assets/...) */
  imageUrl?: string | null;
  /** Transition INTO the next scene */
  transitionOut: TransitionType;
  notes?: string;
  /** Director confirmed this card */
  confirmed?: boolean;
}

export interface Storyboard {
  version: number;
  iteration: number;
  summary: string;
  totalDurationSec: number;
  scenes: StoryboardScene[];
  updatedAt: string;
}

export interface ProjectAssets {
  logos: string[];
  images: string[];
  references: string[];
}

export interface ProjectBrief {
  topic: string;
  audience?: string;
  language: "en" | "pt-BR";
  aspect: AspectRatio;
  durationSec: number;
  styleId: string;
  musicId: string;
  voiceId: string;
  narrationStyle: string;
  initialPrompt: string;
}

export interface RenderJob {
  status: "idle" | "queued" | "running" | "done" | "error";
  startedAt?: string;
  finishedAt?: string;
  logTail?: string;
  error?: string;
  outputPath?: string;
  sessionId?: string;
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  phase: ProjectPhase;
  brief: ProjectBrief;
  assets: ProjectAssets;
  storyboard: Storyboard | null;
  /** Free-text director notes per iteration */
  iterations: { at: string; note: string; storyboardVersion: number }[];
  render: RenderJob;
}

export interface StylePack {
  id: string;
  name: string;
  description: string;
  skillPath: string;
  tags: string[];
  defaultCollageStyle?: string;
  previewHue: string;
}

export interface MusicTrack {
  id: string;
  title: string;
  moods: string[];
  source: "pixabay" | "youtube_audio_library" | "incompetech" | "local";
  file?: string;
  credit?: string;
}

export interface VoiceOption {
  id: string;
  label: string;
  provider: "grok-tts" | "elevenlabs";
  language: string[];
  gender?: string;
  description?: string;
}
