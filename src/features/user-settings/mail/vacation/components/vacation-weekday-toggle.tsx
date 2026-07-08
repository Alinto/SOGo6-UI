'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import type { Control } from 'react-hook-form'
import { useController } from 'react-hook-form'
import type { VacationFormValues } from './vacation-schema'
import type { VacationWeekdays } from '../mail-vacation-types'
import { UI_WEEKDAY_KEYS } from '../mail-vacation-constants'

interface VacationWeekdayToggleProps {
  control: Control<VacationFormValues>
  name: 'constraints.weekdays'
}

function VacationWeekdayToggle({ control, name }: VacationWeekdayToggleProps) {
  const t = useTranslations('US_MAIL_VACATIONS')
  const { field } = useController({ control, name })

  const days = (field.value ?? {}) as VacationWeekdays

  function toggleDay(key: keyof VacationWeekdays) {
    field.onChange({ ...days, [key]: !days[key] })
  }

  return (
    <div className="grid grid-cols-3 gap-2 lg:grid-cols-7">
      {UI_WEEKDAY_KEYS.map((key) => (
        <Button
          key={key}
          type="button"
          variant={days[key] ? 'default' : 'outline'}
          className={cn(!days[key] && 'text-muted-foreground')}
          onClick={() => toggleDay(key)}
        >
          {t(`auto_reply.constraints.weekdays.${key}.string`)}
        </Button>
      ))}
    </div>
  )
}

export default VacationWeekdayToggle
