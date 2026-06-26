/**
 * lib/supabase/admin.ts
 * ---------------------
 * Server-side helpers that call FastAPI using the user's Supabase session token.
 */

import { createClient as createServerClient } from "./server"
import type { User } from "@/lib/types"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"

/**
 * Fetch the profile of the currently logged-in user via FastAPI.
 *
 * Pass `token` (session.access_token) when you already have it to avoid
 * creating a second Supabase server client, which can fail to read cookies
 * in Next.js App Router server components.
 */
export async function getProfileData(userId: string, token?: string): Promise<User | null> {
  let resolvedToken = token ?? null

  if (!resolvedToken) {
    const supabase = await createServerClient()
    const { data: { session } } = await supabase.auth.getSession()
    resolvedToken = session?.access_token ?? null
  }

  if (!resolvedToken) return null

  try {
    const res = await fetch(`${API_BASE}/users/me`, {
      headers: { Authorization: `Bearer ${resolvedToken}` },
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
 * Check if a user is an admin.
 * Pass `token` so we don't need to create a second Supabase server client.
 */
export async function isUserAdmin(userId: string, token?: string): Promise<boolean> {
  const user = await getProfileData(userId, token)
  return user?.role === "admin"
}
