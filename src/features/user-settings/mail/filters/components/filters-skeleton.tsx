'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

const FiltersSettingsSkeleton: React.FC = () => {
  return (
    <Card className="shadow-none">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-64 max-w-full" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pb-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="border-border flex items-center gap-3 rounded-lg border px-3 py-2"
          >
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-6 w-10 rounded-full" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default FiltersSettingsSkeleton
