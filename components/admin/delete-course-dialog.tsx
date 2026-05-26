"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { deleteCourse } from "@/app/actions/courses"
import { AlertCircle } from "lucide-react"

interface DeleteCourseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  course: {
    id: string
    title: string
  }
  onSuccess: () => void
}

export function DeleteCourseDialog({ open, onOpenChange, course, onSuccess }: DeleteCourseDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setLoading(true)
    setError(null)
    try {
      await deleteCourse(course.id)
      onOpenChange(false)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-xl border-border/60 shadow-lg">
        <DialogHeader>
          <DialogTitle>Delete course?</DialogTitle>
          <DialogDescription className="leading-relaxed">
            <span className="font-medium text-foreground">{course.title}</span> will be permanently deleted, including all associated progress records for every user. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? "Deleting..." : "Delete course"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
