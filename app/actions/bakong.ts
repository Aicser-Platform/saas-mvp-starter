"use server"

import { createClient } from "@/lib/supabase/server"
import type { User } from "@/lib/types"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"

async function getSessionToken(): Promise<string> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error("User not authenticated")
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error("User not authenticated")
  return session.access_token
}

export async function createKHQRSession(tier: string) {
  const token = await getSessionToken()

  const res = await fetch(`${API_BASE}/bakong/create-khqr`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ tier }),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }))
    const msg = typeof error.detail === "string" ? error.detail : error.detail?.message || "Failed to create KHQR"
    throw new Error(msg)
  }

  return await res.json() as {
    qr_data: string
    md5: string
    payment_id: string
    amount_khr: number
    amount_usd: number
  }
}

export async function checkKHQRPayment(paymentId: string) {
  const token = await getSessionToken()

  const res = await fetch(`${API_BASE}/bakong/check-payment/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }))
    const msg = typeof error.detail === "string" ? error.detail : "Failed to check payment"
    throw new Error(msg)
  }

  return await res.json() as {
    status: "pending" | "paid" | "canceled" | "expired"
    tier?: string
  }
}

export async function cancelKHQRPayment(paymentId: string) {
  const token = await getSessionToken()

  const res = await fetch(`${API_BASE}/bakong/cancel-payment/${paymentId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }))
    const msg = typeof error.detail === "string" ? error.detail : "Failed to cancel payment"
    throw new Error(msg)
  }

  return await res.json() as { status: string }
}
