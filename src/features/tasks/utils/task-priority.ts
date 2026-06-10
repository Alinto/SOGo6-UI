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
      return 'bg-red-500/15 text-red-700 dark:text-red-400'
    case 'medium':
      return 'bg-amber-500/15 text-amber-800 dark:text-amber-400'
    case 'low':
      return 'bg-sky-500/15 text-sky-700 dark:text-sky-400'
  }
}
