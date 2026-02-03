import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getProfileData } from "@/lib/supabase/admin"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { CourseList } from "@/components/dashboard/course-list"
import { RecentProgress } from "@/components/dashboard/recent-progress"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const profile = await getProfileData(user.id)

  // Get courses
  const { data: courses } = await supabase.from("courses").select("*").order("created_at", { ascending: false })

  // Get user progress
  const { data: progress } = await supabase
    .from("progress")
    .select("*, courses(*)")
    .eq("user_id", user.id)
    .order("last_accessed", { ascending: false })
    .limit(5)

  const coursesInProgress = progress?.filter((p) => !p.completed && p.progress_percentage > 0) || []
  const completedCourses = progress?.filter((p) => p.completed) || []

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader profile={profile} />
      <main className="flex-1 p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto w-full">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            Welcome back, {profile?.full_name || "Student"}!
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">Continue your AI learning journey</p>
        </div>

        <DashboardStats
          totalCourses={courses?.length || 0}
          inProgress={coursesInProgress.length}
          completed={completedCourses.length}
          subscriptionTier={profile?.subscription_tier || "free"}
        />

        {coursesInProgress.length > 0 && <RecentProgress progress={coursesInProgress} />}

        <CourseList courses={courses || []} userTier={profile?.subscription_tier || "free"} userId={user.id} />
      </main>
    </div>
  )
}
