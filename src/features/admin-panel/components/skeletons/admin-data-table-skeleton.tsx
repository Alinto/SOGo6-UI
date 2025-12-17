import { Skeleton } from '@/components/ui/skeleton'

const ROWS = 10

export default function AdminDataTableSkeleton() {
  return (
    <div className="p-4">
      {/* Title skeleton */}
      <Skeleton className="mb-4 h-8 w-48" />

      {/* Data table skeleton */}
      <div className="w-full">
        {/* Filter bar skeleton */}
        <div className="flex items-center py-4">
          <Skeleton className="h-10 w-72 max-w-sm" />
          <div className="flex-1" />
          <Skeleton className="h-10 w-20" />
        </div>

        {/* Table skeleton */}
        <div className="rounded-md border">
          {/* Table header */}
          <div className="bg-muted/50 border-b">
            <div className="flex h-12 items-center px-4">
              <Skeleton className="mr-4 h-4 w-4" />
              <Skeleton className="h-4 w-24" />
              <div className="flex-1" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>

          {/* Table rows */}
          <div className="divide-y">
            {Array.from({ length: ROWS }).map((_, i) => (
              <div key={i} className="flex h-12 items-center px-4">
                <Skeleton className="mr-4 h-4 w-4" />
                <Skeleton className="h-4 w-32" />
                <div className="flex-1" />
                <Skeleton className="h-8 w-8" />
              </div>
            ))}
          </div>
        </div>

        {/* Pagination skeleton */}
        <div className="flex items-center justify-between space-x-2 py-4">
          <Skeleton className="h-4 w-32" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </div>
    </div>
  )
}
