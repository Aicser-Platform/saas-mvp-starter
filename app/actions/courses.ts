"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidateTag } from "next/cache"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"

async function getToken(): Promise<string> {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error("Unauthorized")
  return session.access_token
}

export async function createCourse(formData: {
  title: string
  description: string
  content: string
  difficulty: "beginner" | "intermediate" | "advanced"
  required_plan_id?: string | null
  thumbnail_url: string
}) {
  const token = await getToken()

  const res = await fetch(`${API_BASE}/courses/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(formData),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? "Failed to create course")
  }

  // @ts-expect-error false positive
  revalidateTag("courses")
  return res.json()
}

export async function updateCourse(
  courseId: string,
  formData: {
    title: string
    description: string
    content: string
    difficulty: "beginner" | "intermediate" | "advanced"
    required_plan_id?: string | null
    thumbnail_url: string
  },
) {
  const token = await getToken()

  const res = await fetch(`${API_BASE}/courses/${courseId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(formData),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? "Failed to update course")
  }

  // @ts-expect-error false positive
  revalidateTag("courses")
  return res.json()
}

export async function deleteCourse(courseId: string) {
  const token = await getToken()

  const res = await fetch(`${API_BASE}/courses/${courseId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? "Failed to delete course")
  }

  // @ts-expect-error false positive
  revalidateTag("courses")
}

export async function uploadCourseFile(formData: FormData): Promise<{ url: string }> {
  const token = await getToken()

  const res = await fetch(`${API_BASE}/lessons/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData, // multipart/form-data — don't set Content-Type manually
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? "File upload failed")
  }

  return res.json()
}
