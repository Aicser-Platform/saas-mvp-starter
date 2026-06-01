"use client"

import { useState } from "react"
import { CheckCircle, Circle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiPost } from "@/lib/api"

interface MarkCompleteButtonProps {
  lessonId: string
  isCompleted: boolean
  onComplete: (lessonId: string) => void
}

export function MarkCompleteButton({ lessonId, isCompleted, onComplete }: MarkCompleteButtonProps) {
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(isCompleted)

  const handleClick = async () => {
    if (completed || loading) return
    setLoading(true)
    try {
      await apiPost("/lesson-progress/mark-complete", { lesson_id: lessonId })
      setCompleted(true)
      onComplete(lessonId)
    } catch (err) {
      console.error("[MarkCompleteButton] Failed:", err)
    } finally {
      setLoading(false)
    }
  }

  if (completed) {
    return (
      <div className="flex items-center gap-2 text-green-600 font-medium py-2">
        <CheckCircle className="h-5 w-5" />
        Lesson Completed
      </div>
    )
  }

  return (
    <Button onClick={handleClick} disabled={loading} className="gap-2">
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Saving...
        </>
      ) : (
        <>
          <Circle className="h-4 w-4" />
          Mark as Complete
        </>
      )}
    </Button>
  )
}
