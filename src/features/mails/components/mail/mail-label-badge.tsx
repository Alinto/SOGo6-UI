'use client'

import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

export type MailLabelBadgeProps = {
  name: string
  color: string
  displayName: string
  size?: 'sm' | 'md'
  onRemove?: (name: string) => void
  removeAriaLabel?: string
}

export default function MailLabelBadge({
  name,
  color,
  displayName,
  size = 'md',
  onRemove,
  removeAriaLabel,
}: MailLabelBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={
        size === 'sm'
          ? 'gap-1 rounded-full px-1.5 py-0 text-xs font-normal'
          : 'gap-1 rounded-full py-0.5 pr-1 font-normal'
      }
      style={{
        borderColor: `color-mix(in srgb, ${color} 15%, hsl(var(--card)))`,
        backgroundColor: `color-mix(in srgb, ${color} 15%, hsl(var(--card)))`,
      }}
    >
      <span
        className={
          size === 'sm'
            ? 'h-1.5 w-1.5 shrink-0 rounded-full'
            : 'h-2 w-2 shrink-0 rounded-full'
        }
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      {displayName}
      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(name)}
          aria-label={removeAriaLabel}
          className="hover:bg-muted ml-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </Badge>
  )
}
