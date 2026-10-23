"use client";

// UI state only. Data lives in Supabase and reaches the client through server
// components and actions; the feed filters persist per browser.

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useSyncExternalStore } from "react";
import type { DistanceFilter } from "@/lib/geo";
import type { Listing } from "@/lib/types";

export type FeedMode = "todo" | "busco" | "ofrezco";

export type Moment =
  | { kind: "match"; conversationId: string; mine: Listing; theirs: Listing; otherName: string }
  | { kind: "badges"; ids: string[] };

interface State {
  feedMode: FeedMode;
  distance: DistanceFilter;
  moment: Moment | null;
  toast: string | null;
  setFeedMode: (mode: FeedMode) => void;
  setDistance: (d: DistanceFilter) => void;
  showMoment: (m: Moment) => void;
  dismissMoment: () => void;
  showToast: (text: string | null) => void;
}

export const useStore = create<State>()(
  persist(
    (set) => ({
      feedMode: "todo",
      distance: "nacional",
      moment: null,
      toast: null,
      setFeedMode: (feedMode) => set({ feedMode }),
      setDistance: (distance) => set({ distance }),
      showMoment: (moment) => set({ moment }),
      dismissMoment: () => set({ moment: null }),
      showToast: (toast) => set({ toast }),
    }),
    {
      name: "truxanger-ui",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ feedMode: s.feedMode, distance: s.distance }),
    },
  ),
);

const noopSubscribe = () => () => {};

/** False on the server and during hydration, true after: gate anything read from localStorage. */
export function useMounted(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}
