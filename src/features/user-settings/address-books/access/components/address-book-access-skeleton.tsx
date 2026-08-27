import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

const AddressBookAccessSkeleton: React.FC = () => (
  <div className="space-y-2">
    {Array.from({ length: 3 }).map((_, i) => (
      <div
        key={i}
        className="flex items-center justify-between gap-3 rounded-lg border p-4"
      >
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3.5 w-24" />
        </div>
        <Skeleton className="h-8 w-28" />
      </div>
    ))}
  </div>
)

export default AddressBookAccessSkeleton
