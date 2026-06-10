import { SidebarGroupContent } from '@/components/ui/sidebar'
import { Construction } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { memo } from 'react'

const FeatureIncoming: React.FC = () => {
  const t = useTranslations('NAVIGATION.fast_access.coming_soon')

  return (
    <SidebarGroupContent className="flex flex-1 flex-col items-center justify-center gap-3 py-12 text-center">
      <Construction className="text-muted-foreground h-10 w-10 opacity-40" />
      <div className="space-y-1">
        <p className="text-sm font-medium">{t('title')}</p>
        <p className="text-muted-foreground max-w-[180px] text-xs">
          {t('description')}
        </p>
      </div>
    </SidebarGroupContent>
  )
}

export default memo(FeatureIncoming)
