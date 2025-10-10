import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import type { AuthUser } from "./authTypes";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase environment variables are not configured");
}

export async function getServerSession(): Promise<{ user: AuthUser | null }> {
  const cookieStore = cookies();

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options?: CookieOptions) {
        cookieStore.set(name, value, options);
      },
      remove(name: string, options?: CookieOptions) {
        cookieStore.delete({ name, ...options });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { user: (user as AuthUser) ?? null };
}

export async function requireAuth(): Promise<AuthUser> {
  const { user } = await getServerSession();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}
