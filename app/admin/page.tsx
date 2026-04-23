import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminStats } from "@/components/admin/admin-stats"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import { isUserAdmin, getProfileData } from "@/lib/supabase/admin"
import type { User, Course, Payment, Progress } from "@/lib/types"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) redirect("/auth/login")

  const token = session.access_token

  const isAdmin = await isUserAdmin(session.user.id)
  if (!isAdmin) redirect("/dashboard")

  const profile = await getProfileData(session.user.id)
  if (!profile) redirect("/auth/login")

  async function apiFetch<T>(path: string): Promise<T | null> {
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      })
      if (!res.ok) return null
      return res.json()
    } catch {
      return null
    }
  }

  // Fetch all data from FastAPI
  const [users, courses, payments, recentProgress] = await Promise.all([
    apiFetch<User[]>("/users/admin/all"),
    apiFetch<Course[]>("/courses/"),
    apiFetch<Payment[]>("/payments/"),
    apiFetch<Progress[]>("/course-progress/"),
  ])

  const totalUsers = users?.length ?? 0
  const totalCourses = courses?.length ?? 0
  const totalRevenue = payments?.filter((p) => p.status === "succeeded")
    .reduce((sum, p) => sum + p.amount, 0) ?? 0

  const freeUsers = users?.filter((u) => u.subscription_tier === "free").length ?? 0
  const proUsers = users?.filter((u) => u.subscription_tier === "pro").length ?? 0
  const premiumUsers = users?.filter((u) => u.subscription_tier === "premium").length ?? 0

  const activity = recentProgress
    ?.sort((a, b) => new Date(b.last_accessed).getTime() - new Date(a.last_accessed).getTime())
    .slice(0, 10) ?? []

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader profile={profile} />
      <main className="flex-1 p-6 md:p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage your platform and monitor key metrics</p>
        </div>

        <AdminStats
          totalUsers={totalUsers}
          totalCourses={totalCourses}
          totalRevenue={totalRevenue}
          freeUsers={freeUsers}
          proUsers={proUsers}
          premiumUsers={premiumUsers}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activity.map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        User accessed a course
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{item.progress_percentage}%</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.last_accessed).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {activity.length === 0 && (
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscription Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: "Free Tier", count: freeUsers, color: "bg-gray-500" },
                  { label: "Pro Tier", count: proUsers, color: "bg-blue-500" },
                  { label: "Premium Tier", count: premiumUsers, color: "bg-purple-500" },
                ].map(({ label, count, color }) => (
                  <div key={label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{label}</span>
                      <span className="font-medium">
                        {count} ({totalUsers ? ((count / totalUsers) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${color}`}
                        style={{ width: `${totalUsers ? (count / totalUsers) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Payments</CardTitle>
            <Link href="/admin/payments" className="text-sm text-primary hover:underline font-medium">
              View All
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payments?.slice(0, 5).map((payment) => {
                const user = users?.find(u => u.id === payment.user_id)
                return (
                  <div key={payment.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium">{user?.full_name || "Unknown User"}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600 dark:text-green-400">
                        +${(payment.amount / 100).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {payment.status} • {payment.provider}
                      </p>
                    </div>
                  </div>
                )
              })}
              {(!payments || payments.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">No recent payments</p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
