# GrokVoxel — Agent Guide

This repository is an **agent skill**: a self-contained workflow that turns one topic into a
finished short explainer / promo video inside **Grok Build** (native image + video tools,
Grok TTS for voice, local royalty-free music, ffmpeg assembly).

It is not tied to a single assistant — any coding agent that can read instructions, call
image/video tools (or equivalent), and run scripts can drive it. It is optimized for Grok Build.

## How to use it (for the agent)

1. Read **`SKILL.md`** — full workflow and the two human approval gates.
2. Before writing image or motion prompts, read **`references/prompt-guide-grokvoxel.md`**.
3. Before drafting structure, read **`references/beat-layer.md`**.
4. Work one project at a time under `out/<project>/`, driven by a single `beats.json`.
5. Run deterministic stages from **`scripts/`**:
   `style_bakeoff.py` → (agent generates keyframes + clips) → `tts_grok.py` →
   `pick_music.py` → `assemble.py`.

## Requirements

- **Grok Build** (or an agent with image gen / image-to-video) for keyframes and motion
- `XAI_API_KEY` for Grok TTS narration — https://docs.x.ai/developers/model-capabilities/audio/voice
- `ffmpeg` + `ffprobe`
- Python 3 with **Pillow**

## Agent notes

- **Grok Build:** install or open this repo and ask for a "GrokVoxel video" / run `/grok-voxel`.
- **Do not** call external image/video APIs (Atlas, Seedance, etc.). Use native tools.
- **Do not** invent ffmpeg assembly one-liners — always use `scripts/assemble.py`.
- **Music:** only Pixabay, YouTube Audio Library, Incompetech (see `music/README.md`).
- **Gates:** stop for beat-map approval and style bake-off pick.

## Credits

Architecture derived from [vox-director](https://github.com/Alisa0808/vox-director)
(MIT © Atlas Cloud / Alisa0808).
