// Data access. Every function is async so phase 2 can swap the seed arrays
// for Supabase queries without touching the pages that call them.

import { CATEGORIES, CITIES, getCategory } from "@/lib/data/catalog";
import { CURRENT_USER_ID, LISTINGS, REVIEWS, SPONSORS, USERS } from "@/lib/data/seed";
import { normalize } from "@/lib/match";
import type { CategorySlug, Listing, Review, Sponsor, User } from "@/lib/types";

const userById = new Map(USERS.map((u) => [u.id, u]));
const listingById = new Map(LISTINGS.map((l) => [l.id, l]));
const listingBySlug = new Map(LISTINGS.map((l) => [l.slug, l]));

const byNewest = (a: Listing, b: Listing) => b.createdAt.localeCompare(a.createdAt);

/** Listings other people can see: everyone's active ones, newest first. */
function publicListings(): Listing[] {
  return LISTINGS.filter((l) => l.status === "activo" && l.ownerId !== CURRENT_USER_ID).sort(byNewest);
}

export async function getRecentListings(limit = 12): Promise<Listing[]> {
  return publicListings().slice(0, limit);
}

export async function getListingBySlug(slug: string): Promise<Listing | undefined> {
  return listingBySlug.get(slug);
}

export async function getListingsByCategory(slug: CategorySlug): Promise<Listing[]> {
  return publicListings().filter((l) => l.category === slug);
}

export async function getListingsByCity(slug: string): Promise<Listing[]> {
  return publicListings().filter((l) => l.citySlug === slug);
}

export async function getRelatedListings(listing: Listing, limit = 4): Promise<Listing[]> {
  return publicListings()
    .filter((l) => l.id !== listing.id)
    .sort((a, b) => Number(b.category === listing.category) - Number(a.category === listing.category))
    .slice(0, limit);
}

export async function searchListings(q: string, category?: CategorySlug): Promise<Listing[]> {
  const terms = normalize(q).split(/\s+/).filter(Boolean);
  return publicListings().filter((l) => {
    if (category && l.category !== category) return false;
    if (!terms.length) return true;
    const hay = normalize(`${l.title} ${l.neighborhood} ${getCategory(l.category)?.name ?? ""} ${l.wants.join(" ")}`);
    return terms.every((t) => hay.includes(t));
  });
}

export async function getAllListingSlugs(): Promise<string[]> {
  return publicListings().map((l) => l.slug);
}

export async function getUser(id: string): Promise<User | undefined> {
  return userById.get(id);
}

export async function getReviewsFor(userId: string): Promise<Review[]> {
  return REVIEWS.filter((r) => r.targetId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getSponsors(): Promise<Sponsor[]> {
  return SPONSORS;
}

/** Categories and cities that have at least one public listing, for nav and sitemaps. */
export async function getActiveCategories() {
  const used = new Set(publicListings().map((l) => l.category));
  return CATEGORIES.filter((c) => used.has(c.slug));
}

export async function getActiveCities() {
  const used = new Set(publicListings().map((l) => l.citySlug));
  return CITIES.filter((c) => used.has(c.slug));
}

// Synchronous lookups for client components that already hold seed data.
export const lookup = {
  user: (id: string) => userById.get(id),
  listing: (id: string) => listingById.get(id),
};
