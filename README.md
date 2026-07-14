# GrokVoxel

**Turn one topic into a finished short promotional / explainer video — end to end inside [Grok Build](https://x.ai).**

An **agent skill** for Grok Build (xAI): you give a one-line topic; the agent returns an `mp4`
(15–60s, `16:9` or `9:16`). Keyframes and motion use **native Grok Imagine tools**. Narration
uses **Grok TTS** (English and Brazilian Portuguese). Music comes from a **local royalty-free**
bank. Assembly is deterministic **ffmpeg + Python**.

> **Name note:** “Voxel” is brand. The visual language is editorial **paper-collage /
> encyclopedia scrapbook / archival papercraft** (calibrated from creator references), not
> 3D voxel block art.

[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg)](LICENSE)
[![Agent Skill](https://img.shields.io/badge/Agent-Skill-d97757.svg)](SKILL.md)

---

## What it is

Pipeline (single `beats.json` per project):

```
topic
  │
  ├─ 1. beat map        narrative arc → beats.json      ◀── GATE 1: approve beat map
  ├─ 2. style bake-off  same scene, 6–8 presets         ◀── GATE 2: pick the look
  ├─ 3. keyframes       native text-to-image / image-to-image
  ├─ 4. motion          native image-to-video (mute native audio by default)
  ├─ 5. voice + music   Grok TTS + local royalty-free BGM
  ├─ 6. assemble        ffmpeg: concat, duck music, captions, watermark
  └─ final.mp4
```

Two human gates (beat map + style); everything else automated.

---

## Install

### Requirements

- [Grok Build](https://x.ai) / SuperGrok (native image + video tools)
- `XAI_API_KEY` for [Grok TTS](https://docs.x.ai/developers/model-capabilities/audio/voice)
- `ffmpeg` + `ffprobe` (`brew install ffmpeg` on macOS)
- Python 3 + Pillow (`pip install pillow`)

### Option A — clone as a project skill

```bash
git clone https://github.com/lucasmoreira-minerva/grokVoxel.git
cd grokVoxel
# Open this folder in Grok Build, or point your agent at AGENTS.md → SKILL.md
```

### Option B — user-level Grok skill

```bash
git clone https://github.com/lucasmoreira-minerva/grokVoxel.git ~/.grok/skills/grok-voxel
```

Then ask Grok for a “GrokVoxel video” or run `/grok-voxel`.

```bash
export XAI_API_KEY="xai-..."
```

Add a few instrumental tracks under `music/` and list them in `music/manifest.json`
(see [Music](#music)).

---

## Quick start

In Grok Build, with this skill available:

> Make me a GrokVoxel explainer on “How coffee reached Europe” — English, 9:16, 30 seconds.

The agent will:

1. Draft a beat map for your approval  
2. Run a style bake-off for you to pick  
3. Generate keyframes → motion → voice → music → assemble  
4. Drop `out/<project>/final.mp4`

Example beat maps: [`examples/`](examples/).

---

## Stack

| Stage | Backend |
|---|---|
| Keyframes | Grok native `image_gen` / `image_edit` (prefer i2i + style stills) |
| Motion | Grok native `image_to_video` |
| Narration | Grok TTS (`scripts/tts_grok.py`) — `en`, `pt-BR` |
| Music | Local files (Pixabay / YouTube Audio Library / Incompetech only) |
| Assemble | `scripts/assemble.py` (ffmpeg + Pillow) |

There is **no** xAI music model. Native clip audio is muted by default (`ffmpeg -an`);
optional per-shot `keep_native_sfx` for intentional SFX only.

---

## Repository layout

```
SKILL.md                 agent workflow
AGENTS.md                entry point for coding agents
README.md                this file
LICENSE                  MIT
references/              LOOK + STORY + gotchas + style stills
scripts/                 deterministic pipeline stages
music/                   royalty-free bank + manifest
examples/                sample beats.json
out/                     working projects (gitignored)
```

---

## Music

**Allowed sources only** (hardcoded in `SKILL.md`):

1. [Pixabay Music](https://pixabay.com/music/)  
2. [YouTube Audio Library](https://studio.youtube.com) (Audio Library tab)  
3. [Incompetech](https://incompetech.com) (CC-BY — keep credit in the manifest)

See [`music/README.md`](music/README.md). Do not commit protected tracks.

---

## Credits

GrokVoxel is a **derivative** of the agent-skill architecture in:

- **[vox-director](https://github.com/Alisa0808/vox-director)** by **[Alisa0808](https://github.com/Alisa0808)**, built on **[Atlas Cloud](https://www.atlascloud.ai/)** (MIT)

We keep the stage pipeline, `beats.json` pattern, and deterministic assembly ideas; we replace
the generation backend with **Grok-native** tools and recalibrate the visual style from
public creator references (see `references/prompt-guide-grokvoxel.md`).

Style reference creators inspected for calibration (not affiliated): @MrLarus, @OriSilver.

---

## License

[MIT](LICENSE) © 2026 lucasmoreira-minerva  

Includes ideas and structure derived from vox-director (MIT © Atlas Cloud).

---

## Topics / discoverability

`agent-skill` · `grok` · `xai` · `grok-build` · `explainer-video` · `ffmpeg` · `tts` ·
`image-to-video` · `paper-collage` · `promotional-video` · `pt-br` · `motion-graphics`
