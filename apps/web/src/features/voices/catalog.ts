import type { VoiceOption } from "@/lib/types/project";

/** SuperGrok / Grok TTS first — ElevenLabs reserved for future. */
export const VOICES: VoiceOption[] = [
  {
    id: "eve",
    label: "Eve",
    provider: "grok-tts",
    language: ["en", "pt-BR"],
    gender: "female",
    description: "Clear default narrator (Grok TTS)",
  },
  {
    id: "leo",
    label: "Leo",
    provider: "grok-tts",
    language: ["en", "pt-BR"],
    gender: "male",
    description: "Documentary male tone (Grok TTS)",
  },
  {
    id: "ara",
    label: "Ara",
    provider: "grok-tts",
    language: ["en", "pt-BR"],
    gender: "female",
    description: "Warm instructional (Grok TTS)",
  },
  {
    id: "rex",
    label: "Rex",
    provider: "grok-tts",
    language: ["en", "pt-BR"],
    gender: "male",
    description: "Energetic promo (Grok TTS)",
  },
];

export const NARRATION_STYLES = [
  { id: "documentary", label: "Documentary", hint: "Calm, factual, measured pace" },
  { id: "teacher", label: "Teacher / aula", hint: "Clear pedagogy, short sentences" },
  { id: "promo", label: "Promo / ads", hint: "Punchy hooks, urgency" },
  { id: "storyteller", label: "Storyteller", hint: "Narrative arc, emotional beats" },
];
