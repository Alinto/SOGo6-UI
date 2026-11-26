import { escapeHtml } from '@/features/mails/utils/escape-html'

/**
 * Shared / mailto text is plain text but the compose body is editor HTML:
 * escape it, blank lines become paragraphs and line breaks `<br>`.
 */
export function plainTextToHtml(text: string): string {
  const normalized = text.replace(/\r\n?/g, '\n')
  if (!normalized.trim()) return ''
  return normalized
    .split(/\n{2,}/)
    .map(
      (paragraph) =>
        `<p>${paragraph.split('\n').map(escapeHtml).join('<br>')}</p>`
    )
    .join('')
}
