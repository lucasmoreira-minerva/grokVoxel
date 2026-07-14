#!/usr/bin/env python3
"""
Text overlays via Pillow -> transparent PNG (many ffmpeg builds lack libass/drawtext,
so captions/watermark are rendered as images and composited with `overlay`).
"""
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

FONT_BOLD = [
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/Library/Fonts/Arial Bold.ttf",
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
]
FONT_REG = [
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/Library/Fonts/Arial.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
]


def _font(paths, size):
    for p in paths:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def _wrap(draw, text, fnt, max_w):
    words, lines, cur = text.split(), [], ""
    for w in words:
        trial = f"{cur} {w}".strip()
        if draw.textlength(trial, font=fnt) <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def accent_color(image_path, default=(214, 64, 42)):
    """Sample a vibrant color from a keyframe for the caption keyline."""
    try:
        im = (
            Image.open(image_path)
            .convert("RGB")
            .resize((80, 80))
            .quantize(colors=24)
            .convert("RGB")
        )
    except Exception:
        return default
    best, best_score = None, -1.0
    for count, (r, g, b) in im.getcolors(80 * 80) or []:
        mx, mn = max(r, g, b), min(r, g, b)
        if mx == 0:
            continue
        sat, val = (mx - mn) / mx, mx / 255.0
        if sat < 0.45 or val < 0.35 or val > 0.92:
            continue
        score = sat * val * (count ** 0.3)
        if score > best_score:
            best, best_score = (r, g, b), score
    return best or default


def render_caption(
    text,
    out_path,
    W=1920,
    H=1080,
    margin_v=None,
    accent=None,
    scale=0.72,
    weight="regular",
):
    """Caption letters + thin dark edge + soft shadow (no band).

    `scale` multiplies the base size (default 0.72 = smaller, less thick than v1).
    `weight`: "regular" (default, thinner stroke) or "bold" (heavier cut-out look).
    """
    base = min(W, H) * 0.032  # was ~0.045 — smaller default
    size = max(18, int(base * float(scale)))
    if margin_v is None:
        margin_v = int(H * 0.05)
    font_paths = FONT_BOLD if weight == "bold" else FONT_REG
    # Prefer regular for thin captions; fall back to bold paths if needed
    fnt = _font(font_paths if weight != "bold" else FONT_BOLD, size)
    if weight != "bold":
        fnt = _font(FONT_REG + FONT_BOLD, size)
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d0 = ImageDraw.Draw(img)
    lines = _wrap(d0, text, fnt, int(W * 0.82))
    lh = int(size * 1.28)
    y0 = H - margin_v - lh * len(lines)
    pos = [
        ((W - d0.textlength(ln, font=fnt)) / 2, y0 + i * lh, ln)
        for i, ln in enumerate(lines)
    ]
    # thinner outline than before (was ~0.13 of size)
    ow = max(1, round(size * 0.07))
    sh = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(sh)
    for x, y, t in pos:
        sd.text(
            (x + 2, y + 2),
            t,
            font=fnt,
            fill=(8, 6, 3, 140),
            stroke_width=ow,
            stroke_fill=(8, 6, 3, 140),
        )
    img = Image.alpha_composite(img, sh.filter(ImageFilter.GaussianBlur(3)))
    d = ImageDraw.Draw(img)
    if accent:
        a = tuple(accent[:3]) + (200,)
        kw = max(1, round(size * 0.05))
        for x, y, t in pos:
            d.text((x, y), t, font=fnt, fill=a, stroke_width=ow + kw, stroke_fill=a)
    for x, y, t in pos:
        d.text(
            (x, y),
            t,
            font=fnt,
            fill=(252, 248, 240, 245),
            stroke_width=ow,
            stroke_fill=(28, 22, 18, 220),
        )
    img.save(out_path)
    return out_path


def render_watermark(text, out_path, W=1920, H=1080):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    size = int(min(W, H) * 0.022)
    fnt = _font(FONT_REG, size)
    tw = d.textlength(text, font=fnt)
    x, y = W - tw - 30, H - size - 30
    ow = max(2, round(size * 0.14))
    d.text(
        (x, y),
        text,
        font=fnt,
        fill=(250, 244, 232, 225),
        stroke_width=ow,
        stroke_fill=(18, 12, 8, 205),
    )
    img.save(out_path)
    return out_path
