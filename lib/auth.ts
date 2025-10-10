import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { AuthUser } from './authTypes';

export async function getServerSession(): Promise<{ user: AuthUser | null }> {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  return { user: user as AuthUser | null };
}

export async function requireAuth(): Promise<AuthUser> {
  const { user } = await getServerSession();

  if (!user) {
    throw new Error('Unauthorized - Please log in');
  }

  return user;
}