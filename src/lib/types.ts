// Domain types. They mirror the Supabase schema planned for phase 2,
// so swapping the seed data for real queries doesn't touch the UI.

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

export type ListingStatus = "activo" | "en-negociacion" | "intercambiado";

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
  rating: number;
  reviewsCount: number;
  exchanges: number;
  avgResponseMinutes: number;
  verified: boolean;
  memberSince: string;
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
  authorId: string;
  targetId: string;
  stars: number;
  text: string;
  createdAt: string;
}

export type MessageFrom = "me" | "them" | "system";

export interface Message {
  id: string;
  from: MessageFrom;
  text: string;
  at: string;
}

export type TradeState = "negociando" | "confirmado-por-mi" | "cerrado" | "calificado";

export interface Conversation {
  id: string;
  otherUserId: string;
  /** Their listing that started the match. */
  theirListingId: string;
  /** My listing offered in exchange, when there is one. */
  myListingId: string | null;
  messages: Message[];
  unread: number;
  trade: TradeState;
}

/** The signed-in person's exchange history, the input to badge rules. */
export interface TradeStats {
  exchanges: number;
  rating: number;
  reviewsCount: number;
  avgResponseMinutes: number;
  countries: Country[];
  byCategory: Partial<Record<CategorySlug, number>>;
  verified: boolean;
}

export type SwipeAction = "want" | "pass" | "save";
