"use client"

import type React from "react"
import { useState, useCallback } from "react"
import Link from "next/link"
import { VideoProgressTracker } from "./video-progress-tracker"
import { MarkCompleteButton } from "./mark-complete-button"
import { LessonSidebar } from "./lesson-sidebar"
import { VideoPlayer } from "@/components/dashboard/video-player"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, FileText, Github, ExternalLink, Download, CheckCircle } from "lucide-react"
import type { Lesson, LessonResource } from "@/lib/types"

const resourceIcons: Record<string, React.ReactNode> = {
  pdf: <FileText className="h-4 w-4" />,
  doc: <FileText className="h-4 w-4" />,
  github: <Github className="h-4 w-4" />,
  link: <ExternalLink className="h-4 w-4" />,
}

function isYouTubeUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.hostname.includes("youtube.com") || parsed.hostname === "youtu.be"
  } catch {
    return false
  }
}

interface LessonPageClientProps {
  lesson: Lesson
  lessons: Lesson[]
  courseId: string
  courseTitle: string
  currentIndex: number
  sortedLessonsLength: number
  nextLesson: Lesson | null
  initialCompletedIds: string[]
  initialWatchedSeconds: number
  videoUrl: string
  resources: LessonResource[]
}

export function LessonPageClient({
  lesson,
  lessons,
  courseId,
  courseTitle,
  currentIndex,
  sortedLessonsLength,
  nextLesson,
  initialCompletedIds,
  initialWatchedSeconds,
  videoUrl,
  resources,
}: LessonPageClientProps) {
  const [completedIds, setCompletedIds] = useState<Set<string>>(
    () => new Set(initialCompletedIds)
  )

  const handleLessonComplete = useCallback((lessonId: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev)
      next.add(lessonId)
      return next
    })
  }, [])

  const isCurrentCompleted = completedIds.has(lesson.id)
  // YouTube iframes can't be programmatically tracked — require manual completion
  const useManualComplete = !videoUrl || isYouTubeUrl(videoUrl)

  return (
    <main className="flex-1 flex overflow-hidden">
      {/* Sidebar with live completedIds */}
      <div className="hidden lg:flex shrink-0 h-[calc(100vh-64px)] sticky top-0">
        <LessonSidebar
          courseId={courseId}
          courseTitle={courseTitle}
          lessons={lessons}
          currentLessonId={lesson.id}
          completedLessonIds={completedIds}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto h-[calc(100vh-64px)]">
        {/* Video section */}
        {videoUrl && (
          <div className="w-full bg-black">
            <div className="max-w-5xl mx-auto">
              {useManualComplete ? (
                <VideoPlayer videoUrl={videoUrl} title={lesson.title} />
              ) : (
                <VideoProgressTracker
                  lessonId={lesson.id}
                  videoUrl={videoUrl}
                  title={lesson.title}
                  initialWatchedSeconds={initialWatchedSeconds}
                  isCompleted={isCurrentCompleted}
                  onLessonComplete={handleLessonComplete}
                />
              )}
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
          {/* Lesson title + auto-complete indicator */}
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="secondary" className="text-xs font-medium">
                Lesson {currentIndex + 1} of {sortedLessonsLength}
              </Badge>
              {isCurrentCompleted && !useManualComplete && (
                <span className="flex items-center gap-1.5 text-xs font-medium text-green-600">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Completed
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-2">
              {lesson.title}
            </h1>
          </div>

          {/* Lesson notes */}
          {lesson.content && (
            <Card className="shadow-sm border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Lesson Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none dark:prose-invert leading-relaxed">
                <p className="whitespace-pre-wrap text-foreground/85">{lesson.content}</p>
              </CardContent>
            </Card>
          )}

          {/* Resources */}
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
          {!videoUrl && !lesson.content && resources.length === 0 && (
            <Card className="shadow-sm">
              <CardContent className="py-16 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p className="font-medium">Content coming soon</p>
                <p className="text-sm mt-1">This lesson&apos;s content is being prepared.</p>
              </CardContent>
            </Card>
          )}

          {/* Mark complete button (YouTube videos + text-only lessons) */}
          {useManualComplete && (
            <div className="flex justify-end">
              <MarkCompleteButton
                lessonId={lesson.id}
                isCompleted={isCurrentCompleted}
                onComplete={handleLessonComplete}
              />
            </div>
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
  )
}
