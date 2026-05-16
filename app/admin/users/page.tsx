import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { UserManagementClient } from "@/components/admin/user-management-client"
import { getProfileData } from "@/lib/supabase/admin"
import type { User } from "@/lib/types"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) redirect("/auth/login")

  const profile = await getProfileData(session.user.id)
  if (profile?.role !== "admin") redirect("/explore")

  // Fetch all users from FastAPI
  const res = await fetch(`${API_BASE}/users/admin/all`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
    cache: "no-store",
  })
  const users: User[] = res.ok ? await res.json() : []

  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 p-6 md:p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-2">View and manage all registered users</p>
        </div>

        <UserManagementClient users={users} />
      </main>
    </div>
  )
}
