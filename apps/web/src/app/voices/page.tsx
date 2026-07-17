"use client";

import { VOICES, NARRATION_STYLES } from "@/features/voices/catalog";
import { Card, Chip } from "@heroui/react";

export default function VoicesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Vozes · Grok TTS</h1>
        <p className="text-muted mt-1">
          Suite SuperGrok-first. ElevenLabs e outros providers ficam reservados
          para o futuro sem sair do seletor unificado.
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {VOICES.map((v) => (
          <Card key={v.id} className="p-4">
            <div className="font-semibold">{v.label}</div>
            <div className="text-sm text-muted mt-1">{v.description}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Chip size="sm" variant="soft" color="accent">
                <Chip.Label>{v.provider}</Chip.Label>
              </Chip>
              <Chip size="sm" variant="secondary">
                <Chip.Label>{v.language.join(", ")}</Chip.Label>
              </Chip>
            </div>
          </Card>
        ))}
      </div>
      <div>
        <h2 className="font-semibold mb-2">Estilos de narração</h2>
        <div className="grid sm:grid-cols-2 gap-2">
          {NARRATION_STYLES.map((n) => (
            <Card key={n.id} className="p-3 text-sm">
              <div className="font-medium">{n.label}</div>
              <div className="text-muted text-xs mt-1">{n.hint}</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
