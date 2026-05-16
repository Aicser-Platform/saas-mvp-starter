"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createCourse, updateCourse, uploadCourseFile } from "@/app/actions/courses"
import { AlertCircle, ImageIcon, Upload, Loader2, X } from "lucide-react"

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

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"

export function CourseFormDialog({ open, onOpenChange, course, onSuccess }: CourseFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [thumbnailError, setThumbnailError] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
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

  // Fetch categories when dialog opens
  useEffect(() => {
    if (!open) return
    fetch(`${API_BASE}/categories/`, {
      headers: { Authorization: `Bearer ${document.cookie.match(/sb-[^=]+-auth-token=([^;]+)/)?.[1] ?? ""}` },
      cache: "no-store",
    })
      .then(r => r.ok ? r.json() : [])
      .then(setCategories)
      .catch(() => setCategories([]))
  }, [open])

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
      setFormData({ title: "", description: "", content: "", difficulty: "beginner", required_tier: "free", category: "", thumbnail_url: "" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
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
      setFormData(prev => ({ ...prev, thumbnail_url: result.url }))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
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
              <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Title <span className="text-destructive">*</span></label>
            <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Course title" required />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description <span className="text-destructive">*</span></label>
            <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Brief course description" rows={3} required />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Content Overview <span className="text-destructive">*</span></label>
            <Textarea value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} placeholder="What students will learn..." rows={5} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty Level</label>
              <Select value={formData.difficulty} onValueChange={v => setFormData({ ...formData, difficulty: v as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">🟢 Beginner</SelectItem>
                  <SelectItem value="intermediate">🟡 Intermediate</SelectItem>
                  <SelectItem value="advanced">🔴 Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Required Tier</label>
              <Select value={formData.required_tier} onValueChange={v => setFormData({ ...formData, required_tier: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">🆓 Free</SelectItem>
                  <SelectItem value="pro">⭐ Pro</SelectItem>
                  <SelectItem value="premium">💎 Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Category <span className="text-destructive">*</span></label>
            {categories.length > 0 ? (
              <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })}>
                <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} placeholder="e.g. Programming, DevOps, AI & Machine Learning" required />
            )}
          </div>

          {/* Thumbnail — URL input + Azure file upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Thumbnail</label>
            <div className="flex gap-2">
              <Input
                value={formData.thumbnail_url}
                onChange={e => { setThumbnailError(false); setFormData({ ...formData, thumbnail_url: e.target.value }) }}
                placeholder="Paste image URL or upload below"
                className="flex-1"
              />
              {formData.thumbnail_url && (
                <Button type="button" variant="ghost" size="icon" onClick={() => setFormData({ ...formData, thumbnail_url: "" })}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? "Uploading…" : "Upload to Azure"}
              </Button>
              <p className="text-xs text-muted-foreground">JPG, PNG, WebP — stored in Azure Blob</p>
            </div>
            {formData.thumbnail_url && (
              <div className="mt-2">
                {thumbnailError ? (
                  <div className="flex items-center gap-2 justify-center h-32 bg-muted rounded-md border border-dashed">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Could not load image</p>
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={formData.thumbnail_url} alt="Thumbnail preview" className="w-full max-h-48 object-cover rounded-md border" onError={() => setThumbnailError(true)} onLoad={() => setThumbnailError(false)} />
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading || uploading}>Cancel</Button>
            <Button type="submit" disabled={loading || uploading}>
              {loading ? "Saving..." : course ? "Update Course" : "Create Course"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
