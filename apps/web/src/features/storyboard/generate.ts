import { nanoid } from "nanoid";
import type {
  ProjectBrief,
  Storyboard,
  StoryboardScene,
  TransitionType,
} from "@/lib/types/project";

const TRANSITIONS: TransitionType[] = [
  "cut",
  "fade",
  "dissolve",
  "whip",
  "match_cut",
];

/**
 * Local storyboard generator (iteration 0 / offline without waiting on CLI).
 * The director can edit freely; later iterations can re-run with notes.
 * Optional: spawn Grok headless to refine (see render runner).
 */
export function generateStoryboardLocal(
  brief: ProjectBrief,
  previous?: Storyboard | null,
  directorNotes?: string
): Storyboard {
  const target = Math.min(180, Math.max(15, brief.durationSec));
  // ~6–8s per scene average
  const sceneCount = Math.min(
    28,
    Math.max(4, Math.round(target / 7))
  );
  const perScene = Math.round((target / sceneCount) * 10) / 10;

  const arcs = buildArcTitles(brief, sceneCount, directorNotes);
  const scenes: StoryboardScene[] = arcs.map((title, i) => ({
    id: previous?.scenes[i]?.id || nanoid(8),
    index: i,
    title,
    visual: buildVisual(brief, title, i, sceneCount),
    narration: buildNarration(brief, title, i, sceneCount),
    durationSec: perScene,
    imagePath: previous?.scenes[i]?.imagePath ?? null,
    imageUrl: previous?.scenes[i]?.imageUrl ?? null,
    transitionOut:
      i === sceneCount - 1
        ? "fade"
        : TRANSITIONS[i % TRANSITIONS.length],
    notes: directorNotes ? `Iter note: ${directorNotes.slice(0, 120)}` : undefined,
    confirmed: previous?.scenes[i]?.confirmed ?? false,
  }));

  // fix last durations to hit target
  const sum = scenes.reduce((a, s) => a + s.durationSec, 0);
  if (scenes.length) {
    scenes[scenes.length - 1].durationSec = Math.max(
      4,
      Math.round((scenes[scenes.length - 1].durationSec + (target - sum)) * 10) / 10
    );
  }

  return {
    version: (previous?.version || 0) + 1,
    iteration: (previous?.iteration || 0) + 1,
    summary: `${brief.topic} · ${brief.styleId} · ${target}s · ${brief.language}`,
    totalDurationSec: scenes.reduce((a, s) => a + s.durationSec, 0),
    scenes,
    updatedAt: new Date().toISOString(),
  };
}

function buildArcTitles(
  brief: ProjectBrief,
  n: number,
  notes?: string
): string[] {
  const base = [
    "Abertura / Hook",
    "Contexto",
    "Problema",
    "Virada",
    "Como funciona",
    "Prova / números",
    "Passo a passo",
    "Benefício",
    "Objeção",
    "Caminho legal / método",
    "Chamada à ação",
    "Realização / créditos",
  ];
  // expand/contract
  const titles: string[] = [];
  for (let i = 0; i < n; i++) {
    if (i < base.length) titles.push(base[i]);
    else titles.push(`Cena ${i + 1}`);
  }
  if (n >= 3) {
    titles[0] = brief.language === "pt-BR" ? "Abertura" : "Cold open";
    titles[n - 1] =
      brief.language === "pt-BR" ? "Encerramento" : "Close";
  }
  if (notes?.toLowerCase().includes("logo")) {
    titles[Math.min(1, n - 1)] = "Logo / marca";
  }
  return titles;
}

function buildVisual(
  brief: ProjectBrief,
  title: string,
  i: number,
  n: number
): string {
  const style = brief.styleId;
  const topic = brief.topic;
  if (i === 0) {
    return `${style} opening keyframe for "${topic}": bold hook composition, ${brief.aspect}, high impact first frame`;
  }
  if (i === n - 1) {
    return `${style} closing card for "${topic}": credits / realização, logos if provided, clean end slate`;
  }
  return `${style} scene "${title}" about ${topic}: layered visual explaining this beat, ${brief.aspect}, clear focal point for later keyframe`;
}

function buildNarration(
  brief: ProjectBrief,
  title: string,
  i: number,
  n: number
): string {
  const pt = brief.language === "pt-BR";
  if (i === 0) {
    return pt
      ? `Hoje vamos entender: ${brief.topic}.`
      : `Today we break down: ${brief.topic}.`;
  }
  if (i === n - 1) {
    return pt
      ? "O conhecimento chega à ponta — e vira resultado."
      : "Knowledge that reaches the edge becomes results.";
  }
  return pt
    ? `${title}: ponto-chave sobre ${brief.topic}.`
    : `${title}: key point on ${brief.topic}.`;
}
