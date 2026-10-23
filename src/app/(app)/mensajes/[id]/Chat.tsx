"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Icon } from "@/components/ds/Icon";
import { Photo } from "@/components/ds/Photo";
import { XLoader } from "@/components/ds/XMark";
import { Avatar, Button } from "@/components/ds/primitives";
import { Sheet } from "@/components/Sheet";
import { clockTime } from "@/lib/format";
import { lookup } from "@/lib/repo";
import { useMounted, useStore } from "@/lib/store";

export function Chat({ id }: { id: string }) {
  const mounted = useMounted();
  const conv = useStore((s) => s.conversations.find((c) => c.id === id));
  const myListings = useStore((s) => s.myListings);
  const { sendMessage, markRead, confirmTrade, closeTrade, rateTrade, showToast } = useStore.getState();
  const [text, setText] = useState("");
  const [menu, setMenu] = useState(false);
  // The rating sheet opens by itself once the trade closes, until dismissed.
  const [ratingDismissed, setRatingDismissed] = useState(false);
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conv?.unread) markRead(id);
  }, [conv?.unread, id, markRead]);

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [conv?.messages.length]);

  // Phase 3 replaces this with the other person's real confirmation over realtime.
  useEffect(() => {
    if (conv?.trade !== "confirmado-por-mi") return;
    const t = setTimeout(() => closeTrade(id), 1800);
    return () => clearTimeout(t);
  }, [conv?.trade, id, closeTrade]);

  if (!mounted) return <div className="discover-loading"><XLoader label={null} /></div>;
  if (!conv) {
    return (
      <div className="page page-narrow">
        <p>Este chat ya no existe.</p>
        <Link href="/mensajes" className="link-more">Volver a mensajes</Link>
      </div>
    );
  }

  const other = lookup.user(conv.otherUserId);
  const theirs = lookup.listing(conv.theirListingId);
  const mine = myListings.find((l) => l.id === conv.myListingId);
  const name = other?.displayName ?? "la otra persona";
  const rating = conv.trade === "cerrado" && !ratingDismissed;

  function onSend(e: FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    sendMessage(id, t);
    setText("");
  }

  return (
    <div className="chat">
      <header className="chat-head">
        <Link href="/mensajes" className="icon-btn" aria-label="Volver a mensajes"><Icon name="back" /></Link>
        <Avatar name={name} size={40} />
        <div className="chat-who">
          <p className="chat-name">{name}</p>
          {theirs && (
            <p className="chat-pair">
              {mine ? `${mine.title} × ` : ""}
              <Link href={`/objeto/${theirs.slug}`}>{theirs.title}</Link>
            </p>
          )}
        </div>
        <div className="menu-wrap">
          <button type="button" className="icon-btn" aria-label="Opciones" aria-expanded={menu} onClick={() => setMenu(!menu)}>
            <Icon name="more" />
          </button>
          {menu && (
            <ul className="menu" role="menu">
              <li role="none">
                <button type="button" role="menuitem" disabled={conv.trade !== "negociando"} onClick={() => { setMenu(false); confirmTrade(id); }}>
                  <Icon name="handshake" /> Confirmar trueque
                </button>
              </li>
              <li role="none">
                <button type="button" role="menuitem" onClick={() => { setMenu(false); showToast("Gracias. Revisaremos esta conversación."); }}>
                  <Icon name="info" /> Reportar
                </button>
              </li>
            </ul>
          )}
        </div>
      </header>

      <p className="chat-disclaimer">
        <Icon name="shield" /> truXanger no participa en la entrega. Vean el objeto en un lugar público antes de cerrar.
      </p>

      <div className="chat-log" role="log" aria-live="polite">
        {theirs && (
          <div className="chat-context">
            <span className="mini-thumb"><Photo src={theirs.photos[0]} alt="" category={theirs.category} label={false} sizes="48px" /></span>
            <span>Hablan sobre <b>{theirs.title}</b></span>
          </div>
        )}
        {conv.messages.map((m) => (
          <div key={m.id} className={`bubble-row from-${m.from}`}>
            <p className={`bubble bubble-${m.from}`}>{m.text}</p>
            {m.from !== "system" && <span className="bubble-time">{clockTime(m.at)}</span>}
          </div>
        ))}
        {conv.trade === "confirmado-por-mi" && <p className="bubble-row from-system"><span className="bubble bubble-system">Esperando a {name}…</span></p>}
        {conv.trade === "cerrado" && !rating && (
          <div className="bubble-row from-system">
            <Button variant="spark" size="sm" onClick={() => setRatingDismissed(false)}>Calificar a {name}</Button>
          </div>
        )}
        <div ref={end} />
      </div>

      <form className="chat-input" onSubmit={onSend}>
        <button type="button" className="icon-btn" aria-label="Adjuntar foto (pronto)" title="Pronto" disabled><Icon name="image" /></button>
        <button type="button" className="icon-btn" aria-label="Compartir punto de encuentro (pronto)" title="Pronto" disabled><Icon name="pin" /></button>
        <label htmlFor="msg" className="sr-only">Mensaje</label>
        <input id="msg" value={text} onChange={(e) => setText(e.target.value)} placeholder="Escribe un mensaje" autoComplete="off" />
        <button type="button" className="icon-btn" aria-label="Nota de voz (pronto)" title="Pronto" disabled><Icon name="mic" /></button>
        <button type="submit" className="send-btn" aria-label="Enviar" disabled={!text.trim()}><Icon name="send" weight="fill" /></button>
      </form>

      <Sheet
        open={rating}
        onClose={() => setRatingDismissed(true)}
        label={`Califica a ${name}`}
        footer={
          <Button
            block
            disabled={!stars}
            onClick={() => {
              rateTrade(id, stars);
            }}
          >
            Enviar calificación
          </Button>
        }
      >
        <div className="rate">
          <p className="overline">¡Trueque cerrado!</p>
          <h2 className="title-lg">¿Cómo te fue con {name}?</h2>
          <div className="stars" role="radiogroup" aria-label="Calificación">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" role="radio" aria-checked={stars === n} aria-label={`${n} de 5`} className={n <= stars ? "is-on" : undefined} onClick={() => setStars(n)}>
                <Icon name="star" weight={n <= stars ? "fill" : "bold"} />
              </button>
            ))}
          </div>
          <label className="field">
            <span className="field-label">Comentario <span className="field-optional">opcional</span></span>
            <textarea id="comment" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} maxLength={280} placeholder="¿Llegó a tiempo? ¿El objeto era como en las fotos?" />
          </label>
        </div>
      </Sheet>
    </div>
  );
}
