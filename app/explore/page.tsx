import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getProfileData } from "@/lib/supabase/admin"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { CourseExplorer } from "@/components/dashboard/course-explorer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Course } from "@/lib/types"
import { Suspense } from "react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) redirect("/auth/login")

  const profile = await getProfileData(session.user.id)
  const token = session.access_token

  let courses: Course[] = []
  try {
    const res = await fetch(`${API_BASE}/courses/`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
    if (res.ok) courses = await res.json()
  } catch {}

  return (
    <div className="flex flex-col min-h-screen">
      <Suspense>
        <DashboardHeader profile={profile} />
      </Suspense>
      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Welcome strip */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back,{" "}
              <span className="text-primary">{profile?.full_name?.split(" ")[0] || "Student"}</span>! 👋
            </h1>
            <p className="text-sm text-muted-foreground">
              {courses.length} courses available · keep exploring
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3">
            {profile?.role === "admin" && (
              <Link href="/admin">
                <Button
                  size="sm"
                  className="bg-red-500/10 text-red-600 hover:bg-red-500/20 font-semibold border border-red-200 dark:border-red-900"
                  variant="ghost"
                >
                  Admin Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>

        <Suspense fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl border bg-card h-72 animate-pulse" />
            ))}
          </div>
        }>
          <CourseExplorer
            courses={courses}
            userTier={profile?.subscription_tier || "free"}
            initialSearch={params.q || ""}
          />
        </Suspense>
      </main>
    </div>
  )
}
