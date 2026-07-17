import { MUSIC_TRACKS } from "@/features/music/catalog";

export default function MusicPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Música de fundo</h1>
        <p className="text-[var(--muted)] mt-1">
          Fontes limpas (Pixabay / YT Audio Library / Incompetech). SuperGrok
          não gera música — o assemble usa o banco local.
        </p>
      </div>
      <div className="grid gap-3">
        {MUSIC_TRACKS.map((m) => (
          <div key={m.id} className="panel p-4 flex justify-between gap-4">
            <div>
              <div className="font-semibold">{m.title}</div>
              <div className="text-xs text-[var(--muted)] mt-1">
                {m.moods.join(" · ")} · {m.source}
              </div>
              {m.credit && (
                <div className="text-[11px] text-[var(--muted)] mt-1">{m.credit}</div>
              )}
            </div>
            <span className="badge">{m.id}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
