"use client";

import Link from "next/link";
import { Button, Card, Chip, EmptyState } from "@heroui/react";
import type { Project, StylePack } from "@/lib/types/project";

const phaseLabel: Record<string, string> = {
  brief: "Brief",
  storyboard: "Storyboard",
  approved: "Aprovado",
  rendering: "Render",
  done: "Pronto",
  error: "Erro",
};

function phaseColor(
  phase: string
): "default" | "accent" | "success" | "warning" | "danger" {
  if (phase === "done" || phase === "approved") return "success";
  if (phase === "error") return "danger";
  if (phase === "rendering") return "accent";
  if (phase === "storyboard") return "warning";
  return "default";
}

export function HomeView({
  projects,
  engine,
  styles,
}: {
  projects: Project[];
  engine: { binary: string | null; skills: string[]; dryRunDefault: boolean };
  styles: StylePack[];
}) {
  return (
    <div className="space-y-8 max-w-6xl">
      <Card className="overflow-hidden">
        <div className="p-6 md:p-8 bg-gradient-to-br from-accent/10 via-transparent to-danger/5">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/grokstage-logo.svg"
              alt="GrokStage"
              className="h-12 w-auto max-w-[280px] drop-shadow-sm"
            />
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Direção de vídeo com SuperGrok
              </h1>
              <p className="mt-2 text-muted max-w-2xl leading-relaxed">
                Monte o storyboard em cards, confirme cada cena, escolha o estilo
                (skill) e libere o harness Grok Build — você é o diretor.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              <Link href="/new">
                <Button variant="primary" size="lg">
                  Novo projeto
                </Button>
              </Link>
              <Link href="/styles">
                <Button variant="secondary" size="lg">
                  Estilos
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-px bg-border border-t border-border">
          {[
            {
              label: "Grok CLI",
              value: engine.binary || "não encontrado (dry-run)",
              mono: true,
            },
            {
              label: "Skills",
              value: engine.skills.join(", ") || "—",
            },
            {
              label: "Estilos",
              value: styles.map((s) => s.name).join(" · "),
            },
          ].map((item) => (
            <div key={item.label} className="bg-surface p-4">
              <div className="text-muted text-[11px] uppercase tracking-wide font-semibold">
                {item.label}
              </div>
              <div
                className={`mt-1.5 text-sm ${item.mono ? "font-mono text-[11px] break-all text-accent" : ""}`}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Projetos</h2>
            <p className="text-sm text-muted">
              {projects.length} projeto{projects.length === 1 ? "" : "s"} no
              workspace local
            </p>
          </div>
          <Link href="/new">
            <Button size="sm" variant="secondary">
              ＋ Criar
            </Button>
          </Link>
        </div>

        {projects.length === 0 ? (
          <Card className="p-10">
            <EmptyState className="flex flex-col items-center text-center gap-3 py-4">
              <div className="text-3xl opacity-40">▦</div>
              <div className="font-semibold text-lg">Nenhum projeto ainda</div>
              <p className="text-sm text-muted max-w-sm">
                Crie um brief com skill GrokVoxel ou abra o seed Garça Valley.
              </p>
              <Link href="/new">
                <Button variant="primary">Novo projeto</Button>
              </Link>
            </EmptyState>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {projects.map((p) => (
              <Link key={p.id} href={`/projects/${p.id}`} className="block group">
                <Card className="p-5 h-full gs-card-hover border border-border">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-base group-hover:text-accent transition">
                        {p.name}
                      </div>
                      <div className="text-sm text-muted mt-1.5 line-clamp-2 leading-relaxed">
                        {p.brief.topic}
                      </div>
                    </div>
                    <Chip size="sm" color={phaseColor(p.phase)} variant="soft">
                      <Chip.Label>
                        {phaseLabel[p.phase] || p.phase}
                      </Chip.Label>
                    </Chip>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted">
                    <Chip size="sm" variant="secondary">
                      <Chip.Label>{p.brief.styleId}</Chip.Label>
                    </Chip>
                    <span className="tabular-nums">{p.brief.durationSec}s</span>
                    <span className="opacity-40">·</span>
                    <span>{p.brief.aspect}</span>
                    {p.storyboard && (
                      <>
                        <span className="opacity-40">·</span>
                        <span>{p.storyboard.scenes.length} cenas</span>
                      </>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
