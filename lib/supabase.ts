import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/* ------------------------------------------------------------
   Utility ─ Throw a proper Error instead of a bare object
-------------------------------------------------------------*/
export function throwIfSupabaseError(error: unknown) {
  if (!error) return
  // Supabase returns `{ message, details, hint, code }`
  const supaErr = error as { message?: string; [k: string]: unknown }
  throw new Error(supaErr.message ?? "Unknown Supabase error")
}

export type Student = {
  id: string
  name: string
  age: number
  course: string
  created_at: string
}
