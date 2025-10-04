import { createBrowserClient } from "@supabase/ssr";

// doc: https://supabase.com/docs/guides/auth/server-side/nextjs?queryGroups=router&router=app
export function createSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
