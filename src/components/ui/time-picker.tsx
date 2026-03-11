// components/ui/time-picker.tsx
'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface TimePickerProps {
  value?: { hours: number; minutes: number }
  onChange?: (value: { hours: number; minutes: number }) => void
  disabled?: boolean
  defaultHours?: number
  defaultMinutes?: number
}

export function TimePicker({
  value,
  onChange,
  disabled = false,
  defaultHours = 0,
  defaultMinutes = 0,
}: TimePickerProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const minutes = Array.from({ length: 60 }, (_, i) => i)
  const resolvedValue = {
    hours: value?.hours ?? defaultHours,
    minutes: value?.minutes ?? defaultMinutes,
  }

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="flex items-center gap-2">
      <Select
        disabled={disabled}
        value={
          resolvedValue?.hours !== undefined
            ? String(resolvedValue.hours)
            : undefined
        }
        onValueChange={(val) =>
          onChange?.({
            hours: Number(val),
            minutes: resolvedValue?.minutes ?? 0,
          })
        }
      >
        <SelectTrigger className="w-20">
          <SelectValue placeholder="HH" />
        </SelectTrigger>
        <SelectContent>
          {hours.map((h) => (
            <SelectItem key={h} value={String(h)}>
              {pad(h)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span className="text-muted-foreground font-medium">:</span>

      <Select
        disabled={disabled}
        value={
          resolvedValue?.minutes !== undefined
            ? String(resolvedValue.minutes)
            : undefined
        }
        onValueChange={(val) =>
          onChange?.({ hours: resolvedValue?.hours ?? 0, minutes: Number(val) })
        }
      >
        <SelectTrigger className="w-20">
          <SelectValue placeholder="MM" />
        </SelectTrigger>
        <SelectContent>
          {minutes.map((m) => (
            <SelectItem key={m} value={String(m)}>
              {pad(m)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
