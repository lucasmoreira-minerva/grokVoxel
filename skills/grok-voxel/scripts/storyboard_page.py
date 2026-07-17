#!/usr/bin/env python3
"""
One-page storyboard export: keyframes + titles + scene/narration descriptions.

Outputs:
  out/<project>/storyboard.png   (always)
  out/<project>/storyboard.pdf   (if reportlab available; else PNG only)

Usage:
  python3 storyboard_page.py <project_dir>
  python3 storyboard_page.py <project_dir> --cols 4 --title "My Film"
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

FONT_BOLD = [
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/Library/Fonts/Arial Bold.ttf",
    "/System/Library/Fonts/Supplemental/Arial.ttf",
]
FONT_REG = [
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/Library/Fonts/Arial.ttf",
]


def font(paths, size):
    for p in paths:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def wrap(draw, text, fnt, max_w, max_lines=4):
    words = (text or "").split()
    lines, cur = [], ""
    for w in words:
        trial = f"{cur} {w}".strip()
        if draw.textlength(trial, font=fnt) <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
            if len(lines) >= max_lines:
                break
    if cur and len(lines) < max_lines:
        lines.append(cur)
    if len(lines) == max_lines and words:
        # ellipsis if truncated
        if lines[-1] and not lines[-1].endswith("…"):
            lines[-1] = lines[-1][: max(0, len(lines[-1]) - 1)] + "…"
    return lines


def shots_of(beat):
    if beat.get("shots"):
        return beat["shots"]
    return [beat]


def collect_panels(doc, project_dir):
    panels = []
    for beat in doc.get("beats") or []:
        shot = shots_of(beat)[0]
        kf = shot.get("keyframe_path") or ""
        if kf and not os.path.isabs(kf):
            kf = os.path.join(project_dir, kf)
        title = (
            beat.get("title_pt")
            or beat.get("title_en")
            or beat.get("title")
            or f"Beat {beat.get('id')}"
        )
        panels.append(
            {
                "id": beat.get("id"),
                "title": title,
                "narration": beat.get("narration") or "",
                "scene": shot.get("scene") or beat.get("scene") or "",
                "motion": shot.get("element_motion") or shot.get("motion") or "",
                "keyframe": kf if kf and os.path.exists(kf) else None,
                "dur": sum(float(s.get("dur", 6)) for s in shots_of(beat)),
            }
        )
    return panels


def render(project_dir: str, cols: int = 4, title: str | None = None):
    project_dir = os.path.abspath(project_dir)
    with open(os.path.join(project_dir, "beats.json")) as f:
        doc = json.load(f)
    panels = collect_panels(doc, project_dir)
    if not panels:
        raise SystemExit("no beats to storyboard")

    title = title or f"Storyboard — {doc.get('project') or Path(project_dir).name}"
    topic = doc.get("topic") or ""
    n = len(panels)
    cols = max(2, min(cols, n))
    rows = (n + cols - 1) // cols

    # Page geometry (landscape one-pager, print-friendly)
    page_w, page_h = 3508, 2480  # ~A4 landscape @ 300dpi-ish
    margin = 80
    header_h = 160
    footer_h = 70
    gap = 28
    cell_w = (page_w - 2 * margin - gap * (cols - 1)) // cols
    cell_h = (page_h - margin - header_h - footer_h - gap * (rows - 1)) // rows
    thumb_h = int(cell_h * 0.52)
    text_h = cell_h - thumb_h - 12

    page = Image.new("RGB", (page_w, page_h), (248, 246, 242))
    draw = ImageDraw.Draw(page)
    f_title = font(FONT_BOLD, 54)
    f_sub = font(FONT_REG, 28)
    f_card_title = font(FONT_BOLD, 22)
    f_body = font(FONT_REG, 18)
    f_meta = font(FONT_REG, 16)

    draw.text((margin, 50), title, fill=(22, 28, 36), font=f_title)
    if topic:
        draw.text((margin, 115), topic[:140], fill=(80, 90, 100), font=f_sub)

    # optional brand mark
    brand_mark = Path(__file__).resolve().parent.parent / "references" / "brand" / "garca-valley-mark.png"
    if brand_mark.exists():
        try:
            m = Image.open(brand_mark).convert("RGBA")
            m.thumbnail((90, 90))
            page.paste(m, (page_w - margin - m.width, 45), m)
        except Exception:
            pass

    for i, p in enumerate(panels):
        r, c = divmod(i, cols)
        x = margin + c * (cell_w + gap)
        y = header_h + r * (cell_h + gap)
        # card bg
        draw.rounded_rectangle(
            [x, y, x + cell_w, y + cell_h], radius=16, fill=(255, 255, 255), outline=(220, 216, 210)
        )
        # thumbnail
        th_box = (x + 12, y + 12, x + cell_w - 12, y + 12 + thumb_h)
        if p["keyframe"]:
            try:
                im = Image.open(p["keyframe"]).convert("RGB")
                im.thumbnail((cell_w - 24, thumb_h))
                px = x + 12 + (cell_w - 24 - im.width) // 2
                py = y + 12 + (thumb_h - im.height) // 2
                page.paste(im, (px, py))
            except Exception:
                draw.rectangle(th_box, fill=(230, 228, 224))
        else:
            draw.rectangle(th_box, fill=(230, 228, 224))
            draw.text((x + 24, y + thumb_h // 2), "(no keyframe)", fill=(140, 140, 140), font=f_meta)

        ty = y + 12 + thumb_h + 10
        label = f"{p['id']}. {p['title']}"
        draw.text((x + 14, ty), label[:48], fill=(20, 40, 60), font=f_card_title)
        ty += 30
        meta = f"~{p['dur']:.0f}s"
        draw.text((x + 14, ty), meta, fill=(120, 130, 140), font=f_meta)
        ty += 24
        body = p["narration"] or p["scene"]
        for line in wrap(draw, body, f_body, cell_w - 28, max_lines=5):
            draw.text((x + 14, ty), line, fill=(50, 55, 60), font=f_body)
            ty += 22

    foot = (
        f"{doc.get('collage_style') or ''} · {doc.get('aspect') or ''} · "
        f"{doc.get('language') or ''} · {n} beats · GrokVoxel storyboard"
    )
    draw.text((margin, page_h - 50), foot.strip(" ·"), fill=(130, 130, 130), font=f_meta)

    png_path = os.path.join(project_dir, "storyboard.png")
    page.save(png_path, quality=95)
    print("STORYBOARD PNG:", png_path)

    # PDF via img2pdf or reportlab; fallback pillow save as multipage-ish single image pdf
    pdf_path = os.path.join(project_dir, "storyboard.pdf")
    try:
        # pure pillow RGB -> PDF
        page_rgb = page.convert("RGB")
        page_rgb.save(pdf_path, "PDF", resolution=150.0)
        print("STORYBOARD PDF:", pdf_path)
    except Exception as e:
        print("PDF skip:", e, file=sys.stderr)

    return png_path


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(2)
    project = sys.argv[1]
    cols = 4
    title = None
    args = sys.argv[2:]
    i = 0
    while i < len(args):
        if args[i] == "--cols" and i + 1 < len(args):
            cols = int(args[i + 1])
            i += 2
        elif args[i] == "--title" and i + 1 < len(args):
            title = args[i + 1]
            i += 2
        else:
            i += 1
    render(project, cols=cols, title=title)
