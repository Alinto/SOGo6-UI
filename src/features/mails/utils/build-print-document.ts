import { escapeHtml } from '@/features/mails/utils/escape-html'

export type PrintDocumentLabels = {
  from: string
  to: string
  cc: string
  date: string
  attachments: string
}

export type BuildPrintDocumentInput = {
  subject: string
  from: string
  to: string[]
  cc?: string[]
  date: string
  body: string
  attachmentNames?: string[]
  labels: PrintDocumentLabels
}

export function buildPrintDocument(input: BuildPrintDocumentInput): string {
  const {
    subject,
    from,
    to,
    cc,
    date,
    body,
    attachmentNames = [],
    labels,
  } = input

  const ccRow =
    cc && cc.length > 0
      ? `<div class="header-row"><span class="label">${escapeHtml(labels.cc)}:</span> ${escapeHtml(cc.join(', '))}</div>`
      : ''

  const attachmentsBlock =
    attachmentNames.length > 0
      ? `<div class="attachments"><span class="label">${escapeHtml(labels.attachments)}:</span> ${escapeHtml(attachmentNames.join(', '))}</div>`
      : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(subject)}</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #000; margin: 2cm; line-height: 1.5; }
    .header { border-bottom: 1px solid #ccc; padding-bottom: 12px; margin-bottom: 16px; }
    .header h1 { font-size: 18px; margin: 0 0 12px; font-weight: 600; }
    .header-row { margin: 4px 0; word-break: break-word; }
    .label { font-weight: bold; min-width: 72px; display: inline-block; }
    .body { line-height: 1.6; }
    .body img { max-width: 100%; height: auto; }
    .attachments { margin-top: 16px; border-top: 1px solid #ccc; padding-top: 8px; color: #444; word-break: break-word; }
    @media print { body { margin: 1cm; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>${escapeHtml(subject)}</h1>
    <div class="header-row"><span class="label">${escapeHtml(labels.from)}:</span> ${escapeHtml(from)}</div>
    <div class="header-row"><span class="label">${escapeHtml(labels.to)}:</span> ${escapeHtml(to.join(', '))}</div>
    ${ccRow}
    <div class="header-row"><span class="label">${escapeHtml(labels.date)}:</span> ${escapeHtml(date)}</div>
  </div>
  <div class="body">${body}</div>
  ${attachmentsBlock}
</body>
</html>`
}
