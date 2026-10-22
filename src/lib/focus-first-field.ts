const FIELD_SELECTOR = [
  'input:not([type="hidden"]):not([disabled]):not([readonly])',
  'textarea:not([disabled]):not([readonly])',
  'select:not([disabled])',
].join(',')

/**
 * True when the field can receive focus: not hidden by an attribute or by
 * CSS (display: none on it or an ancestor, visibility: hidden) and not
 * removed from the tab order.
 */
function isFocusable(el: HTMLElement, container: HTMLElement) {
  if (el.closest('[hidden], [aria-hidden="true"]')) return false
  if (el.getAttribute('tabindex') === '-1') return false
  if (getComputedStyle(el).visibility === 'hidden') return false

  for (
    let node: HTMLElement | null = el;
    node && node !== container.parentElement;
    node = node.parentElement
  ) {
    if (getComputedStyle(node).display === 'none') return false
  }
  return true
}

/**
 * Radix `onOpenAutoFocus` handler: focuses the first form field of the
 * modal content instead of the default target (first button / cancel).
 * Leaves the default behavior untouched when the content has no field.
 */
export function focusFirstField(event: Event) {
  const container = event.currentTarget
  if (!(container instanceof HTMLElement)) return

  const field = Array.from(
    container.querySelectorAll<HTMLElement>(FIELD_SELECTOR)
  ).find((el) => isFocusable(el, container))
  if (!field) return

  event.preventDefault()
  field.focus({ preventScroll: true })
}
