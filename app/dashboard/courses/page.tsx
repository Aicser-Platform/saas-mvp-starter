import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { MyLearning } from "@/components/dashboard/my-learning"
import { getProfileData } from "@/lib/supabase/admin"
import type { Course, Progress } from "@/lib/types"
import { Suspense } from "react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"

export default async function CoursesPage() {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) redirect("/auth/login")

  const profile = await getProfileData(session.user.id)
  const token = session.access_token

  // Fetch all courses
  let courses: Course[] = []
  try {
    const res = await fetch(`${API_BASE}/courses/`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
    if (res.ok) courses = await res.json()
  } catch {}

  // Fetch user progress
  let progress: Progress[] = []
  try {
    const res = await fetch(
      `${API_BASE}/course-progress/user/${session.user.id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    )
    if (res.ok) progress = await res.json()
  } catch {}

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Suspense>
        <DashboardHeader profile={profile} />
      </Suspense>
      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-6 shadow-sm">
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="relative space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary-foreground">My Learning</h1>
            <p className="text-sm text-primary-foreground/70">
              Track your courses, progress, and achievements in one place.
            </p>
          </div>
        </div>

        <Suspense>
          <MyLearning
            courses={courses}
            progress={progress}
            userTier={profile?.subscription_tier || "free"}
            subscriptionTier={profile?.subscription_tier || "free"}
          />
        </Suspense>
      </main>
    </div>
  )
}
