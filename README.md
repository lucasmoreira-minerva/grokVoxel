# GrokStage

**Storyboard-first video director** powered by **SuperGrok / Grok Build headless** and pluggable **style skills**.

> Brand: **GrokStage** — the stage where SuperGrok directs short films.

The original **GrokVoxel** pipeline lives under `skills/grok-voxel/` as the first **video style**. The product surface is a Next.js web app (local pilot on **:3030**, Vercel-ready UI + optional Neon later).

```
Brief → Storyboard (iterate N times) → Approve → Release CLI → Scene clips → final.mp4
```

You are the **director**. The storyboard (scene title, visual, narration, duration, transition) is the single source of truth before any expensive generation runs.

---

## Architecture (decision)

| Layer | Role |
|---|---|
| **GUI** (`apps/web`) | Flight deck: style, music, voice, storyboard editor, approve, release |
| **Engine** | `grok -p …` headless on a machine with SuperGrok login |
| **Styles** | `skills/*` + catalog in `features/styles` |
| **Deterministic glue** | ffmpeg assemble scripts inside each skill pack |
| **Data** | File store in `data/projects/` (local). `DATABASE_URL` reserved for Neon |

**Why not 100% Vercel-only render?** Native Grok Imagine + Build tools and SuperGrok session live on the authenticated CLI host. The UI can deploy to Vercel; **render** still needs a local (or worker) runner with `grok` installed. That is intentional, not a bug.

---

## Quick start (local :3030)

```bash
# prerequisites: Node 20+, optionally Grok CLI logged in (SuperGrok)
cd apps/web
npm install
npm run dev
# → http://localhost:3030
```

From repo root:

```bash
npm run dev --prefix apps/web
```

### Optional env

```bash
# apps/web/.env.local
GROK_BIN=/Users/you/.grok/bin/grok
GROK_STUDIO_ROOT=/path/to/grokVoxel   # monorepo root
GROK_STUDIO_DRY_RUN=1                 # force prompt-only (no spawn)
# DATABASE_URL=postgres://…           # future Neon
```

---

## Director flow in the UI

1. **New project** — topic, duration (15–180s), aspect, language, **style skill**, music, voice  
2. **Storyboard** — auto draft + edit each scene (title, visual, narration, duration, transition)  
3. **Iterate** — director notes → regenerate version N  
4. **Close storyboard** — writes `data/projects/<id>/beats.json`  
5. **Release CLI / Render** — spawns Grok headless with the approved board (or dry-run if no CLI)

---

## Styles (feature: estilos de vídeo)

| ID | Skill folder | Look |
|---|---|---|
| `grok-voxel` | `skills/grok-voxel` | Paper collage / swiss editorial |
| `doodle` | `skills/doodle` | Whiteboard marker doodles |
| `cinematic-brand` | `skills/cinematic-brand` | 3D brand open |
| `govtech-flat` | `skills/govtech-flat` | Institutional training |

Add a style: create `skills/<id>/SKILL.md` + entry in `apps/web/src/features/styles/catalog.ts`.

---

## Repo layout

```
apps/web/                 Next.js GUI (feature-based)
skills/grok-voxel/        original voxel skill + scripts
skills/doodle/            …
skills/cinematic-brand/
skills/govtech-flat/
data/projects/            local project JSON + artifacts
scripts/                  (legacy root copies; prefer skills/*/scripts)
```

Feature folders under `apps/web/src/features/`:

- `director` — brief / new project  
- `storyboard` — board generator + editor  
- `styles` — style catalog  
- `music` / `voices` — beds and Grok TTS roster  
- `render` — (API) CLI release  
- `projects` — shell / list  

---

## Credits

Pipeline ideas from [vox-director](https://github.com/Alisa0808/vox-director) (MIT · Alisa0808 / Atlas Cloud).  
Engine: xAI Grok Build / SuperGrok.

## License

MIT
