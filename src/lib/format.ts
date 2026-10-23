import type { Currency } from "@/lib/types";

export function formatValue(value: number | null, currency: Currency): string | null {
  if (value === null) return null;
  return `$${value.toLocaleString("es-MX")} ${currency}`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const rtf = new Intl.RelativeTimeFormat("es-MX", { numeric: "auto" });

export function timeAgo(iso: string, now = Date.now()): string {
  const diff = (new Date(iso).getTime() - now) / 1000;
  const abs = Math.abs(diff);
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), "hour");
  if (abs < 86400 * 30) return rtf.format(Math.round(diff / 86400), "day");
  return rtf.format(Math.round(diff / (86400 * 30)), "month");
}

export function formatResponseTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.round(minutes / 60);
  return `${h} h`;
}

export function clockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}
