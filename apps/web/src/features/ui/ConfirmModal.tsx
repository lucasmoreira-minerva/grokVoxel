"use client";

import { Button, Modal, useOverlayState } from "@heroui/react";
import { useEffect } from "react";

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
};

export function ConfirmModal({
  isOpen,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  danger,
  onConfirm,
}: Props) {
  const state = useOverlayState({
    isOpen,
    onOpenChange,
  });

  useEffect(() => {
    if (isOpen) state.open();
    else state.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <Modal state={state}>
      <Modal.Backdrop isDismissable>
        <Modal.Container size="sm" placement="center">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>{title}</Modal.Heading>
              <Modal.CloseTrigger />
            </Modal.Header>
            {description && (
              <Modal.Body>
                <p className="text-sm text-muted">{description}</p>
              </Modal.Body>
            )}
            <Modal.Footer className="flex gap-2 justify-end">
              <Button variant="secondary" onPress={() => onOpenChange(false)}>
                {cancelLabel}
              </Button>
              <Button
                variant={danger ? "danger" : "primary"}
                onPress={() => {
                  onConfirm();
                  onOpenChange(false);
                }}
              >
                {confirmLabel}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
