import type { Sponsor } from "@/lib/types";

// Directly sold sponsorships for the swipe stack (design system: Publicidad).
// Edit this list when a sponsor signs; automated ad networks never go here.
export const SPONSORS: Sponsor[] = [
  { id: "s1", brand: "Bicis del Barrio", title: "Afinación completa a mitad de precio", body: "Para la bici que acabas de intercambiar.", url: "https://truxange.com/anunciate", cta: "Conoce más", category: "deportes" },
  { id: "s2", brand: "Café Tlaloc", title: "Tu primer kilo de grano con 20 % menos", body: "Tostado en la Roma cada semana.", url: "https://truxange.com/anunciate", cta: "Conoce más", category: "hogar" },
];
