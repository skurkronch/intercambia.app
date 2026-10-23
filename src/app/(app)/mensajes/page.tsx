import type { Metadata } from "next";
import Link from "next/link";
import { Photo } from "@/components/ds/Photo";
import { Avatar } from "@/components/ds/primitives";
import { EmptyHint } from "@/components/listing/EmptyHint";
import { renderTime, timeAgo } from "@/lib/format";
import { getConversations, requireViewer } from "@/lib/repo";

export const metadata: Metadata = { title: "Mensajes", robots: { index: false } };

export default async function MessagesPage() {
  const viewer = await requireViewer("/mensajes");
  const conversations = await getConversations(viewer.id);
  const now = renderTime();

  return (
    <div className="page page-narrow">
      <header className="page-head">
        <h1 className="title-lg">Mensajes</h1>
        <p className="page-intro">Los chats se abren cuando hay match.</p>
      </header>
      {conversations.length ? (
        <ul className="inbox">
          {conversations.map((c) => {
            const last = c.lastMessage;
            const state =
              c.status === "cerrado" ? "Trueque cerrado" : c.confirmedByOther && !c.confirmedByMe ? "Confirmó el trueque: falta tu parte" : c.confirmedByMe ? "Esperando su confirmación" : null;
            return (
              <li key={c.id}>
                <Link href={`/mensajes/${c.id}`} className={`inbox-row${c.unread ? " is-unread" : ""}`}>
                  <Avatar name={c.other.displayName} size={48} />
                  <div className="inbox-body">
                    <p className="inbox-name">
                      {c.other.displayName}
                      <span className="inbox-time">{last ? timeAgo(last.createdAt, now) : ""}</span>
                    </p>
                    <p className="inbox-item">{state ? <span className="inbox-state">{state}</span> : c.theirs?.title}</p>
                    <p className="inbox-last">{last ? `${last.senderId === viewer.id ? "Tú: " : ""}${last.body}` : ""}</p>
                  </div>
                  {c.theirs && (
                    <span className="inbox-thumb"><Photo src={c.theirs.photos[0]} alt="" category={c.theirs.category} label={false} sizes="48px" /></span>
                  )}
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
