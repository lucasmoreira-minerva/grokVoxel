"use client";

import { useRef, useState } from "react";
import type { MusicTrack } from "@/lib/types/project";
import { MUSIC_IMPORT_HINT } from "@/features/music/catalog";
import { Button, Card, Chip, toast } from "@heroui/react";

export function MusicList({ tracks }: { tracks: MusicTrack[] }) {
  const [playing, setPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function toggle(id: string, hasFile: boolean) {
    if (id === "none") return;
    if (!hasFile) {
      toast.warning("Importe o mp3 para music/ e registre no catálogo");
      return;
    }
    const el = audioRef.current;
    if (!el) return;
    if (playing === id) {
      el.pause();
      setPlaying(null);
      return;
    }
    el.src = `/api/music/${id}`;
    el.play()
      .then(() => setPlaying(id))
      .catch(() => {
        setPlaying(null);
        toast.danger("Falha no preview de áudio");
      });
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <audio
        ref={audioRef}
        onEnded={() => setPlaying(null)}
        onError={() => setPlaying(null)}
        className="hidden"
      />
      <div className="grid gap-3">
        {tracks.map((m) => {
          const canPreview = Boolean(m.file || m.previewUrl);
          return (
            <Card
              key={m.id}
              className={`p-4 flex flex-wrap items-center justify-between gap-3 transition ${
                playing === m.id ? "ring-2 ring-accent/40" : ""
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="font-semibold flex items-center gap-2 flex-wrap">
                  {m.title}
                  {canPreview ? (
                    <Chip size="sm" color="success" variant="soft">
                      <Chip.Label>local</Chip.Label>
                    </Chip>
                  ) : m.id !== "none" ? (
                    <Chip size="sm" variant="secondary">
                      <Chip.Label>importar</Chip.Label>
                    </Chip>
                  ) : null}
                </div>
                <div className="text-xs text-muted mt-1">
                  {m.moods.join(" · ")} · {m.source}
                  {m.file
                    ? ` · ${m.file}`
                    : m.id !== "none"
                      ? " · sem arquivo"
                      : ""}
                </div>
                {m.credit && (
                  <div className="text-[11px] text-muted mt-1">{m.credit}</div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Chip size="sm" variant="secondary">
                  <Chip.Label>{m.id}</Chip.Label>
                </Chip>
                {m.id !== "none" && (
                  <Button
                    size="sm"
                    variant={playing === m.id ? "primary" : "secondary"}
                    onPress={() => toggle(m.id, canPreview)}
                  >
                    {playing === m.id ? "■ Parar" : "▶ Preview"}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-5 space-y-4">
        <div>
          <h2 className="font-semibold text-lg">Bibliotecas públicas</h2>
          <p className="text-sm text-muted mt-1">
            SuperGrok não gera trilha. Baixe royalty-free →{" "}
            <code className="text-accent">music/&lt;slug&gt;.mp3</code> →
            catálogo.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-2">
          {MUSIC_IMPORT_HINT.sources.map((s) => (
            <a
              key={s.id}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-border p-3 hover:border-accent/40 hover:bg-accent/5 transition"
            >
              <div className="font-medium text-sm text-accent">{s.label}</div>
              <div className="text-[11px] text-muted mt-1">{s.note}</div>
            </a>
          ))}
        </div>
        <pre className="harness p-3 text-[11px] overflow-x-auto text-success/90">
{`{
  id: "documentary-warm",
  title: "Documentary Warm",
  moods: ["documentary", "calm"],
  source: "pixabay",
  file: "music/documentary-warm.mp3",
}`}
        </pre>
      </Card>
    </div>
  );
}
