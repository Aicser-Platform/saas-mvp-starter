"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit2, Trash2, Video, FileText, GripVertical, ExternalLink, Mic, CheckCircle2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { LessonFormDialog } from "./lesson-form-dialog"
import { deleteLesson, reorderLessons } from "@/app/actions/lessons"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Lesson } from "@/lib/types"

// DnD Kit imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface LessonListManagerProps {
  courseId: string
  lessons: Lesson[]
}

// ── Sortable Lesson Item ────────────────────────────────────────────────────

function SortableLessonItem({
  lesson,
  index,
  isTranscribing,
  onEdit,
  onDelete,
  onTranscribe,
}: {
  lesson: Lesson
  index: number
  isTranscribing: boolean
  onEdit: (lesson: Lesson) => void
  onDelete: (lesson: Lesson) => void
  onTranscribe: (lesson: Lesson) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 0,
  }

  const resourceCount = lesson.resources?.length ?? 0

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
    >
      {/* Drag Handle */}
      <button
        className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground transition-colors p-1"
        {...attributes}
        {...listeners}
        suppressHydrationWarning
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {/* Lesson Number */}
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-medium shrink-0">
        {index + 1}
      </div>

      {/* Lesson Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{lesson.title}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {lesson.video_url && (
            <Badge variant="secondary" className="text-xs gap-1">
              <Video className="h-3 w-3" />
              Video
            </Badge>
          )}
          {lesson.content && (
            <Badge variant="outline" className="text-xs gap-1">
              <FileText className="h-3 w-3" />
              Text
            </Badge>
          )}
          {resourceCount > 0 && (
            <Badge variant="outline" className="text-xs gap-1">
              <ExternalLink className="h-3 w-3" />
              {resourceCount} resource{resourceCount > 1 ? "s" : ""}
            </Badge>
          )}
          {lesson.transcript && (
            <Badge variant="outline" className="text-xs gap-1 text-green-600 border-green-300 dark:border-green-700">
              <CheckCircle2 className="h-3 w-3" />
              Transcript ready
            </Badge>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {lesson.video_url && !lesson.video_url.includes("youtube") && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onTranscribe(lesson)}
            disabled={isTranscribing}
            title={lesson.transcript ? "Re-generate transcript" : "Generate transcript"}
            className="text-muted-foreground hover:text-foreground"
          >
            {isTranscribing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={() => onEdit(lesson)}>
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDelete(lesson)}
          className="text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// ── Main Component ──────────────────────────────────────────────────────────

export function LessonListManager({ courseId, lessons: initialLessons }: LessonListManagerProps) {
  const router = useRouter()
  const [lessons, setLessons] = useState<Lesson[]>(() =>
    [...initialLessons].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
  )
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [transcribingId, setTranscribingId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleSuccess = () => {
    router.refresh()
  }

  const handleTranscribe = async (lesson: Lesson) => {
    setTranscribingId(lesson.id)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"

      const res = await fetch(`${apiBase}/lessons/${lesson.id}/generate-transcript`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.detail || "Transcription failed")
      }

      const updated: Lesson = await res.json()
      setLessons((prev) => prev.map((l) => (l.id === updated.id ? updated : l)))
      toast.success(`Transcript generated for "${lesson.title}"`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Transcription failed")
    } finally {
      setTranscribingId(null)
    }
  }

  const handleEdit = (lesson: Lesson) => {
    setSelectedLesson(lesson)
    setEditOpen(true)
  }

  const handleDeleteClick = (lesson: Lesson) => {
    setSelectedLesson(lesson)
    setDeleteError(null)
    setDeleteOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedLesson) return
    setDeleteLoading(true)
    setDeleteError(null)
    try {
      await deleteLesson(selectedLesson.id)
      setDeleteOpen(false)
      handleSuccess()
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete lesson")
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = lessons.findIndex((l) => l.id === active.id)
    const newIndex = lessons.findIndex((l) => l.id === over.id)

    const reordered = arrayMove(lessons, oldIndex, newIndex)
    setLessons(reordered) // optimistic update

    try {
      await reorderLessons(courseId, reordered.map((l) => l.id))
    } catch (err) {
      // Revert on error
      setLessons(lessons)
      console.error("Failed to reorder:", err)
    }
  }

  const nextOrderIndex = lessons.length > 0
    ? (lessons[lessons.length - 1].order_index ?? 0) + 1
    : 0

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Curriculum ({lessons.length} lessons)
            </div>
            <Button onClick={() => setCreateOpen(true)} className="gap-2" size="sm">
              <Plus className="h-4 w-4" />
              Add Lesson
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lessons.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No lessons yet</p>
              <p className="text-sm mt-1">Click &quot;Add Lesson&quot; to start building your curriculum.</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={lessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {lessons.map((lesson, index) => (
                    <SortableLessonItem
                      key={lesson.id}
                      lesson={lesson}
                      index={index}
                      isTranscribing={transcribingId === lesson.id}
                      onEdit={handleEdit}
                      onDelete={handleDeleteClick}
                      onTranscribe={handleTranscribe}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* Create Lesson Dialog */}
      <LessonFormDialog
        key={`create-${lessons.length}`}
        open={createOpen}
        onOpenChange={setCreateOpen}
        courseId={courseId}
        nextOrderIndex={nextOrderIndex}
        onSuccess={handleSuccess}
      />

      {/* Edit Lesson Dialog */}
      {selectedLesson && (
        <LessonFormDialog
          key={`edit-${selectedLesson.id}`}
          open={editOpen}
          onOpenChange={setEditOpen}
          courseId={courseId}
          lesson={selectedLesson}
          onSuccess={handleSuccess}
        />
      )}

      {/* Delete Confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lesson</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Are you sure?</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This will permanently delete <strong>{selectedLesson?.title}</strong>. This action cannot be undone.
                </p>
              </div>
            </div>
            {deleteError && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <p className="text-sm text-destructive">{deleteError}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleteLoading}>
              {deleteLoading ? "Deleting..." : "Delete Lesson"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
