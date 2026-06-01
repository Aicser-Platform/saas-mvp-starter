import { Skeleton } from "@/components/ui/skeleton"

export default function AdminPaymentsLoading() {
  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 p-6 md:p-8 space-y-8">
        {/* Heading */}
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-64" />
        </div>

        {/* Search */}
        <Skeleton className="h-10 w-64 rounded-lg" />

        {/* Payments table */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="grid grid-cols-6 gap-4 px-4 py-3 border-b bg-muted/40">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
          {Array.from({ length: 10 }).map((_, row) => (
            <div key={row} className="grid grid-cols-6 gap-4 px-4 py-3 border-b last:border-0 items-center">
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-7 rounded-full shrink-0" />
                <Skeleton className="h-4 flex-1" />
              </div>
              {Array.from({ length: 5 }).map((_, col) => (
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
