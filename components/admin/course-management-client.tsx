"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Edit2, Trash2, Plus, Settings, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { CourseFormDialog } from "./course-form-dialog"
import { DeleteCourseDialog } from "./delete-course-dialog"
import { Input } from "@/components/ui/input"
import Link from "next/link"

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
    return (
      c.title.toLowerCase().includes(q) ||
      (c.description?.toLowerCase().includes(q) ?? false) ||
      (c.category?.toLowerCase().includes(q) ?? false)
    )
  })

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / itemsPerPage))
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleEdit = (course: any) => {
    setSelectedCourse(course)
    setEditOpen(true)
  }

  const handleDelete = (course: any) => {
    setSelectedCourse(course)
    setDeleteOpen(true)
  }

  const handleSuccess = () => {
    setKey((k) => k + 1)
  }

  return (
    <>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              All Courses ({courses?.length || 0})
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-9 h-9"
                />
              </div>
              <Button onClick={() => setCreateOpen(true)} className="gap-2 h-9">
                <Plus className="h-4 w-4" />
                New Course
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Course</th>
                  <th className="text-left py-3 px-4 font-medium">Difficulty</th>
                  <th className="text-left py-3 px-4 font-medium">Required Tier</th>
                  <th className="text-left py-3 px-4 font-medium">Enrollments</th>
                  <th className="text-left py-3 px-4 font-medium">Completions</th>
                  <th className="text-left py-3 px-4 font-medium">Created</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCourses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">
                      No courses found.
                    </td>
                  </tr>
                ) : (
                  paginatedCourses.map((course: any) => (
                  <tr key={course.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{course.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">{course.description}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={course.difficulty === "beginner" ? "default" : "secondary"}
                        className="capitalize"
                      >
                        {course.difficulty}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="capitalize">
                        {course.required_tier}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-medium">{course.enrollments}</td>
                    <td className="py-3 px-4 font-medium">{course.completions}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {new Date(course.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/courses/${course.id}/manage`}>
                          <Button size="sm" variant="outline" className="gap-2">
                            <Settings className="h-4 w-4" />
                            Manage
                          </Button>
                        </Link>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(course)} className="gap-2">
                          <Edit2 className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(course)}
                          className="gap-2 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 px-2">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredCourses.length)} of {filteredCourses.length} entries
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="text-sm font-medium px-2">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <CourseFormDialog
        key={`create-${key}`}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={handleSuccess}
      />

      {selectedCourse && (
        <>
          <CourseFormDialog
            key={`edit-${selectedCourse.id}-${key}`}
            open={editOpen}
            onOpenChange={setEditOpen}
            course={selectedCourse}
            onSuccess={handleSuccess}
          />

          <DeleteCourseDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            course={selectedCourse}
            onSuccess={handleSuccess}
          />
        </>
      )}
    </>
  )
}
