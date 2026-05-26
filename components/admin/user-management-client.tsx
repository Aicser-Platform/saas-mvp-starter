"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Edit2, Trash2, Plus, Search, ChevronLeft, ChevronRight, UserX } from "lucide-react"
import { UserFormDialog } from "./user-form-dialog"
import { DeleteUserDialog } from "./delete-user-dialog"

function UserAvatar({ name, avatarUrl }: { name?: string; avatarUrl?: string }) {
  const initials = name ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "?"
  return (
    <div className="h-8 w-8 rounded-full bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center overflow-hidden shrink-0">
      {avatarUrl
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
        : <span className="text-xs font-bold text-primary">{initials}</span>
      }
    </div>
  )
}

export function UserManagementClient({ users }: { users: any[] }) {
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [key, setKey] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredUsers = (users || []).filter((u) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (u.full_name?.toLowerCase().includes(q) ?? false) || (u.email?.toLowerCase().includes(q) ?? false) || (u.role?.toLowerCase().includes(q) ?? false)
  })

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage))
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleEdit = (user: any) => { setSelectedUser(user); setEditOpen(true) }
  const handleDelete = (user: any) => { setSelectedUser(user); setDeleteOpen(true) }
  const handleSuccess = () => { setKey((k) => k + 1); window.location.reload() }

  return (
    <>
      <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-4.5 w-4.5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">All Users</h2>
              <p className="text-xs text-muted-foreground">{users?.length || 0} total</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70 pointer-events-none" />
              <Input type="text" placeholder="Search users..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }} className="pl-9 h-9 w-60 rounded-lg" />
            </div>
            <Button onClick={() => setCreateOpen(true)} size="sm" className="gap-1.5 shrink-0">
              <Plus className="h-4 w-4" /> New User
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border/40">
                <th className="text-left py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide">User</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Role</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Subscription</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Joined</th>
                <th className="text-right py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <div className="h-12 w-12 rounded-full bg-muted/60 flex items-center justify-center">
                        <UserX className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">No users found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={user.full_name} avatarUrl={user.avatar_url} />
                        <div>
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{user.full_name || "—"}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={user.role === "admin" ? "destructive" : "ghost"} className="capitalize">
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={user.subscription_tier === "premium" ? "premium" : user.subscription_tier === "pro" ? "pro" : "free"}
                        className="capitalize"
                      >
                        {user.subscription_tier}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          user.subscription_status === "active" ? "bg-emerald-500"
                          : user.subscription_status === "past_due" ? "bg-amber-500"
                          : "bg-muted-foreground/40"
                        }`} />
                        <Badge
                          variant={user.subscription_status === "active" ? "success" : user.subscription_status === "past_due" ? "warning" : "ghost"}
                          className="capitalize"
                        >
                          {user.subscription_status || "inactive"}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-1.5 justify-end">
                        <Button size="icon-sm" variant="ghost" onClick={() => handleEdit(user)} title="Edit" className="hover:bg-muted hover:text-foreground">
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon-sm" variant="ghost" onClick={() => handleDelete(user)} title="Delete" className="hover:bg-destructive/10 hover:text-destructive">
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
              {((currentPage - 1) * itemsPerPage) + 1}–{Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length}
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

      <UserFormDialog key={`create-${key}`} open={createOpen} onOpenChange={setCreateOpen} onSuccess={handleSuccess} />
      {selectedUser && (
        <>
          <UserFormDialog key={`edit-${selectedUser.id}-${key}`} open={editOpen} onOpenChange={setEditOpen} user={selectedUser} onSuccess={handleSuccess} />
          <DeleteUserDialog open={deleteOpen} onOpenChange={setDeleteOpen} user={selectedUser} onSuccess={handleSuccess} />
        </>
      )}
    </>
  )
}
