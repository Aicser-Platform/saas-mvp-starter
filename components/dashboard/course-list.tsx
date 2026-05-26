"use client"

import type { Course } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lock, Play, BookOpen, Crown, Zap } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface CourseListProps {
  courses: Course[]
  userTier: string
  userId: string
}

const tierHierarchy: Record<string, number> = {
  free: 0,
  pro: 1,
  premium: 2,
}

const tierBadgeStyles: Record<string, string> = {
  free: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  pro: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  premium: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800",
}

const tierIcons: Record<string, React.ReactNode> = {
  pro: <Zap className="h-3 w-3" />,
  premium: <Crown className="h-3 w-3" />,
}

export function CourseList({ courses, userTier }: CourseListProps) {
  const [filter, setFilter] = useState<"all" | "available" | "locked">("all")

  const userTierLevel = tierHierarchy[userTier as keyof typeof tierHierarchy] ?? 0

  const filteredCourses = courses.filter((course) => {
    const courseTierLevel = tierHierarchy[course.required_tier as keyof typeof tierHierarchy] ?? 0
    const isLocked = courseTierLevel > userTierLevel

    if (filter === "available") return !isLocked
    if (filter === "locked") return isLocked
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Available Courses</h2>
        <div className="flex gap-2">
          <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
            All
          </Button>
          <Button
            variant={filter === "available" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("available")}
          >
            Available
          </Button>
          <Button variant={filter === "locked" ? "default" : "outline"} size="sm" onClick={() => setFilter("locked")}>
            Locked
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => {
          const courseTierLevel = tierHierarchy[course.required_tier as keyof typeof tierHierarchy] ?? 0
          const isLocked = courseTierLevel > userTierLevel
          const requiredTier = course.required_tier || "free"

          return (
            <Card
              key={course.id}
              className={`overflow-hidden transition-all duration-300 group ${
                isLocked
                  ? "relative border-dashed"
                  : "hover:shadow-lg hover:-translate-y-0.5"
              }`}
            >
              {/* Thumbnail */}
              <div className="relative">
                {course.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className={`w-full h-44 object-cover transition-all duration-300 ${
                      isLocked ? "opacity-50 grayscale-[30%]" : "group-hover:scale-[1.02]"
                    }`}
                  />
                ) : (
                  <div className={`w-full h-44 bg-muted flex items-center justify-center ${
                    isLocked ? "opacity-50" : ""
                  }`}>
                    <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                )}

                {/* Lock Overlay */}
                {isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/30 backdrop-blur-[2px]">
                    <div className="p-3 rounded-full bg-background/90 shadow-lg border">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>

              <CardHeader className="pb-2">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant={course.difficulty === "beginner" ? "success" : course.difficulty === "intermediate" ? "warning" : "destructive"} className="capitalize">
                    {course.difficulty}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`capitalize flex items-center gap-1 ${tierBadgeStyles[requiredTier] || ""}`}
                  >
                    {tierIcons[requiredTier]}
                    {requiredTier}
                  </Badge>
                </div>
                <CardTitle className={`line-clamp-2 ${isLocked ? "opacity-70" : ""}`}>{course.title}</CardTitle>
                <CardDescription className="line-clamp-2">{course.description}</CardDescription>
              </CardHeader>

              <CardContent>
                {isLocked ? (
                  <Link href="/dashboard/subscription">
                    <Button
                      variant="outline"
                      className={`w-full border-dashed transition-colors ${
                        requiredTier === "premium"
                          ? "hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/20"
                          : "hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                      }`}
                    >
                      <Lock className="mr-2 h-4 w-4" />
                      Upgrade to {requiredTier}
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/dashboard/courses/${course.id}`}>
                    <Button className="w-full">
                      <Play className="mr-2 h-4 w-4" />
                      Start Course
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No courses found matching your filter.</p>
        </div>
      )}
    </div>
  )
}
