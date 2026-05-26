"use client"

import type { Course } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Lock, Play, BookOpen, Crown, Zap, Star, Clock, Users, ChevronRight,
  Code2, Brain, GitBranch, Server, Database, BarChart2, Cpu, CheckCircle2,
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

// ─── Helpers ─────────────────────────────────────────────────────────────────

const tierHierarchy: Record<string, number> = { free: 0, pro: 1, premium: 2 }

const difficultyConfig: Record<string, { color: string; dot: string; label: string }> = {
  beginner:     { color: "success",  dot: "bg-emerald-500", label: "Beginner"     },
  intermediate: { color: "warning",  dot: "bg-amber-500",   label: "Intermediate" },
  advanced:     { color: "destructive", dot: "bg-rose-500", label: "Advanced"     },
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
  "Git & Version Control": <GitBranch className="h-4 w-4" />,
  "DevOps":               <Server className="h-4 w-4" />,
  "Programming":          <Code2 className="h-4 w-4" />,
  "AI & Machine Learning":<Brain className="h-4 w-4" />,
  "Data Science":         <Database className="h-4 w-4" />,
  "Cloud Computing":      <Cpu className="h-4 w-4" />,
  "Web Development":      <Code2 className="h-4 w-4" />,
  "Backend Development":  <Server className="h-4 w-4" />,
  "Technology":           <BarChart2 className="h-4 w-4" />,
}

const categoryGradients: Record<string, string> = {
  "Git & Version Control": "from-orange-400/30 via-amber-300/15 to-orange-200/5",
  "DevOps":               "from-sky-500/30 via-cyan-400/15 to-sky-300/5",
  "Programming":          "from-violet-500/30 via-purple-400/15 to-violet-300/5",
  "AI & Machine Learning":"from-emerald-500/30 via-teal-400/15 to-emerald-300/5",
  "Data Science":         "from-blue-500/30 via-indigo-400/15 to-blue-300/5",
  "Cloud Computing":      "from-cyan-500/30 via-sky-400/15 to-cyan-300/5",
  "Web Development":      "from-pink-500/30 via-rose-400/15 to-pink-300/5",
  "Backend Development":  "from-slate-500/30 via-gray-400/15 to-slate-300/5",
  "Technology":           "from-primary/25 via-accent/15 to-primary/5",
}

const categoryIconBg: Record<string, string> = {
  "Git & Version Control": "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  "DevOps":               "bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400",
  "Programming":          "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
  "AI & Machine Learning":"bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  "Data Science":         "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  "Cloud Computing":      "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",
  "Web Development":      "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
  "Backend Development":  "bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400",
  "Technology":           "bg-primary/10 text-primary",
}

function pseudoRating(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff
  return 4.0 + (Math.abs(hash) % 10) / 10
}
function pseudoStudents(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 17 + id.charCodeAt(i)) & 0xffffffff
  const count = 200 + (Math.abs(hash) % 9800)
  return count >= 1000 ? `${(count / 1000).toFixed(1)}k` : `${count}`
}
function pseudoDuration(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 23 + id.charCodeAt(i)) & 0xffffffff
  return `${4 + (Math.abs(hash) % 28)}h`
}

// ─── Component ────────────────────────────────────────────────────────────────

interface CourseCardProps {
  course: Course
  userTier: string
  progressPercent?: number
  completed?: boolean
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
  const iconBg = categoryIconBg[category] || categoryIconBg["Technology"]
  const diff = difficultyConfig[course.difficulty] || difficultyConfig.beginner

  // ─── Compact ─────────────────────────────────────────────────────────────
  if (variant === "compact") {
    return (
      <motion.div
        whileHover={{ y: -1 }}
        className={`flex gap-3 p-3 rounded-xl border border-border/60 bg-card hover:shadow-md hover:border-border transition-all duration-200 group ${isLocked ? "opacity-70" : ""}`}
      >
        <div className="relative w-16 h-14 rounded-lg overflow-hidden shrink-0">
          {course.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <div className={`p-1.5 rounded-md ${iconBg}`}>{categoryIcons[category]}</div>
            </div>
          )}
          {isLocked && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center backdrop-blur-[1px]">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors leading-snug">{course.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{category}</p>
          {progressPercent !== undefined && progressPercent > 0 && (
            <div className="mt-1.5">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full" style={{ width: `${progressPercent}%` }} />
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">{progressPercent}% complete</p>
            </div>
          )}
        </div>
        <div className="flex items-center shrink-0">
          {isLocked
            ? <Lock className="h-3.5 w-3.5 text-muted-foreground" />
            : <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          }
        </div>
      </motion.div>
    )
  }

  // ─── Grid variant ─────────────────────────────────────────────────────────
  return (
    <motion.div
      whileHover={isLocked ? {} : { y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`group relative flex flex-col rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm hover:shadow-xl hover:border-border transition-shadow duration-300 ${isLocked ? "opacity-80" : ""}`}
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden">
        {course.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className={`w-full h-44 object-cover transition-transform duration-500 ${isLocked ? "grayscale-[30%] opacity-70" : "group-hover:scale-105"}`}
          />
        ) : (
          <div className={`w-full h-44 bg-gradient-to-br ${gradient} flex flex-col items-center justify-center`}>
            <div className={`p-4 rounded-2xl ${iconBg}`}>
              {categoryIcons[category] ?? <BookOpen className="h-7 w-7" />}
            </div>
          </div>
        )}

        {/* Bottom gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

        {/* Tier badge */}
        <div className="absolute top-3 left-3">
          {requiredTier === "free" ? (
            <Badge variant="free" className="shadow-sm backdrop-blur-sm bg-background/80 text-foreground border-border/60">Free</Badge>
          ) : requiredTier === "pro" ? (
            <Badge variant="pro" className="shadow-sm backdrop-blur-sm"><Zap className="h-3 w-3" /> Pro</Badge>
          ) : (
            <Badge variant="premium" className="shadow-sm backdrop-blur-sm"><Crown className="h-3 w-3" /> Premium</Badge>
          )}
        </div>

        {/* Difficulty badge */}
        <div className="absolute top-3 right-3">
          <span className="flex items-center gap-1.5 text-xs font-medium bg-background/85 text-foreground/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-border/40 capitalize">
            <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
            {diff.label}
          </span>
        </div>

        {/* Completed badge */}
        {completed && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2">
            <span className="flex items-center gap-1 text-xs font-bold bg-emerald-500 text-white px-3 py-1 rounded-full shadow">
              <CheckCircle2 className="h-3 w-3" /> Completed
            </span>
          </div>
        )}

        {/* Lock overlay */}
        {isLocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-[2px]">
            <div className="p-3 rounded-full bg-background/90 shadow-lg border border-border/50 mb-2">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
            <span className="text-xs font-semibold text-foreground/70 bg-background/80 px-3 py-1 rounded-full border border-border/40">
              Upgrade to unlock
            </span>
          </div>
        )}

        {/* Progress bar */}
        {progressPercent !== undefined && progressPercent > 0 && !completed && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/20">
            <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${progressPercent}%` }} />
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-4 gap-2.5">
        {/* Category */}
        <div className="flex items-center gap-1.5">
          <span className={`p-1 rounded-md ${iconBg}`}>{categoryIcons[category]}</span>
          <span className="text-xs font-medium text-muted-foreground truncate">{category}</span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-[15px] leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>

        {/* Description */}
        {course.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {course.description}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto pt-2.5 border-t border-border/40">
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-foreground/80">{rating.toFixed(1)}</span>
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
        <div className="pt-0.5">
          {isLocked ? (
            <Link href="/dashboard/subscription">
              <Button variant="outline" size="sm" className={`w-full font-semibold border-dashed ${
                requiredTier === "premium"
                  ? "hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/20"
                  : "hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20"
              }`}>
                {requiredTier === "premium" ? <Crown className="h-3.5 w-3.5" /> : <Zap className="h-3.5 w-3.5" />}
                Upgrade to {requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)}
              </Button>
            </Link>
          ) : (
            <Link href={`/dashboard/courses/${course.id}`}>
              <Button size="sm" className={`w-full font-semibold ${
                completed
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : progressPercent && progressPercent > 0
                  ? "bg-amber-500 hover:bg-amber-600 text-white"
                  : ""
              }`}>
                {completed ? (
                  <><CheckCircle2 className="h-3.5 w-3.5" /> Review Course</>
                ) : progressPercent && progressPercent > 0 ? (
                  <><Play className="h-3.5 w-3.5 fill-current" /> Continue ({progressPercent}%)</>
                ) : (
                  <><Play className="h-3.5 w-3.5" /> Start Learning</>
                )}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  )
}
