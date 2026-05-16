"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Tag, Plus, Edit2, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { createCategory, updateCategory, deleteCategory } from "@/app/actions/categories"
import { useRouter } from "next/navigation"

interface Category {
  id: string
  name: string
  description: string | null
  created_at: string
}

interface Props {
  categories: Category[]
}

export function CategoryManagementClient({ categories: initial }: Props) {
  const router = useRouter()
  const [categories, setCategories] = useState(initial)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const perPage = 10

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<Category | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({ name: "", description: "" })

  const filtered = categories.filter(c =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const paged = filtered.slice((page - 1) * perPage, page * perPage)

  const openCreate = () => {
    setForm({ name: "", description: "" })
    setError(null)
    setCreateOpen(true)
  }

  const openEdit = (cat: Category) => {
    setSelected(cat)
    setForm({ name: cat.name, description: cat.description ?? "" })
    setError(null)
    setEditOpen(true)
  }

  const openDelete = (cat: Category) => {
    setSelected(cat)
    setDeleteOpen(true)
  }

  const handleCreate = async () => {
    setLoading(true)
    setError(null)
    try {
      const created = await createCategory({
        name: form.name,
        description: form.description || undefined,
      })
      setCategories(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
      setCreateOpen(false)
      router.refresh()
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const handleEdit = async () => {
    if (!selected) return
    setLoading(true)
    setError(null)
    try {
      const updated = await updateCategory(selected.id, {
        name: form.name,
        description: form.description || undefined,
      })
      setCategories(prev => prev.map(c => c.id === selected.id ? updated : c))
      setEditOpen(false)
      router.refresh()
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const handleDelete = async () => {
    if (!selected) return
    setLoading(true)
    try {
      await deleteCategory(selected.id)
      setCategories(prev => prev.filter(c => c.id !== selected.id))
      setDeleteOpen(false)
      router.refresh()
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const FormFields = () => (
    <div className="space-y-4 py-2">
      {error && <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Name <span className="text-destructive">*</span></label>
        <Input
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Programming"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Description</label>
        <Input
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Short description"
        />
      </div>
    </div>
  )

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center justify-between gap-4 w-full">
              <div className="flex items-center gap-3">
                <Tag className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold">All Categories ({categories.length})</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-60">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search categories..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1) }}
                    className="pl-9 h-9"
                  />
                </div>
                <Button onClick={openCreate} className="gap-2 h-9">
                  <Plus className="h-4 w-4" /> New Category
                </Button>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Name</th>
                  <th className="text-left py-3 px-4 font-medium">Description</th>
                  <th className="text-left py-3 px-4 font-medium">Created</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-muted-foreground">
                      No categories found.
                    </td>
                  </tr>
                ) : paged.map(cat => (
                  <tr key={cat.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{cat.name}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{cat.description ?? "—"}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {new Date(cat.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(cat)} className="gap-1.5">
                          <Edit2 className="h-3.5 w-3.5" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDelete(cat)}
                          className="gap-1.5 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 px-2">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <span className="text-sm font-medium px-2">Page {page} of {totalPages}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Create Category</DialogTitle></DialogHeader>
          <FormFields />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={loading}>Cancel</Button>
            <Button onClick={handleCreate} disabled={loading || !form.name.trim()}>
              {loading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Category</DialogTitle></DialogHeader>
          <FormFields />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={loading}>Cancel</Button>
            <Button onClick={handleEdit} disabled={loading || !form.name.trim()}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{selected?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the category. Courses assigned to it will keep the category name as text but won't match this entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
