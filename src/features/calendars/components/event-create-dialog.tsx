'use client'

import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { type Calendar } from '@/features/calendars'
import { LazyEventForm } from '@/features/calendars/components/event-form-lazy'
import {
  formDialogContentClassName,
  formDialogHeaderClassName,
  formDialogTitleClassName,
} from '@/lib/utils/form-dialog-layout'
import { useTranslations } from 'next-intl'
import { memo } from 'react'
import type { SlotInfo } from 'react-big-calendar'

interface EventCreateDialogProps {
  selectedSlot: SlotInfo | null
  calendarKey: string
  calendars: Calendar[]
  onClose: () => void
}

function EventCreateDialog({
  selectedSlot,
  calendarKey,
  calendars,
  onClose,
}: EventCreateDialogProps) {
  const t = useTranslations('CALENDARS')

  return (
    <Dialog
      open={selectedSlot !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className={formDialogContentClassName('2xl')}>
        <DialogHeader className={formDialogHeaderClassName}>
          <h2 className={formDialogTitleClassName}>
            {t('events.create.string')}
          </h2>
        </DialogHeader>
        {selectedSlot ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <LazyEventForm
              calendarKey={calendarKey}
              calendars={calendars}
              start={selectedSlot.start}
              end={selectedSlot.end}
              onCancel={onClose}
            />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

export default memo(EventCreateDialog)
