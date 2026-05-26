"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookOpen, Edit2, Trash2, Plus, Settings, Search, ChevronLeft, ChevronRight, BookMarked } from "lucide-react"
import { CourseFormDialog } from "./course-form-dialog"
import { DeleteCourseDialog } from "./delete-course-dialog"
import Link from "next/link"

const difficultyVariant: Record<string, "success" | "warning" | "destructive"> = {
  beginner:     "success",
  intermediate: "warning",
  advanced:     "destructive",
}
const tierVariant: Record<string, "free" | "pro" | "premium"> = {
  free: "free", pro: "pro", premium: "premium",
}

export function CourseManagementClient({ courses }: { courses: any[] }) {
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [key, setKey] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredCourses = (courses || []).filter((c) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return c.title.toLowerCase().includes(q) || (c.description?.toLowerCase().includes(q) ?? false) || (c.category?.toLowerCase().includes(q) ?? false)
  })

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / itemsPerPage))
  const paginatedCourses = filteredCourses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleEdit = (course: any) => { setSelectedCourse(course); setEditOpen(true) }
  const handleDelete = (course: any) => { setSelectedCourse(course); setDeleteOpen(true) }
  const handleSuccess = () => setKey((k) => k + 1)

  return (
    <>
      <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-4.5 w-4.5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">All Courses</h2>
              <p className="text-xs text-muted-foreground">{courses?.length || 0} total</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70 pointer-events-none" />
              <Input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                className="pl-9 h-9 w-60 rounded-lg"
              />
            </div>
            <Button onClick={() => setCreateOpen(true)} size="sm" className="gap-1.5 shrink-0">
              <Plus className="h-4 w-4" /> New Course
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-250 text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border/40">
                <th className="text-left py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Course</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Level</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tier</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Category</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Enrolled</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Completed</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Created</th>
                <th className="text-right py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {paginatedCourses.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <div className="h-12 w-12 rounded-full bg-muted/60 flex items-center justify-center">
                        <BookMarked className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">No courses found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedCourses.map((course: any) => (
                  <tr key={course.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="py-3.5 px-6">
                      <div>
                        <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{course.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{course.description}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={difficultyVariant[course.difficulty] || "outline"} className="capitalize">
                        {course.difficulty}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={tierVariant[course.required_tier] || "outline"} className="capitalize">
                        {course.required_tier}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-sm text-muted-foreground">
                      {course.category || <span className="text-muted-foreground/40 italic">—</span>}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold">{course.enrollments ?? 0}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold">{course.completions ?? 0}</span>
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground text-xs">
                      {new Date(course.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-1.5 justify-end">
                        <Link href={`/admin/courses/${course.id}/manage`}>
                          <Button size="icon-sm" variant="ghost" title="Manage lessons" className="hover:bg-primary/10 hover:text-primary">
                            <Settings className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button size="icon-sm" variant="ghost" onClick={() => handleEdit(course)} title="Edit" className="hover:bg-muted hover:text-foreground">
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon-sm" variant="ghost" onClick={() => handleDelete(course)} title="Delete" className="hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3.5 border-t border-border/40 bg-muted/20">
            <p className="text-xs text-muted-foreground">
              {((currentPage - 1) * itemsPerPage) + 1}–{Math.min(currentPage * itemsPerPage, filteredCourses.length)} of {filteredCourses.length}
            </p>
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 px-3">
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="text-xs font-medium px-2">{currentPage} / {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-8 px-3">
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <CourseFormDialog key={`create-${key}`} open={createOpen} onOpenChange={setCreateOpen} onSuccess={handleSuccess} />
      {selectedCourse && (
        <>
          <CourseFormDialog key={`edit-${selectedCourse.id}-${key}`} open={editOpen} onOpenChange={setEditOpen} course={selectedCourse} onSuccess={handleSuccess} />
          <DeleteCourseDialog open={deleteOpen} onOpenChange={setDeleteOpen} course={selectedCourse} onSuccess={handleSuccess} />
        </>
      )}
    </>
  )
}
