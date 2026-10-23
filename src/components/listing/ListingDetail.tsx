import Link from "next/link";
import type { ReactNode } from "react";
import { topMaterial } from "@/lib/badges";
import { conditionLabel, getCategory, getCity } from "@/lib/data/catalog";
import { formatResponseTime, formatValue } from "@/lib/format";
import type { Listing, User } from "@/lib/types";
import { Coin } from "../ds/Badge";
import { Icon } from "../ds/Icon";
import { Avatar, Chip } from "../ds/primitives";

/** Everything about a listing below its photo. Shared by the page and the Descubre sheet. */
export function ListingInfo({ listing: l, owner, distance, headingLevel = 1, actions }: {
  listing: Listing; owner?: User; distance?: string; headingLevel?: 1 | 2; actions?: ReactNode;
}) {
  const city = getCity(l.citySlug);
  const category = getCategory(l.category);
  const value = formatValue(l.value, l.currency);
  const Heading = headingLevel === 1 ? "h1" : "h2";
  const material = owner ? topMaterial(owner) : null;

  return (
    <div className="detail">
      <div className="detail-chips">
        <Chip>{conditionLabel(l.condition)}</Chip>
        {category && <Chip href={`/categoria/${category.slug}`} icon={category.slug}>{category.name}</Chip>}
        {l.hasVideo && <Chip tone="violet" icon="video">Video de 15 s</Chip>}
      </div>
      <Heading className="detail-title">{l.title}</Heading>
      <p className="detail-place">
        <Icon name="pin" />
        {distance ? `${distance} · ` : ""}
        {l.neighborhood ? `${l.neighborhood}, ` : ""}
        <Link href={`/ciudad/${l.citySlug}`}>{city?.name}</Link>
        {value && <span className="detail-value">Valor de referencia {value}</span>}
      </p>

      {actions}

      <section className="detail-block" aria-labelledby={`wants-${l.id}`}>
        <h2 className="title-sm" id={`wants-${l.id}`}>Lo cambia por</h2>
        <div className="detail-wants">
          {l.openToAnything ? <Chip tone="want" icon="swap">Abierto a todo</Chip> : l.wants.map((w) => <Chip key={w} icon="swap">{w}</Chip>)}
        </div>
        {l.acceptsCash && <p className="detail-note">También acepta una diferencia en efectivo.</p>}
      </section>

      <section className="detail-block" aria-labelledby={`desc-${l.id}`}>
        <h2 className="title-sm" id={`desc-${l.id}`}>Descripción</h2>
        {l.description.split("\n\n").map((p, i) => (
          <p key={i} className="detail-desc">{p}</p>
        ))}
      </section>

      {owner && (
        <section className="owner-card" aria-label="Quién lo ofrece">
          <Avatar name={owner.displayName} size={48} />
          <div className="owner-card-body">
            <p className="owner-card-name">
              {owner.displayName}
              {material && <Coin material={material} icon="handshake" small label={`Insignia de ${material}`} />}
              {owner.verified && <span className="owner-verified"><Icon name="verified" weight="fill" label="Vecino verificado" /></span>}
            </p>
            <p className="owner-card-meta">
              {owner.rating !== null && <><Icon name="star" weight="fill" /> {owner.rating.toFixed(1)} · </>}
              {owner.exchanges === 1 ? "1 trueque" : `${owner.exchanges} trueques`}
              {owner.avgResponseMinutes !== null && ` · responde en ${formatResponseTime(owner.avgResponseMinutes)}`}
            </p>
            <p className="owner-card-bio">{owner.bio}</p>
          </div>
        </section>
      )}

      <p className="detail-disclaimer">
        truXanger no participa en la entrega. Acuerden un punto público y revisen el objeto antes de cerrar el trato.
      </p>
    </div>
  );
}
