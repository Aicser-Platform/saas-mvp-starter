import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { CourseList } from "@/components/dashboard/course-list"
import { getProfileData } from "@/lib/supabase/admin"

export default async function CoursesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const profile = await getProfileData(user.id)

  const { data: courses } = await supabase.from("courses").select("*").order("created_at", { ascending: false })

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader profile={profile} />
      <main className="flex-1 p-6 md:p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
          <p className="text-muted-foreground mt-2">Browse and manage all available courses</p>
        </div>

        <CourseList courses={courses || []} userTier={profile?.subscription_tier || "free"} userId={user.id} />
      </main>
    </div>
  )
}
