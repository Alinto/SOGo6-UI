import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslations } from 'next-intl'
import React from 'react'

const VisualizationSkeleton: React.FC = () => {
  const t = useTranslations('CONTACT_FORM')
  return (
    <Card className="h-full w-full">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-8 w-1/2 rounded" />
          <div>
            <Skeleton className="h-8 w-1/2 rounded" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Separator className="my-4" />
        <h3 className="text-lg font-semibold">{t('emails.string')}</h3>
        <div className="mt-3 grid grid-cols-3 gap-4">
          <Skeleton className="h-10 w-full rounded" />
        </div>
        <Separator className="my-4" />
        <h3 className="text-lg font-semibold">{t('addresses.string')}</h3>
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-10 w-1/2 rounded" />
        </div>
        <h3 className="text-lg font-semibold">
          {t('contact_information.string')}
        </h3>
        <Skeleton className="h-10 w-1/2 rounded" />

        <Skeleton className="h-10 w-1/2 rounded" />

        <Skeleton className="h-10 w-1/2 rounded" />

        <h3 className="text-lg font-semibold">{t('notes.string')}</h3>
        <Skeleton className="h-10 w-1/2 rounded" />
      </CardContent>
    </Card>
  )
}

export default VisualizationSkeleton
