import { Skeleton } from "@/components/ui/skeleton"

export default function AdminCoursesLoading() {
  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 p-6 md:p-8 space-y-8">
        {/* Heading + Add button */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-52" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>

        {/* Search + filter */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-64 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>

        {/* Courses table */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="grid grid-cols-5 gap-4 px-4 py-3 border-b bg-muted/40">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
          {Array.from({ length: 8 }).map((_, row) => (
            <div key={row} className="grid grid-cols-5 gap-4 px-4 py-3 border-b last:border-0 items-center">
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-16 rounded-md shrink-0" />
                <Skeleton className="h-4 flex-1" />
              </div>
              {Array.from({ length: 4 }).map((_, col) => (
                <Skeleton key={col} className="h-4 w-full" />
              ))}
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-20 rounded-lg" />
            <Skeleton className="h-9 w-20 rounded-lg" />
          </div>
        </div>
      </main>
    </div>
  )
}
