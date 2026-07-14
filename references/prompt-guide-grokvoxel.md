# Prompt Guide — GrokVoxel LOOK layer

The visual language of GrokVoxel is defined by reference creators (@MrLarus encyclopedia
scrapbook explainers; @OriSilver archival / papercraft product explainers), not by 3D voxel
art and not by a single inherited house theme.

**Product name vs look:** "Voxel" is the brand. The look is editorial **paper-collage /
encyclopedia scrapbook / archival papercraft** motion graphics.

Two prompts decide quality: the **image (keyframe) prompt** (makes the look) and the
**motion prompt** (makes stop-motion collage energy). Get the keyframe right — nothing
downstream saves a weak poster.

> **Grok Imagine note:** the native image engine leans photoreal. Prefer **image-to-image**
> (`image_edit`) conditioned on stills in `references/stills/` over prompt-only
> `image_gen`. Always include the style block below.

- [1. Style floor (always on)](#1-style-floor)
- [2. Image prompt structure](#2-image-prompt)
- [3. Motion prompt structure](#3-motion-prompt)
- [4. Theme / bake-off presets](#4-presets)
- [5. Reference stills for i2i](#5-stills)
- [6. Avoid list](#6-avoid)

---

## 1. Style floor

These constraints apply to every keyframe and motion prompt:

| Axis | Spec |
|---|---|
| **Palette** | Limited, high-contrast. Kraft / aged paper cream, charcoal black, deep crimson / vermilion accent, copper-gold, muted map greens/blues. No rainbow gradients. |
| **Materials** | Hand-cut paper stickers with **white cutout borders**, torn / deckled edges, washi or masking tape, wax seals / red chops, manila luggage tags, pins, newspaper / halftone scraps, newsprint or rice-paper grain. |
| **Figures / props** | Printed or illustrated **cutouts**, not CGI, not photoreal people. Clear edges, each with its own soft paper drop shadow. |
| **Lighting** | Flat scanned-document / flat-lay light. Soft paper shadows only. No volumetric cinematic light. |
| **Camera** | Straight-on, poster-parallel. Safe: static, slow push-in, pull-out, pan, tilt, multi-layer parallax. |
| **Pacing** | One clear visual **event** per shot (~4–6s): stamp hits, arrow extends, map region fills, network lights up, label snaps in. |
| **Typography** | Short bold headline (2–5 words) on a paper banner / cartouche / kraft tag. Optional bilingual. Captions are burned in **post** (assemble), not by the video model. |
| **Framing** | Dense encyclopedia page or corkboard / map board with many separable layers — or archival editorial with fewer heroes on a map/kraft field. |

### Motion vocabulary (prefer)

paper jitter · sticker bounce · stepped stop-motion · rigid cutout slides · seal stamp-down ·
route line extend · map node light-up · coin rotate · label snap-in · layer parallax ·
tape flutter

### Motion to avoid

whole-frame random shake · photoreal morph · inventing new objects · redrawing text ·
PPT block wipes · orbit/dolly-zoom (unless `constraints: loose` + re-roll)

---

## 2. Image prompt

Structure every keyframe in five parts. Reuse the style block **verbatim** across a film so
beats feel like one series.

```
[1 STYLE BLOCK — identical every beat]
  Mixed-media hand-cut PAPER COLLAGE, editorial encyclopedia scrapbook style.
  White cutout borders, torn and scissor-cut edges, tape corners, paper drop shadows,
  halftone dots, newspaper scraps, manila tags, wax seals. Figures and objects are
  PRINTED or ILLUSTRATED paper cutouts — flat 2D, not photoreal, not 3D CGI, keep
  print grain and paper imperfections. High contrast, tactile, hand-assembled.

[2 SCENE — separate cut-out pieces]
  SCENE as layered paper cutouts: {hero}, {map or diagram}, {2–4 props}, {labels},
  {decorative scraps}. Each element has a clear edge and its own drop shadow so it
  can animate later as an independent sticker.

[3 BACKGROUND]
  on a {bold flat paper color OR aged kraft OR vintage map board} background.

[4 HEADLINE — baked in, short]
  A paper banner / cartouche with bold headline "{TITLE}" and optional small subtitle.
  Keep lettering crisp and large.

[5 TECH]
  aspect ratio {16:9|9:16}, poster composition for a short explainer video keyframe.
```

### Techniques
- **i2i first:** call `image_edit` with 1–2 stills from `references/stills/` plus the
  scene prompt. Prompt should say: keep the *style, paper materials, and cutout treatment*
  of the reference; change the *subject and layout* to the new scene.
- **Describe distinct pieces** with edges + shadows (unlocks layered motion).
- **Bake short headlines** into the image; protect them in the motion step.
- **One bold background family per beat** (color can travel; paper language stays fixed).
- Re-roll weak keyframes before paying for motion.

### Worked example (neutral test beat)

> Mixed-media hand-cut PAPER COLLAGE, editorial encyclopedia scrapbook style. White cutout
> borders, torn edges, tape, paper drop shadows, halftone dots, manila tags, wax seals.
> PRINTED paper cutouts, flat 2D, not photoreal, not 3D CGI. SCENE as layered paper cutouts:
> two traders exchanging a goat cutout and grain sacks, clay tokens and shells, a torn map
> scrap, a kraft tag labeled "BEFORE MONEY", zigzag paper scraps. Bold flat warm clay-tan
> paper background. Paper banner headline "BEFORE MONEY". Aspect ratio 9:16, explainer
> keyframe.

---

## 3. Motion prompt

Turn "pan a poster" into "a living collage page". One camera move + rich element motion.

```
[GOAL] Animate this still as flat 2D paper-collage stop-motion. Keep paper materials.
[CAMERA] one continuous move: {static | slow push-in | pull-out | pan | tilt | parallax}.
[ELEMENT MOTION] {scene-specific: stickers bounce, seal stamps, arrows extend, …}
[AESTHETIC] preserve white borders, torn edges, tape, halftone, kraft textures.
[FEEL] {tone of beat}: editorial, punchy scrapbook energy.
[CONSTRAINTS] layout and all on-screen text stay sharp and stable; no photoreal morph;
  no new objects; single continuous shot; flat 2D paper layers only.
```

Duration: native tool supports **6s or 10s** — prefer **6s** shots; assembly may time-stretch
slightly to match narration.

---

## 4. Theme / bake-off presets

Presets are recipes on top of the style floor. The **default house look** (bake-off winner,
2026-07) is **`swiss-editorial`**. Set `"collage_style"` in `beats.json` to override per film.

### Bake-off winner

| Role | Preset | Why |
|---|---|---|
| **Default** | `swiss-editorial` | Clean 2-color + red, modular grid, strong negative space — best for tech parks, product/SaaS, GovTech, and high-conversion social explainers. Reads modern, not muddy. |
| Strong alt (history / dense education) | `dense-encyclopedia` | MrLarus pole — max sticker density when the topic is systems/history. |
| Strong alt (place / finance / story) | `archival-map` | OriSilver V3 — map + kraft tags when place-identity or “how it started” leads. |
| Strong alt (pure ads / steps) | `product-explainer` | Labels + arrows when the film is a how-it-works product ad. |

| Preset | Pole | Palette | Layout | Motion default | Fits |
|---|---|---|---|---|---|
| `swiss-editorial` ⭐ default | design | cream + federal blue + single red accent | modular grid, strong negative space | calm parallax | **tech, parks, product, SaaS, GovTech** |
| `dense-encyclopedia` | MrLarus | black/kraft + crimson + gold + map colors | max density: hero + map + many props/labels | punchy stop-motion | history, systems, education |
| `archival-map` | OriSilver V3 | vintage map + kraft tags + red stroke accent | fewer heroes, pinboard hierarchy | calm → punchy events | finance, crypto, place stories, docs |
| `minimal-papercraft` | OriSilver V1 | monochrome paper studio | sparse diorama, soft paper folds | gentle paper settle | brand mood, poetic hooks |
| `warm-kraft` | craft | cream kraft + tape + brown ink | tags, envelopes, sticky notes | sticker bounce | lifestyle, food, culture |
| `high-contrast-ink` | print | black / cream / vermilion only | bold silhouettes + seals | punchy stamp events | politics, manifesto, sports |
| `product-explainer` | ads | brand accent + kraft/white | product cutout + labels + arrows | step-by-step element | apps, gadgets, how-it-works |
| `chronicle-sepia` | history | aged sepia + vermilion seal | timeline scraps + portraits | slow push + map events | biographies, eras, museums |

**Bake-off procedure (new topics without a set style):** same fixed test scene, one keyframe
per candidate preset (prefer i2i from stills), contact sheet, human picks → write winner as
`collage_style`. If the user does not care, use **`swiss-editorial`**.

---

## 5. Reference stills for i2i

| File | Use as style ref for |
|---|---|
| `stills/mrlarus-qin-portrait.jpg` | dense encyclopedia, hero + map + seals |
| `stills/mrlarus-feudal-lords.jpg` | multi-figure banner collage |
| `stills/mrlarus-one-rule.jpg` | map-centric arrows + conquest energy |
| `stills/mrlarus-one-script.jpg` | desk / process / before-after labels |
| `stills/mrlarus-one-road.jpg` | network diagram + transport props |
| `stills/orisilver-v1-vs-v3-*.jpg` | archival map + kraft tags (prefer V3 side) |

Stills are **style conditioning references** for the skill. Do not re-upload full creator
videos into the public repo.

---

## 6. Avoid list

- Photoreal photography, cinematic 3D, Unreal/Octane look
- Clean corporate gradient posters / empty backgrounds
- Single huge hero with no secondary stickers (unless `minimal-papercraft`)
- Long paragraphs of baked text (use 2–5 word headlines; captions in post)
- Using native clip audio as music bed (mute with `-an` unless `keep_native_sfx`)
- Protected music sources outside Pixabay / YouTube Audio Library / Incompetech
