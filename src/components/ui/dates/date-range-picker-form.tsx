'use client'

import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { CalendarDays } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface DatePickerWithRangeFormProps {
  form: object
  name: string
  mode?: 'range' | 'single' | 'multiple' | 'default'
}

export function DatePickerWithRangeForm({
  form,
  name,
  mode = 'range',
}: DatePickerWithRangeFormProps) {
  const t = useTranslations('Calendar')
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  id="date"
                  variant={'outline'}
                  className={cn(
                    'w-full justify-between text-left font-normal',
                    !field.value && 'text-muted-foreground'
                  )}
                >
                  {field.value?.from ? (
                    field.value.to ? (
                      <>
                        {format(field.value.from, 'LLL dd, y')} -{' '}
                        {format(field.value.to, 'LLL dd, y')}
                      </>
                    ) : (
                      format(field.value.from, 'LLL dd, y')
                    )
                  ) : (
                    <span>
                      {mode === 'range' ? t('pick.range') : t('pick.single')}
                    </span>
                  )}
                  <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode={mode}
                defaultMonth={field.value?.from}
                selected={field.value}
                onSelect={field.onChange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
