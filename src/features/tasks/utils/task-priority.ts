export type PriorityLevel = 'high' | 'medium' | 'low' | 'none'

export type PriorityLevelWithBadge = Exclude<PriorityLevel, 'none'>

export function getPriorityLevel(priority: number | undefined): PriorityLevel {
  const p = priority ?? 0
  if (p === 0) return 'none'
  if (p >= 1 && p <= 4) return 'high'
  if (p === 5) return 'medium'
  return 'low'
}

/**
 * Priority badge palette (heat → cool):
 * - High: red — universal urgency signal
 * - Medium: amber — attention without critical alarm
 * - Low: sky — clearly colored, reads as “can wait” (not green = completed)
 */
export function getPriorityBadgeClassName(
  level: PriorityLevelWithBadge
): string {
  switch (level) {
    case 'high':
      return 'bg-destructive/15 text-destructive'
    case 'medium':
      return 'bg-warning/15 text-warning'
    case 'low':
      return 'bg-info/15 text-info'
  }
}
