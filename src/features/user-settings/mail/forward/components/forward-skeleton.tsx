'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { FixedButtonGroupSkeleton } from '@/components/ui/skeletons/buttons'
import InputSkeleton from '@/components/ui/skeletons/inputs'
import React from 'react'

const ForwardSettingsSkeleton: React.FC = () => {
  return (
    <>
      <Card className="border-muted bg-muted/30 w-full">
        <CardHeader className="pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <CardTitle className="text-xl">
                <Skeleton className="h-7 w-64" />
              </CardTitle>
              {/* Toggle skeleton */}
              <Skeleton className="h-6 w-24" />
            </div>
            <CardDescription>
              <Skeleton className="h-4 w-96" />
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="border-muted space-y-4 border-t pt-4">
          {/* Email input section */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-80" />
            <InputSkeleton />
          </div>

          {/* Checkboxes section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="flex items-center space-x-3">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form buttons */}
      <FixedButtonGroupSkeleton />
    </>
  )
}

export default ForwardSettingsSkeleton
