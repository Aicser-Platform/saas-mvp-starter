import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Skeleton } from "@/components/ui/skeleton"

export default function LessonLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader profile={null} />
      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar skeleton */}
        <div className="hidden lg:flex flex-col shrink-0 w-[380px] border-r bg-card h-[calc(100vh-64px)] sticky top-0 p-4 space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-full" />
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-8" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
          <div className="space-y-2 pt-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
                <Skeleton className="h-4 w-4 rounded-full shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main content skeleton */}
        <div className="flex-1 overflow-y-auto h-[calc(100vh-64px)]">
          {/* Video placeholder */}
          <Skeleton className="w-full aspect-video rounded-none bg-muted/80" />

          <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
            {/* Lesson badge + title */}
            <div className="space-y-3">
              <Skeleton className="h-5 w-32 rounded-full" />
              <Skeleton className="h-8 w-2/3" />
            </div>

            {/* Notes card */}
            <div className="rounded-xl border bg-card p-5 space-y-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>

            {/* Resources card */}
            <div className="rounded-xl border bg-card p-5 space-y-3">
              <Skeleton className="h-5 w-24" />
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                  <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation bar */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Skeleton className="h-9 w-36" />
              <Skeleton className="h-9 w-44" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
