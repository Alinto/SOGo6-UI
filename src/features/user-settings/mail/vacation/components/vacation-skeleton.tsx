'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

const VacationSettingsSkeleton: React.FC = () => {
  return (
    <Card className="shadow-none">
      <CardHeader className="pb-4">
        <Skeleton className="h-5 w-48" />
      </CardHeader>
      <CardContent className="space-y-4 pb-4">
        <Skeleton className="h-5 w-64" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-5 w-56" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )
}

export default VacationSettingsSkeleton
