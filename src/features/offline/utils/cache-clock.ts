function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/**
 * When cached data was stored: time only for today, date and time otherwise
 * (a bare "14:32" from three days ago would read as fresh).
 */
export function formatCacheClock(
  ms: number,
  locale?: string,
  now = Date.now()
): string {
  const date = new Date(ms)
  const sameDay = isSameLocalDay(date, new Date(now))
  return new Intl.DateTimeFormat(locale, {
    ...(sameDay
      ? {}
      : {
          day: 'numeric',
          month: 'short',
          ...(date.getFullYear() !== new Date(now).getFullYear()
            ? { year: 'numeric' as const }
            : {}),
        }),
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function folderLabelFromPath(folderPath: string): string {
  try {
    const decoded = decodeURIComponent(folderPath)
    const parts = decoded.split('/').filter(Boolean)
    return parts[parts.length - 1] || decoded
  } catch {
    return folderPath
  }
}
