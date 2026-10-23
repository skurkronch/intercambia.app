"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { Badge } from "@/components/ds/Badge";
import { Icon } from "@/components/ds/Icon";
import { Photo } from "@/components/ds/Photo";
import { XLoader } from "@/components/ds/XMark";
import { Avatar, ButtonLink } from "@/components/ds/primitives";
import { byRank, evaluateBadges } from "@/lib/badges";
import { getCity } from "@/lib/data/catalog";
import { formatResponseTime, timeAgo } from "@/lib/format";
import { useMounted, useStore } from "@/lib/store";
import type { ListingStatus, User } from "@/lib/types";

const STATUS: Record<ListingStatus, { label: string; tone: string }> = {
  activo: { label: "Activo", tone: "want" },
  "en-negociacion": { label: "En negociación", tone: "save" },
  intercambiado: { label: "Intercambiado", tone: "violet" },
};

export function Profile({ user, reviews }: { user: User; reviews: { id: string; author: string; stars: number; text: string; createdAt: string }[] }) {
  const mounted = useMounted();
  const stats = useStore((s) => s.stats);
  const myListings = useStore((s) => s.myListings);
  const newBadgeIds = useStore((s) => s.newBadgeIds);
  const clearNewBadges = useStore((s) => s.clearNewBadges);

  const badges = useMemo(() => evaluateBadges(stats), [stats]);
  const earned = badges.filter((b) => b.earned).sort(byRank);
  const locked = badges.filter((b) => !b.earned).sort((a, b) => b.current / b.total - a.current / a.total);

  // "NUEVA" stays until the person has seen the badge once.
  useEffect(() => {
    if (!mounted || !newBadgeIds.length) return;
    const t = setTimeout(clearNewBadges, 6000);
    return () => clearTimeout(t);
  }, [mounted, newBadgeIds.length, clearNewBadges]);

  if (!mounted) return <div className="discover-loading"><XLoader label={null} /></div>;

  const city = getCity(user.citySlug);

  return (
    <div className="page page-profile">
      <header className="profile-head">
        <Avatar name={user.displayName} size={88} />
        <div className="profile-id">
          <h1 className="title-lg">{user.displayName}</h1>
          <p className="muted">@{user.username} · <Icon name="pin" /> {user.neighborhood}, {city?.short}</p>
          <p className="profile-bio">{user.bio}</p>
        </div>
        <dl className="profile-stats">
          <div><dt>Trueques</dt><dd>{stats.exchanges}</dd></div>
          <div><dt>Calificación</dt><dd><Icon name="star" weight="fill" /> {stats.rating.toFixed(1)}</dd></div>
          <div><dt>Responde en</dt><dd>{formatResponseTime(stats.avgResponseMinutes)}</dd></div>
        </dl>
      </header>

      <section className="section" id="insignias" aria-labelledby="badges-title">
        <div className="section-head">
          <h2 className="title-lg" id="badges-title">Mis insignias</h2>
          <span className="muted">{earned.length} de {badges.length}</span>
        </div>
        <div className="badge-grid">
          {earned.map((b) => <Badge key={b.def.id} status={b} isNew={newBadgeIds.includes(b.def.id)} />)}
        </div>
        <h3 className="title-sm section-sub">Por desbloquear</h3>
        <div className="badge-grid">
          {locked.map((b) => <Badge key={b.def.id} status={b} />)}
        </div>
      </section>

      <section className="section" aria-labelledby="mine-title">
        <div className="section-head">
          <h2 className="title-lg" id="mine-title">Mis publicaciones</h2>
          <ButtonLink href="/publicar" size="sm" icon="plus">Subir objeto</ButtonLink>
        </div>
        <ul className="hscroll">
          {myListings.map((l) => (
            <li key={l.id} className="mine-card">
              <div className="mine-photo"><Photo src={l.photos[0]} alt={l.title} category={l.category} label={false} sizes="160px" /></div>
              <p className="mine-title">{l.title}</p>
              <span className={`tx-chip tx-chip-${STATUS[l.status].tone}`}>{STATUS[l.status].label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="section" aria-labelledby="reviews-title">
        <h2 className="title-lg" id="reviews-title">Reseñas recientes</h2>
        <ul className="reviews">
          {reviews.map((r) => (
            <li key={r.id} className="review">
              <Avatar name={r.author} size={40} />
              <div>
                <p className="review-head">
                  <b>{r.author}</b>
                  <span className="review-stars" aria-label={`${r.stars} de 5`}>
                    {Array.from({ length: 5 }, (_, i) => <Icon key={i} name="star" weight={i < r.stars ? "fill" : "bold"} />)}
                  </span>
                </p>
                <p>{r.text}</p>
                <p className="muted review-date">{timeAgo(r.createdAt)}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <p className="profile-foot muted">
        ¿Quieres la insignia Vecino verificado? La verificación de identidad llega pronto. <Link href="/terminos">Más información</Link>
      </p>
    </div>
  );
}
