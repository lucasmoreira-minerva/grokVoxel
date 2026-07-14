#!/usr/bin/env python3
"""
Pick a royalty-free track from music/ and write bgm_path into beats.json.

Allowed sources only (enforced by manifest provenance, not by download):
  - Pixabay Music
  - YouTube Audio Library
  - Incompetech (CC-BY — credit required)

Usage:
  python3 pick_music.py <project_dir> [mood_keyword]
  python3 pick_music.py <project_dir> --path music/some.mp3
"""
import json
import os
import random
import shutil
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
MUSIC_DIR = os.path.join(ROOT, "music")
MANIFEST = os.path.join(MUSIC_DIR, "manifest.json")
ALLOWED = {"pixabay", "youtube_audio_library", "incompetech"}


def load_manifest():
    if not os.path.exists(MANIFEST):
        return {"tracks": []}
    with open(MANIFEST) as f:
        return json.load(f)


def list_audio_files():
    exts = {".mp3", ".wav", ".m4a", ".ogg"}
    if not os.path.isdir(MUSIC_DIR):
        return []
    return [
        os.path.join(MUSIC_DIR, n)
        for n in sorted(os.listdir(MUSIC_DIR))
        if os.path.splitext(n)[1].lower() in exts
    ]


def pick(mood: str | None, explicit: str | None) -> tuple[str, dict | None]:
    if explicit:
        path = explicit if os.path.isabs(explicit) else os.path.join(ROOT, explicit)
        if not os.path.exists(path):
            raise SystemExit(f"music file not found: {path}")
        return path, None

    man = load_manifest()
    tracks = man.get("tracks") or []
    # Prefer manifest entries with files present
    candidates = []
    for t in tracks:
        src = (t.get("source") or "").lower()
        if src and src not in ALLOWED:
            print(f"WARNING: skipping track with non-allowed source: {t}", file=sys.stderr)
            continue
        rel = t.get("file")
        if not rel:
            continue
        path = rel if os.path.isabs(rel) else os.path.join(MUSIC_DIR, rel)
        if not os.path.exists(path):
            continue
        tags = " ".join(t.get("moods") or t.get("tags") or []).lower()
        score = 0
        if mood:
            m = mood.lower()
            if m in tags or m in (t.get("title") or "").lower():
                score = 2
            elif any(w in tags for w in m.split()):
                score = 1
        candidates.append((score, path, t))

    if candidates:
        candidates.sort(key=lambda x: (-x[0], x[1]))
        top = [c for c in candidates if c[0] == candidates[0][0]]
        _, path, meta = random.choice(top)
        return path, meta

    files = list_audio_files()
    if not files:
        raise SystemExit(
            "No music files found. Add royalty-free tracks to music/ and list them "
            "in music/manifest.json (sources: pixabay | youtube_audio_library | incompetech)."
        )
    return random.choice(files), None


def run(project_dir: str, mood: str | None = None, explicit: str | None = None):
    path, meta = pick(mood, explicit)
    audio_dir = os.path.join(project_dir, "audio")
    os.makedirs(audio_dir, exist_ok=True)
    dest = os.path.join(audio_dir, "bgm" + os.path.splitext(path)[1])
    shutil.copy2(path, dest)

    beats_path = os.path.join(project_dir, "beats.json")
    with open(beats_path) as f:
        doc = json.load(f)
    doc["bgm_path"] = dest
    if meta:
        doc["bgm_meta"] = {
            "title": meta.get("title"),
            "source": meta.get("source"),
            "credit": meta.get("credit"),
            "license": meta.get("license"),
            "file": meta.get("file"),
        }
    with open(beats_path, "w") as f:
        json.dump(doc, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print("BGM:", dest)
    if meta and meta.get("credit"):
        print("CREDIT:", meta["credit"])


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(2)
    project = os.path.abspath(sys.argv[1])
    mood, explicit = None, None
    args = sys.argv[2:]
    i = 0
    while i < len(args):
        if args[i] == "--path" and i + 1 < len(args):
            explicit = args[i + 1]
            i += 2
        else:
            mood = args[i]
            i += 1
    # fall back to beats.json music string as mood
    if mood is None and explicit is None:
        try:
            with open(os.path.join(project, "beats.json")) as f:
                doc = json.load(f)
            mood = doc.get("music") if isinstance(doc.get("music"), str) else None
        except Exception:
            pass
    run(project, mood=mood, explicit=explicit)
