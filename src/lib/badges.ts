import type { CategorySlug, TradeStats } from "@/lib/types";

export type BadgeMaterial = "bronze" | "silver" | "gold" | "crystal";

export type BadgeIcon =
  | "handshake" | "package" | "storefront" | "crown" | "lightning" | "star" | "globe" | "shuffle" | "shield"
  | CategorySlug;

export interface BadgeDef {
  id: string;
  name: string;
  material: BadgeMaterial;
  icon: BadgeIcon;
  /** Progress toward the badge: current value and the target. */
  progress: (s: TradeStats) => { current: number; total: number };
  unit: string;
  earnedTip: string;
}

export interface BadgeStatus {
  def: BadgeDef;
  earned: boolean;
  current: number;
  total: number;
  caption: string;
  tip: string;
}

const count = (n: number) => (s: TradeStats) => ({ current: Math.min(s.exchanges, n), total: n });
const inCategory = (cat: CategorySlug) => (s: TradeStats) => ({ current: Math.min(s.byCategory[cat] ?? 0, 3), total: 3 });

const CATEGORY_BADGES: [string, string, CategorySlug, string][] = [
  ["techie", "Techie Swapper", "electronica", "Electrónica"],
  ["fashion", "Fashion Trader", "ropa", "Ropa"],
  ["biblionauta", "Biblionauta", "libros-coleccionables", "Libros y coleccionables"],
  ["rockstar", "Rockstar del Trueque", "instrumentos", "Instrumentos"],
  ["atleta", "Atleta del Swap", "deportes", "Deportes"],
  ["home_dealer", "Home Dealer", "hogar", "Hogar"],
  ["player_one", "Player One", "videojuegos", "Videojuegos"],
  ["artesano", "Artesano del Cambio", "arte", "Arte"],
  ["green_trader", "Green Trader", "plantas", "Plantas"],
  ["skill_swapper", "Skill Swapper", "servicios", "Servicios"],
];

export const BADGES: BadgeDef[] = [
  { id: "novato", name: "Novato del Trueque", material: "bronze", icon: "handshake", progress: count(1), unit: "trueque", earnedTip: "Cerraste tu primer trueque." },
  { id: "coleccionista", name: "Coleccionista", material: "silver", icon: "package", progress: count(10), unit: "trueques", earnedTip: "10 trueques cerrados." },
  { id: "mercader", name: "El Mercader", material: "gold", icon: "storefront", progress: count(50), unit: "trueques", earnedTip: "50 trueques cerrados." },
  { id: "rey", name: "Rey del Swap", material: "crystal", icon: "crown", progress: count(100), unit: "trueques", earnedTip: "100 trueques cerrados. Leyenda del barrio." },
  { id: "respuesta_rapida", name: "Respuesta Rápida", material: "silver", icon: "lightning",
    progress: (s) => ({ current: s.avgResponseMinutes <= 60 ? 1 : 0, total: 1 }), unit: "", earnedTip: "Respondes en menos de una hora en promedio." },
  { id: "cinco_estrellas", name: "5 Estrellas", material: "gold", icon: "star",
    progress: (s) => ({ current: s.rating >= 5 ? Math.min(s.reviewsCount, 10) : 0, total: 10 }), unit: "reseñas de 5.0", earnedTip: "Calificación perfecta con 10 reseñas o más." },
  { id: "poliglota", name: "Políglota del Trueque", material: "gold", icon: "globe",
    progress: (s) => ({ current: Math.min(new Set(s.countries).size, 2), total: 2 }), unit: "países", earnedTip: "Cerraste trueques en México y en Estados Unidos." },
  { id: "multitrueque", name: "Multitrueque", material: "silver", icon: "shuffle",
    progress: (s) => ({ current: Math.min(Object.values(s.byCategory).filter((n) => (n ?? 0) > 0).length, 5), total: 5 }), unit: "categorías", earnedTip: "Trueques en 5 categorías distintas." },
  { id: "vecino_verificado", name: "Vecino verificado", material: "silver", icon: "shield",
    progress: (s) => ({ current: s.verified ? 1 : 0, total: 1 }), unit: "", earnedTip: "Verificaste tu identidad." },
  ...CATEGORY_BADGES.map(([id, name, cat, label]): BadgeDef => ({
    id, name, material: "bronze", icon: cat, progress: inCategory(cat), unit: `en ${label}`, earnedTip: `3 trueques en ${label}.`,
  })),
];

function lockedTip(def: BadgeDef, current: number, total: number): string {
  const left = total - current;
  switch (def.id) {
    case "respuesta_rapida": return "Responde en menos de una hora en promedio.";
    case "vecino_verificado": return "Verifica tu identidad desde tu perfil.";
    case "cinco_estrellas": return "Mantén 5.0 de calificación hasta juntar 10 reseñas.";
    case "poliglota": return "Cierra un trueque en el otro país.";
    case "multitrueque": return `Te ${left === 1 ? "falta 1 categoría" : `faltan ${left} categorías`}.`;
    default: return `Te ${left === 1 ? "falta 1 trueque" : `faltan ${left} trueques`}${def.unit.startsWith("en ") ? ` ${def.unit}` : ""}.`;
  }
}

export function evaluateBadges(stats: TradeStats): BadgeStatus[] {
  return BADGES.map((def) => {
    const { current, total } = def.progress(stats);
    const earned = current >= total;
    const binary = total === 1;
    const caption = earned
      ? binary ? "Ganada" : `${total} ${def.unit}`.trim()
      : binary ? "Pendiente" : `${current}/${total} ${def.unit}`.trim();
    return { def, earned, current, total, caption, tip: earned ? def.earnedTip : lockedTip(def, current, total) };
  });
}

/** Badges earned in `after` that weren't earned in `before`. */
export function newlyEarned(before: TradeStats, after: TradeStats): BadgeStatus[] {
  const was = new Set(evaluateBadges(before).filter((b) => b.earned).map((b) => b.def.id));
  return evaluateBadges(after).filter((b) => b.earned && !was.has(b.def.id));
}

const RANK: Record<BadgeMaterial, number> = { bronze: 1, silver: 2, gold: 3, crystal: 4 };

/** The highest material a user has, for the small badge next to their name. */
export function topMaterial(exchanges: number, rating: number, verified: boolean): BadgeMaterial | null {
  if (exchanges >= 100) return "crystal";
  if (exchanges >= 50 || rating >= 5) return "gold";
  if (exchanges >= 10 || verified) return "silver";
  if (exchanges >= 1) return "bronze";
  return null;
}

export function byRank(a: BadgeStatus, b: BadgeStatus): number {
  return RANK[b.def.material] - RANK[a.def.material];
}
