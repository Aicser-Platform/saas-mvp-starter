"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createCourse, updateCourse } from "@/app/actions/courses"
import { AlertCircle, ImageIcon } from "lucide-react"

interface CourseFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  course?: {
    id: string
    title: string
    description: string
    content: string
    difficulty: "beginner" | "intermediate" | "advanced"
    required_plan_id: string | null
    thumbnail_url: string
  }
  onSuccess: () => void
}

export function CourseFormDialog({ open, onOpenChange, course, onSuccess }: CourseFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [thumbnailError, setThumbnailError] = useState(false)
  const [formData, setFormData] = useState({
    title: course?.title || "",
    description: course?.description || "",
    content: course?.content || "",
    difficulty: course?.difficulty || "beginner",
    required_plan_id: course?.required_plan_id || null,
    thumbnail_url: course?.thumbnail_url || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (course) {
        await updateCourse(course.id, formData)
      } else {
        await createCourse(formData)
      }
      onOpenChange(false)
      onSuccess()
      setFormData({
        title: "",
        description: "",
        content: "",
        difficulty: "beginner",
        required_plan_id: null,
        thumbnail_url: "",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleThumbnailChange = (url: string) => {
    setThumbnailError(false)
    setFormData({ ...formData, thumbnail_url: url })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{course ? "Edit Course" : "Create New Course"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Course title"
              className="placeholder:text-muted-foreground/50"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief course description"
              className="placeholder:text-muted-foreground/50"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Content</label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Course content overview"
              className="placeholder:text-muted-foreground/50"
              rows={5}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Difficulty Level</label>
            <Select
              value={formData.difficulty}
              onValueChange={(value) => setFormData({ ...formData, difficulty: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Thumbnail URL with live preview */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Thumbnail URL</label>
            <Input
              value={formData.thumbnail_url}
              onChange={(e) => handleThumbnailChange(e.target.value)}
              placeholder="Image URL for thumbnail"
              className="placeholder:text-muted-foreground/50"
            />
            {/* Live Preview */}
            {formData.thumbnail_url && (
              <div className="mt-2">
                {thumbnailError ? (
                  <div className="flex items-center gap-2 justify-center h-32 bg-muted rounded-md border border-dashed">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Could not load image from this URL</p>
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={formData.thumbnail_url}
                    alt="Thumbnail preview"
                    className="w-full max-h-48 object-cover rounded-md border"
                    onError={() => setThumbnailError(true)}
                    onLoad={() => setThumbnailError(false)}
                  />
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : course ? "Update Course" : "Create Course"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
