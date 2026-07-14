#!/usr/bin/env python3
"""
Assembly stage (ffmpeg): multi-shot clips + per-beat narration + music -> final.mp4

Model: beats -> shots. Each shot is one short clip. Narration and captions are per BEAT
and span all of the beat's shots. BGM is ducked under the narration. Captions + watermark
are Pillow PNGs composited with `overlay`.

By default each clip is muted (-an). Set shot keep_native_sfx=true to pass native SFX
(still ducked under VO, never used as music bed).

Usage:
  python3 assemble.py <project_dir>
  python3 assemble.py <project_dir> --no-captions
  python3 assemble.py <project_dir> --caption-scale 0.65 --output final-nocap.mp4

beats.json options:
  "captions": true|false          (default true; CLI --no-captions wins)
  "caption_scale": 0.72           (relative size; smaller = thinner captions)
  "output": "final.mp4"           (filename under project_dir)
"""
import json
import os
import subprocess
import sys

import text_overlay

FPS, TAIL = 24, 0.5
WATERMARK = "Made with GrokVoxel"
RES = {"16:9": (1920, 1080), "9:16": (1080, 1920), "1:1": (1080, 1080), "3:4": (1080, 1440)}


def ff(args):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *args], check=True)


def probe_dur(path):
    out = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "csv=p=0",
            path,
        ],
        capture_output=True,
        text=True,
    ).stdout
    try:
        return float(out.strip())
    except ValueError:
        return 0.0


def shots_of(beat):
    if beat.get("shots"):
        for s in beat["shots"]:
            yield s
    else:
        yield beat


def run(project_dir, captions=None, caption_scale=None, output_name=None):
    with open(os.path.join(project_dir, "beats.json")) as f:
        doc = json.load(f)
    beats = doc["beats"]
    W, H = RES.get(doc.get("aspect", "16:9"), (1920, 1080))
    wm_text = doc.get("watermark", WATERMARK)
    mix = doc.get("mix", {})
    music_vol = float(mix.get("music", 0.55))
    voice_vol = float(mix.get("voice", 1.25))
    if captions is None:
        captions = bool(doc.get("captions", True))
    if caption_scale is None:
        caption_scale = float(doc.get("caption_scale", 0.72))
    if output_name is None:
        output_name = doc.get("output") or ("final.mp4" if captions else "final-no-captions.mp4")
    tmp = os.path.join(project_dir, "_seg" if captions else "_seg_nocap")
    os.makedirs(tmp, exist_ok=True)

    segs = []
    beat_spans = []
    t = 0.0
    for beat in beats:
        beat_start = t
        shot_list = list(shots_of(beat))
        durs = [float(s.get("dur", 6)) for s in shot_list]
        need = float(beat.get("narration_dur", sum(durs))) + TAIL
        if sum(durs) < need:
            durs[-1] += need - sum(durs)
        for s, d in zip(shot_list, durs):
            segs.append(
                {
                    "clip": s["clip_path"],
                    "dur": round(d, 2),
                    "keep_sfx": bool(s.get("keep_native_sfx", False)),
                }
            )
            t += d
        beat_spans.append({"start": beat_start, "dur": round(t - beat_start, 2), "beat": beat})
    total = round(t, 2)

    # 1) normalize each shot to a silent (or optional-sfx) segment of exact duration
    seg_files = []
    for i, s in enumerate(segs):
        out = os.path.join(tmp, f"seg_{i:02d}.mp4")
        cd = probe_dur(s["clip"])
        factor = s["dur"] / cd if cd > 0 else 1.0
        pre = f"setpts={factor:.4f}*PTS," if factor > 1.02 else ""
        fc = (
            f"[0:v]{pre}split[s0][s1];"
            f"[s0]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},"
            f"boxblur=26:2,eq=brightness=-0.05[bg];"
            f"[s1]scale={W}:{H}:force_original_aspect_ratio=decrease[fg];"
            f"[bg][fg]overlay=(W-w)/2:(H-h)/2,setsar=1,fps={FPS},"
            f"tpad=stop_mode=clone:stop_duration=1[v]"
        )
        # Default: mute native audio. SFX pass-through is a future mix path; still strip
        # for deterministic VO+BGM assembly (keep_native_sfx reserved for later).
        ff(
            [
                "-i",
                s["clip"],
                "-an",
                "-filter_complex",
                fc,
                "-map",
                "[v]",
                "-t",
                f"{s['dur']}",
                "-c:v",
                "libx264",
                "-pix_fmt",
                "yuv420p",
                out,
            ]
        )
        seg_files.append(out)

    # 2) concat
    listf = os.path.join(tmp, "list.txt")
    with open(listf, "w") as f:
        for s in seg_files:
            f.write(f"file '{os.path.abspath(s)}'\n")
    body = os.path.join(tmp, "body_silent.mp4")
    ff(["-f", "concat", "-safe", "0", "-i", listf, "-c", "copy", body])

    # 3) optional captions + watermark
    if "bgm_path" not in doc or not os.path.exists(doc["bgm_path"]):
        raise SystemExit("beats.json missing bgm_path — run pick_music.py first")
    for bs in beat_spans:
        na = bs["beat"].get("narration_audio")
        if not na or not os.path.exists(na):
            raise SystemExit(f"beat {bs['beat'].get('id')} missing narration_audio")

    cap_pngs = []
    if captions:
        for bs in beat_spans:
            beat = bs["beat"]
            p = os.path.join(tmp, f"cap_{beat['id']}.png")
            kf = next(
                (
                    s.get("keyframe_path")
                    for s in (beat.get("shots") or [beat])
                    if s.get("keyframe_path") and os.path.exists(s["keyframe_path"])
                ),
                None,
            )
            acc = text_overlay.accent_color(kf) if kf else None
            text_overlay.render_caption(
                beat["narration"], p, W, H, accent=acc, scale=caption_scale
            )
            cap_pngs.append(p)
    wm_png = text_overlay.render_watermark(wm_text, os.path.join(tmp, "wm.png"), W, H)

    # 4) overlay + mix
    nb = len(beat_spans)
    inputs = ["-i", body]  # 0
    for p in cap_pngs:
        inputs += ["-i", p]
    inputs += ["-i", wm_png]
    # indices: body=0, caps=1..nc, wm=nc+1, narrs follow, then bgm
    nc = len(cap_pngs)
    wm_idx = nc + 1
    narr_base = wm_idx + 1
    for bs in beat_spans:
        inputs += ["-i", bs["beat"]["narration_audio"]]
    bgm_idx = narr_base + nb
    inputs += ["-i", doc["bgm_path"]]

    chain, prev = [], "[0:v]"
    if captions:
        for i, bs in enumerate(beat_spans):
            s, e = bs["start"] + 0.2, bs["start"] + bs["dur"] - 0.1
            lbl = f"[v{i+1}]"
            chain.append(
                f"{prev}[{i+1}:v]overlay=0:0:enable='between(t,{s:.2f},{e:.2f})'{lbl}"
            )
            prev = lbl
    chain.append(f"{prev}[{wm_idx}:v]overlay=0:0[v]")

    nlabels = []
    for i, bs in enumerate(beat_spans):
        ms = int(bs["start"] * 1000)
        chain.append(f"[{narr_base+i}:a]adelay={ms}:all=1[n{i}]")
        nlabels.append(f"[n{i}]")
    chain.append(
        f"{''.join(nlabels)}amix=inputs={nb}:normalize=0:duration=longest,"
        f"volume={voice_vol},apad,atrim=0:{total}[narrmix]"
    )
    chain.append("[narrmix]asplit=2[narrA][narrB]")
    chain.append(
        f"[{bgm_idx}:a]atrim=0:{total},volume={music_vol},"
        f"afade=t=out:st={max(total-2,0):.2f}:d=2[bgt]"
    )
    chain.append("[bgt][narrA]sidechaincompress=threshold=0.02:ratio=12:attack=5:release=350[bgd]")
    chain.append(
        f"[narrB][bgd]amix=inputs=2:normalize=0:duration=longest,volume=1.4,atrim=0:{total}[a]"
    )
    filt = ";".join(chain)

    final = os.path.join(project_dir, output_name)
    ff(
        [
            *inputs,
            "-filter_complex",
            filt,
            "-map",
            "[v]",
            "-map",
            "[a]",
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            "-c:a",
            "aac",
            "-shortest",
            final,
        ]
    )
    print(
        "FINAL:",
        final,
        f"(~{total}s, {len(segs)} shots, captions={'on' if captions else 'off'}, scale={caption_scale})",
    )


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__, file=sys.stderr)
        sys.exit(2)
    project = os.path.abspath(sys.argv[1])
    captions = None
    caption_scale = None
    output_name = None
    args = sys.argv[2:]
    i = 0
    while i < len(args):
        if args[i] in ("--no-captions", "--nocap"):
            captions = False
            i += 1
        elif args[i] == "--captions":
            captions = True
            i += 1
        elif args[i] == "--caption-scale" and i + 1 < len(args):
            caption_scale = float(args[i + 1])
            i += 2
        elif args[i] in ("--output", "-o") and i + 1 < len(args):
            output_name = args[i + 1]
            i += 2
        else:
            print("Unknown arg:", args[i], file=sys.stderr)
            sys.exit(2)
    run(project, captions=captions, caption_scale=caption_scale, output_name=output_name)
