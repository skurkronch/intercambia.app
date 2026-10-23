"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { lookup } from "@/lib/repo";
import { Coin } from "./ds/Badge";
import { MatchScreen } from "./ds/MatchScreen";
import { Button } from "./ds/primitives";
import { Confetti } from "./Confetti";

/** App-wide celebrations and notices: Match, badge unlocks, toasts. */
export function Moments() {
  const router = useRouter();
  const moment = useStore((s) => s.moment);
  const toast = useStore((s) => s.toast);
  const dismiss = useStore((s) => s.dismissMoment);
  const startConversation = useStore((s) => s.startConversation);
  const showToast = useStore((s) => s.showToast);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => showToast(null), 4200);
    return () => clearTimeout(t);
  }, [toast, showToast]);

  useEffect(() => {
    if (!moment) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && dismiss();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [moment, dismiss]);

  return (
    <>
      {moment?.kind === "match" && (
        <div className="overlay overlay-match">
          <MatchScreen
            mine={moment.match.mine}
            theirs={moment.match.theirs}
            otherName={lookup.user(moment.match.theirs.ownerId)?.displayName ?? "la otra persona"}
            onChat={() => {
              const id = startConversation(moment.match);
              dismiss();
              router.push(`/mensajes/${id}`);
            }}
            onClose={dismiss}
          />
        </div>
      )}

      {moment?.kind === "badges" && (
        <div className="overlay overlay-badge" role="dialog" aria-modal="true" aria-labelledby="unlock-title">
          <Confetti />
          <div className="unlock">
            <p className="overline unlock-eyebrow">Insignia nueva</p>
            {moment.badges.map((b) => (
              <div key={b.def.id} className="unlock-item">
                <span className="unlock-coin"><Coin material={b.def.material} icon={b.def.icon} isNew /></span>
                <h2 className="unlock-name" id="unlock-title">{b.def.name}</h2>
                <p className="unlock-tip">{b.def.earnedTip}</p>
              </div>
            ))}
            <div className="unlock-actions">
              <Button variant="spark" block onClick={() => { dismiss(); router.push("/perfil#insignias"); }} autoFocus>
                Ver mis insignias
              </Button>
              <Button variant="ghost" block onClick={dismiss}>Seguir</Button>
            </div>
          </div>
        </div>
      )}

      <div className="toast-region" aria-live="polite">
        {toast && <div className="toast">{toast}</div>}
      </div>
    </>
  );
}
