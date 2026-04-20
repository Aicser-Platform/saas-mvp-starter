"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { CheckCircle, Circle, Play, FileText, PanelLeftClose, PanelRightClose, ExternalLink } from "lucide-react"
import Link from "next/link"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import type { Lesson } from "@/lib/types"

interface LessonSidebarProps {
  courseId: string
  courseTitle: string
  lessons: Lesson[]
  currentLessonId: string
  completedLessonIds: Set<string>
}

export function LessonSidebar({
  courseId,
  courseTitle,
  lessons,
  currentLessonId,
  completedLessonIds,
}: LessonSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  const sortedLessons = [...lessons].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
  const completedCount = sortedLessons.filter((l) => completedLessonIds.has(l.id)).length
  const progressPercent = sortedLessons.length > 0 ? Math.round((completedCount / sortedLessons.length) * 100) : 0

  return (
    <div className={cn(
      "flex flex-col h-full border-r bg-card/95 backdrop-blur-sm transition-all duration-300 relative",
      collapsed ? "w-12" : "w-[380px]"
    )}>
      {/* Collapse Toggle — on the RIGHT edge of the sidebar */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-10 top-4 z-10 h-8 w-8 border bg-background shadow-sm hover:bg-muted"
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? "Show course content" : "Hide course content"}
      >
        {collapsed ? <PanelRightClose className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
      </Button>

      {collapsed ? (
        <div className="flex flex-col items-center py-4 gap-2">
          <span className="text-xs font-medium text-muted-foreground [writing-mode:vertical-lr] rotate-180">
            Course Content
          </span>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="p-4 border-b border-border/60 space-y-3">
            <div className="flex items-center justify-between">
              <Link
                href={`/dashboard/courses/${courseId}`}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                ← Back to Overview
              </Link>
            </div>
            <h3 className="font-semibold text-sm leading-tight line-clamp-2">{courseTitle}</h3>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{completedCount}/{sortedLessons.length} completed</span>
                <span className="font-medium text-foreground">{progressPercent}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    progressPercent === 100 ? "bg-green-500" : "bg-primary"
                  )}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Lesson List */}
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-0.5">
              {sortedLessons.map((lesson, index) => {
                const isCurrent = lesson.id === currentLessonId
                const isCompleted = completedLessonIds.has(lesson.id)
                const resourceCount = lesson.resources?.length ?? 0

                return (
                  <Link
                    key={lesson.id}
                    href={`/dashboard/courses/${courseId}/lessons/${lesson.id}`}
                  >
                    <div
                      className={cn(
                        "flex items-start gap-3 px-3 py-3 rounded-lg text-sm transition-all duration-200 cursor-pointer",
                        isCurrent
                          ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                          : "hover:bg-muted/60",
                      )}
                    >
                      {/* Status Icon */}
                      <div className="mt-0.5 shrink-0">
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : isCurrent ? (
                          <Play className="h-4 w-4 text-primary fill-primary" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground/60" />
                        )}
                      </div>

                      {/* Lesson Info */}
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "font-medium leading-tight",
                          isCompleted && !isCurrent && "text-muted-foreground line-through decoration-muted-foreground/40",
                        )}>
                          {index + 1}. {lesson.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {lesson.video_url && (
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                              <Play className="h-2.5 w-2.5" />
                              Video
                            </span>
                          )}
                          {lesson.content && !lesson.video_url && (
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                              <FileText className="h-2.5 w-2.5" />
                              Reading
                            </span>
                          )}
                          {resourceCount > 0 && (
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                              <ExternalLink className="h-2.5 w-2.5" />
                              {resourceCount} file{resourceCount > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  )
}
