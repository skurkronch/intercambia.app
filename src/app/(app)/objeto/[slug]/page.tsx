import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { Icon } from "@/components/ds/Icon";
import { Gallery } from "@/components/ds/Gallery";
import { ListingInfo } from "@/components/listing/ListingDetail";
import { ListingGrid } from "@/components/listing/ListingTile";
import { WantActions } from "@/components/listing/WantActions";
import { conditionLabel, getCategory, getCity } from "@/lib/data/catalog";
import { getAllListingSlugs, getListingBySlug, getRelatedListings, getUser } from "@/lib/repo";
import { SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 60;

export async function generateStaticParams() {
  return (await getAllListingSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const listing = await getListingBySlug((await params).slug);
  if (!listing) return {};
  const city = getCity(listing.citySlug);
  const wants = listing.openToAnything ? "lo que le ofrezcas" : listing.wants.slice(0, 3).join(", ");
  const title = `${listing.title} en trueque · ${listing.neighborhood}, ${city?.short ?? ""}`;
  const description = `${conditionLabel(listing.condition)}. Lo cambia por ${wants}. Haz trueque en truXanger, sin dinero de por medio.`;
  return {
    title,
    description,
    alternates: { canonical: `/objeto/${listing.slug}` },
    openGraph: { title, description, url: `/objeto/${listing.slug}`, type: "article" },
  };
}

export default async function ListingPage({ params }: Props) {
  const listing = await getListingBySlug((await params).slug);
  if (!listing || listing.status === "intercambiado") notFound();
  const [owner, related] = await Promise.all([getUser(listing.ownerId), getRelatedListings(listing)]);
  const category = getCategory(listing.category);

  const crumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: category?.name, item: `${SITE_URL}/categoria/${listing.category}` },
      { "@type": "ListItem", position: 3, name: listing.title, item: `${SITE_URL}/objeto/${listing.slug}` },
    ],
  };

  return (
    <div className="page page-listing">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
      <nav className="crumbs" aria-label="Ruta">
        <Link href="/">Inicio</Link>
        <Icon name="next" />
        <Link href={`/categoria/${listing.category}`}>{category?.name}</Link>
      </nav>

      <div className="listing-layout">
        <div className="listing-media">
          <Gallery photos={listing.photos} alt={listing.title} category={listing.category} priority sizes="(max-width: 900px) 100vw, 560px" />
        </div>
        <div className="listing-main">
          <ListingInfo listing={listing} owner={owner} actions={<WantActions listing={listing} />} />
        </div>
        <div className="listing-rail">
          <AdSlot placement="listing-rail" />
        </div>
      </div>

      <AdSlot placement="listing-bottom" />

      {related.length > 0 && (
        <section className="section" aria-labelledby="related-title">
          <div className="section-head">
            <h2 className="title-lg" id="related-title">También para trueque</h2>
            <Link href={`/categoria/${listing.category}`} className="link-more">Más en {category?.name} <Icon name="next" /></Link>
          </div>
          <ListingGrid listings={related} />
        </section>
      )}
    </div>
  );
}
