import path from "path";
import fs from "fs";

/** Monorepo root = grokVoxel/ (apps/web -> ../..) */
export function repoRoot(): string {
  // When running from apps/web, cwd is apps/web; prefer env override
  if (process.env.GROK_STUDIO_ROOT) {
    return path.resolve(process.env.GROK_STUDIO_ROOT);
  }
  const cwd = process.cwd();
  if (cwd.endsWith(`${path.sep}apps${path.sep}web`) || cwd.endsWith("/apps/web")) {
    return path.resolve(cwd, "../..");
  }
  // fallback: look upward for skills/
  let dir = cwd;
  for (let i = 0; i < 5; i++) {
    if (fs.existsSync(path.join(dir, "skills"))) return dir;
    dir = path.dirname(dir);
  }
  return path.resolve(cwd, "../..");
}

export function dataDir(): string {
  const d = path.join(repoRoot(), "data");
  fs.mkdirSync(d, { recursive: true });
  return d;
}

export function projectsDir(): string {
  const d = path.join(dataDir(), "projects");
  fs.mkdirSync(d, { recursive: true });
  return d;
}

export function projectDir(id: string): string {
  const d = path.join(projectsDir(), id);
  fs.mkdirSync(d, { recursive: true });
  return d;
}

export function projectAssetsDir(id: string): string {
  const d = path.join(projectDir(id), "assets");
  fs.mkdirSync(d, { recursive: true });
  return d;
}

export function skillsDir(): string {
  return path.join(repoRoot(), "skills");
}
