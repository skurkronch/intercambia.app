"use client";

// Client state for the signed-in person. Until phase 2 it lives in
// localStorage; every action here maps to a future Supabase mutation.

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useSyncExternalStore } from "react";
import { newlyEarned, type BadgeStatus } from "@/lib/badges";
import { CURRENT_USER_STATS, LISTINGS, SEED_CONVERSATIONS, CURRENT_USER_ID } from "@/lib/data/seed";
import { findMatch, type MatchResult } from "@/lib/match";
import type { DistanceFilter } from "@/lib/geo";
import type { Conversation, Listing, Message, SwipeAction, TradeStats } from "@/lib/types";
import { lookup } from "@/lib/repo";

export type FeedMode = "todo" | "busco" | "ofrezco";

export type Moment =
  | { kind: "match"; match: MatchResult }
  | { kind: "badges"; badges: BadgeStatus[] };

interface SwipeRecord {
  key: string;
  action: SwipeAction;
}

interface State {
  swipes: SwipeRecord[];
  myListings: Listing[];
  conversations: Conversation[];
  stats: TradeStats;
  interests: string[];
  newBadgeIds: string[];
  feedMode: FeedMode;
  distance: DistanceFilter;
  // Transient UI (not persisted)
  moment: Moment | null;
  toast: string | null;

  swipe: (key: string, action: SwipeAction) => void;
  undo: () => void;
  resetDeck: () => void;
  /** Right swipe or "Lo quiero" on a listing: a match or an interest ping. */
  want: (listing: Listing) => void;
  save: (listing: Listing) => void;
  publish: (listing: Listing) => void;
  startConversation: (match: MatchResult) => string;
  sendMessage: (conversationId: string, text: string) => void;
  markRead: (conversationId: string) => void;
  confirmTrade: (conversationId: string) => void;
  closeTrade: (conversationId: string) => void;
  rateTrade: (conversationId: string, stars: number) => void;
  setFeedMode: (mode: FeedMode) => void;
  setDistance: (d: DistanceFilter) => void;
  clearNewBadges: () => void;
  showToast: (text: string | null) => void;
  dismissMoment: () => void;
}

const nowIso = () => new Date().toISOString();
const msg = (from: Message["from"], text: string): Message => ({ id: Math.random().toString(36).slice(2), from, text, at: nowIso() });

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      swipes: [],
      myListings: LISTINGS.filter((l) => l.ownerId === CURRENT_USER_ID),
      conversations: SEED_CONVERSATIONS,
      stats: CURRENT_USER_STATS,
      interests: [],
      newBadgeIds: [],
      feedMode: "todo",
      distance: "nacional",
      moment: null,
      toast: null,

      swipe: (key, action) => set((s) => ({ swipes: [...s.swipes.filter((x) => x.key !== key), { key, action }] })),
      undo: () => set((s) => ({ swipes: s.swipes.slice(0, -1) })),
      resetDeck: () => set((s) => ({ swipes: s.swipes.filter((x) => x.action === "save") })),

      want: (listing) => {
        const match = findMatch(listing, get().myListings);
        if (match) {
          set({ moment: { kind: "match", match } });
          return;
        }
        const owner = lookup.user(listing.ownerId);
        set((s) => ({ interests: s.interests.includes(listing.id) ? s.interests : [...s.interests, listing.id] }));
        get().showToast(`Le avisamos a ${owner?.displayName ?? "su dueño"} que te interesa. Si le late algo tuyo, se abre el chat.`);
      },

      save: () => get().showToast("Guardado. Lo encuentras en tu perfil."),

      publish: (listing) => set((s) => ({ myListings: [listing, ...s.myListings] })),

      startConversation: (match) => {
        const existing = get().conversations.find((c) => c.theirListingId === match.theirs.id);
        if (existing) return existing.id;
        const id = `c-${match.theirs.id}-${Date.now().toString(36)}`;
        const conv: Conversation = {
          id,
          otherUserId: match.theirs.ownerId,
          theirListingId: match.theirs.id,
          myListingId: match.mine.id,
          unread: 0,
          trade: "negociando",
          messages: [
            msg("system", "¡Hay trueque! Ya pueden negociar los detalles."),
            msg("me", `Hola, te propongo mi ${match.mine.title} por tu ${match.theirs.title}. ¿Te late?`),
          ],
        };
        set((s) => ({ conversations: [conv, ...s.conversations] }));
        return id;
      },

      sendMessage: (conversationId, text) =>
        set((s) => ({
          conversations: s.conversations.map((c) => (c.id === conversationId ? { ...c, messages: [...c.messages, msg("me", text)] } : c)),
        })),

      markRead: (conversationId) =>
        set((s) => ({ conversations: s.conversations.map((c) => (c.id === conversationId ? { ...c, unread: 0 } : c)) })),

      confirmTrade: (conversationId) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === conversationId
              ? { ...c, trade: "confirmado-por-mi", messages: [...c.messages, msg("system", "Confirmaste el trueque. Falta que la otra persona confirme.")] }
              : c,
          ),
        })),

      closeTrade: (conversationId) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === conversationId ? { ...c, trade: "cerrado", messages: [...c.messages, msg("system", "¡Trueque cerrado! Ambos confirmaron.")] } : c,
          ),
        })),

      rateTrade: (conversationId, stars) => {
        const conv = get().conversations.find((c) => c.id === conversationId);
        if (!conv) return;
        const theirs = lookup.listing(conv.theirListingId);
        const other = lookup.user(conv.otherUserId);
        const before = get().stats;
        const country = other ? (other.citySlug === "los-angeles" || other.citySlug === "houston" ? "US" : "MX") : "MX";
        const after: TradeStats = {
          ...before,
          exchanges: before.exchanges + 1,
          countries: before.countries.includes(country) ? before.countries : [...before.countries, country],
          byCategory: theirs ? { ...before.byCategory, [theirs.category]: (before.byCategory[theirs.category] ?? 0) + 1 } : before.byCategory,
        };
        const earned = newlyEarned(before, after);
        set((s) => ({
          stats: after,
          newBadgeIds: [...s.newBadgeIds, ...earned.map((b) => b.def.id)],
          conversations: s.conversations.map((c) =>
            c.id === conversationId ? { ...c, trade: "calificado", messages: [...c.messages, msg("system", `Calificaste con ${stars} de 5. ¡Gracias!`)] } : c,
          ),
          moment: earned.length ? { kind: "badges", badges: earned } : s.moment,
        }));
      },

      setFeedMode: (feedMode) => set({ feedMode }),
      setDistance: (distance) => set({ distance }),
      clearNewBadges: () => set({ newBadgeIds: [] }),
      showToast: (toast) => set({ toast }),
      dismissMoment: () => set({ moment: null }),
    }),
    {
      name: "truxanger-v1",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        swipes: s.swipes,
        myListings: s.myListings,
        conversations: s.conversations,
        stats: s.stats,
        interests: s.interests,
        newBadgeIds: s.newBadgeIds,
        feedMode: s.feedMode,
        distance: s.distance,
      }),
    },
  ),
);

const noopSubscribe = () => () => {};

/** False on the server and during hydration, true after: gate anything read from localStorage. */
export function useMounted(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}
