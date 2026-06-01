"use client"

import { useRef, useEffect, useCallback } from "react"
import { VideoPlayer } from "@/components/dashboard/video-player"
import { apiPost } from "@/lib/api"

interface VideoProgressTrackerProps {
  lessonId: string
  videoUrl: string
  title: string
  initialWatchedSeconds: number
  isCompleted: boolean
  onLessonComplete: (lessonId: string) => void
}

export function VideoProgressTracker({
  lessonId,
  videoUrl,
  title,
  initialWatchedSeconds,
  isCompleted,
  onLessonComplete,
}: VideoProgressTrackerProps) {
  const currentTimeRef = useRef<number>(initialWatchedSeconds)
  const durationRef = useRef<number>(0)
  const completedRef = useRef<boolean>(isCompleted)
  const isSavingRef = useRef<boolean>(false)

  const saveProgress = useCallback(async () => {
    if (isSavingRef.current) return
    if (durationRef.current <= 0) return

    isSavingRef.current = true
    try {
      const result = await apiPost<{ completed: boolean; watched_seconds: number }>(
        "/lesson-progress/upsert",
        {
          lesson_id: lessonId,
          watched_seconds: Math.floor(currentTimeRef.current),
          total_duration_seconds: Math.floor(durationRef.current),
        }
      )
      if (result.completed && !completedRef.current) {
        completedRef.current = true
        onLessonComplete(lessonId)
      }
    } catch (err) {
      console.error("[VideoProgressTracker] Save failed:", err)
    } finally {
      isSavingRef.current = false
    }
  }, [lessonId, onLessonComplete])

  // Periodic save every 10s + final save on unmount
  useEffect(() => {
    const interval = setInterval(saveProgress, 10_000)
    return () => {
      clearInterval(interval)
      saveProgress()
    }
  }, [saveProgress])

  const handleProgress = useCallback(
    (currentTime: number, duration: number) => {
      currentTimeRef.current = currentTime
      durationRef.current = duration

      // Immediate save on crossing 90% threshold
      if (!completedRef.current && duration > 0 && currentTime / duration >= 0.9) {
        saveProgress()
      }
    },
    [saveProgress]
  )

  return (
    <VideoPlayer
      videoUrl={videoUrl}
      title={title}
      initialTime={initialWatchedSeconds > 0 ? initialWatchedSeconds : undefined}
      onProgress={handleProgress}
      onPause={saveProgress}
    />
  )
}
