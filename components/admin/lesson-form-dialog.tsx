"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createLesson, updateLesson } from "@/app/actions/lessons"
import { uploadFileToStorage } from "@/lib/upload"
import { createClient } from "@/lib/supabase/client"
import { AlertCircle, Video, Plus, Trash2, FileText, Upload, Loader2, CheckCircle2, X, Film } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Lesson, LessonResource } from "@/lib/types"

// Extends LessonResource with a local-only filename for display (stripped before API call)
type LocalResource = LessonResource & { _fileName?: string }

interface LessonFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseId: string
  lesson?: Lesson | null
  nextOrderIndex?: number
  onSuccess: () => void
}

/** Extract a display name from a server-uploaded file URL. Returns null for external URLs. */
function deriveUploadedName(url: string): string | null {
  if (!url) return null
  if (url.includes("/api/v1/files/") || url.includes("/uploads/")) {
    return url.split("/").pop() || null
  }
  return null
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
  const [videoFileName, setVideoFileName] = useState<string | null>(null)
  const [resourceUploading, setResourceUploading] = useState<number | null>(null)
  const [videoDragOver, setVideoDragOver] = useState(false)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    title: lesson?.title || "",
    content: lesson?.content || "",
    video_url: lesson?.video_url || "",
    order_index: lesson?.order_index ?? nextOrderIndex,
  })
  const [resources, setResources] = useState<LocalResource[]>(
    lesson?.resources?.length ? lesson.resources : []
  )

  // Reset all state when the dialog opens (handles both create and edit)
  useEffect(() => {
    if (!open) return
    setError(null)
    setVideoUploading(false)
    setVideoDragOver(false)
    setFormData({
      title: lesson?.title || "",
      content: lesson?.content || "",
      video_url: lesson?.video_url || "",
      order_index: lesson?.order_index ?? nextOrderIndex,
    })
    setVideoFileName(deriveUploadedName(lesson?.video_url || ""))
    setResources(
      lesson?.resources?.length
        ? lesson.resources.map((r) => ({ ...r, _fileName: deriveUploadedName(r.url) ?? undefined }))
        : []
    )
  }, [open, lesson?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    // Strip local-only _fileName before sending to API
    const validResources = resources
      .filter((r) => r.title.trim() && r.url.trim())
      .map(({ _fileName, ...r }) => r)
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

  // ── Video upload ──────────────────────────────────────────────────────────────
  const handleVideoFile = useCallback(async (file: File) => {
    setVideoUploading(true)
    setError(null)
    try {
      const token = await getToken()
      const result = await uploadFileToStorage(file, token)
      setFormData((prev) => ({ ...prev, video_url: result.url }))
      setVideoFileName(file.name)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Video upload failed")
    } finally {
      setVideoUploading(false)
    }
  }, [])

  const clearVideo = () => {
    setFormData((prev) => ({ ...prev, video_url: "" }))
    setVideoFileName(null)
  }

  const onVideoDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setVideoDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("video/")) handleVideoFile(file)
    else setError("Drop a video file (.mp4, .mov, .webm)")
  }, [handleVideoFile])

  // ── Resource upload ───────────────────────────────────────────────────────────
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
          _fileName: file.name,
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
    // Clear _fileName if URL is manually edited
    if (field === "url") updated[index]._fileName = undefined
    setResources(updated)
  }
  const clearResourceFile = (index: number) => {
    const updated = [...resources]
    updated[index] = { ...updated[index], url: "", _fileName: undefined }
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
            />
          </div>

          {/* Video */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Video</label>

            {/* Filename chip when a file was uploaded */}
            {videoFileName ? (
              <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-border bg-muted/40 text-sm">
                <Film className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="flex-1 truncate font-medium text-foreground">{videoFileName}</span>
                <button type="button" onClick={clearVideo} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <Input
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                placeholder="YouTube or video URL"
              />
            )}

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
                  <span className="text-sm font-medium">Uploading…</span>
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

            {/* Video preview */}
            {formData.video_url && !videoUploading && (
              <div className="rounded-md overflow-hidden border">
                {youTubeId ? (
                  <div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border-b">
                      <svg className="h-3.5 w-3.5 text-red-500" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 0 0 .5 6.19C0 8.04 0 12 0 12s0 3.96.5 5.81a3.02 3.02 0 0 0 2.12 2.14C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14C24 15.96 24 12 24 12s0-3.96-.5-5.81zM9.75 15.5v-7l6.5 3.5-6.5 3.5z"/></svg>
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
                      <span className="text-xs font-medium text-muted-foreground">
                        {videoFileName ?? "Video file"}
                      </span>
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
                <Plus className="h-3 w-3" /> Add
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
                    {/* Type + Name + Remove */}
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
                        className="h-8 text-sm"
                      />
                      <Button
                        type="button" variant="ghost" size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0"
                        onClick={() => removeResource(index)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {/* URL input or filename chip + upload button */}
                    <div className="flex items-center gap-2">
                      {resource._fileName ? (
                        <div className="flex items-center gap-2 h-8 px-2.5 rounded-md border border-border bg-muted/40 text-xs flex-1 min-w-0">
                          <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="flex-1 truncate font-medium text-foreground">{resource._fileName}</span>
                          <button type="button" onClick={() => clearResourceFile(index)} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <Input
                          value={resource.url}
                          onChange={(e) => updateResource(index, "url", e.target.value)}
                          placeholder={resource.type === "github" ? "github.com/user/repo" : "Paste URL"}
                          className="h-8 text-sm flex-1"
                        />
                      )}

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
                            {resourceUploading === index
                              ? <Loader2 className="h-3 w-3 animate-spin" />
                              : <Upload className="h-3 w-3" />
                            }
                            {resourceUploading === index ? "Uploading…" : "Upload"}
                          </Button>
                        </>
                      )}
                    </div>

                    {/* Drop zone for PDF/Doc when no file yet */}
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

                    {/* Confirmed URL preview (only when no _fileName — avoids double display) */}
                    {resource.url && !resource._fileName && (
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
            <Button type="submit" disabled={loading || videoUploading} className="min-w-25">
              {loading ? "Saving..." : lesson ? "Update" : "Add Lesson"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
