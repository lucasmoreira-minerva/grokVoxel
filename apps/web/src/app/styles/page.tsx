import { STYLE_PACKS } from "@/features/styles/catalog";
import Link from "next/link";

export default function StylesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Estilos de vídeo · Skills</h1>
        <p className="text-[var(--muted)] mt-1">
          Cada estilo é uma skill do SuperGrok harness. Selecione no novo projeto
          ou no diretor.
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {STYLE_PACKS.map((s) => (
          <div key={s.id} className="panel p-5">
            <div className={`h-24 rounded-xl bg-gradient-to-br ${s.previewHue} mb-4 border border-[var(--border)]`} />
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-lg">{s.name}</h2>
              {s.id === "grok-voxel" && <span className="badge badge-ok">ready</span>}
            </div>
            <p className="text-sm text-[var(--muted)] mt-2">{s.description}</p>
            <p className="font-mono text-xs text-sky-300 mt-3">{s.skillPath}</p>
            <div className="mt-3 flex flex-wrap gap-1">
              {s.tags.map((t) => (
                <span key={t} className="badge">
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Link href="/new" className="btn btn-primary">
        Usar em novo projeto
      </Link>
    </div>
  );
}
