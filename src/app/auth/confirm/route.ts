import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

// Email links point here with ?token_hash=. Unlike the PKCE code flow, this
// works even when the email opens in a different browser than the one that asked.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = (searchParams.get("type") ?? "email") as EmailOtpType;
  const nextParam = searchParams.get("next") ?? "/descubre";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/descubre";

  if (tokenHash) {
    const db = await supabaseServer();
    const { data, error } = await db.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error && data.user) {
      const { data: profile } = await db.from("profiles").select("username, city_slug").eq("id", data.user.id).maybeSingle();
      const complete = Boolean(profile?.username && profile?.city_slug);
      return NextResponse.redirect(new URL(complete ? next : `/bienvenida?next=${encodeURIComponent(next)}`, origin));
    }
  }
  return NextResponse.redirect(new URL(`/entrar?error=1&next=${encodeURIComponent(next)}`, origin));
}
