"use client";

import { Button, Input, Label, Modal, TextArea, useOverlayState } from "@heroui/react";
import { useEffect, useState } from "react";
import type { StoryboardScene, TransitionType } from "@/lib/types/project";

const TRANSITIONS: TransitionType[] = [
  "cut",
  "fade",
  "dissolve",
  "whip",
  "match_cut",
];

const fieldClass =
  "w-full rounded-lg border border-border bg-field-background text-field-foreground px-3 py-2 text-sm";

type Props = {
  isOpen: boolean;
  scene: StoryboardScene | null;
  index: number;
  onClose: () => void;
  onSave: (patch: Partial<StoryboardScene>) => void;
  onConfirm: () => void;
};

export function SceneEditModal({
  isOpen,
  scene,
  index,
  onClose,
  onSave,
  onConfirm,
}: Props) {
  const state = useOverlayState({
    isOpen,
    onOpenChange: (open) => {
      if (!open) onClose();
    },
  });

  const [draft, setDraft] = useState<Partial<StoryboardScene>>({});

  useEffect(() => {
    if (scene) {
      setDraft({
        title: scene.title,
        visual: scene.visual,
        narration: scene.narration,
        imagePrompt: scene.imagePrompt || scene.visual,
        durationSec: scene.durationSec,
        transitionOut: scene.transitionOut,
      });
    }
  }, [scene]);

  useEffect(() => {
    if (isOpen) state.open();
    else state.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!scene) return null;

  return (
    <Modal state={state}>
      <Modal.Backdrop isDismissable>
        <Modal.Container size="lg" placement="center" scroll="inside">
          <Modal.Dialog className="max-h-[90vh]">
            <Modal.Header className="border-b border-border">
              <div>
                <Modal.Heading>
                  Cena {String(index + 1).padStart(2, "0")} · editar
                </Modal.Heading>
                <p className="text-xs text-muted mt-0.5">
                  Ajuste visual, VO e prompt de still
                </p>
              </div>
              <Modal.CloseTrigger />
            </Modal.Header>
            <Modal.Body className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label>Título / SHOT</Label>
                <Input
                  fullWidth
                  value={draft.title || ""}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, title: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>ACTION · visual</Label>
                <TextArea
                  fullWidth
                  className="min-h-[80px]"
                  value={draft.visual || ""}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, visual: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>VO · narração</Label>
                <TextArea
                  fullWidth
                  className="min-h-[64px]"
                  value={draft.narration || ""}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, narration: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Prompt de imagem (regen)</Label>
                <TextArea
                  fullWidth
                  className="min-h-[72px]"
                  value={draft.imagePrompt || ""}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, imagePrompt: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Duração (s)</Label>
                  <Input
                    type="number"
                    min={3}
                    max={30}
                    fullWidth
                    value={String(draft.durationSec ?? 6)}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        durationSec: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Transição out</Label>
                  <select
                    className={fieldClass}
                    value={draft.transitionOut || "cut"}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        transitionOut: e.target.value as TransitionType,
                      }))
                    }
                  >
                    {TRANSITIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer className="border-t border-border flex flex-wrap gap-2 justify-end">
              <Button variant="secondary" onPress={onClose}>
                Cancelar
              </Button>
              <Button
                variant="secondary"
                onPress={() => {
                  onSave(draft);
                  onClose();
                }}
              >
                Salvar rascunho
              </Button>
              <Button
                variant="primary"
                onPress={() => {
                  onSave({ ...draft, confirmed: true });
                  onConfirm();
                  onClose();
                }}
              >
                Salvar e confirmar
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
