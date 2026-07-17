import type { StylePack } from "@/lib/types/project";

/**
 * Video style packs — each maps to a skill under /skills.
 * "Video styles" product feature lives here.
 */
export const STYLE_PACKS: StylePack[] = [
  {
    id: "grok-voxel",
    name: "GrokVoxel",
    description:
      "Editorial paper-collage / swiss scrapbook explainers. Default house look from the original skill.",
    skillPath: "skills/grok-voxel",
    tags: ["collage", "explainer", "swiss", "ads"],
    defaultCollageStyle: "swiss-editorial",
    previewHue: "from-amber-900/40 to-cyan-900/40",
  },
  {
    id: "doodle",
    name: "Doodle Board",
    description:
      "Hand-drawn whiteboard doodles, markers, sticky notes — light, playful explainers.",
    skillPath: "skills/doodle",
    tags: ["doodle", "whiteboard", "education"],
    defaultCollageStyle: "marker-doodle",
    previewHue: "from-yellow-200/30 to-sky-300/30",
  },
  {
    id: "cinematic-brand",
    name: "Cinematic Brand",
    description:
      "Glossy 3D brand opens (vinheta style) into clean product/education body.",
    skillPath: "skills/cinematic-brand",
    tags: ["3d", "brand", "vinheta", "corporate"],
    defaultCollageStyle: "brand-3d",
    previewHue: "from-blue-900/50 to-red-900/40",
  },
  {
    id: "govtech-flat",
    name: "GovTech Flat",
    description:
      "Institutional flat design for public-sector cartilhas and training (MPC-PR ready).",
    skillPath: "skills/govtech-flat",
    tags: ["gov", "institutional", "training"],
    defaultCollageStyle: "gov-flat",
    previewHue: "from-slate-800/50 to-emerald-900/30",
  },
];

export function getStyle(id: string): StylePack | undefined {
  return STYLE_PACKS.find((s) => s.id === id);
}
