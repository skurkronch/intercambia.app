"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { undoSwipe } from "@/app/actions";
import { Icon } from "@/components/ds/Icon";
import { Photo } from "@/components/ds/Photo";
import type { Listing } from "@/lib/types";

/** What I saved from Descubre or a listing page, with a way to let go. */
export function SavedList({ listings: initial }: { listings: Listing[] }) {
  const [listings, setListings] = useState(initial);
  const [, start] = useTransition();

  if (!listings.length) {
    return <p className="muted">Desliza hacia abajo en Descubre o toca Guardar en un objeto para tenerlo aquí.</p>;
  }

  return (
    <ul className="hscroll">
      {listings.map((l) => (
        <li key={l.id} className="mine-card">
          <Link href={`/objeto/${l.slug}`} className="mine-photo">
            <Photo src={l.photos[0]} alt={l.title} category={l.category} label={false} sizes="160px" />
          </Link>
          <p className="mine-title">{l.title}</p>
          <button
            type="button"
            className="link-button saved-remove"
            onClick={() => {
              setListings((cur) => cur.filter((x) => x.id !== l.id));
              start(() => undoSwipe(l.id));
            }}
          >
            <Icon name="x" /> Quitar
          </button>
        </li>
      ))}
    </ul>
  );
}
