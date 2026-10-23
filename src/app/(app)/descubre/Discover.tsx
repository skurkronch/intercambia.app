"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
import { resetPasses, swipeListing, undoSwipe, type SwipeResult } from "@/app/actions";
import { Icon } from "@/components/ds/Icon";
import type { DeckItem } from "@/components/ds/ItemCard";
import { Photo } from "@/components/ds/Photo";
import { SwipeDeck, type DeckHandle } from "@/components/ds/SwipeDeck";
import { XLoader, XMark } from "@/components/ds/XMark";
import { Button, ButtonLink, Chip } from "@/components/ds/primitives";
import { ListingInfo } from "@/components/listing/ListingDetail";
import { Sheet } from "@/components/Sheet";
import { DISTANCE_OPTIONS, distanceKm, formatDistance, withinDistance, type DistanceFilter } from "@/lib/geo";
import { isOnWishlist, wantsWhatIOffer } from "@/lib/match";
import { useMounted, useStore, type FeedMode } from "@/lib/store";
import type { GeoPoint, Listing, Sponsor, SwipeAction, User } from "@/lib/types";

const MODES: { value: FeedMode; label: string }[] = [
  { value: "todo", label: "Mostrar todo" },
  { value: "busco", label: "Solo lo que busco" },
  { value: "ofrezco", label: "Buscan lo que ofrezco" },
];

// Sponsors: at most one every 5 listings, never in the first 3, never two in a row.
const SPONSOR_EVERY = 5;

export function Discover({ listings, owners, sponsors, wishlist, myListings, here, initialSaved }: {
  listings: Listing[]; owners: User[]; sponsors: Sponsor[]; wishlist: string[];
  myListings: Listing[]; here: GeoPoint | null; initialSaved: Listing[];
}) {
  const mounted = useMounted();
  const router = useRouter();
  const deck = useRef<DeckHandle>(null);
  const [open, setOpen] = useState<Extract<DeckItem, { kind: "listing" }> | null>(null);
  const [swiped, setSwiped] = useState<{ key: string; action: SwipeAction; listingId?: string }[]>([]);
  const [saved, setSaved] = useState(initialSaved);
  const [resetting, startReset] = useTransition();

  const mode = useStore((s) => s.feedMode);
  const distance = useStore((s) => s.distance);
  const { setFeedMode, setDistance, showMoment, showToast } = useStore.getState();

  const ownerById = useMemo(() => new Map(owners.map((u) => [u.id, u])), [owners]);
  const offering = myListings.filter((l) => l.status === "activo");

  const sequence = useMemo<DeckItem[]>(() => {
    const filtered = listings
      .filter((l) => !here || withinDistance(here, l.location, distance))
      .filter((l) => (mode === "busco" ? isOnWishlist(l, wishlist) : mode === "ofrezco" ? wantsWhatIOffer(l, myListings) : true))
      .sort((a, b) => (here && a.location ? distanceKm(here, a.location) : 1e6) - (here && b.location ? distanceKm(here, b.location) : 1e6));
    const out: DeckItem[] = [];
    let s = 0;
    filtered.forEach((l, i) => {
      out.push({ kind: "listing", key: l.id, listing: l, owner: ownerById.get(l.ownerId), distance: formatDistance(here, l.location) });
      if ((i + 1) % SPONSOR_EVERY === 0 && i + 1 < filtered.length && sponsors.length) {
        const sp = sponsors[s++ % sponsors.length];
        out.push({ kind: "sponsor", key: `sponsor:${sp.id}:${i}`, sponsor: sp });
      }
    });
    return out;
  }, [listings, here, distance, mode, wishlist, myListings, sponsors, ownerById]);

  const gone = useMemo(() => new Set(swiped.map((x) => x.key)), [swiped]);
  const items = sequence.filter((it) => !gone.has(it.key));

  function handle(result: SwipeResult) {
    switch (result.kind) {
      case "auth":
        router.push("/entrar?next=/descubre");
        break;
      case "match":
        showMoment({ kind: "match", conversationId: result.conversationId, mine: result.mine, theirs: result.theirs, otherName: result.otherName });
        break;
      case "interest":
        showToast(
          result.hasOffer
            ? `Guardamos tu interés. Si a ${result.ownerName} le late algo tuyo, se abre el chat.`
            : "Sube un objeto para que pueda haber match. Lo que ofreces es la otra mitad del trueque.",
        );
        break;
    }
  }

  function onSwipe(action: SwipeAction, item: DeckItem) {
    const listingId = item.kind === "listing" ? item.listing.id : undefined;
    setSwiped((s) => [...s, { key: item.key, action, listingId }]);
    if (item.kind !== "listing") return;
    if (action === "save") setSaved((s) => [item.listing, ...s]);
    swipeListing(item.listing.id, action)
      .then(handle)
      .catch(() => showToast("Se nos cruzaron los cables. Inténtalo de nuevo."));
  }

  function onUndo() {
    const last = swiped[swiped.length - 1];
    if (!last) return;
    setSwiped((s) => s.slice(0, -1));
    if (last.listingId) {
      setSaved((s) => s.filter((l) => l.id !== last.listingId));
      void undoSwipe(last.listingId);
    }
  }

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
          {mode === "busco" && (wishlist.length ? `Buscando: ${wishlist.join(", ")}.` : "Agrega en tu perfil qué estás buscando.")}
          {mode === "ofrezco" && "Personas que quieren algo de lo que ofreces: aquí el match es más probable."}
          {mode === "todo" && "Desliza a la derecha si lo quieres. Toca la tarjeta para ver más."}
        </p>
      </aside>

      <section className="discover-deck" aria-label="Objetos">
        {items.length ? (
          <SwipeDeck
            items={items}
            deckRef={deck}
            canUndo={swiped.length > 0}
            onUndo={onUndo}
            onOpen={(it) => it.kind === "listing" && setOpen(it)}
            onSwipe={onSwipe}
          />
        ) : (
          <div className="tx-empty">
            <div className="tx-empty-art"><XMark size={48} tone="mono" /></div>
            <h2 className="tx-empty-title">{listings.length ? "Ya viste todo por aquí" : "Nadie por aquí aún"}</h2>
            <p className="tx-empty-body">
              {!listings.length
                ? "Sé de los primeros: sube algo y encendemos la chispa."
                : distance !== "nacional"
                  ? "Amplía la distancia para ver objetos de otras zonas."
                  : mode !== "todo"
                    ? "Prueba con «Mostrar todo»."
                    : "Vuelve más tarde: cada día se suben objetos nuevos."}
            </p>
            {!listings.length ? (
              <ButtonLink href="/publicar" icon="plus">Subir objeto</ButtonLink>
            ) : distance !== "nacional" ? (
              <Button onClick={() => setDistance("nacional")}>Ver todo el país</Button>
            ) : mode !== "todo" ? (
              <Button onClick={() => setFeedMode("todo")}>Mostrar todo</Button>
            ) : (
              <Button
                variant="secondary"
                icon="undo"
                disabled={resetting}
                onClick={() => startReset(async () => { await resetPasses(); setSwiped([]); router.refresh(); })}
              >
                Volver a ver los que pasé
              </Button>
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
                <li key={l.id}>
                  <Link href={`/objeto/${l.slug}`} className="mini-row">
                    <span className="mini-thumb"><Photo src={l.photos[0]} alt="" category={l.category} label={false} sizes="48px" /></span>
                    <span className="mini-title">{l.title}</span>
                  </Link>
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
