"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createLesson, updateLesson } from "@/app/actions/lessons"
import { uploadFileToStorage } from "@/lib/upload"
import { createClient } from "@/lib/supabase/client"
import { AlertCircle, Youtube, Video, Plus, Trash2, FileText, Upload, Loader2, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Lesson, LessonResource } from "@/lib/types"

interface LessonFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseId: string
  lesson?: Lesson | null
  nextOrderIndex?: number
  onSuccess: () => void
}

function getYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes("youtube.com")) return parsed.searchParams.get("v")
    if (parsed.hostname === "youtu.be") return parsed.pathname.slice(1)
    if (parsed.hostname.includes("youtube.com") && parsed.pathname.startsWith("/embed/"))
      return parsed.pathname.split("/embed/")[1]
  } catch {}
  return null
}

async function getToken(): Promise<string> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error("Not authenticated")
  return session.access_token
}

export function LessonFormDialog({
  open,
  onOpenChange,
  courseId,
  lesson,
  nextOrderIndex = 0,
  onSuccess,
}: LessonFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [videoUploading, setVideoUploading] = useState(false)
  const [resourceUploading, setResourceUploading] = useState<number | null>(null)
  const [videoDragOver, setVideoDragOver] = useState(false)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    title: lesson?.title || "",
    content: lesson?.content || "",
    video_url: lesson?.video_url || "",
    order_index: lesson?.order_index ?? nextOrderIndex,
  })
  const [resources, setResources] = useState<LessonResource[]>(
    lesson?.resources?.length ? lesson.resources : []
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const validResources = resources.filter((r) => r.title.trim() && r.url.trim())
    try {
      if (lesson) {
        await updateLesson(lesson.id, { ...formData, resources: validResources })
      } else {
        await createLesson({ ...formData, course_id: courseId, resources: validResources })
      }
      onOpenChange(false)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  // ── Video file upload (client-side → Azure) ──
  const handleVideoFile = useCallback(async (file: File) => {
    setVideoUploading(true)
    setError(null)
    try {
      const token = await getToken()
      const result = await uploadFileToStorage(file, token)
      setFormData((prev) => ({ ...prev, video_url: result.url }))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Video upload failed")
    } finally {
      setVideoUploading(false)
    }
  }, [])

  const onVideoDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setVideoDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("video/")) handleVideoFile(file)
    else setError("Drop a video file (.mp4, .mov, .webm)")
  }, [handleVideoFile])

  // ── Resource file upload (client-side → Azure) ──
  const handleResourceFile = useCallback(async (file: File, index: number) => {
    setResourceUploading(index)
    try {
      const token = await getToken()
      const result = await uploadFileToStorage(file, token)
      setResources((prev) => {
        const updated = [...prev]
        updated[index] = {
          ...updated[index],
          url: result.url,
          title: updated[index].title || file.name.replace(/\.[^/.]+$/, ""),
          type: file.type.includes("pdf") ? "pdf" : file.type.includes("word") || file.type.includes("doc") ? "doc" : "link",
        }
        return updated
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "File upload failed")
    } finally {
      setResourceUploading(null)
    }
  }, [])

  const addResource = () => setResources([...resources, { title: "", url: "", type: "link" }])
  const updateResource = (index: number, field: keyof LessonResource, value: string) => {
    const updated = [...resources]
    updated[index] = { ...updated[index], [field]: value }
    setResources(updated)
  }
  const removeResource = (index: number) => setResources(resources.filter((_, i) => i !== index))

  const youTubeId = formData.video_url ? getYouTubeId(formData.video_url) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {lesson ? "Edit Lesson" : "Add New Lesson"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Lesson Title <span className="text-destructive">*</span></label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Introduction to Variables"
              className="placeholder:text-muted-foreground/40"
              required
            />
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Content</label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Lesson notes..."
              rows={5}
              className="placeholder:text-muted-foreground/40"
            />
          </div>

          {/* Video — URL input + drag-and-drop */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Video</label>
            <Input
              value={formData.video_url}
              onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              placeholder="YouTube or video URL"
              className="placeholder:text-muted-foreground/40"
            />

            {/* Drop zone */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-5 text-center transition-colors cursor-pointer ${
                videoDragOver
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/20 hover:border-muted-foreground/40"
              }`}
              onDragOver={(e) => { e.preventDefault(); setVideoDragOver(true) }}
              onDragLeave={() => setVideoDragOver(false)}
              onDrop={onVideoDrop}
              onClick={() => videoInputRef.current?.click()}
            >
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleVideoFile(file)
                }}
              />
              {videoUploading ? (
                <div className="flex items-center justify-center gap-2 text-primary">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm font-medium">Uploading to Azure...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <Upload className="h-6 w-6 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground/60">
                    Drop video here or <span className="text-primary font-medium">browse</span>
                  </p>
                  <p className="text-xs text-muted-foreground/35">MP4, MOV, WebM, WMV</p>
                </div>
              )}
            </div>

            {/* Video Preview */}
            {formData.video_url && !videoUploading && (
              <div className="rounded-md overflow-hidden border">
                {youTubeId ? (
                  <div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border-b">
                      <Youtube className="h-3.5 w-3.5 text-red-500" />
                      <span className="text-xs font-medium text-red-600">YouTube</span>
                    </div>
                    <div className="relative aspect-video bg-black">
                      <iframe
                        src={`https://www.youtube.com/embed/${youTubeId}?rel=0`}
                        title="Preview"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-muted border-b">
                      <Video className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">Video file</span>
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500 ml-auto" />
                    </div>
                    <video src={formData.video_url} controls className="w-full max-h-48 bg-black" preload="metadata" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                Resources
                {resources.length > 0 && <Badge variant="secondary" className="text-xs">{resources.length}</Badge>}
              </label>
              <Button type="button" variant="outline" size="sm" onClick={addResource} className="gap-1 h-7 text-xs">
                <Plus className="h-3 w-3" />
                Add
              </Button>
            </div>

            {resources.length === 0 ? (
              <div className="border-2 border-dashed rounded-lg py-6 text-center">
                <FileText className="h-7 w-7 mx-auto mb-1.5 text-muted-foreground/25" />
                <p className="text-xs text-muted-foreground/40">No resources yet</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {resources.map((resource, index) => (
                  <div key={index} className="p-3 bg-muted/30 rounded-lg border space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-24 shrink-0">
                        <Select value={resource.type} onValueChange={(v) => updateResource(index, "type", v)}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pdf">📄 PDF</SelectItem>
                            <SelectItem value="doc">📝 Doc</SelectItem>
                            <SelectItem value="github">🐙 GitHub</SelectItem>
                            <SelectItem value="link">🔗 Link</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Input
                        value={resource.title}
                        onChange={(e) => updateResource(index, "title", e.target.value)}
                        placeholder="Name"
                        className="h-8 text-sm placeholder:text-muted-foreground/40"
                      />
                      <Button
                        type="button" variant="ghost" size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0"
                        onClick={() => removeResource(index)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {/* URL input + upload button for file types */}
                    <div className="flex items-center gap-2">
                      <Input
                        value={resource.url}
                        onChange={(e) => updateResource(index, "url", e.target.value)}
                        placeholder={resource.type === "github" ? "github.com/user/repo" : "Paste URL"}
                        className="h-8 text-sm flex-1 placeholder:text-muted-foreground/40"
                      />
                      {(resource.type === "pdf" || resource.type === "doc") && (
                        <>
                          <input
                            id={`res-file-${index}`}
                            type="file"
                            accept={resource.type === "pdf" ? ".pdf" : ".doc,.docx"}
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleResourceFile(file, index)
                            }}
                          />
                          <Button
                            type="button" variant="outline" size="sm"
                            className="h-8 gap-1 text-xs shrink-0"
                            disabled={resourceUploading === index}
                            onClick={() => document.getElementById(`res-file-${index}`)?.click()}
                          >
                            {resourceUploading === index ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Upload className="h-3 w-3" />
                            )}
                            {resourceUploading === index ? "..." : "Upload"}
                          </Button>
                        </>
                      )}
                    </div>

                    {/* Drop zone for PDF/Doc */}
                    {(resource.type === "pdf" || resource.type === "doc") && !resource.url && (
                      <div
                        className="border border-dashed rounded p-3 text-center cursor-pointer hover:border-primary/40 transition-colors"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault()
                          const file = e.dataTransfer.files[0]
                          if (file) handleResourceFile(file, index)
                        }}
                        onClick={() => document.getElementById(`res-file-${index}`)?.click()}
                      >
                        <p className="text-xs text-muted-foreground/40">
                          Drop {resource.type.toUpperCase()} here
                        </p>
                      </div>
                    )}

                    {resource.url && (
                      <p className="text-xs text-green-600 flex items-center gap-1 truncate">
                        <CheckCircle2 className="h-3 w-3 shrink-0" />
                        {resource.url}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || videoUploading} className="min-w-[100px]">
              {loading ? "Saving..." : lesson ? "Update" : "Add Lesson"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
