import type { Metadata } from "next";
import { AdSlot } from "@/components/AdSlot";
import { Icon } from "@/components/ds/Icon";
import { Chip } from "@/components/ds/primitives";
import { EmptyHint } from "@/components/listing/EmptyHint";
import { ListingGrid } from "@/components/listing/ListingTile";
import { CATEGORIES, getCategory } from "@/lib/data/catalog";
import { searchListings } from "@/lib/repo";
import type { CategorySlug } from "@/lib/types";

type Props = { searchParams: Promise<{ q?: string; cat?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q, cat } = await searchParams;
  return {
    title: q ? `Resultados para «${q}»` : "Buscar trueques",
    description: "Busca guitarras, vinilos, bicicletas y más para intercambiar cerca de ti.",
    // Result pages for a query shouldn't be indexed; the bare page can be.
    robots: q || cat ? { index: false, follow: true } : undefined,
    alternates: { canonical: "/buscar" },
  };
}

function href(q: string, cat?: string) {
  const p = new URLSearchParams();
  if (q) p.set("q", q);
  if (cat) p.set("cat", cat);
  const s = p.toString();
  return s ? `/buscar?${s}` : "/buscar";
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = "", cat } = await searchParams;
  const category = cat ? getCategory(cat) : undefined;
  const results = await searchListings(q, category?.slug as CategorySlug | undefined);

  return (
    <div className="page">
      <header className="page-head">
        <h1 className="title-lg">Buscar trueques</h1>
        <form action="/buscar" role="search" className="search-form">
          <Icon name="search" />
          <label htmlFor="q" className="sr-only">Qué buscas</label>
          <input id="q" name="q" type="search" defaultValue={q} placeholder="Busca guitarras, vinilos, bicicletas…" autoComplete="off" />
          {category && <input type="hidden" name="cat" value={category.slug} />}
          <button type="submit" className="tx-btn tx-btn-primary tx-btn-sm">Buscar</button>
        </form>
        <nav className="filter-row filter-scroll" aria-label="Categorías">
          <Chip href={href(q)} selected={!category}>Todos</Chip>
          {CATEGORIES.map((c) => (
            <Chip key={c.slug} href={href(q, c.slug)} selected={category?.slug === c.slug} icon={c.slug}>{c.name}</Chip>
          ))}
        </nav>
      </header>

      <AdSlot placement="search-top" />

      <p className="results-count" aria-live="polite">
        {results.length === 1 ? "1 objeto" : `${results.length} objetos`}
        {q && <> para «{q}»</>}
        {category && <> en {category.name}</>}
      </p>
      {results.length ? (
        <ListingGrid listings={results} priorityCount={4} />
      ) : (
        <EmptyHint title="Sin resultados" body="Prueba con otra palabra o quita el filtro de categoría. O sube tú el primero." />
      )}
    </div>
  );
}
