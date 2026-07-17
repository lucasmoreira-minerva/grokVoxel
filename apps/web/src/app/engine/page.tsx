"use client";

import { useEffect, useState } from "react";
import { Card, Chip, Spinner } from "@heroui/react";

type Status = {
  binary: string | null;
  skills: string[];
  dryRunDefault: boolean;
};

export default function EnginePage() {
  const [s, setS] = useState<Status | null>(null);

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then((d) => setS(d.engine || d))
      .catch(() =>
        setS({ binary: null, skills: [], dryRunDefault: true })
      );
  }, []);

  if (!s) {
    return (
      <Card className="p-12 flex flex-col items-center gap-3">
        <Spinner color="accent" />
        <span className="text-muted">Carregando motor…</span>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Motor Grok Build</h1>
        <p className="text-muted mt-1">
          Harness SuperGrok via CLI headless. A GUI é o cockpit; o render roda no
          host autenticado com OAuth.
        </p>
      </div>
      <Card className="p-5 space-y-3">
        <div className="text-xs uppercase tracking-wide text-muted">Binary</div>
        <code className="block text-sm text-accent break-all">
          {s.binary || "não encontrado — dry-run até instalar/logar o CLI"}
        </code>
        <div className="text-xs uppercase tracking-wide text-muted mt-4">
          Skills detectadas
        </div>
        <div className="flex flex-wrap gap-2">
          {(s.skills || []).map((sk) => (
            <Chip key={sk} size="sm" color="accent" variant="soft">
              <Chip.Label>{sk}</Chip.Label>
            </Chip>
          ))}
        </div>
        <div className="text-xs text-muted mt-4">
          Dry-run default: {s.dryRunDefault ? "sim" : "não"} · set{" "}
          <code className="text-accent">GROK_STUDIO_DRY_RUN=1</code> para forçar
          prompt-only.
        </div>
      </Card>
      <pre className="harness p-4 text-xs text-success overflow-auto">{`$ grok -p "..." --cwd $GROK_STUDIO_ROOT --yolo
# SuperGrok OAuth em ~/.grok/auth.json`}</pre>
    </div>
  );
}
