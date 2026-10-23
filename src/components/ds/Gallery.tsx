"use client";

import { useRef, useState } from "react";
import type { CategorySlug } from "@/lib/types";
import { Icon } from "./Icon";
import { Photo } from "./Photo";

/** All of a listing's photos: swipe on touch (scroll snap), arrows with a mouse. */
export function Gallery({ photos, alt, category, priority, sizes }: {
  photos: string[]; alt: string; category: CategorySlug; priority?: boolean; sizes?: string;
}) {
  const strip = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  if (photos.length <= 1) return <Photo src={photos[0]} alt={alt} category={category} priority={priority} sizes={sizes} />;

  const go = (to: number) => {
    const el = strip.current;
    if (!el) return;
    const next = Math.max(0, Math.min(photos.length - 1, to));
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
  };

  return (
    <>
      <div
        className="gallery"
        ref={strip}
        role="group"
        aria-label={`Fotos de ${alt}`}
        onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
      >
        {photos.map((src, i) => (
          <div key={src} className="gallery-slide">
            <Photo src={src} alt={`${alt}, foto ${i + 1} de ${photos.length}`} category={category} priority={priority && i === 0} sizes={sizes} />
          </div>
        ))}
      </div>
      <span className="gallery-count" aria-live="polite">{index + 1}/{photos.length}</span>
      <button type="button" className="gallery-arrow gallery-prev" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Foto anterior">
        <Icon name="back" />
      </button>
      <button type="button" className="gallery-arrow gallery-next" onClick={() => go(index + 1)} disabled={index === photos.length - 1} aria-label="Foto siguiente">
        <Icon name="next" />
      </button>
    </>
  );
}
