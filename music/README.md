# Music bank (royalty-free only)

GrokVoxel has **no** AI music model. Place instrumental beds here and list them in
`manifest.json`.

## Allowed sources (only these)

| Source | URL | Notes |
|---|---|---|
| **Pixabay Music** | https://pixabay.com/music/ | Free for commercial use; no attribution required by Pixabay (still nice to credit) |
| **YouTube Audio Library** | YouTube Studio → Audio Library | Follow each track’s attribution flag |
| **Incompetech** (Kevin MacLeod) | https://incompetech.com | **CC-BY** — set `"credit"` in the manifest |

**Do not** rip audio from arbitrary YouTube videos or commercial catalogs.

## Adding a track

1. Download from an allowed source.
2. Save as `music/<slug>.mp3` (or `.wav` / `.m4a`).
3. Append an entry to `manifest.json`:

```json
{
  "file": "calm-documentary.mp3",
  "title": "Calm Documentary",
  "source": "pixabay",
  "license": "Pixabay Content License",
  "moods": ["documentary", "warm", "calm"],
  "credit": null,
  "url": "https://pixabay.com/music/..."
}
```

For Incompetech, always set `credit`, e.g.
`"Music by Kevin MacLeod (incompetech.com) — CC BY 4.0"`.

## Picker

```bash
python3 scripts/pick_music.py out/<project>              # uses beats.json "music" string
python3 scripts/pick_music.py out/<project> documentary
python3 scripts/pick_music.py out/<project> --path music/my-track.mp3
```

Large audio files are gitignored by default; commit `manifest.json` + this README.
Share tracks via release assets or a download script if needed.
