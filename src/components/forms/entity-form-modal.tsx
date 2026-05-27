"use client";

import type { ReactNode } from "react";
import { Modal, Btn } from "@/components/erp/ui";
import { FormError } from "./field";

type EntityFormModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  sub?: string;
  wide?: boolean;
  children: ReactNode;
  submitLabel: string;
  onSubmit: () => void | Promise<void>;
  saving?: boolean;
  error?: string | null;
  secondaryLabel?: string;
  onSecondary?: () => void | Promise<void>;
};

export function EntityFormModal({
  open,
  onClose,
  title,
  sub,
  wide,
  children,
  submitLabel,
  onSubmit,
  saving,
  error,
  secondaryLabel,
  onSecondary,
}: EntityFormModalProps) {
  const handleSubmit = async () => {
    try {
      await onSubmit();
    } catch {
      /* mutation hook sets error */
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      sub={sub}
      wide={wide}
      footer={
        <>
          <Btn variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Btn>
          {secondaryLabel && onSecondary ? (
            <Btn variant="ghost" onClick={onSecondary} disabled={saving}>
              {secondaryLabel}
            </Btn>
          ) : null}
          <Btn variant="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving…" : submitLabel}
          </Btn>
        </>
      }
    >
      {children}
      <FormError message={error ?? null} />
    </Modal>
  );
}
