"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidateTag } from "next/cache"
import type { LessonResource } from "@/lib/types"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"

async function getToken(): Promise<string> {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error("Unauthorized")
  return session.access_token
}

export async function createLesson(formData: {
  course_id: string
  title: string
  content?: string
  video_url?: string
  order_index?: number
  resources?: LessonResource[]
}) {
  const token = await getToken()

  const res = await fetch(`${API_BASE}/lessons/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(formData),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? "Failed to create lesson")
  }

  // @ts-expect-error false positive
  revalidateTag("lessons")
  return res.json()
}

export async function updateLesson(
  lessonId: string,
  formData: {
    title?: string
    content?: string
    video_url?: string
    order_index?: number
    resources?: LessonResource[]
  },
) {
  const token = await getToken()

  const res = await fetch(`${API_BASE}/lessons/${lessonId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(formData),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? "Failed to update lesson")
  }

  // @ts-expect-error false positive
  revalidateTag("lessons")
  return res.json()
}

export async function deleteLesson(lessonId: string) {
  const token = await getToken()

  const res = await fetch(`${API_BASE}/lessons/${lessonId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? "Failed to delete lesson")
  }

  // @ts-expect-error false positive
  revalidateTag("lessons")
}

export async function reorderLessons(courseId: string, lessonIds: string[]) {
  const token = await getToken()

  const res = await fetch(`${API_BASE}/lessons/reorder`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ course_id: courseId, lesson_ids: lessonIds }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? "Failed to reorder lessons")
  }

  // @ts-expect-error false positive
  revalidateTag("lessons")
  return res.json()
}

export async function uploadFile(file: File): Promise<{ url: string; filename: string; content_type: string }> {
  const token = await getToken()

  const formData = new FormData()
  formData.append("file", file)

  const res = await fetch(`${API_BASE}/lessons/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? "Failed to upload file")
  }

  return res.json()
}
