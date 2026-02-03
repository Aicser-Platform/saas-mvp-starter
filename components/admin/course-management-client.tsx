"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Edit2, Trash2, Plus } from "lucide-react"
import { CourseFormDialog } from "./course-form-dialog"
import { DeleteCourseDialog } from "./delete-course-dialog"

export function CourseManagementClient({ courses }: { courses: any[] }) {
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [key, setKey] = useState(0)

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
      <Button onClick={() => setCreateOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        New Course
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            All Courses ({courses?.length || 0})
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
                {courses?.map((course: any) => (
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
                ))}
              </tbody>
            </table>
          </div>
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
