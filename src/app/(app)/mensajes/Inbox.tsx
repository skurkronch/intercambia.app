"use client";

import Link from "next/link";
import { Photo } from "@/components/ds/Photo";
import { XLoader } from "@/components/ds/XMark";
import { Avatar } from "@/components/ds/primitives";
import { EmptyHint } from "@/components/listing/EmptyHint";
import { timeAgo } from "@/lib/format";
import { lookup } from "@/lib/repo";
import { useMounted, useStore } from "@/lib/store";

const TRADE_LABEL = { negociando: null, "confirmado-por-mi": "Esperando confirmación", cerrado: "Trueque cerrado", calificado: "Trueque cerrado" } as const;

export function Inbox() {
  const mounted = useMounted();
  const conversations = useStore((s) => s.conversations);

  if (!mounted) return <div className="discover-loading"><XLoader label={null} /></div>;

  return (
    <div className="page page-narrow">
      <header className="page-head">
        <h1 className="title-lg">Mensajes</h1>
        <p className="page-intro">Los chats se abren cuando hay match.</p>
      </header>
      {conversations.length ? (
        <ul className="inbox">
          {conversations.map((c) => {
            const other = lookup.user(c.otherUserId);
            const theirs = lookup.listing(c.theirListingId);
            const last = c.messages[c.messages.length - 1];
            const label = TRADE_LABEL[c.trade];
            return (
              <li key={c.id}>
                <Link href={`/mensajes/${c.id}`} className={`inbox-row${c.unread ? " is-unread" : ""}`}>
                  <Avatar name={other?.displayName ?? "?"} size={48} />
                  <div className="inbox-body">
                    <p className="inbox-name">
                      {other?.displayName}
                      <span className="inbox-time">{last ? timeAgo(last.at) : ""}</span>
                    </p>
                    <p className="inbox-item">{label ? <span className="inbox-state">{label}</span> : theirs?.title}</p>
                    <p className="inbox-last">{last?.from === "me" ? "Tú: " : ""}{last?.text}</p>
                  </div>
                  {theirs && <span className="inbox-thumb"><Photo src={theirs.photos[0]} alt="" category={theirs.category} label={false} sizes="48px" /></span>}
                  {c.unread > 0 && <span className="inbox-count" aria-label={`${c.unread} sin leer`}>{c.unread}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyHint title="Aún no hay chats" body="Desliza a la derecha lo que te guste. Cuando haya match, el chat aparece aquí." />
      )}
    </div>
  );
}
