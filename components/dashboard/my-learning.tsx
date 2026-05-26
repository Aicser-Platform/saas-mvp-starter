"use client"

import { useState, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { Course, Progress } from "@/lib/types"
import { CourseCard } from "@/components/dashboard/course-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  BookOpen, Clock, CheckCircle, Award, TrendingUp, Flame, GraduationCap,
  Crown, Zap, ArrowUpRight,
} from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

type Tab = "available" | "in_progress" | "completed"

interface MyLearningProps {
  courses: Course[]
  progress: Progress[]
  userTier: string
  subscriptionTier: string
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  iconClassName,
  iconBg,
  accent,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
  iconClassName: string
  iconBg: string
  accent: string
}) {
  return (
    <div className={`relative overflow-hidden rounded-xl border border-border/60 bg-card p-5 shadow-sm`}>
      <div className={`absolute inset-x-0 top-0 h-0.5 ${accent}`} />
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className={`h-9 w-9 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
          <Icon className={`h-4.5 w-4.5 ${iconClassName}`} />
        </div>
      </div>
      <div className="text-3xl font-extrabold tracking-tight leading-none">{value}</div>
      {sub && <p className="text-xs text-muted-foreground mt-1.5">{sub}</p>}
    </div>
  )
}

// ─── Tab Trigger ──────────────────────────────────────────────────────────────
function TabTrigger({
  active, onClick, children, count,
}: { active: boolean; onClick: () => void; children: React.ReactNode; count?: number }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all whitespace-nowrap ${
        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
      {count !== undefined && (
        <Badge variant={active ? "default" : "ghost"} className="text-[11px] h-5 min-w-5 px-1.5 rounded-full">
          {count}
        </Badge>
      )}
      {active && (
        <motion.div
          layoutId="tab-indicator"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
          transition={{ type: "spring", stiffness: 400, damping: 35 }}
        />
      )}
    </button>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
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
      link: "/explore",
      linkLabel: "Explore Courses",
    },
    completed: {
      icon: GraduationCap,
      title: "No completed courses yet",
      desc: "Finish a course and it will appear here. Keep going!",
      link: "/explore",
      linkLabel: "Find a Course",
    },
  }
  const { icon: Icon, title, desc, link, linkLabel } = messages[tab]
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 space-y-4 text-center"
    >
      <div className="p-6 rounded-full bg-muted/60 ring-8 ring-muted/20">
        <Icon className="h-10 w-10 text-muted-foreground/60" />
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">{desc}</p>
      {link && linkLabel && (
        <Link href={link}>
          <Button className="mt-2 gap-2">
            {linkLabel} <ArrowUpRight className="h-4 w-4" />
          </Button>
        </Link>
      )}
    </motion.div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function MyLearning({ courses, progress, userTier, subscriptionTier }: MyLearningProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawTab = searchParams.get("tab") as Tab | null
  const [activeTab, setActiveTab] = useState<Tab>(rawTab || "available")

  const tierHierarchy: Record<string, number> = { free: 0, pro: 1, premium: 2 }
  const userTierLevel = tierHierarchy[userTier] ?? 0

  const progressByCourse = useMemo(() => {
    const map: Record<string, Progress> = {}
    for (const p of progress) map[p.course_id] = p
    return map
  }, [progress])

  const availableCourses = useMemo(
    () => courses.filter((c) => (tierHierarchy[c.required_tier] ?? 0) <= userTierLevel),
    [courses, userTierLevel]
  )
  const inProgressCourses = useMemo(
    () => courses.filter((c) => { const p = progressByCourse[c.id]; return p && !p.completed && p.progress_percentage > 0 }),
    [courses, progressByCourse]
  )
  const completedCourses = useMemo(
    () => courses.filter((c) => progressByCourse[c.id]?.completed),
    [courses, progressByCourse]
  )

  const switchTab = (tab: Tab) => {
    setActiveTab(tab)
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tab)
    router.replace(`/dashboard/courses?${params.toString()}`, { scroll: false })
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "available",   label: "Available",   icon: BookOpen     },
    { id: "in_progress", label: "In Progress",  icon: Clock        },
    { id: "completed",   label: "Completed",    icon: CheckCircle  },
  ]

  const currentCourses =
    activeTab === "available" ? availableCourses :
    activeTab === "in_progress" ? inProgressCourses :
    completedCourses

  const tierLabel = subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)

  const planIcon = subscriptionTier === "premium" ? <Crown className="h-4.5 w-4.5" />
    : subscriptionTier === "pro" ? <Zap className="h-4.5 w-4.5" />
    : <Award className="h-4.5 w-4.5" />

  const planIconBg = subscriptionTier === "premium"
    ? "bg-violet-100 dark:bg-violet-900/30"
    : subscriptionTier === "pro"
    ? "bg-blue-100 dark:bg-blue-900/30"
    : "bg-slate-100 dark:bg-slate-800/60"

  const planIconColor = subscriptionTier === "premium"
    ? "text-violet-600 dark:text-violet-400"
    : subscriptionTier === "pro"
    ? "text-blue-600 dark:text-blue-400"
    : "text-slate-600 dark:text-slate-400"

  const planAccent = subscriptionTier === "premium"
    ? "bg-violet-500"
    : subscriptionTier === "pro"
    ? "bg-blue-500"
    : "bg-slate-400"

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={BookOpen}
          label="Total Courses"
          value={courses.length}
          sub="On the platform"
          iconClassName="text-primary"
          iconBg="bg-primary/10"
          accent="bg-primary/40"
        />
        <StatCard
          icon={TrendingUp}
          label="In Progress"
          value={inProgressCourses.length}
          sub="Keep going!"
          iconClassName="text-amber-600 dark:text-amber-400"
          iconBg="bg-amber-100 dark:bg-amber-900/30"
          accent="bg-amber-500"
        />
        <StatCard
          icon={CheckCircle}
          label="Completed"
          value={completedCourses.length}
          sub="Great work 🎉"
          iconClassName="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-emerald-100 dark:bg-emerald-900/30"
          accent="bg-emerald-500"
        />
        <StatCard
          icon={() => planIcon}
          label="Your Plan"
          value={tierLabel}
          sub={subscriptionTier === "free" ? "Upgrade to unlock more" : "Active subscription"}
          iconClassName={planIconColor}
          iconBg={planIconBg}
          accent={planAccent}
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-border/60">
        <div className="flex gap-0 overflow-x-auto scrollbar-thin -mb-px">
          {tabs.map(({ id, label, icon: Icon }) => {
            const count = id === "available" ? availableCourses.length
              : id === "in_progress" ? inProgressCourses.length
              : completedCourses.length
            return (
              <TabTrigger key={id} active={activeTab === id} onClick={() => switchTab(id)} count={count}>
                <Icon className="h-4 w-4" />
                {label}
              </TabTrigger>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {currentCourses.length === 0 ? (
          <EmptyTab key={`empty-${activeTab}`} tab={activeTab} />
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
