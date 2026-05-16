"use client"

import { useState, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { Course, Progress } from "@/lib/types"
import { CourseCard } from "@/components/dashboard/course-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  Clock,
  CheckCircle,
  Award,
  TrendingUp,
  Flame,
  GraduationCap,
} from "lucide-react"
import Link from "next/link"

type Tab = "available" | "in_progress" | "completed"

interface MyLearningProps {
  courses: Course[]
  progress: Progress[]
  userTier: string
  subscriptionTier: string
}

// ─── Stats Banner ─────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  color,
  sub,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  color: string
  sub?: string
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5`} />
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <div className={`p-2 rounded-lg ${color.replace("from-", "bg-").split(" ")[0]}/10`}>
          <Icon className={`h-4 w-4 ${color.includes("emerald") ? "text-emerald-600" : color.includes("blue") ? "text-blue-600" : color.includes("amber") ? "text-amber-600" : color.includes("purple") ? "text-purple-600" : "text-primary"}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-extrabold tracking-tight">{value}</div>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  )
}

// ─── Tab trigger ──────────────────────────────────────────────────────────────
function TabTrigger({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  count?: number
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all whitespace-nowrap border-b-2 ${
        active
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
      }`}
    >
      {children}
      {count !== undefined && (
        <Badge
          variant={active ? "default" : "secondary"}
          className="text-xs h-5 px-1.5 min-w-5 rounded-full"
        >
          {count}
        </Badge>
      )}
    </button>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyTab({ tab }: { tab: Tab }) {
  const messages: Record<Tab, { icon: React.ElementType; title: string; desc: string; link?: string; linkLabel?: string }> = {
    available: {
      icon: BookOpen,
      title: "No available courses",
      desc: "Courses available for your plan will appear here.",
    },
    in_progress: {
      icon: Flame,
      title: "Nothing in progress yet",
      desc: "Start a course to track your progress here.",
      link: "/dashboard",
      linkLabel: "Explore Courses",
    },
    completed: {
      icon: GraduationCap,
      title: "No completed courses yet",
      desc: "Finish a course and it will show up here. Keep learning!",
      link: "/dashboard",
      linkLabel: "Find a Course",
    },
  }
  const { icon: Icon, title, desc, link, linkLabel } = messages[tab]
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
      <div className="p-6 rounded-full bg-muted">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground max-w-sm text-sm">{desc}</p>
      {link && linkLabel && (
        <Link
          href={link}
          className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export function MyLearning({ courses, progress, userTier, subscriptionTier }: MyLearningProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawTab = searchParams.get("tab") as Tab | null
  const [activeTab, setActiveTab] = useState<Tab>(rawTab || "available")

  const tierHierarchy: Record<string, number> = { free: 0, pro: 1, premium: 2 }
  const userTierLevel = tierHierarchy[userTier] ?? 0

  // Build lookup maps
  const progressByCourse = useMemo(() => {
    const map: Record<string, Progress> = {}
    for (const p of progress) map[p.course_id] = p
    return map
  }, [progress])

  // Available = courses unlocked by user tier
  const availableCourses = useMemo(
    () =>
      courses.filter(
        (c) => (tierHierarchy[c.required_tier] ?? 0) <= userTierLevel
      ),
    [courses, userTierLevel]
  )

  // In Progress = started but not completed
  const inProgressCourses = useMemo(
    () =>
      courses.filter((c) => {
        const p = progressByCourse[c.id]
        return p && !p.completed && p.progress_percentage > 0
      }),
    [courses, progressByCourse]
  )

  // Completed
  const completedCourses = useMemo(
    () => courses.filter((c) => progressByCourse[c.id]?.completed),
    [courses, progressByCourse]
  )

  const tierColors: Record<string, string> = {
    free: "text-slate-600",
    pro: "text-blue-600",
    premium: "text-purple-600",
  }

  const switchTab = (tab: Tab) => {
    setActiveTab(tab)
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tab)
    router.replace(`/dashboard/courses?${params.toString()}`, { scroll: false })
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "available", label: "Available Courses", icon: BookOpen },
    { id: "in_progress", label: "In Progress", icon: Clock },
    { id: "completed", label: "Completed", icon: CheckCircle },
  ]

  const currentCourses = activeTab === "available"
    ? availableCourses
    : activeTab === "in_progress"
    ? inProgressCourses
    : completedCourses

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={BookOpen}
          label="Total Courses"
          value={courses.length}
          color="from-primary to-accent"
          sub="Available on platform"
        />
        <StatCard
          icon={TrendingUp}
          label="In Progress"
          value={inProgressCourses.length}
          color="from-amber-500 to-orange-400"
          sub="Keep the momentum!"
        />
        <StatCard
          icon={CheckCircle}
          label="Completed"
          value={completedCourses.length}
          color="from-emerald-500 to-teal-400"
          sub="Great job! 🎉"
        />
        <StatCard
          icon={Award}
          label="Your Plan"
          value={subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)}
          color={`from-${subscriptionTier === "premium" ? "purple" : subscriptionTier === "pro" ? "blue" : "slate"}-500 to-${subscriptionTier === "premium" ? "pink" : subscriptionTier === "pro" ? "indigo" : "gray"}-400`}
          sub={
            subscriptionTier === "free"
              ? "Upgrade to unlock more"
              : "Active subscription"
          }
        />
      </div>

      {/* Tabs header */}
      <div className="border-b border-border">
        <div className="flex gap-1 overflow-x-auto scrollbar-thin -mb-px">
          {tabs.map(({ id, label, icon: Icon }) => {
            const count =
              id === "available"
                ? availableCourses.length
                : id === "in_progress"
                ? inProgressCourses.length
                : completedCourses.length
            return (
              <TabTrigger
                key={id}
                active={activeTab === id}
                onClick={() => switchTab(id)}
                count={count}
              >
                <Icon className="h-4 w-4" />
                {label}
              </TabTrigger>
            )
          })}
        </div>
      </div>

      {/* Tab content */}
      {currentCourses.length === 0 ? (
        <EmptyTab tab={activeTab} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {currentCourses.map((course) => {
            const p = progressByCourse[course.id]
            return (
              <CourseCard
                key={course.id}
                course={course}
                userTier={userTier}
                progressPercent={p?.progress_percentage}
                completed={p?.completed}
                variant="grid"
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
