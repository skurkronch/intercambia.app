import { XMark } from "../ds/XMark";
import { ButtonLink } from "../ds/primitives";

export function EmptyHint({ title = "Nadie por aquí aún", body = "Sube algo para encender la chispa. Los trueques empiezan con un objeto." }: { title?: string; body?: string }) {
  return (
    <div className="tx-empty">
      <div className="tx-empty-art"><XMark size={48} tone="mono" /></div>
      <h2 className="tx-empty-title">{title}</h2>
      <p className="tx-empty-body">{body}</p>
      <ButtonLink href="/publicar" icon="plus">Subir objeto</ButtonLink>
    </div>
  );
}
