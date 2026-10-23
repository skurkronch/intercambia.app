import type { Category, CategorySlug, City, Condition } from "@/lib/types";

export const CATEGORIES: Category[] = [
  { slug: "electronica", name: "Electrónica", plural: "electrónica y gadgets" },
  { slug: "ropa", name: "Ropa", plural: "ropa y accesorios" },
  { slug: "libros-coleccionables", name: "Libros y coleccionables", plural: "libros y coleccionables" },
  { slug: "instrumentos", name: "Instrumentos", plural: "instrumentos musicales" },
  { slug: "deportes", name: "Deportes", plural: "deportes y fitness" },
  { slug: "hogar", name: "Hogar", plural: "hogar y decoración" },
  { slug: "videojuegos", name: "Videojuegos", plural: "juguetes y videojuegos" },
  { slug: "arte", name: "Arte", plural: "arte y manualidades" },
  { slug: "plantas", name: "Plantas", plural: "plantas y jardín" },
  { slug: "servicios", name: "Servicios", plural: "servicios y habilidades" },
];

export const CONDITIONS: { value: Condition; label: string }[] = [
  { value: "nuevo", label: "Nuevo" },
  { value: "como-nuevo", label: "Como nuevo" },
  { value: "buen-estado", label: "Buen estado" },
  { value: "usado", label: "Usado" },
  { value: "para-reparar", label: "Para reparar" },
];

export const CITIES: City[] = [
  { slug: "cdmx", name: "Ciudad de México", short: "CDMX", state: "CDMX", country: "MX", center: { lat: 19.4326, lng: -99.1332 } },
  { slug: "monterrey", name: "Monterrey", short: "Monterrey", state: "Nuevo León", country: "MX", center: { lat: 25.6866, lng: -100.3161 } },
  { slug: "guadalajara", name: "Guadalajara", short: "Guadalajara", state: "Jalisco", country: "MX", center: { lat: 20.6597, lng: -103.3496 } },
  { slug: "puebla", name: "Puebla", short: "Puebla", state: "Puebla", country: "MX", center: { lat: 19.0414, lng: -98.2063 } },
  { slug: "estado-de-mexico", name: "Estado de México", short: "Edomex", state: "Estado de México", country: "MX", center: { lat: 19.4969, lng: -99.2389 } },
  { slug: "puerto-escondido", name: "Puerto Escondido", short: "Puerto Escondido", state: "Oaxaca", country: "MX", center: { lat: 15.8720, lng: -97.0767 } },
  { slug: "los-angeles", name: "Los Ángeles", short: "Los Ángeles", state: "California", country: "US", center: { lat: 34.0522, lng: -118.2437 } },
  { slug: "houston", name: "Houston", short: "Houston", state: "Texas", country: "US", center: { lat: 29.7604, lng: -95.3698 } },
];

const categoryBySlug = new Map(CATEGORIES.map((c) => [c.slug, c]));
const cityBySlug = new Map(CITIES.map((c) => [c.slug, c]));

export function getCategory(slug: string): Category | undefined {
  return categoryBySlug.get(slug as CategorySlug);
}

export function getCity(slug: string): City | undefined {
  return cityBySlug.get(slug);
}

export function conditionLabel(value: Condition): string {
  return CONDITIONS.find((c) => c.value === value)?.label ?? value;
}
