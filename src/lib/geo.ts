import type { GeoPoint } from "@/lib/types";

export function distanceKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** "A 800 m", "A 3 km", "A 412 km". Null location means an online service. */
export function formatDistance(from: GeoPoint | null, to: GeoPoint | null): string {
  if (!to) return "En línea";
  if (!from) return "";
  const km = distanceKm(from, to);
  if (km < 1) return `A ${Math.max(100, Math.round((km * 1000) / 50) * 50)} m`;
  if (km < 10) return `A ${km.toFixed(1).replace(/\.0$/, "")} km`;
  return `A ${Math.round(km).toLocaleString("es-MX")} km`;
}

export type DistanceFilter = "5" | "10" | "25" | "50" | "nacional";

export const DISTANCE_OPTIONS: { value: DistanceFilter; label: string }[] = [
  { value: "5", label: "5 km" },
  { value: "10", label: "10 km" },
  { value: "25", label: "25 km" },
  { value: "50", label: "50 km" },
  { value: "nacional", label: "Todo el país" },
];

export function withinDistance(from: GeoPoint, to: GeoPoint | null, filter: DistanceFilter): boolean {
  if (filter === "nacional" || !to) return true;
  return distanceKm(from, to) <= Number(filter);
}
