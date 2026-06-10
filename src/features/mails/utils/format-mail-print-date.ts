export function formatMailPrintDate(date: number | string): string {
  const d = typeof date === 'number' ? new Date(date) : new Date(date)
  if (Number.isNaN(d.getTime())) {
    return String(date)
  }
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
