export function formatCacheClock(ms: number, locale?: string): string {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ms))
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
