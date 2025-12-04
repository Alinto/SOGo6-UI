'use client'

import { Button } from '@/components/ui/button'
import CustomEditor from '@/features/mails/components/compose/compose'
import ComposeHeader from '@/features/mails/components/compose/compose-header'
import styles from '@/features/mails/components/compose/compose.module.css'
import { cn } from '@/lib/utils'
import { Save, Send } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function ComposePage() {
  const t = useTranslations('COMPOSE')

  return (
    <div className="bg-background flex h-screen flex-col">
      {/* Header */}
      <div className="bg-primary text-primary-foreground flex h-12 shrink-0 items-center justify-between px-4">
        <span className="text-sm font-medium">{t('new_message.string')}</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden p-4">
        <div className="flex h-full flex-col">
          <ComposeHeader />
          <div
            className={cn(
              'mt-4 flex h-0 flex-1 flex-col overflow-y-auto',
              styles.compose_editor
            )}
          >
            <CustomEditor />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-muted/50 flex items-center justify-between border-t px-4 py-2">
        <Button variant="outline" size="sm">
          <Save className="mr-2 h-4 w-4" />
          {t('save_draft.string')}
        </Button>
        <Button size="sm">
          <Send className="mr-2 h-4 w-4" />
          {t('send.string')}
        </Button>
      </div>
    </div>
  )
}
