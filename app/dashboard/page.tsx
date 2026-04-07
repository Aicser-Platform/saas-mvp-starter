import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getProfileData } from "@/lib/supabase/admin"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { CourseList } from "@/components/dashboard/course-list"
import { RecentProgress } from "@/components/dashboard/recent-progress"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Course, Progress } from "@/lib/types"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) redirect("/auth/login")

  const profile = await getProfileData(session.user.id)
  const token = session.access_token

  // Get courses from FastAPI
  let courses: Course[] = []
  try {
    const res = await fetch(`${API_BASE}/courses/`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
    if (res.ok) courses = await res.json()
  } catch {}

  // Get user's progress from FastAPI
  let progress: Progress[] = []
  try {
    const res = await fetch(`${API_BASE}/course-progress/user/${session.user.id}?limit=5`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
    if (res.ok) progress = await res.json()
  } catch {}

  const coursesInProgress = progress.filter((p) => !p.completed && p.progress_percentage > 0)
  const completedCourses = progress.filter((p) => p.completed)

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader profile={profile} />
      <main className="flex-1 p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto w-full">
        <div className="space-y-2 flex justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              Welcome back, {profile?.full_name || "Student"}!
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">Continue your AI learning journey</p>
          </div>
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <Link href="/admin">
              <Button className="bg-red-500/10 text-sm font-medium text-red-600 hover:bg-red-500/30 transition-colors" size="sm">
                Admin Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <DashboardStats
          totalCourses={courses.length}
          inProgress={coursesInProgress.length}
          completed={completedCourses.length}
          subscriptionTier={profile?.subscription_tier || "free"}
        />

        {coursesInProgress.length > 0 && <RecentProgress progress={coursesInProgress} />}

        <CourseList courses={courses} userTier={profile?.subscription_tier || "free"} userId={session.user.id} />
      </main>
    </div>
  )
}
