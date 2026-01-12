import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ArrowLeft, BookOpen, Clock } from "lucide-react"
import Link from "next/link"
import { CourseActions } from "@/components/dashboard/course-actions"
import { getProfileData } from "@/lib/supabase/admin"
import { VideoPlayer } from "@/components/dashboard/video-player"
import { CourseResources } from "@/components/dashboard/course-resources"

export default async function CoursePage({ params }: { params: { id: string } }) {
  const { id } = params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const profile = await getProfileData(user.id)

  const { data: course } = await supabase.from("courses").select("*").eq("id", id).single()

  if (!course) {
    redirect("/dashboard")
  }

  // Check if user has access to this course
  const tierHierarchy = { free: 0, pro: 1, premium: 2 }
  const userTierLevel = tierHierarchy[profile?.subscription_tier as keyof typeof tierHierarchy]
  const courseTierLevel = tierHierarchy[course.required_tier as keyof typeof tierHierarchy]
  const hasAccess = userTierLevel >= courseTierLevel

  if (!hasAccess) {
    redirect("/dashboard/subscription")
  }

  let progress = await supabase
    .from("progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("course_id", course.id)
    .maybeSingle()

  if (!progress) {
    const { data: newProgress } = await supabase
      .from("progress")
      .insert({
        user_id: user.id,
        course_id: course.id,
        progress_percentage: 0,
        completed: false,
      })
      .select()
      .single()
    progress = newProgress
  }

  const resources = course.resources || []

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader profile={profile} />
      <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <Badge variant={course.difficulty === "beginner" ? "default" : "secondary"} className="capitalize">
                  {course.difficulty}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {course.required_tier}
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{course.title}</h1>
              <p className="text-base md:text-lg text-muted-foreground">{course.description}</p>
            </div>

            <VideoPlayer videoUrl={course.video_url} title={course.title} />

            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                <p>{course.content || "Course content will be available soon."}</p>
              </CardContent>
            </Card>

            <CourseResources resources={resources} />
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Completion</span>
                    <span className="font-medium">{progress?.progress_percentage || 0}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${progress?.progress_percentage || 0}%` }}
                    />
                  </div>
                </div>

                <CourseActions
                  courseId={course.id}
                  userId={user.id}
                  currentProgress={progress?.progress_percentage || 0}
                  isCompleted={progress?.completed || false}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Difficulty:</span>
                  <span className="font-medium capitalize">{course.difficulty}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Last accessed:</span>
                  <span className="font-medium">
                    {progress?.last_accessed ? new Date(progress.last_accessed).toLocaleDateString() : "Never"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
