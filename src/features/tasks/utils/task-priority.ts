export type PriorityLevel = 'high' | 'medium' | 'low' | 'none'

export function getPriorityLevel(priority: number | undefined): PriorityLevel {
  const p = priority ?? 0
  if (p === 0) return 'none'
  if (p >= 1 && p <= 4) return 'high'
  if (p === 5) return 'medium'
  return 'low'
}
