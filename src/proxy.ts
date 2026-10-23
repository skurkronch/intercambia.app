import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { PROTECTED_PATHS, SUPABASE_KEY, SUPABASE_URL, supabaseConfigured } from "@/lib/supabase/env";

// Refreshes the Supabase session cookie and sends signed-out people to /entrar.
export async function proxy(request: NextRequest) {
  if (!supabaseConfigured) return NextResponse.next();

  // If Supabase falls back to the Site URL, the sign-in code lands on "/": finish it in the callback.
  const code = request.nextUrl.searchParams.get("code");
  if (code && request.nextUrl.pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    return NextResponse.redirect(url);
  }
  if (request.nextUrl.pathname === "/") return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  if (!data.user && PROTECTED_PATHS.some((p) => path === p || path.startsWith(`${p}/`))) {
    const url = request.nextUrl.clone();
    url.pathname = "/entrar";
    url.search = `?next=${encodeURIComponent(path)}`;
    return NextResponse.redirect(url);
  }
  return response;
}

export const config = {
  matcher: ["/", "/descubre/:path*", "/publicar/:path*", "/mensajes/:path*", "/perfil/:path*", "/bienvenida/:path*", "/entrar", "/auth/:path*"],
};
