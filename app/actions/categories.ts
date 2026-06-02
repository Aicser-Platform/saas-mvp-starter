"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"

async function getToken(): Promise<string> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error("Unauthorized")
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error("Unauthorized")
  return session.access_token
}

export async function getCategories() {
  const token = await getToken()
  const res = await fetch(`${API_BASE}/categories/`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })
  if (!res.ok) return []
  return res.json()
}

export async function createCategory(data: { name: string; description?: string }) {
  const token = await getToken()
  const res = await fetch(`${API_BASE}/categories/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const detail = err.detail
    const msg = typeof detail === "string" ? detail : Array.isArray(detail) ? detail.map((d: { msg: string }) => d.msg).join(", ") : `Failed to create category (${res.status})`
    throw new Error(msg)
  }
  revalidatePath("/admin/categories")
  return res.json()
}

export async function updateCategory(id: string, data: { name?: string; description?: string }) {
  const token = await getToken()
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? "Failed to update category")
  }
  revalidatePath("/admin/categories")
  return res.json()
}

export async function deleteCategory(id: string) {
  const token = await getToken()
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? "Failed to delete category")
  }
  revalidatePath("/admin/categories")
}
