"use client";

import { useId } from "react";
import { XMARK_SVG, type XMarkTone } from "./xmark-svg";

/** The isotype: lime and violet cards crossing, with the cyan core where they meet. */
export function XMark({ size = 32, tone, title, className }: { size?: number; tone?: XMarkTone; title?: string; className?: string }) {
  const id = "x" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const t: XMarkTone = tone ?? (size < 40 ? "flat" : "3d");
  return (
    <svg
      className={className ? `tx-mark ${className}` : "tx-mark"}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      dangerouslySetInnerHTML={{ __html: XMARK_SVG[t].split("§").join(id) }}
    />
  );
}

export function Wordmark({ size = 24, layout = "horizontal", mark = true }: { size?: number; layout?: "horizontal" | "vertical"; mark?: boolean }) {
  const vertical = layout === "vertical";
  return (
    <span className={vertical ? "tx-wordmark tx-wordmark-v" : "tx-wordmark"} style={{ fontSize: size }} role="img" aria-label="truXanger">
      {mark && <XMark size={Math.round(size * (vertical ? 3.4 : 1.25))} />}
      <span aria-hidden="true">
        tru<span className="tx-x">X</span>anger
      </span>
    </span>
  );
}

export function XLoader({ size = 48, label = "Buscando trueques cerca…" }: { size?: number; label?: string | null }) {
  return (
    <div className="tx-loader" role="status">
      <XMark size={size} />
      {label !== null && <span>{label}</span>}
    </div>
  );
}
