"use client";

// One shared subscription for the unread-messages badge, used by both navs.
import { useSyncExternalStore } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

let count = 0;
let started = false;
const listeners = new Set<() => void>();

function emit(n: number) {
  count = n;
  listeners.forEach((l) => l());
}

function start() {
  const db = supabaseBrowser();
  if (started || !db) return;
  started = true;
  let me: string | null = null;

  const refresh = async () => {
    if (!me) return emit(0);
    const { count: n } = await db.from("messages").select("id", { count: "exact", head: true }).is("read_at", null).neq("sender_id", me);
    emit(n ?? 0);
  };

  db.auth.getUser().then(({ data }) => {
    me = data.user?.id ?? null;
    void refresh();
  });
  db.auth.onAuthStateChange((_event, session) => {
    me = session?.user.id ?? null;
    void refresh();
  });
  // Row level security limits these events to my own conversations.
  db.channel("unread-badge").on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => void refresh()).subscribe();
  window.addEventListener("focus", () => void refresh());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  start();
  return () => listeners.delete(listener);
}

export function useUnreadCount(): number {
  return useSyncExternalStore(subscribe, () => count, () => 0);
}
