import type { Listing } from "@/lib/types";
import { Photo } from "./Photo";
import { XMark } from "./XMark";
import { Button } from "./primitives";

const SPARKS: [number, number][] = [[-120, -90], [130, -70], [-150, 20], [150, 40], [-90, 110], [100, 120], [0, -130], [-40, 140], [60, -120]];

/** Your listing enters from the left, theirs from the right; they collide into the X. */
export function MatchScreen({ mine, theirs, otherName, onChat, onClose }: {
  mine: Listing; theirs: Listing; otherName: string; onChat: () => void; onClose: () => void;
}) {
  return (
    <section className="tx-match" role="dialog" aria-modal="true" aria-labelledby="match-title">
      <h2 className="tx-match-title" id="match-title">¡Hay trueque!</h2>
      <div className="tx-match-pair" aria-hidden="true">
        <div className="tx-match-thumb tx-l"><Photo src={mine.photos[0]} alt="" category={mine.category} label={false} sizes="120px" /></div>
        <div className="tx-match-thumb tx-r"><Photo src={theirs.photos[0]} alt="" category={theirs.category} label={false} sizes="120px" /></div>
        <div className="tx-match-x"><XMark size={52} /></div>
        {SPARKS.map(([dx, dy], i) => (
          <span
            key={i}
            className="tx-spark-p"
            style={{ left: "50%", top: "50%", ["--dx" as string]: `${dx}px`, ["--dy" as string]: `${dy}px`, animationDelay: `${0.4 + i * 0.02}s` }}
          />
        ))}
      </div>
      <p className="tx-match-sub">
        A {otherName} le late lo tuyo: tu <b>{mine.title}</b> por su <b>{theirs.title}</b>.
      </p>
      <div className="tx-match-actions">
        <Button variant="spark" block onClick={onChat} autoFocus>Mandar propuesta al chat</Button>
        <Button variant="ghost" block onClick={onClose}>Seguir explorando</Button>
      </div>
    </section>
  );
}
