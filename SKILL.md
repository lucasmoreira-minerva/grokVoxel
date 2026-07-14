---
name: grok-voxel
description: >
  Turn ONE topic into a finished short promotional / explainer video (15–60s) end to end
  inside Grok Build: beat map, style bake-off, collage keyframes, image-to-video motion,
  Grok TTS narration (en + pt-BR), royalty-free music, captions, watermark. Use when the
  user wants a GrokVoxel video, paper-collage / encyclopedia scrapbook explainer, archival
  papercraft ad, motion collage, narrated short, topic-to-mp4, or runs /grok-voxel.
  Triggers: "grokvoxel", "grok voxel", "explainer video", "promotional short",
  "paper collage video", "make a video about", "topic to mp4", "/grok-voxel".
---

# GrokVoxel

Turn a one-line topic into a finished **short explainer / promo mp4** (target **15–180s**,
default 30–90s; **hard max 3 minutes**), aspect `16:9` or `9:16`. Narration language is a
parameter (default **English**; **Brazilian Portuguese / pt-BR** must work).

**Visual style** is editorial paper-collage / encyclopedia scrapbook / archival papercraft
(see `references/prompt-guide-grokvoxel.md`) — *not* 3D voxel block art. The name is brand.

**Generation:** Grok-native image + video tools only. **Voice:** Grok TTS HTTP
(`scripts/tts_grok.py`). **Music:** local royalty-free bank only. **Assembly:** deterministic
scripts (ffmpeg + Python) — never invent concat/duck/captions ad hoc.

Structural blueprint: [vox-director](https://github.com/Alisa0808/vox-director) (MIT,
Alisa0808 / Atlas Cloud). GrokVoxel swaps Atlas Cloud generation for Grok-native tools and
recalibrates the look from GrokVoxel style references.

## Prerequisites (check, don't skip)

- `command -v ffmpeg ffprobe`
- `python3 -c "import PIL"`
- `echo "${XAI_API_KEY:+set}"` — required for narration (Grok TTS). Image/video use native
  tools (no Atlas key).

## Standard workflow (topic → film)

All state lives in `out/<project>/beats.json`.

### 1. Beat map — **GATE 1**

1. Read `references/beat-layer.md`. Pick an `arc` for the topic.
2. Write `out/<project>/beats.json` (schema below). Beat-1 = ≤3s hook. Prefer 2 shots/beat
   (wide+title, detail). Language: `en` or `pt-BR`.
3. **Stop and show the beat map to the user. Do not generate media until approved.**

### 2. Style bake-off — **GATE 2**

1. Read `references/prompt-guide-grokvoxel.md` before any image prompt.
2. If `collage_style` is not set:
   ```bash
   python3 scripts/style_bakeoff.py init out/<project>
   ```
3. For each preset folder, generate **one** keyframe of the **same fixed test scene**
   (prefer `image_edit` with stills from `references/stills/`). Save as
   `out/<project>/bakeoff/<preset>/keyframe.jpg`.
4. ```bash
   python3 scripts/style_bakeoff.py contact out/<project>
   ```
5. Present the contact sheet / stills. **User picks the look.** Set `"collage_style"` to the
   winning preset name in `beats.json`.
6. If the user asks you to decide (or skips GATE 2), use the house default
   **`swiss-editorial`** (see `references/prompt-guide-grokvoxel.md`). Prefer
   `dense-encyclopedia` for dense history, `archival-map` for place/story, or
   `product-explainer` for pure how-it-works ads.

### 3. Keyframes

For each shot missing `keyframe_path`:

1. Compose the 5-part image prompt from the style guide + chosen preset.
2. Prefer **`image_edit`** with 1–2 style stills; fallback `image_gen` only if needed.
3. Aspect: match project `aspect` (`16:9` or `9:16`).
4. Save under `out/<project>/keyframes/` and write `keyframe_path` (+ optional `keyframe_prompt`)
   into the shot. Re-roll weak posters before motion.

### 4. Motion

For each shot with a keyframe:

1. Build motion prompt (stop-motion collage verbs; one camera move; protect text).
2. Call **`image_to_video`** (prefer **6s**; 10s only if needed).
3. Save under `out/<project>/clips/` and set `clip_path`.
4. Default: native audio will be **muted at assembly**. Set `"keep_native_sfx": true` only
   for intentional SFX (still not a music bed).

### 5. Voice + music

```bash
python3 scripts/tts_grok.py out/<project>
python3 scripts/pick_music.py out/<project>   # uses beats.json "music" mood or manifest tags
```

### 6. Assemble

```bash
python3 scripts/assemble.py out/<project>
python3 scripts/assemble.py out/<project> --no-captions -o final-no-captions.mp4
```

Defaults: thinner captions (`caption_scale` ≈ 0.72). Override in `beats.json`:
`"captions": true`, `"caption_scale": 0.65`.

Output: `out/<project>/final.mp4` (and optional no-caption twin).

### 7. Storyboard one-pager

After keyframes exist (or with placeholders), export a single PNG/PDF of the full board:

```bash
python3 scripts/storyboard_page.py out/<project>
python3 scripts/storyboard_page.py out/<project> --cols 4 --title "My Film"
```

Writes `storyboard.png` + `storyboard.pdf` under the project dir (thumbnails, titles,
narration/scene text). Use for client approval before or after motion.

### 8. Verify

Extract frames and inspect; re-roll keyframes cheaply before re-animating.

```bash
ffmpeg -ss 2 -i out/<project>/final.mp4 -frames:v 1 /tmp/check.jpg
```

## beats.json schema

```json
{
  "project": "my-film",
  "topic": "...",
  "language": "en",
  "aspect": "9:16",
  "provider": "grok_native",
  "collage_style": "dense-encyclopedia",
  "arc": "timeline",
  "style_refs": [
    "references/stills/mrlarus-qin-portrait.jpg",
    "references/stills/orisilver-v1-vs-v3-map.jpg"
  ],
  "voice": { "voice_id": "eve", "language": "en", "speed": 1.0 },
  "music": "documentary warm instrumental",
  "mix": { "music": 0.55, "voice": 1.25 },
  "captions": true,
  "caption_scale": 0.72,
  "watermark": "Made with GrokVoxel",
  "duration_target_s": 90,
  "beats": [
    {
      "id": 1,
      "title_en": "BEFORE MONEY",
      "bg": "warm clay tan",
      "feel": "ancient, humble",
      "hook": "surprising_stat",
      "narration": "For most of history, there was no money...",
      "shots": [
        {
          "id": "a",
          "dur": 5,
          "title": true,
          "shot_size": "WIDE",
          "camera_move": "push_in",
          "scene": "...",
          "element_motion": "traders gesture, goat bobs, tokens scatter",
          "keep_native_sfx": false
        }
      ]
    }
  ]
}
```

After generation stages the agent also writes paths: `keyframe_path`, `clip_path`,
`narration_audio`, `narration_dur`, `bgm_path`.

## Music policy (hard rule)

Only these sources may be used for BGM:

1. [Pixabay Music](https://pixabay.com/music/)
2. [YouTube Audio Library](https://studio.youtube.com) (Audio Library tab)
3. [Incompetech](https://incompetech.com) (CC-BY — credit in `music/manifest.json`)

Never rip audio from arbitrary videos. Never use Grok Imagine clip audio as a music bed.
List tracks in `music/manifest.json` with `"source": "pixabay" | "youtube_audio_library" | "incompetech"`.

## Duration limits

| Target | Beats (guide) | Notes |
|---|---|---|
| 15–30s | 3–8 | social hooks |
| 60s | 10–12 | standard explainer |
| 90s | 12–16 | preferred long pilot |
| **180s max** | 20–28 | full storyboard ceiling |

Do not plan a single `beats.json` over **3 minutes**. Split longer narratives into chapters.

## Human gates (do not skip)

| Gate | When | What stops |
|---|---|---|
| **GATE 1** | After drafting `beats.json` | All generation |
| **GATE 2** | Style bake-off | Full keyframe/motion run |

Everything else is automated. Optional: export `storyboard_page.py` after GATE 1 keyframe
draft for visual approval.

## References to read before prompting

| File | Why |
|---|---|
| `references/prompt-guide-grokvoxel.md` | LOOK + presets + i2i stills |
| `references/beat-layer.md` | arcs, pacing, shot vocab |
| `references/gotchas-grok.md` | mute audio, quotas, TTS |
| `references/voices.md` | voice_id + en / pt-BR |

## Credits

Pipeline architecture derived from **vox-director** by **Alisa0808**, originally powered by
**Atlas Cloud** (MIT). GrokVoxel reimplements generation on Grok Build native tools.
