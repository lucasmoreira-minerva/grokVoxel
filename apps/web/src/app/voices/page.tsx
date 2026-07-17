import { VOICES, NARRATION_STYLES } from "@/features/voices/catalog";

export default function VoicesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Vozes · Grok TTS</h1>
        <p className="text-[var(--muted)] mt-1">
          Suite SuperGrok-first. ElevenLabs e outros providers ficam reservados
          para o futuro sem sair do seletor unificado.
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {VOICES.map((v) => (
          <div key={v.id} className="panel p-4">
            <div className="font-semibold">{v.label}</div>
            <div className="text-sm text-[var(--muted)] mt-1">{v.description}</div>
            <div className="mt-2 flex gap-2">
              <span className="badge">{v.provider}</span>
              <span className="badge">{v.language.join(", ")}</span>
            </div>
          </div>
        ))}
      </div>
      <div>
        <h2 className="font-semibold mb-2">Estilos de narração</h2>
        <div className="grid sm:grid-cols-2 gap-2">
          {NARRATION_STYLES.map((n) => (
            <div key={n.id} className="panel p-3 text-sm">
              <div className="font-medium">{n.label}</div>
              <div className="text-[var(--muted)] text-xs mt-1">{n.hint}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
