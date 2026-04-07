"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"

async function getToken(): Promise<string> {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error("Unauthorized")
  return session.access_token
}

export async function createUser(formData: {
  full_name: string
  email: string
  role: "user" | "admin"
  subscription_tier: "free" | "pro" | "premium"
  subscription_status: "active" | "inactive" | "canceled" | "past_due"
}) {
  const token = await getToken()

  // Note: We need a Supabase Auth UID to create users in the local DB.
  // Admin-inviting a new user still requires Supabase Auth API.
  // Here we only create/update the profile record for existing Auth users.
  const res = await fetch(`${API_BASE}/users/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(formData),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? "Failed to create user")
  }

  revalidatePath("/admin/users")
  return res.json()
}

export async function updateUser(
  userId: string,
  formData: {
    full_name: string
    email: string
    role: "user" | "admin"
    subscription_tier: "free" | "pro" | "premium"
    subscription_status: "active" | "inactive" | "canceled" | "past_due"
  },
) {
  const token = await getToken()

  const res = await fetch(`${API_BASE}/users/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(formData),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? "Failed to update user")
  }

  revalidatePath("/admin/users")
  return res.json()
}

export async function deleteUser(userId: string) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error("Unauthorized")

  // Prevent self-deletion
  if (session.user.id === userId) {
    throw new Error("You cannot delete your own account")
  }

  const res = await fetch(`${API_BASE}/users/${userId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${session.access_token}` },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? "Failed to delete user")
  }

  revalidatePath("/admin/users")
}
