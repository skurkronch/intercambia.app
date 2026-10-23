import type { CategorySlug, Listing } from "@/lib/types";

export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

// What people write in "¿Qué quieres a cambio?" mapped to the category it belongs to.
// Keys are normalized; the first keyword found in a wish decides its category.
const KEYWORDS: [string, CategorySlug][] = [
  ["teclado mecanico", "electronica"],
  ["teclado midi", "instrumentos"],
  ["sintetizador", "instrumentos"],
  ["bajo", "instrumentos"],
  ["guitarra", "instrumentos"],
  ["bateria", "instrumentos"],
  ["ukulele", "instrumentos"],
  ["piano", "instrumentos"],
  ["tornamesa", "electronica"],
  ["tocadiscos", "electronica"],
  ["amplificador", "electronica"],
  ["audifonos", "electronica"],
  ["samsung", "electronica"],
  ["iphone", "electronica"],
  ["ipad", "electronica"],
  ["macbook", "electronica"],
  ["laptop", "electronica"],
  ["monitor", "electronica"],
  ["mouse", "electronica"],
  ["webcam", "electronica"],
  ["drone", "electronica"],
  ["gopro", "electronica"],
  ["lente", "electronica"],
  ["camara", "electronica"],
  ["wacom", "electronica"],
  ["tableta", "electronica"],
  ["xbox", "videojuegos"],
  ["nintendo", "videojuegos"],
  ["switch", "videojuegos"],
  ["consola", "videojuegos"],
  ["pc gaming", "videojuegos"],
  ["playstation", "videojuegos"],
  ["videojuego", "videojuegos"],
  ["vinilo", "libros-coleccionables"],
  ["casete", "libros-coleccionables"],
  ["memorabilia", "libros-coleccionables"],
  ["estampa", "libros-coleccionables"],
  ["album", "libros-coleccionables"],
  ["figura", "libros-coleccionables"],
  ["manga", "libros-coleccionables"],
  ["anime", "libros-coleccionables"],
  ["lego", "libros-coleccionables"],
  ["hot wheels", "libros-coleccionables"],
  ["funko", "libros-coleccionables"],
  ["libro", "libros-coleccionables"],
  ["comic", "libros-coleccionables"],
  ["camiseta", "ropa"],
  ["chamarra", "ropa"],
  ["tenis", "ropa"],
  ["air force", "ropa"],
  ["yeezy", "ropa"],
  ["new balance", "ropa"],
  ["jordan", "ropa"],
  ["accesorio", "ropa"],
  ["patines", "deportes"],
  ["longboard", "deportes"],
  ["casco", "deportes"],
  ["kayak", "deportes"],
  ["paddle", "deportes"],
  ["buceo", "deportes"],
  ["sleeping", "deportes"],
  ["casa de campana", "deportes"],
  ["botas", "deportes"],
  ["bici", "deportes"],
  ["ping pong", "deportes"],
  ["surf", "deportes"],
  ["licuadora", "hogar"],
  ["freidora", "hogar"],
  ["batidora", "hogar"],
  ["cafetera", "hogar"],
  ["futbolito", "hogar"],
  ["mesa", "hogar"],
  ["curso de arte", "arte"],
  ["oleo", "arte"],
  ["lienzo", "arte"],
  ["pintura", "arte"],
  ["suculenta", "plantas"],
  ["orquidea", "plantas"],
  ["cactus", "plantas"],
  ["maceta", "plantas"],
  ["planta", "plantas"],
  ["clases", "servicios"],
  ["coaching", "servicios"],
  ["curso", "servicios"],
];

/** The category a free-text wish points to, if we can tell. */
export function wishCategory(wish: string): CategorySlug | null {
  const w = normalize(wish);
  for (const [kw, cat] of KEYWORDS) if (w.includes(kw)) return cat;
  return null;
}

/**
 * Does this listing satisfy this wish? Strict: the wish (or its keyword) appears
 * in the title. Loose also accepts the same category, which is how a trade
 * partner reads "I want a synth" when you offer a guitar.
 */
export function satisfies(listing: Listing, wish: string, strict = false): boolean {
  const w = normalize(wish);
  const title = normalize(listing.title);
  // Singular stem of the wish ("vinilos" → "vinilo") found in the title.
  const stem = w.replace(/(es|s)$/, "");
  if (stem.length >= 4 && title.includes(stem)) return true;
  const kw = KEYWORDS.find(([k]) => w.includes(k));
  if (kw && title.includes(kw[0])) return true;
  if (strict) return false;
  return kw?.[1] === listing.category;
}

/** "Solo lo que busco": the listing is something on my wishlist. */
export function isOnWishlist(listing: Listing, wishes: string[]): boolean {
  return wishes.some((w) => satisfies(listing, w, true));
}

export interface MatchResult {
  mine: Listing;
  theirs: Listing;
  /** The wish of theirs that my listing satisfies. */
  wish: string;
}

/**
 * Condition A from the PRD: I want their listing, and its owner wants
 * something I have listed and still available.
 */
export function findMatch(theirs: Listing, myListings: Listing[]): MatchResult | null {
  const available = myListings.filter((m) => m.status === "activo");
  if (theirs.openToAnything && available.length) {
    return { mine: available[0], theirs, wish: "Abierto a todo" };
  }
  for (const wish of theirs.wants) {
    const mine = available.find((m) => satisfies(m, wish));
    if (mine) return { mine, theirs, wish };
  }
  return null;
}

/** "Buscan lo que ofrezco": the owner of this listing wants something I have. */
export function wantsWhatIOffer(theirs: Listing, myListings: Listing[]): boolean {
  return findMatch(theirs, myListings) !== null;
}
