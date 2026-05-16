import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { getProfileData, isUserAdmin } from "@/lib/supabase/admin"

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

  const isAdmin = await isUserAdmin(session.user.id)
  if (!isAdmin) redirect("/explore")

  const profile = await getProfileData(session.user.id)

  return (
    <div className="flex min-h-screen bg-muted/20">
      <AdminSidebar profile={profile} />
      <div className="flex-1 overflow-x-hidden">
        {children}
      </div>
    </div>
  )
}
