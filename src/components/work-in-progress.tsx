import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTranslations } from 'next-intl'
import { Construction } from 'lucide-react'
import React from 'react'

interface WorkInProgressProps {
  title: string
  description?: string
}

const WorkInProgress: React.FC<WorkInProgressProps> = ({
  title,
  description,
}) => {
  const t = useTranslations('COMMONS')

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Construction className="h-5 w-5 text-orange-500" />
          {title}
        </DialogTitle>
        <DialogDescription>
          {description || t('workInProgress.description.string')}
        </DialogDescription>
      </DialogHeader>
      <div className="bg-muted flex flex-col items-center justify-center gap-3 rounded-lg p-8 text-center">
        <Construction className="text-muted-foreground h-16 w-16" />
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm">
            {t('workInProgress.message.string')}
          </p>
          <p className="text-muted-foreground text-xs">
            {t('workInProgress.comingSoon.string')}
          </p>
        </div>
      </div>
    </>
  )
}

export default WorkInProgress
