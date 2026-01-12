import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminStats } from "@/components/admin/admin-stats"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import { isUserAdmin, getProfileData } from "@/lib/supabase/admin"

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const isAdmin = await isUserAdmin(user.id)
  if (!isAdmin) {
    redirect("/dashboard")
  }

  const profile = await getProfileData(user.id)
  if (!profile) {
    redirect("/auth/login")
  }

  // Get all users
  const { data: users, count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact" })

  // Get subscription breakdown
  const freeUsers = users?.filter((u) => u.subscription_tier === "free").length || 0
  const proUsers = users?.filter((u) => u.subscription_tier === "pro").length || 0
  const premiumUsers = users?.filter((u) => u.subscription_tier === "premium").length || 0

  // Get all courses
  const { count: totalCourses } = await supabase.from("courses").select("*", { count: "exact" })

  // Get total revenue (sum of all successful payments)
  const { data: payments } = await supabase.from("payments").select("amount").eq("status", "succeeded")

  const totalRevenue = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0

  // Get recent activity
  const { data: recentProgress } = await supabase
    .from("progress")
    .select("*, profiles(full_name, email), courses(title)")
    .order("last_accessed", { ascending: false })
    .limit(10)

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader profile={profile} />
      <main className="flex-1 p-6 md:p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage your platform and monitor key metrics</p>
        </div>

        <AdminStats
          totalUsers={totalUsers || 0}
          totalCourses={totalCourses || 0}
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
                {recentProgress?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {item.profiles?.full_name || "Unknown User"} accessed{" "}
                        <span className="text-primary">{item.courses?.title}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{item.profiles?.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{item.progress_percentage}%</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.last_accessed).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscription Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Free Tier</span>
                    <span className="font-medium">
                      {freeUsers} ({totalUsers ? ((freeUsers / totalUsers) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-500"
                      style={{ width: `${totalUsers ? (freeUsers / totalUsers) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Pro Tier</span>
                    <span className="font-medium">
                      {proUsers} ({totalUsers ? ((proUsers / totalUsers) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${totalUsers ? (proUsers / totalUsers) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Premium Tier</span>
                    <span className="font-medium">
                      {premiumUsers} ({totalUsers ? ((premiumUsers / totalUsers) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500"
                      style={{ width: `${totalUsers ? (premiumUsers / totalUsers) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
