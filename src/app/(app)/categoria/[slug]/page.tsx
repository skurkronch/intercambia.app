import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Collection } from "@/components/listing/Collection";
import { CATEGORIES, getCategory } from "@/lib/data/catalog";
import { getActiveCities, getListingsByCategory } from "@/lib/repo";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 60;

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = getCategory((await params).slug);
  if (!c) return {};
  const title = `Trueque de ${c.plural}`;
  return {
    title,
    description: `Cambia ${c.plural} con vecinos en México y Estados Unidos. Sin dinero de por medio y sin comisiones.`,
    alternates: { canonical: `/categoria/${c.slug}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const c = getCategory((await params).slug);
  if (!c) notFound();
  const [listings, cities] = await Promise.all([getListingsByCategory(c.slug), getActiveCities()]);
  return (
    <Collection
      title={`Trueque de ${c.plural}`}
      intro={`${listings.length === 1 ? "1 objeto disponible" : `${listings.length} objetos disponibles`} para cambiar. Toca uno para ver qué busca su dueño a cambio.`}
      listings={listings}
      related={[
        ...CATEGORIES.filter((x) => x.slug !== c.slug).map((x) => ({ href: `/categoria/${x.slug}`, label: x.name, icon: x.slug })),
        ...cities.map((x) => ({ href: `/ciudad/${x.slug}`, label: x.name, icon: "pin" as const })),
      ]}
    />
  );
}
