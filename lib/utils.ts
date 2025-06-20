import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert Supabase’s plain-object errors into real `Error`s **except**
 * when the table hasn’t been created yet (error-code 42P01).
 *
 * This lets the UI load and we can guide the user to run the
 * `scripts/create-students-table.sql` file.
 */
export function throwIfSupabaseError(error?: unknown): void {
  if (!error) return
  const e = error as { code?: string; message?: string; details?: string }

  // 42P01  ⇒  “relation … does not exist”
  if (e?.code === "42P01") {
    // Silently ignore; the caller can decide what to do.
    return
  }

  const pretty =
    e?.message?.trim() || (typeof e?.details === "string" && e.details.trim()) || JSON.stringify(e, null, 2)

  throw new Error(pretty)
}
