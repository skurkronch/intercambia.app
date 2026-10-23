import type { BadgeIcon, BadgeMaterial, BadgeStatus } from "@/lib/badges";
import { Icon } from "./Icon";

export function Coin({ material, icon, small, isNew, label }: { material: BadgeMaterial | "locked"; icon: BadgeIcon; small?: boolean; isNew?: boolean; label?: string }) {
  const cls = ["tx-coin", material !== "bronze" && `tx-coin-${material}`, small && "tx-coin-sm", isNew && !small && "tx-new"].filter(Boolean).join(" ");
  return (
    <span className={cls} title={small ? label : undefined} role={small ? "img" : undefined} aria-label={small ? label : undefined}>
      <Icon name={icon} weight={icon === "star" ? "fill" : "bold"} />
    </span>
  );
}

const MATERIAL_NAME: Record<BadgeMaterial, string> = { bronze: "bronce", silver: "plata", gold: "oro", crystal: "cristal" };

/** A collectible badge. Locked ones are frosted silhouettes with a progress bar. */
export function Badge({ status, isNew }: { status: BadgeStatus; isNew?: boolean }) {
  const { def, earned, current, total, caption, tip } = status;
  const tipId = `tip-${def.id}`;
  const pct = Math.round((current / total) * 100);
  return (
    <div className={earned ? "tx-badge" : "tx-badge tx-badge-locked"} tabIndex={0} aria-describedby={tipId}>
      <div className="tx-badge-wrap">
        <Coin material={earned ? def.material : "locked"} icon={def.icon} isNew={isNew} />
        {isNew && <span className="tx-new-pill">NUEVA</span>}
      </div>
      <span className="tx-badge-label">{def.name}</span>
      {!earned && total > 1 && (
        <span className="tx-progress" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={current} aria-label={`Progreso de ${def.name}`}>
          <span style={{ width: `${pct}%` }} />
        </span>
      )}
      <span className="tx-badge-sub">{earned ? `${caption} · ${MATERIAL_NAME[def.material]}` : caption}</span>
      <span className="tx-tip" role="tooltip" id={tipId}>{tip}</span>
    </div>
  );
}
