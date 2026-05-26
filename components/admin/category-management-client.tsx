"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Tag, Plus, Edit2, Trash2, Search, ChevronLeft, ChevronRight, FolderOpen, AlertCircle } from "lucide-react"
import { createCategory, updateCategory, deleteCategory } from "@/app/actions/categories"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

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

  const filtered = categories.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const paged = filtered.slice((page - 1) * perPage, page * perPage)

  const openCreate = () => { setForm({ name: "", description: "" }); setError(null); setCreateOpen(true) }
  const openEdit = (cat: Category) => { setSelected(cat); setForm({ name: cat.name, description: cat.description ?? "" }); setError(null); setEditOpen(true) }
  const openDelete = (cat: Category) => { setSelected(cat); setDeleteOpen(true) }

  const handleCreate = async () => {
    setLoading(true); setError(null)
    try {
      const created = await createCategory({ name: form.name, description: form.description || undefined })
      setCategories((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
      setCreateOpen(false)
      router.refresh()
      toast.success(`Category "${created.name}" created`)
    } catch (e: any) { setError(e.message); toast.error(e.message) }
    finally { setLoading(false) }
  }

  const handleEdit = async () => {
    if (!selected) return
    setLoading(true); setError(null)
    try {
      const updated = await updateCategory(selected.id, { name: form.name, description: form.description || undefined })
      setCategories((prev) => prev.map((c) => (c.id === selected.id ? updated : c)))
      setEditOpen(false)
      router.refresh()
      toast.success(`Category "${updated.name}" updated`)
    } catch (e: any) { setError(e.message); toast.error(e.message) }
    finally { setLoading(false) }
  }

  const handleDelete = async () => {
    if (!selected) return
    setLoading(true)
    try {
      await deleteCategory(selected.id)
      setCategories((prev) => prev.filter((c) => c.id !== selected.id))
      setDeleteOpen(false)
      router.refresh()
      toast.success(`Category "${selected.name}" deleted`)
    } catch (e: any) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  const formFields = (
    <div className="space-y-4 py-2">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Name <span className="text-destructive">*</span></label>
        <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Programming" />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Description</label>
        <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Short description (optional)" />
      </div>
    </div>
  )

  return (
    <>
      <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Tag className="h-4.5 w-4.5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">All Categories</h2>
              <p className="text-xs text-muted-foreground">{categories.length} total</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70 pointer-events-none" />
              <Input placeholder="Search categories..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="pl-9 h-9 w-60 rounded-lg" />
            </div>
            <Button onClick={openCreate} size="sm" className="gap-1.5 shrink-0">
              <Plus className="h-4 w-4" /> New Category
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border/40">
                <th className="text-left py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Name</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Description</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Created</th>
                <th className="text-right py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <div className="h-12 w-12 rounded-full bg-muted/60 flex items-center justify-center">
                        <FolderOpen className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">No categories found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paged.map((cat) => (
                  <tr key={cat.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-md bg-muted/50 flex items-center justify-center shrink-0">
                          <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{cat.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-sm text-muted-foreground">{cat.description ?? <span className="text-muted-foreground/40 italic">No description</span>}</td>
                    <td className="py-3.5 px-4 text-xs text-muted-foreground">
                      {new Date(cat.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-1.5 justify-end">
                        <Button size="icon-sm" variant="ghost" onClick={() => openEdit(cat)} title="Edit" className="hover:bg-muted hover:text-foreground">
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon-sm" variant="ghost" onClick={() => openDelete(cat)} title="Delete" className="hover:bg-destructive/10 hover:text-destructive">
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
            <p className="text-xs text-muted-foreground">{(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}</p>
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="h-8 px-3"><ChevronLeft className="h-3.5 w-3.5" /></Button>
              <span className="text-xs font-medium px-2">{page} / {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-8 px-3"><ChevronRight className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader><DialogTitle>Create Category</DialogTitle></DialogHeader>
          {formFields}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={loading}>Cancel</Button>
            <Button onClick={handleCreate} disabled={loading || !form.name.trim()}>{loading ? "Creating…" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader><DialogTitle>Edit Category</DialogTitle></DialogHeader>
          {formFields}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={loading}>Cancel</Button>
            <Button onClick={handleEdit} disabled={loading || !form.name.trim()}>{loading ? "Saving…" : "Save Changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{selected?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the category. Courses assigned to it will keep the category name as text.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={loading} className="bg-destructive hover:bg-destructive/90">
              {loading ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
