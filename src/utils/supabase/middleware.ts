// utils/supabase/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Vérifie si le pathname correspond exactement à une route ou ses sous-routes
 * @example
 * matchRoute('/admin', '/admin') => true
 * matchRoute('/admin', '/admin/settings') => true
 * matchRoute('/admin', '/adminfake') => false
 */
function matchRoute(base: string, pathname: string): boolean {
  return pathname === base || pathname.startsWith(`${base}/`);
}

/**
 * Vérifie si le pathname correspond à une des routes dans le tableau
 */
function matchRoutes(bases: string[], pathname: string): boolean {
  return bases.some((base) => matchRoute(base, pathname));
}
// ⚠️ Ne fait QUE rafraîchir la session + synchroniser les cookies.
// Aucune logique de redirection ici.
export async function updateSession(request: NextRequest) {
  // → Crée un objet réponse par défaut que Next.js utilisera si tout va bien.
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // Garde "PUBLISHABLE_KEY" pour coller aux docs (équiv. anon)
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          // IMPORTANT : reconstruire une réponse et y recopier les cookies
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );
  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  // IMPORTANT: DO NOT REMOVE auth.getUser()
  // Revalide côté Auth (déclenche refresh si besoin)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;
  // === Définir les zones avec matchRoute (safe) ===
  const isProtected = matchRoutes(["/admin", "/dashboard"], pathname);
  const isAuth = matchRoutes(["/login", "/signup"], pathname);

  // === RÈGLE 1: Protéger les routes privées ===
  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // Garder l'URL de destination pour après login
    url.searchParams.set("next", pathname + (search || ""));
    return NextResponse.redirect(url);
  }

  // === RÈGLE 2: Empêcher login/signup si déjà connecté ===
  if (user && isAuth) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard"; // ou '/' selon ton choix
    url.search = "";
    return NextResponse.redirect(url);
  }

  // === RÈGLE 3: Tout le reste est public ===
  // (/, /about, etc.) + /auth pour les callbacks
  return supabaseResponse;
}
