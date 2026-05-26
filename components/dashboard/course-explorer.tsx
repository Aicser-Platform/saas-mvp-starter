"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { Course } from "@/lib/types"
import { CourseCard, deriveCategoryFromTitle, categoryIcons } from "@/components/dashboard/course-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, SlidersHorizontal, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface CourseExplorerProps {
  courses: Course[]
  userTier: string
  initialSearch?: string
}

const ALL = "All"

const difficultyDot: Record<string, string> = {
  Beginner:     "bg-emerald-500",
  Intermediate: "bg-amber-500",
  Advanced:     "bg-rose-500",
}

export function CourseExplorer({ courses, userTier, initialSearch = "" }: CourseExplorerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(initialSearch || searchParams.get("q") || "")
  const [activeCategory, setActiveCategory] = useState(ALL)
  const [activeDifficulty, setActiveDifficulty] = useState(ALL)
  const [activeTier, setActiveTier] = useState(ALL)

  useEffect(() => {
    setSearch(searchParams.get("q") || "")
  }, [searchParams])

  const categories = useMemo(() => {
    const cats = new Set(courses.map((c) => c.category || deriveCategoryFromTitle(c.title)))
    return [ALL, ...Array.from(cats).sort()]
  }, [courses])

  const filtered = useMemo(() => {
    let list = courses
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((c) =>
        c.title.toLowerCase().includes(q) ||
        (c.description?.toLowerCase().includes(q) ?? false) ||
        (c.category || deriveCategoryFromTitle(c.title)).toLowerCase().includes(q)
      )
    }
    if (activeCategory !== ALL) {
      list = list.filter((c) => (c.category || deriveCategoryFromTitle(c.title)) === activeCategory)
    }
    if (activeDifficulty !== ALL) {
      list = list.filter((c) => c.difficulty.toLowerCase() === activeDifficulty.toLowerCase())
    }
    if (activeTier !== ALL) {
      list = list.filter((c) => c.required_tier === activeTier)
    }
    return list
  }, [courses, search, activeCategory, activeDifficulty, activeTier])

  const grouped = useMemo(() => {
    const map: Record<string, Course[]> = {}
    for (const c of filtered) {
      const cat = c.category || deriveCategoryFromTitle(c.title)
      if (!map[cat]) map[cat] = []
      map[cat].push(c)
    }
    return map
  }, [filtered])

  const clearFilters = () => {
    setSearch("")
    setActiveCategory(ALL)
    setActiveDifficulty(ALL)
    setActiveTier(ALL)
    router.replace("/explore", { scroll: false })
  }

  const hasActiveFilters = search || activeCategory !== ALL || activeDifficulty !== ALL || activeTier !== ALL
  const showingCategories = activeCategory === ALL ? Object.keys(grouped).sort() : [activeCategory]

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="space-y-3">
        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin items-center">
          <span className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider shrink-0 mr-1">Category</span>
          {categories.map((cat) => {
            const isActive = activeCategory === cat
            const count = cat === ALL ? courses.length : courses.filter(c => (c.category || deriveCategoryFromTitle(c.title)) === cat).length
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 border ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/25"
                    : "bg-background border-border/60 text-muted-foreground hover:border-border hover:text-foreground hover:bg-muted/40"
                }`}
              >
                {cat !== ALL && <span className="h-3.5 w-3.5 shrink-0">{categoryIcons[cat]}</span>}
                {cat}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Level + Plan row */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Level pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin items-center">
            <span className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider shrink-0 mr-1">Level</span>
            {[ALL, "Beginner", "Intermediate", "Advanced"].map((diff) => {
              const isActive = activeDifficulty === diff
              return (
                <button
                  key={diff}
                  onClick={() => setActiveDifficulty(diff)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 border ${
                    isActive
                      ? "bg-foreground text-background border-foreground shadow-sm"
                      : "bg-background border-border/60 text-muted-foreground hover:border-border hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  {diff !== ALL && <span className={`w-2 h-2 rounded-full ${difficultyDot[diff]}`} />}
                  {diff}
                </button>
              )
            })}
          </div>

          {/* Plan pills */}
          <div className="flex gap-2 items-center shrink-0">
            <span className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider shrink-0 mr-1">Plan</span>
            {([ALL, "free", "pro", "premium"] as const).map((tier) => {
              const isActive = activeTier === tier
              const tierDot: Record<string, string> = { free: "bg-slate-400", pro: "bg-blue-500", premium: "bg-violet-500" }
              const label = tier === ALL ? "All" : tier.charAt(0).toUpperCase() + tier.slice(1)
              return (
                <button
                  key={tier}
                  onClick={() => setActiveTier(tier)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 border ${
                    isActive
                      ? "bg-foreground text-background border-foreground shadow-sm"
                      : "bg-background border-border/60 text-muted-foreground hover:border-border hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  {tier !== ALL && <span className={`w-2 h-2 rounded-full ${tierDot[tier]}`} />}
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Active search / filter info */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          {search && (
            <Badge variant="ghost" className="gap-1.5 px-2.5 py-1">
              <span className="text-xs">Search: "{search}"</span>
              <button onClick={() => { setSearch(""); router.replace("/explore", { scroll: false }) }} className="hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filtered.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "course" : "courses"} found
            </span>
          )}
          <button onClick={clearFilters} className="text-xs text-primary hover:underline font-medium ml-auto">
            Clear all
          </button>
        </div>
      )}

      {/* Empty state */}
      <AnimatePresence>
        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-24 space-y-4 text-center"
          >
            <div className="p-6 rounded-full bg-muted/60 ring-8 ring-muted/20">
              <BookOpen className="h-10 w-10 text-muted-foreground/60" />
            </div>
            <h3 className="text-xl font-bold">No courses found</h3>
            <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
              {search
                ? `Try a different keyword or browse all categories.`
                : `No courses are available in this category yet.`}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} className="mt-2">
                <X className="h-4 w-4" /> Clear filters
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grouped course sections */}
      <div className="space-y-10">
        {showingCategories.map((cat, sectionIdx) => {
          const catCourses = grouped[cat]
          if (!catCourses?.length) return null
          return (
            <motion.section
              key={cat}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIdx * 0.05 }}
              className="space-y-5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-primary">{categoryIcons[cat]}</span>
                  <h2 className="text-lg font-bold tracking-tight">{cat}</h2>
                  <Badge variant="ghost" className="text-xs font-semibold">
                    {catCourses.length} {catCourses.length === 1 ? "course" : "courses"}
                  </Badge>
                </div>
                {activeCategory === ALL && catCourses.length > 4 && (
                  <button
                    onClick={() => setActiveCategory(cat)}
                    className="text-sm text-primary font-semibold hover:underline underline-offset-2 flex items-center gap-1"
                  >
                    See all →
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {(activeCategory === ALL ? catCourses.slice(0, 4) : catCourses).map((course) => (
                  <CourseCard key={course.id} course={course} userTier={userTier} variant="grid" />
                ))}
              </div>
            </motion.section>
          )
        })}
      </div>
    </div>
  )
}
