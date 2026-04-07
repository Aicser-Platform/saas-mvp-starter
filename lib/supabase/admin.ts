/**
 * lib/supabase/admin.ts
 * ---------------------
 * Server-side helpers that previously queried Supabase DB directly.
 * Now they call FastAPI using the user's Supabase session token.
 */

import { createClient as createServerClient } from "./server"
import type { User } from "@/lib/types"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"

/**
 * Get the current user's access token from their Supabase session
 * (for use in Server Components / server actions).
 */
async function getServerToken(): Promise<string | null> {
  const supabase = await createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

/**
 * Fetch the profile of the currently logged-in user via FastAPI.
 * Returns null if unauthenticated or on any error.
 */
export async function getProfileData(userId: string): Promise<User | null> {
  const token = await getServerToken()
  if (!token) return null

  try {
    const res = await fetch(`${API_BASE}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
    if (!res.ok) return null
    return res.json() as Promise<User>
  } catch (err) {
    console.error("[api] Error fetching user:", err)
    return null
  }
}

/**
 * Check if a user is an admin by fetching their profile.
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  const user = await getProfileData(userId)
  return user?.role === "admin"
}
