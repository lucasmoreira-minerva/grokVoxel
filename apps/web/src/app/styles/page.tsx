"use client";

import { STYLE_PACKS } from "@/features/styles/catalog";
import Link from "next/link";
import { Button, Card, Chip } from "@heroui/react";

export default function StylesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Estilos de vídeo · Skills</h1>
        <p className="text-muted mt-1">
          Cada estilo é uma skill do SuperGrok harness. Selecione no novo projeto
          ou no diretor.
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {STYLE_PACKS.map((s) => (
          <Card key={s.id} className="p-5">
            <div
              className={`h-24 rounded-xl bg-gradient-to-br ${s.previewHue} mb-4 border border-border`}
            />
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-lg">{s.name}</h2>
              {s.id === "grok-voxel" && (
                <Chip size="sm" color="success" variant="soft">
                  <Chip.Label>ready</Chip.Label>
                </Chip>
              )}
            </div>
            <p className="text-sm text-muted mt-2">{s.description}</p>
            <p className="font-mono text-xs text-accent mt-3">{s.skillPath}</p>
            <div className="mt-3 flex flex-wrap gap-1">
              {s.tags.map((t) => (
                <Chip key={t} size="sm" variant="secondary">
                  <Chip.Label>{t}</Chip.Label>
                </Chip>
              ))}
            </div>
          </Card>
        ))}
      </div>
      <Link href="/new">
        <Button variant="primary">Usar em novo projeto</Button>
      </Link>
    </div>
  );
}
