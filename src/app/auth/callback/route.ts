import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

// Magic links and Google both land here with ?code=; we trade it for a session cookie.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/descubre";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/descubre";

  if (code) {
    const db = await supabaseServer();
    const { data, error } = await db.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      const { data: profile } = await db.from("profiles").select("username, city_slug").eq("id", data.user.id).maybeSingle();
      const complete = Boolean(profile?.username && profile?.city_slug);
      return NextResponse.redirect(new URL(complete ? next : `/bienvenida?next=${encodeURIComponent(next)}`, origin));
    }
  }
  return NextResponse.redirect(new URL(`/entrar?error=1&next=${encodeURIComponent(next)}`, origin));
}
