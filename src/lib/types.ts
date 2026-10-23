// Domain types the UI works with. src/lib/repo.ts maps database rows
// (supabase/migrations) to these.

export type CategorySlug =
  | "electronica"
  | "ropa"
  | "libros-coleccionables"
  | "instrumentos"
  | "deportes"
  | "hogar"
  | "videojuegos"
  | "arte"
  | "plantas"
  | "servicios";

export type Condition = "nuevo" | "como-nuevo" | "buen-estado" | "usado" | "para-reparar";

export type ListingStatus = "activo" | "en-negociacion" | "intercambiado" | "pausado";

export type Currency = "MXN" | "USD";

export type Country = "MX" | "US";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Category {
  slug: CategorySlug;
  name: string;
  /** Phrase used in page titles: "Trueques de {plural}". */
  plural: string;
}

export interface City {
  slug: string;
  name: string;
  short: string;
  state: string;
  country: Country;
  center: GeoPoint;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  citySlug: string;
  neighborhood: string;
  bio: string;
  /** Average stars; null until the first review. */
  rating: number | null;
  reviewsCount: number;
  exchanges: number;
  avgResponseMinutes: number | null;
  verified: boolean;
  memberSince: string;
  wants: string[];
  location: GeoPoint | null;
}

export interface Listing {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: CategorySlug;
  condition: Condition;
  value: number | null;
  currency: Currency;
  /** Photo URLs. Empty means the UI draws a placeholder. */
  photos: string[];
  wants: string[];
  openToAnything: boolean;
  acceptsCash: boolean;
  hasVideo: boolean;
  ownerId: string;
  citySlug: string;
  neighborhood: string;
  /** Approximate point (never the exact address). Null for online services. */
  location: GeoPoint | null;
  status: ListingStatus;
  superTrueque?: boolean;
  createdAt: string;
}

export interface Sponsor {
  id: string;
  brand: string;
  title: string;
  body: string;
  url: string;
  cta: string;
  category: CategorySlug;
}

export interface Review {
  id: string;
  authorName: string;
  stars: number;
  text: string;
  createdAt: string;
}

export interface Message {
  id: number;
  /** Null for system messages. */
  senderId: string | null;
  kind: "text" | "system";
  body: string;
  createdAt: string;
  readAt: string | null;
}

export type TradeStatus = "negociando" | "cerrado" | "cancelado";

/** A match seen from the signed-in person's side. */
export interface Conversation {
  id: string;
  other: User;
  /** Their listing, the one that started the match. */
  theirs: Listing | null;
  /** What I offered. */
  mine: Listing | null;
  status: TradeStatus;
  confirmedByMe: boolean;
  confirmedByOther: boolean;
  lastMessage: Message | null;
  unread: number;
}

/** The signed-in person's exchange history, the input to badge rules. */
export interface TradeStats {
  exchanges: number;
  rating: number;
  reviewsCount: number;
  /** Null until they have answered a proposal. */
  avgResponseMinutes: number | null;
  countries: Country[];
  byCategory: Partial<Record<CategorySlug, number>>;
  verified: boolean;
}

export type SwipeAction = "want" | "pass" | "save";
