#!/usr/bin/env python3
"""
Narration via Grok TTS HTTP API (only allowed external media call in GrokVoxel).

Usage:
  export XAI_API_KEY=...
  python3 tts_grok.py <project_dir>

Writes out/<project>/audio/narr_<id>.mp3 and updates beats.json narration_audio / narration_dur.
"""
import json
import os
import subprocess
import sys
import urllib.error
import urllib.request

API_URL = "https://api.x.ai/v1/tts"


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


def map_language(lang: str) -> str:
    """Normalize skill language codes to API language codes."""
    if not lang:
        return "en"
    lang = lang.strip()
    # Keep pt-BR / pt_BR forms; API accepts language tags — pass through common forms.
    aliases = {
        "pt": "pt",
        "pt-br": "pt",
        "pt_br": "pt",
        "pt-BR": "pt",
        "en": "en",
        "en-US": "en",
        "en-us": "en",
    }
    return aliases.get(lang, lang)


def synthesize(text: str, voice_id: str, language: str, out_path: str, api_key: str):
    body = json.dumps(
        {
            "text": text,
            "voice_id": voice_id,
            "language": map_language(language),
        }
    ).encode("utf-8")
    req = urllib.request.Request(
        API_URL,
        data=body,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            data = resp.read()
    except urllib.error.HTTPError as e:
        err = e.read().decode("utf-8", errors="replace")
        raise SystemExit(f"TTS HTTP {e.code}: {err}") from e
    with open(out_path, "wb") as f:
        f.write(data)


def run(project_dir: str):
    api_key = os.environ.get("XAI_API_KEY")
    if not api_key:
        raise SystemExit("XAI_API_KEY is not set (required for Grok TTS)")

    beats_path = os.path.join(project_dir, "beats.json")
    with open(beats_path) as f:
        doc = json.load(f)

    voice = doc.get("voice") or {}
    voice_id = voice.get("voice_id") or "eve"
    language = voice.get("language") or doc.get("language") or "en"

    audio_dir = os.path.join(project_dir, "audio")
    os.makedirs(audio_dir, exist_ok=True)

    for beat in doc["beats"]:
        text = beat.get("narration") or ""
        if not text.strip():
            print(f"skip beat {beat.get('id')}: empty narration")
            continue
        out = os.path.join(audio_dir, f"narr_{beat['id']}.mp3")
        print(f"TTS beat {beat['id']} → {out}")
        synthesize(text, voice_id, language, out, api_key)
        beat["narration_audio"] = out
        beat["narration_dur"] = round(probe_dur(out), 2)

    with open(beats_path, "w") as f:
        json.dump(doc, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print("Updated", beats_path)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 tts_grok.py <project_dir>", file=sys.stderr)
        sys.exit(2)
    run(os.path.abspath(sys.argv[1]))
