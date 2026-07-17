"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { nanoid } from "nanoid";
import {
  Alert,
  Button,
  Card,
  Chip,
  Spinner,
  Switch,
  Tabs,
  toast,
} from "@heroui/react";
import type {
  CaptionConfig,
  Project,
  StoryboardScene,
  TransitionType,
} from "@/lib/types/project";
import { SceneEditModal } from "@/features/ui/SceneEditModal";
import { ConfirmModal } from "@/features/ui/ConfirmModal";

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
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [removeIndex, setRemoveIndex] = useState<number | null>(null);

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
    toast.success(`Cena ${i + 1} removida do rascunho`);
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
      <Card className="p-12 flex flex-col items-center gap-3">
        <Spinner size="lg" color="accent" />
        <span className="text-muted">Carregando…</span>
      </Card>
    );
  }

  const sb = draft.storyboard;
  const caps = draft.brief.captions || DEFAULT_CAPTIONS;
  const canRender =
    draft.phase === "approved" ||
    draft.phase === "error" ||
    draft.phase === "done";

  const editScene =
    editIndex !== null && sb?.scenes[editIndex]
      ? sb.scenes[editIndex]
      : null;

  return (
    <div className="space-y-5 max-w-[1400px]">
      <Card className="overflow-hidden">
        <div className="grid md:grid-cols-4 text-[11px] font-semibold border-b border-border bg-overlay/40">
          <div className="px-4 py-2.5 border-r border-border">
            <span className="text-muted font-medium">PROJECT</span>
            <div className="text-sm font-bold mt-0.5 truncate">{draft.name}</div>
          </div>
          <div className="px-4 py-2.5 border-r border-border">
            <span className="text-muted font-medium">DURATION</span>
            <div className="text-sm font-bold mt-0.5">{draft.brief.durationSec}s</div>
          </div>
          <div className="px-4 py-2.5 border-r border-border">
            <span className="text-muted font-medium">ASPECT</span>
            <div className="text-sm font-bold mt-0.5">{draft.brief.aspect}</div>
          </div>
          <div className="px-4 py-2.5">
            <span className="text-muted font-medium">STYLE</span>
            <div className="text-sm font-bold mt-0.5">{draft.brief.styleId}</div>
          </div>
        </div>
        <div className="px-4 py-3 text-sm border-b border-border">
          <span className="font-semibold">Concept · </span>
          <span className="text-muted">{draft.brief.topic}</span>
        </div>
        <div className="px-4 py-3 flex flex-wrap gap-2 items-center justify-between bg-surface">
          <div className="flex flex-wrap gap-2 items-center">
            <Chip size="sm" variant="soft" color="accent">
              <Chip.Label>{draft.phase}</Chip.Label>
            </Chip>
            {sb && (
              <Chip size="sm" variant="secondary">
                <Chip.Label>
                  {confirmedCount}/{sb.scenes.length} ok · v{sb.version}
                </Chip.Label>
              </Chip>
            )}
            {queuedImages > 0 && (
              <Chip size="sm" color="warning" variant="soft">
                <Chip.Label>{queuedImages} na fila</Chip.Label>
              </Chip>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Button size="sm" variant="secondary" isDisabled={busy} onPress={() => load()}>
              Atualizar
            </Button>
            <Button
              size="sm"
              variant="secondary"
              isDisabled={busy || !sb}
              onPress={() =>
                saveFull("Manual save").then(() => toast.success("Projeto salvo"))
              }
            >
              Salvar
            </Button>
            <Button size="sm" variant="secondary" isDisabled={busy || !sb} onPress={() => addScene()}>
              + Cena
            </Button>
            <Button size="sm" variant="secondary" isDisabled={busy || !sb} onPress={playBulkImages}>
              ▶ Bulk stills
            </Button>
            <Button
              size="sm"
              variant="primary"
              isDisabled={busy || !sb?.scenes?.length}
              onPress={approve}
            >
              Fechar board
            </Button>
            <Button size="sm" variant="primary" isDisabled={busy || !canRender} onPress={releaseCli}>
              CLI Render
            </Button>
          </div>
        </div>
      </Card>

      {error && (
        <Alert status="danger">
          <Alert.Description>{error}</Alert.Description>
        </Alert>
      )}
      {msg && !error && (
        <Alert status="success">
          <Alert.Description>{msg}</Alert.Description>
        </Alert>
      )}

      <Card className="p-4">
        <Tabs defaultSelectedKey="audio" className="w-full">
          <Tabs.ListContainer>
            <Tabs.List aria-label="Configuração do projeto">
              <Tabs.Tab id="audio">Voz & música</Tabs.Tab>
              <Tabs.Tab id="captions">Legendas</Tabs.Tab>
              <Tabs.Indicator />
            </Tabs.List>
          </Tabs.ListContainer>
          <Tabs.Panel id="audio" className="pt-4 grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="label">Voz · narração</div>
              <select
                className="select !text-sm"
                value={draft.brief.voiceId}
                onChange={(e) => patchBrief({ voiceId: e.target.value })}
              >
                {(
                  catalog?.voices || [
                    { id: draft.brief.voiceId, label: draft.brief.voiceId },
                  ]
                ).map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
              <select
                className="select !text-sm"
                value={draft.brief.narrationStyle}
                onChange={(e) => patchBrief({ narrationStyle: e.target.value })}
              >
                {(
                  catalog?.narrationStyles || [
                    {
                      id: draft.brief.narrationStyle,
                      label: draft.brief.narrationStyle,
                    },
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
                  className="w-full h-9 rounded-lg"
                  src={`/api/music/${draft.brief.musicId}`}
                  preload="none"
                />
              )}
            </div>
          </Tabs.Panel>
          <Tabs.Panel id="captions" className="pt-4 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer w-fit">
              <Switch
                isSelected={caps.enabled}
                onChange={(v) => patchCaptions({ enabled: !!v })}
              >
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch>
              <span className="text-sm font-medium">Legendas no assemble</span>
            </label>
            <div className="flex flex-wrap gap-2">
              <select
                className="select !text-sm !w-auto"
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
                className="select !text-sm !w-auto"
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
                className="input !text-sm !w-24"
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
            <p className="text-[11px] text-muted">
              {caps.style} · {caps.position} · scale {caps.scale}
            </p>
          </Tabs.Panel>
        </Tabs>
      </Card>

      <SceneEditModal
        isOpen={editIndex !== null}
        scene={editScene}
        index={editIndex ?? 0}
        onClose={() => setEditIndex(null)}
        onSave={(patch) => {
          if (editIndex === null) return;
          patchScene(editIndex, patch);
          toast.success("Cena atualizada no rascunho");
        }}
        onConfirm={() => {
          if (editIndex !== null) confirmScene(editIndex);
        }}
      />
      <ConfirmModal
        isOpen={removeIndex !== null}
        onOpenChange={(open) => {
          if (!open) setRemoveIndex(null);
        }}
        title={`Remover cena ${(removeIndex ?? 0) + 1}?`}
        description="A cena some do rascunho. Salve o board para persistir."
        confirmLabel="Remover"
        danger
        onConfirm={() => {
          if (removeIndex !== null) removeScene(removeIndex);
          setRemoveIndex(null);
        }}
      />

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
      <section className="storyboard-sheet rounded-lg border border-border p-3 shadow-inner">
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="text-sm font-bold tracking-wide">STORYBOARD SHEET</h2>
          <Button size="sm" variant="ghost" onPress={() => addScene()}>
            + Adicionar card
          </Button>
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
                onEdit={() => {
                  setEditIndex(i);
                  setEditId(scene.id);
                }}
                onCancel={() => {
                  setEditId(null);
                  setEditIndex(null);
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
                onRemove={() => setRemoveIndex(i)}
                onInsertAfter={() => {
                  addScene(i);
                  toast.success(`Card inserido após cena ${i + 1}`);
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
