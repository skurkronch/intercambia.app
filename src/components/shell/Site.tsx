import Link from "next/link";
import { CATEGORIES, CITIES } from "@/lib/data/catalog";
import { Wordmark } from "../ds/XMark";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-wrap site-header-row">
        <Link href="/" aria-label="truXanger, inicio">
          <Wordmark size={22} />
        </Link>
        <nav className="site-links" aria-label="Sitio">
          <Link href="/buscar">Explorar</Link>
          <Link href="/#como-funciona">Cómo funciona</Link>
          <Link href="/descubre" className="tx-btn tx-btn-primary tx-btn-sm">Empieza</Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-wrap site-footer-grid">
        <div className="site-footer-brand">
          <Wordmark size={20} />
          <p>Trueque entre vecinos. Sin dinero de por medio, sin comisiones.</p>
        </div>
        <nav aria-label="Categorías">
          <p className="overline">Categorías</p>
          <ul>
            {CATEGORIES.slice(0, 6).map((c) => (
              <li key={c.slug}><Link href={`/categoria/${c.slug}`}>{c.name}</Link></li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Ciudades">
          <p className="overline">Ciudades</p>
          <ul>
            {CITIES.slice(0, 6).map((c) => (
              <li key={c.slug}><Link href={`/ciudad/${c.slug}`}>{c.name}</Link></li>
            ))}
          </ul>
        </nav>
        <nav aria-label="truXanger">
          <p className="overline">truXanger</p>
          <ul>
            <li><Link href="/anunciate">Anúnciate</Link></li>
            <li><Link href="/terminos">Términos de uso</Link></li>
            <li><Link href="/aviso-de-privacidad">Aviso de privacidad</Link></li>
          </ul>
        </nav>
      </div>
      <p className="site-wrap site-legal">© {new Date().getFullYear()} truXanger. Hecho en México.</p>
    </footer>
  );
}
