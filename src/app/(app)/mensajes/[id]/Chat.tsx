"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { confirmTrade, markConversationRead, rateTrade, sendMessage } from "@/app/actions";
import { Icon } from "@/components/ds/Icon";
import { Photo } from "@/components/ds/Photo";
import { Avatar, Button } from "@/components/ds/primitives";
import { Sheet } from "@/components/Sheet";
import { clockTime } from "@/lib/format";
import { useStore } from "@/lib/store";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Conversation, Message } from "@/lib/types";

interface MessageRow { id: number; sender_id: string | null; kind: Message["kind"]; body: string; created_at: string; read_at: string | null }
interface MatchRow { user_a: string; status: Conversation["status"]; confirmed_a: boolean; confirmed_b: boolean }

const fromRow = (r: MessageRow): Message => ({ id: r.id, senderId: r.sender_id, kind: r.kind, body: r.body, createdAt: r.created_at, readAt: r.read_at });

export function Chat({ conversation: c, initialMessages, meId, reviewed: initiallyReviewed }: {
  conversation: Conversation; initialMessages: Message[]; meId: string; reviewed: boolean;
}) {
  const { showMoment, showToast } = useStore.getState();
  const [messages, setMessages] = useState(initialMessages);
  const [status, setStatus] = useState(c.status);
  const [confirmedByMe, setConfirmedByMe] = useState(c.confirmedByMe);
  const [confirmedByOther, setConfirmedByOther] = useState(c.confirmedByOther);
  const [reviewed, setReviewed] = useState(initiallyReviewed);
  const [ratingDismissed, setRatingDismissed] = useState(false);
  const [text, setText] = useState("");
  const [menu, setMenu] = useState(false);
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [pending, start] = useTransition();
  const end = useRef<HTMLDivElement>(null);
  const name = c.other.displayName;

  const append = (m: Message) => setMessages((cur) => (cur.some((x) => x.id === m.id) ? cur : [...cur, m]));

  // Live updates: new messages and the other side's confirmation.
  useEffect(() => {
    const db = supabaseBrowser();
    if (!db) return;
    const channel = db
      .channel(`chat:${c.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `match_id=eq.${c.id}` }, (payload) => {
        const m = fromRow(payload.new as MessageRow);
        append(m);
        if (m.senderId && m.senderId !== meId) void markConversationRead(c.id);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "matches", filter: `id=eq.${c.id}` }, (payload) => {
        const row = payload.new as MatchRow;
        const iAmA = row.user_a === meId;
        setStatus(row.status);
        setConfirmedByMe(iAmA ? row.confirmed_a : row.confirmed_b);
        setConfirmedByOther(iAmA ? row.confirmed_b : row.confirmed_a);
      })
      .subscribe();
    return () => {
      void db.removeChannel(channel);
    };
  }, [c.id, meId]);

  useEffect(() => {
    if (c.unread > 0) void markConversationRead(c.id);
  }, [c.id, c.unread]);

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  function onSend(e: FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setText("");
    start(async () => {
      try {
        const m = await sendMessage(c.id, body);
        if (m) append(m);
      } catch {
        setText(body);
        showToast("No se envió. Inténtalo de nuevo.");
      }
    });
  }

  function onConfirm() {
    setMenu(false);
    start(async () => {
      try {
        const r = await confirmTrade(c.id);
        setConfirmedByMe(true);
        if (r.status === "cerrado") setStatus("cerrado");
        if (r.earned.length) showMoment({ kind: "badges", ids: r.earned });
      } catch {
        showToast("No pudimos confirmar. Inténtalo de nuevo.");
      }
    });
  }

  function onRate() {
    start(async () => {
      const r = await rateTrade(c.id, c.other.id, stars, comment);
      if (r.error) return showToast(r.error);
      setReviewed(true);
      showToast(`Gracias. Tu calificación ya cuenta para ${name}.`);
    });
  }

  const rating = status === "cerrado" && !reviewed && !ratingDismissed;

  return (
    <div className="chat">
      <header className="chat-head">
        <Link href="/mensajes" className="icon-btn" aria-label="Volver a mensajes"><Icon name="back" /></Link>
        <Avatar name={name} size={40} />
        <div className="chat-who">
          <p className="chat-name">{name}</p>
          {c.theirs && (
            <p className="chat-pair">
              {c.mine ? `${c.mine.title} × ` : ""}
              <Link href={`/objeto/${c.theirs.slug}`}>{c.theirs.title}</Link>
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
                <button type="button" role="menuitem" disabled={status !== "negociando" || confirmedByMe || pending} onClick={onConfirm}>
                  <Icon name="handshake" /> {confirmedByMe ? "Ya confirmaste" : "Confirmar trueque"}
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
        {c.theirs && (
          <div className="chat-context">
            <span className="mini-thumb"><Photo src={c.theirs.photos[0]} alt="" category={c.theirs.category} label={false} sizes="48px" /></span>
            <span>Hablan sobre <b>{c.theirs.title}</b></span>
          </div>
        )}
        {messages.map((m) => {
          const from = m.kind === "system" ? "system" : m.senderId === meId ? "me" : "them";
          return (
            <div key={m.id} className={`bubble-row from-${from}`}>
              <p className={`bubble bubble-${from}`}>{m.body}</p>
              {from !== "system" && <span className="bubble-time">{clockTime(m.createdAt)}</span>}
            </div>
          );
        })}
        {status === "negociando" && confirmedByMe && !confirmedByOther && (
          <p className="bubble-row from-system"><span className="bubble bubble-system">Confirmaste. Esperando a {name}…</span></p>
        )}
        {status === "negociando" && confirmedByOther && !confirmedByMe && (
          <div className="bubble-row from-system">
            <Button variant="spark" size="sm" onClick={onConfirm} disabled={pending}>{name} confirmó. Confirmar trueque</Button>
          </div>
        )}
        {status === "cerrado" && !reviewed && !rating && (
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
        <input id="msg" value={text} onChange={(e) => setText(e.target.value)} placeholder="Escribe un mensaje" autoComplete="off" maxLength={2000} disabled={status === "cancelado"} />
        <button type="button" className="icon-btn" aria-label="Nota de voz (pronto)" title="Pronto" disabled><Icon name="mic" /></button>
        <button type="submit" className="send-btn" aria-label="Enviar" disabled={!text.trim()}><Icon name="send" weight="fill" /></button>
      </form>

      <Sheet
        open={rating}
        onClose={() => setRatingDismissed(true)}
        label={`Califica a ${name}`}
        footer={<Button block disabled={!stars || pending} onClick={onRate}>Enviar calificación</Button>}
      >
        <div className="rate">
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
