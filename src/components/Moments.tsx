"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { BADGES } from "@/lib/badges";
import { useStore } from "@/lib/store";
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

  const badges = moment?.kind === "badges" ? BADGES.filter((b) => moment.ids.includes(b.id)) : [];

  return (
    <>
      {moment?.kind === "match" && (
        <div className="overlay overlay-match">
          <MatchScreen
            mine={moment.mine}
            theirs={moment.theirs}
            otherName={moment.otherName}
            onChat={() => {
              dismiss();
              router.push(`/mensajes/${moment.conversationId}`);
            }}
            onClose={dismiss}
          />
        </div>
      )}

      {badges.length > 0 && (
        <div className="overlay overlay-badge" role="dialog" aria-modal="true" aria-labelledby="unlock-title">
          <Confetti />
          <div className="unlock">
            {badges.map((b, i) => (
              <div key={b.id} className="unlock-item">
                <span className="unlock-coin"><Coin material={b.material} icon={b.icon} isNew /></span>
                <h2 className="unlock-name" id={i === 0 ? "unlock-title" : undefined}>{b.name}</h2>
                <p className="unlock-tip">{b.earnedTip}</p>
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
