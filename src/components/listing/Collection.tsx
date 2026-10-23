import type { ReactNode } from "react";
import { Chip } from "../ds/primitives";
import { EmptyHint } from "./EmptyHint";
import { ListingGrid } from "./ListingTile";
import type { Listing } from "@/lib/types";

/** A browsable, indexable list page: heading, intro, related links and the grid. */
export function Collection({ eyebrow, title, intro, listings, related }: {
  eyebrow: string; title: string; intro: ReactNode; listings: Listing[];
  related: { href: string; label: string; icon?: Parameters<typeof Chip>[0]["icon"] }[];
}) {
  return (
    <div className="page">
      <header className="page-head">
        <p className="overline">{eyebrow}</p>
        <h1 className="title-lg">{title}</h1>
        <p className="page-intro">{intro}</p>
      </header>
      {listings.length ? <ListingGrid listings={listings} adAfter={8} priorityCount={4} /> : <EmptyHint />}
      {related.length > 0 && (
        <nav className="section" aria-label="Explora también">
          <h2 className="title-sm section-sub">Explora también</h2>
          <div className="chip-cloud">
            {related.map((r) => (
              <Chip key={r.href} href={r.href} icon={r.icon}>{r.label}</Chip>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
