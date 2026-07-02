'use client'

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useTranslations } from 'next-intl'
import type { Control } from 'react-hook-form'
import type { VacationFormValues } from './vacation-schema'

interface VacationTimeRangeFieldProps {
  control: Control<VacationFormValues>
}

function VacationTimeRangeField({ control }: VacationTimeRangeFieldProps) {
  const t = useTranslations('US_MAIL_VACATIONS')

  return (
    <div className="flex flex-wrap items-end gap-4">
      <FormField
        control={control}
        name="constraints.startTime"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('auto_reply.constraints.time.start.string')}</FormLabel>
            <FormControl>
              <Input type="time" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="constraints.endTime"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('auto_reply.constraints.time.end.string')}</FormLabel>
            <FormControl>
              <Input type="time" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  )
}

export default VacationTimeRangeField
