"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { StylePack, MusicTrack, VoiceOption } from "@/lib/types/project";

type Catalog = {
  styles: StylePack[];
  music: MusicTrack[];
  voices: VoiceOption[];
  narrationStyles: { id: string; label: string; hint: string }[];
};

export function NewProjectForm() {
  const router = useRouter();
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);

  const [topic, setTopic] = useState("Parque Tecnológico Garça Valley");
  const [initialPrompt, setInitialPrompt] = useState(
    "Vídeo institucional do Garça Valley: parque tecnológico de impacto público em Garça-SP. Incluir masterplan, SP-294, FATEC, SPTec/RPITec, formar para ficar. Tom de pitch municipal. Usar logos se enviados."
  );
  const [language, setLanguage] = useState<"en" | "pt-BR">("pt-BR");
  const [aspect, setAspect] = useState<"16:9" | "9:16" | "1:1">("16:9");
  const [durationSec, setDurationSec] = useState(90);
  const [styleId, setStyleId] = useState("grok-voxel");
  const [musicId, setMusicId] = useState("carefree");
  const [voiceId, setVoiceId] = useState("eve");
  const [narrationStyle, setNarrationStyle] = useState("teacher");
  const [audience, setAudience] = useState("Prefeitura, procuradoria, parceiros");

  useEffect(() => {
    fetch("/api/catalog")
      .then((r) => r.json())
      .then(setCatalog)
      .catch(() => setError("Falha ao carregar catálogo"));
  }, []);

  const harnessPrompt = useMemo(() => {
    const style = catalog?.styles.find((s) => s.id === styleId);
    return [
      `$ grok -p \\`,
      `  --cwd $GROK_STUDIO_ROOT \\`,
      `  --yolo \\`,
      `  --output-format plain \\`,
      `  "$(cat <<'PROMPT'`,
      `You are GrokStage director harness (SuperGrok / Grok Build).`,
      `Skill/style: ${styleId} → ${style?.skillPath || "skills/" + styleId}`,
      `Topic: ${topic || "(topic)"}`,
      `Audience: ${audience || "—"}`,
      `Language: ${language} · Aspect: ${aspect} · Duration: ${durationSec}s`,
      `Voice: ${voiceId} · Narration style: ${narrationStyle}`,
      `Music: ${musicId}`,
      `Assets bucket: logos/images uploaded by director (use as i2i refs when present).`,
      ``,
      `INITIAL DIRECTOR PROMPT:`,
      initialPrompt || "(empty)",
      ``,
      `PHASE 1 ONLY: produce / refine storyboard (scenes with title, visual, narration, duration, transition).`,
      `Do NOT generate full video until storyboard is approved in GrokStage UI.`,
      `PROMPT`,
      `)"`,
    ].join("\n");
  }, [
    catalog,
    styleId,
    topic,
    audience,
    language,
    aspect,
    durationSec,
    voiceId,
    narrationStyle,
    musicId,
    initialPrompt,
  ]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const prompt =
        initialPrompt.trim() ||
        `Crie um storyboard de vídeo ${durationSec}s sobre: ${topic}`;
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: topic.slice(0, 80),
          brief: {
            topic,
            audience,
            language,
            aspect,
            durationSec,
            styleId,
            musicId,
            voiceId,
            narrationStyle,
            initialPrompt: prompt,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro");
      const id = data.project.id as string;

      if (files.length) {
        const fd = new FormData();
        fd.set("kind", "logos");
        files.forEach((f) => fd.append("files", f));
        await fetch(`/api/projects/${id}/assets`, { method: "POST", body: fd });
      }

      await fetch(`/api/projects/${id}/storyboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: prompt }),
      });
      router.push(`/projects/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro");
      setBusy(false);
    }
  }

  if (!catalog) {
    return (
      <div className="panel p-12 flex flex-col items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/grokstage-loader.svg" alt="" className="h-16 w-16" />
        <span className="text-[var(--muted)]">Carregando GrokStage…</span>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Skill / style selector — first class citizen */}
      <section className="panel p-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-semibold text-lg">Estilo de vídeo · Skill</h2>
          <span className="badge badge-run">feature: estilos</span>
        </div>
        <p className="text-sm text-[var(--muted)]">
          Cada estilo é uma skill do harness Grok Build. Hoje o pacote completo é{" "}
          <strong className="text-sky-200">GrokVoxel</strong>; outros packs já
          aparecem no seletor e evoluem com o tempo.
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          {catalog.styles.map((s) => (
            <label
              key={s.id}
              className={`rounded-xl border p-4 cursor-pointer transition ${
                styleId === s.id
                  ? "border-sky-400 bg-sky-500/10 ring-1 ring-sky-400/40"
                  : "border-[var(--border)] hover:border-slate-500"
              }`}
            >
              <div className="flex gap-3">
                <input
                  type="radio"
                  name="style"
                  className="mt-1"
                  checked={styleId === s.id}
                  onChange={() => setStyleId(s.id)}
                />
                <div className="min-w-0">
                  <div className="font-semibold flex items-center gap-2">
                    {s.name}
                    {s.id === "grok-voxel" && (
                      <span className="badge badge-ok">ready</span>
                    )}
                  </div>
                  <div className="text-sm text-[var(--muted)] mt-1">{s.description}</div>
                  <div className="mt-2 font-mono text-[11px] text-sky-300/80">
                    {s.skillPath}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {s.tags.map((t) => (
                      <span key={t} className="badge">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </label>
          ))}
        </div>
      </section>

      <section className="panel p-5 space-y-4">
        <h2 className="font-semibold text-lg">Brief do diretor</h2>
        <div>
          <label className="label">Tópico</label>
          <input
            className="input"
            required
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Prompt inicial (storyboard)</label>
          <textarea
            className="textarea !min-h-[120px]"
            value={initialPrompt}
            onChange={(e) => setInitialPrompt(e.target.value)}
            required
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Público</label>
            <input
              className="input"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Idioma</label>
            <select
              className="select"
              value={language}
              onChange={(e) => setLanguage(e.target.value as "en" | "pt-BR")}
            >
              <option value="pt-BR">Português (pt-BR)</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="label">Duração (15–180s)</label>
            <input
              className="input"
              type="number"
              min={15}
              max={180}
              value={durationSec}
              onChange={(e) => setDurationSec(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="label">Aspect</label>
            <select
              className="select"
              value={aspect}
              onChange={(e) => setAspect(e.target.value as typeof aspect)}
            >
              <option value="16:9">16:9</option>
              <option value="9:16">9:16</option>
              <option value="1:1">1:1</option>
            </select>
          </div>
          <div>
            <label className="label">Estilo de narração</label>
            <select
              className="select"
              value={narrationStyle}
              onChange={(e) => setNarrationStyle(e.target.value)}
            >
              {catalog.narrationStyles.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Voz (Grok TTS)</label>
            <select
              className="select"
              value={voiceId}
              onChange={(e) => setVoiceId(e.target.value)}
            >
              {catalog.voices.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label} — {v.description}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Música de fundo</label>
            <select
              className="select"
              value={musicId}
              onChange={(e) => setMusicId(e.target.value)}
            >
              {catalog.music.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Asset bucket */}
      <section className="panel p-5 space-y-3">
        <h2 className="font-semibold text-lg">Bucket de assets</h2>
        <p className="text-sm text-[var(--muted)]">
          Logos, plantas, fotos de apoio. Enviados para o projeto e usados como
          referências no harness.
        </p>
        <label className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border)] bg-black/25 px-4 py-10 cursor-pointer hover:border-sky-600/50 transition">
          <span className="text-2xl opacity-60">⇪</span>
          <span className="text-sm text-[var(--muted)]">
            Arraste ou clique para enviar PNG/JPG/SVG/PDF
          </span>
          <input
            type="file"
            multiple
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) =>
              setFiles(Array.from(e.target.files || []))
            }
          />
        </label>
        {files.length > 0 && (
          <ul className="text-xs text-[var(--muted)] space-y-1">
            {files.map((f) => (
              <li key={f.name}>• {f.name} ({Math.round(f.size / 1024)} KB)</li>
            ))}
          </ul>
        )}
      </section>

      {/* Terminal harness preview */}
      <section className="panel p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[#0d1117]">
          <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="ml-2 font-mono">grok-build · harness preview</span>
          </div>
          <span className="badge badge-run">SuperGrok OAuth</span>
        </div>
        <pre className="p-4 text-[11px] leading-relaxed font-mono text-emerald-200/90 bg-[#0b0f14] overflow-auto max-h-72 whitespace-pre-wrap">
          {harnessPrompt}
        </pre>
        <div className="px-4 py-2 border-t border-[var(--border)] text-[11px] text-[var(--muted)] bg-[#0d1117]">
          Este prompt é o contrato do diretor com o motor. O storyboard é gerado
          antes do render completo; só após confirmar as cenas o CLI roda a skill.
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-rose-800 bg-rose-950/40 px-4 py-3 text-rose-200 text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? (
            <span className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/grokstage-loader.svg" className="h-5 w-5" alt="" />
              Criando…
            </span>
          ) : (
            "Criar projeto e abrir storyboard"
          )}
        </button>
      </div>
    </form>
  );
}
