"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { newlyEarned } from "@/lib/badges";
import { CATEGORIES, CITIES, CONDITIONS, getCity } from "@/lib/data/catalog";
import { findMatch } from "@/lib/match";
import { getMyListings, getStats, getUser, getViewer, toListing } from "@/lib/repo";
import { supabaseServer } from "@/lib/supabase/server";
import type { CategorySlug, Condition, Currency, Listing, SwipeAction } from "@/lib/types";

export type SwipeResult =
  | { kind: "auth" }
  | { kind: "ok" }
  | { kind: "own" }
  | { kind: "match"; conversationId: string; mine: Listing; theirs: Listing; otherName: string }
  | { kind: "interest"; ownerName: string; hasOffer: boolean };

/** Records a swipe. A right swipe opens a conversation when the owner wants something I offer (PRD condition A). */
export async function swipeListing(listingId: string, action: SwipeAction): Promise<SwipeResult> {
  const viewer = await getViewer();
  if (!viewer) return { kind: "auth" };
  const db = await supabaseServer();

  const { data: row } = await db.from("listings").select("*").eq("id", listingId).maybeSingle();
  if (!row) return { kind: "ok" };
  const theirs = toListing(row);
  if (theirs.ownerId === viewer.id) return { kind: "own" };

  const { error } = await db.from("swipes").upsert({ user_id: viewer.id, listing_id: listingId, action });
  if (error) throw new Error("No pudimos guardar tu respuesta. Inténtalo de nuevo.");
  if (action !== "want") return { kind: "ok" };

  const mine = await getMyListings(viewer.id);
  const match = findMatch(theirs, mine);
  const owner = await getUser(theirs.ownerId);
  const ownerName = owner?.displayName ?? "su dueño";
  if (!match) return { kind: "interest", ownerName, hasOffer: mine.some((l) => l.status === "activo") };

  const { data: conversationId, error: matchError } = await db.rpc("create_match", { p_their_listing: theirs.id, p_my_listing: match.mine.id });
  if (matchError || !conversationId) return { kind: "interest", ownerName, hasOffer: true };
  revalidatePath("/mensajes");
  return { kind: "match", conversationId: conversationId as string, mine: match.mine, theirs, otherName: ownerName };
}

export async function undoSwipe(listingId: string): Promise<void> {
  const viewer = await getViewer();
  if (!viewer) return;
  const db = await supabaseServer();
  await db.from("swipes").delete().eq("user_id", viewer.id).eq("listing_id", listingId);
}

export async function resetPasses(): Promise<void> {
  const viewer = await getViewer();
  if (!viewer) return;
  const db = await supabaseServer();
  await db.from("swipes").delete().eq("user_id", viewer.id).eq("action", "pass");
  revalidatePath("/descubre");
}

// ---------- Publishing ----------

export interface NewListing {
  id: string;
  title: string;
  description: string;
  category: CategorySlug;
  condition: Condition;
  value: number | null;
  currency: Currency;
  /** Storage paths already uploaded under <viewer id>/<listing id>/. */
  photos: string[];
  wants: string[];
  openToAnything: boolean;
  acceptsCash: boolean;
  neighborhood: string;
}

function slugify(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90);
}

export async function createListing(input: NewListing): Promise<{ slug: string } | { error: string }> {
  const viewer = await getViewer();
  if (!viewer) return { error: "Tu sesión terminó. Entra de nuevo para publicar." };
  const p = viewer.profile;

  const title = input.title.trim();
  if (title.length < 3 || title.length > 80) return { error: "El título debe tener entre 3 y 80 letras." };
  if (!CATEGORIES.some((c) => c.slug === input.category)) return { error: "Elige una categoría." };
  if (!CONDITIONS.some((c) => c.value === input.condition)) return { error: "Elige el estado del objeto." };
  const prefix = `${viewer.id}/${input.id}/`;
  if (!input.photos.length || input.photos.length > 6 || input.photos.some((x) => !x.startsWith(prefix))) {
    return { error: "Sube entre 1 y 6 fotos." };
  }
  const wants = input.openToAnything ? [] : input.wants.map((w) => w.trim()).filter(Boolean).slice(0, 5);
  if (!input.openToAnything && !wants.length) return { error: "Elige al menos una cosa o marca «Abierto a todo»." };

  const city = getCity(p.citySlug) ?? CITIES[0];
  const location = p.location ?? city.center;
  const slug = `${slugify(title) || "objeto"}-${input.id.slice(0, 6)}`;

  const db = await supabaseServer();
  const { error } = await db.from("listings").insert({
    id: input.id,
    owner_id: viewer.id,
    slug,
    title,
    description: input.description.trim().slice(0, 1000),
    category: input.category,
    condition: input.condition,
    value: input.value !== null && Number.isFinite(input.value) ? Math.max(0, Math.round(input.value)) : null,
    currency: input.currency,
    photos: input.photos,
    wants,
    open_to_anything: input.openToAnything,
    accepts_cash: input.acceptsCash,
    city_slug: city.slug,
    neighborhood: (input.neighborhood.trim() || p.neighborhood).slice(0, 60),
    lat: location.lat,
    lng: location.lng,
  });
  if (error) return { error: "No pudimos publicar. Revisa tu conexión e inténtalo de nuevo." };

  revalidatePath("/");
  revalidatePath(`/categoria/${input.category}`);
  revalidatePath(`/ciudad/${city.slug}`);
  revalidatePath("/perfil");
  return { slug };
}

// ---------- Chat and trades ----------

export async function sendMessage(matchId: string, body: string) {
  const viewer = await getViewer();
  const text = body.trim().slice(0, 2000);
  if (!viewer || !text) return null;
  const db = await supabaseServer();
  const { data, error } = await db.from("messages").insert({ match_id: matchId, sender_id: viewer.id, body: text }).select().single();
  if (error) throw new Error("No se envió. Inténtalo de nuevo.");
  return { id: data.id as number, senderId: viewer.id, kind: "text" as const, body: text, createdAt: data.created_at as string, readAt: null };
}

export async function markConversationRead(matchId: string): Promise<void> {
  const viewer = await getViewer();
  if (!viewer) return;
  const db = await supabaseServer();
  await db.from("messages").update({ read_at: new Date().toISOString() }).eq("match_id", matchId).neq("sender_id", viewer.id).is("read_at", null);
}

/** My confirmation. When it closes the trade, returns the badges it unlocked for me. */
export async function confirmTrade(matchId: string): Promise<{ status: string; earned: string[] }> {
  const viewer = await getViewer();
  if (!viewer) return { status: "negociando", earned: [] };
  const before = await getStats(viewer.id);
  const db = await supabaseServer();
  const { data: status, error } = await db.rpc("confirm_trade", { p_match: matchId });
  if (error) throw new Error("No pudimos confirmar. Inténtalo de nuevo.");
  revalidatePath(`/mensajes/${matchId}`);
  if (status !== "cerrado") return { status: status as string, earned: [] };
  const after = await getStats(viewer.id);
  revalidatePath("/perfil");
  return { status: "cerrado", earned: newlyEarned(before, after).map((b) => b.def.id) };
}

export async function rateTrade(matchId: string, targetId: string, stars: number, body: string): Promise<{ error?: string }> {
  const viewer = await getViewer();
  if (!viewer) return { error: "Tu sesión terminó." };
  const db = await supabaseServer();
  const { error } = await db.from("reviews").insert({
    match_id: matchId, author_id: viewer.id, target_id: targetId,
    stars: Math.min(5, Math.max(1, Math.round(stars))), body: body.trim().slice(0, 280),
  });
  if (error) return { error: "No pudimos guardar tu calificación." };
  revalidatePath(`/mensajes/${matchId}`);
  return {};
}

// ---------- Profile ----------

export async function markBadgesSeen(ids: string[]): Promise<void> {
  const viewer = await getViewer();
  if (!viewer || !ids.length) return;
  const db = await supabaseServer();
  const seen = [...new Set([...viewer.profile.seenBadges, ...ids])];
  await db.from("profiles").update({ seen_badges: seen }).eq("id", viewer.id);
}

export interface ProfileInput {
  username: string;
  displayName: string;
  citySlug: string;
  neighborhood: string;
  bio: string;
  wants: string[];
  location: { lat: number; lng: number } | null;
}

export async function saveProfile(input: ProfileInput, next: string): Promise<{ error: string } | never> {
  const viewer = await getViewer();
  if (!viewer) redirect("/entrar");
  const username = input.username.trim().toLowerCase();
  if (!/^[a-z0-9_.]{3,24}$/.test(username)) return { error: "Tu usuario debe tener de 3 a 24 letras minúsculas, números, punto o guion bajo." };
  const displayName = input.displayName.trim();
  if (!displayName) return { error: "Escribe cómo quieres que te vean." };
  const city = getCity(input.citySlug);
  if (!city) return { error: "Elige tu ciudad." };
  const location = input.location ?? viewer.profile.location ?? city.center;

  const db = await supabaseServer();
  const { error } = await db
    .from("profiles")
    .update({
      username, display_name: displayName.slice(0, 40), city_slug: city.slug,
      neighborhood: input.neighborhood.trim().slice(0, 60), bio: input.bio.trim().slice(0, 280),
      wants: input.wants.map((w) => w.trim()).filter(Boolean).slice(0, 5),
      lat: location.lat, lng: location.lng,
    })
    .eq("id", viewer.id);
  if (error) {
    return { error: error.code === "23505" ? "Ese usuario ya existe. Prueba con otro." : "No pudimos guardar tu perfil. Inténtalo de nuevo." };
  }
  revalidatePath("/perfil");
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/descubre");
}

export async function signOut(): Promise<void> {
  const db = await supabaseServer();
  await db.auth.signOut();
  redirect("/");
}
