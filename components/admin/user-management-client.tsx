"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Edit2, Trash2, Plus, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { UserFormDialog } from "./user-form-dialog"
import { DeleteUserDialog } from "./delete-user-dialog"
import { Input } from "@/components/ui/input"

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
    return (
      (u.full_name?.toLowerCase().includes(q) ?? false) ||
      (u.email?.toLowerCase().includes(q) ?? false) ||
      (u.role?.toLowerCase().includes(q) ?? false)
    )
  })

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage))
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleEdit = (user: any) => {
    setSelectedUser(user)
    setEditOpen(true)
  }

  const handleDelete = (user: any) => {
    setSelectedUser(user)
    setDeleteOpen(true)
  }

  const handleSuccess = () => {
    setKey((k) => k + 1)
    window.location.reload()
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center justify-between gap-4 w-full">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold">All Users ({users?.length || 0})</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search users..."
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
                  New User
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
                  <th className="text-left py-3 px-4 font-medium">User</th>
                  <th className="text-left py-3 px-4 font-medium">Email</th>
                  <th className="text-left py-3 px-4 font-medium">Role</th>
                  <th className="text-left py-3 px-4 font-medium">Subscription</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Joined</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 px-4">{user.full_name || "N/A"}</td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">
                      <Badge variant={user.role === "admin" ? "destructive" : "secondary"} className="capitalize">
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          user.subscription_tier === "premium"
                            ? "default"
                            : user.subscription_tier === "pro"
                              ? "secondary"
                              : "outline"
                        }
                        className="capitalize"
                      >
                        {user.subscription_tier}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          user.subscription_status === "active"
                            ? "default"
                            : user.subscription_status === "past_due"
                              ? "destructive"
                              : "outline"
                        }
                        className="capitalize"
                      >
                        {user.subscription_status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(user)} className="gap-2">
                          <Edit2 className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(user)}
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
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} entries
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

      <UserFormDialog
        key={`create-${key}`}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={handleSuccess}
      />

      {selectedUser && (
        <>
          <UserFormDialog
            key={`edit-${selectedUser.id}-${key}`}
            open={editOpen}
            onOpenChange={setEditOpen}
            user={selectedUser}
            onSuccess={handleSuccess}
          />

          <DeleteUserDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            user={selectedUser}
            onSuccess={handleSuccess}
          />
        </>
      )}
    </>
  )
}
