import { BookOpen, CheckCircle, Clock, Award, Crown, Zap } from "lucide-react"

interface DashboardStatsProps {
  totalCourses: number
  inProgress: number
  completed: number
  subscriptionTier: string
}

const tierConfig: Record<string, { icon: React.ElementType; iconBg: string; iconColor: string; accent: string; label: string }> = {
  free:    { icon: Award,  iconBg: "bg-slate-100 dark:bg-slate-800/60",    iconColor: "text-slate-600 dark:text-slate-400",   accent: "bg-slate-400",   label: "Free"    },
  pro:     { icon: Zap,   iconBg: "bg-blue-100 dark:bg-blue-900/30",      iconColor: "text-blue-600 dark:text-blue-400",     accent: "bg-blue-500",    label: "Pro"     },
  premium: { icon: Crown, iconBg: "bg-violet-100 dark:bg-violet-900/30",  iconColor: "text-violet-600 dark:text-violet-400", accent: "bg-violet-500",  label: "Premium" },
}

interface StatItemProps {
  icon: React.ElementType
  label: string
  value: string | number
  sub: string
  iconBg: string
  iconColor: string
  accent: string
}

function StatItem({ icon: Icon, label, value, sub, iconBg, iconColor, accent }: StatItemProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border/60 bg-card p-5 shadow-sm">
      <div className={`absolute inset-x-0 top-0 h-0.5 ${accent}`} />
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className={`h-9 w-9 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
      </div>
      <div className="text-3xl font-extrabold tracking-tight leading-none">{value}</div>
      <p className="text-xs text-muted-foreground mt-1.5">{sub}</p>
    </div>
  )
}

export function DashboardStats({ totalCourses, inProgress, completed, subscriptionTier }: DashboardStatsProps) {
  const plan = tierConfig[subscriptionTier] || tierConfig.free

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatItem
        icon={BookOpen}
        label="Total Courses"
        value={totalCourses}
        sub="Available courses"
        iconBg="bg-primary/10"
        iconColor="text-primary"
        accent="bg-primary/40"
      />
      <StatItem
        icon={Clock}
        label="In Progress"
        value={inProgress}
        sub="Courses started"
        iconBg="bg-amber-100 dark:bg-amber-900/30"
        iconColor="text-amber-600 dark:text-amber-400"
        accent="bg-amber-500"
      />
      <StatItem
        icon={CheckCircle}
        label="Completed"
        value={completed}
        sub="Courses finished"
        iconBg="bg-emerald-100 dark:bg-emerald-900/30"
        iconColor="text-emerald-600 dark:text-emerald-400"
        accent="bg-emerald-500"
      />
      <StatItem
        icon={plan.icon}
        label="Current Plan"
        value={plan.label}
        sub="Subscription tier"
        iconBg={plan.iconBg}
        iconColor={plan.iconColor}
        accent={plan.accent}
      />
    </div>
  )
}
