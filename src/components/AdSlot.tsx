"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

// Automated ads (AdSense) only run on fixed slots in public pages and search,
// never in the swipe stack or the chat (design system: Publicidad).
const CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

const SLOT_IDS: Record<AdPlacement, string | undefined> = {
  "home-mid": process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME,
  "listing-rail": process.env.NEXT_PUBLIC_ADSENSE_SLOT_LISTING_RAIL,
  "listing-bottom": process.env.NEXT_PUBLIC_ADSENSE_SLOT_LISTING,
  "grid-inline": process.env.NEXT_PUBLIC_ADSENSE_SLOT_GRID,
  "search-top": process.env.NEXT_PUBLIC_ADSENSE_SLOT_SEARCH,
};

export type AdPlacement = "home-mid" | "listing-rail" | "listing-bottom" | "grid-inline" | "search-top";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * A fixed ad slot with reserved height (no layout shift). Without AdSense
 * configured, it shows a house ad selling the space directly.
 */
export function AdSlot({ placement, className }: { placement: AdPlacement; className?: string }) {
  const slot = SLOT_IDS[placement];
  const pushed = useRef(false);

  useEffect(() => {
    if (!CLIENT || !slot || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Blocked by an extension or not loaded yet; the reserved space stays empty.
    }
  }, [slot]);

  const cls = `ad-slot ad-${placement}${className ? ` ${className}` : ""}`;

  if (CLIENT && slot) {
    return (
      <aside className={cls} aria-label="Publicidad">
        <span className="overline ad-label">Publicidad</span>
        <ins className="adsbygoogle" style={{ display: "block" }} data-ad-client={CLIENT} data-ad-slot={slot} data-ad-format="auto" data-full-width-responsive="true" />
      </aside>
    );
  }

  return (
    <aside className={`${cls} ad-house`} aria-label="Publicidad">
      <span className="overline ad-label">Publicidad</span>
      <p className="ad-house-title">Tu marca frente a vecinos que intercambian</p>
      <p className="ad-house-body">Patrocina categorías o colonias en truXanger.</p>
      <Link href="/anunciate" className="tx-btn tx-btn-secondary tx-btn-sm">Anúnciate</Link>
    </aside>
  );
}
