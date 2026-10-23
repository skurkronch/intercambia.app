import { XMark } from "@/components/ds/XMark";
import { ButtonLink } from "@/components/ds/primitives";

export default function NotFound() {
  return (
    <main className="tx-empty not-found">
      <div className="tx-empty-art"><XMark size={48} tone="mono" /></div>
      <h1 className="tx-empty-title">Este objeto ya cambió de manos</h1>
      <p className="tx-empty-body">O la página nunca existió. Hay muchos más esperando trueque.</p>
      <ButtonLink href="/descubre" icon="compass">Ir a Descubre</ButtonLink>
    </main>
  );
}
