import { Users, BookOpen, DollarSign, TrendingUp, ArrowUpRight } from "lucide-react"

interface AdminStatsProps {
  totalUsers: number
  totalCourses: number
  totalRevenue: number
  freeUsers: number
  proUsers: number
  premiumUsers: number
}

interface KPICardProps {
  icon: React.ElementType
  label: string
  value: string | number
  sub: string
  iconBg: string
  iconColor: string
  accent: string
  trend?: string
}

function KPICard({ icon: Icon, label, value, sub, iconBg, iconColor, accent, trend }: KPICardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border/60 bg-card p-5 shadow-sm group hover:shadow-md transition-shadow duration-200">
      <div className={`absolute inset-x-0 top-0 h-0.5 ${accent}`} />
      <div className="flex items-start justify-between mb-4">
        <div className={`h-10 w-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        {trend && (
          <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 px-2 py-1 rounded-full">
            <ArrowUpRight className="h-3 w-3" />{trend}
          </span>
        )}
      </div>
      <div className="text-3xl font-extrabold tracking-tight leading-none">{value}</div>
      <p className="text-sm text-muted-foreground mt-1.5">{label}</p>
      <p className="text-xs text-muted-foreground/70 mt-0.5">{sub}</p>
    </div>
  )
}

export function AdminStats({
  totalUsers,
  totalCourses,
  totalRevenue,
  freeUsers,
  proUsers,
  premiumUsers,
}: AdminStatsProps) {
  const paidUsers = proUsers + premiumUsers
  const conversionRate = totalUsers > 0 ? (paidUsers / totalUsers) * 100 : 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <KPICard
        icon={Users}
        label="Total Users"
        value={totalUsers.toLocaleString()}
        sub={`${paidUsers} paid · ${conversionRate.toFixed(1)}% conversion`}
        iconBg="bg-primary/10"
        iconColor="text-primary"
        accent="bg-primary/40"
        trend="+12%"
      />
      <KPICard
        icon={BookOpen}
        label="Total Courses"
        value={totalCourses}
        sub="Published content"
        iconBg="bg-muted/60"
        iconColor="text-muted-foreground"
        accent="bg-primary/40"
      />
      <KPICard
        icon={DollarSign}
        label="Total Revenue"
        value={`$${(totalRevenue / 100).toFixed(0)}`}
        sub="All-time earnings"
        iconBg="bg-emerald-100 dark:bg-emerald-900/30"
        iconColor="text-emerald-600 dark:text-emerald-400"
        accent="bg-emerald-500"
        trend="+8%"
      />
      <KPICard
        icon={TrendingUp}
        label="Conversion Rate"
        value={`${conversionRate.toFixed(1)}%`}
        sub={`${freeUsers} free · ${proUsers} pro · ${premiumUsers} premium`}
        iconBg="bg-muted/60"
        iconColor="text-muted-foreground"
        accent="bg-primary/40"
      />
    </div>
  )
}
