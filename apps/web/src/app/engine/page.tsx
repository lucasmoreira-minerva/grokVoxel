import { grokStatus } from "@/lib/grok/runner";

export const dynamic = "force-dynamic";

export default function EnginePage() {
  const s = grokStatus();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Motor Grok Build</h1>
        <p className="text-[var(--muted)] mt-1">
          Harness SuperGrok via CLI headless. A GUI é o cockpit; o render roda no
          host autenticado com OAuth.
        </p>
      </div>
      <div className="panel p-5 space-y-3">
        <div className="text-xs uppercase tracking-wide text-[var(--muted)]">Binary</div>
        <code className="block text-sm text-sky-200 break-all">
          {s.binary || "não encontrado — dry-run até instalar/logar o CLI"}
        </code>
        <div className="text-xs uppercase tracking-wide text-[var(--muted)] mt-4">
          Skills detectadas
        </div>
        <div className="flex flex-wrap gap-2">
          {s.skills.map((sk) => (
            <span key={sk} className="badge badge-run">
              {sk}
            </span>
          ))}
        </div>
        <div className="text-xs text-[var(--muted)] mt-4">
          Dry-run default: {s.dryRunDefault ? "sim" : "não"} · set{" "}
          <code>GROK_STUDIO_DRY_RUN=1</code> para forçar prompt-only.
        </div>
      </div>
      <pre className="panel p-4 text-xs font-mono text-emerald-200/80 overflow-auto">{`$ grok -p "..." --cwd $GROK_STUDIO_ROOT --yolo
# SuperGrok OAuth em ~/.grok/auth.json`}</pre>
    </div>
  );
}
