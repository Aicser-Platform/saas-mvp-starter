"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { Course } from "@/lib/types"
import { CourseCard, deriveCategoryFromTitle, categoryIcons } from "@/components/dashboard/course-card"
import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"

interface CourseExplorerProps {
  courses: Course[]
  userTier: string
  initialSearch?: string
}

const ALL_CATEGORIES = "All"

export function CourseExplorer({ courses, userTier, initialSearch = "" }: CourseExplorerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(initialSearch || searchParams.get("q") || "")
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORIES)
  const [activeDifficulty, setActiveDifficulty] = useState("All")

  // Sync URL search param → local state whenever it changes (e.g. from navbar search)
  useEffect(() => {
    const q = searchParams.get("q") || ""
    setSearch(q)
  }, [searchParams])

  // Build category list from courses
  const categories = useMemo(() => {
    const cats = new Set(courses.map((c) => deriveCategoryFromTitle(c.title)))
    return [ALL_CATEGORIES, ...Array.from(cats).sort()]
  }, [courses])

  // Filtered + searched courses
  const filtered = useMemo(() => {
    let list = courses
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.description?.toLowerCase().includes(q) ?? false) ||
          deriveCategoryFromTitle(c.title).toLowerCase().includes(q)
      )
    }
    if (activeCategory !== ALL_CATEGORIES) {
      list = list.filter((c) => (c.category || deriveCategoryFromTitle(c.title)) === activeCategory)
    }
    if (activeDifficulty !== "All") {
      list = list.filter((c) => c.difficulty.toLowerCase() === activeDifficulty.toLowerCase())
    }
    return list
  }, [courses, search, activeCategory, activeDifficulty])

  // Group by category
  const grouped = useMemo(() => {
    const map: Record<string, Course[]> = {}
    for (const c of filtered) {
      const cat = deriveCategoryFromTitle(c.title)
      if (!map[cat]) map[cat] = []
      map[cat].push(c)
    }
    return map
  }, [filtered])

  const clearFilters = () => {
    setSearch("")
    setActiveCategory(ALL_CATEGORIES)
    setActiveDifficulty("All")
    router.replace("/explore", { scroll: false })
  }

  const showingCategories = activeCategory === ALL_CATEGORIES
    ? Object.keys(grouped).sort()
    : [activeCategory]

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin items-center">
          <span className="text-sm font-medium text-muted-foreground shrink-0 mr-1">Category:</span>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              size="sm"
              className={`shrink-0 rounded-full gap-1.5 transition-all ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-background hover:bg-muted/70"
              }`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat !== ALL_CATEGORIES && (
                <span className="h-4 w-4 shrink-0">
                  {categoryIcons[cat]}
                </span>
              )}
              {cat}
            </Button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin items-center">
          <span className="text-sm font-medium text-muted-foreground shrink-0 mr-1">Difficulty:</span>
          {["All", "Beginner", "Intermediate", "Advanced"].map((diff) => (
            <Button
              key={diff}
              variant={activeDifficulty === diff ? "secondary" : "ghost"}
              size="sm"
              className={`shrink-0 rounded-full transition-all border ${
                activeDifficulty === diff
                  ? "border-primary bg-primary text-primary-foreground font-medium shadow-md"
                  : "border-transparent hover:bg-muted/50 text-muted-foreground"
              }`}
              onClick={() => setActiveDifficulty(diff)}
            >
              {diff}
            </Button>
          ))}
        </div>
      </div>

      {/* Search results info */}
      {search && (
        <p className="text-sm text-muted-foreground">
          {filtered.length === 0
            ? `No courses found for "${search}"`
            : `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${search}"`}
        </p>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
          <div className="p-5 rounded-full bg-muted">
            <BookOpen className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold">No courses found</h3>
          <p className="text-muted-foreground max-w-sm">
            {search ? `Try a different search term or browse all categories.` : `No courses available in this category yet.`}
          </p>
          {(search || activeCategory !== ALL_CATEGORIES || activeDifficulty !== "All") && (
            <Button variant="outline" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>
      )}

      {/* Grouped course sections */}
      {showingCategories.map((cat) => {
        const catCourses = grouped[cat]
        if (!catCourses?.length) return null
        return (
          <section key={cat} className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-primary">{categoryIcons[cat]}</span>
                <h2 className="text-xl font-bold">{cat}</h2>
                <span className="text-sm text-muted-foreground ml-1">
                  ({catCourses.length} {catCourses.length === 1 ? "course" : "courses"})
                </span>
              </div>
              {activeCategory === ALL_CATEGORIES && catCourses.length > 4 && (
                <Button variant="ghost" size="sm" onClick={() => setActiveCategory(cat)} className="text-primary hover:text-primary/80">
                  See more →
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {(activeCategory === ALL_CATEGORIES ? catCourses.slice(0, 4) : catCourses).map((course) => (
                <CourseCard key={course.id} course={course} userTier={userTier} variant="grid" />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
