import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { CourseManagementClient } from "@/components/admin/course-management-client"
import { getProfileData } from "@/lib/supabase/admin"
import type { Course } from "@/lib/types"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"

export default async function AdminCoursesPage() {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) redirect("/auth/login")

  const profile = await getProfileData(session.user.id)
  if (profile?.role !== "admin") redirect("/dashboard")

  const token = session.access_token

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
    <div className="flex flex-col min-h-screen">
      <AdminHeader profile={profile} />
      <main className="flex-1 p-6 md:p-8 space-y-8">
        <div className="items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Course Management</h1>
            <p className="text-muted-foreground mt-2">Create, edit, and delete courses</p>
          </div>
          <CourseManagementClient courses={coursesWithStats} />
        </div>
      </main>
    </div>
  )
}
