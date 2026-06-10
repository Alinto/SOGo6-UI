const PRINT_IFRAME_CLEANUP_MS = 60_000

/**
 * Renders mail HTML in a hidden iframe and triggers the browser print dialog.
 * Avoids popup blockers and noopener issues with window.open().
 */
export function openPrintWindow(html: string): boolean {
  try {
    const iframe = document.createElement('iframe')
    iframe.setAttribute('title', 'mail-print')
    iframe.style.cssText =
      'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;'

    document.body.appendChild(iframe)

    const doc = iframe.contentDocument ?? iframe.contentWindow?.document
    if (!doc) {
      iframe.remove()
      return false
    }

    doc.open()
    doc.write(html)
    doc.close()

    const win = iframe.contentWindow
    if (!win) {
      iframe.remove()
      return false
    }

    const cleanup = () => {
      iframe.remove()
    }

    win.addEventListener('afterprint', cleanup, { once: true })
    window.setTimeout(cleanup, PRINT_IFRAME_CLEANUP_MS)

    win.focus()
    win.print()
    return true
  } catch {
    return false
  }
}
