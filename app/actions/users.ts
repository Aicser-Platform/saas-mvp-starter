"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createUser(formData: {
  full_name: string
  email: string
  role: "user" | "admin"
  subscription_tier: "free" | "pro" | "premium"
  subscription_status: "active" | "inactive" | "canceled" | "past_due"
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    throw new Error("Only admins can create users")
  }

  // Note: This creates a profile entry but not an auth user
  // For full user creation with auth, you'd need Supabase Admin API
  const { data, error } = await supabase
    .from("profiles")
    .insert([
      {
        full_name: formData.full_name,
        email: formData.email,
        role: formData.role,
        subscription_tier: formData.subscription_tier,
        subscription_status: formData.subscription_status,
      },
    ])
    .select()

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/admin/users")
  return data
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
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    throw new Error("Only admins can update users")
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({
      full_name: formData.full_name,
      email: formData.email,
      role: formData.role,
      subscription_tier: formData.subscription_tier,
      subscription_status: formData.subscription_status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/admin/users")
  return data
}

export async function deleteUser(userId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    throw new Error("Only admins can delete users")
  }

  // Prevent self-deletion
  if (user.id === userId) {
    throw new Error("You cannot delete your own account")
  }

  const { error } = await supabase.from("profiles").delete().eq("id", userId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/admin/users")
}
