"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Course</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Are you sure?</p>
              <p className="text-sm text-muted-foreground mt-1">
                This will permanently delete <strong>{course.title}</strong> and remove all associated progress records.
                This action cannot be undone.
              </p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? "Deleting..." : "Delete Course"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
