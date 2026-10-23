"use client";

import { useMounted, useStore } from "@/lib/store";
import type { Listing } from "@/lib/types";
import { Button } from "../ds/primitives";

/** "Lo quiero" and "Guardar" on a listing page: a Match or an interest ping. */
export function WantActions({ listing }: { listing: Listing }) {
  const mounted = useMounted();
  const want = useStore((s) => s.want);
  const save = useStore((s) => s.save);
  const swipe = useStore((s) => s.swipe);
  const sent = useStore((s) => s.interests.includes(listing.id));
  const isMine = useStore((s) => s.myListings.some((m) => m.id === listing.id));

  if (mounted && isMine) {
    return <p className="detail-note">Es tu publicación.</p>;
  }

  return (
    <div className="want-actions">
      <Button
        variant="primary"
        icon="heart"
        onClick={() => {
          swipe(listing.id, "want");
          want(listing);
        }}
        disabled={mounted && sent}
      >
        {mounted && sent ? "Interés enviado" : "Lo quiero"}
      </Button>
      <Button
        variant="secondary"
        icon="star"
        onClick={() => {
          swipe(listing.id, "save");
          save(listing);
        }}
      >
        Guardar
      </Button>
    </div>
  );
}
