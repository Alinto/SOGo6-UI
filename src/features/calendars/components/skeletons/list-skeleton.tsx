import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

const ListSkeleton: React.FC = () => {
  return (
    <div className="h-full overflow-y-auto p-4">
      <Skeleton className="mb-4 h-8 w-48" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex items-start gap-3 rounded-lg border p-3"
          >
            <Skeleton className="mt-1 h-5 w-5 shrink-0" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ListSkeleton
