"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { swipeListing } from "@/app/actions";
import { useStore } from "@/lib/store";
import type { Listing } from "@/lib/types";
import { Button } from "../ds/primitives";

/** "Lo quiero" and "Guardar" on a listing page: a Match, an interest, or a nudge to sign in. */
export function WantActions({ listing }: { listing: Listing }) {
  const router = useRouter();
  const { showMoment, showToast } = useStore.getState();
  const [pending, start] = useTransition();
  const [done, setDone] = useState<"want" | "save" | "own" | null>(null);

  function act(action: "want" | "save") {
    start(async () => {
      try {
        const r = await swipeListing(listing.id, action);
        if (r.kind === "auth") return router.push(`/entrar?next=${encodeURIComponent(`/objeto/${listing.slug}`)}`);
        if (r.kind === "own") return setDone("own");
        setDone(action);
        if (r.kind === "match") showMoment({ kind: "match", conversationId: r.conversationId, mine: r.mine, theirs: r.theirs, otherName: r.otherName });
        else if (r.kind === "interest") showToast(r.hasOffer ? `Guardamos tu interés. Si a ${r.ownerName} le late algo tuyo, se abre el chat.` : "Sube un objeto para que pueda haber match.");
        else if (action === "save") showToast("Guardado. Lo encuentras en Descubre.");
      } catch {
        showToast("Se nos cruzaron los cables. Inténtalo de nuevo.");
      }
    });
  }

  if (done === "own") return <p className="detail-note">Es tu publicación.</p>;

  return (
    <div className="want-actions">
      <Button icon="heart" onClick={() => act("want")} disabled={pending || done === "want"}>
        {done === "want" ? "Interés enviado" : "Lo quiero"}
      </Button>
      <Button variant="secondary" icon="star" onClick={() => act("save")} disabled={pending || done === "save"}>
        {done === "save" ? "Guardado" : "Guardar"}
      </Button>
    </div>
  );
}
