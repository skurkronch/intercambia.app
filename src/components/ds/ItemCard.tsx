"use client";

import type { CSSProperties, PointerEventHandler, Ref } from "react";
import { topMaterial } from "@/lib/badges";
import { conditionLabel } from "@/lib/data/catalog";
import type { Listing, Sponsor, User } from "@/lib/types";
import { Coin } from "./Badge";
import { Icon } from "./Icon";
import { Photo } from "./Photo";
import { Avatar, Chip, Stamp } from "./primitives";

export type DeckItem =
  | { kind: "listing"; key: string; listing: Listing; owner?: User; distance: string }
  | { kind: "sponsor"; key: string; sponsor: Sponsor };

interface CardProps {
  item: DeckItem;
  top?: boolean;
  withStamps?: boolean;
  style?: CSSProperties;
  cardRef?: Ref<HTMLElement>;
  handlers?: {
    onPointerDown: PointerEventHandler;
    onPointerMove: PointerEventHandler;
    onPointerUp: PointerEventHandler;
    onPointerCancel: PointerEventHandler;
  };
}

/** Wants as one short line: "Consolas, audio o bicis". */
function wantsLine(l: Listing): string {
  if (l.openToAnything) return "Abierto a todo";
  const w = l.wants.slice(0, 3);
  return w.length > 1 ? `${w.slice(0, -1).join(", ")} o ${w[w.length - 1]}` : w[0] ?? "";
}

/** The stack card: full-bleed photo, text on the scrim in the bottom third. */
export function ItemCard({ item, top, withStamps, style, cardRef, handlers }: CardProps) {
  const cls = ["tx-card", top && "tx-top", item.kind === "sponsor" && "tx-sponsor"].filter(Boolean).join(" ");
  return (
    <article className={cls} style={style} ref={cardRef} {...handlers} aria-roledescription="tarjeta">
      {item.kind === "listing" ? <ListingFace item={item} top={top} /> : <SponsorFace sponsor={item.sponsor} />}
      {withStamps &&
        (["want", "pass", "save"] as const).map((a) => (
          <div key={a} className={`tx-card-stamp tx-s-${a}`} data-stamp={a}>
            <Stamp action={a} />
          </div>
        ))}
      {withStamps && (["want", "pass", "save"] as const).map((a) => <div key={`g${a}`} className={`tx-card-glow tx-g-${a}`} data-glow={a} />)}
    </article>
  );
}

function ListingFace({ item, top }: { item: Extract<DeckItem, { kind: "listing" }>; top?: boolean }) {
  const { listing: l, owner, distance } = item;
  const material = owner ? topMaterial(owner) : null;
  return (
    <>
      <Photo src={l.photos[0]} alt={l.title} category={l.category} priority={top} />
      <div className="tx-card-scrim" />
      <div className="tx-card-top">
        <Chip tone="surface" icon="swap" className="tx-wants"><span className="chip-text">Busca: {wantsLine(l)}</span></Chip>
        {l.superTrueque && <Chip tone="save" icon="star">Súper‑Trueque</Chip>}
      </div>
      <div className="tx-card-body">
        <div className="tx-card-row">
          <Chip tone="photo">{conditionLabel(l.condition)}</Chip>
          {(distance || l.neighborhood) && (
            <span className="tx-meta">
              <Icon name="pin" />
              {[distance, l.neighborhood].filter(Boolean).join(" · ")}
            </span>
          )}
        </div>
        <h3 className="tx-card-title">{l.title}</h3>
        {owner && (
          <div className="tx-owner">
            <Avatar name={owner.displayName} size={28} />
            <span className="tx-owner-name">{owner.displayName}</span>
            {material && <Coin material={material} icon="handshake" small label={`Insignia de ${material}`} />}
            <span className="tx-owner-rating">
              {owner.rating !== null ? <><Icon name="star" weight="fill" /> {owner.rating.toFixed(1)}</> : "Nuevo"}
            </span>
          </div>
        )}
      </div>
    </>
  );
}

function SponsorFace({ sponsor }: { sponsor: Sponsor }) {
  return (
    <>
      <Photo alt={sponsor.title} category={sponsor.category} label={false} />
      <div className="tx-card-scrim" />
      <div className="tx-card-top">
        <Chip tone="surface">Patrocinado</Chip>
      </div>
      <div className="tx-card-body">
        <span className="tx-sponsor-brand">{sponsor.brand}</span>
        <h3 className="tx-card-title">{sponsor.title}</h3>
        <p className="tx-sponsor-body">{sponsor.body}</p>
        <div>
          <a
            className="tx-btn tx-btn-secondary tx-btn-sm"
            href={sponsor.url}
            target="_blank"
            rel="sponsored noopener"
            onPointerDown={(e) => e.stopPropagation()}
          >
            {sponsor.cta}
          </a>
        </div>
      </div>
    </>
  );
}
