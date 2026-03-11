export function formatDate(dateString: string): string {
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
    return `${diffMinutes} min ago`
  } else if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } else if (isCurrentWeek) {
    return date.toLocaleDateString([], { weekday: 'long' }) // e.g., "Monday"
  } else if (date.getFullYear() < now.getFullYear()) {
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }
}
