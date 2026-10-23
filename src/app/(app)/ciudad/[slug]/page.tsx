import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Collection } from "@/components/listing/Collection";
import { CITIES, getCity } from "@/lib/data/catalog";
import { getActiveCategories, getListingsByCity } from "@/lib/repo";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 60;

export function generateStaticParams() {
  return CITIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = getCity((await params).slug);
  if (!c) return {};
  const title = `Trueque en ${c.name}`;
  return {
    title,
    description: `Objetos para intercambiar en ${c.name}, ${c.state}. Cambia lo que tienes por lo que quieres con gente cerca de ti.`,
    alternates: { canonical: `/ciudad/${c.slug}` },
  };
}

export default async function CityPage({ params }: Props) {
  const c = getCity((await params).slug);
  if (!c) notFound();
  const [listings, categories] = await Promise.all([getListingsByCity(c.slug), getActiveCategories()]);
  return (
    <Collection
      title={`Trueque en ${c.name}`}
      intro={`${listings.length === 1 ? "1 objeto" : `${listings.length} objetos`} de vecinos de ${c.name}. Acuerden la entrega en un lugar público.`}
      listings={listings}
      related={[
        ...categories.map((x) => ({ href: `/categoria/${x.slug}`, label: x.name, icon: x.slug })),
        ...CITIES.filter((x) => x.slug !== c.slug).map((x) => ({ href: `/ciudad/${x.slug}`, label: x.name, icon: "pin" as const })),
      ]}
    />
  );
}
