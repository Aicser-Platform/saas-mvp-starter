import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { getProfileData } from "@/lib/supabase/admin"
import { VideoPlayer } from "@/components/dashboard/video-player"
import { LessonSidebar } from "@/components/course/lesson-sidebar"
import { CoursePageClient } from "@/components/course/course-page-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, FileText, Github, ExternalLink, Download } from "lucide-react"
import Link from "next/link"
import type { Course, Lesson } from "@/lib/types"
import { resolveFileUrl } from "@/lib/resolve-url"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"

const resourceIcons: Record<string, React.ReactNode> = {
  pdf: <FileText className="h-4 w-4" />,
  doc: <FileText className="h-4 w-4" />,
  github: <Github className="h-4 w-4" />,
  link: <ExternalLink className="h-4 w-4" />,
}

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

  // Find current lesson
  const currentLesson = lessons.find((l) => l.id === lessonId)
  if (!currentLesson) redirect(`/dashboard/courses/${courseId}`)

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

  // Find next lesson
  const sortedLessons = [...lessons].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
  const currentIndex = sortedLessons.findIndex((l) => l.id === lessonId)
  const nextLesson = currentIndex < sortedLessons.length - 1 ? sortedLessons[currentIndex + 1] : null

  const resources = (currentLesson.resources ?? []).map((r) => ({
    ...r,
    url: resolveFileUrl(r.url),
  }))

  // Resolve the video URL (converts raw Azure URLs to signed proxy URLs)
  const videoUrl = resolveFileUrl(currentLesson.video_url)

  return (
    <CoursePageClient courseId={courseId} courseTitle={course.title}>
      <div className="flex flex-col min-h-screen">
        <DashboardHeader profile={profile} />

        <main className="flex-1 flex overflow-hidden">
          {/* Sidebar — LEFT side, collapsible */}
          <div className="hidden lg:flex shrink-0 h-[calc(100vh-64px)] sticky top-0">
            <LessonSidebar
              courseId={courseId}
              courseTitle={course.title}
              lessons={lessons}
              currentLessonId={lessonId}
              completedLessonIds={completedLessonIds}
            />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto h-[calc(100vh-64px)]">
            {/* Video Player — full width within content area */}
            {videoUrl && (
              <div className="w-full bg-black">
                <div className="max-w-5xl mx-auto">
                  <VideoPlayer videoUrl={videoUrl} title={currentLesson.title} />
                </div>
              </div>
            )}

            <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
              {/* Lesson Title */}
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-xs font-medium">
                    Lesson {currentIndex + 1} of {sortedLessons.length}
                  </Badge>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-2">
                  {currentLesson.title}
                </h1>
              </div>

              {/* Lesson Content */}
              {currentLesson.content && (
                <Card className="shadow-sm border-border/60">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Lesson Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-sm max-w-none dark:prose-invert leading-relaxed">
                    <p className="whitespace-pre-wrap text-foreground/85">{currentLesson.content}</p>
                  </CardContent>
                </Card>
              )}

              {/* Resources Section */}
              {resources.length > 0 && (
                <Card className="shadow-sm border-border/60">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Download className="h-5 w-5 text-primary" />
                      Resources
                      <Badge variant="outline" className="text-xs ml-1">{resources.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      {resources.map((resource, idx) => (
                        <a
                          key={idx}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-lg border border-border/60 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group"
                        >
                          <div className="p-2.5 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                            {resourceIcons[resource.type] || <ExternalLink className="h-4 w-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm group-hover:text-primary transition-colors">{resource.title}</p>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">{resource.url}</p>
                          </div>
                          <Badge variant="outline" className="text-xs capitalize shrink-0">
                            {resource.type}
                          </Badge>
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* No content state */}
              {!videoUrl && !currentLesson.content && resources.length === 0 && (
                <Card className="shadow-sm">
                  <CardContent className="py-16 text-center text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-40" />
                    <p className="font-medium">Content coming soon</p>
                    <p className="text-sm mt-1">This lesson&apos;s content is being prepared.</p>
                  </CardContent>
                </Card>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-6 pb-4 border-t border-border/60">
                <Link href={`/dashboard/courses/${courseId}`}>
                  <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
                    ← Course Overview
                  </Button>
                </Link>

                {nextLesson ? (
                  <Link href={`/dashboard/courses/${courseId}/lessons/${nextLesson.id}`}>
                    <Button className="gap-2 shadow-sm">
                      Next: {nextLesson.title}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/dashboard/courses/${courseId}`}>
                    <Button variant="outline" className="gap-2">
                      Back to Course Overview
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </CoursePageClient>
  )
}
