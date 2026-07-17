import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { repoRoot, projectDir, skillsDir } from "@/lib/paths";
import {
  getProject,
  setRenderStatus,
  writeStoryboardArtifact,
} from "@/lib/storage/projects";
import { getStyle } from "@/features/styles/catalog";

function findGrokBinary(): string | null {
  if (process.env.GROK_BIN && fs.existsSync(process.env.GROK_BIN)) {
    return process.env.GROK_BIN;
  }
  const home = process.env.HOME || "";
  const candidates = [
    path.join(home, ".grok/bin/grok"),
    "/usr/local/bin/grok",
    "/opt/homebrew/bin/grok",
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

/**
 * Build the headless prompt that drives the skill after storyboard approval.
 */
export function buildRenderPrompt(projectId: string): string {
  const project = getProject(projectId);
  if (!project.storyboard) throw new Error("Storyboard required");
  const style = getStyle(project.brief.styleId);
  const skill = style?.skillPath || `skills/${project.brief.styleId}`;
  const beatsPath = writeStoryboardArtifact(project);
  const outDir = path.join(projectDir(projectId), "render");

  return [
    `You are running inside Grok Studio for project ${projectId}.`,
    `Read the skill at ${skill}/SKILL.md (repo root relative) and follow its pipeline.`,
    `Style pack: ${project.brief.styleId}.`,
    `Language: ${project.brief.language}. Aspect: ${project.brief.aspect}.`,
    `Voice: ${project.brief.voiceId}. Music mood/id: ${project.brief.musicId}.`,
    `Narration style: ${project.brief.narrationStyle}.`,
    `Approved storyboard / beats file: ${beatsPath}`,
    `Work under: ${outDir}`,
    `For each scene in the storyboard: generate keyframe (prefer image_edit with style refs), then image_to_video (6s).`,
    `Then run deterministic assembly scripts from ${skill}/scripts (tts if needed, pick_music, assemble).`,
    `Human gates are ALREADY approved for this run — do not stop for beat map or bake-off.`,
    `Write final mp4 to ${path.join(outDir, "final.mp4")}.`,
    `When done, print FINAL_PATH=... and a short summary.`,
  ].join("\n");
}

export type RunResult = {
  ok: boolean;
  code: number | null;
  log: string;
  dryRun: boolean;
};

/**
 * Spawn Grok Build headless. Requires local SuperGrok auth.
 * If GROK_STUDIO_DRY_RUN=1 or binary missing, writes a dry-run log instead.
 */
export async function runGrokRender(projectId: string): Promise<RunResult> {
  const project = getProject(projectId);
  if (project.phase !== "approved" && project.phase !== "error") {
    // allow re-render from approved or retry error
    if (project.phase !== "rendering") {
      throw new Error(
        `Project must be approved before render (phase=${project.phase})`
      );
    }
  }

  const prompt = buildRenderPrompt(projectId);
  const logPath = path.join(projectDir(projectId), "render.log");
  const bin = findGrokBinary();
  const dry =
    process.env.GROK_STUDIO_DRY_RUN === "1" ||
    process.env.GROK_STUDIO_DRY_RUN === "true" ||
    !bin;

  setRenderStatus(projectId, {
    status: "running",
    startedAt: new Date().toISOString(),
    logTail: dry ? "DRY RUN — Grok binary missing or GROK_STUDIO_DRY_RUN=1" : "Starting grok headless…",
  });

  if (dry) {
    const log = [
      "=== Grok Studio DRY RUN ===",
      `Would execute: grok -p <prompt> --cwd ${repoRoot()}`,
      `Binary found: ${bin || "NONE"}`,
      "",
      "--- prompt ---",
      prompt,
      "",
      "Install/login SuperGrok CLI, then re-run render.",
      "Or set GROK_BIN=/path/to/grok",
    ].join("\n");
    fs.writeFileSync(logPath, log);
    setRenderStatus(projectId, {
      status: "error",
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      logTail: log.slice(-2000),
      error: bin
        ? "DRY_RUN enabled"
        : "Grok CLI not found — local SuperGrok runner required for full render",
    });
    return { ok: false, code: 1, log, dryRun: true };
  }

  const cwd = repoRoot();
  const args = [
    "-p",
    prompt,
    "--cwd",
    cwd,
    "--output-format",
    "plain",
    "--yolo",
  ];

  return new Promise((resolve) => {
    const child = spawn(bin!, args, {
      cwd,
      env: { ...process.env },
      shell: false,
    });
    let log = `$ ${bin} ${args.map((a) => (a.includes("\n") ? "[prompt]" : a)).join(" ")}\n\n`;
    const append = (buf: Buffer) => {
      log += buf.toString();
      if (log.length > 200_000) log = log.slice(-150_000);
      try {
        fs.writeFileSync(logPath, log);
        setRenderStatus(projectId, {
          status: "running",
          startedAt: new Date().toISOString(),
          logTail: log.slice(-2500),
        });
      } catch {
        /* ignore */
      }
    };
    child.stdout?.on("data", append);
    child.stderr?.on("data", append);
    child.on("close", (code) => {
      const outPath = path.join(projectDir(projectId), "render", "final.mp4");
      const ok = code === 0;
      setRenderStatus(projectId, {
        status: ok ? "done" : "error",
        finishedAt: new Date().toISOString(),
        logTail: log.slice(-2500),
        error: ok ? undefined : `grok exited ${code}`,
        outputPath: fs.existsSync(outPath) ? outPath : undefined,
      });
      fs.writeFileSync(logPath, log);
      resolve({ ok, code, log, dryRun: false });
    });
  });
}

export function grokStatus(): {
  binary: string | null;
  skills: string[];
  dryRunDefault: boolean;
} {
  const bin = findGrokBinary();
  let skills: string[] = [];
  try {
    skills = fs
      .readdirSync(skillsDir(), { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch {
    skills = [];
  }
  return {
    binary: bin,
    skills,
    dryRunDefault: !bin || process.env.GROK_STUDIO_DRY_RUN === "1",
  };
}
