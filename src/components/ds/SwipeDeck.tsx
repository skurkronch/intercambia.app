"use client";

import { useImperativeHandle, useLayoutEffect, useRef, type KeyboardEvent, type PointerEvent, type Ref } from "react";
import type { SwipeAction } from "@/lib/types";
import { Icon, type IconName } from "./Icon";
import { ItemCard, type DeckItem } from "./ItemCard";

// Spring and decision thresholds from the design system (Movimiento).
const SPRING = { k: 420, c: 30, m: 1 };
const DECIDE_RATIO = 0.35;
const DECIDE_VELOCITY = 0.6; // px/ms
const TAP_PX = 6;
const TAP_MS = 350;

export interface DeckHandle {
  fly: (action: SwipeAction) => void;
}

interface Props {
  items: DeckItem[];
  onSwipe: (action: SwipeAction, item: DeckItem) => void;
  onOpen?: (item: DeckItem) => void;
  onUndo?: () => void;
  canUndo?: boolean;
  deckRef?: Ref<DeckHandle>;
}

interface Motion {
  x: number; y: number; vx: number; vy: number;
  drag: boolean; busy: boolean; raf: number;
  px: number; py: number; t: number; lx: number; ly: number;
  sx: number; sy: number; st: number;
}

export function SwipeDeck({ items, onSwipe, onOpen, onUndo, canUndo, deckRef }: Props) {
  const cardRef = useRef<HTMLElement>(null);
  const m = useRef<Motion>({ x: 0, y: 0, vx: 0, vy: 0, drag: false, busy: false, raf: 0, px: 0, py: 0, t: 0, lx: 0, ly: 0, sx: 0, sy: 0, st: 0 });
  const top = items[0];

  function paint() {
    const el = cardRef.current;
    if (!el) return;
    const o = m.current;
    const rot = Math.max(-15, Math.min(15, o.x / 20));
    el.style.transform = `translate(${o.x}px, ${o.y}px) rotate(${rot}deg)`;
    const level = {
      want: Math.max(0, Math.min(1, o.x / 110)),
      pass: Math.max(0, Math.min(1, -o.x / 110)),
      save: Math.max(0, Math.min(1, (o.y - Math.abs(o.x)) / 110)),
    };
    el.querySelectorAll<HTMLElement>("[data-stamp]").forEach((n) => (n.style.opacity = String(level[n.dataset.stamp as SwipeAction])));
    el.querySelectorAll<HTMLElement>("[data-glow]").forEach((n) => (n.style.opacity = String(level[n.dataset.glow as SwipeAction])));
  }

  function springTo(tx: number, ty: number) {
    const o = m.current;
    cancelAnimationFrame(o.raf);
    let prev: number | null = null;
    const step = (now: number) => {
      const dt = prev === null ? 1 / 60 : Math.min(0.032, (now - prev) / 1000);
      prev = now;
      const ax = (-SPRING.k * (o.x - tx) - SPRING.c * o.vx) / SPRING.m;
      const ay = (-SPRING.k * (o.y - ty) - SPRING.c * o.vy) / SPRING.m;
      o.vx += ax * dt; o.vy += ay * dt; o.x += o.vx * dt; o.y += o.vy * dt;
      paint();
      if (Math.abs(o.x - tx) < 0.5 && Math.abs(o.y - ty) < 0.5 && Math.abs(o.vx) < 5 && Math.abs(o.vy) < 5) {
        o.x = tx; o.y = ty; o.vx = 0; o.vy = 0; paint();
        return;
      }
      o.raf = requestAnimationFrame(step);
    };
    o.raf = requestAnimationFrame(step);
  }

  function fly(action: SwipeAction) {
    const o = m.current;
    const item = items[0];
    if (o.busy || !item) return;
    o.busy = true;
    cancelAnimationFrame(o.raf);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const W = cardRef.current?.offsetWidth ?? 340;
    const tx = action === "want" ? W * 1.6 : action === "pass" ? -W * 1.6 : o.x;
    const ty = action === "save" ? 900 : o.y + 40;
    const start = { x: o.x, y: o.y };
    let t0: number | null = null;
    const dur = reduced ? 150 : 320;
    const step = (now: number) => {
      t0 ??= now;
      const k = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - k, 2);
      o.x = start.x + (tx - start.x) * e;
      o.y = start.y + (ty - start.y) * e;
      paint();
      if (cardRef.current && reduced) cardRef.current.style.opacity = String(1 - k);
      if (k < 1) {
        o.raf = requestAnimationFrame(step);
        return;
      }
      Object.assign(o, { x: 0, y: 0, vx: 0, vy: 0, busy: false });
      onSwipe(action, item);
    };
    o.raf = requestAnimationFrame(step);
  }

  useImperativeHandle(deckRef, () => ({ fly }));

  // A new top card starts centered and without stamps.
  useLayoutEffect(() => {
    if (cardRef.current) cardRef.current.style.opacity = "";
    paint();
  }, [top?.key]);

  function down(e: PointerEvent) {
    const o = m.current;
    if (o.busy || e.button > 0) return;
    cancelAnimationFrame(o.raf);
    // Pointer event timestamps share performance.now()'s timebase.
    Object.assign(o, { drag: true, px: e.clientX - o.x, py: e.clientY - o.y, t: e.timeStamp, lx: e.clientX, ly: e.clientY, sx: e.clientX, sy: e.clientY, st: e.timeStamp });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function move(e: PointerEvent) {
    const o = m.current;
    if (!o.drag) return;
    const now = e.timeStamp;
    const dt = Math.max(1, now - o.t);
    o.vx = ((e.clientX - o.lx) / dt) * 1000;
    o.vy = ((e.clientY - o.ly) / dt) * 1000;
    Object.assign(o, { t: now, lx: e.clientX, ly: e.clientY, x: e.clientX - o.px, y: e.clientY - o.py });
    paint();
  }

  function up(e: PointerEvent) {
    const o = m.current;
    if (!o.drag) return;
    o.drag = false;
    const moved = Math.abs(e.clientX - o.sx) + Math.abs(e.clientY - o.sy);
    if (moved < TAP_PX && e.timeStamp - o.st < TAP_MS) {
      springTo(0, 0);
      if (onOpen && items[0]) onOpen(items[0]);
      return;
    }
    const W = cardRef.current?.offsetWidth ?? 340;
    const H = cardRef.current?.offsetHeight ?? 460;
    const vx = o.vx / 1000;
    const vy = o.vy / 1000;
    if (o.y > Math.abs(o.x) && (o.y > H * 0.3 || vy > DECIDE_VELOCITY)) return fly("save");
    if (o.x > W * DECIDE_RATIO || vx > DECIDE_VELOCITY) return fly("want");
    if (o.x < -W * DECIDE_RATIO || vx < -DECIDE_VELOCITY) return fly("pass");
    springTo(0, 0);
  }

  function onKey(e: KeyboardEvent) {
    const map: Record<string, SwipeAction> = { ArrowRight: "want", ArrowLeft: "pass", ArrowDown: "save" };
    if (map[e.key]) {
      e.preventDefault();
      fly(map[e.key]);
    } else if ((e.key === "Enter" || e.key === " ") && onOpen && items[0]) {
      e.preventDefault();
      onOpen(items[0]);
    }
  }

  const visible = items.slice(0, 3);

  return (
    <div className="tx-deck">
      <div
        className="tx-deck-stack"
        tabIndex={0}
        onKeyDown={onKey}
        aria-label="Objetos para intercambiar. Flecha derecha: lo quiero. Flecha izquierda: paso. Flecha abajo: guardar. Enter: ver detalle."
      >
        {visible
          .map((item, i) => (
            <ItemCard
              key={item.key}
              item={item}
              top={i === 0}
              withStamps={i === 0}
              cardRef={i === 0 ? cardRef : undefined}
              handlers={i === 0 ? { onPointerDown: down, onPointerMove: move, onPointerUp: up, onPointerCancel: up } : undefined}
              style={
                i === 0
                  ? { touchAction: "none", zIndex: 3 }
                  : { transform: `translateY(${i * 8}px) scale(${1 - i * 0.04})`, transition: "transform .35s cubic-bezier(.34,1.56,.64,1)", zIndex: 3 - i }
              }
            />
          ))
          .reverse()}
      </div>
      <div className="tx-actionbar">
        <ActionButton action="undo" icon="undo" label="Deshacer" small disabled={!canUndo} onClick={onUndo} />
        <ActionButton action="pass" icon="x" label="Paso" onClick={() => fly("pass")} disabled={!top} />
        <ActionButton action="save" icon="star" label="Guardar o Súper‑Trueque" small onClick={() => fly("save")} disabled={!top} fill />
        <ActionButton action="want" icon="heart" label="Lo quiero" onClick={() => fly("want")} disabled={!top} fill />
      </div>
    </div>
  );
}

function ActionButton({ action, icon, label, small, fill, disabled, onClick }: {
  action: string; icon: IconName; label: string; small?: boolean; fill?: boolean; disabled?: boolean; onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className={`tx-action tx-action-${action}${small ? " tx-action-sm" : ""}`}
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
    >
      <Icon name={icon} weight={fill ? "fill" : "bold"} />
    </button>
  );
}
