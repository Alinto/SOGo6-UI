import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

const GlobalAccessSkeleton: React.FC = () => (
  <div className="space-y-3 rounded-lg border px-4 py-2">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 py-1.5">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    ))}
  </div>
)

export default GlobalAccessSkeleton
