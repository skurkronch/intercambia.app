import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { Coin } from "@/components/ds/Badge";
import { Icon } from "@/components/ds/Icon";
import { ItemCard } from "@/components/ds/ItemCard";
import { ButtonLink, Chip } from "@/components/ds/primitives";
import { XMark } from "@/components/ds/XMark";
import { CATEGORIES, CITIES } from "@/lib/data/catalog";
import { ListingGrid } from "@/components/listing/ListingTile";
import { getActiveCategories, getActiveCities, getRecentListings, getUsers } from "@/lib/repo";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

// Regenerated at most once a minute with the newest listings.
export const revalidate = 60;

export default async function HomePage() {
  const [recent, activeCategories, activeCities] = await Promise.all([getRecentListings(8), getActiveCategories(), getActiveCities()]);
  // Before there are listings, link every category and city so the page is never a dead end.
  const categories = activeCategories.length ? activeCategories : CATEGORIES;
  const cities = activeCities.length ? activeCities : CITIES;
  const heroListings = recent.slice(0, 3);
  const owners = new Map((await getUsers(heroListings.map((l) => l.ownerId))).map((u) => [u.id, u]));
  const hero = heroListings.map((l) => ({ kind: "listing" as const, key: l.id, listing: l, owner: owners.get(l.ownerId), distance: "" }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "es-MX",
    potentialAction: { "@type": "SearchAction", target: `${SITE_URL}/buscar?q={q}`, "query-input": "required name=q" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="hero site-wrap">
        <div className="hero-copy">
          <p className="overline hero-eyebrow">Trueque entre vecinos · México y EE. UU.</p>
          <h1 className="hero-title">
            Cambia lo que tienes por lo que <span className="hero-x">quieres</span>.
          </h1>
          <p className="hero-body">
            Sube lo que ya no usas, desliza lo que te gusta y, cuando a los dos les late, hagan trueque. Sin dinero de por medio y sin comisiones.
          </p>
          <div className="hero-ctas">
            <ButtonLink href="/descubre" icon="compass">Empieza a deslizar</ButtonLink>
            <ButtonLink href="/buscar" variant="secondary">Explorar objetos</ButtonLink>
          </div>
        </div>
        {hero.length === 3 ? (
          <div className="hero-art" aria-hidden="true">
            {hero.map((item, i) => (
              <div key={item.key} className={`hero-card hero-card-${i}`}>
                <ItemCard item={item} top={i === 2} />
              </div>
            ))}
          </div>
        ) : (
          <div className="hero-art hero-art-mark" aria-hidden="true">
            <XMark size={240} />
          </div>
        )}
      </section>

      <section className="band" id="como-funciona" aria-labelledby="how-title">
        <div className="site-wrap">
          <h2 className="title-lg" id="how-title">Cómo funciona</h2>
          <ol className="steps">
            <li className="step">
              <span className="step-n">1</span>
              <h3 className="title-sm">Sube lo que ya no usas</h3>
              <p>Fotos, estado y qué te gustaría a cambio. Toma un minuto.</p>
            </li>
            <li className="step">
              <span className="step-n">2</span>
              <h3 className="title-sm">Desliza lo que te gusta</h3>
              <p>A la derecha si lo quieres, a la izquierda si pasas. Abajo para guardarlo.</p>
            </li>
            <li className="step">
              <span className="step-n">3</span>
              <h3 className="title-sm">Hagan trueque</h3>
              <p>Si a la otra persona le late algo tuyo, hay match y se abre el chat para cerrar el trato.</p>
            </li>
          </ol>
        </div>
      </section>

      {recent.length > 0 && (
        <section className="site-wrap section" aria-labelledby="recent-title">
          <div className="section-head">
            <h2 className="title-lg" id="recent-title">Recién publicados</h2>
            <Link href="/buscar" className="link-more">Ver todo <Icon name="next" /></Link>
          </div>
          <ListingGrid listings={recent} />
        </section>
      )}

      <div className="site-wrap">
        <AdSlot placement="home-mid" />
      </div>

      <section className="site-wrap section" aria-labelledby="cats-title">
        <h2 className="title-lg" id="cats-title">Explora por categoría</h2>
        <div className="chip-cloud">
          {categories.map((c) => (
            <Chip key={c.slug} href={`/categoria/${c.slug}`} icon={c.slug}>{c.name}</Chip>
          ))}
        </div>
        <h2 className="title-sm section-sub">Por ciudad</h2>
        <div className="chip-cloud">
          {cities.map((c) => (
            <Chip key={c.slug} href={`/ciudad/${c.slug}`} icon="pin">{c.name}</Chip>
          ))}
        </div>
      </section>

      <section className="site-wrap section trust" aria-labelledby="trust-title">
        <div className="trust-coins" aria-hidden="true">
          <Coin material="bronze" icon="handshake" />
          <Coin material="silver" icon="shield" />
          <Coin material="gold" icon="star" />
          <Coin material="crystal" icon="crown" />
        </div>
        <div>
          <h2 className="title-lg" id="trust-title">La confianza la pone la comunidad</h2>
          <p className="trust-body">
            Cada trueque suma reseñas e insignias, de Novato del Trueque a Rey del Swap. Antes de deslizar ves quién ofrece, cómo califican sus trueques y qué tan rápido responde.
          </p>
        </div>
      </section>
    </>
  );
}
