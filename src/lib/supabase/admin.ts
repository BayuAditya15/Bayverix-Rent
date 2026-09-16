import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * ⚠️ CRITICAL SECURITY WARNING:
 * 
 * This admin client uses the SUPABASE_SERVICE_ROLE_KEY and completely BYPASSES all
 * Row Level Security (RLS) policies and tenant isolation rules.
 * 
 * RULES:
 * 1. NEVER import or call this file in Client Components.
 * 2. NEVER expose the service role key to any NEXT_PUBLIC_* environment variable.
 * 3. ONLY use this client in secure server-side Route Handlers (e.g. incoming Laravel/Midtrans webhooks,
 *    system cron tasks, or superadmin operations).
 * 4. For standard user operations (Items, Customers, Bookings, Categories), ALWAYS use `src/lib/supabase/server.ts`
 *    so PostgreSQL RLS guarantees tenant data isolation.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.");
  }

  return createSupabaseClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
