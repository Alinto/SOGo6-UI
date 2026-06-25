export function downloadBlobAsFile(
  blob: Blob,
  filename: string
): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

export function filenameFromContentDisposition(
  header: string | null | undefined,
  fallback: string
): string {
  if (!header) return fallback

  const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1])
  }

  const quotedMatch = header.match(/filename="([^"]+)"/i)
  if (quotedMatch?.[1]) {
    return quotedMatch[1]
  }

  const plainMatch = header.match(/filename=([^;]+)/i)
  if (plainMatch?.[1]) {
    return plainMatch[1].trim()
  }

  return fallback
}
