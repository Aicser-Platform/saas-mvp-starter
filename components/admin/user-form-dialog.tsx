"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createUser, updateUser } from "@/app/actions/users"
import { AlertCircle, Shield, Crown, Activity, Mail } from "lucide-react"
import { toast } from "sonner"

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: {
    id: string
    full_name: string
    email: string
    role: string
    subscription_tier: string
    subscription_status: string
  }
  onSuccess: () => void
}

export function UserFormDialog({ open, onOpenChange, user, onSuccess }: UserFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    role: user?.role || "user",
    subscription_tier: user?.subscription_tier || "free",
    subscription_status: user?.subscription_status || "inactive",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (user) {
        await updateUser(user.id, formData as any)
        toast.success(`User "${formData.full_name || formData.email}" updated`)
      } else {
        await createUser(formData as any)
        toast.success(`User "${formData.full_name || formData.email}" created`)
        setFormData({ full_name: "", email: "", role: "user", subscription_tier: "free", subscription_status: "inactive" })
      }
      onOpenChange(false)
      onSuccess()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An error occurred"
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-xl border-border/60 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {user ? "Edit User Profile" : "Add New User"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {user ? "Manage user account details and permissions." : "Create a new user account manually."}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-center gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
              <p className="text-sm font-medium text-destructive">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold flex items-center gap-2">
                  Full Name <span className="text-destructive">*</span>
                </label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="John Doe"
                  className="rounded-md h-10"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" /> Email <span className="text-destructive">*</span>
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="rounded-md h-10"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5" /> Role
                </label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value as any })}
                >
                  <SelectTrigger className="rounded-md h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-md">
                    <SelectItem value="user" className="rounded-lg">User</SelectItem>
                    <SelectItem value="admin" className="rounded-lg">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <Crown className="h-3.5 w-3.5" /> Tier
                </label>
                <Select
                  value={formData.subscription_tier}
                  onValueChange={(value) => setFormData({ ...formData, subscription_tier: value as any })}
                >
                  <SelectTrigger className="rounded-md h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-md">
                    <SelectItem value="free" className="rounded-lg">Free</SelectItem>
                    <SelectItem value="pro" className="rounded-lg">Pro</SelectItem>
                    <SelectItem value="premium" className="rounded-lg">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <Activity className="h-3.5 w-3.5" /> Status
                </label>
                <Select
                  value={formData.subscription_status}
                  onValueChange={(value) => setFormData({ ...formData, subscription_status: value as any })}
                >
                  <SelectTrigger className="rounded-md h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-md">
                    <SelectItem value="active" className="rounded-lg">Active</SelectItem>
                    <SelectItem value="inactive" className="rounded-lg">Inactive</SelectItem>
                    <SelectItem value="canceled" className="rounded-lg">Canceled</SelectItem>
                    <SelectItem value="past_due" className="rounded-lg">Past Due</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : user ? "Update User" : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
