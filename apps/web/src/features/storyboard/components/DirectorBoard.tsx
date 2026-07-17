"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { nanoid } from "nanoid";
import type {
  CaptionConfig,
  Project,
  StoryboardScene,
  TransitionType,
} from "@/lib/types/project";

const TRANSITIONS: TransitionType[] = [
  "cut",
  "fade",
  "dissolve",
  "whip",
  "match_cut",
];

const DEFAULT_CAPTIONS: CaptionConfig = {
  enabled: true,
  scale: 0.62,
  style: "clean",
  position: "bottom",
};

function SceneCard({
  scene,
  index,
  editing,
  onEdit,
  onConfirm,
  onCancel,
  onChange,
  onReplaceStill,
  onAddReference,
  onQueueRegen,
  onRemove,
  onInsertAfter,
}: {
  scene: StoryboardScene;
  index: number;
  editing: boolean;
  onEdit: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  onChange: (patch: Partial<StoryboardScene>) => void;
  /** Replace card still with a final/base image (sets imageUrl) */
  onReplaceStill: (file: File) => void;
  /** Upload as project reference only (does not replace still unless empty) */
  onAddReference: (file: File) => void;
  onQueueRegen: () => void;
  onRemove: () => void;
  onInsertAfter: () => void;
}) {
  const jobLabel =
    scene.imageJob === "queued"
      ? "Na fila"
      : scene.imageJob === "done"
        ? "Still ok"
        : "Regen";

  return (
    <article
      className={`group relative flex flex-col bg-white text-zinc-900 border border-zinc-200 rounded-sm overflow-hidden shadow-sm ${
        scene.confirmed ? "ring-2 ring-emerald-500/70" : ""
      } ${editing ? "ring-2 ring-sky-500" : ""}`}
    >
      {/* Number badge — filmstrip style (Sania sheet) */}
      <div className="absolute top-0 left-0 z-10 bg-black text-white text-[11px] font-bold px-2 py-0.5 tracking-wide">
        {String(index + 1).padStart(2, "0")}
      </div>
      {scene.confirmed && (
        <div className="absolute top-0 right-0 z-10 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5">
          OK
        </div>
      )}
      {scene.imageJob === "queued" && (
        <div className="absolute top-0 right-0 z-10 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5">
          FILA
        </div>
      )}

      {/* Image — dominant, like reference sheet */}
      <div className="relative aspect-video bg-zinc-100">
        {scene.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={scene.imageUrl}
            alt={scene.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 text-xs p-3 text-center gap-1">
            <span className="text-2xl opacity-40">◻</span>
            <span>Sem still</span>
          </div>
        )}
        {/* Hover toolbar: Still | Ref | Regen | + | Edit | ✕ */}
        <div className="absolute inset-x-0 bottom-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-t from-black/85 via-black/50 to-transparent p-2 flex flex-wrap gap-1">
          <label
            className="cursor-pointer rounded bg-white/95 text-black text-[10px] font-semibold px-1.5 py-0.5 hover:bg-white"
            title="Substituir still final / base"
          >
            Still
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onReplaceStill(f);
                e.target.value = "";
              }}
            />
          </label>
          <label
            className="cursor-pointer rounded bg-white/95 text-black text-[10px] font-semibold px-1.5 py-0.5 hover:bg-white"
            title="Adicionar imagem de referência ao projeto"
          >
            Ref
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onAddReference(f);
                e.target.value = "";
              }}
            />
          </label>
          <button
            type="button"
            className="rounded bg-amber-400/95 text-black text-[10px] font-semibold px-1.5 py-0.5 hover:bg-amber-300"
            title="Fila de recriar still (prompt → Play bulk)"
            onClick={onQueueRegen}
          >
            {jobLabel}
          </button>
          <button
            type="button"
            className="rounded bg-white/95 text-black text-[10px] font-semibold px-1.5 py-0.5 hover:bg-white"
            title="Inserir card depois desta cena"
            onClick={onInsertAfter}
          >
            +
          </button>
          <button
            type="button"
            className="rounded bg-white/95 text-black text-[10px] font-semibold px-1.5 py-0.5 hover:bg-white"
            onClick={onEdit}
          >
            Edit
          </button>
          <button
            type="button"
            className="rounded bg-rose-500/95 text-white text-[10px] font-semibold px-1.5 py-0.5 hover:bg-rose-400 ml-auto"
            onClick={onRemove}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Compact metadata strip under image — like reference sheet */}
      <div className="border-t border-zinc-200 bg-zinc-50 text-[10px] leading-snug">
        <div className="grid grid-cols-[52px_1fr] border-b border-zinc-200">
          <div className="px-1.5 py-1 font-bold bg-zinc-100 text-zinc-500">TIME</div>
          <div className="px-1.5 py-1 text-zinc-800">{scene.durationSec}s · {scene.transitionOut}</div>
        </div>
        {editing ? (
          <div className="p-2 space-y-1.5 bg-white">
            <input
              className="w-full border border-zinc-300 rounded px-1.5 py-1 text-xs"
              value={scene.title}
              onChange={(e) => onChange({ title: e.target.value })}
            />
            <textarea
              className="w-full border border-zinc-300 rounded px-1.5 py-1 text-[11px] min-h-[52px]"
              value={scene.visual}
              onChange={(e) => onChange({ visual: e.target.value })}
              placeholder="Visual / shot"
            />
            <textarea
              className="w-full border border-zinc-300 rounded px-1.5 py-1 text-[11px] min-h-[40px]"
              value={scene.narration}
              onChange={(e) => onChange({ narration: e.target.value })}
              placeholder="Narração / dialogue"
            />
            <textarea
              className="w-full border border-zinc-300 rounded px-1.5 py-1 text-[11px] min-h-[36px]"
              value={scene.imagePrompt || ""}
              onChange={(e) => onChange({ imagePrompt: e.target.value })}
              placeholder="Prompt de imagem (opcional)"
            />
            <div className="flex gap-1">
              <input
                type="number"
                min={3}
                max={30}
                className="w-16 border border-zinc-300 rounded px-1 text-[11px]"
                value={scene.durationSec}
                onChange={(e) =>
                  onChange({ durationSec: Number(e.target.value) })
                }
              />
              <select
                className="flex-1 border border-zinc-300 rounded px-1 text-[11px]"
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
            <div className="flex gap-1 pt-1">
              <button
                type="button"
                className="flex-1 bg-emerald-600 text-white text-[11px] font-semibold py-1.5 rounded"
                onClick={onConfirm}
              >
                Confirmar
              </button>
              <button
                type="button"
                className="flex-1 bg-zinc-200 text-zinc-800 text-[11px] font-semibold py-1.5 rounded"
                onClick={onCancel}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[52px_1fr] border-b border-zinc-200">
              <div className="px-1.5 py-1 font-bold bg-zinc-100 text-zinc-500">SHOT</div>
              <div className="px-1.5 py-1 font-medium text-zinc-900 line-clamp-1">
                {scene.title}
              </div>
            </div>
            <div className="grid grid-cols-[52px_1fr] border-b border-zinc-200">
              <div className="px-1.5 py-1 font-bold bg-zinc-100 text-zinc-500">
                ACTION
              </div>
              <div className="px-1.5 py-1 text-zinc-700 line-clamp-2">{scene.visual}</div>
            </div>
            <div className="grid grid-cols-[52px_1fr]">
              <div className="px-1.5 py-1 font-bold bg-zinc-100 text-zinc-500">VO</div>
              <div className="px-1.5 py-1 text-zinc-600 line-clamp-2 italic">
                {scene.narration}
              </div>
            </div>
            <div className="flex border-t border-zinc-200">
              <button
                type="button"
                className="flex-1 text-[11px] font-semibold py-1.5 hover:bg-zinc-100"
                onClick={onEdit}
              >
                Editar
              </button>
              <button
                type="button"
                className={`flex-1 text-[11px] font-semibold py-1.5 border-l border-zinc-200 ${
                  scene.confirmed
                    ? "bg-emerald-50 text-emerald-800"
                    : "hover:bg-sky-50 text-sky-800"
                }`}
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
  const [catalog, setCatalog] = useState<{
    voices: { id: string; label: string }[];
    music: { id: string; title: string }[];
    narrationStyles: { id: string; label: string }[];
    styles: { id: string; name: string }[];
  } | null>(null);

  const musicOptions =
    catalog?.music?.length
      ? catalog.music
      : draft
        ? [{ id: draft.brief.musicId, title: draft.brief.musicId }]
        : [];

  const load = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "load failed");
    // ensure captions defaults
    if (!data.project.brief.captions) {
      data.project.brief.captions = { ...DEFAULT_CAPTIONS };
    }
    setProject(data.project);
    setDraft(data.project);
  }, [projectId]);

  useEffect(() => {
    load().catch((e) => setError(e.message));
    fetch("/api/catalog")
      .then((r) => r.json())
      .then(setCatalog)
      .catch(() => null);
  }, [load]);

  const confirmedCount = useMemo(
    () => draft?.storyboard?.scenes.filter((s) => s.confirmed).length || 0,
    [draft]
  );

  const queuedImages = useMemo(
    () =>
      draft?.storyboard?.scenes.filter((s) => s.imageJob === "queued").length ||
      0,
    [draft]
  );

  function patchScene(i: number, patch: Partial<StoryboardScene>) {
    setDraft((p) => {
      if (!p?.storyboard) return p;
      const scenes = p.storyboard.scenes.map((s, idx) =>
        idx === i ? { ...s, ...patch } : s
      );
      return {
        ...p,
        storyboard: {
          ...p.storyboard,
          scenes,
          totalDurationSec: scenes.reduce((a, s) => a + s.durationSec, 0),
        },
      };
    });
  }

  function patchBrief(patch: Partial<Project["brief"]>) {
    setDraft((p) => (p ? { ...p, brief: { ...p.brief, ...patch } } : p));
  }

  function patchCaptions(patch: Partial<CaptionConfig>) {
    setDraft((p) => {
      if (!p) return p;
      const captions = { ...(p.brief.captions || DEFAULT_CAPTIONS), ...patch };
      return { ...p, brief: { ...p.brief, captions } };
    });
  }

  async function saveFull(noteText?: string) {
    if (!draft) return;
    // save brief + storyboard
    await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brief: draft.brief }),
    });
    if (draft.storyboard) {
      const res = await fetch(`/api/projects/${projectId}/storyboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          note: noteText || "Update",
          storyboard: draft.storyboard,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProject(data.project);
      setDraft(data.project);
      return data.project as Project;
    }
    await load();
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
    const current = draft;
    if (!current?.storyboard) return;
    setEditId(null);
    setBusy(true);
    try {
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
        body: JSON.stringify({
          note: `Confirmed scene ${i + 1}`,
          storyboard: sb,
        }),
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

  function addScene(afterIndex?: number) {
    setDraft((p) => {
      if (!p?.storyboard) return p;
      const scenes = [...p.storyboard.scenes];
      const insertAt =
        afterIndex === undefined ? scenes.length : afterIndex + 1;
      const scene: StoryboardScene = {
        id: nanoid(8),
        index: insertAt,
        title: `Nova cena ${insertAt + 1}`,
        visual: "Descreva o visual desta cena…",
        narration: "Narração…",
        durationSec: 6,
        imagePath: null,
        imageUrl: null,
        transitionOut: "cut",
        confirmed: false,
        imageJob: "idle",
      };
      scenes.splice(insertAt, 0, scene);
      const reindexed = scenes.map((s, i) => ({ ...s, index: i }));
      return {
        ...p,
        storyboard: {
          ...p.storyboard,
          scenes: reindexed,
          totalDurationSec: reindexed.reduce((a, s) => a + s.durationSec, 0),
        },
      };
    });
  }

  function removeScene(i: number) {
    if (!confirm(`Remover cena ${i + 1}?`)) return;
    setDraft((p) => {
      if (!p?.storyboard) return p;
      const scenes = p.storyboard.scenes
        .filter((_, idx) => idx !== i)
        .map((s, idx) => ({ ...s, index: idx }));
      return {
        ...p,
        storyboard: {
          ...p.storyboard,
          scenes,
          totalDurationSec: scenes.reduce((a, s) => a + s.durationSec, 0),
        },
      };
    });
  }

  async function uploadAsset(
    file: File,
    kind: "images" | "references" | "logos"
  ): Promise<{ name: string; url: string; project: Project }> {
    const fd = new FormData();
    fd.set("kind", kind);
    fd.append("files", file);
    const res = await fetch(`/api/projects/${projectId}/assets`, {
      method: "POST",
      body: fd,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    const name = data.saved?.[0] as string;
    const url = `/api/projects/${projectId}/assets/${encodeURIComponent(name)}`;
    return { name, url, project: data.project as Project };
  }

  async function replaceSceneStill(i: number, file: File) {
    setUploadBusy(true);
    try {
      const { name, url, project: pAssets } = await uploadAsset(file, "images");
      const current = draft;
      if (!current?.storyboard) return;
      const scenes = current.storyboard.scenes.map((s, idx) =>
        idx === i
          ? {
              ...s,
              imageUrl: url,
              imagePath: name,
              imageJob: "done" as const,
              confirmed: false,
            }
          : s
      );
      const nextSb = {
        ...current.storyboard,
        scenes,
        totalDurationSec: scenes.reduce((a, s) => a + s.durationSec, 0),
      };
      const r2 = await fetch(`/api/projects/${projectId}/storyboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          note: `Replaced still scene ${i + 1}`,
          storyboard: nextSb,
        }),
      });
      const d2 = await r2.json();
      if (!r2.ok) throw new Error(d2.error);
      setProject({ ...d2.project, assets: pAssets.assets });
      setDraft({ ...d2.project, assets: pAssets.assets });
      setMsg(`Still final da cena ${i + 1} atualizado.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload falhou");
    } finally {
      setUploadBusy(false);
    }
  }

  async function addSceneReference(i: number, file: File) {
    setUploadBusy(true);
    try {
      const { name, url, project: pAssets } = await uploadAsset(
        file,
        "references"
      );
      // If card has no still yet, also use as temporary still so the sheet isn't empty
      setDraft((p) => {
        if (!p?.storyboard) return p;
        const scenes = p.storyboard.scenes.map((s, idx) => {
          if (idx !== i) return s;
          if (!s.imageUrl) {
            return {
              ...s,
              imageUrl: url,
              imagePath: name,
              imageJob: "done" as const,
              notes: [s.notes, `ref:${name}`].filter(Boolean).join(" | "),
            };
          }
          return {
            ...s,
            notes: [s.notes, `ref:${name}`].filter(Boolean).join(" | "),
          };
        });
        return {
          ...p,
          assets: pAssets.assets,
          storyboard: {
            ...p.storyboard,
            scenes,
          },
        };
      });
      setProject(pAssets);
      setMsg(`Ref ${name} na cena ${i + 1}. Salve o board se quiser persistir.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload falhou");
    } finally {
      setUploadBusy(false);
    }
  }

  function queueRegen(i: number) {
    const visual = draft?.storyboard?.scenes[i]?.visual || "";
    const existing = draft?.storyboard?.scenes[i]?.imagePrompt;
    patchScene(i, {
      imageJob: "queued",
      imagePrompt: existing || visual,
      confirmed: false,
    });
    setMsg(
      `Cena ${i + 1} na fila. Ajuste o prompt no Edit se quiser, depois ▶ Play bulk stills.`
    );
  }

  async function playBulkImages() {
    if (!draft?.storyboard) return;
    setBusy(true);
    setError(null);
    try {
      await saveFull("Queue bulk image jobs");
      // Build prompt for Grok headless — director can also run manually
      const queued = draft.storyboard.scenes.filter(
        (s) => s.imageJob === "queued" || !s.imageUrl
      );
      const lines = queued.map(
        (s, idx) =>
          `${idx + 1}. [${s.id}] ${s.title}\n   PROMPT: ${s.imagePrompt || s.visual}\n   Save to project assets and set imageUrl.`
      );
      const bulkPrompt = [
        `GrokStage bulk still generation for project ${projectId}.`,
        `Style: ${draft.brief.styleId}. Aspect: ${draft.brief.aspect}.`,
        `Generate ONE keyframe image per scene below. Prefer image_edit with project assets as refs when present.`,
        `Copy each result into data/projects/${projectId}/assets/scene_<id>.jpg`,
        "",
        ...lines,
      ].join("\n");
      setRenderPrompt(bulkPrompt);
      setMsg(
        `${queued.length} cenas na fila de stills. Prompt bulk pronto (CLI). Espelhe os arquivos em assets/ e atualize imageUrl.`
      );
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
      await saveFull("Pre-approve");
      const res = await fetch(`/api/projects/${projectId}/approve`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProject(data.project);
      setDraft(data.project);
      setMsg("Storyboard fechado. CLI liberado.");
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
      await saveFull("Pre-render");
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
          ? "Dry-run: CLI ausente ou GROK_STUDIO_DRY_RUN=1."
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

  async function onUpload(files: FileList | null, kind = "logos") {
    if (!files?.length) return;
    setUploadBusy(true);
    try {
      const fd = new FormData();
      fd.set("kind", kind);
      Array.from(files).forEach((f) => fd.append("files", f));
      const res = await fetch(`/api/projects/${projectId}/assets`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProject(data.project);
      setDraft((p) =>
        p ? { ...p, assets: data.project.assets } : data.project
      );
      setMsg(`${data.saved?.length || 0} asset(s).`);
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
        <span className="text-[var(--muted)]">Carregando…</span>
      </div>
    );
  }

  const sb = draft.storyboard;
  const caps = draft.brief.captions || DEFAULT_CAPTIONS;
  const canRender =
    draft.phase === "approved" ||
    draft.phase === "error" ||
    draft.phase === "done";

  return (
    <div className="space-y-5">
      {/* Compact header like reference sheet */}
      <header className="rounded-sm border border-zinc-300 bg-white text-zinc-900 overflow-hidden shadow-sm">
        <div className="grid md:grid-cols-4 text-[11px] font-semibold border-b border-zinc-300">
          <div className="px-3 py-2 border-r border-zinc-300 bg-zinc-50">
            PROJECT: {draft.name}
          </div>
          <div className="px-3 py-2 border-r border-zinc-300">
            DURATION: {draft.brief.durationSec}s
          </div>
          <div className="px-3 py-2 border-r border-zinc-300">
            ASPECT: {draft.brief.aspect}
          </div>
          <div className="px-3 py-2">STYLE: {draft.brief.styleId}</div>
        </div>
        <div className="px-3 py-2 text-[12px] text-zinc-600 border-b border-zinc-200">
          <span className="font-bold text-zinc-800">CONCEPT: </span>
          {draft.brief.topic}
        </div>
        <div className="px-3 py-2 flex flex-wrap gap-2 items-center justify-between bg-zinc-50">
          <div className="flex flex-wrap gap-2 text-[11px]">
            <span className="badge !text-zinc-600 !border-zinc-300">{draft.phase}</span>
            {sb && (
              <span className="badge !text-zinc-600 !border-zinc-300">
                {confirmedCount}/{sb.scenes.length} ok · v{sb.version}
              </span>
            )}
            {queuedImages > 0 && (
              <span className="badge badge-run">{queuedImages} na fila</span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button className="btn !text-xs !py-1" disabled={busy} onClick={() => load()}>
              Atualizar
            </button>
            <button
              className="btn !text-xs !py-1"
              disabled={busy || !sb}
              onClick={() => saveFull("Manual save").then(() => setMsg("Salvo."))}
            >
              Salvar
            </button>
            <button
              className="btn !text-xs !py-1"
              disabled={busy || !sb}
              onClick={() => addScene()}
            >
              + Cena
            </button>
            <button
              className="btn !text-xs !py-1"
              disabled={busy || !sb}
              onClick={playBulkImages}
            >
              ▶ Play bulk stills
            </button>
            <button
              className="btn btn-ok !text-xs !py-1"
              disabled={busy || !sb?.scenes?.length}
              onClick={approve}
            >
              Fechar board
            </button>
            <button
              className="btn btn-primary !text-xs !py-1"
              disabled={busy || !canRender}
              onClick={releaseCli}
            >
              CLI Render
            </button>
          </div>
        </div>
      </header>

      {(error || msg) && (
        <div
          className={`rounded-lg border px-3 py-2 text-sm ${
            error
              ? "border-rose-800 bg-rose-950/40 text-rose-100"
              : "border-emerald-800 bg-emerald-950/30 text-emerald-100"
          }`}
        >
          {error || msg}
        </div>
      )}

      {/* Project controls: voice, music, captions */}
      <section className="panel p-4 grid lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <div className="label">Voz · narração</div>
          <select
            className="select !text-sm"
            value={draft.brief.voiceId}
            onChange={(e) => patchBrief({ voiceId: e.target.value })}
          >
            {(catalog?.voices || [{ id: draft.brief.voiceId, label: draft.brief.voiceId }]).map(
              (v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              )
            )}
          </select>
          <select
            className="select !text-sm"
            value={draft.brief.narrationStyle}
            onChange={(e) => patchBrief({ narrationStyle: e.target.value })}
          >
            {(
              catalog?.narrationStyles || [
                { id: draft.brief.narrationStyle, label: draft.brief.narrationStyle },
              ]
            ).map((n) => (
              <option key={n.id} value={n.id}>
                {n.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <div className="label">Música</div>
          <select
            className="select !text-sm"
            value={draft.brief.musicId}
            onChange={(e) => patchBrief({ musicId: e.target.value })}
          >
            {musicOptions.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
          {draft.brief.musicId !== "none" && (
            <audio
              controls
              className="w-full h-8"
              src={`/api/music/${draft.brief.musicId}`}
              preload="none"
            />
          )}
        </div>
        <div className="space-y-2">
          <div className="label">Legendas</div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={caps.enabled}
              onChange={(e) => patchCaptions({ enabled: e.target.checked })}
            />
            Ativar legendas no assemble
          </label>
          <div className="flex flex-wrap gap-2">
            <select
              className="select !text-sm"
              value={caps.style}
              onChange={(e) =>
                patchCaptions({
                  style: e.target.value as CaptionConfig["style"],
                })
              }
            >
              <option value="clean">Clean</option>
              <option value="bold">Bold</option>
              <option value="minimal">Minimal</option>
            </select>
            <select
              className="select !text-sm"
              value={caps.position}
              onChange={(e) =>
                patchCaptions({
                  position: e.target.value as CaptionConfig["position"],
                })
              }
            >
              <option value="bottom">Bottom</option>
              <option value="top">Top</option>
            </select>
            <input
              className="input !text-sm !w-20"
              type="number"
              min={0.4}
              max={1.2}
              step={0.05}
              value={caps.scale}
              onChange={(e) =>
                patchCaptions({ scale: Number(e.target.value) })
              }
              title="Escala (0.4–1.2)"
            />
          </div>
          <p className="text-[10px] text-[var(--muted)]">
            {caps.style} · {caps.position} · scale {caps.scale}
          </p>
        </div>
      </section>

      {/* Harness + assets compact */}
      <div className="grid lg:grid-cols-5 gap-3">
        <section className="lg:col-span-3 panel p-0 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)] bg-[#0d1117] text-xs font-mono text-[var(--muted)]">
            <span>grok-build · harness</span>
            <span className="badge badge-run">SuperGrok</span>
          </div>
          <div className="p-3 space-y-2 bg-[#0b0f14]">
            <textarea
              className="textarea !min-h-[72px] font-mono text-xs"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Notas de iteração do diretor…"
            />
            <button
              className="btn btn-primary w-full !text-xs"
              disabled={busy}
              onClick={iterateStoryboard}
            >
              {sb ? "Regenerar board" : "Gerar storyboard"}
            </button>
          </div>
        </section>
        <section className="lg:col-span-2 panel p-3 space-y-2">
          <div className="label">Assets</div>
          <label className="flex items-center justify-center rounded-lg border border-dashed border-[var(--border)] py-6 text-xs text-[var(--muted)] cursor-pointer hover:border-sky-600/50">
            {uploadBusy ? "…" : "⇪ Upload logos / refs / stills"}
            <input
              type="file"
              multiple
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => onUpload(e.target.files, "images")}
            />
          </label>
          <div className="flex flex-wrap gap-1 max-h-20 overflow-auto">
            {[
              ...draft.assets.logos,
              ...draft.assets.images,
              ...draft.assets.references,
            ]
              .slice(0, 24)
              .map((name) => (
                <a
                  key={name}
                  className="badge !text-[10px]"
                  href={`/api/projects/${projectId}/assets/${encodeURIComponent(name)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {name.slice(0, 18)}
                </a>
              ))}
          </div>
        </section>
      </div>

      {/* Filmstrip storyboard — light sheet like reference */}
      <section className="rounded-sm border border-zinc-300 bg-zinc-100 p-3 shadow-inner">
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="text-sm font-bold text-zinc-800 tracking-wide">
            STORYBOARD SHEET
          </h2>
          <button
            type="button"
            className="text-xs font-semibold text-sky-700 hover:underline"
            onClick={() => addScene()}
          >
            + Adicionar card
          </button>
        </div>
        {!sb?.scenes?.length ? (
          <div className="bg-white border border-zinc-200 p-10 text-center text-zinc-500 text-sm">
            Gere o storyboard no harness.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {sb.scenes.map((scene, i) => (
              <SceneCard
                key={scene.id}
                scene={scene}
                index={i}
                editing={editId === scene.id}
                onEdit={() => setEditId(scene.id)}
                onCancel={() => {
                  setEditId(null);
                  // only discard this scene's edit fields from last saved project
                  if (project?.storyboard) {
                    const saved = project.storyboard.scenes.find(
                      (s) => s.id === scene.id
                    );
                    if (saved) patchScene(i, saved);
                  }
                }}
                onConfirm={() => confirmScene(i)}
                onChange={(patch) => patchScene(i, patch)}
                onReplaceStill={(f) => replaceSceneStill(i, f)}
                onAddReference={(f) => addSceneReference(i, f)}
                onQueueRegen={() => queueRegen(i)}
                onRemove={() => removeScene(i)}
                onInsertAfter={() => {
                  addScene(i);
                  setMsg(`Card inserido após cena ${i + 1}.`);
                }}
              />
            ))}
            {/* Add tile */}
            <button
              type="button"
              onClick={() => addScene()}
              className="min-h-[200px] border-2 border-dashed border-zinc-300 bg-white/60 text-zinc-400 hover:border-sky-400 hover:text-sky-600 rounded-sm flex flex-col items-center justify-center gap-2 text-sm font-semibold"
            >
              <span className="text-2xl">＋</span>
              Nova cena
            </button>
          </div>
        )}
      </section>

      {/* CLI */}
      <section className="panel p-4 space-y-2">
        <h2 className="font-semibold text-sm">CLI · prompt liberado</h2>
        {project?.render?.logTail && (
          <pre className="text-[11px] bg-black/40 border border-[var(--border)] rounded p-2 max-h-32 overflow-auto whitespace-pre-wrap">
            {project.render.logTail}
          </pre>
        )}
        {renderPrompt ? (
          <pre className="text-[11px] font-mono bg-[#0b0f14] border border-[var(--border)] rounded p-3 max-h-64 overflow-auto whitespace-pre-wrap text-emerald-200/85">
            {renderPrompt}
          </pre>
        ) : (
          <p className="text-xs text-[var(--muted)]">
            Feche o board ou use Play bulk stills para gerar o prompt.
          </p>
        )}
      </section>
    </div>
  );
}
