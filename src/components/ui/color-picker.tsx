// components/ui/color-picker.tsx
'use client'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Check } from 'lucide-react'
import { useTranslations } from 'next-intl'

export const DEFAULT_COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f59e0b',
  '#6366f1',
  '#000000',
  '#6b7280',
  '#9ca3af',
  '#d1d5db',
  '#ffffff',
]

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  colors?: string[]
  disabled?: boolean
}

export function ColorPicker({
  value,
  onChange,
  colors = DEFAULT_COLORS,
  disabled = false,
}: ColorPickerProps) {
  const t = useTranslations('COMPONENTS.color-picker')
  const resolvedValue = value || colors[0]
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          style={{ backgroundColor: resolvedValue }}
          disabled={disabled}
          className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-300 transition-colors hover:border-gray-400 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:outline-none"
        />
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="grid grid-cols-5 gap-2">
          {colors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onChange(color)}
              style={{ backgroundColor: color }}
              className="relative h-8 w-8 rounded-md border-2 border-gray-300 transition-all hover:scale-110 focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 focus:outline-none"
            >
              {resolvedValue === color && (
                <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow-md" />
              )}
            </button>
          ))}
        </div>

        <div className="mt-3 border-t pt-3">
          <p className="mb-2 text-xs text-gray-500"> {t('custom-color')}</p>
          <div className="flex items-center gap-2">
            <div
              className="relative h-8 w-8 shrink-0 cursor-pointer overflow-hidden rounded-md border-2 border-gray-300"
              style={{ backgroundColor: resolvedValue }}
            >
              <input
                type="color"
                value={resolvedValue}
                onChange={(e) => onChange(e.target.value)}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </div>
            <input
              type="text"
              value={resolvedValue}
              onChange={(e) => {
                const val = e.target.value
                if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) onChange(val)
              }}
              className="h-8 w-full rounded-md border border-gray-300 px-2 font-mono text-xs focus:ring-2 focus:ring-gray-400 focus:outline-none"
              maxLength={7}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
