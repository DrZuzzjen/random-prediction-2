import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

let supabaseAdminInstance: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  if (supabaseAdminInstance) {
    return supabaseAdminInstance;
  }

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

  if (!url) {
    throw new Error("Missing SUPABASE_URL environment variable");
  }

  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY environment variable");
  }

  supabaseAdminInstance = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  return supabaseAdminInstance;
}

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    const client = getSupabaseAdmin();
    const value = client[prop as keyof SupabaseClient];
    return typeof value === 'function' ? value.bind(client) : value;
  }
});
