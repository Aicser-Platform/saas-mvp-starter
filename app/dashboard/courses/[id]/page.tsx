import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ArrowLeft, Play, BookOpen, Clock, CheckCircle, Circle, Video, FileText } from "lucide-react"
import Link from "next/link"
import { getProfileData } from "@/lib/supabase/admin"
import { CoursePageClient } from "@/components/course/course-page-client"
import type { Course, Lesson } from "@/lib/types"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) redirect("/auth/login")

  const profile = await getProfileData(session.user.id)
  const token = session.access_token

  // Fetch course from FastAPI
  let course: Course | null = null
  try {
    const res = await fetch(`${API_BASE}/courses/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
    if (res.ok) course = await res.json()
  } catch {}

  if (!course) redirect("/dashboard")

  // Fetch lessons for this course
  let lessons: Lesson[] = []
  try {
    const res = await fetch(`${API_BASE}/lessons/course/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
    if (res.ok) lessons = await res.json()
  } catch {}

  // Fetch lesson progress for the user
  let completedLessonIds = new Set<string>()
  try {
    const res = await fetch(`${API_BASE}/lesson-progress/user/${session.user.id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
    if (res.ok) {
      const progressData: Array<{ lesson_id: string; completed: boolean }> = await res.json()
      completedLessonIds = new Set(progressData.filter((p) => p.completed).map((p) => p.lesson_id))
    }
  } catch {}

  const sortedLessons = [...lessons].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
  const completedCount = sortedLessons.filter((l) => completedLessonIds.has(l.id)).length
  const progressPercent = sortedLessons.length > 0 ? Math.round((completedCount / sortedLessons.length) * 100) : 0

  // Determine which lesson to start/continue
  const firstIncompleteLesson = sortedLessons.find((l) => !completedLessonIds.has(l.id))
  const startLesson = firstIncompleteLesson || sortedLessons[0]

  return (
    <CoursePageClient courseId={course.id} courseTitle={course.title}>
      <div className="flex flex-col min-h-screen">
        <DashboardHeader profile={profile} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8 max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          {/* Course Thumbnail */}
          {course.thumbnail_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="w-full h-56 object-cover rounded-lg"
            />
          )}

          {/* Course Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={course.difficulty === "beginner" ? "default" : "secondary"} className="capitalize">
                {course.difficulty}
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{course.title}</h1>
            <p className="text-base md:text-lg text-muted-foreground">{course.description}</p>
          </div>

          {/* Progress + Start */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-2 flex-1 w-full">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {completedCount} of {sortedLessons.length} lessons completed
                    </span>
                    <span className="font-medium">{progressPercent}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
                {startLesson && (
                  <Link href={`/dashboard/courses/${id}/lessons/${startLesson.id}`}>
                    <Button className="gap-2 shrink-0">
                      <Play className="h-4 w-4" />
                      {completedCount > 0 ? "Continue Learning" : "Start Course"}
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Syllabus */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Course Curriculum
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sortedLessons.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No lessons available yet. Check back soon!</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {sortedLessons.map((lesson, index) => {
                    const isCompleted = completedLessonIds.has(lesson.id)

                    return (
                      <Link
                        key={lesson.id}
                        href={`/dashboard/courses/${id}/lessons/${lesson.id}`}
                      >
                        <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                          {/* Status */}
                          <div className="shrink-0">
                            {isCompleted ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>

                          {/* Lesson number */}
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            {index + 1}
                          </div>

                          {/* Lesson info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{lesson.title}</p>
                            <div className="flex items-center gap-3 mt-0.5">
                              {lesson.video_url && (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Video className="h-3 w-3" />
                                  Video
                                </span>
                              )}
                              {lesson.content && (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <FileText className="h-3 w-3" />
                                  Reading
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Play icon */}
                          <Play className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Course Details */}
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
                <span className="text-muted-foreground">Lessons:</span>
                <span className="font-medium">{sortedLessons.length} lessons</span>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </CoursePageClient>
  )
}
