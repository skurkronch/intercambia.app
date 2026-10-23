import Link from "next/link";
import { Fragment } from "react";
import { conditionLabel, getCategory, getCity } from "@/lib/data/catalog";
import { formatValue } from "@/lib/format";
import type { Listing } from "@/lib/types";
import { AdSlot } from "../AdSlot";
import { Icon } from "../ds/Icon";
import { Photo } from "../ds/Photo";

/** Compact listing for grids: photo, title, place, reference value. */
export function ListingTile({ listing: l, priority }: { listing: Listing; priority?: boolean }) {
  const city = getCity(l.citySlug);
  const value = formatValue(l.value, l.currency);
  return (
    <Link href={`/objeto/${l.slug}`} className="tile">
      <div className="tile-photo">
        <Photo src={l.photos[0]} alt={l.title} category={l.category} sizes="(max-width: 640px) 50vw, 240px" priority={priority} label={false} />
        <span className="tx-chip tx-chip-surface tile-cond">{conditionLabel(l.condition)}</span>
      </div>
      <div className="tile-body">
        <h3 className="tile-title">{l.title}</h3>
        <p className="tile-meta">
          <Icon name="pin" /> {[l.neighborhood, city?.short].filter(Boolean).join(", ")}
        </p>
        <p className="tile-foot">
          <span className="tile-cat">{getCategory(l.category)?.name}</span>
          {value && <span className="tile-value">{value}</span>}
        </p>
      </div>
    </Link>
  );
}

/** Responsive grid; inserts one fixed ad row after `adAfter` tiles when there are enough. */
export function ListingGrid({ listings, adAfter, priorityCount = 0 }: { listings: Listing[]; adAfter?: number; priorityCount?: number }) {
  return (
    <div className="grid">
      {listings.map((l, i) => (
        <Fragment key={l.id}>
          <ListingTile listing={l} priority={i < priorityCount} />
          {adAfter && i === adAfter - 1 && listings.length > adAfter && <AdSlot placement="grid-inline" className="grid-ad" />}
        </Fragment>
      ))}
    </div>
  );
}
