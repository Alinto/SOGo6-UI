import React, { useCallback, useEffect, useRef } from 'react'

export function parseEmailContact(str: string) {
  const match = str.trim().match(/^(.*)\s*<([^>]+)>$/)
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

export function isBase64(str: string) {
  if (!str || str.length < 16) return false
  return /^[A-Za-z0-9+/=\r\n]+$/.test(str) && str.length % 4 === 0
}

export function decodeBase64(str: string): string {
  try {
    if (typeof window === 'undefined') {
      return Buffer.from(str, 'base64').toString('utf-8')
    } else {
      return decodeURIComponent(
        Array.prototype.map
          .call(
            atob(str),
            (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
          )
          .join('')
      )
    }
  } catch {
    return str
  }
}

export function containsExternalImages(html: string): boolean {
  return /<img[^>]+(?:src|data-src)=['"](https?:\/\/[^'"]+)['"]/i.test(html)
}

export function replaceDataSrcWithSrc(html: string): string {
  return html.replace(
    /<img([^>]*?)data-src=['"]([^'"]+)['"]/gi,
    '<img$1src="$2"'
  )
}

export function blockExternalImages(html: string): string {
  html = html.replace(
    /<img([^>]*?)src=['"](https?:\/\/[^'"]+)['"]/gi,
    '<img$1src="" style="display:none;"'
  )
  html = html.replace(
    /<img([^>]*?)data-src=['"](https?:\/\/[^'"]+)['"]/gi,
    '<img$1src="" style="display:none;"'
  )
  return html
}

export const ShadowEmailContent = ({ html }: { html: string }) => {
  const elementRef = useRef<HTMLDivElement | null>(null)

  const refCallback = useCallback(
    (el: HTMLDivElement | null) => {
      elementRef.current = el
      if (el) {
        el.innerHTML = html || ''
      }
    },
    [html]
  )

  useEffect(() => {
    if (elementRef.current) {
      elementRef.current.innerHTML = html || ''
    }
  }, [html])

  // eslint-disable-next-line react-hooks/refs
  return React.createElement('div', { ref: refCallback })
}
