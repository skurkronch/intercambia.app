"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL, supabaseConfigured } from "./env";

let client: SupabaseClient | null = null;

/** Browser client for auth, photo uploads and realtime. Null until Supabase is configured. */
export function supabaseBrowser(): SupabaseClient | null {
  if (!supabaseConfigured) return null;
  return (client ??= createBrowserClient(SUPABASE_URL, SUPABASE_KEY));
}
