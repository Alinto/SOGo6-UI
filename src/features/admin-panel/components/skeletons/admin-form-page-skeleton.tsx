import { Skeleton } from '@/components/ui/skeleton'

const ROWS = 16

//TODO: A refaire quand on aura les formulaires dynamiques
export default function DomainsPageSkeleton() {
  return (
    <div className="flex h-full w-full flex-col">
      {/* Page header */}
      <div className="mb-6 flex items-center">
        {/* Title */}
        <Skeleton className="h-8 w-48" />
        {/* Spacer */}
        <div className="flex-1" />
        {/* Add new domain button */}
        <Skeleton className="h-8 w-40 rounded-md" />
      </div>
      {/* Filter & actions */}
      <div className="mb-4 flex items-center gap-2">
        {/* Filter input */}
        <Skeleton className="h-8 w-64 rounded-md" />
        <div className="flex-1" />
      </div>
      {/* Table skeleton */}
      <div className="overflow-hidden rounded-md border">
        {/* Table header */}
        <div className="bg-muted/40 flex items-center px-6 py-3">
          <Skeleton className="h-5 w-32 rounded" />
          <Skeleton className="ml-6 h-5 w-48 rounded" />
          <Skeleton className="ml-6 h-5 w-32 rounded" />
        </div>
        {/* Table rows */}
        <div className="flex flex-col">
          {Array.from({ length: ROWS }).map((_, i) => (
            <div
              key={i}
              className={`flex items-center px-6 py-3 ${i % 2 === 0 ? 'bg-muted/40' : ''}`}
            >
              {/* Domain avatar/initial */}
              <Skeleton className="h-8 w-8 rounded-full" />
              {/* Domain name */}
              <Skeleton className="ml-4 h-5 w-48 rounded" />
              {/* Some info/column */}
              <Skeleton className="ml-4 h-5 w-32 rounded" />
              {/* Spacer */}
              <div className="flex-1" />
              {/* Actions */}
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
