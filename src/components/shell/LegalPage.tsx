import type { ReactNode } from "react";
import { Icon } from "../ds/Icon";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <article className="site-wrap legal">
      <p className="legal-draft" role="note">
        <Icon name="info" weight="fill" /> Borrador pendiente de revisión legal. No es la versión definitiva.
      </p>
      <h1 className="title-lg">{title}</h1>
      <p className="muted">Última actualización: {updated}</p>
      {children}
    </article>
  );
}
