"use client";

import { useRef, useState } from "react";
import type { MusicTrack } from "@/lib/types/project";
import { MUSIC_IMPORT_HINT } from "@/features/music/catalog";

export function MusicList({ tracks }: { tracks: MusicTrack[] }) {
  const [playing, setPlaying] = useState<string | null>(null);
  const [errId, setErrId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function toggle(id: string, hasFile: boolean) {
    if (id === "none") return;
    if (!hasFile) {
      setErrId(id);
      return;
    }
    const el = audioRef.current;
    if (!el) return;
    setErrId(null);
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
        setErrId(id);
      });
  }

  return (
    <div className="space-y-6">
      <audio
        ref={audioRef}
        onEnded={() => setPlaying(null)}
        onError={() => {
          setPlaying(null);
        }}
        className="hidden"
      />
      <div className="grid gap-2">
        {tracks.map((m) => {
          const canPreview = Boolean(m.file || m.previewUrl);
          return (
            <div
              key={m.id}
              className="panel p-4 flex flex-wrap items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="font-semibold flex items-center gap-2">
                  {m.title}
                  {canPreview ? (
                    <span className="badge badge-ok !text-[10px]">local</span>
                  ) : m.id !== "none" ? (
                    <span className="badge !text-[10px]">importar</span>
                  ) : null}
                </div>
                <div className="text-xs text-[var(--muted)] mt-1">
                  {m.moods.join(" · ")} · {m.source}
                  {m.file ? ` · ${m.file}` : m.id !== "none" ? " · sem arquivo" : ""}
                </div>
                {m.credit && (
                  <div className="text-[11px] text-[var(--muted)] mt-1">
                    {m.credit}
                  </div>
                )}
                {errId === m.id && (
                  <div className="text-[11px] text-rose-300 mt-1">
                    Preview indisponível — importe o mp3 para music/ e registre no
                    catálogo.
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="badge">{m.id}</span>
                {m.id !== "none" && (
                  <button
                    type="button"
                    className={`btn !text-xs ${playing === m.id ? "btn-ok" : ""} ${
                      !canPreview ? "opacity-60" : ""
                    }`}
                    onClick={() => toggle(m.id, canPreview)}
                    title={
                      canPreview
                        ? "Ouvir preview"
                        : "Sem arquivo local — veja import abaixo"
                    }
                  >
                    {playing === m.id ? "■ Parar" : "▶ Preview"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <section className="panel p-5 space-y-3">
        <h2 className="font-semibold">Importar de bibliotecas públicas</h2>
        <p className="text-sm text-[var(--muted)]">
          SuperGrok não gera trilha. Baixe royalty-free, salve em{" "}
          <code className="text-sky-300">music/&lt;slug&gt;.mp3</code> e adicione
          entrada em{" "}
          <code className="text-sky-300">
            apps/web/src/features/music/catalog.ts
          </code>{" "}
          (e opcionalmente <code className="text-sky-300">music/manifest.json</code>
          ).
        </p>
        <ul className="space-y-2 text-sm">
          {MUSIC_IMPORT_HINT.sources.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center gap-2">
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="text-sky-300 hover:underline font-medium"
              >
                {s.label}
              </a>
              <span className="text-[var(--muted)] text-xs">{s.note}</span>
            </li>
          ))}
        </ul>
        <pre className="text-[11px] font-mono bg-black/30 border border-[var(--border)] rounded p-3 overflow-x-auto text-[var(--muted)]">
{`// catalog.ts
{
  id: "documentary-warm",
  title: "Documentary Warm",
  moods: ["documentary", "calm"],
  source: "pixabay",
  file: "music/documentary-warm.mp3",
}`}
        </pre>
      </section>
    </div>
  );
}
