import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { AdminStats } from "@/components/admin/admin-stats"
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
  if (!isAdmin) redirect("/explore")

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

  const tierColors = [
    { label: "Free",    count: freeUsers,    bar: "bg-gradient-to-r from-slate-400 to-gray-500",    pct: totalUsers ? (freeUsers / totalUsers) * 100 : 0 },
    { label: "Pro",     count: proUsers,     bar: "bg-gradient-to-r from-blue-400 to-indigo-500",    pct: totalUsers ? (proUsers / totalUsers) * 100 : 0 },
    { label: "Premium", count: premiumUsers, bar: "bg-gradient-to-r from-violet-500 to-pink-500",   pct: totalUsers ? (premiumUsers / totalUsers) * 100 : 0 },
  ]

  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 p-6 md:p-8 space-y-8">
        {/* Greeting banner */}
        {(() => {
          const hour = new Date().getHours()
          const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening"
          const firstName = profile?.full_name?.split(" ")[0] || "Admin"
          return (
            <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-6 shadow-sm">
              <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl pointer-events-none" />
              <div className="relative flex items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary-foreground">
                    {greeting}, {firstName}!
                  </h1>
                  <p className="text-sm text-primary-foreground/70 mt-1">Monitor platform metrics and manage content.</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 border border-white/30 shrink-0">
                  <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
                  <span className="text-xs font-semibold text-primary-foreground">Admin</span>
                </div>
              </div>
            </div>
          )
        })()}

        <AdminStats
          totalUsers={totalUsers}
          totalCourses={totalCourses}
          totalRevenue={totalRevenue}
          freeUsers={freeUsers}
          proUsers={proUsers}
          premiumUsers={premiumUsers}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border/40">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <h2 className="font-semibold">Recent Activity</h2>
            </div>
            <div className="p-5 space-y-0">
              {activity.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
              ) : (
                activity.map((item, i) => (
                  <div key={item.id} className={`flex items-center gap-3 py-3 ${i < activity.length - 1 ? "border-b border-border/40" : ""}`}>
                    <div className="relative shrink-0">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <TrendingUp className="h-3.5 w-3.5 text-primary" />
                      </div>
                      {i < activity.length - 1 && <div className="absolute top-8 left-1/2 -translate-x-1/2 w-px h-full bg-border/40" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">User accessed a course</p>
                      <p className="text-xs text-muted-foreground">{new Date(item.last_accessed).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                    <div className="shrink-0">
                      <span className="text-xs font-bold px-2 py-1 rounded-full bg-primary/10 text-primary">{item.progress_percentage}%</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Subscription Distribution */}
          <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border/40">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <h2 className="font-semibold">Subscription Distribution</h2>
            </div>
            <div className="p-5 space-y-5">
              {tierColors.map(({ label, count, bar, pct }) => (
                <div key={label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{count}</span>
                      <span className="text-xs text-muted-foreground px-1.5 py-0.5 rounded-full bg-muted">{pct.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${bar} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <h2 className="font-semibold">Recent Payments</h2>
            </div>
            <Link href="/admin/payments" className="text-sm text-primary hover:underline font-semibold">View All →</Link>
          </div>
          <div className="divide-y divide-border/40">
            {(!payments || payments.length === 0) ? (
              <p className="text-sm text-muted-foreground text-center py-10">No recent payments</p>
            ) : payments.slice(0, 5).map((payment) => {
              const user = users?.find((u) => u.id === payment.user_id)
              const succeeded = payment.status === "succeeded"
              const amount = payment.currency?.toLowerCase() === "khr"
                ? `${payment.amount.toLocaleString("km-KH")} ៛`
                : `$${(payment.amount / 100).toFixed(2)}`
              return (
                <div key={payment.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0 text-xs font-bold text-muted-foreground">
                      {user?.full_name ? user.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "?"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{user?.full_name || "Unknown User"}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${succeeded ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
                      {succeeded ? "+" : ""}{amount}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">{payment.status} · {payment.provider}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
