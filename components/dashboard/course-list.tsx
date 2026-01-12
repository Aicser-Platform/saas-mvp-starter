"use client"

import type { Course } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lock, Play } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface CourseListProps {
  courses: Course[]
  userTier: string
  userId: string
}

const tierHierarchy = {
  free: 0,
  pro: 1,
  premium: 2,
}

export function CourseList({ courses, userTier }: CourseListProps) {
  const [filter, setFilter] = useState<"all" | "available" | "locked">("all")

  const userTierLevel = tierHierarchy[userTier as keyof typeof tierHierarchy]

  const filteredCourses = courses.filter((course) => {
    const courseTierLevel = tierHierarchy[course.required_tier as keyof typeof tierHierarchy]
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
          const courseTierLevel = tierHierarchy[course.required_tier as keyof typeof tierHierarchy]
          const isLocked = courseTierLevel > userTierLevel

          return (
            <Card key={course.id} className={isLocked ? "opacity-75" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge variant={course.difficulty === "beginner" ? "default" : "secondary"} className="capitalize">
                    {course.difficulty}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {course.required_tier}
                  </Badge>
                </div>
                <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                <CardDescription className="line-clamp-3">{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLocked ? (
                  <Link href="/dashboard/subscription">
                    <Button variant="secondary" className="w-full" disabled={isLocked}>
                      <Lock className="mr-2 h-4 w-4" />
                      Upgrade to {course.required_tier}
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
