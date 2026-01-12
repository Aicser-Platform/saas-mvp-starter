"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { CheckCircle, Play } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface CourseActionsProps {
  courseId: string
  userId: string
  currentProgress: number
  isCompleted: boolean
}

export function CourseActions({ courseId, userId, currentProgress, isCompleted }: CourseActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleUpdateProgress = async (increment: number) => {
    setIsLoading(true)
    const newProgress = Math.min(100, currentProgress + increment)
    const completed = newProgress >= 100

    try {
      await supabase
        .from("progress")
        .update({
          progress_percentage: newProgress,
          completed: completed,
          last_accessed: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("course_id", courseId)

      router.refresh()
    } catch (error) {
      console.error("Error updating progress:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkComplete = async () => {
    setIsLoading(true)
    try {
      await supabase
        .from("progress")
        .update({
          progress_percentage: 100,
          completed: true,
          last_accessed: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("course_id", courseId)

      router.refresh()
    } catch (error) {
      console.error("Error marking complete:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isCompleted) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-green-600 font-medium">
          <CheckCircle className="h-5 w-5" />
          <span>Course Completed!</span>
        </div>
        <Button
          variant="outline"
          className="w-full bg-transparent"
          onClick={() => handleUpdateProgress(-100)}
          disabled={isLoading}
        >
          Reset Progress
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Button className="w-full" onClick={() => handleUpdateProgress(25)} disabled={isLoading}>
        <Play className="mr-2 h-4 w-4" />
        {currentProgress === 0 ? "Start Course" : "Continue Learning"}
      </Button>
      <Button variant="outline" className="w-full bg-transparent" onClick={handleMarkComplete} disabled={isLoading}>
        Mark as Complete
      </Button>
    </div>
  )
}
