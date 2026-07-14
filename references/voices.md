# Grok TTS voices

Narration uses the **Grok TTS API** (`POST https://api.x.ai/v1/tts`), not a native CLI
tool. Set `XAI_API_KEY`.

## beats.json voice block

```json
"voice": {
  "voice_id": "eve",
  "language": "en",
  "speed": 1.0
}
```

| Field | Notes |
|---|---|
| `voice_id` | Built-in id (e.g. `eve`, `leo`) or custom voice id from the xAI custom-voices API |
| `language` | `en` (default) or `pt-BR` for Brazilian Portuguese narration |
| `speed` | Optional; pass through if the API accepts it, else ignore |

## Recommendations

| Use case | Suggested starting point |
|---|---|
| English documentary default | `leo` or `eve` — pick male/female to taste |
| English ads / energetic | Prefer a brighter built-in; A/B two options on one sentence |
| **pt-BR** explainer | Set `"language": "pt-BR"`; try `eve` / `leo` and re-roll if accent is weak |
| Consistent series | Pin one `voice_id` for the whole project; never change mid-film |

Verify the live voice roster in [xAI voice docs](https://docs.x.ai/developers/model-capabilities/audio/voice)
— ids may expand over time.

## Script

```bash
python3 scripts/tts_grok.py out/<project>
```

Writes `out/<project>/audio/narr_<beat_id>.mp3` and fills `narration_audio` +
`narration_dur` on each beat.
