// Data access on the server. Public reads use a cookie-free client so public
// pages can be statically generated; viewer reads use the session cookie.

import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { CATEGORIES, CITIES, getCity } from "@/lib/data/catalog";
import { normalize } from "@/lib/match";
import { photoUrl } from "@/lib/supabase/env";
import { supabasePublic, supabaseServer } from "@/lib/supabase/server";
import type { CategorySlug, Conversation, Country, Listing, Message, Review, TradeStats, User } from "@/lib/types";

// ---------- Rows (supabase/migrations) and mappers ----------

interface ListingRow {
  id: string; owner_id: string; slug: string; title: string; description: string;
  category: CategorySlug; condition: Listing["condition"]; value: number | null; currency: Listing["currency"];
  photos: string[]; wants: string[]; open_to_anything: boolean; accepts_cash: boolean; has_video: boolean;
  city_slug: string; neighborhood: string; lat: number | null; lng: number | null;
  status: Listing["status"]; created_at: string;
}

interface ProfileRow {
  id: string; username: string | null; display_name: string; bio: string; city_slug: string | null;
  neighborhood: string; lat: number | null; lng: number | null; wants: string[]; verified: boolean;
  seen_badges: string[]; created_at: string;
}

interface SummaryRow { id: string; exchanges: number; rating: number | string | null; reviews_count: number }

interface MessageRow { id: number; match_id: string; sender_id: string | null; kind: Message["kind"]; body: string; created_at: string; read_at: string | null }

interface MatchRow {
  id: string; user_a: string; user_b: string; listing_a: string | null; listing_b: string | null;
  status: Conversation["status"]; confirmed_a: boolean; confirmed_b: boolean; created_at: string;
}

export function toListing(r: ListingRow): Listing {
  return {
    id: r.id, slug: r.slug, title: r.title, description: r.description, category: r.category, condition: r.condition,
    value: r.value, currency: r.currency,
    photos: r.photos.map(photoUrl).filter((u): u is string => !!u),
    wants: r.wants, openToAnything: r.open_to_anything, acceptsCash: r.accepts_cash, hasVideo: r.has_video,
    ownerId: r.owner_id, citySlug: r.city_slug, neighborhood: r.neighborhood,
    location: r.lat !== null && r.lng !== null ? { lat: r.lat, lng: r.lng } : null,
    status: r.status, createdAt: r.created_at,
  };
}

function toUser(p: ProfileRow, s?: SummaryRow, avgResponseMinutes: number | null = null): User {
  return {
    id: p.id, username: p.username ?? "", displayName: p.display_name || p.username || "Alguien",
    citySlug: p.city_slug ?? "", neighborhood: p.neighborhood, bio: p.bio,
    rating: s?.rating !== null && s?.rating !== undefined ? Number(s.rating) : null,
    reviewsCount: s?.reviews_count ?? 0, exchanges: s?.exchanges ?? 0, avgResponseMinutes,
    verified: p.verified, memberSince: p.created_at, wants: p.wants,
    location: p.lat !== null && p.lng !== null ? { lat: p.lat, lng: p.lng } : null,
  };
}

function toMessage(r: MessageRow): Message {
  return { id: r.id, senderId: r.sender_id, kind: r.kind, body: r.body, createdAt: r.created_at, readAt: r.read_at };
}

// ---------- Public reads ----------

async function activeListings(limit = 500): Promise<Listing[]> {
  const db = supabasePublic();
  if (!db) return [];
  const { data } = await db.from("listings").select("*").eq("status", "activo").order("created_at", { ascending: false }).limit(limit);
  return ((data ?? []) as ListingRow[]).map(toListing);
}

export async function getRecentListings(limit = 12): Promise<Listing[]> {
  return activeListings(limit);
}

export async function getListingBySlug(slug: string): Promise<Listing | undefined> {
  const db = supabasePublic();
  if (!db) return undefined;
  const { data } = await db.from("listings").select("*").eq("slug", slug).maybeSingle();
  return data ? toListing(data as ListingRow) : undefined;
}

export async function getListingsByCategory(slug: CategorySlug): Promise<Listing[]> {
  const db = supabasePublic();
  if (!db) return [];
  const { data } = await db.from("listings").select("*").eq("status", "activo").eq("category", slug).order("created_at", { ascending: false }).limit(200);
  return ((data ?? []) as ListingRow[]).map(toListing);
}

export async function getListingsByCity(slug: string): Promise<Listing[]> {
  const db = supabasePublic();
  if (!db) return [];
  const { data } = await db.from("listings").select("*").eq("status", "activo").eq("city_slug", slug).order("created_at", { ascending: false }).limit(200);
  return ((data ?? []) as ListingRow[]).map(toListing);
}

export async function getRelatedListings(listing: Listing, limit = 4): Promise<Listing[]> {
  const sameCategory = (await getListingsByCategory(listing.category)).filter((l) => l.id !== listing.id);
  if (sameCategory.length >= limit) return sameCategory.slice(0, limit);
  const rest = (await activeListings(limit * 3)).filter((l) => l.id !== listing.id && l.category !== listing.category);
  return [...sameCategory, ...rest].slice(0, limit);
}

/** Accent-insensitive search. Filters in memory while the catalog is small; move to full-text search past a few thousand listings. */
export async function searchListings(q: string, category?: CategorySlug): Promise<Listing[]> {
  const terms = normalize(q).split(/\s+/).filter(Boolean);
  const all = category ? await getListingsByCategory(category) : await activeListings();
  if (!terms.length) return all;
  return all.filter((l) => {
    const hay = normalize(`${l.title} ${l.neighborhood} ${CATEGORIES.find((c) => c.slug === l.category)?.name ?? ""} ${l.wants.join(" ")}`);
    return terms.every((t) => hay.includes(t));
  });
}

export async function getAllListingSlugs(): Promise<string[]> {
  return (await activeListings(5000)).map((l) => l.slug);
}

export async function getUsers(ids: string[]): Promise<User[]> {
  const db = supabasePublic();
  const unique = [...new Set(ids)];
  if (!db || !unique.length) return [];
  const [{ data: profiles }, { data: summaries }] = await Promise.all([
    db.from("profiles").select("*").in("id", unique),
    db.rpc("profile_summaries", { p_ids: unique }),
  ]);
  const byId = new Map(((summaries ?? []) as SummaryRow[]).map((s) => [s.id, s]));
  return ((profiles ?? []) as ProfileRow[]).map((p) => toUser(p, byId.get(p.id)));
}

export async function getUser(id: string): Promise<User | undefined> {
  return (await getUsers([id]))[0];
}

export async function getReviewsFor(userId: string, limit = 10): Promise<Review[]> {
  const db = supabasePublic();
  if (!db) return [];
  const { data } = await db
    .from("reviews")
    .select("id, stars, body, created_at, author:profiles!reviews_author_id_fkey(display_name, username)")
    .eq("target_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  type Row = { id: string; stars: number; body: string; created_at: string; author: { display_name: string; username: string | null } | null };
  return ((data ?? []) as unknown as Row[]).map((r) => ({
    id: r.id, stars: r.stars, text: r.body, createdAt: r.created_at,
    authorName: r.author?.display_name || r.author?.username || "Alguien",
  }));
}

export async function getActiveCategories() {
  const used = new Set((await activeListings()).map((l) => l.category));
  return CATEGORIES.filter((c) => used.has(c.slug));
}

export async function getActiveCities() {
  const used = new Set((await activeListings()).map((l) => l.citySlug));
  return CITIES.filter((c) => used.has(c.slug));
}

// ---------- The signed-in person ----------

export interface Viewer {
  id: string;
  email: string | null;
  profile: User & { seenBadges: string[]; complete: boolean };
}

/** The signed-in person, or null. Cached per request. */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  // Always per request: the answer depends on who is asking.
  await connection();
  if (!supabasePublic()) return null;
  const db = await supabaseServer();
  const { data: auth } = await db.auth.getUser();
  if (!auth.user) return null;
  const { data } = await db.from("profiles").select("*").eq("id", auth.user.id).maybeSingle();
  if (!data) return null;
  const p = data as ProfileRow;
  return {
    id: auth.user.id,
    email: auth.user.email ?? null,
    profile: { ...toUser(p), seenBadges: p.seen_badges, complete: Boolean(p.username && p.city_slug) },
  };
});

/** For pages that need an account with a finished profile. */
export async function requireViewer(next: string): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect(`/entrar?next=${encodeURIComponent(next)}`);
  if (!viewer.profile.complete) redirect(`/bienvenida?next=${encodeURIComponent(next)}`);
  return viewer;
}

export async function getMyListings(viewerId: string): Promise<Listing[]> {
  const db = await supabaseServer();
  const { data } = await db.from("listings").select("*").eq("owner_id", viewerId).order("created_at", { ascending: false });
  return ((data ?? []) as ListingRow[]).map(toListing);
}

/** Everything the badge rules need, from profile_stats(). */
export async function getStats(userId: string): Promise<TradeStats> {
  const db = await supabaseServer();
  const { data } = await db.rpc("profile_stats", { p_user: userId }).maybeSingle();
  type Row = { exchanges: number; rating: number | string | null; reviews_count: number; avg_response_minutes: number | null; trade_cities: string[]; by_category: TradeStats["byCategory"]; verified: boolean };
  const s = data as Row | null;
  const countries = [...new Set((s?.trade_cities ?? []).map((c) => getCity(c)?.country).filter((c): c is Country => !!c))];
  return {
    exchanges: s?.exchanges ?? 0,
    rating: s?.rating !== null && s?.rating !== undefined ? Number(s.rating) : 0,
    reviewsCount: s?.reviews_count ?? 0,
    avgResponseMinutes: s?.avg_response_minutes ?? null,
    countries,
    byCategory: s?.by_category ?? {},
    verified: s?.verified ?? false,
  };
}

/** Descubre: active listings that aren't mine and that I haven't swiped yet, plus what I saved. */
export async function getDiscoverFeed(viewerId: string) {
  const db = await supabaseServer();
  const [{ data: rows }, { data: swipes }] = await Promise.all([
    db.from("listings").select("*").eq("status", "activo").neq("owner_id", viewerId).order("created_at", { ascending: false }).limit(300),
    db.from("swipes").select("listing_id, action").eq("user_id", viewerId),
  ]);
  const all = ((rows ?? []) as ListingRow[]).map(toListing);
  const swiped = new Map(((swipes ?? []) as { listing_id: string; action: string }[]).map((s) => [s.listing_id, s.action]));
  return {
    listings: all.filter((l) => !swiped.has(l.id)),
    saved: all.filter((l) => swiped.get(l.id) === "save"),
  };
}

async function hydrateConversations(viewerId: string, matches: MatchRow[]): Promise<Conversation[]> {
  if (!matches.length) return [];
  const db = await supabaseServer();
  const listingIds = matches.flatMap((m) => [m.listing_a, m.listing_b]).filter((x): x is string => !!x);
  const otherIds = matches.map((m) => (m.user_a === viewerId ? m.user_b : m.user_a));
  const [{ data: listingRows }, others, { data: lastRows }, { data: unreadRows }] = await Promise.all([
    db.from("listings").select("*").in("id", listingIds),
    getUsers(otherIds),
    db.from("messages").select("*").in("match_id", matches.map((m) => m.id)).order("created_at", { ascending: false }).limit(matches.length * 20),
    db.from("messages").select("match_id").in("match_id", matches.map((m) => m.id)).is("read_at", null).neq("sender_id", viewerId),
  ]);
  const listings = new Map(((listingRows ?? []) as ListingRow[]).map((r) => [r.id, toListing(r)]));
  const users = new Map(others.map((u) => [u.id, u]));
  const last = new Map<string, Message>();
  for (const r of (lastRows ?? []) as MessageRow[]) if (!last.has(r.match_id)) last.set(r.match_id, toMessage(r));
  const unread = new Map<string, number>();
  for (const r of (unreadRows ?? []) as { match_id: string }[]) unread.set(r.match_id, (unread.get(r.match_id) ?? 0) + 1);

  return matches
    .map((m): Conversation | null => {
      const iAmA = m.user_a === viewerId;
      const other = users.get(iAmA ? m.user_b : m.user_a);
      if (!other) return null;
      const mineId = iAmA ? m.listing_a : m.listing_b;
      const theirsId = iAmA ? m.listing_b : m.listing_a;
      return {
        id: m.id, other,
        mine: mineId ? listings.get(mineId) ?? null : null,
        theirs: theirsId ? listings.get(theirsId) ?? null : null,
        status: m.status,
        confirmedByMe: iAmA ? m.confirmed_a : m.confirmed_b,
        confirmedByOther: iAmA ? m.confirmed_b : m.confirmed_a,
        lastMessage: last.get(m.id) ?? null,
        unread: unread.get(m.id) ?? 0,
      };
    })
    .filter((c): c is Conversation => !!c)
    .sort((a, b) => (b.lastMessage?.createdAt ?? "").localeCompare(a.lastMessage?.createdAt ?? ""));
}

export async function getConversations(viewerId: string): Promise<Conversation[]> {
  const db = await supabaseServer();
  const { data } = await db.from("matches").select("*").or(`user_a.eq.${viewerId},user_b.eq.${viewerId}`).limit(200);
  return hydrateConversations(viewerId, (data ?? []) as MatchRow[]);
}

export async function getConversation(viewerId: string, id: string) {
  const db = await supabaseServer();
  const { data: match } = await db.from("matches").select("*").eq("id", id).maybeSingle();
  if (!match) return null;
  const [conversation] = await hydrateConversations(viewerId, [match as MatchRow]);
  const [{ data: msgs }, { count }] = await Promise.all([
    db.from("messages").select("*").eq("match_id", id).order("created_at", { ascending: true }).limit(500),
    db.from("reviews").select("id", { count: "exact", head: true }).eq("match_id", id).eq("author_id", viewerId),
  ]);
  return { conversation, messages: ((msgs ?? []) as MessageRow[]).map(toMessage), reviewed: (count ?? 0) > 0 };
}
