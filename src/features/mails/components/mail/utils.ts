export function parseEmailContact(str: string) {
  const match = str.match(/^(.*)\s*<([^>]+)>$/)
  if (match) {
    return { name: match[1].trim(), email: match[2].trim() }
  }
  return { email: str.trim() }
}

export function formatMailTime(date: number) {
  const d = new Date(date)
  return d
    .toLocaleString('fr-FR', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    .replace(',', '')
}

export function formatSize(size: number) {
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} Mo`
  if (size >= 1024) return `${(size / 1024).toFixed(1)} Ko`
  return `${size} o`
}

export function getFileExtension(filename: string) {
  const match = filename.match(/\.([a-zA-Z0-9]+)$/)
  return match ? match[1] : ''
}
