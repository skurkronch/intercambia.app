"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Icon } from "@/components/ds/Icon";
import type { DeckItem } from "@/components/ds/ItemCard";
import { Photo } from "@/components/ds/Photo";
import { SwipeDeck, type DeckHandle } from "@/components/ds/SwipeDeck";
import { XLoader, XMark } from "@/components/ds/XMark";
import { Button, Chip } from "@/components/ds/primitives";
import { ListingInfo } from "@/components/listing/ListingDetail";
import { Sheet } from "@/components/Sheet";
import { CURRENT_USER_LOCATION } from "@/lib/data/seed";
import { DISTANCE_OPTIONS, distanceKm, formatDistance, withinDistance, type DistanceFilter } from "@/lib/geo";
import { isOnWishlist, wantsWhatIOffer } from "@/lib/match";
import { useMounted, useStore, type FeedMode } from "@/lib/store";
import type { Listing, Sponsor, User } from "@/lib/types";

const MODES: { value: FeedMode; label: string }[] = [
  { value: "todo", label: "Mostrar todo" },
  { value: "busco", label: "Solo lo que busco" },
  { value: "ofrezco", label: "Buscan lo que ofrezco" },
];

// Sponsors: at most one every 5 listings, never in the first 3, never two in a row.
const SPONSOR_EVERY = 5;

export function Discover({ listings, users, sponsors, wishlist }: { listings: Listing[]; users: User[]; sponsors: Sponsor[]; wishlist: string[] }) {
  const mounted = useMounted();
  const deck = useRef<DeckHandle>(null);
  const [open, setOpen] = useState<Extract<DeckItem, { kind: "listing" }> | null>(null);

  const swipes = useStore((s) => s.swipes);
  const myListings = useStore((s) => s.myListings);
  const mode = useStore((s) => s.feedMode);
  const distance = useStore((s) => s.distance);
  const { swipe, undo, want, save, setFeedMode, setDistance, resetDeck } = useStore.getState();

  const userById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);

  const sequence = useMemo<DeckItem[]>(() => {
    const here = CURRENT_USER_LOCATION;
    const filtered = listings
      .filter((l) => withinDistance(here, l.location, distance))
      .filter((l) => (mode === "busco" ? isOnWishlist(l, wishlist) : mode === "ofrezco" ? wantsWhatIOffer(l, myListings) : true))
      .sort((a, b) => (a.location ? distanceKm(here, a.location) : 1e6) - (b.location ? distanceKm(here, b.location) : 1e6));
    const out: DeckItem[] = [];
    let s = 0;
    filtered.forEach((l, i) => {
      out.push({ kind: "listing", key: l.id, listing: l, owner: userById.get(l.ownerId), distance: formatDistance(here, l.location) });
      if ((i + 1) % SPONSOR_EVERY === 0 && i + 1 < filtered.length && sponsors.length) {
        const sp = sponsors[s++ % sponsors.length];
        out.push({ kind: "sponsor", key: `sponsor:${sp.id}:${i}`, sponsor: sp });
      }
    });
    return out;
  }, [listings, distance, mode, wishlist, myListings, sponsors, userById]);

  const swiped = useMemo(() => new Set(swipes.map((x) => x.key)), [swipes]);
  const items = sequence.filter((it) => !swiped.has(it.key));
  const saved = swipes.filter((x) => x.action === "save").map((x) => listings.find((l) => l.id === x.key)).filter(Boolean) as Listing[];
  const offering = myListings.filter((l) => l.status === "activo");

  if (!mounted) {
    return <div className="discover-loading"><XLoader /></div>;
  }

  return (
    <div className="discover">
      <aside className="discover-filters" aria-label="Filtros">
        <h1 className="title-lg discover-title">Descubre</h1>
        <div className="filter-row" role="radiogroup" aria-label="Qué mostrar">
          {MODES.map((m) => (
            <Chip key={m.value} selected={mode === m.value} onClick={() => setFeedMode(m.value)}>{m.label}</Chip>
          ))}
        </div>
        <label className="distance-field">
          <Icon name="pin" />
          <span className="sr-only">Distancia</span>
          <select value={distance} onChange={(e) => setDistance(e.target.value as DistanceFilter)} id="distance">
            {DISTANCE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.value === "nacional" ? o.label : `Hasta ${o.label}`}</option>
            ))}
          </select>
        </label>
        <p className="discover-hint">
          {mode === "busco" && `Buscando: ${wishlist.join(", ")}.`}
          {mode === "ofrezco" && "Personas que quieren algo de lo que ofreces: aquí el match es más probable."}
          {mode === "todo" && "Desliza a la derecha si lo quieres. Toca la tarjeta para ver más."}
        </p>
      </aside>

      <section className="discover-deck" aria-label="Objetos">
        {items.length ? (
          <SwipeDeck
            items={items}
            deckRef={deck}
            canUndo={swipes.length > 0}
            onUndo={undo}
            onOpen={(it) => it.kind === "listing" && setOpen(it)}
            onSwipe={(action, it) => {
              swipe(it.key, action);
              if (it.kind !== "listing") return;
              if (action === "want") want(it.listing);
              if (action === "save") save(it.listing);
            }}
          />
        ) : (
          <div className="tx-empty">
            <div className="tx-empty-art"><XMark size={48} tone="mono" /></div>
            <h2 className="tx-empty-title">Ya viste todo por aquí</h2>
            <p className="tx-empty-body">
              {distance !== "nacional" ? "Amplía la distancia para ver objetos de otras zonas." : "Vuelve más tarde: cada día se suben objetos nuevos."}
            </p>
            {distance !== "nacional" ? (
              <Button onClick={() => setDistance("nacional")}>Ver todo el país</Button>
            ) : (
              <Button variant="secondary" icon="undo" onClick={resetDeck}>Volver a ver los que pasé</Button>
            )}
          </div>
        )}
      </section>

      <aside className="discover-side" aria-label="Tu actividad">
        <section>
          <h2 className="title-sm">Lo que ofreces</h2>
          {offering.length ? (
            <ul className="mini-list">
              {offering.map((l) => (
                <li key={l.id} className="mini-row">
                  <span className="mini-thumb"><Photo src={l.photos[0]} alt="" category={l.category} label={false} sizes="48px" /></span>
                  <span className="mini-title">{l.title}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">Sube un objeto para que te encuentren.</p>
          )}
          <Link href="/publicar" className="link-more">Subir objeto <Icon name="next" /></Link>
        </section>
        <section>
          <h2 className="title-sm">Guardados</h2>
          {saved.length ? (
            <ul className="mini-list">
              {saved.map((l) => (
                <li key={l.id}>
                  <Link href={`/objeto/${l.slug}`} className="mini-row">
                    <span className="mini-thumb"><Photo src={l.photos[0]} alt="" category={l.category} label={false} sizes="48px" /></span>
                    <span className="mini-title">{l.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">Desliza hacia abajo o toca la estrella para guardar.</p>
          )}
        </section>
      </aside>

      <Sheet
        open={!!open}
        onClose={() => setOpen(null)}
        label={open?.listing.title ?? "Detalle"}
        footer={
          open && (
            <div className="sheet-actions">
              <Button variant="secondary" icon="x" onClick={() => { setOpen(null); deck.current?.fly("pass"); }}>Paso</Button>
              <Button icon="heart" onClick={() => { setOpen(null); deck.current?.fly("want"); }}>Lo quiero</Button>
            </div>
          )
        }
      >
        {open && (
          <>
            <div className="sheet-photo">
              <Photo src={open.listing.photos[0]} alt={open.listing.title} category={open.listing.category} />
            </div>
            <ListingInfo listing={open.listing} owner={open.owner} distance={open.distance} headingLevel={2} />
            <Link href={`/objeto/${open.listing.slug}`} className="link-more">Abrir página del objeto <Icon name="next" /></Link>
          </>
        )}
      </Sheet>
    </div>
  );
}
