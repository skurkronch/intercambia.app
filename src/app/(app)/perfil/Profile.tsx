"use client";

import Link from "next/link";
import { useEffect, useMemo, type ReactNode } from "react";
import { markBadgesSeen, signOut } from "@/app/actions";
import { Badge } from "@/components/ds/Badge";
import { Icon } from "@/components/ds/Icon";
import { Photo } from "@/components/ds/Photo";
import { Avatar, ButtonLink } from "@/components/ds/primitives";
import { byRank, evaluateBadges } from "@/lib/badges";
import { getCity } from "@/lib/data/catalog";
import { formatResponseTime, timeAgo } from "@/lib/format";
import type { Listing, ListingStatus, Review, TradeStats, User } from "@/lib/types";

const STATUS: Record<ListingStatus, { label: string; tone: string }> = {
  activo: { label: "Activo", tone: "want" },
  "en-negociacion": { label: "En negociación", tone: "save" },
  intercambiado: { label: "Intercambiado", tone: "violet" },
  pausado: { label: "Pausado", tone: "neutral" },
};

export function Profile({ user, stats, listings, reviews, seenBadges, now, saved }: {
  user: User; stats: TradeStats; listings: Listing[]; reviews: Review[]; seenBadges: string[]; now: number; saved: ReactNode;
}) {
  const badges = useMemo(() => evaluateBadges(stats), [stats]);
  const earned = badges.filter((b) => b.earned).sort(byRank);
  const locked = badges.filter((b) => !b.earned).sort((a, b) => b.current / b.total - a.current / a.total);
  const fresh = earned.filter((b) => !seenBadges.includes(b.def.id)).map((b) => b.def.id);
  const freshKey = fresh.join(",");

  // "NUEVA" shows until the person has seen the badge once.
  useEffect(() => {
    if (!freshKey) return;
    const t = setTimeout(() => void markBadgesSeen(freshKey.split(",")), 4000);
    return () => clearTimeout(t);
  }, [freshKey]);

  const city = getCity(user.citySlug);

  return (
    <div className="page page-profile">
      <header className="profile-head">
        <Avatar name={user.displayName} size={88} />
        <div className="profile-id">
          <h1 className="title-lg">{user.displayName}</h1>
          <p className="muted">
            @{user.username}
            {(user.neighborhood || city) && <> · <Icon name="pin" /> {[user.neighborhood, city?.short].filter(Boolean).join(", ")}</>}
          </p>
          {user.bio && <p className="profile-bio">{user.bio}</p>}
          <div className="profile-links">
            <Link href="/bienvenida?next=/perfil">Editar perfil</Link>
            <form action={signOut}><button type="submit" className="link-button">Cerrar sesión</button></form>
          </div>
        </div>
        <dl className="profile-stats">
          <div><dt>Trueques</dt><dd>{stats.exchanges}</dd></div>
          <div><dt>Calificación</dt><dd>{stats.reviewsCount ? <><Icon name="star" weight="fill" /> {stats.rating.toFixed(1)}</> : "—"}</dd></div>
          <div><dt>Responde en</dt><dd>{stats.avgResponseMinutes !== null ? formatResponseTime(stats.avgResponseMinutes) : "—"}</dd></div>
        </dl>
      </header>

      <section className="section" id="insignias" aria-labelledby="badges-title">
        <div className="section-head">
          <h2 className="title-lg" id="badges-title">Mis insignias</h2>
          <span className="muted">{earned.length} de {badges.length}</span>
        </div>
        {earned.length ? (
          <div className="badge-grid">
            {earned.map((b) => <Badge key={b.def.id} status={b} isNew={fresh.includes(b.def.id)} />)}
          </div>
        ) : (
          <p className="muted">Cierra tu primer trueque para ganar Novato del Trueque.</p>
        )}
        <h3 className="title-sm section-sub">Por desbloquear</h3>
        <div className="badge-grid">
          {locked.map((b) => <Badge key={b.def.id} status={b} />)}
        </div>
      </section>

      <section className="section" id="guardados" aria-labelledby="saved-title">
        <div className="section-head">
          <h2 className="title-lg" id="saved-title">Guardados</h2>
          <Link href="/descubre" className="link-more">Seguir explorando <Icon name="next" /></Link>
        </div>
        {saved}
      </section>

      <section className="section" aria-labelledby="mine-title">
        <div className="section-head">
          <h2 className="title-lg" id="mine-title">Mis publicaciones</h2>
          <ButtonLink href="/publicar" size="sm" icon="plus">Subir objeto</ButtonLink>
        </div>
        {listings.length ? (
          <ul className="hscroll">
            {listings.map((l) => (
              <li key={l.id} className="mine-card">
                <Link href={`/objeto/${l.slug}`} className="mine-photo"><Photo src={l.photos[0]} alt={l.title} category={l.category} label={false} sizes="160px" /></Link>
                <p className="mine-title">{l.title}</p>
                <span className={`tx-chip tx-chip-${STATUS[l.status].tone}`}>{STATUS[l.status].label}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">Todavía no publicas nada. Lo que ofreces es la otra mitad del trueque.</p>
        )}
      </section>

      <section className="section" aria-labelledby="reviews-title">
        <h2 className="title-lg" id="reviews-title">Reseñas recientes</h2>
        {reviews.length ? (
          <ul className="reviews">
            {reviews.map((r) => (
              <li key={r.id} className="review">
                <Avatar name={r.authorName} size={40} />
                <div>
                  <p className="review-head">
                    <b>{r.authorName}</b>
                    <span className="review-stars" aria-label={`${r.stars} de 5`}>
                      {Array.from({ length: 5 }, (_, i) => <Icon key={i} name="star" weight={i < r.stars ? "fill" : "bold"} />)}
                    </span>
                  </p>
                  {r.text && <p>{r.text}</p>}
                  <p className="muted review-date">{timeAgo(r.createdAt, now)}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">Las reseñas aparecen después de cada trueque cerrado.</p>
        )}
      </section>

      <p className="profile-foot muted">La verificación de identidad para la insignia Vecino verificado llega pronto.</p>
    </div>
  );
}
