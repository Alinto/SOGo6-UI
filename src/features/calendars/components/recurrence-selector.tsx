'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

export type RecurrenceRuleValue = {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number
  until?: string
  count?: number
  by_day?: string[]
  by_month_day?: number[]
  week_start: string
}

type EndType = 'never' | 'until' | 'count'

type RecurrenceSelectorProps = {
  value: RecurrenceRuleValue | null
  onChange: (_value: RecurrenceRuleValue | null) => void
  eventStart?: Date
}

export function RecurrenceSelector({
  value,
  onChange,
  eventStart,
}: RecurrenceSelectorProps) {
  const t = useTranslations('CALENDARS.eventForm.recurrence')
  const defaultDay = eventStart
    ? ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][eventStart.getDay()]
    : 'MO'

  const days = [
    { key: 'MO', label: t('days.mo') },
    { key: 'TU', label: t('days.tu') },
    { key: 'WE', label: t('days.we') },
    { key: 'TH', label: t('days.th') },
    { key: 'FR', label: t('days.fr') },
    { key: 'SA', label: t('days.sa') },
    { key: 'SU', label: t('days.su') },
  ]

  const [endType, setEndType] = useState<EndType>(
    value?.until ? 'until' : value?.count ? 'count' : 'never'
  )

  const enabled = value !== null

  const rule = value ?? {
    frequency: 'weekly' as const,
    interval: 1,
    by_day: [defaultDay],
    week_start: 'MO',
  }

  const handleToggle = (checked: boolean) => {
    if (!checked) {
      onChange(null)
      return
    }

    onChange({
      frequency: 'weekly',
      interval: 1,
      by_day: [defaultDay],
      week_start: 'MO',
    })
  }

  const update = (patch: Partial<RecurrenceRuleValue>) => {
    onChange({ ...rule, ...patch })
  }

  const toggleDay = (day: string) => {
    const current = rule.by_day ?? []
    const next = current.includes(day)
      ? current.filter((currentDay) => currentDay !== day)
      : [...current, day]

    if (next.length === 0) return

    update({ by_day: next })
  }

  const handleEndTypeChange = (type: EndType) => {
    setEndType(type)
    if (type === 'never') {
      update({ until: undefined, count: undefined })
    } else if (type === 'until') {
      update({ count: undefined, until: rule.until ?? '' })
    } else {
      update({ until: undefined, count: rule.count ?? 1 })
    }
  }

  return (
    <div className={cn('flex flex-col gap-3')}>
      <div className={cn('flex items-center gap-2')}>
        <Switch
          checked={enabled}
          onCheckedChange={handleToggle}
          id="recurrence-toggle"
        />
        <Label htmlFor="recurrence-toggle" className={cn('text-sm font-medium')}>
          {t('repeat')}
        </Label>
      </div>

      {enabled && (
        <div
          className={cn('border-border flex flex-col gap-4 rounded-md border p-4')}
        >
          <div className={cn('flex items-center gap-2')}>
            <span className={cn('text-muted-foreground text-sm')}>
              {t('every')}
            </span>
            <Input
              type="number"
              min={1}
              className={cn('w-16')}
              value={rule.interval}
              onChange={(e) =>
                update({ interval: Math.max(1, parseInt(e.target.value) || 1) })
              }
            />
            <Select
              value={rule.frequency}
              onValueChange={(value) =>
                update({
                  frequency: value as RecurrenceRuleValue['frequency'],
                  by_day: value === 'weekly' ? [defaultDay] : undefined,
                  by_month_day:
                    value === 'monthly' ? [eventStart?.getDate() ?? 1] : undefined,
                })
              }
            >
              <SelectTrigger className={cn('w-[130px]')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">{t('frequencies.daily')}</SelectItem>
                <SelectItem value="weekly">{t('frequencies.weekly')}</SelectItem>
                <SelectItem value="monthly">{t('frequencies.monthly')}</SelectItem>
                <SelectItem value="yearly">{t('frequencies.yearly')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {rule.frequency === 'weekly' && (
            <div className={cn('flex flex-col gap-1')}>
              <span className={cn('text-muted-foreground text-sm')}>
                {t('on')}
              </span>
              <div className={cn('flex gap-1')}>
                {days.map((day) => (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() => toggleDay(day.key)}
                    className={cn(
                      'h-8 w-8 rounded-full text-xs font-medium transition-colors',
                      rule.by_day?.includes(day.key)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    )}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {rule.frequency === 'monthly' && (
            <div className={cn('flex items-center gap-2')}>
              <span className={cn('text-muted-foreground text-sm')}>
                {t('onDay')}
              </span>
              <Input
                type="number"
                min={1}
                max={31}
                className={cn('w-16')}
                value={rule.by_month_day?.[0] ?? eventStart?.getDate() ?? 1}
                onChange={(e) =>
                  update({
                    by_month_day: [
                      Math.min(31, Math.max(1, parseInt(e.target.value) || 1)),
                    ],
                  })
                }
              />
              <span className={cn('text-muted-foreground text-sm')}>
                {t('ofTheMonth')}
              </span>
            </div>
          )}

          <div className={cn('flex flex-col gap-2')}>
            <span className={cn('text-muted-foreground text-sm')}>
              {t('ends')}
            </span>
            <div className={cn('flex flex-col gap-2')}>
              <label className={cn('flex cursor-pointer items-center gap-2')}>
                <input
                  type="radio"
                  name="recurrence-end"
                  checked={endType === 'never'}
                  onChange={() => handleEndTypeChange('never')}
                  className={cn('accent-primary')}
                />
                <span className={cn('text-sm')}>{t('endTypes.never')}</span>
              </label>

              <label className={cn('flex cursor-pointer items-center gap-2')}>
                <input
                  type="radio"
                  name="recurrence-end"
                  checked={endType === 'until'}
                  onChange={() => handleEndTypeChange('until')}
                  className={cn('accent-primary')}
                />
                <span className={cn('text-sm')}>{t('endTypes.on')}</span>
                {endType === 'until' && (
                  <Input
                    type="date"
                    className={cn('w-auto')}
                    value={rule.until ? rule.until.split('T')[0] : ''}
                    onChange={(e) =>
                      update({
                        until: e.target.value
                          ? `${e.target.value}T00:00:00.000Z`
                          : undefined,
                      })
                    }
                  />
                )}
              </label>

              <label className={cn('flex cursor-pointer items-center gap-2')}>
                <input
                  type="radio"
                  name="recurrence-end"
                  checked={endType === 'count'}
                  onChange={() => handleEndTypeChange('count')}
                  className={cn('accent-primary')}
                />
                <span className={cn('text-sm')}>{t('endTypes.after')}</span>
                {endType === 'count' && (
                  <>
                    <Input
                      type="number"
                      min={1}
                      className={cn('w-16')}
                      value={rule.count ?? 1}
                      onChange={(e) =>
                        update({
                          count: Math.max(1, parseInt(e.target.value) || 1),
                        })
                      }
                    />
                    <span className={cn('text-muted-foreground text-sm')}>
                      {t('occurrences')}
                    </span>
                  </>
                )}
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RecurrenceSelector
