import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getProfileData } from "@/lib/supabase/admin"
import { CategoryManagementClient } from "@/components/admin/category-management-client"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"

export default async function AdminCategoriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token ?? ""
  const profile = await getProfileData(user.id)

  const res = await fetch(`${API_BASE}/categories/`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })
  const categories = res.ok ? await res.json() : []

  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 p-6 md:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground mt-2">Manage course categories shown to students</p>
        </div>
        <CategoryManagementClient categories={categories} />
      </main>
    </div>
  )
}
