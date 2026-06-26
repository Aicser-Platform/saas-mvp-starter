import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import type { User } from "@/lib/types"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) redirect("/auth/login")

  let profile: User | null = null
  try {
    const res = await fetch(`${API_BASE}/users/me`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
      cache: "no-store",
    })
    if (res.ok) profile = await res.json()
  } catch {}

  if (profile?.role !== "admin") redirect("/explore")

  return (
    <div className="flex min-h-screen bg-muted/30 dark:bg-muted/10">
      <AdminSidebar profile={profile} />
      <div className="flex-1 overflow-x-hidden">
        {children}
      </div>
    </div>
  )
}
