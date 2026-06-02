import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { getProfileData } from "@/lib/supabase/admin"
import { CoursePageClient } from "@/components/course/course-page-client"
import { LessonPageClient } from "@/components/course/lesson-page-client"
import type { Course, Lesson } from "@/lib/types"
import { resolveFileUrl } from "@/lib/resolve-url"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>
}) {
  const { id: courseId, lessonId } = await params
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) redirect("/auth/login")

  const profile = await getProfileData(session.user.id)
  const token = session.access_token

  // Fetch course
  let course: Course | null = null
  try {
    const res = await fetch(`${API_BASE}/courses/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
    if (res.ok) course = await res.json()
  } catch {}

  if (!course) redirect("/explore")

  // Fetch all lessons for this course
  let lessons: Lesson[] = []
  try {
    const res = await fetch(`${API_BASE}/lessons/course/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
    if (res.ok) lessons = await res.json()
  } catch {}

  const sortedLessons = [...lessons].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
  const currentLesson = sortedLessons.find((l) => l.id === lessonId)
  if (!currentLesson) redirect(`/dashboard/courses/${courseId}`)

  // Fetch lesson progress — completed IDs + watched_seconds for resume
  let completedLessonIds: string[] = []
  let initialWatchedSeconds = 0
  try {
    const res = await fetch(`${API_BASE}/lesson-progress/user/${session.user.id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
    if (res.ok) {
      const progressData: Array<{ lesson_id: string; completed: boolean; watched_seconds: number }> =
        await res.json()
      completedLessonIds = progressData.filter((p) => p.completed).map((p) => p.lesson_id)
      const current = progressData.find((p) => p.lesson_id === lessonId)
      initialWatchedSeconds = current?.watched_seconds ?? 0
    }
  } catch {}

  const currentIndex = sortedLessons.findIndex((l) => l.id === lessonId)
  const nextLesson = currentIndex < sortedLessons.length - 1 ? sortedLessons[currentIndex + 1] : null

  const resources = (currentLesson.resources ?? []).map((r) => ({
    ...r,
    url: resolveFileUrl(r.url),
  }))

  const videoUrl = resolveFileUrl(currentLesson.video_url)

  return (
    <CoursePageClient
      courseId={courseId}
      courseTitle={course.title}
      lessonTitle={currentLesson.title}
      lessonContent={currentLesson.content ?? undefined}
      lessonTranscript={currentLesson.transcript ?? undefined}
    >
      <div className="flex flex-col min-h-screen">
        <DashboardHeader profile={profile} />
        <LessonPageClient
          lesson={currentLesson}
          lessons={sortedLessons}
          courseId={courseId}
          courseTitle={course.title}
          currentIndex={currentIndex}
          sortedLessonsLength={sortedLessons.length}
          nextLesson={nextLesson}
          initialCompletedIds={completedLessonIds}
          initialWatchedSeconds={initialWatchedSeconds}
          videoUrl={videoUrl}
          resources={resources}
        />
      </div>
    </CoursePageClient>
  )
}
