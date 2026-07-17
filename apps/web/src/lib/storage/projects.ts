import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";
import type { Project, ProjectBrief, Storyboard } from "@/lib/types/project";
import { projectDir, projectsDir, projectAssetsDir } from "@/lib/paths";

function projectJsonPath(id: string) {
  return path.join(projectDir(id), "project.json");
}

export function listProjects(): Project[] {
  const root = projectsDir();
  const ids = fs
    .readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
  return ids
    .map((id) => {
      try {
        return getProject(id);
      } catch {
        return null;
      }
    })
    .filter((p): p is Project => !!p)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getProject(id: string): Project {
  const p = projectJsonPath(id);
  if (!fs.existsSync(p)) throw new Error(`Project not found: ${id}`);
  return JSON.parse(fs.readFileSync(p, "utf8")) as Project;
}

export function saveProject(project: Project): Project {
  project.updatedAt = new Date().toISOString();
  const p = projectJsonPath(project.id);
  fs.writeFileSync(p, JSON.stringify(project, null, 2) + "\n");
  return project;
}

export function createProject(input: {
  name?: string;
  brief: ProjectBrief;
}): Project {
  const id = nanoid(10);
  const now = new Date().toISOString();
  projectAssetsDir(id);
  const project: Project = {
    id,
    name: input.name || input.brief.topic.slice(0, 60) || `Project ${id}`,
    createdAt: now,
    updatedAt: now,
    phase: "brief",
    brief: input.brief,
    assets: { logos: [], images: [], references: [] },
    storyboard: null,
    iterations: [],
    render: { status: "idle" },
  };
  return saveProject(project);
}

export function updateStoryboard(
  id: string,
  storyboard: Storyboard,
  iterationNote?: string
): Project {
  const project = getProject(id);
  project.storyboard = storyboard;
  project.phase = "storyboard";
  if (iterationNote) {
    project.iterations.push({
      at: new Date().toISOString(),
      note: iterationNote,
      storyboardVersion: storyboard.version,
    });
  }
  return saveProject(project);
}

export function approveStoryboard(id: string): Project {
  const project = getProject(id);
  if (!project.storyboard?.scenes?.length) {
    throw new Error("No storyboard to approve");
  }
  project.phase = "approved";
  return saveProject(project);
}

export function setRenderStatus(
  id: string,
  render: Project["render"]
): Project {
  const project = getProject(id);
  project.render = render;
  if (render.status === "running" || render.status === "queued") {
    project.phase = "rendering";
  } else if (render.status === "done") {
    project.phase = "done";
  } else if (render.status === "error") {
    project.phase = "error";
  }
  return saveProject(project);
}

/** Persist storyboard as beats-like JSON for the skill pipeline */
export function writeStoryboardArtifact(project: Project): string {
  if (!project.storyboard) throw new Error("No storyboard");
  const out = path.join(projectDir(project.id), "storyboard.json");
  fs.writeFileSync(out, JSON.stringify(project.storyboard, null, 2) + "\n");
  // also write beats.json skeleton for skill
  const beats = {
    project: project.id,
    topic: project.brief.topic,
    language: project.brief.language,
    aspect: project.brief.aspect,
    duration_target_s: project.brief.durationSec,
    collage_style: project.brief.styleId,
    provider: "grok_native",
    voice: {
      voice_id: project.brief.voiceId,
      language: project.brief.language,
    },
    music: project.brief.musicId,
    captions: true,
    caption_scale: 0.62,
    watermark: "Grok Studio",
    beats: project.storyboard.scenes.map((s, i) => ({
      id: i + 1,
      title_en: s.title,
      title_pt: s.title,
      narration: s.narration,
      shots: [
        {
          id: "a",
          dur: s.durationSec,
          title: true,
          scene: s.visual,
          element_motion: "subtle paper motion, text stable",
          camera_move: i === 0 ? "push_in" : i % 2 === 0 ? "parallax" : "static",
          transition: s.transitionOut,
        },
      ],
    })),
  };
  const beatsPath = path.join(projectDir(project.id), "beats.json");
  fs.writeFileSync(beatsPath, JSON.stringify(beats, null, 2) + "\n");
  return beatsPath;
}
