"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "./ds/Icon";

/** Bottom sheet on phones, centered panel on desktop. Escape or the backdrop closes it. */
export function Sheet({ open, onClose, label, children, footer }: {
  open: boolean; onClose: () => void; label: string; children: ReactNode; footer?: ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      prev?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={label} ref={panel} tabIndex={-1} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="sheet-close" onClick={onClose} aria-label="Cerrar">
          <Icon name="x" />
        </button>
        <div className="sheet-body">{children}</div>
        {footer && <div className="sheet-foot">{footer}</div>}
      </div>
    </div>
  );
}
