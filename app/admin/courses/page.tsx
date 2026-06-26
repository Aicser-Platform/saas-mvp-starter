import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CourseManagementClient } from "@/components/admin/course-management-client"
import { getProfileData } from "@/lib/supabase/admin"
import type { Course } from "@/lib/types"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"

export default async function AdminCoursesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token ?? ""
  const profile = await getProfileData(user.id)

  // Fetch courses from FastAPI
  const coursesRes = await fetch(`${API_BASE}/courses/`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })
  const courses: Course[] = coursesRes.ok ? await coursesRes.json() : []

  // Fetch enrollment counts per course from FastAPI
  const coursesWithStats = await Promise.all(
    courses.map(async (course) => {
      try {
        const progressRes = await fetch(
          `${API_BASE}/course-progress/?course_id=${course.id}&limit=1000`,
          { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
        )
        const progress: Array<{ completed: boolean }> = progressRes.ok
          ? await progressRes.json()
          : []
        return {
          ...course,
          enrollments: progress.length,
          completions: progress.filter((p) => p.completed).length,
        }
      } catch {
        return { ...course, enrollments: 0, completions: 0 }
      }
    }),
  )

  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 p-6 md:p-8 space-y-8">
        <div className="items-center justify-between">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Course Management</h1>
            <p className="text-muted-foreground mt-2">Create, edit, and delete courses</p>
          </div>
          <CourseManagementClient courses={coursesWithStats} />
        </div>
      </main>
    </div>
  )
}
