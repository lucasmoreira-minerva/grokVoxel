# GrokVoxel gotchas — native tools, audio, quotas

## Generation backends

| Job | Tool / path | Notes |
|---|---|---|
| Keyframe | `image_edit` (preferred) or `image_gen` | i2i from `references/stills/` fights photoreal drift |
| Motion | `image_to_video` | Duration **6 or 10 only**; prefer 6s; aspect comes from the source image |
| Multi-ref video | `reference_to_video` | Rarely needed; prefer compose still with `image_edit` then i2v |
| Narration | `scripts/tts_grok.py` → `POST https://api.x.ai/v1/tts` | **No native TTS tool** in the CLI |
| Music | local `music/` only | No xAI music model |

Do **not** call Atlas Cloud, Seedance, Omni Flash, Kling, or other external image/video APIs
from this skill.

## Mute native clip audio (default)

Grok Imagine video often includes ambient/SFX audio. Narration and music are added in
assembly. Default path strips clip audio:

```bash
ffmpeg -i clip.mp4 -an -c:v copy silent.mp4
```

`assemble.py` normalizes segments with `-an` unless a shot sets `"keep_native_sfx": true`.
When true, mix native audio low under VO — never as the music bed.

## Photoreal drift

If a keyframe looks like a photo or 3D render:
1. Re-run with `image_edit` + a denser still (e.g. `mrlarus-qin-portrait.jpg`).
2. Strengthen style block: white borders, flat 2D, printed cutouts, not photoreal.
3. Do not animate a weak keyframe.

## Text

- Bake **short** headlines (2–5 words) into keyframes.
- Burn full narration captions in `assemble.py` (Pillow PNG + overlay).
- Motion prompt: "all on-screen text stays sharp and perfectly stable".

## TTS

```bash
export XAI_API_KEY="xai-..."
python3 scripts/tts_grok.py out/<project>
```

- Language: `en` (default) or `pt-BR` (map to API `language` as documented in voices.md).
- One consistent `voice_id` for the whole film.
- Speech tags supported by Grok TTS when you need pauses/emphasis — keep narration natural.

## Assembly

- Requires `ffmpeg`, `ffprobe`, Pillow.
- Captions use Pillow because many ffmpeg builds lack libass/drawtext.
- Duck BGM under VO with `sidechaincompress` (see `assemble.py`).
- If a clip is shorter than its segment duration, assemble time-stretches (`setpts`) instead
  of freezing the last frame.

## Quotas and cost

- Motion is the expensive step. Bake-off = stills first; animate only the winning look (or top 2).
- SuperGrok / Imagine limits are rolling windows — batch large runs carefully.
- Rough pilot budget: a clean ~30s film may be on the order of a few dollars of generation
  equivalent; measure on your first successful render and note it in the project README.

## Music license

Only these sources may enter `music/` or a public commit:

1. [Pixabay Music](https://pixabay.com/music/)
2. [YouTube Audio Library](https://studio.youtube.com) (Audio Library tab)
3. [Incompetech](https://incompetech.com) (CC-BY — keep credit in `music/manifest.json`)

Never rip BGM from arbitrary YouTube videos or commercial tracks.
