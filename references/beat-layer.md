# Beat / Shot Layer Library — narrative arc + per-shot spec

Counterpart to `prompt-guide-grokvoxel.md` (LOOK). This is the **STORY** layer: narrative
skeleton + per-shot camera and element motion.

Ported and adapted from the vox-director beat library (MIT, Alisa0808 / Atlas Cloud).

Three tiers:
- **Narrative arc** → recommend from topic, user can override.
- **Per-beat scene + headline + narration** → AI drafts, **GATE 1: user approves**.
- **Shot size + camera move** → constrained vocab; vary adjacent beats.

---

## 1. Narrative arcs

| Arc | When | Shape |
|---|---|---|
| `hook_payoff` | default single idea | Hook → Context → Build → Payoff → Button |
| `pas` | pain ads | Problem → Agitate → Solve → Proof → CTA |
| `bab` | after sells better | Before → After → Bridge → CTA |
| `aida` | cold paid ads | Attention → Interest → Desire → Action |
| `storybrand` | brand/service | Hero wants → Problem → Guide → Plan → CTA |
| `how_it_works` | product/process | Hook → What → steps → Benefit → CTA |
| `timeline` | history / evolution | Start → events → turning point → present → takeaway |
| `man_in_hole` | transformation | OK → fall → deepen → climb → better |
| `story_spine` | mission/founder | Once… → Every day… → Until… → Because… → Finally… |
| `origin` | why we exist | World → spark → leap → struggle → breakthrough → today |
| `myth_buster` | correct belief | Fact → myth → expose → truth → CTA |
| `listicle` | N ways | Promise → items → #1 → recap |
| `three_act` | 60s narrative | Setup → Confrontation → Resolution |
| `story_circle` | character UGC | You → Need → Go → Search → Find → Take → Return → Change |

**Heuristic:** ad → `pas`/`bab`/`aida`; system → `how_it_works`/`hook_payoff`; history →
`timeline`; comeback → `man_in_hole`; brand → `story_spine`/`origin`.

---

## 2. Hook · pacing · counts

- **Hook in ≤3s** — beat 1 headline carries the promise (bold claim, question, surprising
  stat). Never pure setup.
- **Hook patterns:** `mistake_callout · pain_point · surprising_stat · direct_question ·
  urgent_warning · secret_reveal · experiment_story · pattern_interrupt · outcome_tease`

| Duration | Beats | Beat length | VO words (en) |
|---|---|---|---|
| **15s** | 3–4 | ~4s | ~35–45 |
| **30s** | 6–8 | ~4–5s | ~70–80 |
| **60s** | 10–12 | ~5–6s | ~130–150 |

- Prefer **2 shots per beat** (wide+title, detail no-title) so cuts land every ~4–6s.
- Never hold a static poster > ~7–8s of wall-clock time.
- Endings: `hard_cut` (default) · `quick_cta` · `loop_close`.

**pt-BR note:** Brazilian Portuguese VO is often ~10–15% longer than English for the same
idea — budget slightly fewer words per beat or slightly longer shot durs.

---

## 3. Shot patterns

### Shot size
`EST_WIDE` · `WIDE` · `MEDIUM` · `CLOSE` · `DETAIL`

Best 2-shot beat: establishing wide (headline) → detail cut-in (no headline).

### Camera move (flat-safe default)
| Token | Use |
|---|---|
| `static` | payoff / quote lands |
| `push_in` | tension / focus |
| `pull_out` | reveal big picture |
| `pan` | list / timeline |
| `tilt` | vertical reveal |
| `parallax` | living paper layers |
| `element` | one cutout enters |

**Bold (loose + re-roll only):** orbit, dolly_zoom, roll, whip.

**Anti-monotony:** no two adjacent beats share the same camera move; reserve `static` for
payoff.

### Element motion (energy engine)
Write **scene-specific** rich motion: multiple stickers move; occasional hero flyer (not
every shot). Keep rigid paper — no organic morph. Text stays stable.

---

## 4. Vocab tokens

```
ARCS:  hook_payoff pas bab aida storybrand how_it_works timeline man_in_hole
       story_spine origin myth_buster listicle three_act story_circle
HOOKS: mistake_callout pain_point surprising_stat direct_question urgent_warning
       secret_reveal experiment_story pattern_interrupt outcome_tease
SIZES: EST_WIDE WIDE MEDIUM CLOSE DETAIL
MOVES: static push_in pull_out pan tilt parallax element
ENDINGS: hard_cut quick_cta loop_close
BEATS: 15s→3–4 · 30s→6–8 · 60s→10–12 · hook ≤3s · cut every 3–5s
```
