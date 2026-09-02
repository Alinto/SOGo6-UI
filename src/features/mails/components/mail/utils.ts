import { getCachedEnvVars } from '@/lib/env-service'
import React, { useEffect, useRef } from 'react'

// Resolve API base URL at call time (env may load after module init)
function getApiBaseUrl(): string {
  const fromEnv = getCachedEnvVars()?.REACT_APP_API_BASE_URL
  if (fromEnv && fromEnv !== '/fakeApi') {
    return fromEnv
  }
  return '/api/user/v1'
}

/**
 * Builds the complete URL for an attachment
 * If the URL is relative, adds the API base URL
 * Properly encodes special characters (spaces, accents, etc.)
 *
 * @param uri - Attachment URI (relative or absolute)
 * @returns Complete URL to download the attachment
 */
export function buildAttachmentUrl(uri: string): string {
  // Edge case: Empty or undefined URI
  if (!uri) {
    return ''
  }

  // If the URL is already absolute (http:// or https://), return it as is
  if (uri.startsWith('http://') || uri.startsWith('https://')) {
    return uri
  }

  // If the URL is relative to /fakeApi, return it as is (Next.js route)
  if (uri.startsWith('/fakeApi')) {
    return uri
  }

  // Normalize the base URL (remove trailing slash)
  const base = getApiBaseUrl()
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base

  // Normalize the URI (remove leading slash)
  const normalizedUri = uri.startsWith('/') ? uri.slice(1) : uri

  // Encode each path segment separately to handle special characters
  // This preserves "/" but encodes spaces, accents, apostrophes, etc.
  const segments = normalizedUri.split('/')
  const encodedSegments = segments.map((segment) => encodeURIComponent(segment))
  const encodedUri = encodedSegments.join('/')

  return `${normalizedBase}/${encodedUri}`
}

export function buildAttachmentsUrl({
  accountId,
  folder,
  mailId,
}: {
  accountId: string
  folder: string
  mailId: string
}): string {
  return `mailboxes/${accountId}/folders/${folder}/mails/${mailId}/attachments/`
}

export function parseEmailContact(
  str: string | { name: string; email: string }
) {
  if (typeof str === 'object' && str !== null) {
    return {
      name: str.name || '',
      email: str.email || '',
    }
  }

  if (typeof str !== 'string') {
    return { name: '', email: '' }
  }

  const match = str.trim().match(/^(.*)\s*<([^>]+)>$/)
  if (match) {
    return { name: match[1].trim(), email: match[2].trim() }
  }

  return { name: '', email: str.trim() }
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
  if (!html || typeof html !== 'string') return false
  return /<img[^>]+(?:src|data-src)=['"](https?:\/\/[^'"]+)['"]/i.test(html)
}

export function replaceDataSrcWithSrc(html: string): string {
  if (!html || typeof html !== 'string') return ''
  return html.replace(
    /<img([^>]*?)data-src=['"]([^'"]+)['"]/gi,
    '<img$1src="$2"'
  )
}

export function blockExternalImages(html: string): string {
  if (!html || typeof html !== 'string') return ''
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

/**
 * Sanitize HTML pour supprimer les vecteurs XSS courants
 * Protection contre : <script>, event handlers, javascript:, iframes, etc.
 *
 * @param html - HTML brut du mail
 * @returns HTML nettoyé et sécurisé
 */
export function sanitizeEmailHtml(html: string): string {
  if (!html || typeof html !== 'string') return ''

  try {
    return (
      html
        // 1. Supprimer <script> (avec contenu)
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

        // 2. Supprimer tous les event handlers (onclick, onerror, onload, etc.)
        .replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '')
        .replace(/\s+on\w+\s*=\s*[^\s>]*/gi, '')

        // 3. Bloquer javascript: dans les attributs href
        .replace(/(href\s*=\s*["'])javascript:/gi, '$1about:blank#blocked-')

        // 4. Bloquer data: URI (sauf images)
        .replace(/(src\s*=\s*["'])data:(?!image)/gi, '$1about:blank#blocked-')

        // 5. Neutraliser <iframe>, <object>, <embed>
        .replace(
          /<(iframe|object|embed)(\s[^>]*)?>/gi,
          '<div data-blocked="$1"$2>'
        )
        .replace(/<\/(iframe|object|embed)>/gi, '</div>')

        // 6. Supprimer <base> (peut rediriger tous les liens relatifs)
        .replace(/<base\b[^>]*>/gi, '')

        // 7. Neutralize <form> (no unauthorized submit)
        .replace(/<form(\s[^>]*)?>/gi, '<div data-blocked="form"$1>')
        .replace(/<\/form>/gi, '</div>')

        // 8. Supprimer <meta> refresh (redirection auto)
        .replace(/<meta\b[^>]*http-equiv\s*=\s*["']?refresh[^>]*>/gi, '')
    )
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ [sanitizeEmailHtml] Error:', error)
    }
    return '' // In case of error, return empty for security
  }
}

/**
 * Displays the HTML content of an email in an isolated Shadow DOM
 *
 * Security architecture in 3 layers:
 * 1. Shadow DOM : CSS isolation (mail styles don't affect the UI)
 * 2. Sanitization : Removal of XSS vectors (scripts, event handlers)
 * 3. Content Security : No execution of inline JavaScript
 *
 * Features :
 * - Performance optimized (style created once)
 * - Responsive design
 * - Neutral styles (light mode only)
 *
 * @param html - HTML content of the mail (will be automatically sanitized)
 */
export const ShadowEmailContent = ({ html }: { html: string }) => {
  const hostRef = useRef<HTMLDivElement>(null)
  const shadowRootRef = useRef<ShadowRoot | null>(null)

  // Create Shadow DOM and styles ONLY ONCE
  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    // If already created, skip
    if (shadowRootRef.current) return

    // Create Shadow DOM
    const shadowRoot = host.attachShadow({ mode: 'open' })
    shadowRootRef.current = shadowRoot

    // Add base styles
    const style = document.createElement('style')
    style.textContent = `
      :host {
        display: block;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        line-height: 1.6;
        color: hsl(var(--foreground));
        background: hsl(var(--background));
      }
      
      /* Reset de base */
      * {
        max-width: 100%;
        box-sizing: border-box;
      }
      
      /* Images responsive */
      img {
        max-width: 100%;
        height: auto;
        display: inline-block;
      }
      
      /* Liens */
      a {
        color: hsl(var(--primary));
        text-decoration: underline;
      }
      
      a:hover {
        color: hsl(var(--primary));
      }
      
      /* Listes */
      ul, ol {
        padding-left: 2em;
        margin: 0.5em 0;
      }
      
      li {
        margin: 0.25em 0;
      }
      
      /* Tableaux */
      table {
        border-collapse: collapse;
        width: 100%;
        margin: 1em 0;
      }
      
      td, th {
        padding: 0.5em;
        border: 1px solid hsl(var(--border));
        text-align: left;
      }
      
      th {
        font-weight: 600;
        background: hsl(var(--muted));
      }
      
      /* Typographie */
      p {
        margin: 0.75em 0;
      }
      
      h1, h2, h3, h4, h5, h6 {
        margin: 1.25em 0 0.5em;
        line-height: 1.3;
      }
      
      h1 { font-size: 1.875em; }
      h2 { font-size: 1.5em; }
      h3 { font-size: 1.25em; }
      h4 { font-size: 1.125em; }
      
      /* Code */
      code {
        background: hsl(var(--muted));
        padding: 0.125em 0.25em;
        border-radius: 0.25em;
        font-family: ui-monospace, monospace;
        font-size: 0.875em;
      }
      
      pre {
        background: hsl(var(--muted));
        padding: 1em;
        border-radius: 0.5em;
        overflow-x: auto;
        white-space: pre-wrap;
        word-wrap: break-word;
      }
      
      pre code {
        background: transparent;
        padding: 0;
      }
      
      /* Blockquote */
      blockquote {
        margin: 1em 0;
        padding-left: 1em;
        border-left: 3px solid hsl(var(--border));
        color: hsl(var(--muted-foreground));
      }
      
      /* Horizontal rule */
      hr {
        border: none;
        border-top: 1px solid hsl(var(--border));
        margin: 1.5em 0;
      }
    `
    shadowRoot.appendChild(style)

    // Create content container
    const contentContainer = document.createElement('div')
    contentContainer.className = 'mail-content-wrapper'
    shadowRoot.appendChild(contentContainer)
  }, []) // Executed ONLY ONCE at mount

  // Update content when HTML changes
  useEffect(() => {
    const shadowRoot = shadowRootRef.current
    if (!shadowRoot) return

    const contentContainer = shadowRoot.querySelector('.mail-content-wrapper')
    if (!contentContainer) return

    // Sanitize puis injecter
    const cleanHtml = sanitizeEmailHtml(html || '')
    contentContainer.innerHTML = cleanHtml

    if (process.env.NODE_ENV === 'development' && html && !cleanHtml) {
      console.warn('⚠️ [ShadowEmailContent] HTML was sanitized to empty string')
    }
  }, [html])

  // Disable false positive: ref is only accessed in useEffect, not during render
  // eslint-disable-next-line
  return React.createElement('div', {
    ref: hostRef,
    className: 'mail-shadow-root',
    style: { minHeight: '100px' },
  })
}
