// Supabase project settings. The anon (or "publishable") key is public by design;
// row level security in supabase/migrations protects the data.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

export const PHOTO_BUCKET = "listing-photos";

/** Public URL of a listing photo. Demo rows store "demo:<category>" and render a placeholder. */
export function photoUrl(path: string): string | null {
  if (!path || path.startsWith("demo:")) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/${PHOTO_BUCKET}/${path}`;
}

/** Routes that need a signed-in person. */
export const PROTECTED_PATHS = ["/descubre", "/publicar", "/mensajes", "/perfil", "/bienvenida"];
