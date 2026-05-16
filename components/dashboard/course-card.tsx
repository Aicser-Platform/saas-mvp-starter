"use client"

import type { Course } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Lock,
  Play,
  BookOpen,
  Crown,
  Zap,
  Star,
  Clock,
  Users,
  ChevronRight,
  Code2,
  Brain,
  GitBranch,
  Server,
  Database,
  BarChart2,
  Cpu,
} from "lucide-react"
import Link from "next/link"

// ─── Helpers ─────────────────────────────────────────────────────────────────

const tierHierarchy: Record<string, number> = { free: 0, pro: 1, premium: 2 }

const difficultyDots: Record<string, string> = {
  beginner: "bg-emerald-500",
  intermediate: "bg-amber-500",
  advanced: "bg-rose-500",
}

const tierBadgeStyles: Record<string, string> = {
  free: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  pro: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  premium:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
}

/** Derive a category label from course title keywords */
export function deriveCategoryFromTitle(title: string): string {
  const t = title.toLowerCase()
  if (t.includes("git") || t.includes("github") || t.includes("version control")) return "Git & Version Control"
  if (t.includes("devops") || t.includes("docker") || t.includes("kubernetes") || t.includes("ci/cd")) return "DevOps"
  if (t.includes("python") || t.includes("javascript") || t.includes("typescript") || t.includes("programming") || t.includes("coding")) return "Programming"
  if (t.includes("machine learning") || t.includes("deep learning") || t.includes("neural") || t.includes("llm") || t.includes("gpt")) return "AI & Machine Learning"
  if (t.includes("data") || t.includes("sql") || t.includes("analytics") || t.includes("pandas")) return "Data Science"
  if (t.includes("cloud") || t.includes("aws") || t.includes("azure") || t.includes("gcp")) return "Cloud Computing"
  if (t.includes("web") || t.includes("react") || t.includes("next") || t.includes("html") || t.includes("css")) return "Web Development"
  if (t.includes("api") || t.includes("backend") || t.includes("fastapi") || t.includes("node")) return "Backend Development"
  if (t.includes("ai") || t.includes("artificial intelligence") || t.includes("chatbot")) return "AI & Machine Learning"
  return "Technology"
}

/** Category icon mapping */
export const categoryIcons: Record<string, React.ReactNode> = {
  "Git & Version Control": <GitBranch className="h-5 w-5" />,
  "DevOps": <Server className="h-5 w-5" />,
  "Programming": <Code2 className="h-5 w-5" />,
  "AI & Machine Learning": <Brain className="h-5 w-5" />,
  "Data Science": <Database className="h-5 w-5" />,
  "Cloud Computing": <Cpu className="h-5 w-5" />,
  "Web Development": <Code2 className="h-5 w-5" />,
  "Backend Development": <Server className="h-5 w-5" />,
  "Technology": <BarChart2 className="h-5 w-5" />,
}

/** Derive a pseudo-deterministic rating from course id */
function pseudoRating(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff
  return 4.0 + (Math.abs(hash) % 10) / 10
}

/** Derive a pseudo student count from course id */
function pseudoStudents(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 17 + id.charCodeAt(i)) & 0xffffffff
  const count = 200 + (Math.abs(hash) % 9800)
  return count >= 1000 ? `${(count / 1000).toFixed(1)}k` : `${count}`
}

/** Derive pseudo duration from course id */
function pseudoDuration(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 23 + id.charCodeAt(i)) & 0xffffffff
  const hours = 4 + (Math.abs(hash) % 28)
  return `${hours} hours`
}

// ─── Category gradient backgrounds for cards without thumbnails ───────────────
const categoryGradients: Record<string, string> = {
  "Git & Version Control": "from-orange-500/20 via-amber-400/10 to-orange-300/5",
  "DevOps": "from-sky-500/20 via-cyan-400/10 to-sky-300/5",
  "Programming": "from-violet-500/20 via-purple-400/10 to-violet-300/5",
  "AI & Machine Learning": "from-emerald-500/20 via-teal-400/10 to-emerald-300/5",
  "Data Science": "from-blue-500/20 via-indigo-400/10 to-blue-300/5",
  "Cloud Computing": "from-cyan-500/20 via-sky-400/10 to-cyan-300/5",
  "Web Development": "from-pink-500/20 via-rose-400/10 to-pink-300/5",
  "Backend Development": "from-slate-500/20 via-gray-400/10 to-slate-300/5",
  "Technology": "from-primary/20 via-accent/10 to-primary/5",
}

// ─── Component ────────────────────────────────────────────────────────────────

interface CourseCardProps {
  course: Course
  userTier: string
  /** Show progress bar if > 0 */
  progressPercent?: number
  completed?: boolean
  /** layout variant */
  variant?: "grid" | "compact"
}

export function CourseCard({
  course,
  userTier,
  progressPercent,
  completed,
  variant = "grid",
}: CourseCardProps) {
  const userTierLevel = tierHierarchy[userTier] ?? 0
  const courseTierLevel = tierHierarchy[course.required_tier] ?? 0
  const isLocked = courseTierLevel > userTierLevel
  const requiredTier = course.required_tier || "free"
  const category = course.category || deriveCategoryFromTitle(course.title)
  const rating = pseudoRating(course.id)
  const students = pseudoStudents(course.id)
  const duration = pseudoDuration(course.id)
  const gradient = categoryGradients[category] || categoryGradients["Technology"]

  if (variant === "compact") {
    return (
      <div className={`flex gap-3 p-3 rounded-xl border bg-card hover:shadow-md transition-all duration-200 group ${isLocked ? "opacity-75" : ""}`}>
        {/* Thumbnail */}
        <div className="relative w-20 h-16 rounded-lg overflow-hidden shrink-0">
          {course.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <div className="text-primary/60">{categoryIcons[category]}</div>
            </div>
          )}
          {isLocked && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
              <Lock className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          {completed && (
            <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
              <div className="bg-emerald-500 rounded-full p-0.5">
                <svg className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          )}
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors">{course.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{category}</p>
          {progressPercent !== undefined && progressPercent > 0 && (
            <div className="mt-2">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{progressPercent}% complete</p>
            </div>
          )}
        </div>
        {/* Arrow */}
        <div className="flex items-center shrink-0">
          {isLocked ? (
            <Lock className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          )}
        </div>
      </div>
    )
  }

  // ─── Grid variant (default) ───────────────────────────────────────────────
  return (
    <div
      className={`group relative flex flex-col rounded-2xl border bg-card overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ${
        isLocked ? "opacity-80" : "hover:-translate-y-1"
      }`}
    >
      {/* Thumbnail area */}
      <div className="relative overflow-hidden">
        {course.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className={`w-full h-44 object-cover transition-transform duration-500 ${
              isLocked ? "grayscale-[20%] opacity-70" : "group-hover:scale-105"
            }`}
          />
        ) : (
          <div
            className={`w-full h-44 bg-gradient-to-br ${gradient} flex flex-col items-center justify-center gap-2`}
          >
            <div className="p-4 rounded-2xl bg-background/50 backdrop-blur-sm text-primary">
              {categoryIcons[category] ?? <BookOpen className="h-7 w-7" />}
            </div>
          </div>
        )}

        {/* Tier badge top-left */}
        <div className="absolute top-3 left-3">
          {requiredTier === "free" ? (
            <span className="text-xs font-semibold bg-primary/90 text-primary-foreground px-2.5 py-1 rounded-full shadow backdrop-blur-sm">
              Free
            </span>
          ) : requiredTier === "pro" ? (
            <span className="flex items-center gap-1 text-xs font-semibold bg-primary text-primary-foreground px-2.5 py-1 rounded-full shadow backdrop-blur-sm">
              <Zap className="h-3 w-3" /> Pro
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-semibold bg-primary/80 text-primary-foreground px-2.5 py-1 rounded-full shadow backdrop-blur-sm ring-1 ring-primary-foreground/20">
              <Crown className="h-3 w-3" /> Premium
            </span>
          )}
        </div>

        {/* Difficulty badge top-right */}
        <div className="absolute top-3 right-3">
          <span className="flex items-center gap-1.5 text-xs font-medium bg-background/85 text-foreground/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-border/50 capitalize">
            <span className={`w-1.5 h-1.5 rounded-full ${difficultyDots[course.difficulty] || difficultyDots.beginner}`} />
            {course.difficulty}
          </span>
        </div>

        {/* Lock overlay */}
        {isLocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/40 backdrop-blur-[3px]">
            <div className="p-3 rounded-full bg-background/90 shadow-lg border mb-2">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs font-semibold text-foreground/70 bg-background/80 px-3 py-1 rounded-full">
              Upgrade to unlock
            </p>
          </div>
        )}

        {/* Completed overlay */}
        {completed && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2">
            <span className="flex items-center gap-1 text-xs font-bold bg-emerald-500 text-white px-3 py-1 rounded-full shadow">
              ✓ Completed
            </span>
          </div>
        )}

        {/* Progress bar if in-progress */}
        {progressPercent !== undefined && progressPercent > 0 && !completed && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-background/50">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Category */}
        <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
          <span className="shrink-0">{categoryIcons[category]}</span>
          <span className="truncate">{category}</span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>

        {/* Description */}
        {course.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {course.description}
          </p>
        )}

        {/* Meta row — rating, students, duration */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto pt-1 border-t border-border/50">
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-foreground">{rating.toFixed(1)}</span>
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {students}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {duration}
          </span>
        </div>

        {/* CTA */}
        <div className="pt-1">
          {isLocked ? (
            <Link href="/dashboard/subscription">
              <Button
                variant="outline"
                size="sm"
                className={`w-full font-semibold border-dashed transition-colors ${
                  requiredTier === "premium"
                    ? "hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/20"
                    : "hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                }`}
              >
                {requiredTier === "premium" ? (
                  <Crown className="mr-2 h-4 w-4" />
                ) : (
                  <Zap className="mr-2 h-4 w-4" />
                )}
                Upgrade to {requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)}
              </Button>
            </Link>
          ) : (
            <Link href={`/dashboard/courses/${course.id}`}>
              <Button
                size="sm"
                className={`w-full font-semibold ${
                  completed
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : progressPercent && progressPercent > 0
                    ? "bg-amber-500 hover:bg-amber-600 text-white"
                    : ""
                }`}
              >
                {completed ? (
                  "Review Course"
                ) : progressPercent && progressPercent > 0 ? (
                  <>
                    <Play className="mr-2 h-4 w-4 fill-current" />
                    Continue ({progressPercent}%)
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Start Learning
                  </>
                )}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
