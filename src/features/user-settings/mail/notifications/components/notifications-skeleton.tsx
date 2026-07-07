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

const NotificationsSettingsSkeleton: React.FC = () => {
  return (
    <>
      <Card className="border-muted bg-muted/30 w-full">
        <CardHeader className="pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <CardTitle className="text-xl">
                <Skeleton className="h-7 w-64" />
              </CardTitle>
              <Skeleton className="h-6 w-24" />
            </div>
            <CardDescription>
              <Skeleton className="h-4 w-96" />
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="border-muted space-y-4 border-t pt-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-80" />
            <InputSkeleton />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <InputSkeleton />
          </div>
        </CardContent>
      </Card>
      <FixedButtonGroupSkeleton />
    </>
  )
}

export default NotificationsSettingsSkeleton
