import { getCachedEnvVars } from '@/lib/env-service'
import DOMPurify from 'dompurify'
import { useTranslations } from 'next-intl'
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

/**
 * The file extension, without the dot. Only a short suffix with at least one
 * letter counts: "Facture 12.2024" or "rapport v2.1" have no extension.
 */
export function getFileExtension(filename: string) {
  const match = filename.match(/\.([a-zA-Z0-9]{1,10})$/)
  return match && /[a-zA-Z]/.test(match[1]) ? match[1] : ''
}

/**
 * Short file type label shown on an attachment (e.g. "PDF", "TXT").
 * Uses the file extension, then the MIME subtype when it is short enough.
 */
export function getAttachmentType(name: string, contentType?: string) {
  const ext = getFileExtension(name)
  if (ext) return ext.toUpperCase()

  const subtype = contentType?.split(';')[0].split('/')[1]?.trim() ?? ''
  return /^[a-zA-Z0-9]{1,5}$/.test(subtype) ? subtype.toUpperCase() : ''
}

/**
 * Shortens a file name by cutting its middle ("rapport-fin…ctions.pdf"),
 * so the beginning and the extension stay visible.
 */
export function truncateFileNameMiddle(name: string, maxLength = 60) {
  if (name.length <= maxLength) return name

  const ext = getFileExtension(name)
  const minTail = ext ? ext.length + 1 : 0
  const tailLength = Math.max(minTail, Math.floor((maxLength - 1) / 3))
  const headLength = Math.max(1, maxLength - 1 - tailLength)

  return `${name.slice(0, headLength)}…${name.slice(-tailLength)}`
}

/**
 * Splits a file name so the extension and the character before it can be
 * kept together on one line ("report.pdf" → "repor" + "t.pdf").
 */
export function splitFileNameTail(name: string) {
  const ext = getFileExtension(name)
  if (!ext) return { head: name, tail: '' }

  const tailStart = Math.max(0, name.length - ext.length - 2)
  return { head: name.slice(0, tailStart), tail: name.slice(tailStart) }
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

/** Resource URLs that never leave the browser: inline parts already fetched. */
const LOCAL_RESOURCE_URL = /^\s*(?:data:image\/|cid:|blob:)/i

/** DOMPurify's default URI allowlist, plus blob: for fetched inline images. */
const ALLOWED_URI_REGEXP =
  /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix|blob):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i

/** Attributes that make the browser fetch a resource as soon as the node exists. */
const RESOURCE_ATTRIBUTES = new Set(['src', 'background', 'poster'])

const FORBIDDEN_TAGS = [
  'form',
  'input',
  'button',
  'select',
  'option',
  'textarea',
  'base',
  'link',
  'meta',
]

export type SanitizeEmailHtmlOptions = {
  /** Load remote images, backgrounds and fonts. False keeps every request local. */
  allowRemoteContent?: boolean
}

let allowRemoteContentForCurrentRun = false
let hooksInstalled = false

/** Decode CSS escapes so `u\72l(` cannot hide a url() from the filter. */
function decodeCssEscapes(css: string): string {
  return css
    .replace(/\\([0-9a-f]{1,6})\s?/gi, (_match, hex: string) => {
      const codePoint = Number.parseInt(hex, 16)
      return codePoint > 0 && codePoint <= 0x10ffff
        ? String.fromCodePoint(codePoint)
        : ''
    })
    .replace(/\\(.)/g, '$1')
}

/** Remove every remote fetch from CSS: url(), image-set() and @import. */
function stripRemoteCss(css: string): string {
  return (
    decodeCssEscapes(css)
      .replace(/@import[^;]*;?/gi, '')
      .replace(
        /url\s*\(\s*(?:"([^"]*)"?|'([^']*)'?|([^)]*?))\s*(?:\)|$)/gi,
        (match, double?: string, single?: string, bare?: string) =>
          LOCAL_RESOURCE_URL.test(double ?? single ?? bare ?? '')
            ? match
            : 'none'
      )
      // image-set() also accepts plain strings as image URLs.
      .replace(/(?:-webkit-)?image-set\s*\([^)]*(?:\)|$)/gi, 'none')
  )
}

function isLocalSrcset(value: string): boolean {
  return value
    .split(',')
    .map((candidate) => candidate.trim())
    .filter(Boolean)
    .every((candidate) => LOCAL_RESOURCE_URL.test(candidate))
}

function installSanitizerHooks(): void {
  if (hooksInstalled) return
  hooksInstalled = true

  DOMPurify.addHook('uponSanitizeAttribute', (node, data) => {
    if (allowRemoteContentForCurrentRun) return
    const name = data.attrName
    const value = data.attrValue ?? ''
    if (RESOURCE_ATTRIBUTES.has(name)) {
      if (!LOCAL_RESOURCE_URL.test(value)) data.keepAttr = false
      return
    }
    if (name === 'srcset') {
      if (!isLocalSrcset(value)) data.keepAttr = false
      return
    }
    if (name === 'style') {
      data.attrValue = stripRemoteCss(value)
      return
    }
    // SVG <image>/<use>/<feImage> fetch their href; links do not.
    if (
      (name === 'href' || name === 'xlink:href') &&
      node.nodeName.toLowerCase() !== 'a' &&
      !LOCAL_RESOURCE_URL.test(value)
    ) {
      data.keepAttr = false
    }
  })

  DOMPurify.addHook('afterSanitizeElements', (node) => {
    if (allowRemoteContentForCurrentRun) return
    if (node.nodeName === 'STYLE' && node.textContent) {
      node.textContent = stripRemoteCss(node.textContent)
    }
  })

  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.nodeName === 'A' && node.hasAttribute('target')) {
      node.setAttribute('rel', 'noopener noreferrer')
    }
  })
}

/** Keep <style> blocks of a full HTML document: they live in <head>, which is dropped. */
function hoistHeadStyles(html: string): string {
  if (!/<head[\s>]/i.test(html) || typeof DOMParser === 'undefined') {
    return html
  }
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const styles = Array.from(doc.head.querySelectorAll('style'))
    .map((style) => style.outerHTML)
    .join('')
  return styles + doc.body.innerHTML
}

/** Give screen readers a name for icon links and flag layout tables. */
function nameEmailContent(root: ParentNode): void {
  root.querySelectorAll('a').forEach((anchor) => {
    const text = (anchor.textContent ?? '').replace(/\s+/g, '').trim()
    if (text) return
    const alt = anchor.querySelector('img')?.getAttribute('alt')?.trim()
    if (alt) return
    const href = anchor.getAttribute('href')?.trim()
    if (!href || anchor.hasAttribute('aria-label')) return
    anchor.setAttribute('aria-label', href)
  })

  root.querySelectorAll('table').forEach((table) => {
    if (table.querySelector('th, caption') || table.hasAttribute('role')) return
    table.setAttribute('role', 'presentation')
  })
}

/**
 * Sanitize mail HTML with DOMPurify (allowlist of tags, attributes and URL schemes).
 * Unless `allowRemoteContent` is set, every remote resource is removed: image and
 * media sources, srcset, background attributes, CSS url()/image-set()/@import and
 * SVG hrefs. Only data:image, cid: and blob: sources are kept.
 */
export function sanitizeEmailHtml(
  html: string,
  options: SanitizeEmailHtmlOptions = {}
): string {
  if (!html || typeof html !== 'string') return ''
  if (typeof window === 'undefined' || !DOMPurify.isSupported) return ''

  try {
    installSanitizerHooks()
    allowRemoteContentForCurrentRun = options.allowRemoteContent === true
    const fragment = DOMPurify.sanitize(hoistHeadStyles(html), {
      FORCE_BODY: true,
      RETURN_DOM_FRAGMENT: true,
      ADD_ATTR: ['target'],
      FORBID_TAGS: FORBIDDEN_TAGS,
      ALLOWED_URI_REGEXP,
    })
    nameEmailContent(fragment)
    const container = document.createElement('div')
    container.appendChild(fragment)
    return container.innerHTML
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ [sanitizeEmailHtml] Error:', error)
    }
    return '' // In case of error, return empty for security
  } finally {
    allowRemoteContentForCurrentRun = false
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
 * @param allowRemoteContent - Load remote images (the user clicked "show images")
 */
export const ShadowEmailContent = ({
  html,
  allowRemoteContent = false,
}: {
  html: string
  allowRemoteContent?: boolean
}) => {
  const t = useTranslations('MAILS_COMMONS.mail_display')
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
    const cleanHtml = sanitizeEmailHtml(html || '', { allowRemoteContent })
    contentContainer.innerHTML = cleanHtml

    if (process.env.NODE_ENV === 'development' && html && !cleanHtml) {
      console.warn('⚠️ [ShadowEmailContent] HTML was sanitized to empty string')
    }
  }, [html, allowRemoteContent])

  // Disable false positive: ref is only accessed in useEffect, not during render
  // eslint-disable-next-line
  return React.createElement('div', {
    ref: hostRef,
    className: 'mail-shadow-root',
    'aria-label': t('message_body.string'),
    style: { minHeight: '100px' },
  })
}
