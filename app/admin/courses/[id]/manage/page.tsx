import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { getProfileData } from "@/lib/supabase/admin"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BookOpen, Video, FileText } from "lucide-react"
import Link from "next/link"
import { LessonListManager } from "@/components/admin/lesson-list-manager"
import type { Course, Lesson } from "@/lib/types"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"

export default async function CourseManagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) redirect("/auth/login")

  const profile = await getProfileData(session.user.id)
  if (profile?.role !== "admin") redirect("/dashboard")

  const token = session.access_token

  // Fetch course details
  const courseRes = await fetch(`${API_BASE}/courses/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })
  if (!courseRes.ok) redirect("/admin/courses")
  const course: Course = await courseRes.json()

  // Fetch lessons for this course
  let lessons: Lesson[] = []
  try {
    const lessonsRes = await fetch(`${API_BASE}/lessons/course/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
    if (lessonsRes.ok) lessons = await lessonsRes.json()
  } catch {}

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader profile={profile} />
      <main className="flex-1 p-6 md:p-8 space-y-6">
        {/* Navigation */}
        <div className="flex items-center gap-4">
          <Link href="/admin/courses">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Button>
          </Link>
        </div>

        {/* Course Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
              <Badge variant="secondary" className="capitalize">
                {course.difficulty}
              </Badge>
            </div>
            <p className="text-muted-foreground max-w-2xl">{course.description}</p>
          </div>
        </div>

        {/* Course Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{lessons.length}</p>
                  <p className="text-sm text-muted-foreground">Total Lessons</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Video className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{lessons.filter((l) => l.video_url).length}</p>
                  <p className="text-sm text-muted-foreground">Video Lessons</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <FileText className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{lessons.filter((l) => l.content).length}</p>
                  <p className="text-sm text-muted-foreground">Text Lessons</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Curriculum Manager */}
        <LessonListManager courseId={id} lessons={lessons} />
      </main>
    </div>
  )
}
