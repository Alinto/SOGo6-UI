export function formatDate(
  dateString: string,
  forceLocale?: string,
  tMinutesAgo?: (count: number) => string
): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()

  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  const isCurrentWeek = date >= startOfWeek && date < now && !isToday

  if (diffHours < 1 && isToday) {
    return tMinutesAgo ? tMinutesAgo(diffMinutes) : `${diffMinutes}m`
  } else if (isToday) {
    return date.toLocaleTimeString(forceLocale || [], {
      hour: 'numeric',
      minute: '2-digit',
    })
  } else if (isCurrentWeek) {
    return date.toLocaleDateString(forceLocale || [], { weekday: 'long' }) // e.g., "Monday"
  } else if (date.getFullYear() < now.getFullYear()) {
    return date.toLocaleDateString(forceLocale || [], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } else {
    return date.toLocaleDateString(forceLocale || [], {
      month: 'short',
      day: 'numeric',
    })
  }
}
