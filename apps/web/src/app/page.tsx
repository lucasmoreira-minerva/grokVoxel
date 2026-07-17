import Link from "next/link";
import { listProjects } from "@/lib/storage/projects";
import { grokStatus } from "@/lib/grok/runner";
import { STYLE_PACKS } from "@/features/styles/catalog";

export const dynamic = "force-dynamic";

const phaseLabel: Record<string, string> = {
  brief: "Brief",
  storyboard: "Storyboard",
  approved: "Aprovado",
  rendering: "Render",
  done: "Pronto",
  error: "Erro",
};

export default function HomePage() {
  const projects = listProjects();
  const engine = grokStatus();

  return (
    <div className="space-y-8">
      <section className="panel p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/grokstage-logo.svg"
            alt="GrokStage"
            className="h-12 w-auto max-w-[280px]"
          />
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Direção de vídeo com SuperGrok
            </h1>
            <p className="mt-2 text-[var(--muted)] max-w-2xl">
              Você é o diretor. Monte o storyboard em cards, confirme cada cena,
              escolha o estilo (skill) e só então libere o harness Grok Build.
            </p>
          </div>
          <Link href="/new" className="btn btn-primary shrink-0">
            Novo projeto
          </Link>
        </div>
        <div className="mt-6 grid sm:grid-cols-3 gap-3 text-sm">
          <div className="rounded-xl border border-[var(--border)] bg-black/20 p-3">
            <div className="text-[var(--muted)] text-xs uppercase tracking-wide">
              Grok CLI
            </div>
            <div className="mt-1 font-mono text-[11px] break-all">
              {engine.binary || "não encontrado (dry-run)"}
            </div>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-black/20 p-3">
            <div className="text-[var(--muted)] text-xs uppercase tracking-wide">
              Skills
            </div>
            <div className="mt-1">{engine.skills.join(", ") || "—"}</div>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-black/20 p-3">
            <div className="text-[var(--muted)] text-xs uppercase tracking-wide">
              Estilos
            </div>
            <div className="mt-1">{STYLE_PACKS.map((s) => s.name).join(" · ")}</div>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Projetos</h2>
          <Link href="/styles" className="text-sm text-sky-300 hover:underline">
            Ver estilos →
          </Link>
        </div>
        {projects.length === 0 ? (
          <div className="panel p-8 text-center text-[var(--muted)]">
            Nenhum projeto. Crie o Garça Valley ou um novo no menu.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="panel p-4 hover:border-sky-700/60 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-sm text-[var(--muted)] mt-1 line-clamp-2">
                      {p.brief.topic}
                    </div>
                  </div>
                  <span
                    className={`badge ${
                      p.phase === "done"
                        ? "badge-ok"
                        : p.phase === "error"
                          ? "badge-warn"
                          : p.phase === "rendering"
                            ? "badge-run"
                            : ""
                    }`}
                  >
                    {phaseLabel[p.phase] || p.phase}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
                  <span className="badge">{p.brief.styleId}</span>
                  <span>{p.brief.durationSec}s</span>
                  <span>·</span>
                  <span>{p.brief.aspect}</span>
                  {p.storyboard && (
                    <>
                      <span>·</span>
                      <span>{p.storyboard.scenes.length} cenas</span>
                    </>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
