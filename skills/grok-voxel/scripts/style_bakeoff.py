#!/usr/bin/env python3
"""
Style bake-off helpers (deterministic).

The agent generates keyframes with native image tools; this script only:
  - creates out/<project>/bakeoff/<preset>/ folders
  - writes a manifest of expected variants
  - builds a contact-sheet grid from finished stills (Pillow)

Usage:
  python3 style_bakeoff.py init <project_dir> [preset1,preset2,...]
  python3 style_bakeoff.py contact <project_dir>
"""
import json
import os
import sys

from PIL import Image

DEFAULT_PRESETS = [
    "dense-encyclopedia",
    "archival-map",
    "minimal-papercraft",
    "swiss-editorial",
    "warm-kraft",
    "high-contrast-ink",
    "product-explainer",
    "chronicle-sepia",
]


def bakeoff_dir(project_dir: str) -> str:
    return os.path.join(project_dir, "bakeoff")


def init(project_dir: str, presets: list[str]):
    root = bakeoff_dir(project_dir)
    os.makedirs(root, exist_ok=True)
    manifest = {
        "presets": presets,
        "instruction": (
            "For each preset, generate one keyframe (prefer image_edit + references/stills) "
            "using the same test scene. Save as bakeoff/<preset>/keyframe.jpg. "
            "Then run: python3 scripts/style_bakeoff.py contact <project_dir>"
        ),
        "files": {},
    }
    for p in presets:
        d = os.path.join(root, p)
        os.makedirs(d, exist_ok=True)
        manifest["files"][p] = os.path.join(d, "keyframe.jpg")
    path = os.path.join(root, "manifest.json")
    with open(path, "w") as f:
        json.dump(manifest, f, indent=2)
        f.write("\n")
    print("Bake-off init:", path)
    for p in presets:
        print(" -", p, "→", manifest["files"][p])


def contact(project_dir: str, cols: int = 4, cell: int = 480):
    root = bakeoff_dir(project_dir)
    man_path = os.path.join(root, "manifest.json")
    if not os.path.exists(man_path):
        raise SystemExit("missing bakeoff/manifest.json — run init first")
    with open(man_path) as f:
        man = json.load(f)

    items = []
    for preset, rel in man.get("files", {}).items():
        path = rel if os.path.isabs(rel) else os.path.join(project_dir, rel) if not rel.startswith(project_dir) else rel
        # also try bakeoff/<preset>/keyframe.jpg
        candidates = [
            path,
            os.path.join(root, preset, "keyframe.jpg"),
            os.path.join(root, preset, "keyframe.png"),
        ]
        found = next((c for c in candidates if os.path.exists(c)), None)
        if found:
            items.append((preset, found))
        else:
            print("missing still for", preset, file=sys.stderr)

    if not items:
        raise SystemExit("no bakeoff keyframes found")

    rows = (len(items) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * cell, rows * cell), (24, 20, 18))
    for i, (preset, path) in enumerate(items):
        im = Image.open(path).convert("RGB")
        im.thumbnail((cell - 8, cell - 32))
        x = (i % cols) * cell + (cell - im.width) // 2
        y = (i // cols) * cell + 8
        sheet.paste(im, (x, y))
    out = os.path.join(root, "contact-sheet.jpg")
    sheet.save(out, quality=92)
    print("CONTACT:", out)
    print("Presets present:", ", ".join(p for p, _ in items))


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(2)
    cmd = sys.argv[1]
    project = os.path.abspath(sys.argv[2])
    if cmd == "init":
        presets = DEFAULT_PRESETS
        if len(sys.argv) > 3 and sys.argv[3].strip():
            presets = [p.strip() for p in sys.argv[3].split(",") if p.strip()]
        init(project, presets)
    elif cmd == "contact":
        contact(project)
    else:
        print("Unknown command:", cmd, file=sys.stderr)
        sys.exit(2)


if __name__ == "__main__":
    main()
