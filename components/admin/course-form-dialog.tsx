"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createCourse, updateCourse, uploadCourseFile } from "@/app/actions/courses"
import { getCategories } from "@/app/actions/categories"
import { AlertCircle, ImageIcon, Upload, Loader2, X } from "lucide-react"
import { toast } from "sonner"

interface Category { id: string; name: string }

interface CourseFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  course?: {
    id: string
    title: string
    description: string
    content: string
    difficulty: "beginner" | "intermediate" | "advanced"
    required_tier: string
    category: string
    thumbnail_url: string
  }
  onSuccess: () => void
}

export function CourseFormDialog({ open, onOpenChange, course, onSuccess }: CourseFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [thumbnailError, setThumbnailError] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    title: course?.title || "",
    description: course?.description || "",
    content: course?.content || "",
    difficulty: course?.difficulty || "beginner",
    required_tier: course?.required_tier || "free",
    category: course?.category || "",
    thumbnail_url: course?.thumbnail_url || "",
  })

  useEffect(() => {
    if (!open) return
    setError(null)
    setThumbnailError(false)
    setUploadedFileName(null)
    setFormData({
      title: course?.title || "",
      description: course?.description || "",
      content: course?.content || "",
      difficulty: course?.difficulty || "beginner",
      required_tier: course?.required_tier || "free",
      category: course?.category || "",
      thumbnail_url: course?.thumbnail_url || "",
    })
    getCategories().then(setCategories).catch(() => setCategories([]))
  }, [open, course?.id])

  const set = (key: string, value: string) => setFormData(prev => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (course) {
        await updateCourse(course.id, formData)
        toast.success(`"${formData.title}" updated`)
      } else {
        await createCourse(formData)
        toast.success(`"${formData.title}" created`)
        setFormData({ title: "", description: "", content: "", difficulty: "beginner", required_tier: "free", category: "", thumbnail_url: "" })
      }
      onOpenChange(false)
      onSuccess()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An error occurred"
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setThumbnailError(false)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const result = await uploadCourseFile(fd)
      set("thumbnail_url", result.url)
      setUploadedFileName(file.name)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[92vh] overflow-y-auto p-0 gap-0 rounded-2xl border-border/60">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border/50">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold tracking-tight">
              {course ? "Edit Course" : "New Course"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-0.5">
              {course ? "Update the course details below." : "Fill in the details to publish a new course."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-5">

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 p-3.5 rounded-lg bg-destructive/8 border border-destructive/20 text-destructive">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={e => set("title", e.target.value)}
                placeholder="e.g. Advanced Python Patterns"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={e => set("description", e.target.value)}
                placeholder="A brief overview shown on the course card..."
                rows={3}
                className="resize-none"
                required
              />
            </div>

            {/* Category + Difficulty */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-destructive">*</span>
                </Label>
                {categories.length > 0 ? (
                  <Select value={formData.category} onValueChange={v => set("category", v)}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={e => set("category", e.target.value)}
                    placeholder="e.g. Programming"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={formData.difficulty} onValueChange={v => set("difficulty", v)}>
                  <SelectTrigger id="difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Required Plan */}
            <div className="space-y-2">
              <Label htmlFor="required_tier">Required Plan</Label>
              <Select value={formData.required_tier} onValueChange={v => set("required_tier", v)}>
                <SelectTrigger id="required_tier">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Thumbnail */}
            <div className="space-y-2">
              <Label>Thumbnail</Label>
              {uploadedFileName ? (
                <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-border bg-muted/40 text-sm">
                  <ImageIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="flex-1 truncate text-foreground font-medium">{uploadedFileName}</span>
                  <button
                    type="button"
                    onClick={() => { set("thumbnail_url", ""); setThumbnailError(false); setUploadedFileName(null) }}
                    className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={formData.thumbnail_url}
                    onChange={e => { setThumbnailError(false); set("thumbnail_url", e.target.value) }}
                    placeholder="Paste image URL or upload a file"
                    className="flex-1"
                  />
                  {formData.thumbnail_url && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => { set("thumbnail_url", ""); setThumbnailError(false) }}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}

              <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="gap-2"
                  >
                    {uploading
                      ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading…</>
                      : <><Upload className="h-3.5 w-3.5" /> Upload image</>
                    }
                  </Button>
                  <span className="text-xs text-muted-foreground">JPG, PNG, WebP supported</span>
                </div>

                {formData.thumbnail_url && (
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-border/50 bg-muted">
                    {thumbnailError ? (
                      <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                        <ImageIcon className="h-7 w-7 opacity-40" />
                        <p className="text-xs">Failed to load preview</p>
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={formData.thumbnail_url}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover"
                        onError={() => setThumbnailError(true)}
                        onLoad={() => setThumbnailError(false)}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => { set("thumbnail_url", ""); setThumbnailError(false) }}
                      className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border/50 bg-muted/20">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading || uploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || uploading || !formData.title.trim() || !formData.description.trim()}
            >
              {loading
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                : course ? "Update Course" : "Create Course"
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
