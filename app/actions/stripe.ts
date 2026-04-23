"use server"

import { createClient } from "@/lib/supabase/server"
import type { User } from "@/lib/types"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"

async function getSessionAndProfile(): Promise<{ token: string; profile: User }> {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error("User not authenticated")

  const res = await fetch(`${API_BASE}/users/me`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
    cache: "no-store",
  })
  if (!res.ok) throw new Error("Profile not found")
  const profile: User = await res.json()

  return { token: session.access_token, profile }
}

export async function createCheckoutSession(tier: string) {
  const { token } = await getSessionAndProfile()

  const res = await fetch(`${API_BASE}/stripe/create-checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ tier }),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }))
    const msg = typeof error.detail === "string" ? error.detail : error.detail?.message || "Failed to create checkout"
    throw new Error(msg)
  }

  const data = await res.json()
  return data.checkout_url
}

export async function createPortalSession() {
  const { token } = await getSessionAndProfile()

  const res = await fetch(`${API_BASE}/stripe/create-portal`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }))
    const msg = typeof error.detail === "string" ? error.detail : error.detail?.message || "Failed to create portal session"
    throw new Error(msg)
  }

  const data = await res.json()
  return data.portal_url
}
