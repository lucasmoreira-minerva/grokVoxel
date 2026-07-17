"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Project, StoryboardScene, TransitionType } from "@/lib/types/project";

const TRANSITIONS: TransitionType[] = [
  "cut",
  "fade",
  "dissolve",
  "whip",
  "match_cut",
];

function SceneCard({
  scene,
  index,
  editing,
  onEdit,
  onConfirm,
  onCancel,
  onChange,
}: {
  scene: StoryboardScene;
  index: number;
  editing: boolean;
  onEdit: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  onChange: (patch: Partial<StoryboardScene>) => void;
}) {
  const gradient = `linear-gradient(145deg, hsl(${(index * 47) % 360} 40% 22%), hsl(${(index * 47 + 40) % 360} 35% 14%))`;

  return (
    <article
      className={`rounded-2xl border overflow-hidden bg-[#0e141c] transition ${
        scene.confirmed
          ? "border-emerald-600/50 shadow-[0_0_0_1px_rgba(62,207,142,0.15)]"
          : editing
            ? "border-sky-500/60"
            : "border-[var(--border)]"
      }`}
    >
      {/* Image area */}
      <div
        className="relative aspect-video w-full bg-black/40"
        style={{ background: scene.imageUrl ? undefined : gradient }}
      >
        {scene.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={scene.imageUrl}
            alt={scene.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <div className="text-3xl font-black opacity-30">{index + 1}</div>
            <div className="text-xs text-white/50 mt-1 line-clamp-2 px-2">
              {scene.title}
            </div>
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-1">
          <span className="badge bg-black/50 backdrop-blur">{index + 1}</span>
          {scene.confirmed && <span className="badge badge-ok">ok</span>}
        </div>
        <div className="absolute top-2 right-2 badge bg-black/50">
          {scene.durationSec}s · {scene.transitionOut}
        </div>
      </div>

      {/* Description below image */}
      <div className="p-3 space-y-2">
        {editing ? (
          <>
            <input
              className="input !text-sm"
              value={scene.title}
              onChange={(e) => onChange({ title: e.target.value })}
            />
            <textarea
              className="textarea !min-h-[72px] !text-xs"
              value={scene.visual}
              onChange={(e) => onChange({ visual: e.target.value })}
              placeholder="Descrição visual / início de cena"
            />
            <textarea
              className="textarea !min-h-[56px] !text-xs"
              value={scene.narration}
              onChange={(e) => onChange({ narration: e.target.value })}
              placeholder="Narração"
            />
            <div className="flex gap-2">
              <input
                className="input !w-20 !text-xs"
                type="number"
                min={3}
                max={30}
                value={scene.durationSec}
                onChange={(e) =>
                  onChange({ durationSec: Number(e.target.value) })
                }
              />
              <select
                className="select !text-xs"
                value={scene.transitionOut}
                onChange={(e) =>
                  onChange({
                    transitionOut: e.target.value as TransitionType,
                  })
                }
              >
                {TRANSITIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" className="btn btn-ok flex-1 !text-xs" onClick={onConfirm}>
                Confirmar cena
              </button>
              <button type="button" className="btn flex-1 !text-xs" onClick={onCancel}>
                Cancelar
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="font-semibold text-sm leading-snug">{scene.title}</h3>
            <p className="text-xs text-[var(--muted)] line-clamp-3 leading-relaxed">
              {scene.visual}
            </p>
            <p className="text-xs text-sky-200/80 line-clamp-2 italic">
              “{scene.narration}”
            </p>
            <div className="flex gap-2 pt-1">
              <button type="button" className="btn flex-1 !text-xs" onClick={onEdit}>
                Editar
              </button>
              <button
                type="button"
                className={`btn flex-1 !text-xs ${scene.confirmed ? "btn-ok" : "btn-primary"}`}
                onClick={onConfirm}
              >
                {scene.confirmed ? "Confirmada" : "Confirmar"}
              </button>
            </div>
          </>
        )}
      </div>
    </article>
  );
}

export function DirectorBoard({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<Project | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [renderPrompt, setRenderPrompt] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Project | null>(null);
  const [uploadBusy, setUploadBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "load failed");
    setProject(data.project);
    setDraft(data.project);
  }, [projectId]);

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [load]);

  const confirmedCount = useMemo(() => {
    return draft?.storyboard?.scenes.filter((s) => s.confirmed).length || 0;
  }, [draft]);

  const allConfirmed = useMemo(() => {
    const scenes = draft?.storyboard?.scenes || [];
    return scenes.length > 0 && scenes.every((s) => s.confirmed);
  }, [draft]);

  function patchScene(i: number, patch: Partial<StoryboardScene>) {
    setDraft((p) => {
      if (!p?.storyboard) return p;
      const scenes = p.storyboard.scenes.map((s, idx) =>
        idx === i ? { ...s, ...patch } : s
      );
      const totalDurationSec = scenes.reduce((a, s) => a + s.durationSec, 0);
      return {
        ...p,
        storyboard: { ...p.storyboard, scenes, totalDurationSec },
      };
    });
  }

  async function persistStoryboard(noteText?: string) {
    if (!draft?.storyboard) return;
    const res = await fetch(`/api/projects/${projectId}/storyboard`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        note: noteText || "Scene card update",
        storyboard: draft.storyboard,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setProject(data.project);
    setDraft(data.project);
    return data.project as Project;
  }

  async function iterateStoryboard() {
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/storyboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProject(data.project);
      setDraft(data.project);
      setNote("");
      setEditId(null);
      setMsg(`Iteração ${data.project.storyboard?.iteration} gerada.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setBusy(false);
    }
  }

  async function confirmScene(i: number) {
    patchScene(i, { confirmed: true });
    // apply confirm on draft then save
    setDraft((p) => {
      if (!p?.storyboard) return p;
      const scenes = p.storyboard.scenes.map((s, idx) =>
        idx === i ? { ...s, confirmed: true } : s
      );
      return { ...p, storyboard: { ...p.storyboard, scenes } };
    });
    setEditId(null);
    setBusy(true);
    try {
      // small delay for state flush - better save with explicit scene
      const current = draft;
      if (!current?.storyboard) return;
      const scenes = current.storyboard.scenes.map((s, idx) =>
        idx === i ? { ...s, confirmed: true } : s
      );
      const sb = {
        ...current.storyboard,
        scenes,
        totalDurationSec: scenes.reduce((a, s) => a + s.durationSec, 0),
      };
      const res = await fetch(`/api/projects/${projectId}/storyboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: `Confirmed scene ${i + 1}`, storyboard: sb }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProject(data.project);
      setDraft(data.project);
      setMsg(`Cena ${i + 1} confirmada.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setBusy(false);
    }
  }

  async function approve() {
    setBusy(true);
    setError(null);
    try {
      await persistStoryboard("Pre-approve save");
      const res = await fetch(`/api/projects/${projectId}/approve`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProject(data.project);
      setDraft(data.project);
      setMsg("Storyboard fechado. Harness liberado para o CLI.");
      const r2 = await fetch(`/api/projects/${projectId}/render`);
      const d2 = await r2.json();
      if (d2.prompt) setRenderPrompt(d2.prompt);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setBusy(false);
    }
  }

  async function releaseCli() {
    setBusy(true);
    setError(null);
    setMsg("Disparando Grok Build headless…");
    try {
      const res = await fetch(`/api/projects/${projectId}/render`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProject(data.project);
      setDraft(data.project);
      if (data.prompt) setRenderPrompt(data.prompt);
      setMsg(
        data.dryRun
          ? "Dry-run: CLI ausente ou GROK_STUDIO_DRY_RUN=1. Prompt abaixo."
          : data.ok
            ? "Render concluído."
            : "Render com erro — veja o log."
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setBusy(false);
    }
  }

  async function onUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploadBusy(true);
    try {
      const fd = new FormData();
      fd.set("kind", "logos");
      Array.from(files).forEach((f) => fd.append("files", f));
      const res = await fetch(`/api/projects/${projectId}/assets`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProject(data.project);
      setDraft(data.project);
      setMsg(`${data.saved?.length || 0} asset(s) enviados.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload falhou");
    } finally {
      setUploadBusy(false);
    }
  }

  if (!draft) {
    return (
      <div className="panel p-12 flex flex-col items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/grokstage-loader.svg" className="h-16 w-16" alt="" />
        <span className="text-[var(--muted)]">Carregando diretor…</span>
      </div>
    );
  }

  const sb = draft.storyboard;
  const canRender =
    draft.phase === "approved" ||
    draft.phase === "error" ||
    draft.phase === "done";

  return (
    <div className="space-y-6">
      <header className="panel p-5">
        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{draft.name}</h1>
              <span className="badge badge-run">{draft.phase}</span>
              <span className="badge">{draft.brief.styleId}</span>
            </div>
            <p className="text-[var(--muted)] mt-1 max-w-3xl">{draft.brief.topic}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
              <span className="badge">{draft.brief.durationSec}s</span>
              <span className="badge">{draft.brief.aspect}</span>
              <span className="badge">{draft.brief.language}</span>
              <span className="badge">{draft.brief.voiceId}</span>
              <span className="badge">{draft.brief.musicId}</span>
              {sb && (
                <span className="badge badge-ok">
                  {confirmedCount}/{sb.scenes.length} cenas ok
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="btn" disabled={busy} onClick={() => load()}>
              Atualizar
            </button>
            <button
              className="btn btn-ok"
              disabled={busy || !sb?.scenes?.length}
              onClick={approve}
              title={
                allConfirmed
                  ? "Todas as cenas confirmadas"
                  : "Pode fechar mesmo sem todas confirmadas"
              }
            >
              Fechar storyboard
            </button>
            <button
              className="btn btn-primary"
              disabled={busy || !canRender}
              onClick={releaseCli}
            >
              Liberar CLI / Render
            </button>
          </div>
        </div>
      </header>

      {(error || msg) && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            error
              ? "border-rose-800 bg-rose-950/40 text-rose-100"
              : "border-emerald-800 bg-emerald-950/30 text-emerald-100"
          }`}
        >
          {error || msg}
        </div>
      )}

      {/* Terminal + assets */}
      <div className="grid lg:grid-cols-2 gap-4">
        <section className="panel p-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[#0d1117]">
            <span className="font-mono text-xs text-[var(--muted)]">
              grok-build · harness
            </span>
            <span className="badge badge-run">SuperGrok</span>
          </div>
          <div className="p-4 space-y-3 bg-[#0b0f14]">
            <label className="label">Notas / prompt de iteração</label>
            <textarea
              className="textarea !min-h-[88px] font-mono text-xs"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: reforçar logo no final, encurtar abertura, tom mais institucional…"
            />
            <button
              className="btn btn-primary w-full"
              disabled={busy}
              onClick={iterateStoryboard}
            >
              {sb ? "Regenerar storyboard (iteração)" : "Gerar storyboard"}
            </button>
            <p className="text-[11px] text-[var(--muted)]">
              Skill: <code className="text-sky-300">{draft.brief.styleId}</code> ·
              prompt inicial já gravado no brief do projeto.
            </p>
          </div>
        </section>

        <section className="panel p-5 space-y-3">
          <h2 className="font-semibold">Bucket de assets</h2>
          <label className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border)] bg-black/25 px-4 py-8 cursor-pointer hover:border-sky-600/50">
            <span className="text-xl opacity-50">⇪</span>
            <span className="text-sm text-[var(--muted)]">
              {uploadBusy ? "Enviando…" : "Upload logos / plantas / refs"}
            </span>
            <input
              type="file"
              multiple
              accept="image/*,.pdf"
              className="hidden"
              disabled={uploadBusy}
              onChange={(e) => onUpload(e.target.files)}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              ...draft.assets.logos,
              ...draft.assets.images,
              ...draft.assets.references,
            ].map((name) => (
              <a
                key={name}
                className="badge hover:border-sky-500"
                href={`/api/projects/${projectId}/assets/${encodeURIComponent(name)}`}
                target="_blank"
                rel="noreferrer"
              >
                {name.slice(0, 28)}
              </a>
            ))}
            {![
              ...draft.assets.logos,
              ...draft.assets.images,
              ...draft.assets.references,
            ].length && (
              <span className="text-xs text-[var(--muted)]">Nenhum asset ainda.</span>
            )}
          </div>
        </section>
      </div>

      {/* Storyboard cards */}
      <section className="space-y-3">
        <div className="flex items-end justify-between gap-2">
          <div>
            <h2 className="font-semibold text-lg">Storyboard</h2>
            <p className="text-sm text-[var(--muted)]">
              Cards com imagem, descrição e ações Confirmar / Editar — fonte da
              verdade antes do CLI.
            </p>
          </div>
          {sb && (
            <span className="text-xs text-[var(--muted)]">
              v{sb.version} · iter {sb.iteration} · {sb.totalDurationSec.toFixed(0)}s
            </span>
          )}
        </div>

        {!sb?.scenes?.length ? (
          <div className="panel p-10 text-center text-[var(--muted)]">
            Gere o storyboard no painel do harness.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {sb.scenes.map((scene, i) => (
              <SceneCard
                key={scene.id}
                scene={scene}
                index={i}
                editing={editId === scene.id}
                onEdit={() => setEditId(scene.id)}
                onCancel={() => {
                  setEditId(null);
                  setDraft(project);
                }}
                onConfirm={() => confirmScene(i)}
                onChange={(patch) => patchScene(i, patch)}
              />
            ))}
          </div>
        )}
      </section>

      {/* CLI panel */}
      <section className="panel p-5 space-y-3">
        <h2 className="font-semibold">Prompt liberado · Grok Build CLI</h2>
        {project?.render?.logTail && (
          <pre className="text-xs bg-black/40 border border-[var(--border)] rounded-lg p-3 overflow-auto max-h-40 whitespace-pre-wrap">
            {project.render.logTail}
          </pre>
        )}
        {renderPrompt ? (
          <pre className="text-[11px] font-mono bg-[#0b0f14] border border-[var(--border)] rounded-lg p-3 overflow-auto max-h-72 whitespace-pre-wrap text-emerald-200/85">
            {renderPrompt}
          </pre>
        ) : (
          <p className="text-sm text-[var(--muted)]">
            Feche o storyboard para gerar o prompt de comando do harness.
          </p>
        )}
      </section>
    </div>
  );
}
