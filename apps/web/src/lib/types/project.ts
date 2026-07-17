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
  /** Optional dedicated image-gen prompt (defaults to visual) */
  imagePrompt?: string;
  /** Queue flag for bulk still generation */
  imageJob?: "idle" | "queued" | "done" | "error";
}

export interface CaptionConfig {
  enabled: boolean;
  /** Relative scale, default 0.62 */
  scale: number;
  style: "clean" | "bold" | "minimal";
  position: "bottom" | "top";
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
  captions?: CaptionConfig;
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
  /** Relative path under repo root, e.g. music/carefree.mp3 */
  file?: string;
  credit?: string;
  /** Optional remote preview URL if we only have a link */
  previewUrl?: string;
}

export interface VoiceOption {
  id: string;
  label: string;
  provider: "grok-tts" | "elevenlabs";
  language: string[];
  gender?: string;
  description?: string;
}
