"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidateTag } from "next/cache"

export async function createCourse(formData: {
  title: string
  description: string
  content: string
  difficulty: "beginner" | "intermediate" | "advanced"
  required_tier: "free" | "pro" | "premium"
  thumbnail_url: string
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
    throw new Error("Only admins can create courses")
  }

  const { data, error } = await supabase
    .from("courses")
    .insert([
      {
        title: formData.title,
        description: formData.description,
        content: formData.content,
        difficulty: formData.difficulty,
        required_tier: formData.required_tier,
        thumbnail_url: formData.thumbnail_url,
      },
    ])
    .select()

  if (error) {
    throw new Error(error.message)
  }

  revalidateTag("courses")
  return data
}

export async function updateCourse(
  courseId: string,
  formData: {
    title: string
    description: string
    content: string
    difficulty: "beginner" | "intermediate" | "advanced"
    required_tier: "free" | "pro" | "premium"
    thumbnail_url: string
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
    throw new Error("Only admins can update courses")
  }

  const { data, error } = await supabase
    .from("courses")
    .update({
      title: formData.title,
      description: formData.description,
      content: formData.content,
      difficulty: formData.difficulty,
      required_tier: formData.required_tier,
      thumbnail_url: formData.thumbnail_url,
      updated_at: new Date().toISOString(),
    })
    .eq("id", courseId)
    .select()

  if (error) {
    throw new Error(error.message)
  }

  revalidateTag("courses")
  return data
}

export async function deleteCourse(courseId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    throw new Error("Only admins can delete courses")
  }

  const { error } = await supabase.from("courses").delete().eq("id", courseId)

  if (error) {
    throw new Error(error.message)
  }

  revalidateTag("courses")
}
